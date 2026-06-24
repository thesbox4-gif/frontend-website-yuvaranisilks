'use client'

import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { BRAND } from '@/lib/brand'

const HERO_LINES = [
  { accent: 'Kanjivaram Silks',  base: '& Bridal Jewellery'  },
  { accent: 'Temple Gold',       base: '& Heritage Weaves'   },
  { accent: 'Bridal Sarees',     base: '& Antique Jewellery' },
]

const TRUST = [
  'Free shipping above ₹999',
  '100% authentic weaves',
  '7-day easy returns',
]

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [lineIdx, setLineIdx]   = useState(0)
  const [visible, setVisible]   = useState(true)

  /* cycle headline every 5 s */
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setLineIdx((i) => (i + 1) % HERO_LINES.length)
        setVisible(true)
      }, 380)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { videoRef.current?.play().catch(() => {}) }, [])

  const { accent, base } = HERO_LINES[lineIdx]

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-950"
      style={{ height: '100svh', minHeight: '600px', maxHeight: '980px' }}
    >
      {/* ── Video ──────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay muted loop playsInline preload="auto"
          className="hero-video-motion absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Gradients ──────────────────────────────────────────────────── */}
      {/* left sweep — readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/10 pointer-events-none" />
      {/* top + bottom vignettes */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      {/* ── Film grain ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.028]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '180px',
        }}
      />

      {/* ── Layout shell — flex column, full height, NO absolute text ── */}
      <div className="relative flex flex-col h-full w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

        {/* ── Main hero block — flex-1 centres it vertically ── */}
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="max-w-[38rem] hero-text-rise"
            style={{ animationDelay: '0.12s' }}
          >
            {/* Eyebrow */}
            <p className="text-[var(--color-gold)] text-[9px] sm:text-[10.5px] font-semibold
                           uppercase tracking-[0.32em] mb-4 sm:mb-5">
              {BRAND.name}&nbsp;&nbsp;·&nbsp;&nbsp;Heritage Since 1992
            </p>

            {/* Gold rule */}
            <div className="w-8 h-[1.5px] bg-[var(--color-gold)]/55 mb-6 sm:mb-8 rounded-full" />

            {/* Headline — fixed-height container prevents layout shift */}
            <div
              className="mb-6 sm:mb-8"
              style={{
                minHeight: 'clamp(6.5rem, 14vw, 12rem)',
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.38s ease, transform 0.38s ease',
              }}
            >
              <h1
                className="font-display font-semibold tracking-[-0.01em] leading-[1.1]"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 4.75rem)' }}
              >
                <span className="block text-[var(--color-gold)]">{accent}</span>
                <span className="block text-white/95 mt-1.5 sm:mt-2">{base}</span>
              </h1>
            </div>

            {/* Body copy */}
            <p
              className="text-white/60 text-[13px] sm:text-[15px] font-light
                          leading-[1.85] mb-9 sm:mb-11 max-w-[30rem]"
            >
              Handcrafted silk sarees and temple gold jewellery,
              sourced directly from master weavers and artisans
              across India.
            </p>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/products?type=saree"
                className="group inline-flex items-center gap-2 px-7 sm:px-9 py-3 sm:py-3.5
                           bg-brand hover:bg-brand-dark text-white font-semibold
                           text-[10px] sm:text-[11px] tracking-[0.18em] uppercase rounded-full
                           shadow-lg shadow-brand/20 hover:shadow-brand/40
                           transition-all duration-300 hover:scale-[1.025]"
              >
                Shop Sarees
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/products?type=jewellery"
                className="inline-flex items-center px-7 sm:px-9 py-3 sm:py-3.5
                           border border-white/20 hover:border-[var(--color-gold)]/45
                           bg-white/[0.06] hover:bg-white/[0.11]
                           text-white/80 hover:text-white font-semibold
                           text-[10px] sm:text-[11px] tracking-[0.18em] uppercase rounded-full
                           backdrop-blur-sm transition-all duration-300"
              >
                Shop Jewellery
              </Link>
            </div>
          </div>
        </div>

        {/* ── Bottom bar — sits below flex-1, never overlaps main text ── */}
        <div
          className="hero-text-rise pb-6 sm:pb-8 flex items-center justify-between gap-6"
          style={{ animationDelay: '0.55s' }}
        >
          {/* Trust badges — hidden on mobile to keep it uncluttered */}
          <div className="hidden sm:flex items-center gap-0 text-white/35
                          text-[9.5px] tracking-[0.18em] uppercase font-medium">
            {TRUST.map((t, i) => (
              <React.Fragment key={t}>
                {i > 0 && (
                  <span className="mx-3.5 text-white/20 text-[10px]" aria-hidden>·</span>
                )}
                <span>{t}</span>
              </React.Fragment>
            ))}
          </div>

          {/* Spacer on mobile so scroll indicator aligns right */}
          <div className="flex-1 sm:hidden" />

          {/* Scroll indicator — part of the bottom bar, never overlaps */}
          <div className="hero-scroll-bounce flex flex-col items-center gap-1 text-white/30 shrink-0">
            <ChevronDown className="h-3.5 w-3.5" />
            <span className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.22em] font-semibold">
              Scroll
            </span>
          </div>
        </div>

      </div>
    </section>
  )
}
