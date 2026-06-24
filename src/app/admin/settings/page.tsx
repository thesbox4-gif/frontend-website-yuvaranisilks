'use client'

import React from 'react'
import { BRAND } from '@/lib/brand'
import { Store, Mail, Phone, MapPin } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200/70 p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="h-10 w-10 rounded-xl bg-brand-soft flex items-center justify-center">
            <Store className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Store Information</h3>
            <p className="text-xs text-neutral-400">Managed via src/lib/brand.ts</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: Store, label: 'Store Name', value: BRAND.name },
            { icon: Mail, label: 'Email', value: BRAND.email },
            { icon: Phone, label: 'Phone', value: BRAND.phone },
            { icon: MapPin, label: 'Address', value: BRAND.address },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-ink mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          To update store details, edit{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">src/lib/brand.ts</code>{' '}
          and redeploy the frontend.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/70 p-6">
        <h3 className="text-sm font-semibold text-ink mb-3">API Configuration</h3>
        <div className="bg-neutral-50 rounded-lg p-4 font-mono text-xs space-y-1.5">
          <div>
            <span className="text-neutral-400">NEXT_PUBLIC_API_URL</span>
            <span className="text-brand ml-3">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}</span>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-3">
          Set in <code className="font-mono bg-neutral-100 px-1 rounded">.env.local</code> to point to the live backend.
        </p>
      </div>
    </div>
  )
}
