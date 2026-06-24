'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm, type ProductFormData } from '@/components/admin/ProductForm'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toaster'
import type { Category } from '@/types'

export default function NewProductPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {})
  }, [])

  async function handleSubmit(data: ProductFormData) {
    if (!token) return
    const payload = {
      ...data,
      category_id: data.category_id || undefined,
      images: data.images.map((url, i) => ({
        url,
        is_primary: i === 0,
        display_order: i,
      })),
    }
    await productService.create(payload, token)
    toast({ title: 'Product created!' })
    router.push('/admin/products')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-neutral-400 hover:text-ink transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-base font-semibold text-ink">New Product</h2>
      </div>
      <div className="bg-white rounded-2xl border border-neutral-200/70 p-6">
        <ProductForm categories={categories} onSubmit={handleSubmit} submitLabel="Create Product" />
      </div>
    </div>
  )
}
