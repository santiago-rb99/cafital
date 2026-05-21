'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Camera,
  MapPin,
  Pencil,
  User as UserIcon,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { DEPARTMENTS } from '@/lib/utils'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateUserProfile } from '@/lib/api/users'

const NAME_MIN = 2
const DESC_MAX = 280

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }))

function getInitials(text: string) {
  const parts = text.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'TÚ'
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function BuyerOnboardingForm() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [redirecting, setRedirecting] = useState(false)
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [nameError, setNameError] = useState<string | null>(null)
  const [descError, setDescError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<'save' | 'skip' | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Guard: sólo compradores autenticados acceden. Sin sesión o como vendedor → fuera.
  useEffect(() => {
    if (user === null) return
    if (user.role !== 'buyer') {
      setRedirecting(true)
      router.replace('/')
      return
    }
    const buyer = user
    setName((prev) => prev || buyer.name)
    setDepartment((prev) => prev || buyer.department || '')
    setDescription((prev) => prev || buyer.description || '')
    setAvatarUrl((prev) => prev ?? buyer.avatar ?? null)
  }, [user, router])

  // Limpia ObjectURL al desmontar.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  function validateName(value: string): string | null {
    const v = value.trim()
    if (!v) return 'Ingresa tu nombre'
    if (v.length < NAME_MIN) return 'Debe tener al menos 2 caracteres'
    return null
  }

  function validateDesc(value: string): string | null {
    if (value.length > DESC_MAX) return `Máximo ${DESC_MAX} caracteres`
    return null
  }

  function onPickAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setAvatarUrl(url)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function clearAvatar() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setAvatarUrl(null)
  }

  async function persist(patch: {
    name?: string
    description?: string
    department?: string
    avatar?: string
  }) {
    if (!user) return
    await updateUserProfile(user.id, patch)
    refreshUser()
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    const nErr = validateName(name)
    const dErr = validateDesc(description)
    setNameError(nErr)
    setDescError(dErr)
    if (nErr || dErr) return

    setSubmitting('save')
    try {
      await persist({
        name: name.trim(),
        description: description.trim() || undefined,
        department: department || undefined,
        avatar: avatarUrl ?? undefined,
      })
      showSuccess(
        '¡Perfil listo!',
        'Tu cuenta está completa. Ya puedes explorar el catálogo.'
      )
      router.push('/')
    } catch {
      showError(
        'No pudimos guardar tu perfil',
        'Inténtalo nuevamente en unos segundos'
      )
      setSubmitting(null)
    }
  }

  async function onSkip() {
    if (!user || user.role !== 'buyer' || submitting) return
    setSubmitting('skip')
    try {
      // Si el nombre cambió respecto al registro, igual lo guardamos
      // para no perder ediciones casuales antes de saltar.
      const trimmed = name.trim()
      if (trimmed && trimmed !== user.name && !validateName(trimmed)) {
        await persist({ name: trimmed })
      }
      router.push('/')
    } catch {
      // Aunque falle el save silencioso, dejamos pasar.
      router.push('/')
    }
  }

  if (user === null || redirecting) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-6 py-16 shadow-sm"
        aria-busy="true"
      >
        <Spinner size="md" />
        <p className="text-sm text-neutral-500">Cargando tu perfil…</p>
      </div>
    )
  }

  const descRemaining = DESC_MAX - description.length
  const isSaving = submitting === 'save'
  const isSkipping = submitting === 'skip'
  const disableAll = submitting !== null

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-serif text-3xl font-bold leading-tight text-neutral-900">
          Bienvenido a Cafital
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Completa tu perfil para que los vendedores te reconozcan y para
          personalizar tu experiencia.
        </p>

        <div
          className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500"
          aria-live="polite"
        >
          <span>Último paso</span>
          <span className="flex gap-1" aria-hidden>
            <span className="h-1 w-8 rounded-full bg-primary-300" />
            <span className="h-1 w-8 rounded-full bg-primary-300" />
            <span className="h-1 w-8 rounded-full bg-primary-300" />
          </span>
        </div>
      </header>

      <section
        aria-labelledby="onboarding-buyer-heading"
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 id="onboarding-buyer-heading" className="sr-only">
          Completa tu perfil de comprador
        </h2>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-5" disabled={disableAll}>
            <legend className="sr-only">Datos del comprador</legend>

            <div className="flex flex-col items-center gap-3">
              <span id="avatar-label" className="sr-only">
                Foto de perfil
              </span>
              <div className="relative">
                <span
                  className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-lg font-semibold text-neutral-500"
                  aria-hidden={avatarUrl ? undefined : true}
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Vista previa de tu foto de perfil"
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span aria-hidden>{getInitials(name)}</span>
                  )}
                </span>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    aria-label="Quitar foto de perfil"
                    className="absolute -right-1 -top-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disableAll}
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-describedby="avatar-helper"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disableAll}
              >
                {avatarUrl ? (
                  <Pencil size={14} strokeWidth={1.5} aria-hidden />
                ) : (
                  <Camera size={14} strokeWidth={1.5} aria-hidden />
                )}
                {avatarUrl ? 'Cambiar foto' : 'Subir foto'}
              </button>
              <p id="avatar-helper" className="text-xs text-neutral-500">
                Opcional. JPG o PNG, máximo 5 MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={onPickAvatar}
                aria-labelledby="avatar-label"
              />
            </div>

            <FormField
              label="Nombre completo"
              required
              error={nameError ?? undefined}
            >
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) setNameError(null)
                }}
                onBlur={() => setNameError(validateName(name))}
                autoComplete="name"
                placeholder="Juan Pérez"
                leadingIcon={<UserIcon size={18} strokeWidth={1.5} />}
                aria-required="true"
              />
            </FormField>

            <FormField
              label="Departamento"
              optional
              helper="Nos ayuda a destacarte vendedores y eventos cerca de ti."
            >
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={DEPARTMENT_OPTIONS}
                placeholder="Selecciona tu departamento"
                leadingIcon={<MapPin size={18} strokeWidth={1.5} />}
              />
            </FormField>

            <FormField
              label="Sobre ti o tu negocio"
              optional
              error={descError ?? undefined}
              helper={
                !descError
                  ? `Cuéntale a los vendedores qué buscas. ${descRemaining} caracteres restantes.`
                  : undefined
              }
            >
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (descError) setDescError(null)
                }}
                onBlur={() => setDescError(validateDesc(description))}
                maxLength={DESC_MAX + 20}
                placeholder="Ej. Responsable de compras en Cafetería El Molino, busco proveedores de café verde y tostado boliviano."
                rows={4}
              />
            </FormField>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={isSaving}
              loading={isSkipping}
            >
              Saltar por ahora
            </Button>

            <Button
              type="submit"
              size="lg"
              loading={isSaving}
              disabled={isSkipping}
              trailingIcon={
                !isSaving ? (
                  <ArrowRight size={18} strokeWidth={1.5} />
                ) : undefined
              }
            >
              Guardar y empezar
            </Button>
          </div>
        </form>
      </section>

      <p className="text-center text-xs leading-relaxed text-neutral-500">
        Podrás actualizar estos datos cuando quieras desde{' '}
        <Link
          href="/perfil"
          className="font-medium text-primary-500 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
        >
          tu perfil
        </Link>
        .
      </p>
    </div>
  )
}
