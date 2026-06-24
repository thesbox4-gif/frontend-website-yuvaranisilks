'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

/**
 * Renders the storefront Navbar/Footer for all routes except /admin/*.
 * Admin pages use their own shell (AdminSidebar + AdminHeader) defined in
 * src/app/admin/layout.tsx.
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full min-w-0 overflow-x-hidden">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
