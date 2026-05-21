import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { listPublications } from '@/lib/api/publications'
import { listEvents } from '@/lib/api/events'
import { listSellers } from '@/lib/api/users'
import { Seller } from '@/types'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HeroBanner } from '@/components/home/HeroBanner'
import { ProductCard } from '@/components/catalog/ProductCard'
import { EventCard } from '@/components/events/EventCard'
import { SellerCard } from '@/components/seller/SellerCard'
import { CardCarousel } from '@/components/ui/CardCarousel'

const PLAN_PRIORITY: Record<Seller['subscriptionPlan'], number> = {
  exportacion: 3,
  cosecha: 2,
  semilla: 1,
  none: 0,
}

const HERO_COPY: Record<
  Exclude<Seller['subscriptionPlan'], 'none'>,
  { headline: string; body: (s: Seller) => string }
> = {
  exportacion: {
    headline: 'Conoce a nuestros vendedores premium',
    body: (s) =>
      s.description ??
      'Trabajamos con los líderes del ecosistema del café boliviano. Calidad verificada y servicio integral.',
  },
  cosecha: {
    headline: 'Vendedores destacados de la cosecha',
    body: (s) =>
      s.description ??
      'Productores y proveedores con presencia consolidada en el mercado boliviano.',
  },
  semilla: {
    headline: 'Nuevos vendedores en Cafital',
    body: (s) =>
      s.description ??
      'Negocios verificados que ya están publicando en Cafital.',
  },
}

export default async function HomePage() {
  const [publications, events, sellers] = await Promise.all([
    listPublications({ sort: 'recent' }),
    listEvents(),
    listSellers(),
  ])

  const sellersById = new Map(sellers.map((s) => [s.id, s]))

  const heroSellers = sellers
    .filter((s) => s.subscriptionPlan !== 'none')
    .sort((a, b) => PLAN_PRIORITY[b.subscriptionPlan] - PLAN_PRIORITY[a.subscriptionPlan])
    .slice(0, 4)

  const heroSlides = heroSellers.map((seller) => {
    const plan = seller.subscriptionPlan as Exclude<Seller['subscriptionPlan'], 'none'>
    const copy = HERO_COPY[plan]
    return {
      seller,
      headline: copy.headline,
      body: copy.body(seller),
    }
  })

  const featuredSellers = sellers
    .filter(
      (s) =>
        s.subscriptionPlan === 'exportacion' || s.subscriptionPlan === 'cosecha'
    )
    .sort(
      (a, b) => PLAN_PRIORITY[b.subscriptionPlan] - PLAN_PRIORITY[a.subscriptionPlan]
    )
    .slice(0, 3)

  const recentPublications = publications.slice(0, 8)

  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .slice(0, 3)

  return (
    <div className="bg-neutral-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10 lg:gap-16 lg:px-8 lg:py-12">
        {heroSlides.length > 0 && <HeroBanner slides={heroSlides} />}

        <Section
          title="Explora por categoría"
          subtitle="Café, equipos, servicios y terrenos del ecosistema boliviano."
        >
          <CategoryGrid />
        </Section>

        {featuredSellers.length > 0 && (
          <Section
            title="Vendedores destacados"
            subtitle="Negocios con presencia consolidada en Cafital."
            linkHref="/vendedores"
            linkLabel="Ver todos los vendedores"
          >
            <CardCarousel ariaLabel="Vendedores destacados">
              {featuredSellers.map((seller) => {
                const count = publications.filter(
                  (p) => p.sellerId === seller.id
                ).length
                return (
                  <SellerCard
                    key={seller.id}
                    seller={seller}
                    publicationsCount={count}
                  />
                )
              })}
            </CardCarousel>
          </Section>
        )}

        {recentPublications.length > 0 && (
          <Section
            title="Publicaciones recientes"
            subtitle="Lo último que se publicó en el marketplace."
            linkHref="/catalogo"
            linkLabel="Ver catálogo completo"
          >
            <CardCarousel ariaLabel="Publicaciones recientes">
              {recentPublications.map((pub) => {
                const seller = sellersById.get(pub.sellerId)
                return (
                  <ProductCard
                    key={pub.id}
                    publication={pub}
                    sellerName={seller?.businessName ?? 'Vendedor Cafital'}
                  />
                )
              })}
            </CardCarousel>
          </Section>
        )}

        {upcomingEvents.length > 0 && (
          <Section
            title="Próximos eventos"
            subtitle="Talleres, catas, ferias y capacitaciones."
            linkHref="/eventos"
            linkLabel="Ver todos los eventos"
          >
            <CardCarousel ariaLabel="Próximos eventos">
              {upcomingEvents.map((event) => {
                const organizer = sellersById.get(event.organizerId)
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    organizerName={
                      organizer?.businessName ?? 'Organizador Cafital'
                    }
                  />
                )
              })}
            </CardCarousel>
          </Section>
        )}
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  subtitle?: string
  linkHref?: string
  linkLabel?: string
  children: React.ReactNode
}

function Section({ title, subtitle, linkHref, linkLabel, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-[28px]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-neutral-500">{subtitle}</p>
          )}
        </div>
        {linkHref && linkLabel && (
          <Link
            href={linkHref}
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary-500 transition-colors hover:text-primary-700 focus:outline-none focus-visible:underline sm:inline-flex"
          >
            {linkLabel}
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </header>
      {children}
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary-500 transition-colors hover:text-primary-700 focus:outline-none focus-visible:underline sm:hidden"
        >
          {linkLabel}
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
        </Link>
      )}
    </section>
  )
}
