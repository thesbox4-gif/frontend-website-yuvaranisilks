'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/components/ui/Toaster'
import { cn } from '@/lib/utils'
import { BRAND } from '@/lib/brand'
import Image from 'next/image'

const ADMIN_ROLES = ['admin', 'staff', 'manager']

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function AdminLoginPage() {
  const router = useRouter()
  const { setAuth, user, hasHydrated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Already authenticated admin → redirect to dashboard
  useEffect(() => {
    if (hasHydrated && user && ADMIN_ROLES.includes(user.role)) {
      router.replace('/admin')
    }
  }, [hasHydrated, user, router])

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await api.post<{
        token: string
        refreshToken: string
        user: { id: string; name: string; email: string; role: string }
      }>('/api/auth/login', data)

      if (!ADMIN_ROLES.includes(res.user.role)) {
        toast({
          title: 'Access denied',
          description: 'This portal is for admin and staff only.',
          variant: 'destructive',
        })
        return
      }
      setAuth(res.token, res.refreshToken, res.user)
      toast({ title: `Welcome, ${res.user.name.split(' ')[0]}!` })
      router.push('/admin')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      toast({ title: 'Login failed', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-colors bg-white',
      hasError
        ? 'border-red-400 focus:ring-red-200'
        : 'border-neutral-200 focus:ring-brand/15 focus:border-brand'
    )

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src={BRAND.logoPath}
            alt={BRAND.name}
            width={160}
            height={40}
            className="h-10 w-auto object-contain mx-auto"
          />
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-neutral-500">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Admin Portal
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-ink mb-6">Sign in to Dashboard</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="admin@example.com" autoComplete="email" className={inputClass(!!errors.email)} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(inputClass(!!errors.password), 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-brand hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
