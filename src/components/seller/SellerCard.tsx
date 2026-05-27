import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, MapPin } from 'lucide-react'
import { PublicationCategory, Seller } from '@/types'
import { CATEGORY_LABEL } from './sellerCategoriesUtils'
import { cn, isSellerVerified } from '@/lib/utils'

interface SellerCardProps {
  seller: Seller
  publicationsCount?: number
  /** Categorías que ofrece el seller (derivadas). Se muestran como chips. */
  categories?: PublicationCategory[]
  className?: string
}

export function SellerCard({
  seller,
  publicationsCount,
  categories,
  className,
}: SellerCardProps) {
  const isVerified = isSellerVerified(seller)

  return (
    <article
      className={cn(
        'anim-fade-in-up group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <Link
        href={`/vendedor/${seller.id}`}
        className="flex h-full flex-1 flex-col focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
      >
        <div className="relative">
          <div className="relative aspect-video overflow-hidden bg-neutral-100">
            {seller.banner ? (
              <Image
                src={seller.banner}
                alt={`Portada de ${seller.businessName}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAFAFA_25%,transparent_25%,transparent_50%,#FAFAFA_50%,#FAFAFA_75%,transparent_75%,transparent)] bg-size-[14px_14px]" />
            )}
          </div>

          <span className="absolute -bottom-6 left-4 block h-14 w-14 overflow-hidden rounded-xl border-4 border-white bg-neutral-100 shadow-sm">
            {seller.logo ? (
              <Image
                src={seller.logo}
                alt={`Logo de ${seller.businessName}`}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500"
                aria-label={`Logo de ${seller.businessName}`}
              >
                {seller.businessName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4 pt-9">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
              {seller.businessName}
            </h3>
            {isVerified && (
              <BadgeCheck
                size={14}
                strokeWidth={1.5}
                className="shrink-0 text-primary-500"
                aria-label="Vendedor verificado"
              />
            )}
          </div>
          {seller.department && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-500">
              <MapPin size={11} strokeWidth={1.5} aria-hidden />
              {seller.municipality
                ? `${seller.municipality}, ${seller.department}`
                : seller.department}
            </p>
          )}

          {seller.description && (
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {seller.description}
            </p>
          )}

          {categories && categories.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {categories.slice(0, 3).map((c) => (
                <li
                  key={c}
                  className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-900"
                >
                  {CATEGORY_LABEL[c]}
                </li>
              ))}
            </ul>
          )}

          {typeof publicationsCount === 'number' && (
            <p className="mt-auto pt-3 text-xs font-medium text-neutral-900">
              {publicationsCount === 0
                ? 'Sin publicaciones activas'
                : publicationsCount === 1
                  ? '1 publicación activa'
                  : `${publicationsCount} publicaciones activas`}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
