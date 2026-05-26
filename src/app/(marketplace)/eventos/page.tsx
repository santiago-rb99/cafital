import Link from 'next/link'
import { CalendarX } from 'lucide-react'

import { listEvents } from '@/lib/api/events'
import { listSellers } from '@/lib/api/users'

import { EventCard } from '@/components/events/EventCard'
import { EventFilters } from '@/components/events/EventFilters'
import { MobileEventFiltersDrawer } from '@/components/events/MobileEventFiltersDrawer'
import {
  parseEventFilters,
  rangeToBounds,
} from '@/components/events/eventFiltersState'
import { EmptyState } from '@/components/ui/EmptyState'
import { EventsHeroBanner } from '@/components/home/EventsHeroBanner'
import { buildEventHeroSlides } from '@/components/home/heroSlides'

type SearchParamValue = string | string[] | undefined

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>
}) {
  const raw = await searchParams
  const state = parseEventFilters(raw)
  const { fromDate, toDate } = rangeToBounds(state.range)

  const [allEvents, eventsForHero, sellers] = await Promise.all([
    listEvents({
      type: state.type ?? undefined,
      modality: state.modality ?? undefined,
      department: state.department ?? undefined,
      q: state.q || undefined,
      fromDate,
      toDate,
    }),
    listEvents(),
    listSellers(),
  ])

  const sellersById = new Map(sellers.map((s) => [s.id, s]))
  const heroSlides = buildEventHeroSlides(eventsForHero, sellersById)

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {heroSlides.length > 0 && (
          <div className="mb-8 sm:mb-10">
            <EventsHeroBanner slides={heroSlides} />
          </div>
        )}

        <header className="mb-6 flex flex-col gap-1 sm:mb-8">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Eventos
          </h1>
          <p className="text-sm text-neutral-500">
            Talleres, catas, ferias, capacitaciones y tours del ecosistema cafetero
            boliviano.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <EventFilters state={state} />
            </div>
          </aside>

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-neutral-900">
                {allEvents.length === 0
                  ? 'Sin eventos'
                  : allEvents.length === 1
                    ? '1 evento'
                    : `${allEvents.length} eventos`}
              </p>
              <MobileEventFiltersDrawer state={state} />
            </div>

            {allEvents.length === 0 ? (
              <EmptyState
                icon={<CalendarX size={28} strokeWidth={1.5} />}
                title="Sin eventos para estos filtros"
                description="Prueba ampliar el rango de fechas o quitar algún filtro."
                action={
                  <Link
                    href="/eventos"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-500 bg-white px-4 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                  >
                    Limpiar filtros
                  </Link>
                }
              />
            ) : (
              <ul
                role="list"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {allEvents.map((event) => {
                  const organizer = sellersById.get(event.organizerId)
                  return (
                    <li key={event.id}>
                      <EventCard
                        event={event}
                        organizerName={
                          organizer?.businessName ?? 'Organizador Cafital'
                        }
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
