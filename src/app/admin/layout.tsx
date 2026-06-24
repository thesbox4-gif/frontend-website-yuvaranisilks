'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { useAuthStore } from '@/store/authStore'
import { Menu, X } from 'lucide-react'

const ADMIN_ROLES = ['admin', 'staff', 'manager']

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/categories': 'Categories',
  '/admin/products': 'Products',
  '/admin/banners': 'Banners',
  '/admin/homepage': 'Homepage Settings',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/settings': 'Settings',
}

function resolveTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return title
  }
  return 'Admin'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, hasHydrated } = useAuthStore()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!hasHydrated || isLoginPage) return
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      router.replace('/admin/login')
    }
  }, [hasHydrated, user, isLoginPage, router])

  // Login page: render without the admin chrome (root layout handles Toaster)
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show loading state while checking auth
  if (!hasHydrated || !user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <span className="h-8 w-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    )
  }

  const title = resolveTitle(pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Desktop sidebar */}
      <AdminSidebar />

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="relative flex flex-col w-60 bg-[var(--color-ink)] z-10">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader title={title} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
