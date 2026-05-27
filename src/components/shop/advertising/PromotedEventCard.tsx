'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, CalendarPlus, MapPin, Megaphone, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/ui/FormField'
import { EmptyState } from '@/components/ui/EmptyState'
import { CafeEvent, Seller } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { setPromotedEvent } from '@/lib/api/advertising'
import { formatDateShort, formatPrice } from '@/lib/utils'

interface PromotedEventCardProps {
  seller: Seller
  events: CafeEvent[]
}

const TYPE_LABEL: Record<CafeEvent['type'], string> = {
  taller: 'Taller',
  cata: 'Cata',
  capacitacion: 'Capacitación',
  feria: 'Feria',
  competencia: 'Competencia',
  networking: 'Networking',
  tour_finca: 'Tour de finca',
  otro: 'Evento',
}

export function PromotedEventCard({ seller, events }: PromotedEventCardProps) {
  const { refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const today = new Date().toISOString().slice(0, 10)
  const eligible = events
    .filter((e) => e.status === 'active' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))

  const initial = seller.promotedEventId ?? ''
  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>(initial)
  const [submitting, setSubmitting] = useState(false)

  if (seller.id !== trackedId) {
    setTrackedId(seller.id)
    setSelectedId(initial)
  }

  const selectedEvent = eligible.find((e) => e.id === selectedId) ?? null
  const dirty = selectedId !== initial

  async function onSave() {
    setSubmitting(true)
    try {
      await setPromotedEvent(seller.id, selectedId || null)
      refreshUser()
      showSuccess(
        selectedId
          ? 'Evento promocionado'
          : 'Dejaste de promocionar tu evento',
      )
    } catch (e) {
      showError(
        'No pudimos actualizar',
        e instanceof Error ? e.message : undefined,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="promote-event-heading"
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <header className="flex flex-col gap-2 border-b border-neutral-200 px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
            <Megaphone size={14} strokeWidth={1.5} aria-hidden />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">
            Promocionar evento
          </span>
        </div>
        <h2
          id="promote-event-heading"
          className="font-serif text-lg font-semibold text-neutral-900"
        >
          Destaca un evento en el hero
        </h2>
        <p className="text-sm text-neutral-500">
          Aparecerá en el hero de Eventos según la prioridad de tu plan.
        </p>
      </header>

      <div className="p-6">
        {eligible.length === 0 ? (
          <EmptyState
            icon={<CalendarPlus size={24} strokeWidth={1.5} />}
            title="Aún no tienes eventos activos"
            description="Crea un evento para poder destacarlo en el hero."
            action={
              <Link
                href="/mi-tienda/eventos/nuevo"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
              >
                <CalendarPlus size={16} strokeWidth={1.5} aria-hidden />
                Crear evento
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-5">
            <FormField label="Evento a promocionar" htmlFor="promoted-event-select">
              <Select
                id="promoted-event-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                options={[
                  { value: '', label: 'Ninguno — no destacar evento' },
                  ...eligible.map((ev) => ({
                    value: ev.id,
                    label: `${ev.name} · ${formatDateShort(ev.date)}`,
                  })),
                ]}
                placeholder="Elige un evento"
              />
            </FormField>

            {selectedEvent && <EventPreview event={selectedEvent} />}

            <div className="flex justify-end">
              <Button
                type="button"
                size="md"
                onClick={onSave}
                disabled={!dirty || submitting}
                loading={submitting}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function EventPreview({ event }: { event: CafeEvent }) {
  const isFree = event.price === 'free'
  const location =
    event.modality === 'virtual'
      ? 'Online'
      : [event.city, event.department].filter(Boolean).join(', ') || 'Presencial'

  return (
    <article className="flex flex-col gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white sm:flex-row">
      <div className="relative aspect-video w-full shrink-0 bg-neutral-100 sm:aspect-square sm:w-40">
        <Image
          src={event.image}
          alt={event.name}
          fill
          sizes="(min-width: 640px) 160px, 100vw"
          className="object-cover"
        />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-accent-500 px-1.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
          <Star size={11} strokeWidth={2} aria-hidden />
          Destacado
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:py-4 sm:pr-4 sm:pl-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          {TYPE_LABEL[event.type]}
        </span>
        <h3 className="line-clamp-2 font-serif text-base font-semibold text-neutral-900">
          {event.name}
        </h3>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
          <div className="inline-flex items-center gap-1">
            <Calendar size={12} strokeWidth={1.5} aria-hidden />
            <dd>
              {formatDateShort(event.date)} · {event.startTime}
            </dd>
          </div>
          <div className="inline-flex items-center gap-1">
            <MapPin size={12} strokeWidth={1.5} aria-hidden />
            <dd>{location}</dd>
          </div>
        </dl>
        <p className="text-sm font-semibold text-neutral-900">
          {isFree ? 'Entrada gratuita' : formatPrice(event.price as number)}
        </p>
      </div>
    </article>
  )
}
