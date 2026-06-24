'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface AdminHeaderProps {
  title: string
  onMenuClick?: () => void
}

export function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    router.push('/admin/login')
  }

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="lg:hidden p-1.5 text-neutral-500 hover:text-ink">
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-sm font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold uppercase">
              {user.name.charAt(0)}
            </span>
            <span className="hidden sm:block text-sm text-neutral-600 font-medium">{user.name}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
