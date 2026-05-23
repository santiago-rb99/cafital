import {
  Publication,
  PublicationCategory,
  Seller,
  SubscriptionPlan,
} from '@/types'

/**
 * Utilidades para derivar atributos comerciales de un vendedor a partir
 * de sus publicaciones activas. Mantenemos la "categoría/certificación
 * que vende" como propiedad derivada — no la guardamos en Seller — para
 * que esté siempre alineada con la realidad de su catálogo.
 */

export const CATEGORY_LABEL: Record<PublicationCategory, string> = {
  A: 'Café e insumos',
  B: 'Maquinaria y equipo',
  C: 'Servicios profesionales',
  D: 'Terrenos y fincas',
}

export const CATEGORY_ORDER: PublicationCategory[] = ['A', 'B', 'C', 'D']

/** Set de categorías macro que tiene el seller con publicaciones activas. */
export function getSellerCategories(
  sellerId: string,
  pubs: Publication[]
): PublicationCategory[] {
  const set = new Set<PublicationCategory>()
  for (const p of pubs) {
    if (p.sellerId === sellerId && p.status === 'active') set.add(p.category)
  }
  return CATEGORY_ORDER.filter((c) => set.has(c))
}

/** Set de certificaciones distintas que ofrece el seller en sus pubs activas. */
export function getSellerCertifications(
  sellerId: string,
  pubs: Publication[]
): string[] {
  const set = new Set<string>()
  for (const p of pubs) {
    if (p.sellerId !== sellerId || p.status !== 'active') continue
    const raw = (p.attributes['Certificaciones'] ?? p.attributes['Certificación'])
    if (!raw) continue
    const list = Array.isArray(raw) ? raw : [raw]
    for (const v of list) {
      if (v && v !== 'Sin certificación') set.add(v)
    }
  }
  return [...set].sort()
}

/** Conteo de publicaciones activas del vendedor. */
export function countActivePubsBySeller(
  sellerId: string,
  pubs: Publication[]
): number {
  let n = 0
  for (const p of pubs) {
    if (p.sellerId === sellerId && p.status === 'active') n++
  }
  return n
}

/** Index pre-computado: sellerId → {categories, certifications, activeCount} */
export interface SellerCommercialIndex {
  categories: PublicationCategory[]
  certifications: string[]
  activeCount: number
}

export function buildSellerIndex(
  sellers: Seller[],
  pubs: Publication[]
): Map<string, SellerCommercialIndex> {
  const byId = new Map<string, SellerCommercialIndex>()
  for (const s of sellers) {
    byId.set(s.id, {
      categories: [],
      certifications: [],
      activeCount: 0,
    })
  }
  for (const p of pubs) {
    if (p.status !== 'active') continue
    const entry = byId.get(p.sellerId)
    if (!entry) continue
    entry.activeCount += 1
    if (!entry.categories.includes(p.category)) entry.categories.push(p.category)
    const raw = p.attributes['Certificaciones'] ?? p.attributes['Certificación']
    if (raw) {
      const list = Array.isArray(raw) ? raw : [raw]
      for (const v of list) {
        if (v && v !== 'Sin certificación' && !entry.certifications.includes(v)) {
          entry.certifications.push(v)
        }
      }
    }
  }
  // Normalizar orden de categorías por orden canónico
  for (const entry of byId.values()) {
    entry.categories = CATEGORY_ORDER.filter((c) => entry.categories.includes(c))
    entry.certifications.sort()
  }
  return byId
}

/* ─── Orden por plan ─────────────────────────────────────────── */

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  exportacion: 0,
  cosecha: 1,
  semilla: 2,
  none: 3,
}

/** Ordena sellers por plan descendente; empate alfabético por businessName. */
export function sortSellersByPlan(sellers: Seller[]): Seller[] {
  return [...sellers].sort((a, b) => {
    const rank = PLAN_RANK[a.subscriptionPlan] - PLAN_RANK[b.subscriptionPlan]
    if (rank !== 0) return rank
    return a.businessName.localeCompare(b.businessName, 'es')
  })
}

/** Devuelve sólo sellers destacados (planes Cosecha y Exportación). */
export function pickFeaturedSellers(sellers: Seller[]): Seller[] {
  return sortSellersByPlan(
    sellers.filter(
      (s) =>
        s.subscriptionPlan === 'exportacion' ||
        s.subscriptionPlan === 'cosecha'
    )
  )
}

/* ─── Opciones de filtro ─────────────────────────────────────── */

/** Slugs de certificaciones para la URL. Reusa los del catálogo. */
export const CERTIFICATION_SLUG_TO_LABEL: Record<string, string> = {
  organico: 'Orgánico',
  'fair-trade': 'Fair Trade',
  rainforest: 'Rainforest Alliance',
}

export const CERTIFICATION_LABEL_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CERTIFICATION_SLUG_TO_LABEL).map(([slug, label]) => [label, slug])
)
