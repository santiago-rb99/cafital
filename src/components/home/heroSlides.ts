import { CafeEvent, Seller } from '@/types'
import type { HeroSellerSlide } from './HeroBanner'
import type { HeroEventSlide } from './EventsHeroBanner'

const PLAN_PRIORITY: Record<Seller['subscriptionPlan'], number> = {
  exportacion: 3,
  cosecha: 2,
  semilla: 1,
  none: 0,
}

/**
 * Construye la lista de slides del hero de vendedores. Toma los vendedores
 * con plan activo, prioriza por tier y devuelve hasta `limit` slides listos
 * para alimentar a `HeroBanner`. Si el vendedor no tiene `heroImage` propia
 * cae al `banner`.
 */
export function buildSellerHeroSlides(
  sellers: Seller[],
  limit = 4,
): HeroSellerSlide[] {
  return sellers
    .filter((s) => s.subscriptionPlan !== 'none')
    .sort(
      (a, b) =>
        PLAN_PRIORITY[b.subscriptionPlan] - PLAN_PRIORITY[a.subscriptionPlan],
    )
    .slice(0, limit)
    .map((seller) => ({
      seller,
      image:
        seller.heroImage ??
        seller.banner ??
        '/images/eventos/expo-cafe-hero.jpg',
      copy:
        seller.heroCopy ??
        seller.description ??
        `Conoce a ${seller.businessName} en Cafital.`,
    }))
}

/**
 * Construye la lista de slides del hero de eventos. Prioriza:
 *  1) Eventos cuyo organizador tiene plan Cosecha/Exportación
 *  2) Competencias y ferias
 *  3) Fecha más próxima como desempate
 */
export function buildEventHeroSlides(
  events: CafeEvent[],
  sellersById: Map<string, Seller>,
  limit = 4,
): HeroEventSlide[] {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = events.filter(
    (e) => e.date >= today && e.status === 'active',
  )

  return upcoming
    .map((event) => {
      const organizer = sellersById.get(event.organizerId)
      const planScore = organizer ? PLAN_PRIORITY[organizer.subscriptionPlan] : 0
      const typeBoost =
        event.type === 'feria' || event.type === 'competencia' ? 1 : 0
      const promotedBoost = organizer?.promotedEventId === event.id ? 1 : 0
      return {
        event,
        organizer,
        score: planScore * 10 + typeBoost * 5 + promotedBoost * 100,
      }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.event.date.localeCompare(b.event.date)
    })
    .slice(0, limit)
    .map(({ event, organizer }) => ({ event, organizer }))
}
