'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Product, HomepageSection } from '@/types'
import { productService } from '@/services/productService'
import { ProductCard } from '@/components/shop/ProductCard'

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-neutral-200/80">
      <div className="aspect-[3/4] shimmer" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-2.5 w-1/3 shimmer rounded" />
        <div className="h-3 w-3/4 shimmer rounded" />
        <div className="h-3 w-1/2 shimmer rounded" />
      </div>
    </div>
  )
}

function SectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ─── Product section (new arrivals / trending / best sellers) ────────────────

interface ProductSectionProps {
  section: HomepageSection
}

function ProductSection({ section }: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const limit = 8

    const fetcher =
      section.product_ids && section.product_ids.length > 0
        ? productService.getByIds(section.product_ids)
        : section.type === 'new_arrivals'
        ? productService.getNewArrivals(limit)
        : section.type === 'trending'
        ? productService.getTrending(limit)
        : section.type === 'featured_sarees'
        ? productService.getFeaturedByType('saree', limit)
        : section.type === 'featured_jewellery'
        ? productService.getFeaturedByType('jewellery', limit)
        : section.type === 'wedding_collection'
        ? productService.getByOccasion('wedding', limit)
        : productService.getBestSellers(limit)

    fetcher
      .then((data) => { if (!cancelled) setProducts(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setProducts([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [section])

  if (!loading && !products.length) return null

  const viewAllHref =
    section.type === 'new_arrivals'
      ? '/products?sort=newest'
      : section.type === 'trending'
      ? '/products?sort=popular'
      : section.type === 'featured_sarees'
      ? '/products?type=saree'
      : section.type === 'featured_jewellery'
      ? '/products?type=jewellery'
      : section.type === 'wedding_collection'
      ? '/products?occasion=wedding'
      : '/products?sort=best_seller'

  return (
    <section className="py-10 sm:py-14">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 gap-3">
          <div>
            {section.subtitle && (
              <div className="inline-flex items-center gap-1 text-brand text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{section.subtitle}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink font-display">
              {section.title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:text-brand-dark transition-colors shrink-0"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────

interface PromoBannerProps {
  section: HomepageSection
}

function PromoBannerSection({ section }: PromoBannerProps) {
  if (!section.banner_image_url) return null

  const content = (
    <div className="relative w-full rounded-2xl overflow-hidden aspect-[21/6] min-h-[120px] sm:min-h-[160px]">
      <Image
        src={section.banner_image_url}
        alt={section.title}
        fill
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="object-cover w-full h-full"
      />
      {section.title && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <p className="text-white font-semibold font-display text-lg sm:text-2xl md:text-3xl text-center px-4">
            {section.title}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <div className="page-container py-6">
      {section.banner_link ? (
        <Link href={section.banner_link}>{content}</Link>
      ) : (
        content
      )}
    </div>
  )
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

interface HomepageSectionsProps {
  sections: HomepageSection[]
}

export function HomepageSections({ sections }: HomepageSectionsProps) {
  const active = sections
    .filter((s) => s.active)
    .sort((a, b) => a.display_order - b.display_order)

  return (
    <>
      {active.map((section) => {
        if (section.type === 'promo_banner') {
          return <PromoBannerSection key={section.id} section={section} />
        }
        if (
          section.type === 'new_arrivals' ||
          section.type === 'trending' ||
          section.type === 'best_sellers' ||
          section.type === 'featured_sarees' ||
          section.type === 'featured_jewellery' ||
          section.type === 'wedding_collection'
        ) {
          return <ProductSection key={section.id} section={section} />
        }
        return null
      })}
    </>
  )
}
