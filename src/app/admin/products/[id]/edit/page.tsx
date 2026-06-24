'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm, type ProductFormData } from '@/components/admin/ProductForm'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toaster'
import type { Category, Product } from '@/types'

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { token } = useAuthStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productService.getById(params.id),
      categoryService.getAll(),
    ]).then(([p, cats]) => {
      setProduct(p)
      setCategories(cats)
    }).finally(() => setLoading(false))
  }, [params.id])

  async function handleSubmit(data: ProductFormData) {
    if (!token || !product) return
    const payload = {
      ...data,
      category_id: data.category_id || undefined,
      images: data.images.map((url, i) => ({
        url,
        is_primary: i === 0,
        display_order: i,
      })),
    }
    await productService.update(product.id, payload, token)
    toast({ title: 'Product updated!' })
    router.push('/admin/products')
  }

  if (loading) return <div className="flex justify-center py-20"><span className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" /></div>
  if (!product) return <div className="py-12 text-center text-neutral-500">Product not found.</div>

  const defaultValues: Partial<ProductFormData> = {
    title: product.title,
    description: product.description,
    type: product.type,
    category_id: product.category?.id,
    base_price: product.base_price,
    discount_pct: product.discount_pct,
    coupon_code: product.coupon_code,
    coupon_disc: product.coupon_disc,
    published: product.published,
    images: (product.images ?? []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map((img) => img.url),
    variants: (product.variants ?? []).map((v) => ({
      color: v.color,
      size: v.size,
      quantity: v.quantity,
      sku: v.sku,
    })),
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-neutral-400 hover:text-ink transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-base font-semibold text-ink">Edit: {product.title}</h2>
      </div>
      <div className="bg-white rounded-2xl border border-neutral-200/70 p-6">
        <ProductForm
          defaultValues={defaultValues}
          categories={categories}
          onSubmit={handleSubmit}
          submitLabel="Update Product"
        />
      </div>
    </div>
  )
}
