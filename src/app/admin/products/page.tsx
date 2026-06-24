'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { productService } from '@/services/productService'
import { toast } from '@/components/ui/Toaster'
import { formatPrice, discountedPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
]

export default function ProductsAdminPage() {
  const { token } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('')
  const [page, setPage] = useState(1)
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const filters: Parameters<typeof productService.getMany>[0] = {
        search: search || undefined,
        page,
        limit: LIMIT,
      }
      if (statusTab === 'published') filters.published = true
      if (statusTab === 'draft') filters.published = false
      const res = await productService.getMany(filters)
      setProducts(res.data)
      setTotal(res.total)
    } catch {
      toast({ title: 'Failed to load products', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [search, statusTab, page])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!token || !confirm('Delete this product? This cannot be undone.')) return
    try {
      await productService.remove(id, token)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setTotal((t) => t - 1)
      toast({ title: 'Product deleted' })
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' })
    }
  }

  async function handleTogglePublish(id: string, published: boolean) {
    if (!token) return
    try {
      await productService.publish(id, published, token)
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, published } : p)))
      toast({ title: published ? 'Product published' : 'Product unpublished' })
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' })
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand w-64"
          />
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatusTab(t.value); setPage(1) }}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
              statusTab === t.value ? 'bg-white text-ink shadow-sm' : 'text-neutral-500 hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-neutral-400">{total} products</div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/70 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin inline-block" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-sm">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left text-xs text-neutral-500 border-b border-neutral-100">
                  <th className="py-3 px-4 font-medium w-12" />
                  <th className="py-3 px-4 font-medium">Product</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Stock</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => {
                  const primary = p.images?.find((i) => i.is_primary) ?? p.images?.[0]
                  const totalQty = (p.variants ?? []).reduce((s, v) => s + v.quantity, 0)
                  const finalPrice = discountedPrice(p.base_price, p.discount_pct)
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                          {primary ? (
                            <Image src={primary.url} alt={p.title} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-[10px]">No img</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-ink line-clamp-1">{p.title}</p>
                        <p className="text-[11px] text-neutral-400 capitalize">{p.type}</p>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{p.category?.name ?? '—'}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-ink">{formatPrice(finalPrice)}</p>
                        {p.discount_pct > 0 && (
                          <p className="text-[11px] text-neutral-400 line-through">{formatPrice(p.base_price)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('text-xs font-semibold', totalQty > 0 ? 'text-emerald-600' : 'text-red-500')}>
                          {totalQty > 0 ? `${totalQty} units` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full', p.published ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400')}>
                          {p.published ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTogglePublish(p.id, !p.published)}
                            title={p.published ? 'Unpublish' : 'Publish'}
                            className="p-1.5 text-neutral-400 hover:text-brand transition-colors"
                          >
                            {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 text-neutral-400 hover:text-brand transition-colors">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 disabled:opacity-40">Prev</button>
          <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
