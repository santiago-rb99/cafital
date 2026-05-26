import Link from 'next/link'
import { ArrowRight, Calendar, Sparkles } from 'lucide-react'
import { listPublications } from '@/lib/api/publications'
import { listEvents } from '@/lib/api/events'
import { listSellers } from '@/lib/api/users'
import { Publication, Seller } from '@/types'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HeroBanner } from '@/components/home/HeroBanner'
import { buildSellerHeroSlides } from '@/components/home/heroSlides'
import { BecomeSellerBanner } from '@/components/home/BecomeSellerBanner'
import { ProductCard } from '@/components/catalog/ProductCard'
import { EventCard } from '@/components/events/EventCard'
import { SellerCard } from '@/components/seller/SellerCard'
import { CardCarousel } from '@/components/ui/CardCarousel'
import { formatDate } from '@/lib/utils'

const PLAN_PRIORITY: Record<Seller['subscriptionPlan'], number> = {
  exportacion: 3,
  cosecha: 2,
  semilla: 1,
  none: 0,
}

/**
 * Puntúa una publicación para el ranking "Productos destacados":
 *  - Vendedor con plan (semilla/cosecha/exportación) pondera más
 *  - Puntaje SCA alto suma (atributo opcional)
 *  - Views totales como desempate suave
 */
function featuredScore(pub: Publication, sellersById: Map<string, Seller>): number {
  let score = 0
  const seller = sellersById.get(pub.sellerId)
  if (seller) score += PLAN_PRIORITY[seller.subscriptionPlan] * 10

  const sca = pub.attributes['Puntuación SCA'] ?? pub.attributes['Puntaje SCA']
  if (typeof sca === 'string') {
    if (sca.includes('90+')) score += 8
    else if (sca.includes('85')) score += 6
    else if (sca.includes('80')) score += 4
  }
  score += Math.min((pub.views ?? 0) / 100, 5)
  return score
}

