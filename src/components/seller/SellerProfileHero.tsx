import Image from 'next/image'
import { BadgeCheck, FileBadge, MapPin } from 'lucide-react'
import { Seller } from '@/types'
import { WhatsAppButton } from '@/components/catalog/WhatsAppButton'
import { SellerFavoriteButton } from './SellerFavoriteButton'

interface SellerProfileHeroProps {
  seller: Seller
  publicationsCount: number
}

export function SellerProfileHero({
  seller,
  publicationsCount,
}: SellerProfileHeroProps) {
  const isVerified = seller.subscriptionPlan !== 'none'

  return (
    <section
      aria-labelledby="seller-name"
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 sm:aspect-3/1">
        {seller.banner ? (
          <Image
            src={seller.banner}
            alt={`Portada de ${seller.businessName}`}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAFAFA_25%,transparent_25%,transparent_50%,#FAFAFA_50%,#FAFAFA_75%,transparent_75%,transparent)] bg-size-[14px_14px]" />
        )}
      </div>

      <div className="relative px-5 pb-6 pt-16 sm:px-8 sm:pt-20">
        <span className="absolute -top-12 left-5 block h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-neutral-100 shadow-sm sm:left-8 sm:h-28 sm:w-28">
          {seller.logo ? (
            <Image
              src={seller.logo}
              alt={`Logo de ${seller.businessName}`}
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-xl font-semibold text-neutral-500"
              aria-hidden
            >
              {seller.businessName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                id="seller-name"
                className="font-serif text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl"
              >
                {seller.businessName}
              </h1>
              {isVerified && (
                <BadgeCheck
                  size={20}
                  strokeWidth={1.5}
                  className="text-primary-500"
                  aria-label="Vendedor verificado"
                />
              )}
            </div>

            <dl className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-neutral-500">
              {seller.department && (
                <div className="inline-flex items-center gap-1">
                  <MapPin size={12} strokeWidth={1.5} aria-hidden />
                  <dt className="sr-only">Ubicación</dt>
                  <dd>
                    {seller.municipality
                      ? `${seller.municipality}, ${seller.department}`
                      : seller.department}
                  </dd>
                </div>
              )}
              {seller.nit && (
                <div className="inline-flex items-center gap-1">
                  <FileBadge size={12} strokeWidth={1.5} aria-hidden />
                  <dt>NIT</dt>
                  <dd className="tabular-nums">{seller.nit}</dd>
                </div>
              )}
              <div>
                <dt className="sr-only">Publicaciones</dt>
                <dd>
                  {publicationsCount === 0
                    ? 'Sin publicaciones activas'
                    : publicationsCount === 1
                      ? '1 publicación activa'
                      : `${publicationsCount} publicaciones activas`}
                </dd>
              </div>
            </dl>

            {seller.description && (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-900">
                {seller.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <SellerFavoriteButton
              sellerId={seller.id}
              sellerName={seller.businessName}
            />
            <WhatsAppButton
              publicationTitle={`Contacto con ${seller.businessName}`}
              publicationId={seller.id}
              variant="secondary"
              size="md"
              fullWidth={false}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
