'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { Heart, MessageCircle, Repeat2, ShoppingCart } from 'lucide-react'
import { Publication } from '@/types'
import { useFavorites } from '@/hooks/useFavorites'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { cn, formatPrice } from '@/lib/utils'

interface ProductCardProps {
  publication: Publication
  sellerName: string
  className?: string
}

const CAFITAL_DEMO_PHONE = '59170000000'

function lowestUnit(pub: Publication) {
  if (!pub.units?.length) return null
  return pub.units.reduce((min, u) => (u.price < min.price ? u : min), pub.units[0])
}

export function ProductCard({ publication, sellerName, className }: ProductCardProps) {
  const { isPublicationFavorite, togglePublication } = useFavorites()
  const { addItem } = useCart()
  const { showSuccess } = useToast()
  const isFav = isPublicationFavorite(publication.id)

  const cheapest = useMemo(() => lowestUnit(publication), [publication])
  const hasDiscount =
    typeof publication.discount === 'number' && publication.discount > 0
  const discountedPrice = cheapest && hasDiscount
    ? cheapest.price * (1 - publication.discount! / 100)
    : cheapest?.price
  const originalPrice = cheapest && hasDiscount ? cheapest.price : null

  const isQuote =
    publication.priceMode === 'quote' || publication.category === 'D'
  const showRecurring = publication.recurringAvailable

  function onAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!cheapest) return
    const qty = cheapest.minQuantity || 1
    addItem({
      publicationId: publication.id,
      sellerId: publication.sellerId,
      sellerName,
      title: publication.title,
      photo: publication.photos[0],
      unit: cheapest.unit,
      unitPrice: cheapest.price,
      quantity: qty,
      ...(hasDiscount ? { discount: publication.discount } : {}),
    })
    showSuccess('Agregado al carrito', publication.title)
  }

  const whatsappHref = useMemo(() => {
    const intent =
      publication.category === 'D'
        ? `Hola, me interesa la finca "${publication.title}". ¿Podemos coordinar una visita?`
        : `Hola, me interesa cotizar: "${publication.title}".`
    const msg = `${intent}\nCafital — ${publication.id}`
    return `https://wa.me/${CAFITAL_DEMO_PHONE}?text=${encodeURIComponent(msg)}`
  }, [publication])

  return (
    <article
      className={cn(
        'anim-fade-in-up group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <Link
        href={`/publicacion/${publication.id}`}
        aria-label={`Ver ${publication.title}`}
        className="flex h-full flex-1 flex-col gap-3 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <Image
            src={publication.photos[0]}
            alt={publication.title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          <div className="absolute left-2 top-2 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="inline-flex items-center rounded bg-neutral-900/85 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                −{publication.discount}% OFF
              </span>
            )}
            {showRecurring && (
              <span className="inline-flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-[11px] font-medium text-primary-700 shadow-xs">
                <Repeat2 size={11} strokeWidth={2} aria-hidden />
                Recurrente
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 px-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
            {publication.title}
          </h3>
          <p className="truncate text-xs text-neutral-500">por {sellerName}</p>

          <div className="mt-1.5">
            {isQuote || !cheapest ? (
              <p className="text-sm font-medium text-neutral-500">
                Consultar precio
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold tabular-nums text-neutral-900">
                    {formatPrice(discountedPrice!)}
                  </span>
                  {originalPrice !== null && (
                    <span className="text-xs tabular-nums text-neutral-500 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-500">/ {cheapest.unit}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* CTA — agregar al carrito o contactar */}
      <div className="mt-2 px-4 pb-3">
        {isQuote || !cheapest ? (
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-secondary-300 bg-white px-3 text-[13px] font-semibold text-secondary-300 transition-colors hover:bg-secondary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <MessageCircle size={14} strokeWidth={1.5} aria-hidden />
            {publication.category === 'D' ? 'Coordinar visita' : 'Contactar'}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAddToCart}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary-300 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <ShoppingCart size={14} strokeWidth={1.5} aria-hidden />
            Agregar al carrito
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          togglePublication(publication.id)
        }}
        aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        aria-pressed={isFav}
        className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-500 shadow-xs transition-colors hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
      >
        <Heart
          size={16}
          strokeWidth={1.5}
          className={cn(isFav && 'fill-[#D32F2F] text-[#D32F2F]')}
          aria-hidden
        />
      </button>
    </article>
  )
}
