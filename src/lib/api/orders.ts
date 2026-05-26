import { CartItem, Order, OrderItem, OrderStatus, ShippingAddress } from '@/types'
import { mockOrders } from '@/data/mock/orders'
import { ApiError, delay, generateApiId, makeStore } from './_client'
import { getUser } from './users'

const store = makeStore<Order>('cafital_orders_overrides')

function all(): Order[] {
  return store.read(mockOrders)
}

export async function listOrdersByBuyer(buyerId: string): Promise<Order[]> {
  await delay()
  return all()
    .filter((o) => o.buyerId === buyerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function listOrdersBySeller(sellerId: string): Promise<Order[]> {
  await delay()
  return all()
    .filter((o) => o.sellerId === sellerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getOrder(id: string): Promise<Order | null> {
  await delay()
  return all().find((o) => o.id === id) ?? null
}

/**
 * Convierte un carrito en uno o varios pedidos. Si el carrito mezcla items
 * de distintos vendedores, se generan pedidos independientes por vendedor.
 */
export async function createOrdersFromCart(
  buyerId: string,
  items: CartItem[],
  shippingAddress?: ShippingAddress
): Promise<Order[]> {
  await delay(500)
  if (items.length === 0) throw new ApiError('El carrito está vacío', 400)

  const bySeller = new Map<string, CartItem[]>()
  for (const item of items) {
    const list = bySeller.get(item.sellerId) ?? []
    list.push(item)
    bySeller.set(item.sellerId, list)
  }

  const orders: Order[] = []
  for (const [sellerId, sellerItems] of bySeller) {
    const orderItems: OrderItem[] = sellerItems.map((c) => ({
      publicationId: c.publicationId,
      publicationTitle: c.title,
      photo: c.photo,
      unit: c.unit,
      quantity: c.quantity,
      unitPrice: c.discount ? c.unitPrice * (1 - c.discount / 100) : c.unitPrice,
    }))
    const total = orderItems.reduce(
      (sum, it) => sum + it.unitPrice * it.quantity,
      0
    )
    const order: Order = {
      id: generateApiId('ord'),
      buyerId,
      sellerId,
      sellerName: sellerItems[0]!.sellerName,
      items: orderItems,
      total,
      status: 'pending',
      ...(shippingAddress ? { shippingAddress } : {}),
      createdAt: new Date().toISOString(),
    }
    store.create(order)
    orders.push(order)
  }
  return orders
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  await delay()
  const current = all().find((o) => o.id === id)
  if (!current) throw new ApiError('Pedido no encontrado', 404)
  const updated: Order = { ...current, status }
  store.update(id, updated)
  return updated
}

/** Devuelve buyerName resuelto desde el catálogo de usuarios. Útil para Mi Tienda. */
export async function getOrderBuyerName(order: Order): Promise<string> {
  const user = await getUser(order.buyerId)
  if (!user) return 'Comprador'
  return user.role === 'buyer' ? user.name : user.email
}
