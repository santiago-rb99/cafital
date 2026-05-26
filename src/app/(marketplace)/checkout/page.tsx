'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Landmark,
  Lock,
  Smartphone,
  Store,
  Truck,
} from 'lucide-react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { CartItemsBySeller } from '@/components/cart/CartItemsBySeller'
import { QrPaymentModal } from '@/components/cart/QrPaymentModal'

import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { createOrdersFromCart } from '@/lib/api/orders'
import { DEPARTMENTS, formatPrice } from '@/lib/utils'

type PaymentMethod = 'tarjeta' | 'qr' | 'transferencia'

const PAYMENT_OPTIONS: Array<{
  value: PaymentMethod
  label: string
  description: string
  Icon: typeof CreditCard
}> = [
  {
    value: 'tarjeta',
    label: 'Tarjeta de crédito o débito',
    description: 'Visa, Mastercard, American Express.',
    Icon: CreditCard,
  },
  {
    value: 'qr',
    label: 'QR Simple',
    description: 'Pago instantáneo desde tu app bancaria.',
    Icon: Smartphone,
  },
  {
    value: 'transferencia',
    label: 'Transferencia bancaria',
    description: 'Te enviaremos los datos al confirmar.',
    Icon: Landmark,
  },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+\-\s()]{7,}$/

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, total, itemCount, clearCart } = useCart()
  const { showSuccess, showError, showInfo } = useToast()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('tarjeta')

  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showQr, setShowQr] = useState(false)

  // Hidratar campos desde el usuario (patrón "state from prop").
  const [hydratedFromUserId, setHydratedFromUserId] = useState<string | null>(null)
  if (user && user.id !== hydratedFromUserId) {
    setHydratedFromUserId(user.id)
    if (user.role === 'buyer') setFullName((p) => p || user.name)
    if (user.email) setEmail((p) => p || user.email)
    if (user.department) setDepartment((p) => p || user.department!)
  }

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/carrito')
    }
  }, [items.length, router])

  function validate(): boolean {
    const next: Record<string, string | undefined> = {}
    if (!fullName.trim()) next.fullName = 'Ingresa tu nombre completo'
    if (!phone.trim()) next.phone = 'Ingresa un teléfono de contacto'
    else if (!PHONE_RE.test(phone.trim())) next.phone = 'Teléfono inválido'
    if (!email.trim()) next.email = 'Ingresa un correo'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Correo inválido'
    if (!department) next.department = 'Selecciona el departamento'
    if (!city.trim()) next.city = 'Ingresa la ciudad'
    if (!address.trim()) next.address = 'Ingresa la dirección de entrega'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function finishOrder() {
    if (!user) return
    setSubmitting(true)
    try {
      const shippingAddress = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        department,
        city: city.trim(),
        address: address.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }
      const orders = await createOrdersFromCart(user.id, items, shippingAddress)
      clearCart()
      showSuccess(
        '¡Pedido confirmado!',
        orders.length === 1
          ? 'Te avisaremos cuando el vendedor lo procese.'
          : `Generamos ${orders.length} pedidos, uno por vendedor.`
      )
      const first = orders[0]
      router.push(`/pedido/${first.id}`)
    } catch {
      showError(
        'No pudimos procesar tu pedido',
        'Inténtalo nuevamente en unos segundos.'
      )
      setSubmitting(false)
      setShowQr(false)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) {
      showInfo(
        'Inicia sesión para finalizar el pedido',
        'Necesitas una cuenta para confirmar la compra.'
      )
      router.push(`/login?next=${encodeURIComponent('/checkout')}`)
      return
    }
    if (!validate()) return

    // QR Simple: abrir modal con código QR + verificación simulada.
    // Al confirmar el "pago" se crea el pedido.
    if (payment === 'qr') {
      setShowQr(true)
      return
    }
    await finishOrder()
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs
          items={[
            { label: 'Carrito', href: '/carrito' },
            { label: 'Checkout' },
          ]}
          className="mb-5"
        />

        <header className="mb-8 flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Finalizar pedido
          </h1>
          <p className="text-sm text-neutral-500">
            Confirma tus datos de envío y el método de pago.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          noValidate
          className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8"
        >
          <div className="flex flex-col gap-6">
            <section
              aria-labelledby="ship-heading"
              className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <header className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  <Truck size={18} strokeWidth={1.5} aria-hidden />
                </span>
                <h2
                  id="ship-heading"
                  className="font-serif text-lg font-semibold text-neutral-900"
                >
                  Datos de envío
                </h2>
              </header>

              <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <legend className="sr-only">Datos de contacto y envío</legend>

                <FormField
                  label="Nombre completo"
                  required
                  error={errors.fullName}
                  className="sm:col-span-2"
                >
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    placeholder="Juan Pérez"
                    aria-required="true"
                  />
                </FormField>

                <FormField
                  label="Teléfono"
                  required
                  error={errors.phone}
                  helper={!errors.phone ? 'Para coordinar la entrega.' : undefined}
                >
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

                <FormField
                  label="Correo"
                  required
                  error={errors.email}
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="tucorreo@negocio.bo"
                    aria-required="true"
                  />
                </FormField>

                <FormField
                  label="Departamento"
                  required
                  error={errors.department}
                >
                  <Select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Selecciona"
                    options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                    aria-required="true"
                  />
                </FormField>

                <FormField label="Ciudad" required error={errors.city}>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    autoComplete="address-level2"
                    placeholder="Caranavi"
                    aria-required="true"
                  />
                </FormField>

                <FormField
                  label="Dirección"
                  required
                  error={errors.address}
                  helper={
                    !errors.address
                      ? 'Calle, número, zona, referencias.'
                      : undefined
                  }
                  className="sm:col-span-2"
                >
                  <Input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                    placeholder="Av. Mariscal Santa Cruz #1024, Zona Sopocachi"
                    aria-required="true"
                  />
                </FormField>

                <FormField
                  label="Notas para el vendedor"
                  optional
                  className="sm:col-span-2"
                >
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Llamar 30 minutos antes de entregar."
                    rows={3}
                  />
                </FormField>
              </fieldset>
            </section>

            <section
              aria-labelledby="pay-heading"
              className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <header className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  <CreditCard size={18} strokeWidth={1.5} aria-hidden />
                </span>
                <h2
                  id="pay-heading"
                  className="font-serif text-lg font-semibold text-neutral-900"
                >
                  Método de pago
                </h2>
              </header>

              <ul role="radiogroup" aria-label="Método de pago" className="flex flex-col gap-2">
                {PAYMENT_OPTIONS.map(({ value, label, description, Icon }) => {
                  const checked = payment === value
                  return (
                    <li key={value}>
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                          checked
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={value}
                          checked={checked}
                          onChange={() => setPayment(value)}
                          className="mt-0.5 h-4 w-4 cursor-pointer accent-primary-300"
                        />
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-neutral-500">
                          <Icon size={18} strokeWidth={1.5} aria-hidden />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-sm font-medium text-neutral-900">
                            {label}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {description}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>

              <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <Lock size={12} strokeWidth={1.5} aria-hidden />
                Esta es una simulación de pago — no se cobrará ningún cargo real.
              </p>
            </section>

            <section
              aria-labelledby="review-heading"
              className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <header className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                  <Store size={18} strokeWidth={1.5} aria-hidden />
                </span>
                <h2
                  id="review-heading"
                  className="font-serif text-lg font-semibold text-neutral-900"
                >
                  Resumen del pedido
                </h2>
              </header>

              <CartItemsBySeller items={items} variant="compact" />
            </section>
          </div>

          <aside
            aria-label="Total del pedido"
            className="lg:sticky lg:top-20 lg:self-start"
          >
            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-neutral-900">
                Total a pagar
              </h2>

              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Productos</dt>
                  <dd className="tabular-nums text-neutral-900">{itemCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Subtotal</dt>
                  <dd className="tabular-nums text-neutral-900">
                    {formatPrice(total)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base">
                  <dt className="font-semibold text-neutral-900">Total</dt>
                  <dd className="font-serif text-xl font-semibold tabular-nums text-neutral-900">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting || undefined}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-5 text-base font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-300 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
              >
                {submitting && <Spinner size="sm" />}
                {submitting ? 'Procesando…' : 'Confirmar pedido'}
              </button>

              <Link
                href="/carrito"
                className="text-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:underline"
              >
                Volver al carrito
              </Link>
            </div>
          </aside>
        </form>

        <QrPaymentModal
          open={showQr}
          amount={total}
          reference={`Pedido Cafital · ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`}
          onConfirmed={finishOrder}
          onClose={() => setShowQr(false)}
        />
      </div>
    </div>
  )
}
