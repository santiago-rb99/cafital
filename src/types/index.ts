/* ─── SUBSCRIPTION ─────────────────────────────────────────── */
export type SubscriptionPlan = 'none' | 'semilla' | 'cosecha' | 'exportacion'

export const SUBSCRIPTION_PRICES: Record<SubscriptionPlan, number> = {
  none: 0,
  semilla: 9.99,
  cosecha: 14.99,
  exportacion: 29.99,
}

/* ─── USERS ─────────────────────────────────────────────────── */
export interface BaseUser {
  id: string
  email: string
  avatar?: string
  description?: string
  department?: string
  createdAt: string
  /** Marca administrativa: el usuario está suspendido y no puede operar. */
  suspended?: boolean
}

export interface Buyer extends BaseUser {
  role: 'buyer'
  name: string
}

export interface Admin extends BaseUser {
  role: 'admin'
  name: string
}

export interface Seller extends BaseUser {
  role: 'seller'
  businessName: string
  /** Asociación / gremio a la que pertenece el vendedor (ej. APROCAFÉ). */
  association?: string
  logo?: string
  banner?: string
  municipality?: string
  nit?: string
  subscriptionPlan: SubscriptionPlan
  subscriptionExpiry?: string
  /**
   * Imagen elegida por el vendedor para publicitarse en el hero de portada,
   * catálogo y vendedores. Si no existe, el hero cae al `banner`.
   */
  heroImage?: string
  /** Copy promocional del slide del hero (máx. ~140 chars). */
  heroCopy?: string
  /** Evento elegido para destacar en el hero de Eventos. */
  promotedEventId?: string
  /** Apariciones consumidas en el período en curso. */
  adAppearancesUsed?: number
  /** Inicio ISO del período de cómputo de apariciones (típicamente día 1 del mes). */
  adAppearancesPeriodStart?: string
  about?: {
    mission?: string
    vision?: string
    history?: string
  }
  profileImages?: string[]
}

export type User = Buyer | Seller | Admin

/* ─── PUBLICATIONS ──────────────────────────────────────────── */
export type PublicationCategory = 'A' | 'B' | 'C' | 'D'
export type PublicationStatus = 'active' | 'paused' | 'draft'
export type PriceMode = 'price' | 'quote'

export interface ProductUnit {
  unit: string
  price: number
  minQuantity: number
}

export interface Publication {
  id: string
  sellerId: string
  category: PublicationCategory
  subcategory: string
  title: string
  description: string
  photos: string[]
  video?: string
  variants?: string
  priceMode: PriceMode
  units?: ProductUnit[]
  coverage: string[]
  inventory?: number
  discount?: number
  recurringAvailable: boolean
  attributes: Record<string, string | string[]>
  status: PublicationStatus
  views?: number
  createdAt: string
  /** Marca de destacado por el equipo administrativo. */
  featured?: boolean
}

/* ─── EVENTS ────────────────────────────────────────────────── */
export type EventType =
  | 'taller'
  | 'cata'
  | 'capacitacion'
  | 'feria'
  | 'competencia'
  | 'networking'
  | 'tour_finca'
  | 'otro'

export type EventModality = 'presencial' | 'virtual' | 'hibrido'
export type EventStatus = 'active' | 'draft' | 'finished' | 'cancelled'

export interface CafeEvent {
  id: string
  organizerId: string
  name: string
  image: string
  type: EventType
  description: string
  modality: EventModality
  department?: string
  city?: string
  address?: string
  eventLink?: string
  date: string
  startTime: string
  endTime?: string
  price: number | 'free'
  capacity?: number
  registrationDeadline?: string
  status: EventStatus
  registeredCount: number
}

/* ─── ORDERS ────────────────────────────────────────────────── */
export type OrderStatus = 'pending' | 'in_process' | 'completed'

export interface OrderItem {
  publicationId: string
  publicationTitle: string
  photo: string
  unit: string
  quantity: number
  unitPrice: number
}

export interface ShippingAddress {
  fullName: string
  phone: string
  department: string
  city: string
  address: string
  notes?: string
}

export interface Order {
  id: string
  buyerId: string
  sellerId: string
  sellerName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  /** Datos de envío que el vendedor necesita para despachar el pedido. */
  shippingAddress?: ShippingAddress
  createdAt: string
}

/* ─── RECURRING SUBSCRIPTIONS ───────────────────────────────── */
export type RecurringFrequency = 'semanal' | 'quincenal' | 'mensual' | 'bimensual'

export interface RecurringSubscription {
  id: string
  buyerId: string
  publicationId: string
  publicationTitle: string
  photo: string
  unit: string
  quantity: number
  unitPrice: number
  frequency: RecurringFrequency
  nextOrderDate: string
  active: boolean
}

/* ─── CART ──────────────────────────────────────────────────── */
export interface CartItem {
  publicationId: string
  sellerId: string
  sellerName: string
  title: string
  photo: string
  unit: string
  unitPrice: number
  quantity: number
  discount?: number
}

/* ─── FAVORITES ─────────────────────────────────────────────── */
export interface Favorites {
  publications: string[]
  sellers: string[]
}

/* ─── CATEGORIES ────────────────────────────────────────────── */
export interface Subcategory {
  id: string
  name: string
  categoryId: PublicationCategory
}

export interface Category {
  id: PublicationCategory
  name: string
  description: string
  recurringAvailable: boolean
  subcategories: Subcategory[]
}

/* ─── TOAST ─────────────────────────────────────────────────── */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  description?: string
}

/* ─── SESSION ───────────────────────────────────────────────── */
export interface Session {
  userId: string
}
