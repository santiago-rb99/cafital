'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Camera, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { FormField } from '@/components/ui/FormField'
import { Textarea } from '@/components/ui/Textarea'

import { Seller } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateHero } from '@/lib/api/advertising'

const HERO_COPY_MAX = 140

interface HeroInlineEditorProps {
  seller: Seller
  open: boolean
  onClose: () => void
}

export function HeroInlineEditor({ seller, open, onClose }: HeroInlineEditorProps) {
  const { refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [heroImage, setHeroImage] = useState<string | undefined>(seller.heroImage)
  const [heroCopy, setHeroCopy] = useState(seller.heroCopy ?? '')
  const [submitting, setSubmitting] = useState(false)

  const [trackedKey, setTrackedKey] = useState<string | null>(null)
  const key = open ? `${seller.id}:open` : `${seller.id}:closed`
  if (key !== trackedKey) {
    setTrackedKey(key)
    if (open) {
      setHeroImage(seller.heroImage)
      setHeroCopy(seller.heroCopy ?? '')
    }
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
    e.target.value = ''
  }

  async function onSave() {
    setSubmitting(true)
    try {
      await updateHero(seller.id, {
        heroImage,
        heroCopy: heroCopy.trim() || undefined,
      })
      refreshUser()
      showSuccess('Hero actualizado')
      onClose()
    } catch (e) {
      showError('No pudimos guardar', e instanceof Error ? e.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  const remaining = HERO_COPY_MAX - heroCopy.length
  const previewImage =
    heroImage ?? seller.banner ?? '/images/eventos/expo-cafe-hero.jpg'

  return (
    <Drawer
      open={open}
      onClose={submitting ? () => undefined : onClose}
      title="Hero promocional"
      description="Define la imagen y el copy que rotan en el hero del marketplace."
      size="md"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-neutral-900">
            Imagen del hero
          </span>
          <div
            className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
            style={{
              backgroundImage: `url(${previewImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-neutral-900/70 via-neutral-900/20 to-transparent" />
            <div className="absolute right-2 top-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={submitting}
                aria-label={heroImage ? 'Cambiar imagen del hero' : 'Subir imagen del hero'}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white/95 px-2.5 py-1.5 text-[13px] font-medium text-neutral-900 shadow-xs transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {heroImage ? (
                  <Pencil size={14} strokeWidth={1.5} aria-hidden />
                ) : (
                  <Camera size={14} strokeWidth={1.5} aria-hidden />
                )}
                {heroImage ? 'Cambiar' : 'Subir'}
              </button>
            </div>
            <p className="absolute inset-x-0 bottom-0 line-clamp-2 p-3 font-serif text-sm font-semibold text-white sm:text-base">
              {heroCopy.trim() ||
                seller.description ||
                `Conoce a ${seller.businessName} en Cafital.`}
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            Recomendado 1400×900 · proporción 16:10
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Subir imagen del hero"
          onChange={onPickImage}
        />

        <FormField
          label="Copy promocional"
          helper="Máximo 140 caracteres. Si lo dejas vacío, usaremos tu descripción."
        >
          <Textarea
            value={heroCopy}
            onChange={(e) => setHeroCopy(e.target.value.slice(0, HERO_COPY_MAX))}
            rows={3}
            maxLength={HERO_COPY_MAX}
            placeholder="Microlotes tostados a mano en Coroico. Perfiles únicos de Nor Yungas."
          />
        </FormField>
        <p
          className={
            remaining <= 10
              ? 'text-xs font-medium text-[#8C5A08]'
              : 'text-xs text-neutral-500'
          }
          aria-live="polite"
        >
          {remaining} caracteres restantes
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="button" size="md" onClick={onSave} loading={submitting}>
          Guardar cambios
        </Button>
      </div>
    </Drawer>
  )
}
