'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Eye,
  ImagePlus,
  Images,
  Lock,
  MoveLeft,
  MoveRight,
  Trash2,
} from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { Seller } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  addProfileImage,
  removeProfileImage,
  reorderProfileImages,
} from '@/lib/api/advertising'
import { cn } from '@/lib/utils'

interface GalleryManagerCardProps {
  seller: Seller
  galleryMax: number
}

const OVERLAY_BTN =
  'inline-flex h-7 w-7 items-center justify-center rounded bg-white/90 text-neutral-900 shadow-xs transition-colors hover:bg-white focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50'

export function GalleryManagerCard({ seller, galleryMax }: GalleryManagerCardProps) {
  const { refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (seller.id !== trackedId) {
    setTrackedId(seller.id)
    setImages(seller.profileImages ?? [])
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const createdUrls = useRef<string[]>([])

  useEffect(() => {
    const urls = createdUrls.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [])

  const remaining = galleryMax - images.length
  const blocked = galleryMax === 0

  if (blocked) {
    return (
      <section
        aria-labelledby="gallery-locked-heading"
        className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center shadow-xs"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Lock size={20} strokeWidth={1.5} aria-hidden />
        </div>
        <h2
          id="gallery-locked-heading"
          className="mt-3 font-serif text-lg font-semibold text-neutral-900"
        >
          Galería del perfil
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
          Disponible desde el <strong>plan Cosecha</strong>. Suma imágenes
          adicionales a tu perfil público para destacar tu negocio.
        </p>
        <ButtonLink href="/mi-tienda/planes" size="md" className="mt-4">
          Ver planes
        </ButtonLink>
      </section>
    )
  }

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const incoming = Array.from(files).slice(0, remaining)
    if (inputRef.current) inputRef.current.value = ''
    setBusy(true)
    try {
      let last = images
      for (const file of incoming) {
        const url = URL.createObjectURL(file)
        createdUrls.current.push(url)
        const updated = await addProfileImage(seller.id, url)
        last = updated.profileImages ?? []
        setImages(last)
      }
      refreshUser()
      showSuccess(
        incoming.length === 1
          ? 'Imagen añadida a la galería'
          : `${incoming.length} imágenes añadidas`,
      )
    } catch (e) {
      showError(
        'No pudimos subir la imagen',
        e instanceof Error ? e.message : undefined,
      )
    } finally {
      setBusy(false)
    }
  }

  async function onConfirmRemove() {
    if (!pendingRemove) return
    try {
      const updated = await removeProfileImage(seller.id, pendingRemove)
      setImages(updated.profileImages ?? [])
      refreshUser()
      showSuccess('Imagen eliminada')
    } catch (e) {
      showError('No pudimos eliminar', e instanceof Error ? e.message : undefined)
    } finally {
      setPendingRemove(null)
    }
  }

  async function move(idx: number, to: number) {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(idx, 1)
    next.splice(to, 0, item)
    const optimistic = next
    const previous = images
    setImages(optimistic)
    try {
      await reorderProfileImages(seller.id, optimistic)
      refreshUser()
    } catch (e) {
      setImages(previous)
      showError('No pudimos reordenar', e instanceof Error ? e.message : undefined)
    }
  }

  return (
    <section
      aria-labelledby="gallery-ad-heading"
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <header className="flex flex-col gap-2 border-b border-neutral-200 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
              <Images size={14} strokeWidth={1.5} aria-hidden />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">
              Galería del perfil
            </span>
          </div>
          <h2
            id="gallery-ad-heading"
            className="font-serif text-lg font-semibold text-neutral-900"
          >
            Imágenes adicionales en tu perfil
          </h2>
          <p className="text-sm text-neutral-500">
            Aparecen como carrusel en tu perfil público. Ordena para que las
            mejores se vean primero.
          </p>
        </div>
        <span className="self-start text-sm font-semibold tabular-nums text-neutral-900 sm:self-end">
          {images.length} / {galleryMax}
        </span>
      </header>

      <div className="p-6">
        {images.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-white px-6 py-10 text-center transition-colors hover:border-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:opacity-60"
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
              Hasta {galleryMax} · JPG, PNG o WEBP
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
                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(src)}
                    aria-label={`Ver imagen ${idx + 1}`}
                    className={OVERLAY_BTN}
                  >
                    <Eye size={14} strokeWidth={1.5} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingRemove(src)}
                    aria-label={`Eliminar imagen ${idx + 1}`}
                    className={cn(OVERLAY_BTN, 'text-[#D32F2F]')}
                  >
                    <Trash2 size={14} strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
                <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    aria-label={`Mover imagen ${idx + 1} hacia atrás`}
                    className={OVERLAY_BTN}
                  >
                    <MoveLeft size={14} strokeWidth={1.5} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === images.length - 1}
                    aria-label={`Mover imagen ${idx + 1} hacia adelante`}
                    className={OVERLAY_BTN}
                  >
                    <MoveRight size={14} strokeWidth={1.5} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
            {remaining > 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-200 bg-white text-center transition-colors hover:border-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:opacity-60"
                >
                  <ImagePlus
                    size={20}
                    strokeWidth={1.5}
                    className="text-neutral-500"
                    aria-hidden
                  />
                  <span className="text-xs font-medium text-neutral-900">
                    Añadir imagen
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {remaining} disponible{remaining === 1 ? '' : 's'}
                  </span>
                </button>
              </li>
            )}
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
      </div>

      <ConfirmDialog
        open={pendingRemove !== null}
        onClose={() => setPendingRemove(null)}
        onConfirm={onConfirmRemove}
        title="¿Eliminar esta imagen?"
        description="Se quitará de tu galería pública. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
      />

      <Modal
        open={lightboxUrl !== null}
        onClose={() => setLightboxUrl(null)}
        size="lg"
        title="Vista previa"
      >
        {lightboxUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-100">
            <Image
              src={lightboxUrl}
              alt="Vista previa"
              fill
              sizes="100vw"
              className="object-contain"
              unoptimized={lightboxUrl.startsWith('blob:')}
            />
          </div>
        )}
      </Modal>

      {busy && (
        <div className="border-t border-neutral-200 px-6 py-3 text-xs text-neutral-500">
          Subiendo imagen…
        </div>
      )}
    </section>
  )
}
