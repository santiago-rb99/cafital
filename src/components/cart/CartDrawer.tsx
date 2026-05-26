'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { CartItemsBySeller } from './CartItemsBySeller'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, itemCount } = useCart()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Tu carrito"
      description={
        itemCount === 0
          ? 'Aún no agregaste productos.'
          : itemCount === 1
            ? '1 producto'
            : `${itemCount} productos`
      }
      side="right"
      size="md"
      ariaLabel="Carrito de compras"
      footer={
        items.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-500">Total</span>
              <span className="font-serif text-xl font-semibold tabular-nums text-neutral-900">
                {formatPrice(total)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent-500 px-5 text-base font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              Proceder al pago
            </Link>
            <Link
              href="/carrito"
              onClick={onClose}
              className="text-center text-sm font-medium text-primary-500 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
            >
              Ver carrito completo
            </Link>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={28} strokeWidth={1.5} />}
          title="Tu carrito está vacío"
          description="Explora el catálogo para encontrar café, equipos y servicios del ecosistema cafetero."
          action={
            <Link
              href="/catalogo"
              onClick={onClose}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <CartItemsBySeller items={items} variant="full" />
      )}
    </Drawer>
  )
}
