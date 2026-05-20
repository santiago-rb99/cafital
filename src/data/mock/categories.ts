import { Category } from '@/types'

export const mockCategories: Category[] = [
  {
    id: 'A',
    name: 'Café e Insumos',
    description: 'Productos físicos relacionados con el grano y la producción cafetera.',
    recurringAvailable: true,
    subcategories: [
      { id: 'A-verde',         name: 'Café verde (grano sin tostar)',               categoryId: 'A' },
      { id: 'A-pergamino',     name: 'Café pergamino',                              categoryId: 'A' },
      { id: 'A-tostado',       name: 'Café tostado en grano',                       categoryId: 'A' },
      { id: 'A-molido',        name: 'Café molido',                                 categoryId: 'A' },
      { id: 'A-soluble',       name: 'Café soluble e instantáneo',                  categoryId: 'A' },
      { id: 'A-subproductos',  name: 'Subproductos del café (cáscara, pulpa, harina)', categoryId: 'A' },
      { id: 'A-plantas',       name: 'Plantas, semillas y material vegetativo',     categoryId: 'A' },
      { id: 'A-fertilizantes', name: 'Fertilizantes e insumos agrícolas',           categoryId: 'A' },
      { id: 'A-empaques',      name: 'Empaques y envases',                          categoryId: 'A' },
      { id: 'A-laboratorio',   name: 'Insumos de laboratorio y cata',               categoryId: 'A' },
    ],
  },
  {
    id: 'B',
    name: 'Maquinaria y Equipo',
    description: 'Equipos físicos para todas las etapas de la cadena del café.',
    recurringAvailable: false,
    subcategories: [
      { id: 'B-finca',         name: 'Equipos de finca y cosecha',                  categoryId: 'B' },
      { id: 'B-secado',        name: 'Equipos de secado',                           categoryId: 'B' },
      { id: 'B-tostadoras',    name: 'Tostadoras',                                  categoryId: 'B' },
      { id: 'B-molinos',       name: 'Molinos y molinillos profesionales',          categoryId: 'B' },
      { id: 'B-extraccion',    name: 'Equipos de extracción y barismo',             categoryId: 'B' },
      { id: 'B-accesorios',    name: 'Accesorios de barismo',                       categoryId: 'B' },
      { id: 'B-empaque',       name: 'Equipos de empaque y sellado',                categoryId: 'B' },
      { id: 'B-laboratorio',   name: 'Equipos de laboratorio y control de calidad', categoryId: 'B' },
      { id: 'B-silos',         name: 'Silos y almacenamiento',                      categoryId: 'B' },
      { id: 'B-repuestos',     name: 'Accesorios y repuestos generales',            categoryId: 'B' },
      { id: 'B-servicio',      name: 'Servicio técnico y mantenimiento',            categoryId: 'B' },
    ],
  },
  {
    id: 'C',
    name: 'Servicios Profesionales',
    description: 'Conocimiento, formación, consultoría y procesamiento especializado.',
    recurringAvailable: true,
    subcategories: [
      { id: 'C-agro',          name: 'Consultoría agronómica y de finca',           categoryId: 'C' },
      { id: 'C-calidad',       name: 'Consultoría de calidad y trazabilidad',       categoryId: 'C' },
      { id: 'C-procesamiento', name: 'Procesamiento por contrato',                  categoryId: 'C' },
      { id: 'C-barismo',       name: 'Formación en barismo',                        categoryId: 'C' },
      { id: 'C-tostado',       name: 'Formación en tostado',                        categoryId: 'C' },
      { id: 'C-catacion',      name: 'Formación en catación y análisis sensorial',  categoryId: 'C' },
      { id: 'C-negocios',      name: 'Consultoría de negocios para café',           categoryId: 'C' },
      { id: 'C-marca',         name: 'Diseño de marca y comunicación para café',   categoryId: 'C' },
      { id: 'C-logistica',     name: 'Logística y transporte de café',              categoryId: 'C' },
    ],
  },
  {
    id: 'D',
    name: 'Terrenos y Fincas',
    description: 'Solo bajo cotización vía WhatsApp. Sin carrito ni compra recurrente.',
    recurringAvailable: false,
    subcategories: [
      { id: 'D-produccion',    name: 'Finca cafetalera en producción',              categoryId: 'D' },
      { id: 'D-lote',          name: 'Lote agrícola para café',                     categoryId: 'D' },
      { id: 'D-infraestructura', name: 'Finca con infraestructura',                categoryId: 'D' },
      { id: 'D-terreno',       name: 'Terreno apto para café (sin plantaciones)',   categoryId: 'D' },
    ],
  },
]

export function getCategoryById(id: string) {
  return mockCategories.find((c) => c.id === id) ?? null
}

export function getSubcategoryById(id: string) {
  for (const cat of mockCategories) {
    const sub = cat.subcategories.find((s) => s.id === id)
    if (sub) return sub
  }
  return null
}
