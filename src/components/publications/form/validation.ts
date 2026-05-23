import { PUBLICATION_ATTRIBUTES } from '@/data/schemas/publicationAttributes'
import { PublicationFormData, StepId } from './types'

export type StepErrors = Record<string, string>

const TITLE_MAX = 80

export function validateStep(
  step: StepId,
  data: PublicationFormData
): StepErrors {
  switch (step) {
    case 1:
      return data.category ? {} : { category: 'Selecciona una categoría para continuar.' }

    case 2:
      return data.subcategory
        ? {}
        : { subcategory: 'Selecciona una subcategoría para continuar.' }

    case 3: {
      const errors: StepErrors = {}
      if (data.photos.length === 0) errors.photos = 'Sube al menos una foto.'
      if (!data.title.trim()) errors.title = 'Ingresa un título.'
      else if (data.title.length > TITLE_MAX)
        errors.title = `Máximo ${TITLE_MAX} caracteres.`
      if (!data.description.trim())
        errors.description = 'Describe tu publicación.'
      if (data.video && !isValidVideoUrl(data.video))
        errors.video = 'Usa un enlace válido de YouTube o Vimeo.'
      return errors
    }

    case 4: {
      const errors: StepErrors = {}
      const schema = PUBLICATION_ATTRIBUTES[data.subcategory] ?? []
      for (const field of schema) {
        if (!field.required) continue
        const raw = data.attributes[field.key]
        if (raw === undefined || raw === '' ||
            (Array.isArray(raw) && raw.length === 0)) {
          errors[field.key] = `${field.label ?? field.key} es obligatorio.`
        }
      }
      return errors
    }

    case 5: {
      const errors: StepErrors = {}
      if (data.category === 'D') return errors // Terrenos: paso simplificado

      if (data.priceMode === 'price') {
        const valid = data.units.filter((u) => u.unit.trim() !== '')
        if (valid.length === 0)
          errors.units = 'Agrega al menos una unidad de venta.'
        for (const u of valid) {
          if (typeof u.price !== 'number' || u.price <= 0) {
            errors.units = 'Cada unidad debe tener un precio mayor a 0.'
            break
          }
          if (typeof u.minQuantity !== 'number' || u.minQuantity < 1) {
            errors.units = 'La cantidad mínima debe ser al menos 1.'
            break
          }
        }
      }

      if (data.coverage.length === 0)
        errors.coverage = 'Selecciona al menos un departamento de cobertura.'

      if (data.inventoryEnabled) {
        if (typeof data.inventory !== 'number' || data.inventory < 0)
          errors.inventory = 'Inventario inválido.'
      }
      if (data.discountEnabled) {
        if (
          typeof data.discount !== 'number' ||
          data.discount <= 0 ||
          data.discount > 90
        )
          errors.discount = 'El descuento debe estar entre 1 y 90%.'
      }
      return errors
    }

    case 6:
    case 7:
      return {}

    default:
      return {}
  }
}

function isValidVideoUrl(url: string): boolean {
  const trimmed = url.trim()
  return /youtube\.com|youtu\.be|vimeo\.com/.test(trimmed) &&
    /^https?:\/\//.test(trimmed)
}

/** Indica si un paso es navegable hacia adelante (todos los anteriores válidos). */
export function canReachStep(target: StepId, data: PublicationFormData): boolean {
  for (let s = 1 as StepId; s < target; s = (s + 1) as StepId) {
    if (Object.keys(validateStep(s, data)).length > 0) return false
  }
  return true
}
