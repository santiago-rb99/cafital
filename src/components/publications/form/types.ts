import {
  PriceMode,
  ProductUnit,
  PublicationCategory,
  PublicationStatus,
} from '@/types'
import { DropzoneImage } from '@/components/ui/ImageDropzone'

/**
 * Estado del formulario de publicación.
 *
 * Es independiente del modelo `Publication` para poder manejar drafts
 * incompletos (categoría sin elegir, números vacíos, fotos como ObjectURL).
 * Al publicar se serializa al modelo final.
 */
export interface PublicationFormData {
  category: PublicationCategory | ''
  subcategory: string

  title: string
  description: string
  variants: string
  video: string
  photos: DropzoneImage[]

  attributes: Record<string, string | string[]>

  priceMode: PriceMode
  units: PublicationUnitDraft[]
  coverage: string[]
  inventoryEnabled: boolean
  inventory: number | ''
  discountEnabled: boolean
  discount: number | ''
  recurringEnabled: boolean
}

/** Variante "edición" de ProductUnit con strings vacíos permitidos. */
export interface PublicationUnitDraft {
  id: string
  unit: string
  price: number | ''
  minQuantity: number | ''
}

export const EMPTY_FORM: PublicationFormData = {
  category: '',
  subcategory: '',
  title: '',
  description: '',
  variants: '',
  video: '',
  photos: [],
  attributes: {},
  priceMode: 'price',
  units: [],
  coverage: [],
  inventoryEnabled: false,
  inventory: '',
  discountEnabled: false,
  discount: '',
  recurringEnabled: false,
}

export type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface StepMeta {
  id: StepId
  title: string
  subtitle: string
}

export const STEPS: StepMeta[] = [
  { id: 1, title: 'Categoría', subtitle: 'Qué publicarás' },
  { id: 2, title: 'Subcategoría', subtitle: 'Afinar el tipo' },
  { id: 3, title: 'Información base', subtitle: 'Fotos, título, descripción' },
  { id: 4, title: 'Características', subtitle: 'Atributos del producto' },
  { id: 5, title: 'Precio y logística', subtitle: 'Cómo se vende' },
  { id: 6, title: 'Vista previa', subtitle: 'Cómo lo verá un comprador' },
  { id: 7, title: 'Publicar', subtitle: 'Estado final' },
]

/** Saneado: convierte un draft a las ProductUnits del modelo final. */
export function toProductUnits(drafts: PublicationUnitDraft[]): ProductUnit[] {
  return drafts
    .filter((u) => u.unit.trim().length > 0)
    .map((u) => ({
      unit: u.unit.trim(),
      price: typeof u.price === 'number' ? u.price : 0,
      minQuantity: typeof u.minQuantity === 'number' ? u.minQuantity : 1,
    }))
}

/** Convierte un Publication existente al formato del formulario. */
export function publicationToFormData(p: {
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
}): PublicationFormData {
  return {
    category: p.category,
    subcategory: p.subcategory,
    title: p.title,
    description: p.description,
    variants: p.variants ?? '',
    video: p.video ?? '',
    photos: p.photos.map((url, i) => ({ id: `existing-${i}`, url })),
    attributes: { ...p.attributes },
    priceMode: p.priceMode,
    units: (p.units ?? []).map((u, i) => ({
      id: `unit-${i}`,
      unit: u.unit,
      price: u.price,
      minQuantity: u.minQuantity,
    })),
    coverage: [...p.coverage],
    inventoryEnabled: typeof p.inventory === 'number',
    inventory: typeof p.inventory === 'number' ? p.inventory : '',
    discountEnabled: typeof p.discount === 'number' && p.discount > 0,
    discount: typeof p.discount === 'number' ? p.discount : '',
    recurringEnabled: p.recurringAvailable,
  }
}

/** Sirve para los tipos de status que el form puede aplicar al publicar. */
export type PublishMode = Extract<PublicationStatus, 'active' | 'draft'>