export default async function HomePage() {
  const [publications, events, sellers] = await Promise.all([
    listPublications({ sort: 'recent' }),
    listEvents(),
    listSellers(),
  ])

  const sellersById = new Map(sellers.map((s) => [s.id, s]))

  // HERO — un vendedor por slide
  const heroSlides = buildSellerHeroSlides(sellers)

  // PRODUCTOS DESTACADOS — ranking compuesto
  const featuredProducts = [...publications]
    .map((p) => ({ p, score: featuredScore(p, sellersById) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((entry) => entry.p)

  // PRODUCTOS CON DESCUENTO — `discount > 0`, ordenado por mayor descuento
  const discountedProducts = publications
    .filter((p) => typeof p.discount === 'number' && p.discount > 0)
    .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
    .slice(0, 8)

  // EVENTOS DESTACADOS — competencias/ferias y/o de vendedores premium
  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = events
    .filter((e) => e.date >= today && e.status === 'active')
    .sort((a, b) => a.date.localeCompare(b.date))

  const featuredEvent =
    upcomingEvents.find((e) => {
      if (e.type === 'competencia' || e.type === 'feria') return true
      const organizer = sellersById.get(e.organizerId)
      return (
        organizer?.subscriptionPlan === 'exportacion' ||
        organizer?.subscriptionPlan === 'cosecha'
      )
    }) ?? upcomingEvents[0]

  const upcomingEventsList = upcomingEvents
    .filter((e) => e.id !== featuredEvent?.id)
    .slice(0, 3)

  // VENDEDORES DESTACADOS — al final
  const featuredSellers = sellers
    .filter(
      (s) =>
        s.subscriptionPlan === 'exportacion' || s.subscriptionPlan === 'cosecha'
    )
    .sort(
      (a, b) => PLAN_PRIORITY[b.subscriptionPlan] - PLAN_PRIORITY[a.subscriptionPlan]
    )

  return (
    <div className="bg-page">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10 lg:gap-16 lg:px-8 lg:py-12">
        {/* 1. HERO — vendedores premium / anuncios */}
        {heroSlides.length > 0 && <HeroBanner slides={heroSlides} />}

        {/* 2. CATEGORÍAS */}
        <Section
          title="Explora por categoría"
          subtitle="Café, equipos, servicios y terrenos del ecosistema boliviano."
        >
          <CategoryGrid />
        </Section>

        {/* 3. PRODUCTOS DESTACADOS */}
        {featuredProducts.length > 0 && (
          <Section
            title="Productos destacados"
            subtitle="Lo mejor del marketplace según puntuación SCA y plan del vendedor."
            linkHref="/catalogo?sort=popular"
            linkLabel="Ver más destacados"
          >
            <CardCarousel ariaLabel="Productos destacados">
              {featuredProducts.map((pub) => {
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

        {/* 4. PRODUCTOS CON DESCUENTO */}
        {discountedProducts.length > 0 && (
          <Section
            title="Productos con descuento"
            subtitle="Ofertas activas en café, insumos, equipos y servicios."
            linkHref="/catalogo"
            linkLabel="Ver catálogo completo"
          >
            <CardCarousel ariaLabel="Productos con descuento">
              {discountedProducts.map((pub) => {
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

        {/* 5. CTA — Forma parte de Cafital */}
        <BecomeSellerBanner />

        {/* 6. EVENTO HERO + próximos eventos */}
        {featuredEvent && (
          <FeaturedEventHero
            event={featuredEvent}
            organizer={sellersById.get(featuredEvent.organizerId)}
          />
        )}

        {upcomingEventsList.length > 0 && (
          <Section
            title="Próximos eventos"
            subtitle="Talleres, catas, ferias y capacitaciones."
            linkHref="/eventos"
            linkLabel="Ver todos los eventos"
          >
            <CardCarousel ariaLabel="Próximos eventos">
              {upcomingEventsList.map((event) => {
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

        {/* 7. VENDEDORES DESTACADOS — al final */}
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
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
        {linkHref && linkLabel && (
          <Link
            href={linkHref}
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary-300 transition-colors hover:text-primary-500 focus:outline-none focus-visible:underline sm:inline-flex"
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
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary-300 transition-colors hover:text-primary-500 focus:outline-none focus-visible:underline sm:hidden"
        >
          {linkLabel}
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
        </Link>
      )}
    </section>
  )
}

/**
 * Hero de un evento destacado (competencia/feria o de vendedor premium).
 * Diseño contrastante con el HeroBanner principal para no competir visualmente.
 */
function FeaturedEventHero({
  event,
  organizer,
}: {
  event: import('@/types').CafeEvent
  organizer: Seller | undefined
}) {
  return (
    <section
      aria-labelledby="featured-event-heading"
      className="overflow-hidden rounded-2xl border border-accent-300/40 bg-accent-100/50 shadow-sm"
    >
      <div className="grid items-center gap-6 px-6 py-8 sm:px-8 md:grid-cols-[1fr_1.2fr] md:gap-8 md:py-10">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-white">
            <Sparkles size={12} strokeWidth={2} aria-hidden />
            Evento destacado
          </span>
          <h2
            id="featured-event-heading"
            className="font-serif text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl"
          >
            {event.name}
          </h2>
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-900">
            <Calendar size={14} strokeWidth={1.5} aria-hidden />
            {formatDate(event.date)} · {event.startTime}
          </p>
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-900/80">
            {event.description}
          </p>
          {organizer && (
            <p className="text-xs text-neutral-500">
              Organiza{' '}
              <span className="font-medium text-neutral-900">
                {organizer.businessName}
              </span>
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/eventos/${event.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              Ver evento
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </Link>
            <Link
              href="/eventos"
              className="text-sm font-medium text-accent-900 underline-offset-2 hover:text-accent-700 hover:underline focus:outline-none focus-visible:underline"
            >
              Otros eventos
            </Link>
          </div>
        </div>

        <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
