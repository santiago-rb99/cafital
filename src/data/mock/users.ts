import { Buyer, Seller } from '@/types'

export const mockBuyers: Buyer[] = [
  {
    id: 'buyer-01',
    role: 'buyer',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    description: 'Responsable de compras en Cafetería El Molino. Busco proveedores de café verde y tostado de alta calidad.',
    department: 'La Paz',
    createdAt: '2024-03-15T10:00:00Z',
  },
]

export const mockSellers: Seller[] = [
  {
    id: 'seller-free',
    role: 'seller',
    businessName: 'Agro Insumos Chapare',
    email: 'contacto@agroinsumoschapare.bo',
    logo: 'https://i.pravatar.cc/150?img=33',
    banner: 'https://picsum.photos/seed/agrochapare/1200/675',
    description: 'Proveedor de fertilizantes e insumos agrícolas para cultivos de café en el trópico boliviano.',
    department: 'Cochabamba',
    municipality: 'Villa Tunari',
    subscriptionPlan: 'none',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'seller-semilla',
    role: 'seller',
    businessName: 'Tostadora Yungas',
    email: 'hola@tostadorayungas.bo',
    logo: 'https://i.pravatar.cc/150?img=52',
    banner: 'https://picsum.photos/seed/tostadorayungas/1200/675',
    description: 'Tostamos microlotes de café boliviano con perfiles artesanales. Especialistas en Nor Yungas y Caranavi.',
    department: 'La Paz',
    municipality: 'Coroico',
    subscriptionPlan: 'semilla',
    subscriptionExpiry: '2026-06-19T00:00:00Z',
    createdAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'seller-cosecha',
    role: 'seller',
    businessName: 'Finca Caranavi Exports',
    email: 'ventas@caranavi-exports.bo',
    logo: 'https://i.pravatar.cc/150?img=61',
    banner: 'https://picsum.photos/seed/caranaviexports/1200/675',
    description: 'Productores y exportadores de café verde certificado. Trabajamos con productores de Caranavi, Nor Yungas y Sud Yungas.',
    department: 'La Paz',
    municipality: 'Caranavi',
    subscriptionPlan: 'cosecha',
    subscriptionExpiry: '2026-06-19T00:00:00Z',
    profileImages: [
      'https://picsum.photos/seed/ce-gallery1/800/600',
      'https://picsum.photos/seed/ce-gallery2/800/600',
      'https://picsum.photos/seed/ce-gallery3/800/600',
    ],
    createdAt: '2023-11-05T10:00:00Z',
  },
  {
    id: 'seller-exportacion',
    role: 'seller',
    businessName: 'Bolivia Premium Coffee',
    email: 'info@boliviapremiumcoffee.bo',
    logo: 'https://i.pravatar.cc/150?img=7',
    banner: 'https://picsum.photos/seed/bpcoffee/1200/675',
    description: 'Empresa líder en el ecosistema del café boliviano. Importamos maquinaria de clase mundial, ofrecemos servicios de consultoría y conectamos productores con mercados internacionales.',
    department: 'La Paz',
    municipality: 'La Paz',
    nit: '1234567890',
    subscriptionPlan: 'exportacion',
    subscriptionExpiry: '2026-06-19T00:00:00Z',
    profileImages: [
      'https://picsum.photos/seed/bpc-g1/800/600',
      'https://picsum.photos/seed/bpc-g2/800/600',
      'https://picsum.photos/seed/bpc-g3/800/600',
      'https://picsum.photos/seed/bpc-g4/800/600',
      'https://picsum.photos/seed/bpc-g5/800/600',
    ],
    about: {
      mission: 'Impulsar el desarrollo del ecosistema cafetero boliviano conectando a todos sus actores con herramientas, conocimiento y tecnología de clase mundial.',
      vision: 'Ser la referencia del café boliviano en América Latina, posicionando a Bolivia como origen de especialidad reconocido internacionalmente.',
      history: 'Fundada en 2018 por un equipo de productores y tostadores bolivianos, Bolivia Premium Coffee nació de la necesidad de profesionalizar la cadena del café en Bolivia. Comenzamos importando equipos de tostado y hoy somos una plataforma integral de servicios para todo el ecosistema.',
    },
    createdAt: '2022-06-01T10:00:00Z',
  },
]

export const ALL_MOCK_USERS = [...mockBuyers, ...mockSellers]

export function getMockUserById(id: string) {
  return ALL_MOCK_USERS.find((u) => u.id === id) ?? null
}

export const DEV_USERS = [
  { id: 'buyer-01',           label: 'Juan Pérez',              role: 'Comprador',  plan: null },
  { id: 'seller-free',        label: 'Agro Insumos Chapare',    role: 'Vendedor',   plan: 'Sin plan' },
  { id: 'seller-semilla',     label: 'Tostadora Yungas',        role: 'Vendedor',   plan: 'Semilla' },
  { id: 'seller-cosecha',     label: 'Finca Caranavi Exports',  role: 'Vendedor',   plan: 'Cosecha' },
  { id: 'seller-exportacion', label: 'Bolivia Premium Coffee',  role: 'Vendedor',   plan: 'Exportación' },
] as const
