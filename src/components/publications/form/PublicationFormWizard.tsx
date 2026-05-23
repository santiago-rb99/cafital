'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  createPublication,
  updatePublication,
} from '@/lib/api/publications'
import {
  Publication,
  PublicationCategory,
  Seller,
} from '@/types'
import { cn } from '@/lib/utils'

import {
  EMPTY_FORM,
  PublicationFormData,
  publicationToFormData,
  PublishMode,
  StepId,
  STEPS,
  toProductUnits,
} from './types'
import { canReachStep, StepErrors, validateStep } from './validation'
import { Stepper } from './Stepper'
import { Step1Category } from './steps/Step1Category'
import { Step2Subcategory } from './steps/Step2Subcategory'
import { Step3Base } from './steps/Step3Base'
import { Step4Attributes } from './steps/Step4Attributes'
import { Step5Pricing } from './steps/Step5Pricing'
import { Step6Preview } from './steps/Step6Preview'
import { Step7Publish } from './steps/Step7Publish'

interface Props {
  initial?: Publication // si se está editando una publicación existente
}

const DRAFT_PREFIX = 'cafital_pub_draft_'

export function PublicationFormWizard({ initial }: Props) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const seller = (user?.role === 'seller' ? (user as Seller) : null) ?? null
  const isEditing = Boolean(initial)
  const draftKey = useMemo(() => {
    if (!seller) return null
    return initial
      ? `${DRAFT_PREFIX}edit_${initial.id}`
      : `${DRAFT_PREFIX}new_${seller.id}`
  }, [seller, initial])

  const [data, setData] = useState<PublicationFormData>(() => {
    if (initial) return publicationToFormData(initial)
    // Hidratar desde localStorage en el primer render del cliente.
    if (typeof window !== 'undefined' && user?.role === 'seller') {
      try {
        const key = `${DRAFT_PREFIX}new_${user.id}`
        const raw = window.localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw) as PublicationFormData
          return { ...EMPTY_FORM, ...parsed, photos: [] }
        }
      } catch {
        // ignorar; arrancamos con form vacío
      }
    }
    return EMPTY_FORM
  })
  const [step, setStep] = useState<StepId>(1)
  const [errors, setErrors] = useState<StepErrors>({})
  const [publishMode, setPublishMode] = useState<PublishMode>('active')
  const [submitting, setSubmitting] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  // Persistir cambios en localStorage (debounce-light: cada cambio)
  useEffect(() => {
    if (!draftKey) return
    if (typeof window === 'undefined') return
    try {
      // No persistimos las fotos con ObjectURL (no sobreviven al refresh).
      const { photos: _ignored, ...rest } = data
      void _ignored
      localStorage.setItem(draftKey, JSON.stringify(rest))
    } catch {
      // localStorage lleno; silenciar.
    }
  }, [data, draftKey])

  const onChange = useCallback((patch: Partial<PublicationFormData>) => {
    setData((prev) => ({ ...prev, ...patch }))
    setErrors({})
  }, [])

  const reachable = useCallback(
    (target: StepId) => canReachStep(target, data),
    [data]
  )

  function gotoStep(target: StepId) {
    if (target === step) return
    if (target > step) {
      // Validar todos los pasos intermedios
      for (let s = step; s < target; s = (s + 1) as StepId) {
        const e = validateStep(s, data)
        if (Object.keys(e).length > 0) {
          setErrors(e)
          setStep(s)
          return
        }
      }
    }
    setErrors({})
    setStep(target)
  }

  function onNext() {
    const e = validateStep(step, data)
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    setErrors({})
    setStep((s) => Math.min(7, s + 1) as StepId)
  }

  function onBack() {
    setErrors({})
    setStep((s) => Math.max(1, s - 1) as StepId)
  }

  async function onSubmit() {
    if (!seller || !data.category) return
    // Re-validar todos los pasos
    for (let s = 1 as StepId; s <= 5; s = (s + 1) as StepId) {
      const e = validateStep(s, data)
      if (Object.keys(e).length > 0) {
        setErrors(e)
        setStep(s)
        showError(
          'Faltan datos por completar',
          'Revisa los campos marcados en rojo.'
        )
        return
      }
    }

    setSubmitting(true)
    try {
      const photos = data.photos.map((p) => p.url)
      const units = toProductUnits(data.units)
      const isLand = data.category === 'D'
      const payload = {
        sellerId: seller.id,
        category: data.category as PublicationCategory,
        subcategory: data.subcategory,
        title: data.title.trim(),
        description: data.description.trim(),
        photos,
        video: data.video.trim() || undefined,
        variants: data.variants.trim() || undefined,
        priceMode: isLand ? ('quote' as const) : data.priceMode,
        units: data.priceMode === 'price' && !isLand ? units : undefined,
        coverage: isLand ? [] : data.coverage,
        inventory:
          !isLand && data.inventoryEnabled && typeof data.inventory === 'number'
            ? data.inventory
            : undefined,
        discount:
          !isLand && data.discountEnabled && typeof data.discount === 'number'
            ? data.discount
            : undefined,
        recurringAvailable:
          !isLand &&
          (data.category === 'A' || data.category === 'C') &&
          data.recurringEnabled,
        attributes: data.attributes,
        status: publishMode,
      }

      if (initial) {
        await updatePublication(initial.id, payload)
        showSuccess(
          publishMode === 'active'
            ? 'Publicación actualizada'
            : 'Cambios guardados como borrador'
        )
      } else {
        await createPublication(payload)
        showSuccess(
          publishMode === 'active'
            ? '¡Publicación creada!'
            : 'Borrador guardado'
        )
      }

      if (draftKey && typeof window !== 'undefined') {
        try {
          localStorage.removeItem(draftKey)
        } catch {
          // ignore
        }
      }
      router.push('/mi-tienda/publicaciones')
    } catch {
      showError('No pudimos guardar la publicación')
      setSubmitting(false)
    }
  }

  function discardDraft() {
    if (draftKey && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(draftKey)
      } catch {
        // ignore
      }
    }
    setData(initial ? publicationToFormData(initial) : EMPTY_FORM)
    setStep(1)
    setErrors({})
    setConfirmDiscard(false)
    showSuccess('Borrador descartado')
  }

  if (!seller) return null

  const currentMeta = STEPS.find((s) => s.id === step)!

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            {isEditing ? 'Editar publicación' : 'Nueva publicación'}
          </h1>
          <p className="text-sm text-neutral-500">
            Paso {step} de {STEPS.length} · {currentMeta.title}
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setConfirmDiscard(true)}
            className="inline-flex h-10 w-fit items-center gap-2 self-start rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-500 transition-colors hover:border-[#D32F2F] hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:self-auto"
          >
            Descartar borrador
          </button>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-[240px_1fr] md:gap-8">
        <Stepper current={step} onJump={gotoStep} reachable={reachable} />

        <div className="flex flex-col gap-6">
          <section
            aria-live="polite"
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
          >
            {step === 1 && (
              <Step1Category data={data} onChange={onChange} errors={errors} />
            )}
            {step === 2 && (
              <Step2Subcategory data={data} onChange={onChange} errors={errors} />
            )}
            {step === 3 && (
              <Step3Base data={data} onChange={onChange} errors={errors} />
            )}
            {step === 4 && (
              <Step4Attributes data={data} onChange={onChange} errors={errors} />
            )}
            {step === 5 && (
              <Step5Pricing data={data} onChange={onChange} errors={errors} />
            )}
            {step === 6 && <Step6Preview data={data} seller={seller} />}
            {step === 7 && (
              <Step7Publish
                data={data}
                mode={publishMode}
                onModeChange={setPublishMode}
                isEditing={isEditing}
              />
            )}
          </section>

          {/* Navegación */}
          <div
            className={cn(
              'sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-neutral-200 bg-neutral-100 px-4 py-4 sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:bg-white sm:px-5 sm:shadow-sm',
              'md:static md:mx-0'
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onBack}
              disabled={step === 1 || submitting}
              leadingIcon={<ArrowLeft size={16} strokeWidth={1.5} />}
            >
              Atrás
            </Button>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              {step < 7 ? (
                <Button
                  type="button"
                  size="md"
                  onClick={onNext}
                  disabled={submitting}
                  trailingIcon={<ArrowRight size={16} strokeWidth={1.5} />}
                >
                  Continuar
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setPublishMode('draft')
                      void onSubmit()
                    }}
                    disabled={submitting}
                    loading={submitting && publishMode === 'draft'}
                  >
                    Guardar borrador
                  </Button>
                  <Button
                    type="button"
                    size="md"
                    onClick={() => {
                      setPublishMode('active')
                      void onSubmit()
                    }}
                    disabled={submitting}
                    loading={submitting && publishMode === 'active'}
                    leadingIcon={
                      submitting ? (
                        <Loader2
                          size={16}
                          strokeWidth={1.5}
                          className="animate-spin"
                        />
                      ) : undefined
                    }
                  >
                    {isEditing ? 'Guardar y publicar' : 'Publicar ahora'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={discardDraft}
        title="¿Descartar este borrador?"
        description="Perderás todo lo completado hasta ahora. Esta acción no se puede deshacer."
        confirmLabel="Sí, descartar"
        cancelLabel="Volver"
        variant="destructive"
      />
    </div>
  )
}
