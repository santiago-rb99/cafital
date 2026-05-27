import { Buyer, Publication, Seller, SUBSCRIPTION_PRICES, SubscriptionPlan, User, VerificationStatus } from '@/types'
import { delay, loadOverrides } from './_client'
import { updateUserProfile } from './users'
import {
  deletePublication as deletePublicationApi,
  updatePublication,
} from './publications'
import { deleteEvent as deleteEventApi } from './events'
import { cancelSubscription as cancelSubscriptionApi } from './subscriptions'
import { mockBuyers, mockSellers } from '@/data/mock/users'
import { mockPublications } from '@/data/mock/publications'
import { mockEvents } from '@/data/mock/events'
import { mockOrders } from '@/data/mock/orders'

const USERS_OVERRIDES_KEY = 'cafital_users_overrides'

/**
 * Lectura canónica para el panel admin: parte de los mocks (fuente de verdad)
 * y aplica solo overlays seguros del store de localStorage (estado `suspended`
 * y, para vendedores, `subscriptionPlan` / `subscriptionExpiry`). Así, una
 * mutación previa que cambió el rol o eliminó al usuario no oculta a nadie
 * del panel.
 */
function withOverlays<T extends User>(
  base: T[],
  expectedRole: T['role']
): T[] {
  const slice = loadOverrides<User>(USERS_OVERRIDES_KEY)
  return base.map((u) => {
    const override = slice.updates[u.id]
    if (!override || override.role !== expectedRole) return u
    if (expectedRole === 'seller') {
      const o = override as Seller
      return {
        ...u,
        suspended: o.suspended ?? u.suspended,
        subscriptionPlan: o.subscriptionPlan ?? (u as unknown as Seller).subscriptionPlan,
        subscriptionExpiry: o.subscriptionExpiry ?? (u as unknown as Seller).subscriptionExpiry,
        adAppearancesUsed: o.adAppearancesUsed ?? (u as unknown as Seller).adAppearancesUsed,
        verificationStatus: o.verificationStatus ?? (u as unknown as Seller).verificationStatus,
        verificationReviewedAt: o.verificationReviewedAt ?? (u as unknown as Seller).verificationReviewedAt,
        verificationRejectionReason: o.verificationRejectionReason ?? (u as unknown as Seller).verificationRejectionReason,
        verificationDocs: o.verificationDocs ?? (u as unknown as Seller).verificationDocs,
        verificationSubmittedAt: o.verificationSubmittedAt ?? (u as unknown as Seller).verificationSubmittedAt,
      } as T
    }
    return { ...u, suspended: override.suspended ?? u.suspended }
  })
}

/* ─── Stats globales ────────────────────────────────────────── */

export type AdminPeriodKey = '7d' | '30d' | '90d' | 'mtd'

export const ADMIN_PERIOD_LABEL: Record<AdminPeriodKey, string> = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
  mtd: 'Este mes',
}

const ADMIN_PERIOD_SHORT: Record<AdminPeriodKey, string> = {
  '7d': '7 días',
  '30d': '30 días',
  '90d': '90 días',
  mtd: 'Este mes',
}

export function adminPeriodShort(key: AdminPeriodKey): string {
  return ADMIN_PERIOD_SHORT[key]
}

/**
 * Devuelve el rango [start, end) (ISO) para el período actual y el
 * período anterior de la misma duración. Para `mtd` el período anterior
 * es el mes calendario previo.
 */
export function getAdminPeriodRanges(
  key: AdminPeriodKey,
  now: Date = new Date()
): { currentStart: Date; currentEnd: Date; previousStart: Date; previousEnd: Date } {
  const currentEnd = now
  if (key === 'mtd') {
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousEnd = currentStart
    return { currentStart, currentEnd, previousStart, previousEnd }
  }
  const days = key === '7d' ? 7 : key === '30d' ? 30 : 90
  const currentStart = new Date(now)
  currentStart.setDate(now.getDate() - days)
  const previousEnd = currentStart
  const previousStart = new Date(currentStart)
  previousStart.setDate(currentStart.getDate() - days)
  return { currentStart, currentEnd, previousStart, previousEnd }
}

/** Variación porcentual o null si el período anterior fue 0 y el actual no. */
function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0
    return null
  }
  return Math.round(((current - previous) / previous) * 100)
}

export interface FunnelSnapshot {
  views: number
  contacts: number
  orders: number
}

