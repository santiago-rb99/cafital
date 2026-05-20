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

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className={cn(
          'group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100',
          aspectClassName
        )}
        aria-label="Ampliar imagen"
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform group-hover:scale-[1.02]"
        />
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              aria-current={idx === active ? 'true' : undefined}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition-colors',
                idx === active ? 'border-primary-500' : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

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
          {images.length > 1 && (
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
          {images.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {active + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
