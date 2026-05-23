'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Building2,
  Camera,
  FileBadge,
  MapPin,
  Mail,
  Pencil,
  User as UserIcon,
  X,
} from 'lucide-react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateUserProfile } from '@/lib/api/users'
import { DEPARTMENTS } from '@/lib/utils'

const DESC_MAX = 280
const NIT_RE = /^\d{6,15}$/

export default function PerfilPage() {
  const { user, refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  // Vendedor extra
  const [municipality, setMunicipality] = useState('')
  const [nit, setNit] = useState('')
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [submitting, setSubmitting] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const avatarObjectUrl = useRef<string | null>(null)
  const bannerObjectUrl = useRef<string | null>(null)
  const logoObjectUrl = useRef<string | null>(null)

  // Hidratar campos desde el usuario al cambiar (patrón "state from prop").
  const [hydratedFromUserId, setHydratedFromUserId] = useState<string | null>(null)
  if (user && user.id !== hydratedFromUserId) {
    setHydratedFromUserId(user.id)
    if (user.role === 'buyer') {
      setName(user.name)
      setAvatarUrl(user.avatar ?? null)
    } else {
      setName(user.businessName)
      setMunicipality(user.municipality ?? '')
      setNit(user.nit ?? '')
      setBannerUrl(user.banner ?? null)
      setLogoUrl(user.logo ?? null)
    }
    setDepartment(user.department ?? '')
    setDescription(user.description ?? '')
  }

  useEffect(() => {
    // Capturamos las refs como variables locales para satisfacer la regla
    // de exhaustive-deps; aún queremos revocar los URLs vigentes al unmount.
    const avatarRef = avatarObjectUrl
    const bannerRef = bannerObjectUrl
    const logoRef = logoObjectUrl
    return () => {
      if (avatarRef.current) URL.revokeObjectURL(avatarRef.current)
      if (bannerRef.current) URL.revokeObjectURL(bannerRef.current)
      if (logoRef.current) URL.revokeObjectURL(logoRef.current)
    }
  }, [])

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  const isSeller = user.role === 'seller'

  function pickImage(
    e: ChangeEvent<HTMLInputElement>,
    ref: { current: string | null },
    setUrl: (url: string) => void
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (ref.current) URL.revokeObjectURL(ref.current)
    const url = URL.createObjectURL(file)
    ref.current = url
    setUrl(url)
    e.target.value = ''
  }

  function clearImage(
    ref: { current: string | null },
    setUrl: (v: string | null) => void
  ) {
    if (ref.current) {
      URL.revokeObjectURL(ref.current)
      ref.current = null
    }
    setUrl(null)
  }

  function validate(): boolean {
    const next: Record<string, string | undefined> = {}
    if (!name.trim()) {
      next.name = isSeller
        ? 'Ingresa el nombre del negocio'
        : 'Ingresa tu nombre'
    }
    if (description.length > DESC_MAX)
      next.description = `Máximo ${DESC_MAX} caracteres`
    if (isSeller && nit.trim() && !NIT_RE.test(nit.trim()))
      next.nit = 'El NIT debe tener entre 6 y 15 dígitos'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return
    if (!validate()) return
    setSubmitting(true)
    try {
      // El tipo `User` es la unión Buyer | Seller, por lo que la intersección
      // de claves no contiene `name` ni `businessName`. Construimos el patch
      // como Record arbitrario y dejamos que la API lo aplique al usuario
      // correspondiente.
      const patch: Record<string, unknown> = {
        department: department || undefined,
        description: description.trim() || undefined,
      }
      if (user.role === 'seller') {
        patch.businessName = name.trim()
        patch.municipality = municipality.trim() || undefined
        patch.nit = nit.trim() || undefined
        patch.logo = logoUrl ?? undefined
        patch.banner = bannerUrl ?? undefined
      } else {
        patch.name = name.trim()
        patch.avatar = avatarUrl ?? undefined
      }
      // updateUserProfile espera Partial<Omit<User, 'id'|'role'|'createdAt'>>;
      // como User es unión, el shim a `Partial<Seller>` es seguro.
      await updateUserProfile(
        user.id,
        patch as Parameters<typeof updateUserProfile>[1]
      )
      refreshUser()
      showSuccess('Perfil actualizado')
    } catch {
      showError('No pudimos guardar los cambios')
    } finally {
      setSubmitting(false)
    }
  }

  const descRemaining = DESC_MAX - description.length

  return (
    <div className="bg-neutral-100">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs items={[{ label: 'Perfil' }]} className="mb-5" />

        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Mi perfil
          </h1>
          <p className="text-sm text-neutral-500">
            Actualiza tus datos personales y de contacto.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* AVATAR / LOGO + BANNER */}
          {isSeller ? (
            <SellerBranding
              bannerUrl={bannerUrl}
              logoUrl={logoUrl}
              businessName={name}
              onPickBanner={() => bannerInputRef.current?.click()}
              onClearBanner={() => clearImage(bannerObjectUrl, setBannerUrl)}
              onPickLogo={() => logoInputRef.current?.click()}
              onClearLogo={() => clearImage(logoObjectUrl, setLogoUrl)}
              disabled={submitting}
            />
          ) : (
            <BuyerAvatar
              avatarUrl={avatarUrl}
              name={name}
              onPick={() => avatarInputRef.current?.click()}
              onClear={() => clearImage(avatarObjectUrl, setAvatarUrl)}
              disabled={submitting}
            />
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Subir foto de perfil"
            onChange={(e) => pickImage(e, avatarObjectUrl, setAvatarUrl)}
          />
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Subir portada"
            onChange={(e) => pickImage(e, bannerObjectUrl, setBannerUrl)}
          />
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Subir logo"
            onChange={(e) => pickImage(e, logoObjectUrl, setLogoUrl)}
          />

          <fieldset className="grid grid-cols-1 gap-5 sm:grid-cols-2" disabled={submitting}>
            <legend className="sr-only">Datos del perfil</legend>

            <FormField
              label={isSeller ? 'Nombre comercial' : 'Nombre completo'}
              required
              error={errors.name}
              className="sm:col-span-2"
            >
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete={isSeller ? 'organization' : 'name'}
                leadingIcon={
                  isSeller ? (
                    <Building2 size={18} strokeWidth={1.5} />
                  ) : (
                    <UserIcon size={18} strokeWidth={1.5} />
                  )
                }
                aria-required="true"
              />
            </FormField>

            <FormField label="Correo" className="sm:col-span-2">
              <Input
                type="email"
                value={user.email}
                disabled
                leadingIcon={<Mail size={18} strokeWidth={1.5} />}
              />
            </FormField>

            <FormField label="Departamento" optional>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Selecciona"
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                leadingIcon={<MapPin size={18} strokeWidth={1.5} />}
              />
            </FormField>

            {isSeller && (
              <FormField label="Municipio" optional>
                <Input
                  type="text"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  autoComplete="address-level2"
                  placeholder="Caranavi"
                />
              </FormField>
            )}

            <FormField
              label={isSeller ? 'Descripción del negocio' : 'Sobre ti'}
              optional
              error={errors.description}
              helper={
                !errors.description
                  ? `${descRemaining} caracteres restantes.`
                  : undefined
              }
              className="sm:col-span-2"
            >
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={DESC_MAX + 20}
                rows={4}
              />
            </FormField>

            {isSeller && (
              <FormField
                label="NIT"
                optional
                error={errors.nit}
                className="sm:col-span-2"
              >
                <Input
                  type="text"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  inputMode="numeric"
                  placeholder="1234567890"
                  leadingIcon={<FileBadge size={18} strokeWidth={1.5} />}
                />
              </FormField>
            )}
          </fieldset>

          <div className="flex justify-end">
            <Button type="submit" size="md" loading={submitting}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BuyerAvatar({
  avatarUrl,
  name,
  onPick,
  onClear,
  disabled,
}: {
  avatarUrl: string | null
  name: string
  onPick: () => void
  onClear: () => void
  disabled: boolean
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'TÚ'

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-base font-semibold text-neutral-500">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Tu foto de perfil"
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </span>
        {avatarUrl && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Quitar foto"
            disabled={disabled}
            className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={12} strokeWidth={1.5} aria-hidden />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onPick}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {avatarUrl ? (
          <Pencil size={14} strokeWidth={1.5} aria-hidden />
        ) : (
          <Camera size={14} strokeWidth={1.5} aria-hidden />
        )}
        {avatarUrl ? 'Cambiar foto' : 'Subir foto'}
      </button>
    </div>
  )
}

function SellerBranding({
  bannerUrl,
  logoUrl,
  businessName,
  onPickBanner,
  onClearBanner,
  onPickLogo,
  onClearLogo,
  disabled,
}: {
  bannerUrl: string | null
  logoUrl: string | null
  businessName: string
  onPickBanner: () => void
  onClearBanner: () => void
  onPickLogo: () => void
  onClearLogo: () => void
  disabled: boolean
}) {
  const initials = businessName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'MI'

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt="Portada"
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAFAFA_25%,transparent_25%,transparent_50%,#FAFAFA_50%,#FAFAFA_75%,transparent_75%,transparent)] bg-size-[14px_14px]" />
        )}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button
            type="button"
            onClick={onPickBanner}
            disabled={disabled}
            aria-label={bannerUrl ? 'Cambiar portada' : 'Subir portada'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white/95 px-2.5 py-1.5 text-[13px] font-medium text-neutral-900 shadow-sm transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bannerUrl ? (
              <Pencil size={14} strokeWidth={1.5} aria-hidden />
            ) : (
              <Camera size={14} strokeWidth={1.5} aria-hidden />
            )}
            <span className="hidden sm:inline">
              {bannerUrl ? 'Cambiar portada' : 'Subir portada'}
            </span>
          </button>
          {bannerUrl && (
            <button
              type="button"
              onClick={onClearBanner}
              disabled={disabled}
              aria-label="Quitar portada"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white/95 text-neutral-500 shadow-sm hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={14} strokeWidth={1.5} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/*
        Logo en flujo normal con margin-top negativo: se solapa
        visualmente sobre el banner pero ocupa espacio real debajo,
        así el siguiente campo del form no queda tapado.
      */}
      <div className="relative -mt-10 ml-4 w-fit">
        <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-neutral-100 text-base font-semibold text-neutral-500 shadow-sm">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`Logo de ${businessName}`}
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </span>
        <button
          type="button"
          onClick={onPickLogo}
          disabled={disabled}
          aria-label={logoUrl ? 'Cambiar logo' : 'Subir logo'}
          className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
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
            disabled={disabled}
            aria-label="Quitar logo"
            className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={12} strokeWidth={1.5} aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
