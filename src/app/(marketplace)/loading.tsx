import { Skeleton } from '@/components/ui/Skeleton'
import {
  EventCardSkeleton,
  ProductCardSkeleton,
  SellerCardSkeleton,
} from '@/components/ui'

export default function MarketplaceLoading() {
  return (
    <div className="bg-neutral-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Hero */}
        <Skeleton className="aspect-3/1 w-full" rounded="xl" />

        {/* Categorías */}
        <section className="flex flex-col gap-4">
          <Skeleton className="h-7 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" rounded="lg" />
            ))}
          </div>
        </section>

        {/* Vendedores destacados */}
        <section className="flex flex-col gap-4">
          <Skeleton className="h-7 w-64" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SellerCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Publicaciones recientes */}
        <section className="flex flex-col gap-4">
          <Skeleton className="h-7 w-56" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Eventos */}
        <section className="flex flex-col gap-4">
          <Skeleton className="h-7 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
