import { Buyer, Seller, User, VerificationDocs } from '@/types'
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

export interface UpgradeToSellerInput {
  businessName: string
  department?: string
  municipality?: string
  description?: string
  logo?: string
  banner?: string
  nit?: string
}

/**
 * Convierte un comprador en vendedor manteniendo id, email y createdAt.
 * Descarta campos exclusivos de comprador (name, avatar) e inicializa
 * `subscriptionPlan: 'none'`.
 */
export async function upgradeBuyerToSeller(
  buyerId: string,
  input: UpgradeToSellerInput
): Promise<Seller> {
  await delay()
  const current = allUsers().find((u) => u.id === buyerId)
  if (!current) throw new ApiError('Usuario no encontrado', 404)
  if (current.role !== 'buyer') {
    throw new ApiError('El usuario ya es vendedor', 409)
  }

  const seller: Seller = {
    id: current.id,
    role: 'seller',
    email: current.email,
    businessName: input.businessName.trim(),
    ...(input.department ? { department: input.department } : {}),
    ...(input.municipality ? { municipality: input.municipality } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.logo ? { logo: input.logo } : {}),
    ...(input.banner ? { banner: input.banner } : {}),
    ...(input.nit ? { nit: input.nit } : {}),
    subscriptionPlan: 'none',
    verificationStatus: 'pending',
    verificationSubmittedAt: new Date().toISOString(),
    createdAt: current.createdAt,
  }

  usersStore.update(buyerId, seller)
  return seller
}

/**
 * El vendedor envía (o reenvía) sus documentos de verificación. Marca la
 * solicitud como `pending`, registra la fecha de envío, limpia cualquier
 * motivo de rechazo previo y guarda los documentos provistos.
 */
export async function submitVerificationDocs(
  sellerId: string,
  docs: VerificationDocs
): Promise<Seller> {
  await delay()
  const current = allUsers().find((u) => u.id === sellerId)
  if (!current) throw new ApiError('Usuario no encontrado', 404)
  if (current.role !== 'seller') {
    throw new ApiError('Solo los vendedores pueden enviar verificación', 403)
  }
  if (!docs.idDocument) {
    throw new ApiError('Falta el documento de identidad', 400)
  }

  const updated: Seller = {
    ...current,
    verificationStatus: 'pending',
    verificationSubmittedAt: new Date().toISOString(),
    verificationReviewedAt: undefined,
    verificationRejectionReason: undefined,
    verificationDocs: {
      idDocument: docs.idDocument,
      ...(docs.nitDocument ? { nitDocument: docs.nitDocument } : {}),
    },
  }
  usersStore.update(sellerId, updated)
  return updated
}

// Re-export para conveniencia
export { mockBuyers, mockSellers }
