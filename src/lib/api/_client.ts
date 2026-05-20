/**
 * Helpers internos para la capa de API simulada.
 *
 * Diseño:
 * - Lecturas: mezclan el mock estático en `data/mock/` con los overrides
 *   guardados en `localStorage` por slice (creates / updates / deletes).
 * - Mutaciones: actualizan el override y vuelven a persistir, así sobreviven
 *   a un refresh del navegador.
 * - En el servidor (RSC, build) no hay localStorage, así que reads devuelven
 *   los mocks tal cual y writes son no-op (la mutación real ocurre en cliente).
 *
 * Cuando llegue un backend real, sustituir los cuerpos por llamadas `fetch`
 * sin tocar las firmas.
 */

const DELAY_MIN_MS = 180
const DELAY_MAX_MS = 480

export function delay(ms?: number): Promise<void> {
  const wait =
    ms ?? Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS)) + DELAY_MIN_MS
  return new Promise((resolve) => setTimeout(resolve, wait))
}

export interface OverridesSlice<T> {
  updates: Record<string, T>
  creates: T[]
  deletes: string[]
}

const emptySlice = <T,>(): OverridesSlice<T> => ({
  updates: {},
  creates: [],
  deletes: [],
})

function isBrowser() {
  return typeof window !== 'undefined'
}

export function loadOverrides<T>(key: string): OverridesSlice<T> {
  if (!isBrowser()) return emptySlice<T>()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return emptySlice<T>()
    const parsed = JSON.parse(raw) as Partial<OverridesSlice<T>>
    return {
      updates: parsed.updates ?? {},
      creates: parsed.creates ?? [],
      deletes: parsed.deletes ?? [],
    }
  } catch {
    return emptySlice<T>()
  }
}

export function saveOverrides<T>(key: string, slice: OverridesSlice<T>): void {
  if (!isBrowser()) return
  localStorage.setItem(key, JSON.stringify(slice))
}

export function mergeWithOverrides<T extends { id: string }>(
  base: T[],
  slice: OverridesSlice<T>
): T[] {
  const deleted = new Set(slice.deletes)
  const merged = base
    .filter((item) => !deleted.has(item.id))
    .map((item) => slice.updates[item.id] ?? item)
  const knownIds = new Set(base.map((i) => i.id))
  const fresh = slice.creates
    .filter((c) => !deleted.has(c.id) && !knownIds.has(c.id))
    .map((c) => slice.updates[c.id] ?? c)
  return [...merged, ...fresh]
}

interface MutationOps<T extends { id: string }> {
  create(item: T): T
  update(id: string, item: T): T
  remove(id: string): void
}

export function makeStore<T extends { id: string }>(
  key: string
): MutationOps<T> & {
  read(base: T[]): T[]
  reset(): void
} {
  return {
    read(base) {
      return mergeWithOverrides(base, loadOverrides<T>(key))
    },
    create(item) {
      const slice = loadOverrides<T>(key)
      slice.creates = [...slice.creates.filter((c) => c.id !== item.id), item]
      slice.deletes = slice.deletes.filter((id) => id !== item.id)
      saveOverrides(key, slice)
      return item
    },
    update(id, item) {
      const slice = loadOverrides<T>(key)
      slice.updates[id] = item
      const createIdx = slice.creates.findIndex((c) => c.id === id)
      if (createIdx >= 0) slice.creates[createIdx] = item
      saveOverrides(key, slice)
      return item
    },
    remove(id) {
      const slice = loadOverrides<T>(key)
      slice.deletes = Array.from(new Set([...slice.deletes, id]))
      delete slice.updates[id]
      slice.creates = slice.creates.filter((c) => c.id !== id)
      saveOverrides(key, slice)
    },
    reset() {
      if (isBrowser()) localStorage.removeItem(key)
    },
  }
}

export function generateApiId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36).slice(-4)
  return `${prefix}-${time}${random}`
}

export class ApiError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message)
    this.name = 'ApiError'
  }
}
