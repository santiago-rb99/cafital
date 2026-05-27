'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Building2, Camera, MapPin, Pencil, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

import { Seller } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateUserProfile } from '@/lib/api/users'
import { DEPARTMENTS } from '@/lib/utils'

const DESC_MAX = 280

interface BusinessIdentityEditorProps {
  seller: Seller
  open: boolean
  onClose: () => void
}

export function BusinessIdentityEditor({
  seller,
  open,
  onClose,
}: BusinessIdentityEditorProps) {
  const { refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [businessName, setBusinessName] = useState(seller.businessName)
  const [department, setDepartment] = useState(seller.department ?? '')
  const [municipality, setMunicipality] = useState(seller.municipality ?? '')
  const [description, setDescription] = useState(seller.description ?? '')
  const [bannerUrl, setBannerUrl] = useState<string | null>(seller.banner ?? null)
  const [logoUrl, setLogoUrl] = useState<string | null>(seller.logo ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset cuando se abre o cambia el seller
  const [trackedKey, setTrackedKey] = useState<string | null>(null)
  const key = open ? `${seller.id}:open` : `${seller.id}:closed`
  if (key !== trackedKey) {
    setTrackedKey(key)
    if (open) {
      setBusinessName(seller.businessName)
      setDepartment(seller.department ?? '')
      setMunicipality(seller.municipality ?? '')
      setDescription(seller.description ?? '')
      setBannerUrl(seller.banner ?? null)
      setLogoUrl(seller.logo ?? null)
      setError(null)
    }
  }

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const createdUrls = useRef<string[]>([])

  useEffect(() => {
    const urls = createdUrls.current
    return () => {
      for (const url of urls) URL.revokeObjectURL(url)
    }
  }, [])

  function pickImage(
    e: ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void,
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    createdUrls.current.push(url)
    setUrl(url)
    e.target.value = ''
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!businessName.trim()) {
      setError('Ingresa el nombre del negocio')
      return
    }
    if (description.length > DESC_MAX) {
      setError(`La descripción no puede superar ${DESC_MAX} caracteres`)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await updateUserProfile(seller.id, {
        businessName: businessName.trim(),
        department: department || undefined,
        municipality: municipality.trim() || undefined,
        description: description.trim() || undefined,
        logo: logoUrl ?? undefined,
        banner: bannerUrl ?? undefined,
      } as Parameters<typeof updateUserProfile>[1])
      refreshUser()
      showSuccess('Identidad actualizada')
      onClose()
    } catch {
      showError('No pudimos guardar los cambios')
    } finally {
      setSubmitting(false)
    }
  }

  const descRemaining = DESC_MAX - description.length

  return (
    <Drawer
      open={open}
      onClose={submitting ? () => undefined : onClose}
      title="Identidad del negocio"
      description="Lo que ven los compradores al entrar a tu perfil."
      size="lg"
    >
      <form
        id="business-identity-form"
        onSubmit={onSubmit}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* Banner */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-neutral-900">Portada</span>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt="Portada"
                fill
                sizes="(min-width: 768px) 480px, 100vw"
                className="object-cover"
                unoptimized={bannerUrl.startsWith('blob:')}
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAFAFA_25%,transparent_25%,transparent_50%,#FAFAFA_50%,#FAFAFA_75%,transparent_75%,transparent)] bg-size-[14px_14px]" />
            )}
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={submitting}
                aria-label={bannerUrl ? 'Cambiar portada' : 'Subir portada'}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white/95 px-2.5 py-1.5 text-[13px] font-medium text-neutral-900 shadow-xs transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bannerUrl ? (
                  <Pencil size={14} strokeWidth={1.5} aria-hidden />
                ) : (
                  <Camera size={14} strokeWidth={1.5} aria-hidden />
                )}
                <span>{bannerUrl ? 'Cambiar' : 'Subir'}</span>
              </button>
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl(null)}
                  disabled={submitting}
                  aria-label="Quitar portada"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white/95 text-neutral-500 shadow-xs hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                >
                  <X size={14} strokeWidth={1.5} aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium text-neutral-900">Logo</span>
          <div className="flex items-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 text-sm font-semibold text-neutral-500">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized={logoUrl.startsWith('blob:')}
                />
              ) : (
                <span aria-hidden>
                  {businessName.slice(0, 2).toUpperCase() || 'MI'}
                </span>
              )}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={submitting}
                leadingIcon={
                  logoUrl ? (
                    <Pencil size={14} strokeWidth={1.5} />
                  ) : (
                    <Camera size={14} strokeWidth={1.5} />
                  )
                }
              >
                {logoUrl ? 'Cambiar' : 'Subir'}
              </Button>
              {logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogoUrl(null)}
                  disabled={submitting}
                >
                  Quitar
                </Button>
              )}
            </div>
          </div>
        </div>

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Subir portada"
          onChange={(e) => pickImage(e, setBannerUrl)}
        />
        <input
          ref={logoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Subir logo"
          onChange={(e) => pickImage(e, setLogoUrl)}
        />

        <fieldset className="flex flex-col gap-4" disabled={submitting}>
          <legend className="sr-only">Datos del negocio</legend>

          <FormField label="Nombre comercial" required>
            <Input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              autoComplete="organization"
              leadingIcon={<Building2 size={18} strokeWidth={1.5} />}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Departamento" optional>
              <Select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Selecciona"
                options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                leadingIcon={<MapPin size={18} strokeWidth={1.5} />}
              />
            </FormField>
            <FormField label="Municipio" optional>
              <Input
                type="text"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="Caranavi"
              />
            </FormField>
          </div>

          <FormField
            label="Descripción del negocio"
            optional
            helper={`${descRemaining} caracteres restantes.`}
          >
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={DESC_MAX + 20}
              rows={5}
            />
          </FormField>
        </fieldset>

        {error && (
          <p className="text-xs font-medium text-[#D32F2F]" role="alert">
            {error}
          </p>
        )}
      </form>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="business-identity-form"
          size="md"
          loading={submitting}
        >
          Guardar cambios
        </Button>
      </div>
    </Drawer>
  )
}
