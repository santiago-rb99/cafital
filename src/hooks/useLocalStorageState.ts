'use client'

import { useCallback, useRef, useSyncExternalStore } from 'react'

/**
 * Hook de estado respaldado por `localStorage`, SSR-safe vía
 * `useSyncExternalStore`. Lee/escribe JSON, comparte cambios entre instancias
 * en la misma pestaña (notificación interna) y reacciona a cambios de otras
 * pestañas (evento `storage`).
 *
 * Reemplaza el patrón `useState + useEffect(setX(load()))`, que dispara la
 * regla `react-hooks/set-state-in-effect`.
 */

const listenersByKey = new Map<string, Set<() => void>>()
const snapshotCache = new Map<string, { raw: string | null; parsed: unknown }>()

function getListeners(key: string): Set<() => void> {
  let set = listenersByKey.get(key)
  if (!set) {
    set = new Set()
    listenersByKey.set(key, set)
  }
  return set
}

function notifyKey(key: string) {
  listenersByKey.get(key)?.forEach((listener) => listener())
}

function readSnapshot<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(key)
  const cached = snapshotCache.get(key)
  if (cached && cached.raw === raw) return cached.parsed as T
  let parsed: T
  if (raw === null) {
    parsed = fallback
  } else {
    try {
      parsed = JSON.parse(raw) as T
    } catch {
      parsed = fallback
    }
  }
  snapshotCache.set(key, { raw, parsed })
  return parsed
}

/**
 * Nota: el `fallback` se captura sólo en el primer render. Cambios posteriores
 * se ignoran (suficiente para casos típicos: el fallback es una constante a
 * nivel de módulo).
 */
export function useLocalStorageState<T>(
  key: string,
  fallback: T
): [T, (next: T | ((prev: T) => T)) => void] {
  const fallbackRef = useRef(fallback)

  const subscribe = useCallback(
    (listener: () => void) => {
      const set = getListeners(key)
      set.add(listener)
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) {
          snapshotCache.delete(key)
          listener()
        }
      }
      window.addEventListener('storage', onStorage)
      return () => {
        set.delete(listener)
        window.removeEventListener('storage', onStorage)
      }
    },
    [key]
  )

  const getSnapshot = useCallback(
    () => readSnapshot(key, fallbackRef.current),
    [key]
  )

  const getServerSnapshot = useCallback(() => fallbackRef.current, [])

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readSnapshot(key, fallbackRef.current)
      const resolved =
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      const serialized = JSON.stringify(resolved)
      localStorage.setItem(key, serialized)
      snapshotCache.set(key, { raw: serialized, parsed: resolved })
      notifyKey(key)
    },
    [key]
  )

  return [value, setValue]
}

/**
 * Devuelve `true` después de la primera renderización en cliente. Útil para
 * gatear UI que depende de estado hidratado desde `localStorage`.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    getTrueSnapshot,
    getFalseSnapshot
  )
}

const subscribeNoop = () => () => {}
const getTrueSnapshot = () => true
const getFalseSnapshot = () => false
