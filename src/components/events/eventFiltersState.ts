import { EventModality, EventType } from '@/types'

export type EventDateRange = 'all' | 'today' | 'week' | 'month'

export interface EventFiltersState {
  type: EventType | null
  modality: EventModality | null
  department: string | null
  range: EventDateRange
  q: string
}

const VALID_TYPES: EventType[] = [
  'taller',
  'cata',
  'capacitacion',
  'feria',
  'competencia',
  'networking',
  'tour_finca',
  'otro',
]
const VALID_MODALITIES: EventModality[] = ['presencial', 'virtual', 'hibrido']
const VALID_RANGES: EventDateRange[] = ['all', 'today', 'week', 'month']

type ParamsLike =
  | URLSearchParams
  | Record<string, string | string[] | undefined>

function getOne(params: ParamsLike, key: string): string | null {
  if (params instanceof URLSearchParams) return params.get(key)
  const v = params[key]
  if (Array.isArray(v)) return v[0] ?? null
  return v ?? null
}

export function parseEventFilters(params: ParamsLike): EventFiltersState {
  const rawType = getOne(params, 'type')
  const type =
    rawType && (VALID_TYPES as string[]).includes(rawType)
      ? (rawType as EventType)
      : null

  const rawMod = getOne(params, 'mod')
  const modality =
    rawMod && (VALID_MODALITIES as string[]).includes(rawMod)
      ? (rawMod as EventModality)
      : null

  const rawRange = getOne(params, 'range')
  const range = (VALID_RANGES as string[]).includes(rawRange ?? '')
    ? (rawRange as EventDateRange)
    : 'all'

  return {
    type,
    modality,
    department: getOne(params, 'dept'),
    range,
    q: (getOne(params, 'q') ?? '').trim(),
  }
}

export function buildEventSearchParams(
  state: Partial<EventFiltersState>
): URLSearchParams {
  const out = new URLSearchParams()
  if (state.type) out.set('type', state.type)
  if (state.modality) out.set('mod', state.modality)
  if (state.department) out.set('dept', state.department)
  if (state.range && state.range !== 'all') out.set('range', state.range)
  if (state.q) out.set('q', state.q)
  return out
}

export function countActiveEventFilters(state: EventFiltersState): number {
  let n = 0
  if (state.type) n++
  if (state.modality) n++
  if (state.department) n++
  if (state.range !== 'all') n++
  return n
}

/** Devuelve [fromDate, toDate] como YYYY-MM-DD para `EventFilters` de la API. */
export function rangeToBounds(
  range: EventDateRange,
  now: Date = new Date()
): { fromDate?: string; toDate?: string } {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const iso = (d: Date) => d.toISOString().slice(0, 10)

  if (range === 'today') {
    return { fromDate: iso(today), toDate: iso(today) }
  }
  if (range === 'week') {
    const end = new Date(today)
    end.setDate(end.getDate() + 7)
    return { fromDate: iso(today), toDate: iso(end) }
  }
  if (range === 'month') {
    const end = new Date(today)
    end.setMonth(end.getMonth() + 1)
    return { fromDate: iso(today), toDate: iso(end) }
  }
  return { fromDate: iso(today) }
}

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  taller: 'Taller',
  cata: 'Cata',
  capacitacion: 'Capacitación',
  feria: 'Feria',
  competencia: 'Competencia',
  networking: 'Networking',
  tour_finca: 'Tour de finca',
  otro: 'Otro',
}

export const EVENT_MODALITY_LABEL: Record<EventModality, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrido: 'Híbrido',
}

export const EVENT_RANGE_LABEL: Record<EventDateRange, string> = {
  all: 'Todas las fechas',
  today: 'Hoy',
  week: 'Próximos 7 días',
  month: 'Próximos 30 días',
}