export interface PeriodMetrics {
  gmv: number
  transactionsCompleted: number
  funnel: FunnelSnapshot
}

export interface AdminStats {
  // Resumen estructural (no depende del período)
  activeBuyers: number
  suspendedBuyers: number
  activeSellers: number
  suspendedSellers: number
  activePublications: number
  totalEvents: number
  totalOrders: number
  monthlyRevenueUsd: number
  subscriptionsByPlan: Record<Exclude<SubscriptionPlan, 'none'>, number>
  recentPublications: Publication[]
  pendingVerifications: number

  // Métricas de negocio del período seleccionado
  period: AdminPeriodKey
  periodLabel: string
  current: PeriodMetrics
  previous: PeriodMetrics
  /** Cambios % vs período anterior. `null` si no se puede calcular. */
  delta: {
    gmv: number | null
    transactionsCompleted: number | null
    views: number | null
    contacts: number | null
    orders: number | null
    subscriptionRevenue: number | null
  }
}

/**
 * Aproxima los contactos vía WhatsApp si no hay seed explícito en la
 * publicación. ~12 % de las vistas, redondeado hacia abajo.
 */
function approxContacts(p: Publication): number {
  if (typeof p.whatsappContactCount === 'number') return p.whatsappContactCount
  return Math.floor((p.views ?? 0) * 0.12)
}

/**
 * Reparte una métrica acumulada (vistas, contactos) proporcionalmente al
 * solape entre la vida útil de la publicación y el período consultado.
 * Si la publicación es más nueva que el período, devuelve el total.
 */
function shareInPeriod(
  total: number,
  publicationCreatedAtIso: string,
  rangeStart: Date,
  rangeEnd: Date,
  referenceNow: Date
): number {
  if (total <= 0) return 0
  const createdAt = new Date(publicationCreatedAtIso)
  const lifetimeMs = Math.max(referenceNow.getTime() - createdAt.getTime(), 1)
  const overlapStart = Math.max(createdAt.getTime(), rangeStart.getTime())
  const overlapEnd = Math.min(referenceNow.getTime(), rangeEnd.getTime())
  const overlapMs = Math.max(overlapEnd - overlapStart, 0)
  if (overlapMs <= 0) return 0
  return Math.round((total * overlapMs) / lifetimeMs)
}

function metricsForRange(
  rangeStart: Date,
  rangeEnd: Date,
  now: Date
): PeriodMetrics {
  const startIso = rangeStart.toISOString()
  const endIso = rangeEnd.toISOString()

  const ordersInRange = mockOrders.filter(
    (o) => o.createdAt >= startIso && o.createdAt < endIso
  )
  const gmv = ordersInRange
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0)
  const transactionsCompleted = ordersInRange.filter(
    (o) => o.status === 'completed'
  ).length

  let views = 0
  let contacts = 0
  for (const p of mockPublications) {
    views += shareInPeriod(p.views ?? 0, p.createdAt, rangeStart, rangeEnd, now)
    contacts += shareInPeriod(
      approxContacts(p),
      p.createdAt,
      rangeStart,
      rangeEnd,
      now
    )
  }

  return {
    gmv,
    transactionsCompleted,
    funnel: {
      views,
      contacts,
      orders: ordersInRange.length,
    },
  }
}

