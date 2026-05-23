'use client'

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  Camera,
  FileBadge,
  ImageIcon,
  MapPin,
  Pencil,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { cn, DEPARTMENTS } from '@/lib/utils'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateUserProfile } from '@/lib/api/users'

const NAME_MIN = 2
const DESC_MAX = 280
const NIT_RE = /^\d{6,15}$/

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }))

function getInitials(text: string) {
  const parts = text.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'MI'
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function SellerOnboardingForm() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [redirecting, setRedirecting] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [department, setDepartment] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [description, setDescription] = useState('')
  const [nit, setNit] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)

  const [nameError, setNameError] = useState<string | null>(null)
  const [deptError, setDeptError] = useState<string | null>(null)
  const [descError, setDescError] = useState<string | null>(null)
  const [nitError, setNitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<'save' | 'skip' | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoObjectUrlRef = useRef<string | null>(null)
  const bannerObjectUrlRef = useRef<string | null>(null)

  // Guard: sólo vendedores autenticados acceden. Sin sesión o como comprador → fuera.
  const wrongRole = user !== null && user.role !== 'seller'
  if (wrongRole && !redirecting) setRedirecting(true)
  useEffect(() => {
    if (wrongRole) router.replace('/')
  }, [wrongRole, router])

  // Hidratar campos del vendedor (patrón "state from prop").
  const [hydratedFromSellerId, setHydratedFromSellerId] = useState<string | null>(null)
  if (user && user.role === 'seller' && user.id !== hydratedFromSellerId) {
    setHydratedFromSellerId(user.id)
    setBusinessName((prev) => prev || user.businessName)
    setDepartment((prev) => prev || user.department || '')
    setMunicipality((prev) => prev || user.municipality || '')
    setDescription((prev) => prev || user.description || '')
    setNit((prev) => prev || user.nit || '')
    setLogoUrl((prev) => prev ?? user.logo ?? null)
    setBannerUrl((prev) => prev ?? user.banner ?? null)
  }

  useEffect(() => {
    return () => {
      if (logoObjectUrlRef.current) URL.revokeObjectURL(logoObjectUrlRef.current)
      if (bannerObjectUrlRef.current)
        URL.revokeObjectURL(bannerObjectUrlRef.current)
    }
  }, [])

  function validateName(value: string): string | null {
    const v = value.trim()
    if (!v) return 'Ingresa el nombre de tu negocio'
    if (v.length < NAME_MIN) return 'Debe tener al menos 2 caracteres'
    return null
  }

  function validateDept(value: string): string | null {
    if (!value) return 'Selecciona el departamento de tu negocio'
    return null
  }

  function validateDesc(value: string): string | null {
    if (value.length > DESC_MAX) return `Máximo ${DESC_MAX} caracteres`
    return null
  }

  function validateNit(value: string): string | null {
    const v = value.trim()
    if (!v) return null // opcional
    if (!NIT_RE.test(v)) return 'El NIT debe tener entre 6 y 15 dígitos'
    return null
  }

  function pickImage(
    e: ChangeEvent<HTMLInputElement>,
    objectUrlRef: { current: string | null },
    setUrl: (url: string) => void,
    input: HTMLInputElement | null
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setUrl(url)
    if (input) input.value = ''
  }

  function clearLogo() {
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current)
      logoObjectUrlRef.current = null
    }
    setLogoUrl(null)
  }

  function clearBanner() {
    if (bannerObjectUrlRef.current) {
      URL.revokeObjectURL(bannerObjectUrlRef.current)
      bannerObjectUrlRef.current = null
    }
    setBannerUrl(null)
  }

  async function persist(patch: {
    businessName?: string
    description?: string
    department?: string
    municipality?: string
    nit?: string
    logo?: string
    banner?: string
  }) {
    if (!user) return
    await updateUserProfile(user.id, patch)
    refreshUser()
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user || user.role !== 'seller') return

    const nErr = validateName(businessName)
    const dErr = validateDept(department)
    const descErr = validateDesc(description)
    const nitErr = validateNit(nit)
    setNameError(nErr)
    setDeptError(dErr)
    setDescError(descErr)
    setNitError(nitErr)
    if (nErr || dErr || descErr || nitErr) return

    setSubmitting('save')
    try {
      await persist({
        businessName: businessName.trim(),
        department,
        municipality: municipality.trim() || undefined,
        description: description.trim() || undefined,
        nit: nit.trim() || undefined,
        logo: logoUrl ?? undefined,
        banner: bannerUrl ?? undefined,
      })
      showSuccess(
        '¡Tu tienda está lista!',
        'Crea tu primera publicación cuando quieras desde Mi Tienda.'
      )
      router.push('/mi-tienda')
    } catch {
      showError(
        'No pudimos guardar los datos',
        'Inténtalo nuevamente en unos segundos'
      )
      setSubmitting(null)
    }
  }

  async function onSkip() {
    if (!user || user.role !== 'seller' || submitting) return
    setSubmitting('skip')
    try {
      const trimmed = businessName.trim()
      if (
        trimmed &&
        trimmed !== user.businessName &&
        !validateName(trimmed)
      ) {
        await persist({ businessName: trimmed })
      }
      router.push('/mi-tienda')
    } catch {
      router.push('/mi-tienda')
    }
  }

  if (user === null || redirecting) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-6 py-16 shadow-sm"
        aria-busy="true"
      >
        <Spinner size="md" />
        <p className="text-sm text-neutral-500">Cargando tu tienda…</p>
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
          Configura tu tienda
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Los compradores verán esto en tu perfil público y en cada publicación.
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
        aria-labelledby="onboarding-seller-heading"
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      >
        <h2 id="onboarding-seller-heading" className="sr-only">
          Datos del negocio
        </h2>

        <BrandPreview
          bannerUrl={bannerUrl}
          logoUrl={logoUrl}
          businessName={businessName}
          onPickBanner={() => bannerInputRef.current?.click()}
          onClearBanner={clearBanner}
          onPickLogo={() => logoInputRef.current?.click()}
          onClearLogo={clearLogo}
          disabled={disableAll}
        />

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) =>
            pickImage(e, bannerObjectUrlRef, setBannerUrl, bannerInputRef.current)
          }
          aria-label="Subir imagen de portada"
        />
        <input
          ref={logoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) =>
            pickImage(e, logoObjectUrlRef, setLogoUrl, logoInputRef.current)
          }
          aria-label="Subir logo del negocio"
        />

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-6 p-6 pt-16 sm:p-8 sm:pt-20"
        >
          <fieldset className="flex flex-col gap-5" disabled={disableAll}>
            <legend className="sr-only">Datos del negocio</legend>

            <FormField
              label="Nombre comercial"
              required
              error={nameError ?? undefined}
            >
              <Input
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value)
                  if (nameError) setNameError(null)
                }}
                onBlur={() => setNameError(validateName(businessName))}
                autoComplete="organization"
                placeholder="Tostadora Yungas"
                leadingIcon={<Building2 size={18} strokeWidth={1.5} />}
                aria-required="true"
              />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Departamento"
                required
                error={deptError ?? undefined}
              >
                <Select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value)
                    if (deptError) setDeptError(null)
                  }}
                  onBlur={() => setDeptError(validateDept(department))}
                  options={DEPARTMENT_OPTIONS}
                  placeholder="Selecciona"
                  leadingIcon={<MapPin size={18} strokeWidth={1.5} />}
                  aria-required="true"
                />
              </FormField>

              <FormField label="Municipio" optional>
                <Input
                  type="text"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  autoComplete="address-level2"
                  placeholder="Caranavi"
                />
              </FormField>
            </div>

            <FormField
              label="Descripción del negocio"
              optional
              error={descError ?? undefined}
              helper={
                !descError
                  ? `Lo primero que verán los compradores en tu perfil. ${descRemaining} caracteres restantes.`
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
                placeholder="Ej. Tostamos microlotes de café boliviano con perfiles artesanales. Especialistas en Nor Yungas y Caranavi."
                rows={4}
              />
            </FormField>

            <FormField
              label="NIT"
              optional
              error={nitError ?? undefined}
              helper={
                !nitError
                  ? 'Solo si emites facturas. Lo podrás agregar después.'
                  : undefined
              }
            >
              <Input
                type="text"
                value={nit}
                onChange={(e) => {
                  setNit(e.target.value)
                  if (nitError) setNitError(null)
                }}
                onBlur={() => setNitError(validateNit(nit))}
                inputMode="numeric"
                autoComplete="off"
                placeholder="1234567890"
                leadingIcon={<FileBadge size={18} strokeWidth={1.5} />}
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
              Guardar y abrir mi tienda
            </Button>
          </div>
        </form>
      </section>

      <p className="text-center text-xs leading-relaxed text-neutral-500">
        Podrás actualizar estos datos cuando quieras desde{' '}
        <Link
          href="/mi-tienda/ajustes"
          className="font-medium text-primary-500 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
        >
          ajustes de tienda
        </Link>
        .
      </p>
    </div>
  )
}

