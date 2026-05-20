import {
  Seller,
  SUBSCRIPTION_PRICES,
  SubscriptionPlan,
} from '@/types'
import { ApiError, delay } from './_client'
import { getSellerById, updateUserProfile } from './users'

export interface PlanFeatures {
  id: SubscriptionPlan
  name: string
  priceUsd: number
  heroAppearances: number | null
  featuredOnHome: boolean
  prioritaryFeatured: boolean
  additionalAdSlots: boolean
  premiumLabel: boolean
  carouselMaxImages: number | null
  aboutBlock: boolean
  publicationStats: boolean
  highlights: string[]
}

const PLAN_CATALOG: Record<SubscriptionPlan, PlanFeatures> = {
  none: {
    id: 'none',
    name: 'Sin suscripción',
    priceUsd: 0,
    heroAppearances: 0,
    featuredOnHome: false,
    prioritaryFeatured: false,
    additionalAdSlots: false,
    premiumLabel: false,
    carouselMaxImages: null,
    aboutBlock: false,
    publicationStats: false,
    highlights: [
      'Perfil público básico (logo, portada, nombre, descripción)',
      'Publicaciones activas visibles',
    ],
  },
  semilla: {
    id: 'semilla',
    name: 'Plan Semilla',
    priceUsd: SUBSCRIPTION_PRICES.semilla,
    heroAppearances: 1,
    featuredOnHome: false,
    prioritaryFeatured: false,
    additionalAdSlots: false,
    premiumLabel: false,
    carouselMaxImages: null,
    aboutBlock: false,
    publicationStats: false,
    highlights: [
      '1 aparición en hero banner por mes',
      'Badge de vendedor verificado',
    ],
  },
  cosecha: {
    id: 'cosecha',
    name: 'Plan Cosecha',
    priceUsd: SUBSCRIPTION_PRICES.cosecha,
    heroAppearances: 3,
    featuredOnHome: true,
    prioritaryFeatured: false,
    additionalAdSlots: false,
    premiumLabel: false,
    carouselMaxImages: 5,
    aboutBlock: false,
    publicationStats: false,
    highlights: [
      '3 apariciones en hero banner por mes',
      'Aparición en Vendedores destacados',
      'Carrusel de hasta 5 imágenes adicionales en el perfil',
    ],
  },
  exportacion: {
    id: 'exportacion',
    name: 'Plan Exportación',
    priceUsd: SUBSCRIPTION_PRICES.exportacion,
    heroAppearances: 7,
    featuredOnHome: true,
    prioritaryFeatured: true,
    additionalAdSlots: true,
    premiumLabel: true,
    carouselMaxImages: 10,
    aboutBlock: true,
    publicationStats: true,
    highlights: [
      '7 apariciones en hero banner por mes',
      'Aparición prioritaria en Vendedores destacados',
      'Espacios publicitarios adicionales en catálogo',
      'Etiqueta de plan premium en el perfil',
      'Carrusel de hasta 10 imágenes',
      'Bloque “Sobre nosotros” editable',
      'Estadísticas de visitas a publicaciones',
    ],
  },
}

export async function listPlans(): Promise<PlanFeatures[]> {
  await delay(120)
  return [PLAN_CATALOG.semilla, PLAN_CATALOG.cosecha, PLAN_CATALOG.exportacion]
}

export async function getPlanFeatures(
  plan: SubscriptionPlan
): Promise<PlanFeatures> {
  await delay(80)
  return PLAN_CATALOG[plan]
}

export async function getSellerSubscription(
  sellerId: string
): Promise<{ plan: PlanFeatures; expiresAt?: string }> {
  const seller = await getSellerById(sellerId)
  if (!seller) throw new ApiError('Vendedor no encontrado', 404)
  return {
    plan: PLAN_CATALOG[seller.subscriptionPlan],
    expiresAt: seller.subscriptionExpiry,
  }
}

function plusOneMonth(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}

export async function subscribe(
  sellerId: string,
  plan: SubscriptionPlan
): Promise<Seller> {
  await delay(500)
  const updated = await updateUserProfile(sellerId, {
    subscriptionPlan: plan,
    subscriptionExpiry: plan === 'none' ? undefined : plusOneMonth(),
  } as Partial<Seller>)
  return updated as Seller
}

export async function cancelSubscription(sellerId: string): Promise<Seller> {
  return subscribe(sellerId, 'none')
}
