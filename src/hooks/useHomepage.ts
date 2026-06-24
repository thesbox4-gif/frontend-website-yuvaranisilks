'use client'

import { useState, useEffect } from 'react'
import type { HomepageSettings } from '@/types'
import { homepageService } from '@/services/homepageService'
import { MOCK_HOMEPAGE_SETTINGS } from '@/data/mock/homepage'

interface UseHomepageReturn {
  settings: HomepageSettings
  loading: boolean
  error: string | null
}

export function useHomepage(): UseHomepageReturn {
  const [settings, setSettings] = useState<HomepageSettings>(MOCK_HOMEPAGE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    homepageService
      .getSettings()
      .then((data) => { if (!cancelled) setSettings(data) })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load homepage settings')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { settings, loading, error }
}
