'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  RefreshCw,
  Upload,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ImageDropzone, type DropzoneImage } from '@/components/ui/ImageDropzone'
import { BecomeSellerLanding } from '@/components/shop/BecomeSellerLanding'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { submitVerificationDocs } from '@/lib/api/users'
import { formatDate } from '@/lib/utils'
import { Seller, VerificationStatus } from '@/types'

function statusOf(seller: Seller): VerificationStatus {
  return seller.verificationStatus ?? 'pending'
}

export default function MiTiendaVerificacionPage() {
  const { user, isHydrated, refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [idDocs, setIdDocs] = useState<DropzoneImage[]>([])
  const [nitDocs, setNitDocs] = useState<DropzoneImage[]>([])
  const [submitting, setSubmitting] = useState(false)

  if (!isHydrated) return <PageSkeleton />
  if (!user) return <BecomeSellerLanding />
  if (user.role === 'buyer') return <BecomeSellerLanding />
  if (user.role !== 'seller') return null

  const seller = user as Seller
  const status = statusOf(seller)
  const hasExistingDocs = !!seller.verificationDocs?.idDocument

  const canSubmit = idDocs.length > 0 && !submitting

  async function handleSubmit() {
    if (idDocs.length === 0) {
      showError(
        'Falta el documento de identidad',
        'Sube tu CI antes de enviar la solicitud'
      )
      return
    }
    setSubmitting(true)
    try {
      await submitVerificationDocs(seller.id, {
        idDocument: idDocs[0].url,
        ...(nitDocs.length > 0 ? { nitDocument: nitDocs[0].url } : {}),
      })
      refreshUser()
      showSuccess(
        'Solicitud enviada',
        'El equipo Cafital revisará tus documentos pronto'
      )
      setIdDocs([])
      setNitDocs([])
    } catch (e) {
      showError(
        'No pudimos enviar tu solicitud',
        e instanceof Error ? e.message : 'Inténtalo de nuevo'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Verificación de tu negocio
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          El equipo Cafital revisa tu identidad y NIT antes de mostrarte el
          badge “Vendedor verificado” en tu perfil público.
        </p>
      </header>

      {/* Estado actual */}
      <StatusCard seller={seller} status={status} />

      {/* Formulario de envío — solo si no está aprobado */}
      {status !== 'approved' && (
        <section
          aria-labelledby="upload-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <header className="mb-4 flex flex-col gap-1">
            <h2
              id="upload-heading"
              className="font-serif text-lg font-semibold text-neutral-900"
            >
              {status === 'rejected' || hasExistingDocs
                ? 'Reenviar documentos'
                : 'Subir documentos'}
            </h2>
            <p className="text-sm text-neutral-500">
              Sube imágenes claras y legibles. Aceptamos JPG, PNG o PDF.
            </p>
          </header>

          <div className="flex flex-col gap-6">
            <Field
              label="Documento de identidad (CI)"
              required
              hint="Frente del Carnet de Identidad de la persona responsable del negocio."
            >
              <ImageDropzone
                value={idDocs}
                onChange={setIdDocs}
                maxImages={1}
                helper="Arrastra tu CI o haz clic para subir (máx. 1 archivo)"
              />
            </Field>

            <Field
              label="Certificado NIT"
              hint="Opcional si todavía no estás formalizado. Recomendado para acceder a planes premium."
            >
              <ImageDropzone
                value={nitDocs}
                onChange={setNitDocs}
                maxImages={1}
                helper="Arrastra tu Certificado NIT o haz clic para subir (máx. 1 archivo)"
              />
            </Field>

            <div className="flex flex-col items-stretch gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-neutral-500">
                Al enviar, tu solicitud quedará en revisión. Te
                notificaremos cuando haya una decisión.
              </p>
              <Button
                variant="primary"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit}
                loading={submitting}
                leadingIcon={
                  status === 'rejected' ? (
                    <RefreshCw size={16} strokeWidth={1.5} />
                  ) : (
                    <Upload size={16} strokeWidth={1.5} />
                  )
                }
              >
                {status === 'rejected'
                  ? 'Reenviar solicitud'
                  : 'Enviar a revisión'}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Documentos ya cargados — preview */}
      {hasExistingDocs && status !== 'rejected' && (
        <section
          aria-labelledby="docs-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <header className="mb-4">
            <h2
              id="docs-heading"
              className="font-serif text-lg font-semibold text-neutral-900"
            >
              Documentos enviados
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {status === 'pending'
                ? 'Estos son los documentos que estamos revisando.'
                : 'Documentos que usamos para tu verificación.'}
            </p>
          </header>
          <DocPreviewGrid
            idDocument={seller.verificationDocs?.idDocument}
            nitDocument={seller.verificationDocs?.nitDocument}
          />
        </section>
      )}

      {/* Qué pasa después */}
      <section
        aria-labelledby="info-heading"
        className="rounded-2xl border border-neutral-200 bg-neutral-100/60 p-5"
      >
        <header className="mb-3 flex items-center gap-2">
          <Info size={16} strokeWidth={1.5} className="text-neutral-500" />
          <h2
            id="info-heading"
            className="text-sm font-semibold text-neutral-900"
          >
            ¿Qué obtienes al verificarte?
          </h2>
        </header>
        <ul className="flex flex-col gap-2 text-sm text-neutral-500">
          <li className="flex items-start gap-2">
            <BadgeCheck
              size={16}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-primary-500"
            />
            <span>
              Badge <strong className="text-neutral-900">“Vendedor verificado”</strong> en
              tu perfil público, tarjetas y publicaciones.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <BadgeCheck
              size={16}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-primary-500"
            />
            <span>
              Apareces en el filtro <strong className="text-neutral-900">“Solo
              verificados”</strong> del listado de vendedores.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <BadgeCheck
              size={16}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-primary-500"
            />
            <span>
              Mayor confianza para compradores B2B y acceso a mejores
              oportunidades.
            </span>
          </li>
        </ul>
      </section>
    </div>
  )
}

/* ─── Status card por estado ───────────────────────────────── */

function StatusCard({
  seller,
  status,
}: {
  seller: Seller
  status: VerificationStatus
}) {
  if (status === 'approved') {
    return (
      <section
        className="flex items-start gap-4 rounded-2xl border border-primary-100 bg-primary-50/60 p-5 shadow-sm sm:p-6"
        role="status"
      >
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-300 text-white"
        >
          <CheckCircle2 size={24} strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-lg font-semibold text-primary-700">
            Vendedor verificado
          </h2>
          <p className="mt-1 text-sm text-primary-700">
            Tu identidad fue confirmada por el equipo Cafital.
            {seller.verificationReviewedAt &&
              ` Aprobado el ${formatDate(seller.verificationReviewedAt)}.`}{' '}
            El badge ya aparece en tu perfil público.
          </p>
          <div className="mt-3">
            <Link
              href={`/vendedor/${seller.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
            >
              Ver mi perfil público
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (status === 'rejected') {
    return (
      <section
        className="flex items-start gap-4 rounded-2xl border border-[#F4CFCF] bg-[#FDEAEA]/60 p-5 shadow-sm sm:p-6"
        role="alert"
      >
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D32F2F] text-white"
        >
          <XCircle size={24} strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-lg font-semibold text-[#601212]">
            Solicitud rechazada
          </h2>
          {seller.verificationReviewedAt && (
            <p className="mt-1 text-xs text-[#601212]/80">
              Revisada el {formatDate(seller.verificationReviewedAt)}
            </p>
          )}
          {seller.verificationRejectionReason && (
            <div className="mt-3 rounded-lg border border-[#F4CFCF] bg-white/60 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#601212]">
                Motivo
              </p>
              <p className="text-sm text-[#601212]">
                {seller.verificationRejectionReason}
              </p>
            </div>
          )}
          <p className="mt-3 text-sm text-[#601212]">
            Corrige lo indicado y reenvía tus documentos abajo.
          </p>
        </div>
      </section>
    )
  }

  // pending — con o sin docs
  const hasExistingDocs = !!seller.verificationDocs?.idDocument
  if (hasExistingDocs) {
    return (
      <section
        className="flex items-start gap-4 rounded-2xl border border-accent-100 bg-accent-100/40 p-5 shadow-sm sm:p-6"
        role="status"
      >
        <span
          aria-hidden
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white"
        >
          <Clock size={24} strokeWidth={1.5} />
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-lg font-semibold text-accent-900">
            En revisión
          </h2>
          <p className="mt-1 text-sm text-accent-900/80">
            Recibimos tus documentos
            {seller.verificationSubmittedAt &&
              ` el ${formatDate(seller.verificationSubmittedAt)}`}
            . El equipo Cafital los está revisando. Puedes reemplazarlos
            mientras no haya una decisión.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
      role="status"
    >
      <span
        aria-hidden
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500"
      >
        <AlertCircle size={24} strokeWidth={1.5} />
      </span>
      <div className="flex-1">
        <h2 className="font-serif text-lg font-semibold text-neutral-900">
          Verificá tu negocio
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Sube tu documento de identidad para iniciar la verificación.
          Toma menos de 5 minutos.
        </p>
      </div>
    </section>
  )
}

/* ─── Helpers visuales ─────────────────────────────────────── */

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-neutral-900">
          {label}
          {required && <span className="ml-1 text-[#D32F2F]">*</span>}
        </span>
        {hint && <span className="text-xs text-neutral-500">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function DocPreviewGrid({
  idDocument,
  nitDocument,
}: {
  idDocument?: string
  nitDocument?: string
}) {
  if (!idDocument && !nitDocument) {
    return (
      <EmptyState
        icon={<FileText size={28} strokeWidth={1.5} />}
        title="Sin documentos todavía"
        description="Cuando subas tus documentos aparecerán aquí."
      />
    )
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <DocTile label="Documento de identidad" src={idDocument} />
      <DocTile label="Certificado NIT" src={nitDocument} />
    </div>
  )
}

function DocTile({ label, src }: { label: string; src?: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="flex h-40 items-center justify-center bg-neutral-100">
        {src ? (
          // Documento mock — usamos <img> para no depender de remoteImages
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-neutral-300">
            <FileText size={24} strokeWidth={1.5} />
            <span className="text-xs">Sin documento</span>
          </div>
        )}
      </div>
      <figcaption className="flex items-center gap-1.5 border-t border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-500">
        <FileText size={12} strokeWidth={1.5} />
        {label}
      </figcaption>
    </figure>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-10 w-2/3 animate-pulse rounded bg-neutral-100" />
      <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
      <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
    </div>
  )
}
