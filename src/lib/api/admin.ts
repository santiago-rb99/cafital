import { Buyer, Publication, Seller, SUBSCRIPTION_PRICES, SubscriptionPlan, User } from '@/types'
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
      } as T
    }
    return { ...u, suspended: override.suspended ?? u.suspended }
  })
}

/* ─── Stats globales ────────────────────────────────────────── */

export interface AdminStats {
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
}

export async function getAdminStats(): Promise<AdminStats> {
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
