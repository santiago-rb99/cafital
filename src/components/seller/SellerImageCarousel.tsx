'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CardCarousel } from '@/components/ui/CardCarousel'
import { cn } from '@/lib/utils'

interface SellerImageCarouselProps {
  images: string[]
  /** Nombre del vendedor — usado en alt y descripción del lightbox. */
  sellerName: string
}

export function SellerImageCarousel({
  images,
  sellerName,
}: SellerImageCarouselProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  const closeLightbox = () => setLightboxIndex(null)
  const goPrev = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  const goNext = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length))

  return (
    <section
      aria-labelledby="seller-gallery-heading"
      className="flex flex-col gap-5"
    >
      <h2
        id="seller-gallery-heading"
        className="font-serif text-2xl font-semibold text-neutral-900"
      >
        Galería del negocio
      </h2>

      <CardCarousel ariaLabel={`Galería de ${sellerName}`}>
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`Ampliar imagen ${i + 1} de ${images.length}`}
            className="group relative block aspect-video h-full w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <Image
              src={src}
              alt={`${sellerName} — foto ${i + 1}`}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </CardCarousel>

      {lightboxIndex !== null && (
        <Lightbox
          src={images[lightboxIndex]}
          alt={`${sellerName} — foto ${lightboxIndex + 1} de ${images.length}`}
          showNavigation={images.length > 1}
          counter={`${lightboxIndex + 1} / ${images.length}`}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </section>
  )
}

function Lightbox({
  src,
  alt,
  showNavigation,
  counter,
  onClose,
  onPrev,
  onNext,
}: {
  src: string
  alt: string
  showNavigation: boolean
  counter: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (showNavigation && e.key === 'ArrowLeft') onPrev()
      else if (showNavigation && e.key === 'ArrowRight') onNext()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext, showNavigation])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4'
      )}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Cerrar"
        className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X size={20} strokeWidth={1.5} />
      </button>
      {showNavigation && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            aria-label="Imagen anterior"
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            aria-label="Imagen siguiente"
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        </>
      )}
      <div
        className="relative h-full w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" />
      </div>
      {showNavigation && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
          {counter}
        </span>
      )}
    </div>
  )
}
