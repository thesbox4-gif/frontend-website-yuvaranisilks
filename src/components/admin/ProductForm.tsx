'use client'

import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { MultiImageUpload } from '@/components/admin/ImageUpload'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

const variantSchema = z.object({
  color: z.string().min(1, 'Required'),
  size: z.string().min(1, 'Required'),
  quantity: z.coerce.number().min(0).default(0),
  sku: z.string().min(1, 'Required'),
})

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['saree', 'jewellery']),
  category_id: z.string().optional(),
  base_price: z.coerce.number().min(1, 'Price must be greater than 0'),
  discount_pct: z.coerce.number().min(0).max(100).default(0),
  coupon_code: z.string().optional(),
  coupon_disc: z.coerce.number().min(0).max(100).optional(),
  published: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
  // Saree-specific
  fabric: z.string().optional(),
  color: z.string().optional(),
  occasion: z.string().optional(),
  blouse_included: z.boolean().optional(),
  // Jewellery-specific
  material: z.string().optional(),
  weight: z.string().optional(),
  jewellery_type: z.string().optional(),
})

export type ProductFormData = z.infer<typeof schema>

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>
  categories: Category[]
  onSubmit: (data: ProductFormData) => Promise<void>
  submitLabel?: string
}

const inputClass = (hasError?: boolean) =>
  cn(
    'w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-colors bg-white',
    hasError
      ? 'border-red-400 focus:ring-red-200'
      : 'border-neutral-200 focus:ring-brand/15 focus:border-brand'
  )

export function ProductForm({ defaultValues, categories, onSubmit, submitLabel = 'Save Product' }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'saree',
      discount_pct: 0,
      published: false,
      images: [],
      variants: [],
      ...defaultValues,
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  })

  const images = watch('images') ?? []
  const discountPct = watch('discount_pct') ?? 0
  const basePrice = watch('base_price') ?? 0
  const finalPrice = Math.round(basePrice * (1 - discountPct / 100))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* Basic info */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-ink border-b border-neutral-100 pb-2">Basic Information</h3>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Name *</label>
          <input {...register('title')} placeholder="e.g. Kanjivaram Pure Silk Saree" className={inputClass(!!errors.title)} />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
          <textarea {...register('description')} rows={4} placeholder="Detailed product description..." className={cn(inputClass(), 'resize-none')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Type *</label>
            <select {...register('type')} className={inputClass()}>
              <option value="saree">Saree</option>
              <option value="jewellery">Jewellery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
            <select {...register('category_id')} className={inputClass()}>
              <option value="">— Select Category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Saree-specific attributes */}
      {watch('type') === 'saree' && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-ink border-b border-neutral-100 pb-2">Saree Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Fabric</label>
              <input {...register('fabric')} placeholder="e.g. Pure Silk, Cotton, Georgette" className={inputClass()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Colour</label>
              <input {...register('color')} placeholder="e.g. Crimson Red, Royal Blue" className={inputClass()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Occasion</label>
              <input {...register('occasion')} placeholder="e.g. Wedding, Festival, Casual" className={inputClass()} />
            </div>
            <div className="flex items-center gap-3 self-end pb-2.5">
              <input {...register('blouse_included')} type="checkbox" id="blouse_included" className="h-4 w-4 rounded accent-brand" />
              <label htmlFor="blouse_included" className="text-sm text-neutral-700 select-none">
                Blouse Included
              </label>
            </div>
          </div>
        </section>
      )}

      {/* Jewellery-specific attributes */}
      {watch('type') === 'jewellery' && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-ink border-b border-neutral-100 pb-2">Jewellery Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Material</label>
              <input {...register('material')} placeholder="e.g. Gold, Silver, Antique Gold" className={inputClass()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Weight</label>
              <input {...register('weight')} placeholder="e.g. 12g, 45g" className={inputClass()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jewellery Type</label>
              <input {...register('jewellery_type')} placeholder="e.g. Necklace, Earrings, Bangles" className={inputClass()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Occasion</label>
              <input {...register('occasion')} placeholder="e.g. Wedding, Temple, Daily Wear" className={inputClass()} />
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-ink border-b border-neutral-100 pb-2">Pricing</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Original Price (₹) *</label>
            <input {...register('base_price')} type="number" min={0} className={inputClass(!!errors.base_price)} />
            {errors.base_price && <p className="text-xs text-red-500 mt-1">{errors.base_price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Discount (%)</label>
            <input {...register('discount_pct')} type="number" min={0} max={100} className={inputClass()} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Final Price</label>
            <div className="px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-ink">
              ₹{finalPrice > 0 ? finalPrice.toLocaleString('en-IN') : '—'}
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Coupon Code</label>
            <input {...register('coupon_code')} placeholder="e.g. SAVE10" className={inputClass()} />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Coupon Discount (%)</label>
            <input {...register('coupon_disc')} type="number" min={0} max={100} className={inputClass()} />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-ink border-b border-neutral-100 pb-2">Product Images</h3>
        <p className="text-xs text-neutral-500">First image will be the primary thumbnail. Drag to reorder.</p>
        <MultiImageUpload
          values={images}
          onChange={(urls) => setValue('images', urls)}
          maxFiles={8}
        />
      </section>

      {/* Variants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
          <h3 className="text-sm font-semibold text-ink">Variants (Colour × Size × Stock)</h3>
          <button
            type="button"
            onClick={() => appendVariant({ color: '', size: 'Free Size', quantity: 1, sku: '' })}
            className="flex items-center gap-1 text-xs text-brand font-semibold hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add Variant
          </button>
        </div>
        {variantFields.length === 0 && (
          <p className="text-xs text-neutral-400">No variants yet. Add at least one colour/size combination.</p>
        )}
        <div className="space-y-3">
          {variantFields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_80px_1fr_36px] gap-2 items-start">
              <div>
                <input
                  {...register(`variants.${idx}.color`)}
                  placeholder="Colour"
                  className={inputClass(!!errors.variants?.[idx]?.color)}
                />
              </div>
              <div>
                <input
                  {...register(`variants.${idx}.size`)}
                  placeholder="Size"
                  className={inputClass(!!errors.variants?.[idx]?.size)}
                />
              </div>
              <div>
                <input
                  {...register(`variants.${idx}.quantity`)}
                  type="number"
                  min={0}
                  placeholder="Qty"
                  className={inputClass()}
                />
              </div>
              <div>
                <input
                  {...register(`variants.${idx}.sku`)}
                  placeholder="SKU"
                  className={inputClass(!!errors.variants?.[idx]?.sku)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="p-2 text-neutral-400 hover:text-red-600 transition-colors mt-0.5"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Status */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-ink border-b border-neutral-100 pb-2">Visibility</h3>
        <div className="flex items-center gap-3">
          <input {...register('published')} type="checkbox" id="published" className="h-4 w-4 rounded accent-brand" />
          <label htmlFor="published" className="text-sm text-neutral-700 select-none">
            Published <span className="text-neutral-400">(visible in the storefront)</span>
          </label>
        </div>
      </section>

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
