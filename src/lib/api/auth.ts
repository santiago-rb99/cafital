import { Buyer, Seller, User } from '@/types'
import { ALL_MOCK_USERS, getMockUserById } from '@/data/mock/users'
import { ApiError, delay, generateApiId, loadOverrides } from './_client'
import { createUser } from './users'

const SESSION_KEY = 'cafital_session'
const USERS_OVERRIDES_KEY = 'cafital_users_overrides'

function isBrowser() {
  return typeof window !== 'undefined'
}

function emailExists(email: string): boolean {
  const lower = email.trim().toLowerCase()
  if (ALL_MOCK_USERS.some((u) => u.email.toLowerCase() === lower)) return true
  if (!isBrowser()) return false
  const slice = loadOverrides<User>(USERS_OVERRIDES_KEY)
  return slice.creates.some((u) => u.email.toLowerCase() === lower)
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

export async function register(input: RegisterInput): Promise<User> {
  await delay(400)

  if (emailExists(input.email)) {
    throw new ApiError('Ya existe una cuenta con ese correo', 409)
  }

  const createdAt = new Date().toISOString()
  let user: User
  if (input.role === 'buyer') {
    const buyer: Buyer = {
      id: generateApiId('buyer'),
      role: 'buyer',
      email: input.email.trim(),
      name: input.name.trim(),
      ...(input.department ? { department: input.department } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.avatar ? { avatar: input.avatar } : {}),
      createdAt,
    }
    user = buyer
  } else {
    const seller: Seller = {
      id: generateApiId('seller'),
      role: 'seller',
      email: input.email.trim(),
      businessName: input.businessName.trim(),
      ...(input.department ? { department: input.department } : {}),
      ...(input.municipality ? { municipality: input.municipality } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.logo ? { logo: input.logo } : {}),
      ...(input.banner ? { banner: input.banner } : {}),
      ...(input.nit ? { nit: input.nit } : {}),
      subscriptionPlan: 'none',
      createdAt,
    }
    user = seller
  }

  await createUser(user)
  if (isBrowser()) localStorage.setItem(SESSION_KEY, user.id)
  return user
}
