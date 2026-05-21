/**
 * Filtros dinámicos por subcategoría.
 *
 * Cada filtro mapea a una clave del `attributes` de la publicación. Los valores
 * se comparan como string (single) o como overlap (cuando el atributo es array).
 *
 * El usuario en la URL ve nombres cortos en kebab-case (`process=natural`),
 * pero internamente se buscan los valores exactos del mock data — por eso
 * exponemos label visible + value canónico en español.
 */

export interface DynamicFilterOption {
  /** URL-safe slug usado en query params. */
  value: string
  /** Etiqueta visible en el FilterPanel. */
  label: string
  /** Valor canónico exacto a comparar contra `attributes[attrKey]`. */
  match: string
}

export interface DynamicFilter {
  /** Slug del filtro en la URL (`?process=natural`). */
  key: string
  /** Etiqueta visible en el panel ("Proceso de beneficiado"). */
  label: string
  /** Clave dentro de `pub.attributes` que contiene el valor a comparar. */
  attrKey: string
  /** Permitir multi-selección. */
  multi: boolean
  options: DynamicFilterOption[]
}

const FILTER_PROCESS: DynamicFilter = {
  key: 'process',
  label: 'Proceso de beneficiado',
  attrKey: 'Proceso de beneficiado',
  multi: true,
  options: [
    { value: 'lavado', label: 'Lavado', match: 'Lavado' },
    { value: 'natural', label: 'Natural', match: 'Natural' },
    { value: 'honey-amarillo', label: 'Honey amarillo', match: 'Honey amarillo' },
    { value: 'honey-rojo', label: 'Honey rojo', match: 'Honey rojo' },
    { value: 'honey-negro', label: 'Honey negro', match: 'Honey negro' },
    { value: 'anaerobico', label: 'Anaeróbico', match: 'Anaeróbico' },
    { value: 'semi-lavado', label: 'Semi-lavado', match: 'Semi-lavado' },
    { value: 'doble-lavado', label: 'Doble lavado', match: 'Doble lavado' },
  ],
}

const FILTER_VARIETY: DynamicFilter = {
  key: 'variety',
  label: 'Variedad botánica',
  attrKey: 'Variedad botánica',
  multi: true,
  options: [
    { value: 'typica', label: 'Typica', match: 'Typica' },
    { value: 'caturra', label: 'Caturra', match: 'Caturra' },
    { value: 'bourbon', label: 'Bourbon', match: 'Bourbon' },
    { value: 'gesha', label: 'Gesha-Geisha', match: 'Gesha-Geisha' },
    { value: 'catuai', label: 'Catuaí', match: 'Catuaí' },
    { value: 'catimor', label: 'Catimor', match: 'Catimor' },
    { value: 'sarchimor', label: 'Sarchimor', match: 'Sarchimor' },
    { value: 'mezcla', label: 'Mezcla-Blend', match: 'Mezcla-Blend' },
  ],
}

const FILTER_ALTITUDE: DynamicFilter = {
  key: 'altitude',
  label: 'Altitud de cultivo',
  attrKey: 'Altitud de cultivo',
  multi: true,
  options: [
    { value: 'hasta-1000', label: 'Hasta 1000 msnm', match: 'Hasta 1000 msnm' },
    { value: '1000-1500', label: '1000–1500 msnm', match: '1000–1500 msnm' },
    { value: '1500-2000', label: '1500–2000 msnm', match: '1500–2000 msnm' },
    { value: 'mas-2000', label: 'Más de 2000 msnm', match: 'Más de 2000 msnm' },
  ],
}

const FILTER_SCA: DynamicFilter = {
  key: 'sca',
  label: 'Puntuación SCA',
  attrKey: 'Puntuación SCA',
  multi: true,
  options: [
    { value: 'sin-puntaje', label: 'Sin puntaje', match: 'Sin puntaje' },
    { value: 'menos-80', label: 'Menos de 80', match: '<80' },
    { value: '80-84', label: '80–84 pts', match: '80–84 pts' },
    { value: '85-89', label: '85–89 pts', match: '85–89 pts' },
    { value: '90-plus', label: '90+ pts', match: '90+ pts' },
  ],
}

const FILTER_ROAST: DynamicFilter = {
  key: 'roast',
  label: 'Nivel de tueste',
  attrKey: 'Nivel de tueste',
  multi: true,
  options: [
    { value: 'claro', label: 'Claro', match: 'Claro' },
    { value: 'medio', label: 'Medio', match: 'Medio' },
    { value: 'medio-oscuro', label: 'Medio-oscuro', match: 'Medio-oscuro' },
    { value: 'oscuro', label: 'Oscuro', match: 'Oscuro' },
    { value: 'espresso', label: 'Espresso', match: 'Espresso' },
  ],
}

