'use client'

import React, { useState } from 'react'
import { Video, Calendar, Clock, User, Phone, CheckCircle, Loader2 } from 'lucide-react'
import { waUrl } from '@/lib/whatsapp'

const TIME_SLOTS = [
  '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM',
  '2:00 PM',  '3:00 PM',  '4:00 PM',  '5:00 PM',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

interface FormValues {
  name: string
  phone: string
  date: string
  time: string
}

const INIT: FormValues = { name: '', phone: '', date: '', time: '' }

function buildWhatsAppFallback(f: FormValues) {
  const msg =
    `Hi Yuvarani Silks! 🙏\n\n` +
    `I'd like to book a *Live Video Shopping* session:\n\n` +
    `👤 Name: ${f.name}\n` +
    `📞 Phone: ${f.phone}\n` +
    `📅 Date: ${f.date}\n` +
    `⏰ Time: ${f.time}\n\n` +
    `Please confirm my booking. Thank you!`
  return waUrl(msg)
}

function InputField({
  label, icon: Icon, ...props
}: {
  label: string
  icon: React.ElementType
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
        {label}
      </span>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
        <input
          {...props}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-200 text-sm
                     bg-white text-neutral-800 placeholder:text-neutral-350
                     focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10
                     transition-all"
        />
      </div>
    </label>
  )
}

export function LiveVideoBooking() {
  const [form, setForm]     = useState<FormValues>(INIT)
  const [status, setStatus] = useState<Status>('idle')
  const [errMsg, setErrMsg] = useState('')

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  function set(key: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    try {
      const res = await fetch('/api/live-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('api_error')
      setStatus('success')
      setForm(INIT)
    } catch {
      /* Backend not available — fall back to WhatsApp */
      window.open(buildWhatsAppFallback(form), '_blank', 'noopener,noreferrer')
      setStatus('success')
      setForm(INIT)
    }
  }

  if (status === 'success') {
    return (
      <section className="bg-[var(--color-ink)] text-white">
        <div className="page-container py-16 sm:py-20 flex flex-col items-center text-center gap-5">
          <div className="h-16 w-16 rounded-full bg-[#25D366]/15 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-[#25D366]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold font-[var(--font-display)]">
            Booking Requested!
          </h2>
          <p className="text-white/60 max-w-sm text-sm leading-relaxed">
            We&apos;ll reach out to confirm your live shopping session within a few hours.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-gold)]
                       border-b border-[var(--color-gold)]/30 pb-0.5 hover:border-[var(--color-gold)]
                       transition-colors"
          >
            Book another session
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[var(--color-ink)] text-white">
      <div className="page-container py-14 sm:py-20">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <div className="h-14 w-14 rounded-2xl bg-brand/20 flex items-center justify-center mb-5">
              <Video className="h-6 w-6 text-brand" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-gold)] mb-3">
              Exclusive Service
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold font-[var(--font-display)] mb-4">
              Book a Live Video Shopping Session
            </h2>
            <p className="text-white/55 text-sm sm:text-base leading-relaxed max-w-md">
              Shop from home with a personal stylist. See sarees and jewellery live on video,
              get expert advice, and order at your convenience.
            </p>
          </div>

          {/* Perks row */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { icon: '🎥', label: 'HD Video Call' },
              { icon: '💬', label: 'Personal Stylist' },
              { icon: '🛍️', label: 'Exclusive Deals' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2 rounded-xl
                           border border-white/10 bg-white/[0.04] py-4 px-2"
              >
                <span className="text-2xl leading-none">{icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="Your Name"
                icon={User}
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={set('name')}
                required
                minLength={2}
              />
              <InputField
                label="Phone Number"
                icon={Phone}
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={set('phone')}
                required
                pattern="[0-9+\-\s()]{7,15}"
              />
            </div>

            <InputField
              label="Preferred Date"
              icon={Calendar}
              type="date"
              value={form.date}
              onChange={set('date')}
              min={minDateStr}
              required
            />

            {/* Time slot select */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Preferred Time
              </span>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                <select
                  value={form.time}
                  onChange={set('time')}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-neutral-200 text-sm
                             bg-white text-neutral-800 appearance-none
                             focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10
                             transition-all"
                >
                  <option value="" disabled>Select a time slot</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </label>

            {errMsg && (
              <p className="text-red-400 text-xs text-center">{errMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2.5 mt-2
                         bg-brand hover:bg-brand/90 disabled:opacity-60
                         text-white font-semibold text-[11px] uppercase tracking-[0.18em]
                         py-4 rounded-xl shadow-lg shadow-brand/25
                         transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Requesting…
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Request Live Video Call
                </>
              )}
            </button>

            <p className="text-[10px] text-white/25 text-center leading-relaxed">
              Our team will confirm your session via WhatsApp or phone call.
              Available Mon–Sat, 10 AM–6 PM IST.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
