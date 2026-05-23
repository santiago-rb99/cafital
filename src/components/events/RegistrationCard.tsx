'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  X,
} from 'lucide-react'

import { CafeEvent } from '@/types'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { cancelRegistration, EventRegistration } from '@/lib/api/events'
import { cn, formatDate, formatPrice } from '@/lib/utils'

import { EVENT_MODALITY_LABEL, EVENT_TYPE_LABEL } from './eventFiltersState'

interface RegistrationCardProps {
  registration: EventRegistration
  event: CafeEvent
  onChange: () => void
  className?: string
}

export function RegistrationCard({
  registration,
  event,
  onChange,
  className,
}: RegistrationCardProps) {
  const { showSuccess, showError } = useToast()
  const [confirmCancel, setConfirmCancel] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const isPast = event.date < today
  const isFree = event.price === 'free'
  const totalPaid =
    isFree || typeof event.price !== 'number'
      ? 0
      : event.price * registration.quantity

  async function onConfirmCancel() {
    try {
      await cancelRegistration(registration.id)
      showSuccess('Inscripción cancelada')
      setConfirmCancel(false)
      onChange()
    } catch {
      showError('No pudimos cancelar la inscripción')
      setConfirmCancel(false)
    }
  }

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6',
        isPast && 'bg-neutral-100/40',
        className
      )}
    >
      <div className="flex gap-4">
        <Link
          href={`/eventos/${event.id}`}
          className="relative aspect-16/10 h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:h-24 sm:w-40"
        >
          <Image
            src={event.image}
            alt={event.name}
            fill
            sizes="160px"
            className="object-cover"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-900">
              {EVENT_TYPE_LABEL[event.type]}
            </span>
            {isPast && (
              <span className="inline-flex items-center rounded bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                Finalizado
              </span>
            )}
          </div>
          <Link
            href={`/eventos/${event.id}`}
            className="line-clamp-2 text-sm font-semibold text-neutral-900 hover:text-primary-700 focus:outline-none focus-visible:underline"
          >
            {event.name}
          </Link>
          <p className="text-xs text-neutral-500">por {event.organizerId}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4 text-xs sm:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <dt className="font-medium uppercase tracking-wider text-neutral-500">
            Fecha
          </dt>
          <dd className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900">
            <Calendar size={12} strokeWidth={1.5} aria-hidden />
            {formatDate(event.date)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-medium uppercase tracking-wider text-neutral-500">
            Hora
          </dt>
          <dd className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900">
            <Clock size={12} strokeWidth={1.5} aria-hidden />
            {event.startTime}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-medium uppercase tracking-wider text-neutral-500">
            Modalidad
          </dt>
          <dd className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900">
            {event.modality === 'virtual' ? (
              <Video size={12} strokeWidth={1.5} aria-hidden />
            ) : (
              <MapPin size={12} strokeWidth={1.5} aria-hidden />
            )}
            {EVENT_MODALITY_LABEL[event.modality]}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-medium uppercase tracking-wider text-neutral-500">
            Entradas
          </dt>
          <dd className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900">
            <Users size={12} strokeWidth={1.5} aria-hidden />
            {registration.quantity}
          </dd>
        </div>
      </dl>

      <footer className="flex flex-wrap items-end justify-between gap-3 border-t border-neutral-200 pt-3">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Pagado</span>
          <span className="text-base font-semibold tabular-nums text-neutral-900">
            {isFree ? 'Gratuito' : formatPrice(totalPaid)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/eventos/${event.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            Ver evento
            <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
          </Link>
          {!isPast && (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              <X size={14} strokeWidth={1.5} aria-hidden />
              Cancelar
            </button>
          )}
        </div>
      </footer>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={onConfirmCancel}
        title="¿Cancelar tu inscripción?"
        description={
          isFree
            ? 'Liberarás tu cupo. Puedes volver a inscribirte si quedan lugares.'
            : 'Liberarás tu cupo. La devolución del pago la coordina el organizador.'
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        variant="destructive"
      />
    </article>
  )
}
