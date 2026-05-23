'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  Check,
  Pause,
  Pencil,
  Play,
  Repeat2,
  X,
} from 'lucide-react'

import { RecurringFrequency, RecurringSubscription } from '@/types'
import { Select } from '@/components/ui/Select'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import {
  cancelRecurring,
  pauseRecurring,
  resumeRecurring,
  updateRecurring,
} from '@/lib/api/recurring'
import { cn, formatDate, formatPrice } from '@/lib/utils'

interface RecurringSubscriptionCardProps {
  subscription: RecurringSubscription
  onChange: () => void
  className?: string
}

const FREQUENCY_LABEL: Record<RecurringFrequency, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  bimensual: 'Bimensual',
}

const FREQUENCY_OPTIONS = (Object.keys(FREQUENCY_LABEL) as RecurringFrequency[]).map(
  (k) => ({ value: k, label: FREQUENCY_LABEL[k] })
)

export function RecurringSubscriptionCard({
  subscription,
  onChange,
  className,
}: RecurringSubscriptionCardProps) {
  const { showSuccess, showError } = useToast()
  const [pending, startTransition] = useTransition()

  const [editing, setEditing] = useState(false)
  const [draftFrequency, setDraftFrequency] = useState<RecurringFrequency>(
    subscription.frequency
  )
  const [draftQuantity, setDraftQuantity] = useState(subscription.quantity)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const subtotal = subscription.unitPrice * subscription.quantity

  async function togglePause() {
    try {
      if (subscription.active) {
        await pauseRecurring(subscription.id)
        showSuccess('Compra recurrente pausada')
      } else {
        await resumeRecurring(subscription.id)
        showSuccess('Compra recurrente reactivada')
      }
      startTransition(onChange)
    } catch {
      showError('No pudimos actualizar la suscripción')
    }
  }

  async function saveEdit() {
    try {
      await updateRecurring(subscription.id, {
        frequency: draftFrequency,
        quantity: draftQuantity,
      })
      showSuccess('Suscripción actualizada')
      setEditing(false)
      startTransition(onChange)
    } catch {
      showError('No pudimos actualizar la suscripción')
    }
  }

  function cancelEdit() {
    setDraftFrequency(subscription.frequency)
    setDraftQuantity(subscription.quantity)
    setEditing(false)
  }

  async function confirmCancellation() {
    try {
      await cancelRecurring(subscription.id)
      showSuccess('Suscripción cancelada')
      setConfirmCancel(false)
      startTransition(onChange)
    } catch {
      showError('No pudimos cancelar la suscripción')
      setConfirmCancel(false)
    }
  }

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6',
        !subscription.active && 'bg-neutral-100/40',
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/publicacion/${subscription.publicationId}`}
            className="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <Image
              src={subscription.photo}
              alt={subscription.publicationTitle}
              fill
              sizes="56px"
              className="object-cover"
            />
          </Link>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              href={`/publicacion/${subscription.publicationId}`}
              className="line-clamp-1 text-sm font-medium text-neutral-900 hover:text-primary-700 focus:outline-none focus-visible:underline"
            >
              {subscription.publicationTitle}
            </Link>
            <p className="text-xs text-neutral-500">
              {subscription.unit} · {formatPrice(subscription.unitPrice)} c/u
            </p>
          </div>
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium',
            subscription.active
              ? 'bg-primary-50 text-primary-700'
              : 'bg-neutral-200 text-neutral-500'
          )}
        >
          <Repeat2 size={11} strokeWidth={2} aria-hidden />
          {subscription.active ? 'Activa' : 'Pausada'}
        </span>
      </header>

      <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <dt className="font-medium uppercase tracking-wider text-neutral-500">
            Frecuencia
          </dt>
          <dd className="text-sm font-medium text-neutral-900">
            {editing ? (
              <Select
                value={draftFrequency}
                onChange={(e) =>
                  setDraftFrequency(e.target.value as RecurringFrequency)
                }
                options={FREQUENCY_OPTIONS}
                aria-label="Frecuencia"
              />
            ) : (
              FREQUENCY_LABEL[subscription.frequency]
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-medium uppercase tracking-wider text-neutral-500">
            Cantidad
          </dt>
          <dd className="text-sm font-medium text-neutral-900">
            {editing ? (
              <QuantitySelector
                value={draftQuantity}
                onChange={setDraftQuantity}
                min={1}
                size="sm"
                ariaLabel="Cantidad"
              />
            ) : (
              `${subscription.quantity} ${subscription.unit}`
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-medium uppercase tracking-wider text-neutral-500">
            Próxima entrega
          </dt>
          <dd className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900">
            <Calendar size={13} strokeWidth={1.5} aria-hidden />
            {subscription.active
              ? formatDate(subscription.nextOrderDate)
              : 'En pausa'}
          </dd>
        </div>
      </dl>

      <footer className="flex flex-wrap items-end justify-between gap-3 border-t border-neutral-200 pt-3">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Subtotal por entrega</span>
          <span className="text-base font-semibold tabular-nums text-neutral-900">
            {formatPrice(editing ? subscription.unitPrice * draftQuantity : subtotal)}
          </span>
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={14} strokeWidth={1.5} aria-hidden />
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-300 px-3 text-[13px] font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={14} strokeWidth={1.5} aria-hidden />
              Guardar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={pending || !subscription.active}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={14} strokeWidth={1.5} aria-hidden />
              Editar
            </button>
            <button
              type="button"
              onClick={togglePause}
              disabled={pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {subscription.active ? (
                <>
                  <Pause size={14} strokeWidth={1.5} aria-hidden />
                  Pausar
                </>
              ) : (
                <>
                  <Play size={14} strokeWidth={1.5} aria-hidden />
                  Reactivar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              disabled={pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        )}
      </footer>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={confirmCancellation}
        title="¿Cancelar esta compra recurrente?"
        description="Dejarás de recibir entregas automáticas. Si solo quieres pausar temporalmente, usa el botón Pausar."
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        variant="destructive"
      />
    </article>
  )
}
