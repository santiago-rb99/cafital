import { Order, RecurringSubscription, ShippingAddress } from '@/types'

const BUYER_01_ADDRESS: ShippingAddress = {
  fullName: 'Juan Pérez',
  phone: '+591 70123456',
  department: 'La Paz',
  city: 'La Paz',
  address: 'Av. 6 de Agosto N° 2456, Zona Sopocachi',
  notes: 'Edificio Torre Empresarial, piso 4 — recepción hasta las 18:00.',
}

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    buyerId: 'buyer-01',
    sellerId: 'seller-cosecha',
    sellerName: 'Finca Caranavi Exports',
    items: [
      {
        publicationId: 'pub-001',
        publicationTitle: 'Café Verde Caranavi Gesha Natural 2025',
        photo: '/images/productos/cafe-insumos/pergamino-1.jpg',
        unit: 'Quintal (46 kg)',
        quantity: 2,
        unitPrice: 7200,
      },
    ],
    total: 14400,
    status: 'completed',
    shippingAddress: BUYER_01_ADDRESS,
    createdAt: '2026-04-10T14:30:00Z',
  },
  {
    id: 'ord-002',
    buyerId: 'buyer-01',
    sellerId: 'seller-semilla',
    sellerName: 'Tostadora Yungas',
    items: [
      {
        publicationId: 'pub-003',
        publicationTitle: 'Café Tostado Yungas Blend Espresso 500g',
        photo: '/images/productos/cafe-insumos/bolsa-cafe-1.webp',
        unit: 'Kilogramo',
        quantity: 10,
        unitPrice: 320,
      },
      {
        publicationId: 'pub-004',
        publicationTitle: 'Café Molido Filtro Origen Caranavi',
        photo: '/images/productos/cafe-insumos/bolsa-cafe-1.webp',
        unit: 'Kilogramo',
        quantity: 5,
        unitPrice: 390,
      },
    ],
    total: 5150,
    status: 'in_process',
    shippingAddress: BUYER_01_ADDRESS,
    createdAt: '2026-05-12T09:00:00Z',
  },
  {
    id: 'ord-003',
    buyerId: 'buyer-01',
    sellerId: 'seller-exportacion',
    sellerName: 'Bolivia Premium Coffee',
    items: [
      {
        publicationId: 'pub-009',
        publicationTitle: 'Curso de Barismo Profesional — Nivel Intermedio',
        photo: '/images/eventos/alquimia-cata-1.jpg',
        unit: 'Por persona',
        quantity: 2,
        unitPrice: 450,
      },
    ],
    total: 900,
    status: 'completed',
    // Servicio sin envío físico: no hay shippingAddress.
    createdAt: '2026-03-20T11:00:00Z',
  },
  {
    id: 'ord-004',
    buyerId: 'buyer-01',
    sellerId: 'seller-cosecha',
    sellerName: 'Finca Caranavi Exports',
    items: [
      {
        publicationId: 'pub-002',
        publicationTitle: 'Café Verde Bourbon Lavado Nor Yungas',
        photo: '/images/productos/cafe-insumos/pergamino-1.jpg',
        unit: 'Saco (60 kg)',
        quantity: 3,
        unitPrice: 5580,
      },
    ],
    total: 16740,
    status: 'pending',
    shippingAddress: BUYER_01_ADDRESS,
    createdAt: '2026-05-18T16:45:00Z',
  },
  {
    id: 'ord-005',
    buyerId: 'buyer-01',
    sellerId: 'seller-free',
    sellerName: 'Agro Insumos Chapare',
    items: [
      {
        publicationId: 'pub-005',
        publicationTitle: 'Fertilizante Foliar Orgánico para Café - 20L',
        photo: '/images/productos/cafe-insumos/fertilizante-natural-celccar.jpg',
        unit: 'Unidad',
        quantity: 4,
        unitPrice: 850,
      },
    ],
    total: 3400,
    status: 'completed',
    shippingAddress: BUYER_01_ADDRESS,
    createdAt: '2026-02-28T10:20:00Z',
  },
  {
    id: 'ord-006',
    buyerId: 'buyer-01',
    sellerId: 'seller-hefesto',
    sellerName: 'Hefesto Maquinaria Cafetera',
    items: [
      {
        publicationId: 'pub-038',
        publicationTitle: 'Cangilones Metálicos para Elevadores — Pack 20',
        photo: '/images/productos/maquinaria/cangilones-metalicos.jpg',
        unit: 'Pack 20 unidades',
        quantity: 2,
        unitPrice: 1450,
      },
    ],
    total: 2900,
    status: 'in_process',
    shippingAddress: BUYER_01_ADDRESS,
    createdAt: '2026-05-20T11:30:00Z',
  },
  {
    id: 'ord-007',
    buyerId: 'buyer-01',
    sellerId: 'seller-bob',
    sellerName: 'Best of Bolivia Coffee',
    items: [
      {
        publicationId: 'pub-024',
        publicationTitle: 'Bolsas Stand-up con Válvula 1kg — Pack 100',
        photo: '/images/productos/cafe-insumos/bolsa-valvula-pie-hermetico-1.jpg',
        unit: 'Pack 100 unidades',
        quantity: 3,
        unitPrice: 480,
      },
    ],
    total: 1440,
    status: 'completed',
    shippingAddress: BUYER_01_ADDRESS,
    createdAt: '2026-04-25T13:10:00Z',
  },
]

export const mockRecurringSubscriptions: RecurringSubscription[] = [
  {
    id: 'rec-001',
    buyerId: 'buyer-01',
    publicationId: 'pub-003',
    publicationTitle: 'Café Tostado Yungas Blend Espresso 500g',
    photo: '/images/productos/cafe-insumos/bolsa-cafe-1.webp',
    unit: 'Kilogramo',
    quantity: 5,
    unitPrice: 320,
    frequency: 'mensual',
    nextOrderDate: '2026-06-12T00:00:00Z',
    active: true,
  },
  {
    id: 'rec-002',
    buyerId: 'buyer-01',
    publicationId: 'pub-005',
    publicationTitle: 'Fertilizante Foliar Orgánico para Café - 20L',
    photo: '/images/productos/cafe-insumos/fertilizante-natural-celccar.jpg',
    unit: 'Litro',
    quantity: 20,
    unitPrice: 45,
    frequency: 'bimensual',
    nextOrderDate: '2026-07-01T00:00:00Z',
    active: false,
  },
]

export function getOrdersByBuyer(buyerId: string) {
  return mockOrders.filter((o) => o.buyerId === buyerId)
}

export function getOrdersBySeller(sellerId: string) {
  return mockOrders.filter((o) => o.sellerId === sellerId)
}

export function getRecurringSubscriptionsByBuyer(buyerId: string) {
  return mockRecurringSubscriptions.filter((r) => r.buyerId === buyerId)
}
