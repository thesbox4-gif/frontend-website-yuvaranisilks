'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import type { Product, Category } from '@/types'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CategoryShowcaseProps {
  products: Product[]
  categories: Category[]
}

/** Pick the best cover image for a subcategory. */
function resolveImage(cat: Category, products: Product[]): string {
  if (cat.image_url) return cat.image_url
  const product = products.find((p) => p.category?.id === cat.id)
  if (product?.images?.length) {
    const primary = product.images.find((img) => img.is_primary) || product.images[0]
    return primary.url
  }
  return 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop'
}

interface SectionProps {
  root: Category
  subs: Category[]
  products: Product[]
}

function CategorySection({ root, subs, products }: SectionProps) {
  return (
    <section className="py-10 sm:py-14 lg:py-16 border-b border-gray-100 last:border-b-0">
      <div className="page-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-brand text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{root.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-ink font-display">
              {root.name} Collections
            </h2>
            {root.description && (
              <p className="text-sm text-neutral-500 mt-2 max-w-2xl font-light">
                {root.description}
              </p>
            )}
          </div>
          <Link
            href={`/products?type=${root.slug}`}
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand hover:text-brand-dark transition-colors shrink-0"
          >
            View Full Collection
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Root category banner — rendered when admin uploads a cover image */}
        {root.image_url && (
          <Link
            href={`/category/${root.slug}`}
            className="relative block w-full h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden mb-8 group shadow-md hover:shadow-xl transition-shadow duration-300"
            aria-label={`View all ${root.name}`}
          >
            <Image
              src={root.image_url}
              alt={root.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 80vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </Link>
        )}

        {/* Subcategory horizontal scroll */}
        {subs.length > 0 ? (
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-3 snap-x snap-mandatory min-w-0">
            {subs.map((cat) => {
              const cover = resolveImage(cat, products)
              return (
                <Link
                  key={cat.id}
                  href={`/products?type=${root.slug}&category=${cat.id}`}
                  className="group relative block w-[min(72vw,200px)] sm:w-[240px] md:w-[260px] shrink-0 snap-start aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100/50 border border-brand-accent/15 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500"
                >
                  <Image
                    src={cover}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 opacity-90 transition-opacity duration-500 group-hover:opacity-95" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-base sm:text-lg font-medium font-sans tracking-wide group-hover:text-[var(--color-gold)] transition-colors duration-300">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-[10px] text-neutral-300 mt-1 line-clamp-1 font-light">
                        {cat.description}
                      </p>
                    )}
                    <p className="text-[9.5px] uppercase tracking-wider text-[var(--color-gold)] font-bold mt-2.5 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-0.5">
                      Shop Now <span className="translate-y-[0.5px]">→</span>
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* No subcategories yet — link to root category directly */
          <div className="bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center">
            <span className="text-3xl mb-3">🌸</span>
            <h4 className="text-base font-semibold text-gray-800">Coming Soon</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              We are currently curating collections for this category. Check back shortly!
            </p>
            <Link
              href={`/products?type=${root.slug}`}
              className="mt-4 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full border border-brand text-brand hover:bg-brand hover:text-white transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export function CategoryShowcase({ products, categories }: CategoryShowcaseProps) {
  const rootCategories = useMemo(
    () =>
      categories
        .filter((c) => !c.parent_id)
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
    [categories]
  )

  if (!rootCategories.length) return null

  return (
    <div className="bg-white">
      {rootCategories.map((root) => {
        const subs = categories.filter((c) => c.parent_id === root.id)
        return (
          <CategorySection
            key={root.id}
            root={root}
            subs={subs}
            products={products}
          />
        )
      })}
    </div>
  )
}
