import { notFound } from 'next/navigation'
import { Store } from 'lucide-react'

import { Seller } from '@/types'
import { getUser } from '@/lib/api/users'
import { listPublicationsBySeller } from '@/lib/api/publications'
import { listEventsByOrganizer } from '@/lib/api/events'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { CardCarousel } from '@/components/ui/CardCarousel'
import { EmptyState } from '@/components/ui/EmptyState'

import { ProductCard } from '@/components/catalog/ProductCard'
import { EventCard } from '@/components/events/EventCard'

import { SellerProfileHero } from '@/components/seller/SellerProfileHero'
import { SellerImageCarousel } from '@/components/seller/SellerImageCarousel'
import { SellerAbout } from '@/components/seller/SellerAbout'

const GALLERY_LIMIT_BY_PLAN: Record<Seller['subscriptionPlan'], number> = {
  none: 0,
  semilla: 0,
  cosecha: 5,
  exportacion: 10,
}

export default async function VendedorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await getUser(id)
  if (!user || user.role !== 'seller') notFound()
  const seller = user as Seller

  const [publications, events] = await Promise.all([
    listPublicationsBySeller(seller.id),
    listEventsByOrganizer(seller.id),
  ])

  const galleryLimit = GALLERY_LIMIT_BY_PLAN[seller.subscriptionPlan]
  const galleryImages = (seller.profileImages ?? []).slice(0, galleryLimit)
  const showAbout =
    seller.subscriptionPlan === 'exportacion' &&
    Boolean(
      seller.about &&
        (seller.about.mission || seller.about.vision || seller.about.history)
    )

  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = events
    .filter((e) => e.status === 'active' && e.date >= today)
    .slice(0, 8)

  // Mapa para EventCard (necesita organizerName).
  const sellersById = new Map<string, Seller>([[seller.id, seller]])

  return (
    <div className="bg-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs
          items={[
            { label: 'Vendedores', href: '/vendedores' },
            { label: seller.businessName },
          ]}
          className="mb-5"
        />

        <div className="flex flex-col gap-10">
          <SellerProfileHero
            seller={seller}
            publicationsCount={publications.length}
          />

          {showAbout && seller.about && <SellerAbout about={seller.about} />}

          {galleryImages.length > 0 && (
            <SellerImageCarousel
              images={galleryImages}
              sellerName={seller.businessName}
            />
          )}

          <section
            aria-labelledby="seller-publications-heading"
            className="flex flex-col gap-5"
          >
            <h2
              id="seller-publications-heading"
              className="font-serif text-2xl font-semibold text-neutral-900"
            >
              Publicaciones activas
            </h2>

            {publications.length === 0 ? (
              <EmptyState
                icon={<Store size={28} strokeWidth={1.5} />}
                title="Sin publicaciones por ahora"
                description="Este vendedor aún no tiene publicaciones activas. Vuelve más tarde."
              />
            ) : (
              <CardCarousel ariaLabel={`Publicaciones de ${seller.businessName}`}>
                {publications.map((pub) => (
                  <ProductCard
                    key={pub.id}
                    publication={pub}
                    sellerName={seller.businessName}
                  />
                ))}
              </CardCarousel>
            )}
          </section>

          {upcomingEvents.length > 0 && (
            <section
              aria-labelledby="seller-events-heading"
              className="flex flex-col gap-5"
            >
              <h2
                id="seller-events-heading"
                className="font-serif text-2xl font-semibold text-neutral-900"
              >
                Próximos eventos del vendedor
              </h2>
              <CardCarousel
                ariaLabel={`Próximos eventos de ${seller.businessName}`}
              >
                {upcomingEvents.map((event) => {
                  const organizer = sellersById.get(event.organizerId)
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      organizerName={organizer?.businessName ?? seller.businessName}
                    />
                  )
                })}
              </CardCarousel>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
