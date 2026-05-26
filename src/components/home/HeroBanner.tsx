'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck } from 'lucide-react'
import { Seller } from '@/types'
import { HeroCarousel } from './HeroCarousel'

export interface HeroSellerSlide {
  seller: Seller
  /** Imagen elegida por el vendedor para promocionarse. */
  image: string
  /** Copy promocional breve (1–2 frases). */
  copy: string
}

interface HeroBannerProps {
  slides: HeroSellerSlide[]
  autoplayMs?: number
}

/**
 * Hero principal del marketplace: un slide por vendedor publicitado. Cada
 * slide muestra la imagen elegida por el vendedor, su identidad y un CTA al
 * perfil de tienda. Usado en Home, Catálogo y Vendedores.
 */
export function HeroBanner({ slides, autoplayMs }: HeroBannerProps) {
  if (slides.length === 0) return null

  return (
    <HeroCarousel
      ariaLabel="Vendedores destacados"
      autoplayMs={autoplayMs}
      dotLabel={(i, total) => `Ir al vendedor ${i + 1} de ${total}`}
      prevLabel="Vendedor anterior"
      nextLabel="Siguiente vendedor"
    >
      {slides.map((slide, i) => (
        <SellerHeroSlide
          key={slide.seller.id}
          seller={slide.seller}
          image={slide.image}
          copy={slide.copy}
          priority={i === 0}
        />
      ))}
    </HeroCarousel>
  )
}

interface SellerHeroSlideProps {
  seller: Seller
  image: string
  copy: string
  priority?: boolean
}

function SellerHeroSlide({
  seller,
  image,
  copy,
  priority,
}: SellerHeroSlideProps) {
  const isVerified = seller.subscriptionPlan !== 'none'
  const locationParts = [seller.municipality, seller.department].filter(Boolean)

  return (
    <div className="grid min-h-76 gap-0 md:min-h-88 md:grid-cols-[1fr_1.1fr]">
      <div className="order-2 flex flex-col justify-center gap-4 px-6 py-8 sm:px-8 sm:py-10 md:order-1 md:px-10">
        <div className="flex items-center gap-3">
          {seller.logo && (
            <Image
              src={seller.logo}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full border border-neutral-200 object-cover"
            />
          )}
          <div className="flex min-w-0 flex-col">
            <p className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">
              <span className="truncate">{seller.businessName}</span>
              {isVerified && (
                <BadgeCheck
                  size={14}
                  strokeWidth={1.5}
                  className="shrink-0 text-primary-500"
                  aria-label="Vendedor verificado"
                />
              )}
            </p>
            {locationParts.length > 0 && (
              <p className="truncate text-xs text-neutral-500">
                {locationParts.join(' · ')}
              </p>
            )}
          </div>
        </div>

        <p className="line-clamp-4 font-serif text-2xl leading-tight font-bold text-neutral-900 sm:text-3xl">
          {copy}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Link
            href={`/vendedor/${seller.id}`}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-300 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            Visitar tienda
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </div>

      <div className="relative order-1 min-h-56 md:order-2 md:min-h-full">
        <Image
          src={image}
          alt={`Imagen de ${seller.businessName}`}
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover"
          priority={priority}
        />
      </div>
    </div>
  )
}
