'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CategoryForm, type CategoryFormData } from '@/components/admin/CategoryForm'
import { categoryService } from '@/services/categoryService'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toaster'
import type { Category } from '@/types'

export default function NewCategoryPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [allCategories, setAllCategories] = useState<Category[]>([])

  useEffect(() => {
    categoryService.getAll().then(setAllCategories).catch(() => {})
  }, [])

  async function handleSubmit(data: CategoryFormData) {
    if (!token) return
    await categoryService.create(data, token)
    toast({ title: 'Category created!' })
    router.push('/admin/categories')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/categories" className="text-neutral-400 hover:text-ink transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-base font-semibold text-ink">New Category</h2>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/70 p-6">
        <CategoryForm
          parentOptions={allCategories}
          onSubmit={handleSubmit}
          submitLabel="Create Category"
        />
      </div>
    </div>
  )
}
