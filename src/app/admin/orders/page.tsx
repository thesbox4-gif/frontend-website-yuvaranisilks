'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/services/homepageService'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'placed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-sky-50 text-sky-700',
  shipped: 'bg-violet-50 text-violet-700',
  delivered: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
  refunded: 'bg-orange-50 text-orange-600',
}

interface OrdersData {
  data: Order[]
  total: number
}

export default function AdminOrdersPage() {
  const { token } = useAuthStore()
  const [ordersData, setOrdersData] = useState<OrdersData>({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [statusTab, setStatusTab] = useState('')
  const [page, setPage] = useState(1)
  const LIMIT = 25

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await adminService.getOrdersAdmin(token, {
        status: statusTab || undefined,
        page,
        limit: LIMIT,
      }) as OrdersData
      setOrdersData(res)
    } catch {
      setOrdersData({ data: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }, [token, statusTab, page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(ordersData.total / LIMIT)

  return (
    <div className="space-y-5">
      {/* Status tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatusTab(t.value); setPage(1) }}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap',
              statusTab === t.value ? 'bg-white text-ink shadow-sm' : 'text-neutral-500 hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-neutral-400">{ordersData.total} orders</div>

      <div className="bg-white rounded-2xl border border-neutral-200/70 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin inline-block" />
          </div>
        ) : ordersData.data.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-sm">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left text-xs text-neutral-500 border-b border-neutral-100">
                  <th className="py-3 px-4 font-medium">Order ID</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Items</th>
                  <th className="py-3 px-4 font-medium">Total</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {ordersData.data.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-ink">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">{order.order_items?.length ?? 0} items</td>
                    <td className="py-3 px-4 font-semibold text-ink">{formatPrice(order.total_amount)}</td>
                    <td className="py-3 px-4">
                      <span className={cn('text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full', STATUS_COLORS[order.status] ?? 'bg-neutral-100 text-neutral-500')}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/orders/${order.id}`} target="_blank" className="p-1.5 text-neutral-400 hover:text-brand transition-colors inline-block">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
