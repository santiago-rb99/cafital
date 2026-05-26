'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
  aspectClassName?: string
}

export function ImageGallery({
  images,
  alt,
  className,
  aspectClassName = 'aspect-square',
}: ImageGalleryProps) {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (!lightboxOpen) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setActive((a) => (a + 1) % images.length)
      if (e.key === 'ArrowLeft') setActive((a) => (a - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [lightboxOpen, images.length])

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-neutral-200 bg-neutral-100',
          aspectClassName,
          className
        )}
        aria-label="Sin imagen"
      />
    )
  }

  const next = () => setActive((a) => (a + 1) % images.length)
  const prev = () => setActive((a) => (a - 1 + images.length) % images.length)
  const hasMultiple = images.length > 1

  return (
    <div
      className={cn(
        // Mobile: columna (main → thumbnails abajo)
        // Desktop: fila (thumbnails izquierda + main derecha)
        'flex flex-col gap-3 sm:flex-row sm:gap-4',
        className
      )}
    >
      {/* THUMBNAILS — vertical desktop, horizontal mobile (después del main) */}
      {hasMultiple && (
        <div
          role="tablist"
          aria-label="Miniaturas"
          className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:max-h-120 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0"
        >
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === active}
              aria-label={`Ver imagen ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={cn(
                'relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                idx === active
                  ? 'border-primary-300 shadow-sm'
                  : 'border-neutral-200 opacity-70 hover:border-neutral-300 hover:opacity-100'
              )}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* MAIN IMAGE — flechas laterales superpuestas */}
      <div className="relative order-1 flex-1 sm:order-2">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Ampliar imagen"
          className={cn(
            'group relative w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
            aspectClassName
          )}
        >
          <Image
            src={images[active]}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
            priority
          />
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Imagen anterior"
              className="absolute left-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-900 shadow-md transition-colors hover:bg-white hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              <ChevronLeft size={20} strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Imagen siguiente"
              className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-900 shadow-md transition-colors hover:bg-white hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              <ChevronRight size={20} strokeWidth={1.5} aria-hidden />
            </button>
            <span
              aria-hidden
              className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-neutral-900/70 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-white"
            >
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de ${alt}`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxOpen(false)
            }}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
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
                  next()
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
            <Image
              src={images[active]}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {hasMultiple && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {active + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
