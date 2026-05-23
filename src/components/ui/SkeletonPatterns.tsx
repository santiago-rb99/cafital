import { Skeleton } from './Skeleton'
import { cn } from '@/lib/utils'

/**
 * Skeletons compuestos que imitan layouts reales por feature.
 * El objetivo: dar feedback de carga sin "saltos" — el skeleton ocupa
 * exactamente el mismo espacio que el contenido final.
 */

/* ─── ProductCard ──────────────────────────────────────────── */

export function ProductCardSkeleton() {
  return (
    <article
      role="presentation"
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
    >
      <Skeleton className="aspect-square w-full" rounded="sm" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-6" rounded="full" />
        </div>
      </div>
    </article>
  )
}

/* ─── SellerCard ───────────────────────────────────────────── */

export function SellerCardSkeleton() {
  return (
    <article
      role="presentation"
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
    >
      <div className="relative">
        <Skeleton className="aspect-video w-full" rounded="sm" />
        <span className="absolute -bottom-6 left-4 block h-14 w-14 overflow-hidden rounded-xl border-4 border-white">
          <Skeleton className="h-full w-full" rounded="lg" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-9">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="mt-auto pt-3">
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </article>
  )
}

/* ─── EventCard ────────────────────────────────────────────── */

export function EventCardSkeleton() {
  return (
    <article
      role="presentation"
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
    >
      <Skeleton className="aspect-16/10 w-full" rounded="sm" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </article>
  )
}

/* ─── OrderCard ────────────────────────────────────────────── */

export function OrderCardSkeleton() {
  return (
    <article
      role="presentation"
      aria-hidden
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-20" rounded="md" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded="md" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    </article>
  )
}

/* ─── Grid Skeleton (genérico) ────────────────────────────── */

interface GridSkeletonProps {
  /** Número de skeletons a renderizar. */
  count?: number
  /** Componente skeleton por celda. */
  Item: () => React.JSX.Element
  /** Clases de la grilla (debe coincidir con el grid real). */
  className?: string
}

export function GridSkeleton({
  count = 8,
  Item,
  className,
}: GridSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando contenido"
      aria-busy="true"
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  )
}

/* ─── Table row skeleton ──────────────────────────────────── */

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr aria-hidden>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className="h-4 w-full max-w-32" />
        </td>
      ))}
    </tr>
  )
}

/* ─── Page skeleton ───────────────────────────────────────── */

/**
 * Skeleton de página completa: header + grid. Sirve como fallback genérico
 * para rutas RSC mientras carga la data.
 */
export function PageGridSkeleton({
  Item = ProductCardSkeleton,
  count = 8,
  withFilters = false,
  withHeader = true,
}: {
  Item?: () => React.JSX.Element
  count?: number
  withFilters?: boolean
  withHeader?: boolean
}) {
  return (
    <div className="bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {withHeader && (
          <header className="mb-6 flex flex-col gap-2 sm:mb-8">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </header>
        )}

        {withFilters ? (
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
            <aside className="hidden lg:block">
              <div className="sticky top-20 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-9 w-full" rounded="md" />
                <Skeleton className="h-9 w-full" rounded="md" />
                <Skeleton className="h-9 w-full" rounded="md" />
                <Skeleton className="h-9 w-full" rounded="md" />
              </div>
            </aside>
            <div className="flex flex-col gap-5">
              <Skeleton className="h-10 w-full" rounded="md" />
              <GridSkeleton Item={Item} count={count} />
            </div>
          </div>
        ) : (
          <GridSkeleton Item={Item} count={count} />
        )}
      </div>
    </div>
  )
}
