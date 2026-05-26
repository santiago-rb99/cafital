'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Video,
  X,
} from 'lucide-react'

import { CafeEvent } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/contexts/ToastContext'
import { cancelRegistration, EventRegistration } from '@/lib/api/events'
import { cn, formatDate, formatPrice } from '@/lib/utils'

import { EVENT_MODALITY_LABEL, EVENT_TYPE_LABEL } from './eventFiltersState'
import { refundTierFor, type RefundTone } from './cancellationPolicy'

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
  const [cancelling, setCancelling] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const isPast = event.date < today
  const isFree = event.price === 'free'
  const totalPaid =
    isFree || typeof event.price !== 'number'
      ? 0
      : event.price * registration.quantity

  const refund = useMemo(() => refundTierFor(event.date), [event.date])
  const refundAmount = isFree ? 0 : (totalPaid * refund.percent) / 100

  async function onConfirmCancel() {
    setCancelling(true)
    try {
      await cancelRegistration(registration.id)
      showSuccess(
        'Inscripción cancelada',
        isFree
          ? 'Liberaste tu cupo.'
          : refund.percent > 0
            ? `Te reembolsaremos ${formatPrice(refundAmount)} en 3 a 10 días hábiles.`
            : 'El cupo fue liberado. No corresponde reembolso por el plazo.'
      )
      setConfirmCancel(false)
      onChange()
    } catch {
      showError('No pudimos cancelar la inscripción')
    } finally {
      setCancelling(false)
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

      <Modal
        open={confirmCancel}
        onClose={cancelling ? () => undefined : () => setConfirmCancel(false)}
        title="¿Cancelar tu inscripción?"
        description={event.name}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmCancel(false)}
              disabled={cancelling}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmCancel}
              loading={cancelling}
            >
              Sí, cancelar inscripción
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {isFree ? (
            <p className="text-sm leading-relaxed text-neutral-900">
              Liberarás tu cupo. Puedes volver a inscribirte mientras queden
              lugares disponibles.
            </p>
          ) : (
            <>
              <RefundTierBanner
                tone={refund.tone}
                label={refund.label}
                message={refund.message}
              />

              <dl className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-100/50 p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Pagado</dt>
                  <dd className="tabular-nums font-medium text-neutral-900">
                    {formatPrice(totalPaid)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">
                    Reembolso ({refund.percent}%)
                  </dt>
                  <dd
                    className={cn(
                      'font-serif text-lg font-semibold tabular-nums',
                      refund.percent > 0 ? 'text-primary-700' : 'text-neutral-300'
                    )}
                  >
                    {formatPrice(refundAmount)}
                  </dd>
                </div>
              </dl>

              {refund.percent > 0 && (
                <p className="text-xs leading-relaxed text-neutral-500">
                  Recibirás el reembolso en tu método de pago original entre 3
                  y 10 días hábiles.
                </p>
              )}
            </>
          )}
        </div>
      </Modal>
    </article>
  )
}

function RefundTierBanner({
  tone,
  label,
  message,
}: {
  tone: RefundTone
  label: string
  message: string
}) {
  const config = {
    success: {
      Icon: CheckCircle2,
      box: 'border-primary-100 bg-primary-50',
      iconColor: 'text-primary-500',
      titleColor: 'text-primary-900',
      bodyColor: 'text-primary-700',
    },
    warning: {
      Icon: AlertTriangle,
      box: 'border-accent-300/40 bg-accent-100',
      iconColor: 'text-accent-700',
      titleColor: 'text-accent-900',
      bodyColor: 'text-accent-900/85',
    },
    danger: {
      Icon: AlertTriangle,
      box: 'border-[#F5BFBF] bg-[#FDEAEA]',
      iconColor: 'text-[#9A1F1F]',
      titleColor: 'text-[#601212]',
      bodyColor: 'text-[#9A1F1F]',
    },
  } as const
  const c = config[tone]
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'danger' ? AlertTriangle : AlertTriangle
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        c.box
      )}
    >
      <Icon
        size={20}
        strokeWidth={1.5}
        className={cn('mt-0.5 shrink-0', c.iconColor)}
        aria-hidden
      />
      <div className="flex flex-col gap-1">
        <p className={cn('text-sm font-semibold', c.titleColor)}>{label}</p>
        <p className={cn('text-xs leading-relaxed', c.bodyColor)}>{message}</p>
      </div>
    </div>
  )
}
