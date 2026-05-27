import { Seller, SubscriptionPlan } from '@/types'
import { ApiError, delay } from './_client'
import { getSellerById, updateUserProfile } from './users'
import { getEvent } from './events'

const HERO_APPEARANCES_BY_PLAN: Record<SubscriptionPlan, number> = {
  none: 0,
  semilla: 1,
  cosecha: 3,
  exportacion: 7,
}

const GALLERY_MAX_BY_PLAN: Record<SubscriptionPlan, number> = {
  none: 0,
  semilla: 0,
  cosecha: 5,
  exportacion: 10,
}

export interface AdvertisingState {
  sellerId: string
  plan: SubscriptionPlan
  heroImage?: string
  heroCopy?: string
  profileImages: string[]
  promotedEventId?: string
  adAppearancesUsed: number
  adAppearancesMax: number
  galleryMax: number
  periodStart: string
}

function periodStartOfCurrentMonth(): string {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString()
}

function readCounter(seller: Seller): { used: number; periodStart: string } {
  const currentStart = periodStartOfCurrentMonth()
  if (seller.adAppearancesPeriodStart === currentStart) {
    return {
      used: seller.adAppearancesUsed ?? 0,
      periodStart: currentStart,
    }
  }
  return { used: 0, periodStart: currentStart }
}

async function loadSeller(sellerId: string): Promise<Seller> {
  const seller = await getSellerById(sellerId)
  if (!seller) throw new ApiError('Vendedor no encontrado', 404)
  return seller
}

export async function getAdvertising(sellerId: string): Promise<AdvertisingState> {
  await delay()
  const seller = await loadSeller(sellerId)
  const counter = readCounter(seller)
  return {
    sellerId: seller.id,
    plan: seller.subscriptionPlan,
    heroImage: seller.heroImage,
    heroCopy: seller.heroCopy,
    profileImages: seller.profileImages ?? [],
    promotedEventId: seller.promotedEventId,
    adAppearancesUsed: counter.used,
    adAppearancesMax: HERO_APPEARANCES_BY_PLAN[seller.subscriptionPlan],
    galleryMax: GALLERY_MAX_BY_PLAN[seller.subscriptionPlan],
    periodStart: counter.periodStart,
  }
}

export interface UpdateHeroInput {
  heroImage?: string
  heroCopy?: string
}

export async function updateHero(
  sellerId: string,
  input: UpdateHeroInput,
): Promise<Seller> {
  const seller = await loadSeller(sellerId)
  if (seller.subscriptionPlan === 'none') {
    throw new ApiError('Tu plan no permite editar el hero promocional', 403)
  }
  if (input.heroCopy !== undefined && input.heroCopy.length > 140) {
    throw new ApiError('El copy no puede superar 140 caracteres', 400)
  }
  const updated = await updateUserProfile(sellerId, {
    heroImage: input.heroImage ?? seller.heroImage,
    heroCopy: input.heroCopy ?? seller.heroCopy,
  } as Partial<Seller>)
  return updated as Seller
}

export async function addProfileImage(
  sellerId: string,
  url: string,
): Promise<Seller> {
  const seller = await loadSeller(sellerId)
  const max = GALLERY_MAX_BY_PLAN[seller.subscriptionPlan]
  const current = seller.profileImages ?? []
  if (max === 0) {
    throw new ApiError('Tu plan no incluye galería adicional', 403)
  }
  if (current.length >= max) {
    throw new ApiError(`Tu plan permite hasta ${max} imágenes`, 409)
  }
  if (current.includes(url)) {
    throw new ApiError('Esa imagen ya está en la galería', 409)
  }
  const next = [...current, url]
  const updated = await updateUserProfile(sellerId, {
    profileImages: next,
  } as Partial<Seller>)
  return updated as Seller
}

export async function removeProfileImage(
  sellerId: string,
  url: string,
): Promise<Seller> {
  const seller = await loadSeller(sellerId)
  const next = (seller.profileImages ?? []).filter((img) => img !== url)
  const updated = await updateUserProfile(sellerId, {
    profileImages: next,
  } as Partial<Seller>)
  return updated as Seller
}

export async function reorderProfileImages(
  sellerId: string,
  urls: string[],
): Promise<Seller> {
  const seller = await loadSeller(sellerId)
  const current = seller.profileImages ?? []
  const sameSet =
    urls.length === current.length && urls.every((u) => current.includes(u))
  if (!sameSet) {
    throw new ApiError('El nuevo orden no coincide con la galería actual', 400)
  }
  const updated = await updateUserProfile(sellerId, {
    profileImages: urls,
  } as Partial<Seller>)
  return updated as Seller
}

export async function setPromotedEvent(
  sellerId: string,
  eventId: string | null,
): Promise<Seller> {
  const seller = await loadSeller(sellerId)
  if (seller.subscriptionPlan === 'none') {
    throw new ApiError('Tu plan no permite promocionar eventos', 403)
  }
  if (eventId) {
    const event = await getEvent(eventId)
    if (!event) throw new ApiError('Evento no encontrado', 404)
    if (event.organizerId !== sellerId) {
      throw new ApiError('Solo puedes promocionar tus propios eventos', 403)
    }
    if (event.status !== 'active') {
      throw new ApiError('Solo se pueden promocionar eventos activos', 409)
    }
  }
  const updated = await updateUserProfile(sellerId, {
    promotedEventId: eventId ?? undefined,
  } as Partial<Seller>)
  return updated as Seller
}

export interface UpdateAboutInput {
  mission?: string
  vision?: string
  history?: string
}

export async function updateAbout(
  sellerId: string,
  input: UpdateAboutInput,
): Promise<Seller> {
  const seller = await loadSeller(sellerId)
  if (seller.subscriptionPlan !== 'exportacion') {
    throw new ApiError(
      'El bloque "Sobre nosotros" está disponible solo en el plan Exportación',
      403,
    )
  }
  const next = {
    mission: input.mission ?? seller.about?.mission,
    vision: input.vision ?? seller.about?.vision,
    history: input.history ?? seller.about?.history,
  }
  const updated = await updateUserProfile(sellerId, {
    about: next,
  } as Partial<Seller>)
  return updated as Seller
}

export { HERO_APPEARANCES_BY_PLAN, GALLERY_MAX_BY_PLAN }
