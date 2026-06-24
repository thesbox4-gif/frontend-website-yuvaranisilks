'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useBanners } from '@/hooks/useBanners'

// Local asset imports kept as last-resort fallbacks for when the mock images
// don't load (the mock data points to /mock/hero-*.jpg which may not exist).
import heroSaree1 from '@/assets/hero-saree-1.jpg'
import heroSaree2 from '@/assets/hero-saree-2.jpg'
import fabric2 from '@/assets/fabric-2.jpg'
import storefront from '@/assets/storefront.jpg'

const LOCAL_FALLBACKS = [
  heroSaree1.src,
  heroSaree2.src,
  fabric2.src,
  storefront.src,
]

function SliderSkeleton() {
  return (
    <section className="relative w-full min-w-0 h-[52vh] sm:h-[60vh] md:h-[78vh] min-h-[320px] sm:min-h-[420px] md:min-h-[580px] bg-neutral-900 shimmer" />
  )
}

export function HeroSlider() {
  const { banners, loading } = useBanners()
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // Reset to first slide when banners reload (e.g. tab switch)
  useEffect(() => {
    setCurrent(0)
  }, [banners])

  useEffect(() => {
    if (isHovered || banners.length < 2) return
    const timer = setInterval(nextSlide, 4500)
    return () => clearInterval(timer)
  }, [nextSlide, isHovered, banners.length])

  if (loading) return <SliderSkeleton />
  if (!banners.length) return null

  return (
    <section
      className="relative w-full min-w-0 h-[52vh] sm:h-[60vh] md:h-[78vh] min-h-[320px] sm:min-h-[420px] md:min-h-[580px] overflow-hidden bg-gray-950 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full">
        {banners.map((banner, idx) => {
          const isActive = idx === current
          // Use the banner's image_url; fall back to local asset if blank
          const imgSrc = banner.image_url || LOCAL_FALLBACKS[idx % LOCAL_FALLBACKS.length]

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background image */}
              <div className="absolute inset-0 w-full h-full select-none">
                <Image
                  src={imgSrc}
                  alt={banner.title}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className={`object-cover object-center w-full h-full transition-transform duration-[4500ms] ease-out ${
                    isActive ? 'sm:scale-105 scale-100' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
              </div>

              {/* Slide content */}
              <div className="relative w-full min-w-0 max-w-7xl mx-auto h-full px-4 pr-14 sm:px-6 sm:pr-6 lg:px-8 flex items-center">
                <div
                  className={`w-full min-w-0 max-w-2xl text-white transition-all duration-700 delay-300 transform ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  {banner.subtitle && (
                    <div className="inline-flex flex-wrap items-center gap-1.5 max-w-full px-3 py-1.5 rounded-full border border-brand-accent/30 text-[var(--color-gold)] bg-white/5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-widest mb-3 sm:mb-4 backdrop-blur-md">
                      <Sparkles className="h-3 w-3 shrink-0" />
                      <span className="break-words">{banner.subtitle}</span>
                    </div>
                  )}

                  <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight font-display tracking-wide mb-2 sm:mb-4 break-words">
                    {banner.title}
                  </h1>

                  {banner.description && (
                    <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-5 sm:mb-8 max-w-xl font-sans font-light leading-relaxed break-words">
                      {banner.description}
                    </p>
                  )}

                  {banner.cta_text && banner.cta_href && (
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      <Link
                        href={banner.cta_href}
                        className="px-6 sm:px-8 py-3 sm:py-3.5 bg-brand hover:bg-brand-dark text-cream font-bold text-xs tracking-wider uppercase rounded-full shadow-lg shadow-brand/20 transition-all duration-300 inline-flex items-center gap-2 hover:scale-[1.02]"
                      >
                        {banner.cta_text}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 bg-black/40 md:bg-black/20 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 bg-black/40 md:bg-black/20 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                idx === current ? 'w-10 bg-brand' : 'w-3.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
