import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { Order } from '@/types'
import { cn, formatDateShort, formatPrice } from '@/lib/utils'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderCardProps {
  order: Order
  className?: string
}

export function OrderCard({ order, className }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0)
  const firstItem = order.items[0]
  const restCount = order.items.length - 1

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6',
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Pedido {order.id.slice(-8)}
          </p>
          <p className="text-sm text-neutral-900">
            <span className="text-neutral-500">a</span>{' '}
            <span className="font-medium">{order.sellerName}</span>
          </p>
          <p className="text-xs text-neutral-500">
            {formatDateShort(order.createdAt)} ·{' '}
            {itemCount === 1 ? '1 producto' : `${itemCount} productos`}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      {firstItem && (
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-3">
          <Link
            href={`/publicacion/${firstItem.publicationId}`}
            className="relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <Image
              src={firstItem.photo}
              alt={firstItem.publicationTitle}
              fill
              sizes="56px"
              className="object-cover"
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Link
              href={`/publicacion/${firstItem.publicationId}`}
              className="line-clamp-1 text-sm font-medium text-neutral-900 hover:text-primary-700 focus:outline-none focus-visible:underline"
            >
              {firstItem.publicationTitle}
            </Link>
            {restCount > 0 ? (
              <p className="inline-flex items-center gap-1 text-xs text-neutral-500">
                <Package size={11} strokeWidth={1.5} aria-hidden />Y {restCount}{' '}
                {restCount === 1 ? 'producto más' : 'productos más'}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                {firstItem.unit} · {firstItem.quantity}{' '}
                {firstItem.quantity === 1 ? 'unidad' : 'unidades'}
              </p>
            )}
          </div>
        </div>
      )}

      <footer className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Total</span>
          <span className="font-serif text-xl font-semibold tabular-nums text-neutral-900">
            {formatPrice(order.total)}
          </span>
        </div>
        <Link
          href={`/pedido/${order.id}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          Ver detalle
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
        </Link>
      </footer>
    </article>
  )
}
