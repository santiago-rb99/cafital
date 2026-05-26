/**
 * URL ↔ State para el catálogo. La URL es la fuente de verdad — este módulo
 * sólo provee tipos y helpers para parsear searchParams y reconstruirlos.
 *
 * Modelo de filtrado por categoría/subcategoría:
 * - El usuario marca subcategorías directamente (multi-select).
 * - La categoría se infiere de los IDs seleccionados (prefix `A-`, `B-`...).
 * - Si se selecciona exactamente UNA subcategoría, se muestran sus filtros
 *   dinámicos (proceso, variedad, etc.).
 */

import {
  CERTIFICATION_OPTIONS,
  DynamicFilter,
  getDynamicFiltersForSubcategory,
} from '@/data/schemas/dynamicFilters'

export type CatalogSort = 'recent' | 'priceAsc' | 'priceDesc' | 'popular'

export interface CatalogFiltersState {
  subcategories: string[]
  q: string
  department: string | null
  minPrice: number | null
  maxPrice: number | null
  certifications: string[]
  /** key del filtro dinámico → array de slugs seleccionados. */
  dynamic: Record<string, string[]>
  sort: CatalogSort
}

export const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'priceAsc', label: 'Precio: menor a mayor' },
  { value: 'priceDesc', label: 'Precio: mayor a menor' },
  { value: 'popular', label: 'Más vistos' },
]

const VALID_SORTS: CatalogSort[] = ['recent', 'priceAsc', 'priceDesc', 'popular']
const STATIC_KEYS = new Set([
  'subs',
  'q',
  'dept',
  'min',
  'max',
  'cert',
  'sort',
])

type ParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>

function getOne(params: ParamsLike, key: string): string | null {
  if (params instanceof URLSearchParams) return params.get(key)
  const v = params[key]
  if (Array.isArray(v)) return v[0] ?? null
  return v ?? null
}

function getList(params: ParamsLike, key: string): string[] {
  const raw = getOne(params, key)
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseInt0(value: string | null): number | null {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function parseCatalogFilters(params: ParamsLike): CatalogFiltersState {
  // Compat: aceptar `subs` (nuevo) o `subcategory` (legacy single)
  let subcategories = getList(params, 'subs')
  if (subcategories.length === 0) {
    const legacy = getOne(params, 'subcategory')
    if (legacy) subcategories = [legacy]
  }

  const rawSort = getOne(params, 'sort')
  const sort = (VALID_SORTS as string[]).includes(rawSort ?? '')
    ? (rawSort as CatalogSort)
    : 'recent'

  // Filtros dinámicos solo aplican cuando hay exactamente una subcategoría.
  const dynamicFilters =
    subcategories.length === 1
      ? getDynamicFiltersForSubcategory(subcategories[0])
      : []
  const dynamic: Record<string, string[]> = {}
  for (const f of dynamicFilters) {
    const values = getList(params, f.key)
    if (values.length > 0) dynamic[f.key] = values
  }

  return {
    subcategories,
    q: (getOne(params, 'q') ?? '').trim(),
    department: getOne(params, 'dept'),
    minPrice: parseInt0(getOne(params, 'min')),
    maxPrice: parseInt0(getOne(params, 'max')),
    certifications: getList(params, 'cert'),
    dynamic,
    sort,
  }
}

/** Serializa state → URLSearchParams (omite valores vacíos). */
export function buildCatalogSearchParams(
  state: Partial<CatalogFiltersState>
): URLSearchParams {
  const out = new URLSearchParams()
  if (state.subcategories && state.subcategories.length) {
    out.set('subs', state.subcategories.join(','))
  }
  if (state.q) out.set('q', state.q)
  if (state.department) out.set('dept', state.department)
  if (state.minPrice != null) out.set('min', String(state.minPrice))
  if (state.maxPrice != null) out.set('max', String(state.maxPrice))
  if (state.certifications && state.certifications.length)
    out.set('cert', state.certifications.join(','))
  if (state.sort && state.sort !== 'recent') out.set('sort', state.sort)
  if (state.dynamic) {
    for (const [k, values] of Object.entries(state.dynamic)) {
      if (values.length > 0) out.set(k, values.join(','))
    }
  }
  return out
}

/**
 * Convierte el state de la UI al shape que espera la API.
 * Hace el lookup de `match` exacto para certifications y filtros dinámicos.
 */
export function toApiFilters(
  state: CatalogFiltersState,
  dynamicFilters: DynamicFilter[]
) {
  const certifications = state.certifications
    .map((slug) => CERTIFICATION_OPTIONS.find((o) => o.value === slug)?.match)
    .filter((s): s is string => Boolean(s))

  const attributes: Record<string, string[]> = {}
  for (const f of dynamicFilters) {
    const slugs = state.dynamic[f.key]
    if (!slugs?.length) continue
    const matches = slugs
      .map((s) => f.options.find((o) => o.value === s)?.match)
      .filter((m): m is string => Boolean(m))
    if (matches.length) attributes[f.attrKey] = matches
  }

  return {
    subcategories: state.subcategories.length ? state.subcategories : undefined,
    q: state.q || undefined,
    department: state.department ?? undefined,
    minPrice: state.minPrice ?? undefined,
    maxPrice: state.maxPrice ?? undefined,
    certifications: certifications.length ? certifications : undefined,
    attributes: Object.keys(attributes).length ? attributes : undefined,
  }
}

/** Cuenta cuántos filtros activos hay (ignora orden y búsqueda). */
export function countActiveFilters(state: CatalogFiltersState): number {
  let n = state.subcategories.length
  if (state.department) n++
  if (state.minPrice != null) n++
  if (state.maxPrice != null) n++
  n += state.certifications.length
  for (const values of Object.values(state.dynamic)) n += values.length
  return n
}

/** Keys reservadas para filtros estáticos (útil para clean ups). */
export const RESERVED_STATIC_KEYS = STATIC_KEYS
