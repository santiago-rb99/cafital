'use client'

import { ChangeEvent, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Pencil, X } from 'lucide-react'

import { CafeEvent, EventModality, EventType, Seller } from '@/types'
import { Button } from '@/components/ui/Button'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { DatePicker } from '@/components/ui/DatePicker'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { TimePicker } from '@/components/ui/TimePicker'
import { Toggle } from '@/components/ui/Toggle'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createEvent, updateEvent } from '@/lib/api/events'
import { DEPARTMENTS } from '@/lib/utils'
import {
  EVENT_MODALITY_LABEL,
  EVENT_TYPE_LABEL,
} from '@/components/events/eventFiltersState'

interface Props {
  initial?: CafeEvent
}

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = (
  Object.keys(EVENT_TYPE_LABEL) as EventType[]
).map((v) => ({ value: v, label: EVENT_TYPE_LABEL[v] }))

const MODALITY_OPTIONS: { value: EventModality; label: string }[] = (
  Object.keys(EVENT_MODALITY_LABEL) as EventModality[]
).map((v) => ({ value: v, label: EVENT_MODALITY_LABEL[v] }))

const NAME_MAX = 80
const DESC_MAX = 1500

interface FormState {
  name: string
  imageUrl: string | null
  type: EventType
  description: string
  modality: EventModality
  department: string
  city: string
  address: string
  eventLink: string
  date: string
  startTime: string
  endTime: string
  isFree: boolean
  price: number | ''
  hasCapacity: boolean
  capacity: number | ''
  registrationDeadline: string
}

function initialFromEvent(ev: CafeEvent): FormState {
  return {
    name: ev.name,
    imageUrl: ev.image,
    type: ev.type,
    description: ev.description,
    modality: ev.modality,
    department: ev.department ?? '',
    city: ev.city ?? '',
    address: ev.address ?? '',
    eventLink: ev.eventLink ?? '',
    date: ev.date,
    startTime: ev.startTime,
    endTime: ev.endTime ?? '',
    isFree: ev.price === 'free',
    price: typeof ev.price === 'number' ? ev.price : '',
    hasCapacity: typeof ev.capacity === 'number',
    capacity: typeof ev.capacity === 'number' ? ev.capacity : '',
    registrationDeadline: ev.registrationDeadline ?? '',
  }
}

const EMPTY: FormState = {
  name: '',
  imageUrl: null,
  type: 'taller',
  description: '',
  modality: 'presencial',
  department: '',
  city: '',
  address: '',
  eventLink: '',
  date: '',
  startTime: '',
  endTime: '',
  isFree: true,
  price: '',
  hasCapacity: false,
  capacity: '',
  registrationDeadline: '',
}

