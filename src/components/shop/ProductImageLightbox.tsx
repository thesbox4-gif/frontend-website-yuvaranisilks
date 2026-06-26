'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const MIN_SCALE = 1
const MAX_SCALE = 5
const DOUBLE_TAP_MS = 280

export interface LightboxImage {
  src: string
  alt: string
}

interface ProductImageLightboxProps {
  images: LightboxImage[]
  initialIndex?: number
  open: boolean
  onClose: () => void
  onIndexChange?: (index: number) => void
}

function pinchDist(touches: React.TouchList): number {
  const a = touches[0]
  const b = touches[1]
  if (!a || !b) return 0
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

export function ProductImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  onIndexChange,
}: ProductImageLightboxProps) {
  const [mounted, setMounted] = useState(false)
  const [index, setIndex]     = useState(initialIndex)
  const [scale, setScale]     = useState(1)
  const [offset, setOffset]   = useState({ x: 0, y: 0 })

  /* Mutable refs — updated in sync with state but never trigger re-renders.
     Gesture handlers read these so they always see the latest value even
     inside a stale closure from addEventListener. */
  const scaleRef     = useRef(1)
  const offsetRef    = useRef({ x: 0, y: 0 })
  const indexRef     = useRef(initialIndex)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageWrapRef = useRef<HTMLDivElement>(null)
  const thumbsRef    = useRef<HTMLDivElement>(null)

  /* Gesture tracking refs */
  const pinchRef    = useRef<{ dist: number; scale: number } | null>(null)
  const panRef      = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const swipeRef    = useRef<{ x: number; y: number } | null>(null)
  const mousePanRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const lastTapRef  = useRef(0)

  scaleRef.current  = scale
  offsetRef.current = offset
  indexRef.current  = index

  const clampS = (v: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, v))

  function clampOffset(o: { x: number; y: number }, s: number) {
    if (s <= 1) return { x: 0, y: 0 }
    const el = imageWrapRef.current
    if (!el) return o
    const maxX = (el.offsetWidth  * (s - 1)) / 2
    const maxY = (el.offsetHeight * (s - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, o.x)),
      y: Math.max(-maxY, Math.min(maxY, o.y)),
    }
  }

  const resetView = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const goTo = useCallback((next: number) => {
    if (!images.length) return
    const idx = ((next % images.length) + images.length) % images.length
    resetView()
    setIndex(idx)
    onIndexChange?.(idx)
  }, [images.length, resetView, onIndexChange])

  useEffect(() => { setMounted(true) }, [])

  /* Lock body scroll and sync index when opening */
  useEffect(() => {
    if (!open) return
    setIndex(initialIndex)
    resetView()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open, initialIndex, resetView])

  /* Scroll active thumbnail into view */
  useEffect(() => {
    if (!thumbsRef.current) return
    const el = thumbsRef.current.children[index] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [index])

  /* Keyboard navigation */
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowLeft'  && scaleRef.current <= 1) goTo(indexRef.current - 1)
      if (e.key === 'ArrowRight' && scaleRef.current <= 1) goTo(indexRef.current + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, goTo])

  /* Non-passive wheel listener — zooms toward cursor position.
     React's synthetic onWheel can't call preventDefault reliably in modern
     browsers because they register wheel listeners as passive by default. */
  useEffect(() => {
    const el = containerRef.current
    if (!el || !open) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.2 : -0.2
      const rect  = el!.getBoundingClientRect()
      /* Cursor position relative to the image center */
      const cx = e.clientX - rect.left  - rect.width  / 2
      const cy = e.clientY - rect.top   - rect.height / 2
      setScale(prev => {
        const next = clampS(Number((prev + delta).toFixed(2)))
        if (next <= 1) {
          setOffset({ x: 0, y: 0 })
        } else {
          setOffset(o => {
            const ratio = next / (prev || 1)
            return clampOffset(
              { x: o.x + (cx - o.x) * (1 - 1 / ratio),
                y: o.y + (cy - o.y) * (1 - 1 / ratio) },
              next
            )
          })
        }
        return next
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [open])

  /* ── Touch handlers ───────────────────────────────────────────────────── */

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault()
      pinchRef.current = { dist: pinchDist(e.touches), scale: scaleRef.current }
      panRef.current   = null
      swipeRef.current = null
      return
    }
    if (e.touches.length !== 1) return
    const t = e.touches[0]!
    const now = Date.now()

    /* Manual double-tap detection — required because touch-none on the
       container prevents the browser from firing the native dblclick event. */
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      const next = scaleRef.current > 1 ? 1 : 2.5
      setScale(next)
      setOffset({ x: 0, y: 0 })
      lastTapRef.current = 0
      return
    }
    lastTapRef.current = now

    if (scaleRef.current > 1) {
      panRef.current = { x: t.clientX, y: t.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
    } else if (images.length > 1) {
      swipeRef.current = { x: t.clientX, y: t.clientY }
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const dist = pinchDist(e.touches)
      if (!dist) return
      const next = clampS(pinchRef.current.scale * (dist / pinchRef.current.dist))
      setScale(next)
      setOffset(o => next <= 1 ? { x: 0, y: 0 } : clampOffset(o, next))
      return
    }
    if (e.touches.length === 1 && panRef.current && scaleRef.current > 1) {
      e.preventDefault()
      const t = e.touches[0]!
      setOffset(clampOffset({
        x: panRef.current.ox + t.clientX - panRef.current.x,
        y: panRef.current.oy + t.clientY - panRef.current.y,
      }, scaleRef.current))
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (swipeRef.current && scaleRef.current <= 1 && images.length > 1) {
      const t = e.changedTouches[0]!
      const dx = t.clientX - swipeRef.current.x
      const dy = t.clientY - swipeRef.current.y
      /* Require horizontal dominance before committing to swipe */
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        goTo(indexRef.current + (dx < 0 ? 1 : -1))
      }
    }
    pinchRef.current = null
    panRef.current   = null
    swipeRef.current = null
  }

  /* ── Mouse pan handlers ───────────────────────────────────────────────── */

  function onMouseDown(e: React.MouseEvent) {
    if (scaleRef.current <= 1 || e.button !== 0) return
    e.preventDefault()
    mousePanRef.current = { x: e.clientX, y: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!mousePanRef.current) return
    setOffset(clampOffset({
      x: mousePanRef.current.ox + e.clientX - mousePanRef.current.x,
      y: mousePanRef.current.oy + e.clientY - mousePanRef.current.y,
    }, scaleRef.current))
  }

  function onMouseUp() { mousePanRef.current = null }

  /* Double-click to toggle zoom (desktop — fires naturally without touch-none) */
  function onDblClick() {
    const next = scaleRef.current > 1 ? 1 : 2.5
    setScale(next)
    if (next <= 1) setOffset({ x: 0, y: 0 })
  }

  function adjustScale(delta: number) {
    setScale(s => {
      const next = clampS(Number((s + delta).toFixed(2)))
      setOffset(o => next <= 1 ? { x: 0, y: 0 } : clampOffset(o, next))
      return next
    })
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  if (!open || !images[index] || !mounted) return null
  const current     = images[index]!
  const hasMultiple = images.length > 1
  const isZoomed    = scale > 1 || offset.x !== 0 || offset.y !== 0

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black touch-none select-none isolate"
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
    >
      {/* ── Header: counter + close ──────────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-between px-4
                      pt-[max(0.875rem,env(safe-area-inset-top))] pb-3 shrink-0">
        {hasMultiple ? (
          <span className="text-white font-semibold text-sm tabular-nums
                           bg-white/12 backdrop-blur-sm px-3.5 py-1 rounded-full">
            {index + 1}
            <span className="text-white/40 mx-1">/</span>
            {images.length}
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-white/12 backdrop-blur-sm text-white
                     flex items-center justify-center hover:bg-white/25
                     transition-colors touch-target"
          aria-label="Close image viewer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Image area ───────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={cn(
          'relative flex-1 min-h-0 overflow-hidden flex items-center justify-center',
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={(e) => {
          /* Only close when the backdrop itself (not the image) is clicked */
          if (e.target === e.currentTarget && !isZoomed) onClose()
        }}
      >
        {/* Prev / Next arrows — hidden while zoomed in */}
        {hasMultiple && scale <= 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goTo(indexRef.current - 1) }}
              className="absolute left-3 sm:left-5 z-20 h-11 w-11 rounded-full
                         bg-white/12 backdrop-blur-sm text-white
                         flex items-center justify-center
                         hover:bg-white/25 transition-colors touch-target"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goTo(indexRef.current + 1) }}
              className="absolute right-3 sm:right-5 z-20 h-11 w-11 rounded-full
                         bg-white/12 backdrop-blur-sm text-white
                         flex items-center justify-center
                         hover:bg-white/25 transition-colors touch-target"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image — transform applied here for zoom + pan */}
        <div
          ref={imageWrapRef}
          className="absolute inset-0"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={onDblClick}
        >
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            className="object-contain pointer-events-none"
            sizes="(max-width: 768px) 100vw, 800px"
            quality={95}
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* ── Bottom panel: thumbnails + zoom controls ──────────────────────── */}
      <div className="relative z-20 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Thumbnail strip */}
        {hasMultiple && (
          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-3 pb-2"
          >
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'relative shrink-0 w-12 h-[3.75rem] sm:w-14 sm:h-[4.375rem]',
                  'rounded-lg overflow-hidden transition-all duration-150',
                  i === index
                    ? 'ring-2 ring-white opacity-100 scale-[1.08]'
                    : 'ring-1 ring-white/25 opacity-45 hover:opacity-75 hover:ring-white/50'
                )}
                aria-label={`Image ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="56px"
                  quality={60}
                />
              </button>
            ))}
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center justify-center gap-2 px-4 pt-1">
          <button
            type="button"
            onClick={() => adjustScale(-0.5)}
            disabled={scale <= MIN_SCALE}
            className="h-10 w-10 rounded-full border border-white/20 text-white
                       flex items-center justify-center
                       hover:bg-white/10 transition-colors
                       disabled:opacity-25 disabled:pointer-events-none touch-target"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="text-white/70 text-xs font-semibold tabular-nums
                           min-w-[3.5rem] text-center select-none">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => adjustScale(0.5)}
            disabled={scale >= MAX_SCALE}
            className="h-10 w-10 rounded-full border border-white/20 text-white
                       flex items-center justify-center
                       hover:bg-white/10 transition-colors
                       disabled:opacity-25 disabled:pointer-events-none touch-target"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {isZoomed && (
            <button
              type="button"
              onClick={resetView}
              className="px-3 py-2 rounded-full text-xs font-semibold
                         border border-white/20 text-white/70
                         hover:bg-white/10 transition-colors touch-target"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
