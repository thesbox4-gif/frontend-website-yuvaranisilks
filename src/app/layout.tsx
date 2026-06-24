import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { Providers } from './providers'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'
import { Toaster } from '@/components/ui/Toaster'
import { BRAND } from '@/lib/brand'
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: `${BRAND.name} — Traditional Sarees & Gold Jewellery`,
  description: `Shop authentic silk sarees and temple gold jewellery from ${BRAND.name}.`,
  icons: { icon: BRAND.logoPath, apple: BRAND.logoPath },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${poppins.variable}`}>
      <body className="w-full min-w-0 overflow-x-hidden">
        <Providers>
          {/*
            ConditionalLayout renders Navbar+Footer for storefront routes only.
            /admin/* routes get their own shell from src/app/admin/layout.tsx.
          */}
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
