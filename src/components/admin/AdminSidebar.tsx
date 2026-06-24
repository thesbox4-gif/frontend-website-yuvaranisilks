'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Tag,
  Package,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND } from '@/lib/brand'
import Image from 'next/image'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/homepage', label: 'Homepage', icon: Home },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  function isActive(item: { href: string; exact?: boolean }) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href)
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-[var(--color-ink)] text-white transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && 'justify-center px-2')}>
        <Image src={BRAND.logoPath} alt={BRAND.name} width={32} height={32} className="h-8 w-auto object-contain shrink-0 brightness-110" />
        {!collapsed && (
          <span className="text-sm font-bold tracking-wide truncate">{BRAND.name}</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-[1.1rem] w-[1.1rem] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* View store */}
      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          title={collapsed ? 'View Store' : undefined}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span>View Store</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center justify-center py-3 border-t border-white/10 text-white/40 hover:text-white transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}
