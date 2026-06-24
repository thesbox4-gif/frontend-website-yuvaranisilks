import React, { Suspense } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { HeroVideo } from '@/components/shop/HeroVideo'
import { CategoryShowcase } from '@/components/shop/CategoryShowcase'
import { HomepageSectionsLoader } from '@/components/shop/HomepageSectionsLoader'
import { LiveVideoBooking } from '@/components/shop/LiveVideoBooking'
import type { Product, Category } from '@/types'
import { ChevronRight, Sparkles, Truck, Shield, RotateCcw } from 'lucide-react'
import { BRAND } from '@/lib/brand'
import { MOCK_CATEGORIES } from '@/data/mock/categories'
import { MOCK_PRODUCTS } from '@/data/mock/products'

async function getHomeData() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      api.get<{ data: Product[]; total: number }>('/api/products?limit=100&published=true'),
      api.get<Category[]>('/api/categories'),
    ])
    return {
      products: productsRes.data?.length ? productsRes.data : MOCK_PRODUCTS,
      categories: categoriesRes?.length ? categoriesRes : MOCK_CATEGORIES,
    }
  } catch {
    return { products: MOCK_PRODUCTS, categories: MOCK_CATEGORIES }
  }
}

export default async function HomePage() {
  const { products, categories } = await getHomeData()

  return (
    <div className="pb-12 w-full min-w-0 overflow-x-hidden">
      {/* Hero Video — full-screen video with Ken Burns motion */}
      <HeroVideo />

      {/* Trust Badges */}
      <div className="bg-white border-y border-neutral-100 relative z-25">
        <div className="page-container py-5 sm:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 min-w-0">
            {[
              { icon: Truck, title: 'Free Shipping', sub: 'Above ₹999 on all items' },
              { icon: Shield, title: 'Secure Payments', sub: '100% encrypted transactions' },
              { icon: RotateCcw, title: 'Easy Returns', sub: '7-day hassle-free policy' },
              { icon: Sparkles, title: '100% Authentic', sub: 'Directly sourced weaves' },
            ].map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center sm:text-left min-w-0 px-1"
              >
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-brand-soft flex items-center justify-center shrink-0">
                  <Icon className="h-[1.05rem] w-[1.05rem] sm:h-[1.15rem] sm:w-[1.15rem] text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.12em] leading-snug">{title}</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 leading-snug">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Showcase — all root categories from API */}
      <CategoryShowcase products={products} categories={categories} />

      {/* Dynamic Homepage Sections — New Arrivals, Trending, Best Sellers, Promo Banners */}
      <Suspense fallback={null}>
        <HomepageSectionsLoader />
      </Suspense>

      {/* Live Video Shopping Booking */}
      <LiveVideoBooking />

      {/* Banner CTA */}
      <section className="relative bg-[var(--color-ink)] text-white mt-12 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[var(--color-gold)]/10 blur-3xl" />
        <div className="relative page-container py-14 sm:py-20 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-gold)]">
            The {BRAND.name} Edit
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-[var(--font-display)] mt-3 mb-4">
            Explore Our Full Heritage Collection
          </h2>
          <p className="text-white/55 mb-9 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Traditional silk sarees, designer ensembles, and temple gold jewellery —
            secure payments and swift delivery, every time.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-ink font-semibold px-8 py-4 rounded-full hover:bg-[var(--color-gold)] transition-colors text-xs uppercase tracking-[0.14em]"
          >
            Shop Entire Catalogue <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