export function EventForm({ initial }: Props) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const isEditing = Boolean(initial)
  const seller = (user?.role === 'seller' ? (user as Seller) : null) ?? null

  const [data, setData] = useState<FormState>(() =>
    initial ? initialFromEvent(initial) : EMPTY
  )
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [submitting, setSubmitting] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const imageObjectUrl = useRef<string | null>(null)

  function patch(p: Partial<FormState>) {
    setData((prev) => ({ ...prev, ...p }))
  }

  function pickImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (imageObjectUrl.current) URL.revokeObjectURL(imageObjectUrl.current)
    const url = URL.createObjectURL(file)
    imageObjectUrl.current = url
    patch({ imageUrl: url })
    e.target.value = ''
  }

  function clearImage() {
    if (imageObjectUrl.current) {
      URL.revokeObjectURL(imageObjectUrl.current)
      imageObjectUrl.current = null
    }
    patch({ imageUrl: null })
  }

  function validate(): boolean {
    const next: Record<string, string | undefined> = {}
    if (!data.name.trim()) next.name = 'Ingresa un nombre para el evento.'
    else if (data.name.length > NAME_MAX) next.name = `Máximo ${NAME_MAX} caracteres.`

    if (!data.imageUrl) next.image = 'Sube una imagen para el evento.'
    if (!data.description.trim()) next.description = 'Describe el evento.'

    if (data.modality !== 'virtual') {
      if (!data.department) next.department = 'Selecciona el departamento.'
      if (!data.city.trim()) next.city = 'Indica la ciudad.'
    }
    if (data.modality !== 'presencial') {
      if (!data.eventLink.trim())
        next.eventLink = 'Agrega el enlace del evento.'
      else if (!/^https?:\/\//.test(data.eventLink.trim()))
        next.eventLink = 'El enlace debe comenzar con http(s).'
    }

    if (!data.date) next.date = 'Elige la fecha del evento.'
    if (!data.startTime) next.startTime = 'Elige la hora de inicio.'
    if (data.endTime && data.startTime && data.endTime <= data.startTime)
      next.endTime = 'La hora de fin debe ser posterior a la de inicio.'

    if (!data.isFree) {
      if (typeof data.price !== 'number' || data.price <= 0)
        next.price = 'Ingresa un precio mayor a 0 o marca como gratuito.'
    }

    if (data.hasCapacity) {
      if (typeof data.capacity !== 'number' || data.capacity < 1)
        next.capacity = 'La capacidad debe ser al menos 1.'
    }

    if (data.registrationDeadline && data.date &&
        data.registrationDeadline > data.date)
      next.registrationDeadline =
        'La fecha límite debe ser anterior o igual a la del evento.'

    setErrors(next)
    return Object.keys(next).filter((k) => next[k]).length === 0
  }

  async function onSubmit(asDraft: boolean) {
    if (!seller) return
    if (!validate()) {
      showError('Faltan datos por completar', 'Revisa los campos marcados.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        organizerId: seller.id,
        name: data.name.trim(),
        image: data.imageUrl ?? '',
        type: data.type,
        description: data.description.trim(),
        modality: data.modality,
        department:
          data.modality !== 'virtual' ? data.department || undefined : undefined,
        city:
          data.modality !== 'virtual' ? data.city.trim() || undefined : undefined,
        address:
          data.modality !== 'virtual' ? data.address.trim() || undefined : undefined,
        eventLink:
          data.modality !== 'presencial'
            ? data.eventLink.trim() || undefined
            : undefined,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime || undefined,
        price: data.isFree
          ? ('free' as const)
          : (data.price as number),
        capacity:
          data.hasCapacity && typeof data.capacity === 'number'
            ? data.capacity
            : undefined,
        registrationDeadline: data.registrationDeadline || undefined,
        status: asDraft ? ('draft' as const) : ('active' as const),
      }

      if (initial) {
        await updateEvent(initial.id, payload)
        showSuccess(
          asDraft
            ? 'Cambios guardados como borrador'
            : 'Evento actualizado'
        )
      } else {
        await createEvent(payload)
        showSuccess(asDraft ? 'Borrador guardado' : '¡Evento creado!')
      }
      router.push('/mi-tienda/eventos')
    } catch {
      showError('No pudimos guardar el evento')
      setSubmitting(false)
    }
  }

  if (!seller) return null

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
          {isEditing ? 'Editar evento' : 'Nuevo evento'}
        </h1>
        <p className="text-sm text-neutral-500">
          Taller, cata, capacitación o feria que organices aparecerá en la
          sección de eventos.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void onSubmit(false)
        }}
        noValidate
        className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* IMAGEN */}
        <FormField
          label="Imagen del evento"
          required
          error={errors.image}
          helper={
            !errors.image
              ? 'Aspecto 16:10. Se mostrará en la lista y en el detalle.'
              : undefined
          }
        >
          <div className="flex flex-col gap-3">
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
              {data.imageUrl ? (
                <Image
                  src={data.imageUrl}
                  alt="Imagen del evento"
                  fill
                  sizes="(min-width: 768px) 720px, 100vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAFAFA_25%,transparent_25%,transparent_50%,#FAFAFA_50%,#FAFAFA_75%,transparent_75%,transparent)] bg-size-[14px_14px]" />
              )}
              <div className="absolute right-3 top-3 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={submitting}
                  aria-label={data.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white/95 px-2.5 py-1.5 text-[13px] font-medium text-neutral-900 shadow-sm transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {data.imageUrl ? (
                    <Pencil size={14} strokeWidth={1.5} aria-hidden />
                  ) : (
                    <Camera size={14} strokeWidth={1.5} aria-hidden />
                  )}
                  <span className="hidden sm:inline">
                    {data.imageUrl ? 'Cambiar' : 'Subir'}
                  </span>
                </button>
                {data.imageUrl && (
                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={submitting}
                    aria-label="Quitar imagen"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white/95 text-neutral-500 shadow-sm hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={14} strokeWidth={1.5} aria-hidden />
                  </button>
                )}
              </div>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Subir imagen del evento"
              onChange={pickImage}
            />
          </div>
        </FormField>

        {/* DATOS BÁSICOS */}
        <fieldset
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
          disabled={submitting}
        >
          <legend className="sr-only">Datos del evento</legend>

          <FormField
            label="Nombre del evento"
            required
            error={errors.name}
            helper={
              !errors.name
                ? `${NAME_MAX - data.name.length} caracteres restantes.`
                : undefined
            }
            className="sm:col-span-2"
          >
            <Input
              type="text"
              value={data.name}
              onChange={(e) => patch({ name: e.target.value })}
              maxLength={NAME_MAX + 10}
              placeholder="Taller de extracción avanzada"
            />
          </FormField>

          <FormField label="Tipo de evento" required>
            <Select
              value={data.type}
              onChange={(e) => patch({ type: e.target.value as EventType })}
              options={EVENT_TYPE_OPTIONS}
            />
          </FormField>

          <FormField label="Modalidad" required>
            <Select
              value={data.modality}
              onChange={(e) =>
                patch({ modality: e.target.value as EventModality })
              }
              options={MODALITY_OPTIONS}
            />
          </FormField>

          <FormField
            label="Descripción"
            required
            error={errors.description}
            helper={
              !errors.description
                ? `${data.description.length} / ${DESC_MAX} caracteres.`
                : undefined
            }
            className="sm:col-span-2"
          >
            <Textarea
              value={data.description}
              onChange={(e) => patch({ description: e.target.value })}
              maxLength={DESC_MAX + 20}
              rows={5}
              placeholder="Qué incluye, a quién va dirigido, qué se llevan los asistentes..."
            />
          </FormField>
        </fieldset>

        {/* UBICACIÓN */}
        {data.modality !== 'virtual' && (
          <fieldset
            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            disabled={submitting}
          >
            <legend className="text-[13px] font-semibold text-neutral-900 sm:col-span-2">
              Ubicación presencial
            </legend>

            <FormField label="Departamento" required error={errors.department}>
              <Select
                value={data.department}
                onChange={(e) => patch({ department: e.target.value })}
                placeholder="Selecciona"
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              />
            </FormField>

            <FormField label="Ciudad" required error={errors.city}>
              <Input
                type="text"
                value={data.city}
                onChange={(e) => patch({ city: e.target.value })}
                placeholder="La Paz"
                autoComplete="address-level2"
              />
            </FormField>

            <FormField
              label="Dirección"
              optional
              className="sm:col-span-2"
            >
              <Input
                type="text"
                value={data.address}
                onChange={(e) => patch({ address: e.target.value })}
                placeholder="Av. Sánchez Lima 2345"
                autoComplete="street-address"
              />
            </FormField>
          </fieldset>
        )}

        {/* LINK */}
        {data.modality !== 'presencial' && (
          <FormField
            label="Enlace del evento"
            required
            error={errors.eventLink}
            helper={
              !errors.eventLink
                ? 'Zoom, Meet, Teams, o cualquier plataforma.'
                : undefined
            }
          >
            <Input
              type="url"
              value={data.eventLink}
              onChange={(e) => patch({ eventLink: e.target.value })}
              placeholder="https://us02web.zoom.us/j/..."
              inputMode="url"
            />
          </FormField>
        )}

        {/* FECHA Y HORA */}
        <fieldset
          className="grid grid-cols-1 gap-5 sm:grid-cols-3"
          disabled={submitting}
        >
          <legend className="text-[13px] font-semibold text-neutral-900 sm:col-span-3">
            Fecha y hora
          </legend>

          <FormField label="Fecha" required error={errors.date}>
            <DatePicker
              value={data.date}
              onChange={(e) => patch({ date: e.target.value })}
            />
          </FormField>

          <FormField label="Hora inicio" required error={errors.startTime}>
            <TimePicker
              value={data.startTime}
              onChange={(e) => patch({ startTime: e.target.value })}
            />
          </FormField>

          <FormField label="Hora fin" optional error={errors.endTime}>
            <TimePicker
              value={data.endTime}
              onChange={(e) => patch({ endTime: e.target.value })}
            />
          </FormField>

          <FormField
            label="Fecha límite de inscripción"
            optional
            error={errors.registrationDeadline}
            className="sm:col-span-3"
          >
            <DatePicker
              value={data.registrationDeadline}
              onChange={(e) =>
                patch({ registrationDeadline: e.target.value })
              }
            />
          </FormField>
        </fieldset>

        {/* PRECIO Y CUPOS */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <Toggle
              checked={data.isFree}
              onChange={(v) =>
                patch({ isFree: v, price: v ? '' : data.price })
              }
              label="Evento gratuito"
              description="Si está activo, los asistentes se inscriben sin pago."
            />
            {!data.isFree && (
              <div className="mt-3 border-t border-neutral-200 pt-3">
                <FormField label="Precio por entrada" required error={errors.price}>
                  <CurrencyInput
                    value={data.price}
                    onChange={(v) => patch({ price: v })}
                  />
                </FormField>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <Toggle
              checked={data.hasCapacity}
              onChange={(v) =>
                patch({ hasCapacity: v, capacity: v ? data.capacity || 20 : '' })
              }
              label="Limitar cupos"
              description="Define cuántas personas pueden inscribirse como máximo."
            />
            {data.hasCapacity && (
              <div className="mt-3 border-t border-neutral-200 pt-3">
                <FormField label="Cupos disponibles" required error={errors.capacity}>
                  <NumberInput
                    value={data.capacity}
                    onChange={(v) => patch({ capacity: v })}
                    min={1}
                    suffix="personas"
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void onSubmit(true)}
            disabled={submitting}
            loading={submitting}
          >
            Guardar como borrador
          </Button>
          <Button type="submit" size="md" disabled={submitting} loading={submitting}>
            {isEditing ? 'Guardar y publicar' : 'Publicar evento'}
          </Button>
        </div>
      </form>
    </div>
  )
}
