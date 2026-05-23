'use client'

import { useState } from 'react'
import { Compass, History, Sparkles, Target } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Textarea } from '@/components/ui/Textarea'

import { Seller } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateUserProfile } from '@/lib/api/users'

interface AboutEditorProps {
  seller: Seller
}

const FIELD_MAX = 400

const FIELDS: Array<{
  key: keyof NonNullable<Seller['about']>
  label: string
  helper: string
  Icon: typeof Target
}> = [
  {
    key: 'mission',
    label: 'Misión',
    helper: 'Qué hace tu negocio y para quién.',
    Icon: Target,
  },
  {
    key: 'vision',
    label: 'Visión',
    helper: 'A dónde quieres llegar como negocio.',
    Icon: Compass,
  },
  {
    key: 'history',
    label: 'Historia',
    helper: 'Cómo y cuándo empezó tu negocio.',
    Icon: History,
  },
]

export function AboutEditor({ seller }: AboutEditorProps) {
  const { refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [mission, setMission] = useState('')
  const [vision, setVision] = useState('')
  const [history, setHistory] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (seller.id !== trackedId) {
    setTrackedId(seller.id)
    setMission(seller.about?.mission ?? '')
    setVision(seller.about?.vision ?? '')
    setHistory(seller.about?.history ?? '')
  }

  const valuesByKey: Record<keyof NonNullable<Seller['about']>, string> = {
    mission,
    vision,
    history,
  }

  const settersByKey: Record<keyof NonNullable<Seller['about']>, (v: string) => void> = {
    mission: setMission,
    vision: setVision,
    history: setHistory,
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await updateUserProfile(seller.id, {
        about: {
          mission: mission.trim() || undefined,
          vision: vision.trim() || undefined,
          history: history.trim() || undefined,
        },
      } as Parameters<typeof updateUserProfile>[1])
      refreshUser()
      showSuccess('Bloque "Sobre nosotros" actualizado')
    } catch {
      showError('No pudimos guardar los cambios')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      aria-labelledby="about-editor-heading"
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <header className="mb-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Sparkles size={14} strokeWidth={1.5} aria-hidden />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">
            Plan Exportación
          </span>
        </div>
        <h2
          id="about-editor-heading"
          className="font-serif text-lg font-semibold text-neutral-900"
        >
          Sobre nosotros
        </h2>
        <p className="text-sm text-neutral-500">
          Estos bloques se muestran en tu perfil público para que los compradores
          conozcan tu propósito y trayectoria.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-5"
      >
        <fieldset
          className="grid grid-cols-1 gap-5 sm:grid-cols-3"
          disabled={submitting}
        >
          <legend className="sr-only">Bloques editables</legend>
          {FIELDS.map(({ key, label, helper, Icon }) => {
            const value = valuesByKey[key]
            const setValue = settersByKey[key]
            return (
              <FormField
                key={key}
                label={
                  <span className="inline-flex items-center gap-1.5">
                    <Icon size={14} strokeWidth={1.5} aria-hidden />
                    {label}
                  </span>
                }
                helper={`${value.length} / ${FIELD_MAX} · ${helper}`}
              >
                <Textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  maxLength={FIELD_MAX + 20}
                  rows={5}
                  placeholder={
                    key === 'mission'
                      ? 'Producimos café de especialidad…'
                      : key === 'vision'
                        ? 'Queremos ser el referente de…'
                        : 'Empezamos hace 10 años con…'
                  }
                />
              </FormField>
            )
          })}
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" size="md" loading={submitting}>
            Guardar Sobre nosotros
          </Button>
        </div>
      </form>
    </section>
  )
}
