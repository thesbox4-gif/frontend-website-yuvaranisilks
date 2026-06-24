'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Search, Mail } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/services/homepageService'
import { formatPrice } from '@/lib/utils'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const { token } = useAuthStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const LIMIT = 25

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await adminService.getCustomers(token, page, LIMIT)
      setCustomers(res.data ?? [])
      setTotal(res.total)
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [token, page])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-5">
      <div className="text-xs text-neutral-400">{total} registered customers</div>

      <div className="bg-white rounded-2xl border border-neutral-200/70 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin inline-block" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-sm">No customers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left text-xs text-neutral-500 border-b border-neutral-100">
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Joined</th>
                  <th className="py-3 px-4 font-medium">Orders</th>
                  <th className="py-3 px-4 font-medium">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-brand-soft text-brand flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {c.name.charAt(0)}
                        </span>
                        <div>
                          <p className="font-medium text-ink">{c.name}</p>
                          <p className="text-xs text-neutral-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />{c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{c.total_orders ?? '—'}</td>
                    <td className="py-3 px-4 font-medium text-ink">{c.total_spent != null ? formatPrice(c.total_spent) : '—'}</td>
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
