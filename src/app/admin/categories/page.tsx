'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { categoryService } from '@/services/categoryService'
import { toast } from '@/components/ui/Toaster'
import type { Category } from '@/types'
import { cn } from '@/lib/utils'

function CategoryRow({ cat, children, onDelete, onToggle }: {
  cat: Category
  children?: React.ReactNode
  onDelete: (id: string) => void
  onToggle: (id: string, active: boolean) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-neutral-50 rounded-xl group">
        <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
          {cat.image_url ? (
            <Image src={cat.image_url} alt={cat.name} width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">No img</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{cat.name}</p>
          <p className="text-xs text-neutral-400 font-mono">/{cat.slug}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(cat.id, !cat.active)}
            title={cat.active ? 'Deactivate' : 'Activate'}
            className="p-1.5 text-neutral-400 hover:text-brand transition-colors"
          >
            {cat.active ? <ToggleRight className="h-4 w-4 text-brand" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <Link href={`/admin/categories/${cat.id}/edit`} className="p-1.5 text-neutral-400 hover:text-brand transition-colors">
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(cat.id)}
            className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0', cat.active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400')}>
          {cat.active !== false ? 'Active' : 'Hidden'}
        </span>
      </div>
      {children && <div className="pl-10 border-l border-neutral-200 ml-9">{children}</div>}
    </div>
  )
}

export default function CategoriesPage() {
  const { token } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch {
      toast({ title: 'Failed to load categories', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!token || !confirm('Delete this category? This cannot be undone.')) return
    try {
      await categoryService.remove(id, token)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast({ title: 'Category deleted' })
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' })
    }
  }

  async function handleToggle(id: string, active: boolean) {
    if (!token) return
    try {
      const updated = await categoryService.update(id, { active }, token)
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active: updated.active } : c)))
      toast({ title: active ? 'Category activated' : 'Category hidden' })
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' })
    }
  }

  const roots = categories.filter((c) => !c.parent_id).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{categories.length} categories total</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/70 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <span className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin inline-block" />
          </div>
        ) : roots.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-neutral-500 text-sm">No categories yet.</p>
            <Link href="/admin/categories/new" className="mt-3 inline-flex items-center gap-1.5 text-brand text-sm font-semibold hover:underline">
              <Plus className="h-4 w-4" /> Create your first category
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 p-2">
            {roots.map((root) => {
              const subs = categories.filter((c) => c.parent_id === root.id)
              return (
                <CategoryRow key={root.id} cat={root} onDelete={handleDelete} onToggle={handleToggle}>
                  {subs.map((sub) => (
                    <CategoryRow key={sub.id} cat={sub} onDelete={handleDelete} onToggle={handleToggle} />
                  ))}
                </CategoryRow>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
