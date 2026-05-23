'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Lock,
  Smartphone,
  Ticket,
  Users,
} from 'lucide-react'

import { CafeEvent } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  listRegistrationsByUser,
  registerToEvent,
} from '@/lib/api/events'
import { cn, formatPrice } from '@/lib/utils'
import { ApiError } from '@/lib/api/_client'

interface EventRegistrationPanelProps {
  event: CafeEvent
}

type PaymentMethod = 'tarjeta' | 'qr'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s()]{7,}$/

export function EventRegistrationPanel({ event }: EventRegistrationPanelProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { showSuccess, showError, showInfo } = useToast()

  const [registered, setRegistered] = useState<boolean | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [showPay, setShowPay] = useState(false)

  // Datos del comprador para checkout reducido (cuando es de pago).
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('tarjeta')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  // Cargar si ya está inscrito.
  // Reset cuando cambia el usuario o el evento.
  const [trackedKey, setTrackedKey] = useState<string | null>(null)
  const checkKey = `${user?.id ?? 'anon'}:${event.id}`
  if (checkKey !== trackedKey) {
    setTrackedKey(checkKey)
    if (!user) {
      setRegistered(false)
    }
  }
  useEffect(() => {
    if (!user) return
    let cancelled = false
    listRegistrationsByUser(user.id)
      .then((regs) => {
        if (!cancelled) setRegistered(regs.some((r) => r.eventId === event.id))
      })
      .catch(() => {
        if (!cancelled) setRegistered(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, event.id])

  // Auto-fill del checkout reducido (patrón "state from prop").
  const [hydratedFromUserId, setHydratedFromUserId] = useState<string | null>(null)
  if (user && user.id !== hydratedFromUserId) {
    setHydratedFromUserId(user.id)
    if (user.role === 'buyer') setFullName((p) => p || user.name)
    if (user.email) setEmail((p) => p || user.email)
  }

  const isFree = event.price === 'free'
  const remaining = event.capacity
    ? Math.max(0, event.capacity - event.registeredCount)
    : null
  const soldOut = remaining === 0
  const deadlinePassed =
    event.registrationDeadline
      ? event.registrationDeadline < new Date().toISOString().slice(0, 10)
      : false

  const disabledReason = soldOut
    ? 'Sin cupos disponibles'
    : deadlinePassed
      ? 'Inscripciones cerradas'
      : null

  function requireLogin(): boolean {
    if (user && user.role === 'buyer') return true
    if (!user) {
      showInfo(
        'Inicia sesión para inscribirte',
        'Necesitas una cuenta de comprador para registrarte en eventos.'
      )
      router.push(`/login?next=${encodeURIComponent(`/eventos/${event.id}`)}`)
    } else {
      showError(
        'Solo compradores',
        'Las inscripciones a eventos están disponibles para cuentas de comprador.'
      )
    }
    return false
  }

  async function doRegister(qty: number) {
    if (!user) return
    setSubmitting(true)
    try {
      await registerToEvent(event.id, user.id, qty)
      setRegistered(true)
      showSuccess(
        '¡Inscripción confirmada!',
        isFree
          ? 'Te avisaremos por correo con los detalles.'
          : `Pagaste ${formatPrice((event.price as number) * qty)}. Recibirás tu entrada por correo.`
      )
      setShowPay(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        showInfo('Ya estabas inscrito en este evento')
        setRegistered(true)
        setShowPay(false)
      } else {
        showError(
          'No pudimos confirmar tu inscripción',
          'Inténtalo nuevamente en unos segundos.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function onFreeClick() {
    if (!requireLogin()) return
    await doRegister(quantity)
  }

  function onPaidClick() {
    if (!requireLogin()) return
    setShowPay(true)
  }

  function validatePayForm(): boolean {
    const next: Record<string, string | undefined> = {}
    if (!fullName.trim()) next.fullName = 'Ingresa tu nombre'
    if (!phone.trim()) next.phone = 'Ingresa un teléfono'
    else if (!PHONE_RE.test(phone.trim())) next.phone = 'Teléfono inválido'
    if (!email.trim()) next.email = 'Ingresa un correo'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Correo inválido'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onPaySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validatePayForm()) return
    await doRegister(quantity)
  }

  const totalPrice =
    isFree || typeof event.price !== 'number' ? 0 : event.price * quantity

  // Estado inicial: verificando si ya está inscrito.
  if (registered === null) {
    return (
      <aside
        aria-label="Inscripción al evento"
        className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <Spinner size="md" />
      </aside>
    )
  }

  return (
    <>
      <aside
        aria-label="Inscripción al evento"
        className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        {/* PRECIO */}
        <div className="flex flex-col gap-1">
          {isFree ? (
            <p className="font-serif text-2xl font-semibold text-primary-700">
              Gratuito
            </p>
          ) : (
            <p className="font-serif text-2xl font-semibold tabular-nums text-neutral-900">
              {formatPrice(event.price as number)}{' '}
              <span className="text-sm font-normal text-neutral-500">
                / entrada
              </span>
            </p>
          )}
          {remaining !== null && (
            <p className="inline-flex items-center gap-1 text-xs text-neutral-500">
              <Users size={12} strokeWidth={1.5} aria-hidden />
              {soldOut
                ? 'Sin cupos disponibles'
                : `${remaining} de ${event.capacity} cupos disponibles`}
            </p>
          )}
        </div>

        {/* CANTIDAD */}
        {!registered && !disabledReason && (
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-neutral-900">
                Cantidad de entradas
              </span>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={remaining ?? undefined}
                ariaLabel="Cantidad de entradas"
              />
            </div>
            {!isFree && quantity > 1 && (
              <div className="flex flex-col items-end text-right">
                <span className="text-xs text-neutral-500">Subtotal</span>
                <span className="text-sm font-semibold tabular-nums text-neutral-900">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA principal */}
        {registered ? (
          <div className="flex flex-col gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2
                size={20}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-primary-500"
                aria-hidden
              />
              <div className="flex flex-col gap-0.5">
                <p className="font-medium text-primary-900">
                  Ya estás inscrito
                </p>
                <p className="text-xs text-primary-700">
                  Te avisaremos por correo con los detalles del evento.
                </p>
              </div>
            </div>
            <Link
              href="/inscripciones"
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-primary-500 bg-white px-4 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              Ver mis inscripciones
            </Link>
          </div>
        ) : disabledReason ? (
          <div className="flex items-start gap-2 rounded-xl border border-neutral-200 bg-neutral-100 p-4 text-sm text-neutral-500">
            <AlertTriangle
              size={18}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0"
              aria-hidden
            />
            <p>{disabledReason}.</p>
          </div>
        ) : (
          <Button
            type="button"
            size="lg"
            fullWidth
            onClick={isFree ? onFreeClick : onPaidClick}
            loading={isFree && submitting}
            leadingIcon={<Ticket size={18} strokeWidth={1.5} />}
          >
            {isFree ? 'Inscribirme' : 'Comprar entrada'}
          </Button>
        )}

        {/* Fecha límite */}
        {event.registrationDeadline && !registered && !disabledReason && (
          <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
            <CalendarDays size={13} strokeWidth={1.5} aria-hidden />
            Inscripciones hasta {formatLimit(event.registrationDeadline)}
          </p>
        )}
      </aside>

      {/* Modal checkout reducido (solo eventos pagos) */}
      {!isFree && (
        <Modal
          open={showPay}
          onClose={submitting ? () => undefined : () => setShowPay(false)}
          title="Comprar entrada"
          description={event.name}
          size="md"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setShowPay(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="event-pay-form"
                variant="checkout"
                loading={submitting}
                leadingIcon={<Lock size={16} strokeWidth={1.5} />}
              >
                Pagar {formatPrice(totalPrice)}
              </Button>
            </>
          }
        >
          <form
            id="event-pay-form"
            onSubmit={onPaySubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <FormField label="Nombre completo" required error={errors.fullName}>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                aria-required="true"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Teléfono" required error={errors.phone}>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+591 70000000"
                  aria-required="true"
                />
              </FormField>
              <FormField label="Correo" required error={errors.email}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  aria-required="true"
                />
              </FormField>
            </div>

            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-neutral-900">
                Método de pago
              </legend>
              <ul
                role="radiogroup"
                aria-label="Método de pago"
                className="flex flex-col gap-2"
              >
                {(
                  [
                    {
                      value: 'tarjeta' as PaymentMethod,
                      label: 'Tarjeta de crédito o débito',
                      Icon: CreditCard,
                    },
                    {
                      value: 'qr' as PaymentMethod,
                      label: 'QR Simple',
                      Icon: Smartphone,
                    },
                  ]
                ).map(({ value, label, Icon }) => {
                  const checked = payment === value
                  return (
                    <li key={value}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                          checked
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        )}
                      >
                        <input
                          type="radio"
                          name="event-pay"
                          value={value}
                          checked={checked}
                          onChange={() => setPayment(value)}
                          className="h-4 w-4 cursor-pointer accent-primary-300"
                        />
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                          className="text-neutral-500"
                          aria-hidden
                        />
                        <span className="text-sm font-medium text-neutral-900">
                          {label}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </fieldset>

            <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm">
              <span className="text-neutral-500">
                {quantity} {quantity === 1 ? 'entrada' : 'entradas'}
              </span>
              <span className="font-serif text-lg font-semibold tabular-nums text-neutral-900">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
              <Lock size={12} strokeWidth={1.5} aria-hidden />
              Simulación de pago — no se cobrará ningún cargo real.
            </p>
          </form>
        </Modal>
      )}
    </>
  )
}

function formatLimit(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'long',
  })
}
