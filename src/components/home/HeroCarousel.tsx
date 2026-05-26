'use client'

import { Children, ReactNode, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroCarouselProps {
  ariaLabel: string
  autoplayMs?: number
  /** Cada child es un slide independiente. */
  children: ReactNode
  /** Etiqueta a usar en los dots de paginación (a11y). */
  dotLabel?: (i: number, total: number) => string
  prevLabel?: string
  nextLabel?: string
}

/**
 * Shell de carrusel reutilizable para los heroes de portada (vendedores,
 * eventos, etc). Maneja autoplay con pausa al hover/focus, navegación con
 * flechas, dots y respeta `prefers-reduced-motion`.
 */
export function HeroCarousel({
  ariaLabel,
  autoplayMs = 6500,
  children,
  dotLabel = (i, total) => `Ir al slide ${i + 1} de ${total}`,
  prevLabel = 'Slide anterior',
  nextLabel = 'Siguiente slide',
}: HeroCarouselProps) {
  const slides = Children.toArray(children)
  const total = slides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const liveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (total <= 1 || paused || reducedMotion) return
    const id = setInterval(() => setIndex((i) => (i + 1) % total), autoplayMs)
    return () => clearInterval(id)
  }, [total, paused, reducedMotion, autoplayMs])

  if (total === 0) return null

  function goTo(next: number) {
    setIndex(((next % total) + total) % total)
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        aria-live="polite"
        ref={liveRef}
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      >
        {slides[index]}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={prevLabel}
            className="absolute -left-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-md transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 md:inline-flex"
          >
            <ChevronLeft size={18} strokeWidth={1.5} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={nextLabel}
            className="absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-md transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 md:inline-flex"
          >
            <ChevronRight size={18} strokeWidth={1.5} aria-hidden />
          </button>

          <div
            role="tablist"
            aria-label="Selector de slide"
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={dotLabel(i, total)}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                  i === index
                    ? 'w-6 bg-primary-500'
                    : 'w-3 bg-neutral-300 hover:bg-neutral-500'
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
