'use client'

import React, { useEffect, useState } from 'react'
import { Save, Loader2, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { homepageService } from '@/services/homepageService'
import { toast } from '@/components/ui/Toaster'
import type { HomepageSettings, HomepageSection, HomepageSectionType } from '@/types'
import { MOCK_HOMEPAGE_SETTINGS } from '@/data/mock/homepage'
import { cn } from '@/lib/utils'

const SECTION_LABELS: Record<HomepageSectionType, string> = {
  new_arrivals: 'New Arrivals',
  trending: 'Trending Now',
  best_sellers: 'Best Sellers',
  promo_banner: 'Promotional Banner',
  featured_categories: 'Featured Categories',
  featured_sarees: 'Featured Sarees',
  featured_jewellery: 'Featured Jewellery',
  wedding_collection: 'Wedding Collection',
}

const SECTION_DESCRIPTIONS: Record<HomepageSectionType, string> = {
  new_arrivals: 'Automatically shows the most recently added products.',
  trending: 'Shows popular products by sales volume, or pick specific ones.',
  best_sellers: 'Shows best-selling products, or pick specific ones.',
  promo_banner: 'Full-width promotional image with an optional link.',
  featured_categories: 'Grid of selected category cards.',
  featured_sarees: 'Highlights saree products — newest sarees by default.',
  featured_jewellery: 'Highlights jewellery products — newest jewellery by default.',
  wedding_collection: 'Curates products tagged with the "wedding" occasion.',
}

const inputClass = 'w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand bg-white'

interface SectionCardProps {
  section: HomepageSection
  onChange: (updated: HomepageSection) => void
  onRemove: () => void
}

function SectionCard({ section, onChange, onRemove }: SectionCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border p-5 space-y-4 transition-all', section.active ? 'border-neutral-200/70' : 'border-neutral-100 opacity-60')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{SECTION_LABELS[section.type]}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{SECTION_DESCRIPTIONS[section.type]}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onChange({ ...section, active: !section.active })}
            title={section.active ? 'Hide section' : 'Show section'}
          >
            {section.active
              ? <ToggleRight className="h-5 w-5 text-brand" />
              : <ToggleLeft className="h-5 w-5 text-neutral-400" />}
          </button>
          <button onClick={onRemove} className="text-neutral-300 hover:text-red-500 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Section Title</label>
          <input
            value={section.title}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            className={inputClass}
            placeholder="e.g. New Arrivals"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Subtitle / Eyebrow</label>
          <input
            value={section.subtitle ?? ''}
            onChange={(e) => onChange({ ...section, subtitle: e.target.value })}
            className={inputClass}
            placeholder="e.g. Fresh From The Loom"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Display Order</label>
        <input
          type="number"
          min={0}
          value={section.display_order}
          onChange={(e) => onChange({ ...section, display_order: Number(e.target.value) })}
          className="w-24 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand"
        />
        <p className="text-[11px] text-neutral-400 mt-1">Lower = appears earlier on homepage.</p>
      </div>

      {section.type === 'promo_banner' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Banner Image URL</label>
            <input
              value={section.banner_image_url ?? ''}
              onChange={(e) => onChange({ ...section, banner_image_url: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Click Link</label>
            <input
              value={section.banner_link ?? ''}
              onChange={(e) => onChange({ ...section, banner_link: e.target.value })}
              className={inputClass}
              placeholder="/products?type=saree"
            />
          </div>
        </div>
      )}

      {(
        section.type === 'trending' ||
        section.type === 'best_sellers' ||
        section.type === 'featured_sarees' ||
        section.type === 'featured_jewellery' ||
        section.type === 'wedding_collection'
      ) && (
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">
            Curated Product IDs <span className="text-neutral-400">(optional, comma-separated)</span>
          </label>
          <input
            value={(section.product_ids ?? []).join(', ')}
            onChange={(e) => onChange({
              ...section,
              product_ids: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })}
            className={inputClass}
            placeholder="Leave empty to auto-select by algorithm"
          />
        </div>
      )}
    </div>
  )
}

const NEW_SECTION_TYPES: HomepageSectionType[] = [
  'new_arrivals',
  'trending',
  'best_sellers',
  'featured_sarees',
  'featured_jewellery',
  'wedding_collection',
  'promo_banner',
]

export default function HomepageSettingsPage() {
  const { token } = useAuthStore()
  const [settings, setSettings] = useState<HomepageSettings>(MOCK_HOMEPAGE_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    homepageService.getSettings().then(setSettings).finally(() => setLoading(false))
  }, [])

  function updateSection(idx: number, updated: HomepageSection) {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) => (i === idx ? updated : s)),
    }))
  }

  function removeSection(idx: number) {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }))
  }

  function addSection(type: HomepageSectionType) {
    const newSection: HomepageSection = {
      id: `section-${Date.now()}`,
      type,
      title: SECTION_LABELS[type],
      active: true,
      display_order: settings.sections.length + 1,
    }
    setSettings((prev) => ({ ...prev, sections: [...prev.sections, newSection] }))
  }

  async function handleSave() {
    if (!token) return
    setSaving(true)
    try {
      const updated = await homepageService.updateSettings(settings, token)
      setSettings(updated)
      toast({ title: 'Homepage settings saved!' })
    } catch {
      toast({ title: 'Save failed — settings saved locally only', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const sorted = [...settings.sections].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">Configure which sections appear on the homepage and in what order.</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-6 w-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onChange={(updated) => {
                const realIdx = settings.sections.findIndex((s) => s.id === section.id)
                updateSection(realIdx, updated)
              }}
              onRemove={() => {
                const realIdx = settings.sections.findIndex((s) => s.id === section.id)
                removeSection(realIdx)
              }}
            />
          ))}
        </div>
      )}

      {/* Add section */}
      <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-5">
        <p className="text-sm font-medium text-neutral-600 mb-3">Add a new section</p>
        <div className="flex flex-wrap gap-2">
          {NEW_SECTION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => addSection(type)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:border-brand hover:text-brand transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {SECTION_LABELS[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
