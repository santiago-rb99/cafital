'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { GripVertical, ImagePlus, Sparkles, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Seller, SubscriptionPlan } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateUserProfile } from '@/lib/api/users'

interface GalleryEditorProps {
  seller: Seller
}

const MAX_BY_PLAN: Record<SubscriptionPlan, number> = {
  none: 0,
  semilla: 0,
  cosecha: 5,
  exportacion: 10,
}

export function GalleryEditor({ seller }: GalleryEditorProps) {
  const { refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const max = MAX_BY_PLAN[seller.subscriptionPlan]

  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)

  if (seller.id !== trackedId) {
    setTrackedId(seller.id)
    setImages(seller.profileImages ?? [])
    setDirty(false)
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const createdUrls = useRef<string[]>([])

  useEffect(() => {
    return () => {
      for (const url of createdUrls.current) URL.revokeObjectURL(url)
    }
  }, [])

  function patchImages(next: string[]) {
    setImages(next)
    setDirty(true)
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const remaining = max - images.length
    const incoming = Array.from(files).slice(0, remaining)
    const urls = incoming.map((f) => {
      const url = URL.createObjectURL(f)
      createdUrls.current.push(url)
      return url
    })
    patchImages([...images, ...urls])
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAt(idx: number) {
    const target = images[idx]
    if (target && createdUrls.current.includes(target)) {
      URL.revokeObjectURL(target)
      createdUrls.current = createdUrls.current.filter((u) => u !== target)
    }
    patchImages(images.filter((_, i) => i !== idx))
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    patchImages(next)
  }

  async function onSave() {
    setSubmitting(true)
    try {
      await updateUserProfile(seller.id, {
        profileImages: images,
      } as Parameters<typeof updateUserProfile>[1])
      refreshUser()
      setDirty(false)
      showSuccess('Galería actualizada')
    } catch {
      showError('No pudimos guardar la galería')
    } finally {
      setSubmitting(false)
    }
  }

  const remaining = max - images.length

  return (
    <section
      aria-labelledby="gallery-editor-heading"
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <header className="mb-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Sparkles size={14} strokeWidth={1.5} aria-hidden />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">
            {seller.subscriptionPlan === 'exportacion'
              ? 'Plan Exportación'
              : 'Plan Cosecha'}
          </span>
        </div>
        <h2
          id="gallery-editor-heading"
          className="font-serif text-lg font-semibold text-neutral-900"
        >
          Galería del negocio
        </h2>
        <p className="text-sm text-neutral-500">
          Sube hasta <strong>{max} imágenes</strong> adicionales que verán los
          compradores en tu perfil público. Arrastra el orden para que aparezcan
          primero las que prefieras.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {images.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-white px-6 py-10 text-center transition-colors hover:border-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <ImagePlus
              size={28}
              strokeWidth={1.5}
              className="text-neutral-500"
              aria-hidden
            />
            <span className="text-sm font-medium text-neutral-900">
              Subir tus primeras imágenes
            </span>
            <span className="text-xs text-neutral-500">
              {max} máximo · JPG, PNG o WEBP
            </span>
          </button>
        ) : (
          <ul
            role="list"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {images.map((src, idx) => (
              <li
                key={src + idx}
                className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src={src}
                    alt={`Imagen ${idx + 1} de la galería`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                    unoptimized={src.startsWith('blob:')}
                  />
                </div>
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  aria-label={`Quitar imagen ${idx + 1}`}
                  className="absolute right-1.5 top-1.5 rounded bg-white/90 p-1 text-[#D32F2F] shadow-xs transition-colors hover:bg-white focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                >
                  <X size={14} strokeWidth={1.5} aria-hidden />
                </button>
                <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    aria-label={`Mover imagen ${idx + 1} hacia atrás`}
                    className="rounded bg-white/90 px-1.5 py-1 text-[11px] font-semibold text-neutral-900 shadow-xs hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === images.length - 1}
                    aria-label={`Mover imagen ${idx + 1} hacia adelante`}
                    className="rounded bg-white/90 px-1.5 py-1 text-[11px] font-semibold text-neutral-900 shadow-xs hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                  >
                    →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          aria-label="Subir imágenes para la galería"
          onChange={onPick}
        />

        <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
            <GripVertical
              size={13}
              strokeWidth={1.5}
              aria-hidden
              className="text-neutral-300"
            />
            {images.length} / {max} imágenes
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => inputRef.current?.click()}
              disabled={remaining <= 0 || submitting}
              leadingIcon={<ImagePlus size={16} strokeWidth={1.5} />}
            >
              Agregar imágenes
            </Button>
            <Button
              type="button"
              size="md"
              onClick={onSave}
              disabled={!dirty || submitting}
              loading={submitting}
            >
              Guardar galería
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
