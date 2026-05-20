import { Order, RecurringSubscription } from '@/types'

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
        photo: 'https://picsum.photos/seed/cafeverde01/800/800',
        unit: 'Quintal (46 kg)',
        quantity: 2,
        unitPrice: 7200,
      },
    ],
    total: 14400,
    status: 'completed',
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
        photo: 'https://picsum.photos/seed/cafetostado03/800/800',
        unit: 'Kilogramo',
        quantity: 10,
        unitPrice: 320,
      },
      {
        publicationId: 'pub-004',
        publicationTitle: 'Café Molido Filtro Origen Caranavi',
        photo: 'https://picsum.photos/seed/cafemolido04/800/800',
        unit: 'Kilogramo',
        quantity: 5,
        unitPrice: 390,
      },
    ],
    total: 5150,
    status: 'in_process',
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
        photo: 'https://picsum.photos/seed/barismo09/800/800',
        unit: 'Por persona',
        quantity: 2,
        unitPrice: 450,
      },
    ],
    total: 900,
    status: 'completed',
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
        photo: 'https://picsum.photos/seed/cafeverde02/800/800',
        unit: 'Saco (60 kg)',
        quantity: 3,
        unitPrice: 5580,
      },
    ],
    total: 16740,
    status: 'pending',
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
        photo: 'https://picsum.photos/seed/fertilizante05/800/800',
        unit: 'Unidad',
        quantity: 4,
        unitPrice: 850,
      },
    ],
    total: 3400,
    status: 'completed',
    createdAt: '2026-02-28T10:20:00Z',
  },
]

export const mockRecurringSubscriptions: RecurringSubscription[] = [
  {
    id: 'rec-001',
    buyerId: 'buyer-01',
    publicationId: 'pub-003',
    publicationTitle: 'Café Tostado Yungas Blend Espresso 500g',
    photo: 'https://picsum.photos/seed/cafetostado03/800/800',
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
    photo: 'https://picsum.photos/seed/fertilizante05/800/800',
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
