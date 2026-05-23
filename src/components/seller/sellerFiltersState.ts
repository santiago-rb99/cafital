import { PublicationCategory } from '@/types'
import { CERTIFICATION_OPTIONS } from '@/data/schemas/dynamicFilters'

/**
 * Estado de filtros para la página /vendedores. URL como source of truth,
 * mismo patrón que catalogFiltersState.
 */

export type SellerSort = 'featured' | 'alphabetic' | 'mostPublications'

export interface SellerFiltersState {
  category: PublicationCategory | null
  department: string | null
  /** Slugs de certificaciones (kebab-case) que reutilizamos del catálogo. */
  certifications: string[]
  verifiedOnly: boolean
  q: string
  sort: SellerSort
}

export const SORT_OPTIONS: { value: SellerSort; label: string }[] = [
  { value: 'featured', label: 'Destacados' },
  { value: 'alphabetic', label: 'Alfabético (A–Z)' },
  { value: 'mostPublications', label: 'Más publicaciones' },
]

const VALID_SORTS: SellerSort[] = ['featured', 'alphabetic', 'mostPublications']
const VALID_CATEGORIES: PublicationCategory[] = ['A', 'B', 'C', 'D']

type ParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>

function getOne(params: ParamsLike, key: string): string | null {
  if (params instanceof URLSearchParams) return params.get(key)
  const v = params[key]
  if (Array.isArray(v)) return v[0] ?? null
  return v ?? null
}

function getAll(params: ParamsLike, key: string): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key)
  const v = params[key]
  if (Array.isArray(v)) return v
  if (typeof v === 'string') return v.split(',').filter(Boolean)
  return []
}

export function parseSellerFilters(params: ParamsLike): SellerFiltersState {
  const rawCat = getOne(params, 'cat')
  const category =
    rawCat && (VALID_CATEGORIES as string[]).includes(rawCat)
      ? (rawCat as PublicationCategory)
      : null

  const rawSort = getOne(params, 'sort')
  const sort: SellerSort =
    rawSort && (VALID_SORTS as string[]).includes(rawSort)
      ? (rawSort as SellerSort)
      : 'featured'

  const certs = getAll(params, 'cert').filter((slug) =>
    CERTIFICATION_OPTIONS.some((o) => o.value === slug)
  )

  return {
    category,
    department: (getOne(params, 'dept') ?? '').trim() || null,
    certifications: certs,
    verifiedOnly: getOne(params, 'verified') === '1',
    q: (getOne(params, 'q') ?? '').trim(),
    sort,
  }
}

export function buildSellerSearchParams(
  state: Partial<SellerFiltersState>
): URLSearchParams {
  const out = new URLSearchParams()
  if (state.category) out.set('cat', state.category)
  if (state.department) out.set('dept', state.department)
  if (state.certifications && state.certifications.length > 0) {
    for (const slug of state.certifications) out.append('cert', slug)
  }
  if (state.verifiedOnly) out.set('verified', '1')
  if (state.q) out.set('q', state.q)
  if (state.sort && state.sort !== 'featured') out.set('sort', state.sort)
  return out
}

export function countActiveSellerFilters(state: SellerFiltersState): number {
  let n = 0
  if (state.category) n++
  if (state.department) n++
  n += state.certifications.length
  if (state.verifiedOnly) n++
  if (state.q) n++
  return n
}
