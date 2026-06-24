'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CategoryForm, type CategoryFormData } from '@/components/admin/CategoryForm'
import { categoryService } from '@/services/categoryService'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toaster'
import type { Category } from '@/types'

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { token } = useAuthStore()
  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
    ]).then(([all]) => {
      setAllCategories(all)
      const found = all.find((c) => c.id === params.id) ?? null
      setCategory(found)
    }).finally(() => setLoading(false))
  }, [params.id])

  async function handleSubmit(data: CategoryFormData) {
    if (!token) return
    await categoryService.update(params.id, data, token)
    toast({ title: 'Category updated!' })
    router.push('/admin/categories')
  }

  if (loading) return <div className="flex justify-center py-20"><span className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" /></div>
  if (!category) return <div className="text-neutral-500 py-12 text-center">Category not found.</div>

  // Exclude self from parent options
  const parentOptions = allCategories.filter((c) => c.id !== params.id)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/categories" className="text-neutral-400 hover:text-ink transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-base font-semibold text-ink">Edit: {category.name}</h2>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/70 p-6">
        <CategoryForm
          defaultValues={{
            name: category.name,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            parent_id: category.parent_id ?? undefined,
            display_order: category.display_order ?? 0,
            active: category.active !== false,
          }}
          parentOptions={parentOptions}
          onSubmit={handleSubmit}
          submitLabel="Update Category"
        />
      </div>
    </div>
  )
}
