'use client'

import { useMemo, useState } from 'react'
import { Calendar, ShoppingCart } from 'lucide-react'

import { Publication, ProductUnit, RecurringFrequency } from '@/types'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { Toggle } from '@/components/ui/Toggle'
import { cn, formatDate, formatPrice } from '@/lib/utils'

import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { createRecurring } from '@/lib/api/recurring'

import { WhatsAppButton } from './WhatsAppButton'

interface PurchasePanelProps {
  publication: Publication
  sellerId: string
  sellerName: string
  className?: string
}

const FREQUENCY_OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'bimensual', label: 'Bimensual' },
]

const DAYS_BY_FREQUENCY: Record<RecurringFrequency, number> = {
  semanal: 7,
  quincenal: 15,
  mensual: 30,
  bimensual: 60,
}

function nextDateFor(frequency: RecurringFrequency): string {
  const d = new Date()
  d.setDate(d.getDate() + DAYS_BY_FREQUENCY[frequency])
  return d.toISOString()
}

export function PurchasePanel({
  publication,
  sellerId,
  sellerName,
  className,
}: PurchasePanelProps) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const { showSuccess, showError, showInfo } = useToast()

  const isLand = publication.category === 'D'
  const isQuote = publication.priceMode === 'quote' || isLand
  const recurringEligible =
    publication.recurringAvailable &&
    (publication.category === 'A' || publication.category === 'C')

  const units: ProductUnit[] = publication.units ?? []
  const [unitIdx, setUnitIdx] = useState(0)
  const selectedUnit = units[unitIdx]
  const minQty = selectedUnit?.minQuantity ?? 1
  const [qty, setQty] = useState(minQty)
  const [recurringOn, setRecurringOn] = useState(false)
  const [frequency, setFrequency] = useState<RecurringFrequency>('mensual')
  const [submitting, setSubmitting] = useState(false)

  // Si cambia la unidad, garantizar que qty >= min de esa unidad
  function onUnitChange(value: string) {
    const idx = Number(value)
    setUnitIdx(idx)
    const newMin = units[idx]?.minQuantity ?? 1
    setQty((q) => Math.max(q, newMin))
  }

  const hasDiscount =
    typeof publication.discount === 'number' && publication.discount > 0
  const discountFactor = hasDiscount ? 1 - publication.discount! / 100 : 1
  const unitPriceFinal = selectedUnit
    ? selectedUnit.price * discountFactor
    : null
  const subtotal = unitPriceFinal !== null ? unitPriceFinal * qty : null

  const nextDate = useMemo(
    () => (recurringOn ? nextDateFor(frequency) : null),
    [recurringOn, frequency]
  )

  async function onAddToCart() {
    if (!selectedUnit || !unitPriceFinal) return
    addItem({
      publicationId: publication.id,
      sellerId,
      sellerName,
      title: publication.title,
      photo: publication.photos[0],
      unit: selectedUnit.unit,
      unitPrice: selectedUnit.price,
      quantity: qty,
      discount: hasDiscount ? publication.discount : undefined,
    })
    showSuccess(
      'Agregado al carrito',
      `${qty} ${selectedUnit.unit} de "${publication.title}"`
    )
  }

  async function onActivateRecurring() {
    if (!selectedUnit) return
    if (!user) {
      showInfo(
        'Inicia sesión para activar compras recurrentes',
        'Necesitas una cuenta de comprador para programar entregas automáticas.'
      )
      return
    }
    if (user.role !== 'buyer') {
      showError(
        'Solo compradores',
        'Las compras recurrentes están disponibles para cuentas de comprador.'
      )
      return
    }

    setSubmitting(true)
    try {
      await createRecurring({
        buyerId: user.id,
        publicationId: publication.id,
        publicationTitle: publication.title,
        photo: publication.photos[0],
        unit: selectedUnit.unit,
        quantity: qty,
        unitPrice: selectedUnit.price,
        frequency,
      })
      // Primera entrega se procesa de inmediato como un pedido del carrito.
      addItem({
        publicationId: publication.id,
        sellerId,
        sellerName,
        title: publication.title,
        photo: publication.photos[0],
        unit: selectedUnit.unit,
        unitPrice: selectedUnit.price,
        quantity: qty,
        discount: hasDiscount ? publication.discount : undefined,
      })
      showSuccess(
        'Compra recurrente activada',
        `Próxima entrega: ${formatDate(nextDateFor(frequency))}.`
      )
      setRecurringOn(false)
    } catch {
      showError(
        'No pudimos activar la compra recurrente',
        'Inténtalo nuevamente en unos segundos.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <aside
      aria-label="Datos de compra"
      className={cn(
        'flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm',
        className
      )}
    >
      {/* PRECIO */}
      <div className="flex flex-col gap-1">
        {isQuote ? (
          <>
            <p className="text-xl font-semibold text-neutral-900">
              Consultar precio
            </p>
            <p className="text-xs text-neutral-500">
              {isLand
                ? 'Coordina una visita con el vendedor para conocer el precio.'
                : 'El vendedor te enviará una cotización personalizada.'}
            </p>
          </>
        ) : selectedUnit ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-semibold tabular-nums text-neutral-900">
                {formatPrice(unitPriceFinal!)}
              </span>
              {hasDiscount && (
                <span className="text-sm tabular-nums text-neutral-500 line-through">
                  {formatPrice(selectedUnit.price)}
                </span>
              )}
              {hasDiscount && (
                <span className="inline-flex items-center rounded bg-neutral-900/85 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  −{publication.discount}% OFF
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              por {selectedUnit.unit}
              {selectedUnit.minQuantity > 1 && (
                <> · Mínimo {selectedUnit.minQuantity} unidades</>
              )}
            </p>
          </>
        ) : null}
      </div>

      {/* SELECTOR DE UNIDAD + CANTIDAD */}
      {!isQuote && units.length > 0 && (
        <div className="flex flex-col gap-4">
          {units.length > 1 && (
            <div className="flex flex-col gap-2">
              <p
                id="unit-label"
                className="text-[13px] font-medium text-neutral-900"
              >
                Unidad de venta
              </p>
              <div
                role="radiogroup"
                aria-labelledby="unit-label"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {units.map((u, i) => {
                  const active = i === unitIdx
                  return (
                    <button
                      key={`${u.unit}-${i}`}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onUnitChange(String(i))}
                      className={cn(
                        'flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                        active
                          ? 'border-primary-300 bg-primary-50 shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                      )}
                    >
                      <span
                        className={cn(
                          'text-[13px] font-semibold',
                          active ? 'text-primary-700' : 'text-neutral-900'
                        )}
                      >
                        {u.unit}
                      </span>
                      <span className="text-xs tabular-nums text-neutral-500">
                        {formatPrice(u.price * discountFactor)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span
                id="qty-label"
                className="text-[13px] font-medium text-neutral-900"
              >
                Cantidad
              </span>
              <QuantitySelector
                value={qty}
                onChange={setQty}
                min={minQty}
                ariaLabel="Cantidad"
              />
            </div>
            {subtotal !== null && qty > 1 && (
              <div className="flex flex-col items-end text-right">
                <span className="text-xs text-neutral-500">Subtotal</span>
                <span className="text-sm font-semibold tabular-nums text-neutral-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
            )}
          </div>

          {publication.inventory != null && publication.inventory <= 5 && (
            <p className="text-xs font-medium text-accent-900">
              Quedan {publication.inventory} unidades en stock
            </p>
          )}
        </div>
      )}

      {/* BOTONES */}
      <div className="flex flex-col gap-2.5">
        {!isQuote && selectedUnit && (
          <Button
            type="button"
            size="lg"
            fullWidth
            onClick={onAddToCart}
            disabled={submitting}
            leadingIcon={<ShoppingCart size={18} strokeWidth={1.5} />}
          >
            Agregar al carrito
          </Button>
        )}

        <WhatsAppButton
          publicationTitle={publication.title}
          publicationId={publication.id}
          quantity={!isQuote && selectedUnit ? qty : undefined}
          unit={selectedUnit?.unit}
          intent={isLand ? 'visitar-finca' : 'cotizar'}
          variant={isQuote ? 'primary' : 'secondary'}
        />
      </div>

      {/* COMPRA RECURRENTE */}
      {recurringEligible && !isQuote && selectedUnit && (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-4">
          <Toggle
            checked={recurringOn}
            onChange={setRecurringOn}
            label="Activar compra recurrente"
            description="Recibe este producto automáticamente con la frecuencia que elijas."
            disabled={submitting}
          />

          {recurringOn && (
            <div className="flex flex-col gap-3 border-t border-neutral-200 pt-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-neutral-900">
                  Frecuencia
                </span>
                <Select
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as RecurringFrequency)
                  }
                  options={FREQUENCY_OPTIONS}
                />
              </label>

              {nextDate && (
                <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                  <Calendar size={13} strokeWidth={1.5} aria-hidden />
                  Próxima entrega: {formatDate(nextDate)}
                </p>
              )}

              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth
                onClick={onActivateRecurring}
                loading={submitting}
              >
                Confirmar compra recurrente
              </Button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
