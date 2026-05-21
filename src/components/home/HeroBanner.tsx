'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Seller, SubscriptionPlan } from '@/types'
import { cn } from '@/lib/utils'

interface HeroSlide {
  seller: Seller
  headline: string
  body: string
}

interface HeroBannerProps {
  slides: HeroSlide[]
  autoplayMs?: number
}

const PLAN_CHIP: Record<Exclude<SubscriptionPlan, 'none'>, { bg: string; text: string; label: string }> = {
  semilla: { bg: 'bg-primary-50', text: 'text-primary-700', label: 'Plan Semilla' },
  cosecha: { bg: 'bg-primary-100', text: 'text-primary-900', label: 'Plan Cosecha' },
  exportacion: { bg: 'bg-accent-100', text: 'text-accent-900', label: 'Plan Exportación' },
}

export function HeroBanner({ slides, autoplayMs = 6500 }: HeroBannerProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const total = slides.length
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

  const current = slides[index]
  const plan = current.seller.subscriptionPlan
  const planMeta = plan !== 'none' ? PLAN_CHIP[plan] : null

  function goTo(next: number) {
    setIndex(((next % total) + total) % total)
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Vendedores destacados"
      className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        aria-live="polite"
        ref={liveRef}
        className="grid min-h-[19rem] gap-0 md:min-h-[22rem] md:grid-cols-[1.1fr_1fr]"
      >
        <div className="flex flex-col justify-center gap-3 px-6 py-8 sm:px-8 sm:py-10 md:px-10">
          {planMeta && (
            <span
              className={cn(
                'inline-flex w-fit items-center rounded px-2 py-0.5 text-[11px] font-medium',
                planMeta.bg,
                planMeta.text
              )}
            >
              {planMeta.label}
            </span>
          )}
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            {current.seller.businessName}
          </p>
          <h2 className="font-serif text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl">
            {current.headline}
          </h2>
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-500">
            {current.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/vendedor/${current.seller.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              Ver vendedor
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </Link>
            <Link
              href={`/catalogo?seller=${current.seller.id}`}
              className="text-sm font-medium text-primary-500 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
            >
              Ver publicaciones
            </Link>
          </div>
        </div>

        <div className="relative min-h-[12rem] md:min-h-full">
          {current.seller.banner ? (
            <Image
              src={current.seller.banner}
              alt={`Portada de ${current.seller.businessName}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority={index === 0}
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/0 to-transparent md:from-white md:via-white/40 md:to-transparent" />
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Vendedor anterior"
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-500 shadow-sm transition-colors hover:bg-white hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 md:inline-flex"
          >
            <ChevronLeft size={18} strokeWidth={1.5} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente vendedor"
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-500 shadow-sm transition-colors hover:bg-white hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 md:inline-flex"
          >
            <ChevronRight size={18} strokeWidth={1.5} aria-hidden />
          </button>

          <div
            role="tablist"
            aria-label="Selector de slide"
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5"
          >
            {slides.map((s, i) => (
              <button
                key={s.seller.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Ir al vendedor ${i + 1} de ${total}`}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                  i === index ? 'w-6 bg-primary-500' : 'w-3 bg-neutral-300 hover:bg-neutral-500'
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