interface BrandPreviewProps {
  bannerUrl: string | null
  logoUrl: string | null
  businessName: string
  onPickBanner: () => void
  onClearBanner: () => void
  onPickLogo: () => void
  onClearLogo: () => void
  disabled: boolean
}

function BrandPreview({
  bannerUrl,
  logoUrl,
  businessName,
  onPickBanner,
  onClearBanner,
  onPickLogo,
  onClearLogo,
  disabled,
}: BrandPreviewProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden bg-neutral-100',
          !bannerUrl &&
            'border-b border-dashed border-neutral-200 bg-[linear-gradient(135deg,#FAFAFA_25%,transparent_25%,transparent_50%,#FAFAFA_50%,#FAFAFA_75%,transparent_75%,transparent)] bg-[length:14px_14px]'
        )}
      >
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt="Portada de tu tienda"
            fill
            sizes="448px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <ImageIcon
              size={28}
              strokeWidth={1.5}
              className="text-neutral-300"
              aria-hidden
            />
            <p className="text-xs font-medium text-neutral-500">
              Imagen de portada (16:9)
            </p>
            <p className="text-xs text-neutral-400">Opcional · recomendado 1200×675</p>
          </div>
        )}

        <BannerControl
          hasBanner={Boolean(bannerUrl)}
          onPick={onPickBanner}
          onClear={onClearBanner}
          disabled={disabled}
        />
      </div>

      <div className="absolute -bottom-12 left-6 sm:left-8">
        <div className="relative">
          <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-neutral-100 text-base font-semibold text-neutral-500 shadow-sm">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`Logo de ${businessName || 'tu negocio'}`}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <span aria-hidden>{getInitials(businessName)}</span>
            )}
          </span>

          <button
            type="button"
            onClick={onPickLogo}
            aria-label={logoUrl ? 'Cambiar logo' : 'Subir logo'}
            className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:border-primary-500 hover:text-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            {logoUrl ? (
              <Pencil size={14} strokeWidth={1.5} aria-hidden />
            ) : (
              <Camera size={14} strokeWidth={1.5} aria-hidden />
            )}
          </button>
          {logoUrl && (
            <button
              type="button"
              onClick={onClearLogo}
              aria-label="Quitar logo"
              className="absolute -top-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
            >
              <X size={12} strokeWidth={1.5} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function BannerControl({
  hasBanner,
  onPick,
  onClear,
  disabled,
}: {
  hasBanner: boolean
  onPick: () => void
  onClear: () => void
  disabled: boolean
}): ReactNode {
  return (
    <div className="absolute right-3 top-3 flex gap-1.5">
      <button
        type="button"
        onClick={onPick}
        aria-label={hasBanner ? 'Cambiar portada' : 'Subir portada'}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white/95 px-2.5 py-1.5 text-[13px] font-medium text-neutral-900 shadow-sm transition-colors hover:border-primary-500 hover:text-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
      >
        {hasBanner ? (
          <Pencil size={14} strokeWidth={1.5} aria-hidden />
        ) : (
          <Camera size={14} strokeWidth={1.5} aria-hidden />
        )}
        <span className="hidden sm:inline">
          {hasBanner ? 'Cambiar portada' : 'Subir portada'}
        </span>
      </button>
      {hasBanner && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Quitar portada"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white/95 text-neutral-500 shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
        >
          <X size={14} strokeWidth={1.5} aria-hidden />
        </button>
      )}
    </div>
  )
}
