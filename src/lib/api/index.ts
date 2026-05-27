/**
 * Capa de API simulada de Cafital.
 *
 * Cada módulo expone funciones async (`await delay(...)`) que leen de
 * `data/mock/` y persisten mutaciones en `localStorage` vía `_client.makeStore`.
 *
 * Patrones de uso:
 *
 *   import * as api from '@/lib/api'
 *   const publications = await api.publications.list({ filters: { category: 'A' } })
 *
 *   // o por módulo:
 *   import { listPublications } from '@/lib/api/publications'
 */

export { ApiError } from './_client'

export * as auth from './auth'
export * as users from './users'
export * as categories from './categories'
export * as publications from './publications'
export * as events from './events'
export * as orders from './orders'
export * as recurring from './recurring'
export * as subscriptions from './subscriptions'
export * as advertising from './advertising'
export * as admin from './admin'
