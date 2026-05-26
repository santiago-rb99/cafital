'use client'

import Link from 'next/link'
import { Bookmark, ShoppingBag, Trash2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartItemsBySeller } from '@/components/cart/CartItemsBySeller'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

export default function CarritoPage() {
  const { items, savedItems, total, itemCount, savedCount, clearCart } = useCart()

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs
          items={[{ label: 'Catálogo', href: '/catalogo' }, { label: 'Carrito' }]}
          className="mb-5"
        />

        <header className="mb-6 flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
              Carrito
            </h1>
            <p className="text-sm text-neutral-500">
              {itemCount === 0
                ? 'Sin productos por ahora.'
                : itemCount === 1
                  ? '1 producto en tu carrito.'
                  : `${itemCount} productos en tu carrito.`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              <Trash2 size={14} strokeWidth={1.5} aria-hidden />
              Vaciar carrito
            </button>
          )}
        </header>

        {items.length === 0 && savedCount === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={28} strokeWidth={1.5} />}
            title="Tu carrito está vacío"
            description="Explora el catálogo para encontrar café, equipos y servicios del ecosistema cafetero boliviano."
            action={
              <Link
                href="/catalogo"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
              >
                Ir al catálogo
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
              <div className="flex flex-col gap-8">
                {items.length > 0 ? (
                  <CartItemsBySeller items={items} variant="full" />
                ) : (
                  <EmptyState
                    icon={<ShoppingBag size={28} strokeWidth={1.5} />}
                    title="Sin productos en el carrito"
                    description="Revisa los guardados o vuelve al catálogo."
                  />
                )}

                {savedCount > 0 && (
                  <section
                    aria-labelledby="saved-heading"
                    className="flex flex-col gap-3"
                  >
                    <header className="flex items-center gap-2">
                      <Bookmark
                        size={16}
                        strokeWidth={1.5}
                        className="text-neutral-500"
                        aria-hidden
                      />
                      <h2
                        id="saved-heading"
                        className="font-serif text-base font-semibold text-neutral-900"
                      >
                        Guardados para más tarde
                        <span className="ml-2 text-sm font-normal text-neutral-500">
                          ({savedCount})
                        </span>
                      </h2>
                    </header>
                    <p className="text-xs text-neutral-500">
                      Estos productos no se cuentan en el total. Muévelos al
                      carrito cuando decidas comprarlos.
                    </p>
                    <ul role="list" className="flex flex-col gap-3">
                      {savedItems.map((item) => (
                        <li
                          key={`${item.publicationId}::${item.unit}`}
                        >
                          <CartItemRow item={item} variant="saved" />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <aside
                aria-label="Resumen del pedido"
                className="lg:sticky lg:top-20 lg:self-start"
              >
                <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="font-serif text-lg font-semibold text-neutral-900">
                    Resumen
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
                    {savedCount > 0 && (
                      <div className="flex justify-between text-xs">
                        <dt className="text-neutral-500">Guardados</dt>
                        <dd className="tabular-nums text-neutral-500">
                          {savedCount} {savedCount === 1 ? 'producto' : 'productos'}
                          {' '}(no incluido)
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-neutral-200 pt-2 text-base">
                      <dt className="font-semibold text-neutral-900">Total</dt>
                      <dd className="font-serif text-lg font-semibold tabular-nums text-neutral-900">
                        {formatPrice(total)}
                      </dd>
                    </div>
                  </dl>

                  <p className="text-xs leading-relaxed text-neutral-500">
                    Los pedidos se separan automáticamente por vendedor. Cada vendedor
                    procesa y envía sus propios productos.
                  </p>

                  {items.length > 0 && (
                    <Link
                      href="/checkout"
                      className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent-500 px-5 text-base font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                    >
                      Proceder al pago
                    </Link>
                  )}
                </div>
              </aside>
            </div>

            {/* Sticky bottom bar — solo mobile, solo si hay items activos */}
            {items.length > 0 && (
              <div className="sticky bottom-0 left-0 right-0 -mx-4 mt-6 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur lg:hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-500">
                      Total ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
                    </span>
                    <span className="font-serif text-lg font-semibold tabular-nums text-neutral-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-accent-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                  >
                    Pagar
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
