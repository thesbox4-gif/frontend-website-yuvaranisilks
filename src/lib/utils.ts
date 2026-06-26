import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function discountedPrice(base: number, pct: number) {
  return Math.round(base * (1 - pct / 100))
}

/** Default window for the New Arrivals section (days). */
export const NEW_ARRIVALS_DAYS = 30

/** Returns true when a product was created within the last `days` days. */
export function isNewProduct(createdAt: string, days = NEW_ARRIVALS_DAYS): boolean {
  if (!createdAt) return false
  return new Date(createdAt).getTime() >= Date.now() - days * 86_400_000
}
