import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Seller, SubscriptionPlan } from '@/types'

export function isSellerVerified(seller: Pick<Seller, 'verificationStatus'>): boolean {
  return seller.verificationStatus === 'approved'
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: 'Bs.' | 'USD' = 'Bs.'): string {
  return `${currency} ${price.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string, time: string): string {
  const date = formatDate(dateStr)
  return `${date} · ${time}`
}

export function subscriptionLabel(plan: SubscriptionPlan): string {
  const labels: Record<SubscriptionPlan, string> = {
    none: 'Sin suscripción',
    semilla: 'Plan Semilla',
    cosecha: 'Plan Cosecha',
    exportacion: 'Plan Exportación',
  }
  return labels[plan]
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const DEPARTMENTS = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando',
]

export const COFFEE_ZONES = [
  'Caranavi',
  'Nor Yungas',
  'Sud Yungas',
  'Chapare',
  'Franz Tamayo',
  'Inquisivi',
  'Santa Cruz',
  'Cochabamba',
  'Tarija',
]
