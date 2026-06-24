'use client'

import { useState, useEffect } from 'react'
import type { Banner } from '@/types'
import { bannerService } from '@/services/bannerService'
import { MOCK_BANNERS } from '@/data/mock/banners'

interface UseBannersReturn {
  banners: Banner[]
  loading: boolean
  error: string | null
}

export function useBanners(): UseBannersReturn {
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    bannerService
      .getActive()
      .then((data) => {
        if (!cancelled) setBanners(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load banners')
          setBanners(MOCK_BANNERS)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { banners, loading, error }
}
