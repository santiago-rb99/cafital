'use client'

import { FormField } from '@/components/ui/FormField'
import { ImageDropzone } from '@/components/ui/ImageDropzone'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { PublicationFormData } from '../types'
import { StepErrors } from '../validation'

interface Props {
  data: PublicationFormData
  onChange: (patch: Partial<PublicationFormData>) => void
  errors: StepErrors
}

const TITLE_MAX = 80
const DESCRIPTION_MAX = 2000
const VARIANTS_MAX = 800

export function Step3Base({ data, onChange, errors }: Props) {
  const titleLen = data.title.length
  const descLen = data.description.length
  const variantsLen = data.variants.length

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-neutral-900">
          Información base
        </h2>
        <p className="text-sm text-neutral-500">
          Esto es lo primero que verá el comprador en tu publicación.
        </p>
      </header>

      <FormField
        label="Fotos"
        required
        error={errors.photos}
        helper={
          !errors.photos
            ? 'Hasta 8 imágenes. La primera será la principal.'
            : undefined
        }
      >
        <ImageDropzone
          value={data.photos}
          onChange={(photos) => onChange({ photos })}
          maxImages={8}
          invalid={Boolean(errors.photos)}
        />
      </FormField>

      <FormField
        label="Título"
        required
        error={errors.title}
        helper={
          !errors.title
            ? `${TITLE_MAX - titleLen} caracteres restantes.`
            : undefined
        }
      >
        <Input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          maxLength={TITLE_MAX + 10}
          placeholder="Café Verde Caranavi Gesha Natural 2025"
          aria-required="true"
        />
      </FormField>

      <FormField
        label="Descripción"
        required
        error={errors.description}
        helper={
          !errors.description
            ? `${descLen} / ${DESCRIPTION_MAX} caracteres.`
            : undefined
        }
      >
        <Textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          maxLength={DESCRIPTION_MAX + 20}
          rows={6}
          placeholder="Cuenta de qué se trata: origen, características, para quién es ideal."
        />
      </FormField>

      <FormField
        label="Variantes disponibles"
        optional
        helper={
          variantsLen > 0
            ? `${variantsLen} / ${VARIANTS_MAX} caracteres.`
            : 'Listar combinaciones, presentaciones, tamaños o sabores adicionales.'
        }
      >
        <Textarea
          value={data.variants}
          onChange={(e) => onChange({ variants: e.target.value })}
          maxLength={VARIANTS_MAX + 20}
          rows={3}
          placeholder="Bolsa 250g, 500g y 1kg / Molienda fina o gruesa"
        />
      </FormField>

      <FormField
        label="Video"
        optional
        error={errors.video}
        helper={
          !errors.video
            ? 'Enlace de YouTube o Vimeo donde se vea la publicación.'
            : undefined
        }
      >
        <Input
          type="url"
          value={data.video}
          onChange={(e) => onChange({ video: e.target.value })}
          placeholder="https://youtu.be/..."
          inputMode="url"
        />
      </FormField>
    </div>
  )
}
