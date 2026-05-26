'use client'

import Image from 'next/image'
import { BadgeCheck, MapPin, MessageCircle, Repeat, ShoppingCart } from 'lucide-react'
import { AttributeRenderer } from '@/components/catalog/AttributeRenderer'
import { getSubcategoryById } from '@/data/mock/categories'
import { Seller } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { PublicationFormData, toProductUnits } from '../types'

interface Props {
  data: PublicationFormData
  seller: Seller
}

const CATEGORY_LABEL: Record<string, string> = {
  A: 'Café e insumos',
  B: 'Maquinaria y equipo',
  C: 'Servicios profesionales',
  D: 'Terrenos y fincas',
}

export function Step6Preview({ data, seller }: Props) {
  const isLand = data.category === 'D'
  const isQuote = data.priceMode === 'quote' || isLand
  const recurringActive =
    data.recurringEnabled && !isQuote && (data.category === 'A' || data.category === 'C')
  const sub = data.subcategory ? getSubcategoryById(data.subcategory) : null
  const units = toProductUnits(data.units)
  const cheapest = units.length
    ? units.reduce((m, u) => (u.price < m.price ? u : m), units[0])
    : null

  const hasDiscount =
    data.discountEnabled && typeof data.discount === 'number' && data.discount > 0
  const discountFactor = hasDiscount ? 1 - (data.discount as number) / 100 : 1
  const isVerifiedSeller = seller.subscriptionPlan !== 'none'

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-neutral-900">
          Vista previa
        </h2>
        <p className="text-sm text-neutral-500">
          Así verá la publicación un comprador en el marketplace.
        </p>
      </header>

      {/* Marco que simula la página real */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
        <div className="bg-neutral-100 px-4 py-5 sm:px-6 sm:py-6">
          <div className="grid gap-4 md:grid-cols-[1fr_320px] md:gap-6">
            {/* GALERÍA */}
            <div className="flex flex-col gap-3">
              {data.photos.length > 0 ? (
                <>
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <Image
                      src={data.photos[0].url}
                      alt={data.title || 'Imagen principal'}
                      fill
                      sizes="(min-width: 768px) 640px, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                      {hasDiscount && (
                        <span className="inline-flex items-center rounded bg-neutral-900/85 px-2 py-0.5 text-[11px] font-semibold text-white">
                          −{data.discount}% OFF
                        </span>
                      )}
                      {recurringActive && (
                        <span className="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                          <Repeat size={11} strokeWidth={2} aria-hidden />
                          Compra recurrente
                        </span>
                      )}
                    </div>
                  </div>
                  {data.photos.length > 1 && (
                    <ul className="flex gap-2 overflow-x-auto pb-1">
                      {data.photos.slice(0, 6).map((p, i) => (
                        <li key={p.id}>
                          <span className="relative block aspect-square h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                            <Image
                              src={p.url}
                              alt={`Foto ${i + 1}`}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white text-sm text-neutral-500">
                  Sin fotos
                </div>
              )}
            </div>

            {/* INFO + PRECIO */}
            <div className="flex flex-col gap-4">
              {sub && (
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  {sub.name}
                </p>
              )}
              <h3 className="font-serif text-2xl font-bold leading-tight text-neutral-900">
                {data.title || 'Título de la publicación'}
              </h3>
              <p className="text-xs text-neutral-500">
                por{' '}
                <span className="font-medium text-neutral-900">
                  {seller.businessName}
                </span>
                {isVerifiedSeller && (
                  <BadgeCheck
                    size={12}
                    strokeWidth={1.5}
                    className="-mt-0.5 ml-1 inline text-primary-500"
                    aria-label="Vendedor verificado"
                  />
                )}
              </p>

              {/* Bloque de precio */}
              <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                {isQuote ? (
                  <>
                    <p className="text-lg font-semibold text-neutral-900">
                      Consultar precio
                    </p>
                    <p className="text-xs text-neutral-500">
                      {isLand
                        ? 'Coordina una visita con el vendedor para conocer el precio.'
                        : 'El vendedor enviará una cotización personalizada.'}
                    </p>
                  </>
                ) : cheapest ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-xl font-semibold tabular-nums text-neutral-900">
                        {formatPrice(cheapest.price * discountFactor)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs tabular-nums text-neutral-500 line-through">
                          {formatPrice(cheapest.price)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">
                      por {cheapest.unit}
                      {cheapest.minQuantity > 1 && (
                        <> · Mínimo {cheapest.minQuantity} unidades</>
                      )}
                    </p>
                    {units.length > 1 && (
                      <ul className="flex flex-col gap-1 border-t border-neutral-200 pt-3 text-xs text-neutral-500">
                        {units.map((u) => (
                          <li
                            key={u.unit}
                            className="flex items-center justify-between gap-3 tabular-nums"
                          >
                            <span>{u.unit}</span>
                            <span className="font-medium text-neutral-900">
                              {formatPrice(u.price * discountFactor)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">
                    Aún no agregaste unidades de venta.
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  {!isQuote && cheapest && (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white"
                      aria-disabled
                    >
                      <ShoppingCart size={16} strokeWidth={1.5} aria-hidden />
                      Agregar al carrito
                    </button>
                  )}
                  <button
                    type="button"
                    disabled
                    className={cn(
                      'inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors',
                      isQuote
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 bg-white text-neutral-900'
                    )}
                    aria-disabled
                  >
                    <MessageCircle size={16} strokeWidth={1.5} aria-hidden />
                    {isQuote ? 'Cotizar por WhatsApp' : 'Contactar vendedor'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPCIÓN + COBERTURA + ATRIBUTOS */}
          <div className="mt-6 flex flex-col gap-4">
            <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h4 className="mb-2 font-serif text-base font-semibold text-neutral-900">
                Descripción
              </h4>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-900">
                {data.description || (
                  <span className="text-neutral-500">
                    Sin descripción aún.
                  </span>
                )}
              </p>

              {data.variants && (
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <h5 className="mb-1.5 text-[13px] font-semibold text-neutral-900">
                    Variantes disponibles
                  </h5>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-900">
                    {data.variants}
                  </p>
                </div>
              )}

              {data.coverage.length > 0 && (
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <h5 className="mb-1.5 text-[13px] font-semibold text-neutral-900">
                    Cobertura de envío
                  </h5>
                  <ul className="flex flex-wrap gap-1.5">
                    {data.coverage.map((dep) => (
                      <li
                        key={dep}
                        className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[12px] font-medium text-neutral-900"
                      >
                        <MapPin size={11} strokeWidth={1.5} aria-hidden />
                        {dep}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {Object.keys(data.attributes).length > 0 && (
              <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h4 className="mb-4 font-serif text-base font-semibold text-neutral-900">
                  Especificaciones
                </h4>
                <AttributeRenderer attributes={data.attributes} />
              </section>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Esta es una simulación; los botones están desactivados en la vista previa.
        {data.category && (
          <>
            {' '}
            La publicación aparecerá en la categoría{' '}
            <strong>{CATEGORY_LABEL[data.category]}</strong>.
          </>
        )}
      </p>
    </div>
  )
}
