'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'

interface SellerFavoriteButtonProps {
  sellerId: string
  sellerName: string
  className?: string
}

export function SellerFavoriteButton({
  sellerId,
  sellerName,
  className,
}: SellerFavoriteButtonProps) {
  const { isSellerFavorite, toggleSeller } = useFavorites()
  const isFav = isSellerFavorite(sellerId)

  return (
    <button
      type="button"
      onClick={() => toggleSeller(sellerId)}
      aria-pressed={isFav}
      aria-label={
        isFav
          ? `Quitar a ${sellerName} de favoritos`
          : `Guardar a ${sellerName} en favoritos`
      }
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
        className
      )}
    >
      <Heart
        size={16}
        strokeWidth={1.5}
        className={cn(isFav && 'fill-[#D32F2F] text-[#D32F2F]')}
        aria-hidden
      />
      {isFav ? 'Guardado' : 'Guardar vendedor'}
    </button>
  )
}
