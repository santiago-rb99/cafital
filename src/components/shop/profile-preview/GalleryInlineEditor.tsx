'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Lock, Pencil, Trash2 } from 'lucide-react'

import { CardCarousel } from '@/components/ui/CardCarousel'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ButtonLink } from '@/components/ui/Button'

import { Seller } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  addProfileImage,
  removeProfileImage,
  reorderProfileImages,
} from '@/lib/api/advertising'
import { cn } from '@/lib/utils'

interface GalleryInlineEditorProps {
  seller: Seller
  galleryMax: number
  /** Cuando false, oculta los overlays (modo "ver como visitante"). */
  enabled: boolean
}

const OVERLAY_BTN =
  'inline-flex h-7 w-7 items-center justify-center rounded bg-white/95 text-neutral-900 shadow-md transition-colors hover:bg-white focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60'

export function GalleryInlineEditor({
  seller,
  galleryMax,
  enabled,
}: GalleryInlineEditorProps) {
  const { refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(seller.profileImages ?? [])
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)
  const [replacingIdx, setReplacingIdx] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  if (seller.id !== trackedId) {
    setTrackedId(seller.id)
    setImages(seller.profileImages ?? [])
  }

  const addInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const createdUrls = useRef<string[]>([])

  useEffect(() => {
    const urls = createdUrls.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [])

  const remaining = galleryMax - images.length

  // Plan no permite galería: placeholder con upsell
  if (galleryMax === 0) {
    return (
      <section
        aria-labelledby="gallery-inline-locked-heading"
        className="flex flex-col gap-5"
      >
        <h2
          id="gallery-inline-locked-heading"
          className="font-serif text-2xl font-semibold text-neutral-900"
        >
          Galería del negocio
        </h2>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center shadow-xs">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <Lock size={20} strokeWidth={1.5} aria-hidden />
          </span>
          <p className="max-w-md text-sm text-neutral-500">
            Disponible desde el <strong>plan Cosecha</strong>. Suma imágenes
            adicionales a tu perfil para destacar tu negocio.
          </p>
          {enabled && (
            <ButtonLink href="/mi-tienda/planes" size="md">
              Ver planes
            </ButtonLink>
          )}
        </div>
      </section>
    )
  }

  async function onAdd(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    const incoming = Array.from(files).slice(0, Math.max(remaining, 0))
    if (addInputRef.current) addInputRef.current.value = ''
    if (incoming.length === 0) return
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
        incoming.length === 1 ? 'Imagen añadida' : `${incoming.length} imágenes añadidas`,
      )
    } catch (e) {
      showError('No pudimos subir la imagen', e instanceof Error ? e.message : undefined)
    } finally {
      setBusy(false)
    }
  }

  async function onReplaceFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const idx = replacingIdx
    if (replaceInputRef.current) replaceInputRef.current.value = ''
    setReplacingIdx(null)
    if (!file || idx === null || idx < 0 || idx >= images.length) return
    setBusy(true)
    try {
      const oldUrl = images[idx]
      const newUrl = URL.createObjectURL(file)
      createdUrls.current.push(newUrl)
      const next = [...images]
      next[idx] = newUrl
      // Backend: aplicar como remove + add a través de reorder/add.
      // Simplificamos con un patch directo de profileImages para preservar orden.
      await removeProfileImage(seller.id, oldUrl)
      await addProfileImage(seller.id, newUrl)
      // Reordenar para mantener la posición.
      const updated = await reorderProfileImages(seller.id, next)
      setImages(updated.profileImages ?? next)
      refreshUser()
      showSuccess('Imagen reemplazada')
    } catch (e) {
      showError('No pudimos reemplazar la imagen', e instanceof Error ? e.message : undefined)
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

  // Si está vacío pero el plan lo permite y editing está activo: placeholder con CTA
  if (images.length === 0) {
    if (!enabled) return null
    return (
      <section
        aria-labelledby="gallery-inline-empty-heading"
        className="flex flex-col gap-5"
      >
        <h2
          id="gallery-inline-empty-heading"
          className="font-serif text-2xl font-semibold text-neutral-900"
        >
          Galería del negocio
        </h2>
        <button
          type="button"
          onClick={() => addInputRef.current?.click()}
          disabled={busy}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-white px-6 py-10 text-center transition-colors hover:border-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:opacity-60"
        >
          <ImagePlus
            size={28}
            strokeWidth={1.5}
            className="text-neutral-500"
            aria-hidden
          />
          <span className="text-sm font-medium text-neutral-900">
            Aún no has subido imágenes — añade hasta {galleryMax}
          </span>
          <span className="text-xs text-neutral-500">
            JPG, PNG o WEBP · arrástralas para reordenar
          </span>
        </button>
        <input
          ref={addInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          aria-label="Subir imágenes para la galería"
          onChange={onAdd}
        />
      </section>
    )
  }

  // Construimos los items del carrusel: imágenes existentes + tile "+" (si hay espacio)
  const items = [
    ...images.map((src, idx) => (
      <div
        key={`${src}-${idx}`}
        className="group/img relative block aspect-video h-full w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm"
      >
        <Image
          src={src}
          alt={`${seller.businessName} — foto ${idx + 1}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          unoptimized={src.startsWith('blob:')}
        />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-neutral-900/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
          #{idx + 1}
        </span>
        {enabled && (
          <div
            className={cn(
              'absolute right-2 top-2 flex gap-1 transition-all duration-200 ease-out',
              // Mobile: visible por defecto. Desktop: fade+scale al hover/focus.
              'opacity-100 sm:scale-95 sm:opacity-0',
              'sm:group-hover/img:scale-100 sm:group-hover/img:opacity-100',
              'sm:group-focus-within/img:scale-100 sm:group-focus-within/img:opacity-100',
            )}
          >
            <button
              type="button"
              onClick={() => {
                setReplacingIdx(idx)
                replaceInputRef.current?.click()
              }}
              disabled={busy}
              aria-label={`Reemplazar imagen ${idx + 1}`}
              className={OVERLAY_BTN}
            >
              <Pencil size={14} strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPendingRemove(src)}
              disabled={busy}
              aria-label={`Eliminar imagen ${idx + 1}`}
              className={cn(OVERLAY_BTN, 'text-[#D32F2F]')}
            >
              <Trash2 size={14} strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        )}
      </div>
    )),
    ...(enabled && remaining > 0
      ? [
          <button
            key="add-tile"
            type="button"
            onClick={() => addInputRef.current?.click()}
            disabled={busy}
            className="group/add flex aspect-video h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-200 bg-white text-center transition-colors hover:border-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:opacity-60"
          >
            <ImagePlus
              size={22}
              strokeWidth={1.5}
              className="text-neutral-500 transition-colors group-hover/add:text-primary-500"
              aria-hidden
            />
            <span className="text-xs font-medium text-neutral-900">
              Añadir imagen
            </span>
            <span className="text-[11px] text-neutral-500">
              {remaining} disponible{remaining === 1 ? '' : 's'}
            </span>
          </button>,
        ]
      : []),
  ]

  return (
    <section
      aria-labelledby="gallery-inline-heading"
      className="flex flex-col gap-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="gallery-inline-heading"
          className="font-serif text-2xl font-semibold text-neutral-900"
        >
          Galería del negocio
        </h2>
        {enabled && (
          <span className="text-xs font-medium text-neutral-500 tabular-nums">
            {images.length} / {galleryMax}
          </span>
        )}
      </div>

      <CardCarousel ariaLabel={`Galería de ${seller.businessName}`}>
        {items}
      </CardCarousel>

      <input
        ref={addInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        aria-label="Subir imágenes para la galería"
        onChange={onAdd}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Reemplazar imagen"
        onChange={onReplaceFile}
      />

      <ConfirmDialog
        open={pendingRemove !== null}
        onClose={() => setPendingRemove(null)}
        onConfirm={onConfirmRemove}
        title="¿Eliminar esta imagen?"
        description="Se quitará de tu galería pública. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
      />
    </section>
  )
}
