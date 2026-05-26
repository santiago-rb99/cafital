'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, RotateCw, Trash2 } from 'lucide-react'
import { CartItem } from '@/types'
import { QuantitySelector } from '@/components/ui/QuantitySelector'
import { useCart } from '@/contexts/CartContext'
import { cn, formatPrice } from '@/lib/utils'

interface CartItemRowProps {
  item: CartItem
  /**
   * - `compact`: vista usada en el resumen del checkout (sin selector ni acciones).
   * - `full`: carrito activo, con selector de cantidad + acciones.
   * - `saved`: ítem en "Guardados para más tarde" — sin selector, con CTA "Mover al carrito".
   */
  variant?: 'compact' | 'full' | 'saved'
  className?: string
}

function discountedPrice(item: CartItem) {
  return item.discount ? item.unitPrice * (1 - item.discount / 100) : item.unitPrice
}

export function CartItemRow({
  item,
  variant = 'full',
  className,
}: CartItemRowProps) {
  const {
    updateQuantity,
    removeItem,
    saveForLater,
    restoreFromSaved,
    removeSavedItem,
  } = useCart()
  const unitPrice = discountedPrice(item)
  const subtotal = unitPrice * item.quantity

  const isSaved = variant === 'saved'

  return (
    <article
      className={cn(
        'flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4',
        isSaved && 'bg-neutral-100/40',
        className
      )}
    >
      <Link
        href={`/publicacion/${item.publicationId}`}
        className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:h-24 sm:w-24"
        aria-label={`Ver ${item.title}`}
      >
        <Image
          src={item.photo}
          alt={item.title}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link
          href={`/publicacion/${item.publicationId}`}
          className="line-clamp-2 text-sm font-medium text-neutral-900 hover:text-primary-700 focus:outline-none focus-visible:underline"
        >
          {item.title}
        </Link>
        <p className="truncate text-xs text-neutral-500">
          {item.unit} · por {item.sellerName}
        </p>

        <div className="mt-1 flex items-end justify-between gap-3">
          {variant === 'full' ? (
            <QuantitySelector
              value={item.quantity}
              onChange={(q) => updateQuantity(item.publicationId, item.unit, q)}
              min={1}
              size="sm"
              ariaLabel={`Cantidad de ${item.title}`}
            />
          ) : (
            <span className="text-xs text-neutral-500">
              Cantidad: <span className="font-medium text-neutral-900">{item.quantity}</span>
            </span>
          )}

          <div className="flex flex-col items-end text-right leading-tight">
            <span className="text-sm font-semibold tabular-nums text-neutral-900">
              {formatPrice(subtotal)}
            </span>
            <span className="text-[11px] text-neutral-500">
              {formatPrice(unitPrice)} / {item.unit}
              {item.discount && item.discount > 0 ? (
                <> · −{item.discount}% OFF</>
              ) : null}
            </span>
          </div>
        </div>

        {variant === 'full' && (
          <button
            type="button"
            onClick={() => saveForLater(item.publicationId, item.unit)}
            className="mt-1 inline-flex w-fit items-center gap-1 rounded-md px-1 py-0.5 text-[11px] font-medium text-neutral-500 transition-colors hover:text-primary-700 focus:outline-none focus-visible:underline"
          >
            <Bookmark size={12} strokeWidth={1.5} aria-hidden />
            Guardar para más tarde
          </button>
        )}

        {variant === 'saved' && (
          <button
            type="button"
            onClick={() => restoreFromSaved(item.publicationId, item.unit)}
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md border border-primary-300 bg-white px-2.5 py-1 text-[12px] font-semibold text-primary-300 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <RotateCw size={12} strokeWidth={1.5} aria-hidden />
            Mover al carrito
          </button>
        )}
      </div>

      {variant === 'full' && (
        <button
          type="button"
          onClick={() => removeItem(item.publicationId, item.unit)}
          aria-label={`Quitar ${item.title} del carrito`}
          className="self-start rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          <Trash2 size={16} strokeWidth={1.5} aria-hidden />
        </button>
      )}

      {variant === 'saved' && (
        <button
          type="button"
          onClick={() => removeSavedItem(item.publicationId, item.unit)}
          aria-label={`Quitar ${item.title} de guardados`}
          className="self-start rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          <Trash2 size={16} strokeWidth={1.5} aria-hidden />
        </button>
      )}
    </article>
  )
}
