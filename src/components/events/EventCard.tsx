import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Users, Video } from 'lucide-react'
import { CafeEvent } from '@/types'
import { cn, formatDateShort, formatPrice } from '@/lib/utils'

interface EventCardProps {
  event: CafeEvent
  organizerName: string
  className?: string
}

const MODALITY_LABEL: Record<CafeEvent['modality'], string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrido: 'Híbrido',
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

export function EventCard({ event, organizerName, className }: EventCardProps) {
  const isFree = event.price === 'free'
  const remainingSpots = event.capacity
    ? Math.max(0, event.capacity - event.registeredCount)
    : null
  const lowSpots = remainingSpots !== null && remainingSpots > 0 && remainingSpots <= 5
  const soldOut = remainingSpots === 0

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <Link
        href={`/eventos/${event.id}`}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
      >
        <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
          <Image
            src={event.image}
            alt={event.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute left-2 top-2 inline-flex items-center rounded bg-white/95 px-2 py-0.5 text-[11px] font-medium text-neutral-900 shadow-xs">
            {TYPE_LABEL[event.type]}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
            {event.name}
          </h3>
          <p className="text-xs text-neutral-500">por {organizerName}</p>

          <dl className="mt-1 flex flex-col gap-1.5 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} strokeWidth={1.5} aria-hidden />
              <dt className="sr-only">Fecha</dt>
              <dd>
                {formatDateShort(event.date)} · {event.startTime}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              {event.modality === 'virtual' ? (
                <Video size={13} strokeWidth={1.5} aria-hidden />
              ) : (
                <MapPin size={13} strokeWidth={1.5} aria-hidden />
              )}
              <dt className="sr-only">Modalidad</dt>
              <dd className="truncate">
                {MODALITY_LABEL[event.modality]}
                {event.city ? ` · ${event.city}` : ''}
              </dd>
            </div>
            {event.capacity && (
              <div className="flex items-center gap-1.5">
                <Users size={13} strokeWidth={1.5} aria-hidden />
                <dt className="sr-only">Cupos</dt>
                <dd>
                  {soldOut
                    ? 'Sin cupos disponibles'
                    : `${remainingSpots} de ${event.capacity} cupos disponibles`}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-auto flex items-center justify-between pt-3">
            <span
              className={cn(
                'text-base font-semibold tabular-nums',
                isFree ? 'text-primary-700' : 'text-neutral-900'
              )}
            >
              {isFree ? 'Gratuito' : formatPrice(event.price as number)}
            </span>
            {(lowSpots || soldOut) && (
              <span
                className={cn(
                  'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium',
                  soldOut
                    ? 'bg-[#FDEAEA] text-error-dark'
                    : 'bg-accent-100 text-accent-900'
                )}
              >
                {soldOut ? 'Sin cupos' : `Quedan ${remainingSpots}`}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
