'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { BadgeCheck, ImagePlus, Info, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/ui/FormField'
import { Seller } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateHero } from '@/lib/api/advertising'

const HERO_COPY_MAX = 140

interface HeroAdvertisingCardProps {
  seller: Seller
}

export function HeroAdvertisingCard({ seller }: HeroAdvertisingCardProps) {
  const { refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [heroImage, setHeroImage] = useState<string | undefined>(seller.heroImage)
  const [heroCopy, setHeroCopy] = useState<string>(seller.heroCopy ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)

  if (seller.id !== trackedId) {
    setTrackedId(seller.id)
    setHeroImage(seller.heroImage)
    setHeroCopy(seller.heroCopy ?? '')
    setDirty(false)
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const createdUrls = useRef<string[]>([])

  useEffect(() => {
    const urls = createdUrls.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [])

  function onPickImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    createdUrls.current.push(url)
    setHeroImage(url)
    setDirty(true)
    if (inputRef.current) inputRef.current.value = ''
  }

  function onChangeCopy(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value.slice(0, HERO_COPY_MAX)
    setHeroCopy(value)
    setDirty(true)
  }

  async function onSave() {
    setSubmitting(true)
    try {
      await updateHero(seller.id, {
        heroImage,
        heroCopy: heroCopy.trim() || undefined,
      })
      refreshUser()
      setDirty(false)
      showSuccess('Hero actualizado', 'Tu publicidad ya está lista para rotar.')
    } catch (e) {
      showError('No pudimos guardar', e instanceof Error ? e.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  const remaining = HERO_COPY_MAX - heroCopy.length
  const previewImage =
    heroImage ?? seller.banner ?? '/images/eventos/expo-cafe-hero.jpg'
  const previewCopy = heroCopy.trim() || seller.description || `Conoce a ${seller.businessName} en Cafital.`

  return (
    <section
      aria-labelledby="hero-ad-heading"
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <header className="flex flex-col gap-2 border-b border-neutral-200 px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
            <Sparkles size={14} strokeWidth={1.5} aria-hidden />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">
            Hero promocional
          </span>
        </div>
        <h2
          id="hero-ad-heading"
          className="font-serif text-lg font-semibold text-neutral-900"
        >
          Tu slide en el hero
        </h2>
        <p className="text-sm text-neutral-500">
          Se mostrará en Home, Catálogo y Vendedores cuando seas elegido en el rotador.
        </p>
      </header>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Preview */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Vista previa
          </span>
          <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            <div className="relative aspect-video w-full">
              <Image
                src={previewImage}
                alt="Vista previa del hero"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                unoptimized={previewImage.startsWith('blob:')}
              />
              <div className="absolute inset-0 bg-linear-to-t from-neutral-900/75 via-neutral-900/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                    <BadgeCheck size={12} strokeWidth={1.5} aria-hidden />
                    {seller.businessName}
                  </span>
                </div>
                <p className="line-clamp-3 font-serif text-base font-semibold leading-snug text-white sm:text-lg">
                  {previewCopy}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-5">
          <FormField label="Imagen del hero" htmlFor="hero-image-input">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-white px-6 py-6 text-center transition-colors hover:border-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              <ImagePlus
                size={24}
                strokeWidth={1.5}
                className="text-neutral-500"
                aria-hidden
              />
              <span className="text-sm font-medium text-neutral-900">
                {heroImage ? 'Reemplazar imagen' : 'Subir imagen'}
              </span>
              <span className="text-xs text-neutral-500">
                Recomendado 1400×900 · proporción 16:10
              </span>
            </button>
            <input
              ref={inputRef}
              id="hero-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onPickImage}
              aria-label="Subir imagen del hero"
            />
          </FormField>

          <FormField
            label="Copy promocional"
            htmlFor="hero-copy-input"
            helper="Máximo 140 caracteres. Recomendado: 1–2 frases con tu propuesta de valor."
          >
            <Textarea
              id="hero-copy-input"
              value={heroCopy}
              onChange={onChangeCopy}
              rows={3}
              maxLength={HERO_COPY_MAX}
              placeholder="Microlotes tostados a mano en Coroico. Perfiles únicos de Nor Yungas y Caranavi."
            />
            <p
              className={
                remaining <= 10
                  ? 'mt-1 text-xs font-medium text-[#8C5A08]'
                  : 'mt-1 text-xs text-neutral-500'
              }
              aria-live="polite"
            >
              {remaining} caracteres restantes
            </p>
          </FormField>

          <div className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2.5">
            <Info
              size={14}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-primary-500"
              aria-hidden
            />
            <p className="text-xs leading-relaxed text-primary-700">
              Si no defines copy propio, mostraremos tu descripción de negocio.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              size="md"
              onClick={onSave}
              disabled={!dirty || submitting}
              loading={submitting}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
