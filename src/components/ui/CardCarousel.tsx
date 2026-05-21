'use client'

import { isValidElement, ReactNode, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardCarouselProps {
  ariaLabel: string
  children: ReactNode[]
  className?: string
}

/**
 * Horizontal carousel that snaps page by page.
 * - mobile: 1 card per page
 * - sm+:    2 cards per page
 * - lg+:    4 cards per page (the design ceiling for this app)
 *
 * Arrows scroll by one viewport, so each click advances exactly one page
 * (= 4 cards on desktop). The gap is included in each item's basis so the
 * arithmetic stays correct.
 */
export function CardCarousel({ ariaLabel, children, className }: CardCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      setCanPrev(el.scrollLeft > 2)
      setCanNext(el.scrollLeft < max - 2)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [children.length])

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * dir, behavior: 'smooth' })
  }

  return (
    <div className={cn('relative', className)}>
      <ul
        ref={trackRef}
        aria-label={ariaLabel}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, i) => {
          const key =
            isValidElement(child) && child.key != null ? child.key : i
          return (
            <li
              key={key}
              className="shrink-0 snap-start basis-full sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-3rem)/4)]"
            >
              {child}
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={!canPrev}
        aria-label="Anterior"
        className={cn(
          'absolute left-0 top-1/2 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-md transition-opacity hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-0 sm:inline-flex'
        )}
      >
        <ChevronLeft size={18} strokeWidth={1.5} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={!canNext}
        aria-label="Siguiente"
        className={cn(
          'absolute right-0 top-1/2 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-md transition-opacity hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-0 sm:inline-flex'
        )}
      >
        <ChevronRight size={18} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  )
}
