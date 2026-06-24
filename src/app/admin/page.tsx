'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag, Users, Package, TrendingUp,
  Tag, Image as ImageIcon, Home, ArrowRight,
  IndianRupee, Clock, AlertTriangle,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/services/homepageService'
import type { AdminStats } from '@/types'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  sub?: string
  color?: string
  href?: string
}

function StatCard({ label, value, icon: Icon, sub, color = 'brand', href }: StatCardProps) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-soft text-brand',
    gold: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-sky-50 text-sky-600',
  }
  const card = (
    <div className="bg-white rounded-2xl border border-neutral-200/70 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-ink mt-1">{value}</p>
          {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
        </div>
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', colorMap[color] ?? colorMap.brand)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )

  return href ? <Link href={href}>{card}</Link> : card
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/70 p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 shimmer rounded" />
          <div className="h-7 w-24 shimmer rounded" />
        </div>
        <div className="h-10 w-10 shimmer rounded-xl" />
      </div>
    </div>
  )
}

const QUICK_LINKS = [
  { href: '/admin/categories/new', label: 'Add Category', icon: Tag, color: 'brand' },
  { href: '/admin/products/new', label: 'Add Product', icon: Package, color: 'gold' },
  { href: '/admin/banners', label: 'Manage Banners', icon: ImageIcon, color: 'blue' },
  { href: '/admin/homepage', label: 'Homepage Settings', icon: Home, color: 'green' },
]

export default function AdminDashboardPage() {
  const { token } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    adminService
      .getStats(token)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-lg font-semibold text-ink">Overview</h2>
        <p className="text-sm text-neutral-500 mt-0.5">Real-time store metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard label="Total Orders" value={stats.total_orders} icon={ShoppingBag} href="/admin/orders" color="brand" />
            <StatCard label="Revenue" value={formatPrice(stats.total_revenue)} icon={IndianRupee} color="gold" />
            <StatCard label="Products" value={stats.total_products} icon={Package} href="/admin/products" color="blue" />
            <StatCard label="Customers" value={stats.total_customers} icon={Users} href="/admin/customers" color="green" />
            <StatCard label="Today's Orders" value={stats.orders_today} icon={TrendingUp} sub="Placed today" color="brand" />
            <StatCard label="Today's Revenue" value={formatPrice(stats.revenue_today)} icon={IndianRupee} color="gold" />
            <StatCard label="Pending Orders" value={stats.pending_orders} icon={Clock} href="/admin/orders?status=placed" color="red" />
            <StatCard label="Low Stock" value={stats.low_stock_products} icon={AlertTriangle} href="/admin/products?stock=low" color="red" />
          </>
        ) : (
          <div className="col-span-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            Stats unavailable — backend not connected. Connect the API at{' '}
            <code className="font-mono text-xs bg-amber-100 px-1 rounded">NEXT_PUBLIC_API_URL</code>.
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white rounded-xl border border-neutral-200/70 p-4 flex items-center gap-3 hover:border-brand hover:shadow-sm transition-all group"
              >
                <Icon className="h-5 w-5 text-brand shrink-0" />
                <span className="text-sm font-medium text-neutral-700 group-hover:text-brand leading-tight">{link.label}</span>
                <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-brand ml-auto shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Module overview */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">Manage</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/admin/categories', icon: Tag, label: 'Categories', desc: 'Add, edit, reorder product categories and subcategories.' },
            { href: '/admin/products', icon: Package, label: 'Products', desc: 'Manage product listings, pricing, images, and stock.' },
            { href: '/admin/banners', icon: ImageIcon, label: 'Hero Banners', desc: 'Upload and arrange homepage hero slider images.' },
            { href: '/admin/homepage', icon: Home, label: 'Homepage', desc: 'Configure New Arrivals, Trending, and Best Sellers sections.' },
            { href: '/admin/orders', icon: ShoppingBag, label: 'Orders', desc: 'View and manage customer orders and shipment status.' },
            { href: '/admin/customers', icon: Users, label: 'Customers', desc: 'Browse registered customer accounts and activity.' },
          ].map((m) => {
            const Icon = m.icon
            return (
              <Link
                key={m.href}
                href={m.href}
                className="bg-white rounded-xl border border-neutral-200/70 p-5 hover:border-brand hover:shadow-sm transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-brand-soft flex items-center justify-center mb-3">
                  <Icon className="h-4.5 w-4.5 text-brand" />
                </div>
                <p className="text-sm font-semibold text-ink group-hover:text-brand">{m.label}</p>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{m.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
