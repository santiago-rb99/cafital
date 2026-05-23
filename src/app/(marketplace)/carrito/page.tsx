'use client'

import Link from 'next/link'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { CartItemsBySeller } from '@/components/cart/CartItemsBySeller'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

export default function CarritoPage() {
  const { items, total, itemCount, clearCart } = useCart()

  return (
    <div className="bg-neutral-100">
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

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={28} strokeWidth={1.5} />}
            title="Tu carrito está vacío"
            description="Explora el catálogo para encontrar café, equipos y servicios del ecosistema cafetero boliviano."
            action={
              <Link
                href="/catalogo"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
              >
                Ir al catálogo
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
            <CartItemsBySeller items={items} variant="full" />

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

                <Link
                  href="/checkout"
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent-500 px-5 text-base font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                >
                  Proceder al pago
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
