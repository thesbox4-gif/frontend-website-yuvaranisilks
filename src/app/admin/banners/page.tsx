'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical, X, Save, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { bannerService } from '@/services/bannerService'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { toast } from '@/components/ui/Toaster'
import type { Banner } from '@/types'
import { cn } from '@/lib/utils'

const emptyBanner = (): Omit<Banner, 'id'> => ({
  title: '',
  subtitle: '',
  description: '',
  cta_text: 'Shop Now',
  cta_href: '/products',
  image_url: '',
  display_order: 0,
  active: true,
})

interface BannerEditorProps {
  banner: Partial<Banner>
  onChange: (b: Partial<Banner>) => void
  onSave: () => Promise<void>
  onCancel: () => void
  saving: boolean
}

function BannerEditor({ banner, onChange, onSave, onCancel, saving }: BannerEditorProps) {
  const inputClass = 'w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand'
  return (
    <div className="bg-white rounded-2xl border border-brand/20 shadow-sm p-5 space-y-4 animate-fade-up">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Title *</label>
          <input value={banner.title ?? ''} onChange={(e) => onChange({ ...banner, title: e.target.value })} placeholder="The Kanjivaram Legacy" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Subtitle</label>
          <input value={banner.subtitle ?? ''} onChange={(e) => onChange({ ...banner, subtitle: e.target.value })} placeholder="Handcrafted Silk Sarees" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
        <textarea
          rows={2}
          value={banner.description ?? ''}
          onChange={(e) => onChange({ ...banner, description: e.target.value })}
          placeholder="Short description shown below the title..."
          className={cn(inputClass, 'resize-none')}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Button Text</label>
          <input value={banner.cta_text ?? ''} onChange={(e) => onChange({ ...banner, cta_text: e.target.value })} placeholder="Shop Now" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Button Link</label>
          <input value={banner.cta_href ?? ''} onChange={(e) => onChange({ ...banner, cta_href: e.target.value })} placeholder="/products?type=saree" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-2">Banner Image *</label>
        <ImageUpload
          value={banner.image_url}
          onChange={(url) => onChange({ ...banner, image_url: url })}
          label="Upload banner image"
          hint="Recommended: 1920×800 px landscape. JPG/WEBP."
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={saving || !banner.title || !banner.image_url}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Banner
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function BannersPage() {
  const { token } = useAuthStore()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Partial<Banner>>({})
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!token) return
    try {
      const data = await bannerService.getAll(token)
      setBanners(Array.isArray(data) ? data : [])
    } catch {
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  function startNew() {
    setDraft(emptyBanner())
    setEditingId('new')
  }

  function startEdit(b: Banner) {
    setDraft({ ...b })
    setEditingId(b.id)
  }

  async function handleSave() {
    if (!token || !draft.title || !draft.image_url) return
    setSaving(true)
    try {
      if (editingId === 'new') {
        const created = await bannerService.create(draft as Omit<Banner, 'id'>, token)
        setBanners((prev) => [...prev, created])
        toast({ title: 'Banner added!' })
      } else if (editingId) {
        const updated = await bannerService.update(editingId, draft, token)
        setBanners((prev) => prev.map((b) => (b.id === editingId ? updated : b)))
        toast({ title: 'Banner updated!' })
      }
      setEditingId(null)
      setDraft({})
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm('Delete this banner?')) return
    try {
      await bannerService.remove(id, token)
      setBanners((prev) => prev.filter((b) => b.id !== id))
      toast({ title: 'Banner deleted' })
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' })
    }
  }

  async function handleToggle(id: string, active: boolean) {
    if (!token) return
    try {
      const updated = await bannerService.update(id, { active }, token)
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: updated.active } : b)))
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">These images appear in the homepage hero slider.</p>
        <button
          onClick={startNew}
          disabled={editingId === 'new'}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark disabled:opacity-50 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      {editingId === 'new' && (
        <BannerEditor banner={draft} onChange={setDraft} onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving} />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : banners.length === 0 && editingId !== 'new' ? (
        <div className="text-center py-12 text-neutral-500 text-sm bg-white rounded-2xl border border-neutral-200">
          No banners yet. Add your first hero banner.
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner.id}>
              {editingId === banner.id ? (
                <BannerEditor banner={draft} onChange={setDraft} onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving} />
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-200/70 overflow-hidden flex gap-0 group">
                  <div className="relative w-40 sm:w-52 shrink-0 aspect-video">
                    {banner.image_url ? (
                      <Image src={banner.image_url} alt={banner.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink line-clamp-1">{banner.title}</p>
                      {banner.subtitle && <p className="text-xs text-neutral-500 mt-0.5">{banner.subtitle}</p>}
                      {banner.description && <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{banner.description}</p>}
                      <p className="text-[11px] text-brand font-mono mt-1.5">{banner.cta_href}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full', banner.active ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400')}>
                        {banner.active ? 'Active' : 'Hidden'}
                      </span>
                      <button onClick={() => handleToggle(banner.id, !banner.active)} className="p-1 text-neutral-400 hover:text-brand transition-colors">
                        {banner.active ? <ToggleRight className="h-4 w-4 text-brand" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button onClick={() => startEdit(banner)} className="p-1 text-neutral-400 hover:text-brand transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="p-1 text-neutral-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
