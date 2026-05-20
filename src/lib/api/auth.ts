import { User } from '@/types'
import { getMockUserById } from '@/data/mock/users'
import { ApiError, delay } from './_client'

const SESSION_KEY = 'cafital_session'

function isBrowser() {
  return typeof window !== 'undefined'
}

export async function getCurrentSession(): Promise<User | null> {
  await delay(120)
  if (!isBrowser()) return null
  const userId = localStorage.getItem(SESSION_KEY)
  if (!userId) return null
  return getMockUserById(userId)
}

export async function login(userId: string): Promise<User> {
  await delay()
  const user = getMockUserById(userId)
  if (!user) throw new ApiError('Usuario no encontrado', 404)
  if (isBrowser()) localStorage.setItem(SESSION_KEY, userId)
  return user
}

export async function logout(): Promise<void> {
  await delay(120)
  if (isBrowser()) localStorage.removeItem(SESSION_KEY)
}

export interface RegisterBuyerInput {
  role: 'buyer'
  name: string
  email: string
  department?: string
  description?: string
  avatar?: string
}

export interface RegisterSellerInput {
  role: 'seller'
  businessName: string
  email: string
  department?: string
  municipality?: string
  description?: string
  logo?: string
  banner?: string
  nit?: string
}

export type RegisterInput = RegisterBuyerInput | RegisterSellerInput

/**
 * Stub de registro: crea un usuario nuevo en memoria + lo guarda como sesión.
 * En la implementación real, esto se moverá al backend y devolverá el nuevo User.
 * Por ahora delega en `users.createUser` (ver users.ts) y luego loguea.
 */
export async function register(input: RegisterInput): Promise<User> {
  // Implementación tentativa: ver `users.ts` para creación real.
  // Aquí sólo simulamos latencia y devolvemos un placeholder.
  await delay(400)
  throw new ApiError(
    `register(${input.role}) todavía no está implementado — usar users.createUser + login en F2.`,
    501
  )
}