export async function getAdminStats(
  period: AdminPeriodKey = '30d'
): Promise<AdminStats> {
  await delay()
  const buyers = withOverlays<Buyer>(mockBuyers, 'buyer')
  const sellers = withOverlays<Seller>(mockSellers, 'seller')

  const activeBuyers = buyers.filter((b) => !b.suspended).length
  const suspendedBuyers = buyers.length - activeBuyers
  const activeSellers = sellers.filter((s) => !s.suspended).length
  const suspendedSellers = sellers.length - activeSellers

  const activePublications = mockPublications.filter((p) => p.status === 'active').length
  const totalEvents = mockEvents.length
  const totalOrders = mockOrders.length

  const subscriptionsByPlan: AdminStats['subscriptionsByPlan'] = {
    semilla: 0,
    cosecha: 0,
    exportacion: 0,
  }
  let monthlyRevenueUsd = 0
  for (const s of sellers) {
    if (s.subscriptionPlan !== 'none') {
      subscriptionsByPlan[s.subscriptionPlan] += 1
      monthlyRevenueUsd += SUBSCRIPTION_PRICES[s.subscriptionPlan]
    }
  }

  const recentPublications = [...mockPublications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const pendingVerifications = sellers.filter(
    (s) => s.verificationStatus === 'pending'
  ).length

  // Métricas dependientes del período
  const now = new Date()
  const ranges = getAdminPeriodRanges(period, now)
  const current = metricsForRange(ranges.currentStart, ranges.currentEnd, now)
  const previous = metricsForRange(ranges.previousStart, ranges.previousEnd, now)

  // Ingreso por suscripciones del período anterior: aproximamos asumiendo
  // que los planes vigentes ya lo estaban (el mock no guarda historia).
  // Para `mtd` comparamos contra el mismo monto del mes pasado.
  const previousSubscriptionRevenue = monthlyRevenueUsd

  return {
    activeBuyers,
    suspendedBuyers,
    activeSellers,
    suspendedSellers,
    activePublications,
    totalEvents,
    totalOrders,
    monthlyRevenueUsd,
    subscriptionsByPlan,
    recentPublications,
    pendingVerifications,
    period,
    periodLabel: ADMIN_PERIOD_LABEL[period],
    current,
    previous,
    delta: {
      gmv: deltaPercent(current.gmv, previous.gmv),
      transactionsCompleted: deltaPercent(
        current.transactionsCompleted,
        previous.transactionsCompleted
      ),
      views: deltaPercent(current.funnel.views, previous.funnel.views),
      contacts: deltaPercent(
        current.funnel.contacts,
        previous.funnel.contacts
      ),
      orders: deltaPercent(current.funnel.orders, previous.funnel.orders),
      subscriptionRevenue: deltaPercent(
        monthlyRevenueUsd,
        previousSubscriptionRevenue
      ),
    },
  }
}

/* ─── Moderación de usuarios ───────────────────────────────── */

export async function setUserSuspension(
  userId: string,
  suspended: boolean
): Promise<void> {
  await updateUserProfile(userId, { suspended })
}

/* ─── Moderación de publicaciones ──────────────────────────── */

export async function setPublicationFeatured(
  publicationId: string,
  featured: boolean
): Promise<Publication> {
  return updatePublication(publicationId, { featured })
}

export async function deletePublication(publicationId: string): Promise<void> {
  await deletePublicationApi(publicationId)
}

/* ─── Moderación de eventos ────────────────────────────────── */

export async function deleteEvent(eventId: string): Promise<void> {
  await deleteEventApi(eventId)
}

/* ─── Suscripciones ────────────────────────────────────────── */

export async function cancelSubscription(sellerId: string): Promise<Seller> {
  return cancelSubscriptionApi(sellerId)
}

/* ─── Helpers de listado ───────────────────────────────────── */

export async function listAllBuyers(): Promise<Buyer[]> {
  await delay()
  return withOverlays<Buyer>(mockBuyers, 'buyer')
}

export async function listAllSellers(): Promise<Seller[]> {
  await delay()
  return withOverlays<Seller>(mockSellers, 'seller')
}

/* ─── Verificación de vendedores ───────────────────────────── */

export async function listSellersByVerification(
  status: VerificationStatus
): Promise<Seller[]> {
  await delay()
  return withOverlays<Seller>(mockSellers, 'seller').filter(
    (s) => (s.verificationStatus ?? 'pending') === status
  )
}

export async function approveSeller(sellerId: string): Promise<Seller> {
  const patch: Partial<Seller> = {
    verificationStatus: 'approved',
    verificationReviewedAt: new Date().toISOString(),
    verificationRejectionReason: undefined,
  }
  const updated = await updateUserProfile(sellerId, patch)
  if (updated.role !== 'seller') {
    throw new Error('El usuario no es vendedor')
  }
  return updated
}

export async function rejectSeller(
  sellerId: string,
  reason: string
): Promise<Seller> {
  const trimmed = reason.trim()
  if (!trimmed) throw new Error('El motivo de rechazo es obligatorio')
  const patch: Partial<Seller> = {
    verificationStatus: 'rejected',
    verificationReviewedAt: new Date().toISOString(),
    verificationRejectionReason: trimmed,
  }
  const updated = await updateUserProfile(sellerId, patch)
  if (updated.role !== 'seller') {
    throw new Error('El usuario no es vendedor')
  }
  return updated
}
