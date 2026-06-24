'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadService } from '@/services/uploadService'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onClear?: () => void
  label?: string
  hint?: string
  accept?: string
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onClear,
  label = 'Upload Image',
  hint = 'PNG, JPG, WEBP up to 5 MB',
  accept = 'image/*',
  className,
}: ImageUploadProps) {
  const { token } = useAuthStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!token) { setError('Not authenticated'); return }
    setUploading(true)
    setError(null)
    try {
      const res = await uploadService.uploadImage(file, token)
      onChange(res.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
          <Image src={value} alt="Uploaded" fill className="object-contain" />
          <button
            type="button"
            onClick={() => { onClear?.(); onChange('') }}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="relative w-full aspect-video rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-brand hover:bg-brand-soft/30 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 text-center p-4"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-brand animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-600">{label}</p>
              <p className="text-xs text-neutral-400">{hint}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Multi-image uploader ─────────────────────────────────────────────────────

interface MultiImageUploadProps {
  values: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
}

export function MultiImageUpload({ values, onChange, maxFiles = 8 }: MultiImageUploadProps) {
  const { token } = useAuthStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList) {
    if (!token) { setError('Not authenticated'); return }
    const remaining = maxFiles - values.length
    if (remaining <= 0) return
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    setError(null)
    try {
      const results = await uploadService.uploadMultiple(toUpload, token)
      onChange([...values, ...results.map((r) => r.url)])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function removeAt(idx: number) {
    onChange(values.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {values.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
            <Image src={url} alt={`Image ${idx + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {values.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 hover:border-brand hover:bg-brand-soft/20 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 text-brand animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-neutral-400" />
                <span className="text-[10px] text-neutral-400">Add</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
