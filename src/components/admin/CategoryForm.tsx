'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, hyphens'),
  description: z.string().optional(),
  image_url: z.string().optional(),
  parent_id: z.string().optional(),
  display_order: z.coerce.number().min(0).default(0),
  active: z.boolean().default(true),
})

export type CategoryFormData = z.infer<typeof schema>

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormData>
  parentOptions: Category[]
  onSubmit: (data: CategoryFormData) => Promise<void>
  submitLabel?: string
}

const inputClass = (hasError?: boolean) =>
  cn(
    'w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-colors bg-white',
    hasError
      ? 'border-red-400 focus:ring-red-200'
      : 'border-neutral-200 focus:ring-brand/15 focus:border-brand'
  )

export function CategoryForm({ defaultValues, parentOptions, onSubmit, submitLabel = 'Save Category' }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: { active: true, display_order: 0, ...defaultValues },
  })

  const imageUrl = watch('image_url')

  // Auto-generate slug from name if slug is empty
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    const currentSlug = watch('slug')
    if (!currentSlug || currentSlug === slugify(watch('name') ?? '')) {
      setValue('slug', slugify(val))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category Name *</label>
          <input
            {...register('name')}
            placeholder="e.g. Silk Sarees"
            className={inputClass(!!errors.name)}
            onChange={(e) => { register('name').onChange(e); handleNameChange(e) }}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Slug *</label>
          <input {...register('slug')} placeholder="e.g. silk-sarees" className={inputClass(!!errors.slug)} />
          {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
          <p className="text-[11px] text-neutral-400 mt-1">URL-safe identifier. Auto-generated from name.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Brief description shown on the category page..."
          className={cn(inputClass(!!errors.description), 'resize-none')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Parent Category</label>
          <select {...register('parent_id')} className={inputClass()}>
            <option value="">— None (Root Category) —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="text-[11px] text-neutral-400 mt-1">Leave blank to make a top-level category.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Display Order</label>
          <input {...register('display_order')} type="number" min={0} className={inputClass()} />
          <p className="text-[11px] text-neutral-400 mt-1">Lower number = displayed first.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Cover Image</label>
        <ImageUpload
          value={imageUrl}
          onChange={(url) => setValue('image_url', url)}
          label="Upload cover image"
          hint="Recommended: 600×800 px, JPG/PNG/WEBP"
        />
      </div>

      <div className="flex items-center gap-3">
        <input {...register('active')} type="checkbox" id="active" className="h-4 w-4 rounded accent-brand" />
        <label htmlFor="active" className="text-sm text-neutral-700 select-none">Active (visible on website)</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')
}
