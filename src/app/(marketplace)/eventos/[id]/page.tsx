import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Users,
  Video,
} from 'lucide-react'

import { getEvent } from '@/lib/api/events'
import { getUser } from '@/lib/api/users'
import { Seller } from '@/types'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EventRegistrationPanel } from '@/components/events/EventRegistrationPanel'
import {
  EVENT_MODALITY_LABEL,
  EVENT_TYPE_LABEL,
} from '@/components/events/eventFiltersState'

import { formatDate } from '@/lib/utils'

export default async function EventoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event || event.status !== 'active') notFound()

  const organizerUser = await getUser(event.organizerId)
  const organizer =
    organizerUser?.role === 'seller' ? (organizerUser as Seller) : null

  const isVirtual = event.modality === 'virtual'
  const isVerified = organizer?.subscriptionPlan !== 'none'

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs
          items={[
            { label: 'Eventos', href: '/eventos' },
            { label: EVENT_TYPE_LABEL[event.type], href: `/eventos?type=${event.type}` },
            { label: event.name },
          ]}
          className="mb-5"
        />

        <div className="grid gap-6 md:grid-cols-[1fr_360px] md:gap-8 lg:gap-10">
          <div className="flex flex-col gap-6">
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
              <Image
                src={event.image}
                alt={event.name}
                fill
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
                priority
              />
              <span className="absolute left-3 top-3 inline-flex items-center rounded bg-white/95 px-2 py-0.5 text-xs font-medium text-neutral-900 shadow-xs">
                {EVENT_TYPE_LABEL[event.type]}
              </span>
            </div>

            <header className="flex flex-col gap-2">
              <h1 className="font-serif text-2xl font-bold leading-tight text-neutral-900 sm:text-[28px]">
                {event.name}
              </h1>
              <p className="text-xs text-neutral-500">
                Organiza{' '}
                {organizer ? (
                  <>
                    <Link
                      href={`/vendedor/${organizer.id}`}
                      className="font-medium text-neutral-900 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
                    >
                      {organizer.businessName}
                    </Link>
                    {isVerified && (
                      <BadgeCheck
                        size={12}
                        strokeWidth={1.5}
                        className="-mt-0.5 ml-1 inline text-primary-500"
                        aria-label="Vendedor verificado"
                      />
                    )}
                  </>
                ) : (
                  <span className="font-medium text-neutral-900">
                    Organizador Cafital
                  </span>
                )}
              </p>
            </header>

            <section
              aria-labelledby="event-info-heading"
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 id="event-info-heading" className="sr-only">
                Información del evento
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Meta label="Fecha" Icon={Calendar}>
                  {formatDate(event.date)}
                </Meta>
                <Meta label="Hora" Icon={Clock}>
                  {event.startTime}
                  {event.endTime ? ` – ${event.endTime}` : ''}
                </Meta>
                <Meta
                  label="Modalidad"
                  Icon={isVirtual ? Video : MapPin}
                >
                  {EVENT_MODALITY_LABEL[event.modality]}
                  {!isVirtual && event.city ? ` · ${event.city}` : ''}
                </Meta>
                {event.capacity ? (
                  <Meta label="Cupos" Icon={Users}>
                    {event.registeredCount} de {event.capacity} ocupados
                  </Meta>
                ) : (
                  <Meta label="Cupos" Icon={Users}>
                    Sin límite de cupos
                  </Meta>
                )}
              </dl>

              {!isVirtual && event.address && (
                <div className="mt-5 border-t border-neutral-200 pt-5">
                  <h3 className="mb-1 text-[13px] font-semibold text-neutral-900">
                    Dirección
                  </h3>
                  <p className="text-sm text-neutral-900">{event.address}</p>
                </div>
              )}

              {isVirtual && event.eventLink && (
                <div className="mt-5 border-t border-neutral-200 pt-5">
                  <h3 className="mb-1 text-[13px] font-semibold text-neutral-900">
                    Enlace del evento
                  </h3>
                  <Link
                    href={event.eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 break-all text-sm font-medium text-primary-500 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
                  >
                    {event.eventLink}
                    <ExternalLink
                      size={13}
                      strokeWidth={1.5}
                      className="shrink-0"
                      aria-hidden
                    />
                  </Link>
                </div>
              )}
            </section>

            <section
              aria-labelledby="event-desc-heading"
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2
                id="event-desc-heading"
                className="mb-3 font-serif text-lg font-semibold text-neutral-900"
              >
                Descripción
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-900">
                {event.description}
              </p>
            </section>

            {organizer && (
              <section
                aria-labelledby="event-org-heading"
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <h2 id="event-org-heading" className="sr-only">
                  Sobre el organizador
                </h2>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                    {organizer.logo ? (
                      <Image
                        src={organizer.logo}
                        alt={`Logo de ${organizer.businessName}`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500">
                        {organizer.businessName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-semibold text-neutral-900">
                        {organizer.businessName}
                      </h3>
                      {isVerified && (
                        <BadgeCheck
                          size={14}
                          strokeWidth={1.5}
                          className="text-primary-500"
                          aria-label="Vendedor verificado"
                        />
                      )}
                    </div>
                    {organizer.description && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-neutral-500">
                        {organizer.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/vendedor/${organizer.id}`}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                  >
                    Ver tienda
                    <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
                  </Link>
                </div>
              </section>
            )}
          </div>

          <div className="md:sticky md:top-20 md:self-start">
            <EventRegistrationPanel event={event} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Meta({
  label,
  Icon,
  children,
}: {
  label: string
  Icon: typeof Calendar
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
        <Icon size={12} strokeWidth={1.5} aria-hidden />
        {label}
      </dt>
      <dd className="text-sm text-neutral-900">{children}</dd>
    </div>
  )
}
