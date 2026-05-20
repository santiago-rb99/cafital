import { Buyer, Seller, User } from '@/types'
import {
  ALL_MOCK_USERS,
  mockBuyers,
  mockSellers,
} from '@/data/mock/users'
import { ApiError, delay, makeStore } from './_client'

const usersStore = makeStore<User>('cafital_users_overrides')

function allUsers(): User[] {
  return usersStore.read(ALL_MOCK_USERS as User[])
}

export async function getUser(id: string): Promise<User | null> {
  await delay()
  return allUsers().find((u) => u.id === id) ?? null
}

export async function listBuyers(): Promise<Buyer[]> {
  await delay()
  return allUsers().filter((u): u is Buyer => u.role === 'buyer')
}

export async function listSellers(): Promise<Seller[]> {
  await delay()
  return allUsers().filter((u): u is Seller => u.role === 'seller')
}

export async function getSellerById(id: string): Promise<Seller | null> {
  await delay()
  const sellers = allUsers().filter((u): u is Seller => u.role === 'seller')
  return sellers.find((s) => s.id === id) ?? null
}

export async function updateUserProfile(
  id: string,
  patch: Partial<Omit<User, 'id' | 'role' | 'createdAt'>>
): Promise<User> {
  await delay()
  const current = allUsers().find((u) => u.id === id)
  if (!current) throw new ApiError('Usuario no encontrado', 404)
  const updated = { ...current, ...patch } as User
  usersStore.update(id, updated)
  return updated
}

/**
 * Crea un usuario nuevo (registro). El caller es responsable de invocar
 * `auth.login(id)` después si quiere dejar la sesión activa.
 */
export async function createUser(user: User): Promise<User> {
  await delay()
  if (allUsers().some((u) => u.id === user.id)) {
    throw new ApiError(`Ya existe un usuario con id ${user.id}`, 409)
  }
  usersStore.create(user)
  return user
}

// Re-export para conveniencia
export { mockBuyers, mockSellers }
