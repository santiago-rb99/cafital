'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  PlanFeatures,
  getPlanFeatures,
  subscribe,
} from '@/lib/api/subscriptions'
import { Seller, SubscriptionPlan } from '@/types'
import { subscriptionLabel } from '@/lib/utils'

const VALID_PLANS: SubscriptionPlan[] = ['semilla', 'cosecha', 'exportacion']

export default function PlanesCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="md" />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  )
}

function CheckoutInner() {
  const { user, isHydrated, refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') as SubscriptionPlan | null
  const seller = user?.role === 'seller' ? (user as Seller) : null

  const [plan, setPlan] = useState<PlanFeatures | null>(null)
  const [planFetched, setPlanFetched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const validPlan = Boolean(planParam && VALID_PLANS.includes(planParam))
  const loading = validPlan && !planFetched

  // Form
  const [cardholder, setCardholder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [nit, setNit] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    if (!planParam || !VALID_PLANS.includes(planParam)) return
    let cancelled = false
    getPlanFeatures(planParam).then((p) => {
      if (!cancelled) {
        setPlan(p)
        setPlanFetched(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [planParam])

  // Hidratar email del seller la primera vez que llega
  const [trackedSellerId, setTrackedSellerId] = useState<string | null>(null)
  if (seller && seller.id !== trackedSellerId) {
    setTrackedSellerId(seller.id)
    setBillingEmail(seller.email ?? '')
    setNit(seller.nit ?? '')
    setCardholder(seller.businessName ?? '')
  }

  if (!isHydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (!seller) return null

  if (!plan) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-serif text-2xl font-semibold text-neutral-900">
          Plan no válido
        </h1>
        <p className="text-sm text-neutral-500">
          El plan indicado no existe o ya no está disponible.
        </p>
        <Link
          href="/mi-tienda/planes"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500"
        >
          <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
          Volver a Planes
        </Link>
      </div>
    )
  }

  // Estado "Suscripción confirmada"
  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-primary-300 bg-primary-50 p-8 text-center shadow-sm sm:p-10">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-300 text-primary-900">
          <CheckCircle2 size={28} strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="font-serif text-2xl font-semibold text-neutral-900">
          ¡{plan.name} activado!
        </h1>
        <p className="max-w-prose text-sm text-neutral-500">
          Tu suscripción está activa. Los nuevos beneficios ya se reflejan en
          tu perfil y publicaciones.
        </p>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:gap-3">
          <Link
            href="/mi-tienda/planes"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            Volver a Planes
          </Link>
          <Link
            href="/mi-tienda"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500"
          >
            Ir a Mi Tienda
          </Link>
        </div>
      </div>
    )
  }

  const prorate =
    seller.subscriptionPlan !== 'none' && seller.subscriptionPlan !== plan.id

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!plan || !seller) return
    const next: Record<string, string | undefined> = {}
    if (!cardholder.trim()) next.cardholder = 'Ingresa el nombre del titular.'

    const digits = cardNumber.replace(/\s+/g, '')
    if (!/^\d{15,16}$/.test(digits))
      next.cardNumber = 'Número de tarjeta inválido (15 o 16 dígitos).'

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry))
      next.expiry = 'Formato MM/AA.'
    else {
      const [mmStr, yyStr] = expiry.split('/')
      const mm = Number(mmStr)
      const yy = 2000 + Number(yyStr)
      const cardDate = new Date(yy, mm, 0) // último día del mes
      if (cardDate.getTime() < Date.now())
        next.expiry = 'La tarjeta está vencida.'
    }

    if (!/^\d{3,4}$/.test(cvv)) next.cvv = 'CVV inválido.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail.trim()))
      next.billingEmail = 'Correo de facturación inválido.'
    if (nit.trim() && !/^\d{6,15}$/.test(nit.trim()))
      next.nit = 'El NIT debe tener entre 6 y 15 dígitos.'

    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      showError('Revisa los datos de pago', 'Hay campos por corregir.')
      return
    }

    setSubmitting(true)
    try {
      await subscribe(seller.id, plan.id)
      refreshUser()
      showSuccess(
        `¡${plan.name} activado!`,
        'Los beneficios ya están disponibles en tu cuenta.'
      )
      setDone(true)
    } catch {
      showError('No pudimos procesar el pago', 'Inténtalo nuevamente.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Volver" className="flex">
        <Link
          href="/mi-tienda/planes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-700 focus:outline-none focus-visible:underline"
        >
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden />
          Volver a Planes
        </Link>
      </nav>

      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Contratar {plan.name}
        </h1>
        <p className="text-sm text-neutral-500">
          Cobro mensual recurrente. Puedes cancelar en cualquier momento desde
          la página de Planes.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        {/* FORMULARIO DE PAGO */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <fieldset className="flex flex-col gap-5" disabled={submitting}>
            <legend className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-neutral-500">
              <CreditCard size={14} strokeWidth={1.5} aria-hidden />
              Datos de la tarjeta
            </legend>

            <FormField
              label="Nombre del titular"
              required
              error={errors.cardholder}
            >
              <Input
                type="text"
                value={cardholder}
                onChange={(e) => setCardholder(e.target.value)}
                autoComplete="cc-name"
                placeholder="Como aparece en la tarjeta"
                leadingIcon={<UserIcon size={18} strokeWidth={1.5} />}
              />
            </FormField>

            <FormField
              label="Número de tarjeta"
              required
              error={errors.cardNumber}
              helper={
                !errors.cardNumber
                  ? 'Aceptamos Visa, MasterCard y Amex.'
                  : undefined
              }
            >
              <Input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={19}
                placeholder="4111 1111 1111 1111"
                leadingIcon={<CreditCard size={18} strokeWidth={1.5} />}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Vencimiento" required error={errors.expiry}>
                <Input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  placeholder="MM/AA"
                />
              </FormField>
              <FormField label="CVV" required error={errors.cvv}>
                <Input
                  type="text"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  placeholder="123"
                />
              </FormField>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-5" disabled={submitting}>
            <legend className="text-[13px] font-semibold uppercase tracking-wider text-neutral-500">
              Datos de facturación
            </legend>

            <FormField
              label="Correo de facturación"
              required
              error={errors.billingEmail}
            >
              <Input
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                autoComplete="email"
                placeholder="contacto@tutienda.bo"
              />
            </FormField>

            <FormField
              label="NIT"
              optional
              error={errors.nit}
              helper={!errors.nit ? 'Para emisión de factura electrónica.' : undefined}
            >
              <Input
                type="text"
                value={nit}
                onChange={(e) => setNit(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                placeholder="1234567890"
                maxLength={15}
              />
            </FormField>
          </fieldset>

          <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-100/60 p-3 text-xs text-neutral-500">
            <Lock
              size={14}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-neutral-500"
              aria-hidden
            />
            <p>
              Pago seguro encriptado. Cafital no almacena los datos completos
              de tu tarjeta — quedan en el procesador de pagos.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Link
              href="/mi-tienda/planes"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              Cancelar
            </Link>
            <Button
              type="submit"
              variant="checkout"
              size="md"
              loading={submitting}
              leadingIcon={<ShieldCheck size={16} strokeWidth={1.5} />}
            >
              Pagar ${plan.priceUsd.toFixed(2)} USD
            </Button>
          </div>
        </form>

        {/* RESUMEN DEL PLAN */}
        <aside
          aria-label="Resumen de la suscripción"
          className="flex h-fit flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-20"
        >
          <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary-700">
                <Sparkles size={12} strokeWidth={2} aria-hidden />
                Suscripción mensual
              </span>
              <h2 className="font-serif text-xl font-semibold text-neutral-900">
                {plan.name}
              </h2>
            </div>
          </header>

          <ul role="list" className="flex flex-col gap-2 text-sm text-neutral-900">
            {plan.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2">
                <span
                  className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-300 text-primary-900"
                  aria-hidden
                >
                  <Check size={11} strokeWidth={2.5} />
                </span>
                <span className="leading-relaxed">{h}</span>
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
            <div className="flex items-center justify-between gap-3 text-neutral-500">
              <dt>Cobro mensual</dt>
              <dd className="font-medium tabular-nums text-neutral-900">
                ${plan.priceUsd.toFixed(2)} USD
              </dd>
            </div>
            {prorate && (
              <div className="flex items-center justify-between gap-3 text-neutral-500">
                <dt>Plan actual</dt>
                <dd className="text-right text-neutral-900">
                  {subscriptionLabel(seller.subscriptionPlan)}
                </dd>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
              <dt className="text-sm font-semibold text-neutral-900">
                Total hoy
              </dt>
              <dd className="font-serif text-xl font-semibold tabular-nums text-neutral-900">
                ${plan.priceUsd.toFixed(2)}
              </dd>
            </div>
          </dl>

          <p className="text-xs text-neutral-500">
            Se renueva automáticamente cada mes. Puedes cancelar cuando quieras
            desde la página de Planes.
          </p>
        </aside>
      </div>
    </div>
  )
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}