const FILTER_CONDITION: DynamicFilter = {
  key: 'condition',
  label: 'Estado',
  attrKey: 'Estado',
  multi: true,
  options: [
    { value: 'nuevo', label: 'Nuevo', match: 'Nuevo' },
    { value: 'reacondicionado', label: 'Usado (reacondicionado)', match: 'Usado (Reacondicionado)' },
    { value: 'usado', label: 'Usado (condición actual)', match: 'Usado (En condición actual)' },
  ],
}

const FILTER_SALE_MODE: DynamicFilter = {
  key: 'sale',
  label: 'Condición de venta',
  attrKey: 'Condición de venta',
  multi: true,
  options: [
    { value: 'venta', label: 'Venta directa', match: 'Venta directa' },
    { value: 'leasing', label: 'Arriendo / Leasing', match: 'Arriendo-Leasing' },
    { value: 'subasta', label: 'Subasta', match: 'Subasta' },
  ],
}

const FILTER_SERVICE_MODE: DynamicFilter = {
  key: 'mode',
  label: 'Modalidad',
  attrKey: 'Modalidad',
  multi: true,
  options: [
    { value: 'presencial', label: 'Presencial', match: 'Presencial' },
    { value: 'virtual', label: 'Virtual', match: 'Virtual' },
    { value: 'hibrido', label: 'Híbrido', match: 'Híbrido' },
  ],
}

/**
 * Mapa subcategoría → filtros dinámicos.
 * Subcategorías no listadas usan solo los filtros estáticos.
 */
export const DYNAMIC_FILTERS_BY_SUBCATEGORY: Record<string, DynamicFilter[]> = {
  // Categoría A — Café
  'A-verde': [FILTER_PROCESS, FILTER_VARIETY, FILTER_ALTITUDE, FILTER_SCA],
  'A-pergamino': [FILTER_PROCESS, FILTER_VARIETY, FILTER_ALTITUDE],
  'A-tostado': [FILTER_ROAST, FILTER_PROCESS, FILTER_VARIETY],
  'A-molido': [FILTER_ROAST, FILTER_VARIETY],
  // Categoría B — Maquinaria
  'B-tostadoras': [FILTER_CONDITION, FILTER_SALE_MODE],
  'B-molinos': [FILTER_CONDITION, FILTER_SALE_MODE],
  'B-extraccion': [FILTER_CONDITION, FILTER_SALE_MODE],
  'B-secado': [FILTER_CONDITION, FILTER_SALE_MODE],
  'B-finca': [FILTER_CONDITION, FILTER_SALE_MODE],
  'B-empaque': [FILTER_CONDITION, FILTER_SALE_MODE],
  'B-laboratorio': [FILTER_CONDITION, FILTER_SALE_MODE],
  'B-silos': [FILTER_CONDITION, FILTER_SALE_MODE],
  // Categoría C — Servicios
  'C-agro': [FILTER_SERVICE_MODE],
  'C-calidad': [FILTER_SERVICE_MODE],
  'C-barismo': [FILTER_SERVICE_MODE],
  'C-tostado': [FILTER_SERVICE_MODE],
  'C-catacion': [FILTER_SERVICE_MODE],
  'C-negocios': [FILTER_SERVICE_MODE],
  'C-marca': [FILTER_SERVICE_MODE],
}

export function getDynamicFiltersForSubcategory(
  subcategory: string | null | undefined
): DynamicFilter[] {
  if (!subcategory) return []
  return DYNAMIC_FILTERS_BY_SUBCATEGORY[subcategory] ?? []
}

/** Devuelve el filtro y la opción que matchean un (key, value) de URL. */
export function findOptionBySlug(
  filter: DynamicFilter,
  value: string
): DynamicFilterOption | undefined {
  return filter.options.find((o) => o.value === value)
}

/** Certificaciones disponibles como filtro estático. */
export const CERTIFICATION_OPTIONS: DynamicFilterOption[] = [
  { value: 'organico', label: 'Orgánico', match: 'Orgánico' },
  { value: 'fair-trade', label: 'Fair Trade', match: 'Fair Trade' },
  { value: 'rainforest', label: 'Rainforest Alliance', match: 'Rainforest Alliance' },
]
