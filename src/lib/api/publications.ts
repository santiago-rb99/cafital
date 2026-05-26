import {
  Publication,
  PublicationCategory,
  PublicationStatus,
} from '@/types'
import { mockPublications } from '@/data/mock/publications'
import {
  ApiError,
  delay,
  generateApiId,
  makeStore,
} from './_client'

const store = makeStore<Publication>('cafital_publications_overrides')

function all(): Publication[] {
  return store.read(mockPublications)
}

export interface PublicationFilters {
  category?: PublicationCategory
  subcategory?: string
  /** Multi-select de subcategorías (preferido). Si está presente, ignora `category` y `subcategory`. */
  subcategories?: string[]
  sellerId?: string
  status?: PublicationStatus
  q?: string
  department?: string
  certifications?: string[]
  minPrice?: number
  maxPrice?: number
  /**
   * Filtros adicionales por atributo del esquema dinámico de la subcategoría.
   * Clave: nombre exacto del atributo (`'Proceso de beneficiado'`).
   * Valor: lista de valores aceptados — el match es OR dentro del atributo.
   */
  attributes?: Record<string, string[]>
}

export interface ListPublicationsOptions {
  filters?: PublicationFilters
  sort?: 'recent' | 'priceAsc' | 'priceDesc' | 'popular'
}

function matchesFilters(pub: Publication, f: PublicationFilters): boolean {
  if (f.subcategories && f.subcategories.length > 0) {
    if (!f.subcategories.includes(pub.subcategory)) return false
  } else {
    if (f.category && pub.category !== f.category) return false
    if (f.subcategory && pub.subcategory !== f.subcategory) return false
  }
  if (f.sellerId && pub.sellerId !== f.sellerId) return false
  if (f.status && pub.status !== f.status) return false
  if (f.department && !pub.coverage.includes(f.department) && !pub.coverage.includes('Todo Bolivia')) {
    return false
  }
  if (f.certifications && f.certifications.length > 0) {
    const certs = (pub.attributes['Certificaciones'] ?? pub.attributes['Certificación'] ?? []) as string[]
    const certList = Array.isArray(certs) ? certs : [certs]
    if (!f.certifications.some((c) => certList.includes(c))) return false
  }
  if (f.q) {
    const needle = f.q.toLowerCase()
    const hay = `${pub.title} ${pub.description}`.toLowerCase()
    if (!hay.includes(needle)) return false
  }
  if (f.attributes) {
    for (const [attrKey, accepted] of Object.entries(f.attributes)) {
      if (accepted.length === 0) continue
      const raw = pub.attributes[attrKey]
      if (raw === undefined) return false
      const haveList = Array.isArray(raw) ? raw : [raw]
      if (!accepted.some((v) => haveList.includes(v))) return false
    }
  }
  const lowestPrice = pub.units?.reduce(
    (min, u) => Math.min(min, u.price),
    Number.POSITIVE_INFINITY
  )
  if (typeof lowestPrice === 'number' && Number.isFinite(lowestPrice)) {
    if (f.minPrice && lowestPrice < f.minPrice) return false
    if (f.maxPrice && lowestPrice > f.maxPrice) return false
  }
  return true
}

function sortBy(list: Publication[], sort: ListPublicationsOptions['sort']): Publication[] {
  const copy = [...list]
  switch (sort) {
    case 'priceAsc':
      return copy.sort((a, b) => (lowestPrice(a) ?? Infinity) - (lowestPrice(b) ?? Infinity))
    case 'priceDesc':
      return copy.sort((a, b) => (lowestPrice(b) ?? -1) - (lowestPrice(a) ?? -1))
    case 'popular':
      return copy.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    case 'recent':
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}

function lowestPrice(p: Publication): number | null {
  if (!p.units?.length) return null
  return p.units.reduce((m, u) => Math.min(m, u.price), Number.POSITIVE_INFINITY)
}

export async function listPublications(
  options: ListPublicationsOptions = {}
): Promise<Publication[]> {
  await delay()
  const { filters = {}, sort = 'recent' } = options
  const baseFilter: PublicationFilters = { status: filters.status ?? 'active', ...filters }
  const filtered = all().filter((p) => matchesFilters(p, baseFilter))
  return sortBy(filtered, sort)
}

export async function getPublication(id: string): Promise<Publication | null> {
  await delay()
  return all().find((p) => p.id === id) ?? null
}

export async function listPublicationsBySeller(
  sellerId: string,
  options: { includeAllStatuses?: boolean } = {}
): Promise<Publication[]> {
  await delay()
  const list = all().filter((p) => p.sellerId === sellerId)
  if (options.includeAllStatuses) return list
  return list.filter((p) => p.status === 'active')
}

export interface CreatePublicationInput
  extends Omit<Publication, 'id' | 'createdAt' | 'views' | 'status'> {
  status?: PublicationStatus
}

export async function createPublication(
  input: CreatePublicationInput
): Promise<Publication> {
  await delay()
  const publication: Publication = {
    ...input,
    id: generateApiId('pub'),
    createdAt: new Date().toISOString(),
    views: 0,
    status: input.status ?? 'active',
  }
  store.create(publication)
  return publication
}

export async function updatePublication(
  id: string,
  patch: Partial<Omit<Publication, 'id' | 'sellerId' | 'createdAt'>>
): Promise<Publication> {
  await delay()
  const current = all().find((p) => p.id === id)
  if (!current) throw new ApiError('Publicación no encontrada', 404)
  const updated: Publication = { ...current, ...patch }
  store.update(id, updated)
  return updated
}

export async function setPublicationStatus(
  id: string,
  status: PublicationStatus
): Promise<Publication> {
  return updatePublication(id, { status })
}

export async function deletePublication(id: string): Promise<void> {
  await delay()
  store.remove(id)
}

export async function incrementPublicationViews(id: string): Promise<void> {
  // Para estadísticas: aumenta views si el caller es plan Exportación.
  const current = all().find((p) => p.id === id)
  if (!current) return
  store.update(id, { ...current, views: (current.views ?? 0) + 1 })
}
