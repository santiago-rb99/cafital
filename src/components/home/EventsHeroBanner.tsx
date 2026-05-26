'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calendar, MapPin, Sparkles, Video } from 'lucide-react'
import { CafeEvent, Seller } from '@/types'
import { formatDate } from '@/lib/utils'
import { HeroCarousel } from './HeroCarousel'

export interface HeroEventSlide {
  event: CafeEvent
  organizer?: Seller
}

interface EventsHeroBannerProps {
  slides: HeroEventSlide[]
  autoplayMs?: number
}

/**
 * Hero de la página de Eventos: un slide por evento publicitado, con nombre,
 * fecha, lugar, imagen y CTA para inscribirse.
 */
export function EventsHeroBanner({ slides, autoplayMs }: EventsHeroBannerProps) {
  if (slides.length === 0) return null

  return (
    <HeroCarousel
      ariaLabel="Eventos destacados"
      autoplayMs={autoplayMs}
      dotLabel={(i, total) => `Ir al evento ${i + 1} de ${total}`}
      prevLabel="Evento anterior"
      nextLabel="Siguiente evento"
    >
      {slides.map((slide, i) => (
        <EventHeroSlide
          key={slide.event.id}
          event={slide.event}
          organizer={slide.organizer}
          priority={i === 0}
        />
      ))}
    </HeroCarousel>
  )
}

interface EventHeroSlideProps {
  event: CafeEvent
  organizer?: Seller
  priority?: boolean
}

function EventHeroSlide({ event, organizer, priority }: EventHeroSlideProps) {
  const isVirtual = event.modality === 'virtual'
  const locationLabel = isVirtual
    ? 'Evento virtual'
    : [event.city, event.department].filter(Boolean).join(', ') ||
      'Ubicación por confirmar'

  const ctaLabel = event.price === 'free' ? 'Inscribirme' : 'Comprar entrada'

  return (
    <div className="grid min-h-76 gap-0 md:min-h-88 md:grid-cols-[1fr_1.1fr]">
      <div className="order-2 flex flex-col justify-center gap-4 px-6 py-8 sm:px-8 sm:py-10 md:order-1 md:px-10">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-[12px] font-semibold tracking-wider text-accent-900 uppercase">
          <Sparkles size={12} strokeWidth={2} aria-hidden />
          Evento destacado
        </span>

        <h2 className="line-clamp-2 font-serif text-2xl leading-tight font-bold text-neutral-900 sm:text-3xl">
          {event.name}
        </h2>

        <div className="flex flex-col gap-1.5 text-sm text-neutral-500">
          <p className="inline-flex items-center gap-1.5">
            <Calendar size={14} strokeWidth={1.5} aria-hidden />
            <span>
              {formatDate(event.date)} · {event.startTime}
            </span>
          </p>
          <p className="inline-flex items-center gap-1.5">
            {isVirtual ? (
              <Video size={14} strokeWidth={1.5} aria-hidden />
            ) : (
              <MapPin size={14} strokeWidth={1.5} aria-hidden />
            )}
            <span className="truncate">{locationLabel}</span>
          </p>
        </div>

        {organizer && (
          <p className="text-xs text-neutral-500">
            Organiza{' '}
            <Link
              href={`/vendedor/${organizer.id}`}
              className="font-medium text-neutral-900 underline-offset-2 hover:underline focus:outline-none focus-visible:underline"
            >
              {organizer.businessName}
            </Link>
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Link
            href={`/eventos/${event.id}`}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            {ctaLabel}
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </div>

      <div className="relative order-1 min-h-56 md:order-2 md:min-h-full">
        <Image
          src={event.image}
          alt={event.name}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover"
          priority={priority}
        />
      </div>
    </div>
  )
}
