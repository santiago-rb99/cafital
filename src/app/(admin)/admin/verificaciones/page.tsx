'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  ImageOff,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Textarea'
import { VerificationStatusBadge } from '@/components/admin/VerificationStatusBadge'
import { useToast } from '@/contexts/ToastContext'
import {
  approveSeller,
  listAllSellers,
  rejectSeller,
} from '@/lib/api/admin'
import { formatDateShort, subscriptionLabel } from '@/lib/utils'
import { Seller, VerificationStatus } from '@/types'

type TabKey = VerificationStatus

const TAB_ORDER: TabKey[] = ['pending', 'approved', 'rejected']

const TAB_LABEL: Record<TabKey, string> = {
  pending: 'Pendientes',
  approved: 'Aprobados',
  rejected: 'Rechazados',
}

function getStatus(seller: Seller): VerificationStatus {
  return seller.verificationStatus ?? 'pending'
}

export default function AdminVerificacionesPage() {
  const { showSuccess, showError } = useToast()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('pending')
  const [query, setQuery] = useState('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectModalFor, setRejectModalFor] = useState<Seller | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const s = await listAllSellers()
      setSellers(s)
    } catch {
      showError('No pudimos cargar los vendedores', 'Recarga la página')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Seleccionado derivado: siempre la versión fresca del listado
  const selected = selectedId
    ? sellers.find((s) => s.id === selectedId) ?? null
    : null

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { pending: 0, approved: 0, rejected: 0 }
    for (const s of sellers) c[getStatus(s)] += 1
    return c
  }, [sellers])

  const filteredSellers = useMemo(() => {
    const inTab = sellers.filter((s) => getStatus(s) === tab)
    const q = query.trim().toLowerCase()
    if (!q) return inTab
    return inTab.filter(
      (s) =>
        s.businessName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.nit ?? '').toLowerCase().includes(q)
    )
  }, [sellers, tab, query])

  async function handleApprove(seller: Seller) {
    setSubmitting(true)
    try {
      await approveSeller(seller.id)
      showSuccess('Vendedor aprobado', seller.businessName)
      await refresh()
      setSelectedId(null)
    } catch {
      showError('No pudimos aprobar', 'Inténtalo de nuevo')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmReject() {
    if (!rejectModalFor) return
    const reason = rejectReason.trim()
    if (reason.length < 10) {
      showError(
        'Motivo demasiado corto',
        'Explica al vendedor qué debe corregir (mín. 10 caracteres)'
      )
      return
    }
    setSubmitting(true)
    try {
      await rejectSeller(rejectModalFor.id, reason)
      showSuccess('Solicitud rechazada', rejectModalFor.businessName)
      await refresh()
      setRejectModalFor(null)
      setRejectReason('')
      setSelectedId(null)
    } catch {
      showError('No pudimos rechazar', 'Inténtalo de nuevo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
          Verificación de vendedores
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Revisa documentos, aprueba o rechaza solicitudes. El badge
          “Vendedor verificado” se otorga al aprobar.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs<TabKey>
          variant="pills"
          value={tab}
          onChange={setTab}
          items={TAB_ORDER.map((k) => ({
            value: k,
            label: TAB_LABEL[k],
            count: counts[k],
          }))}
        />

        <div className="sm:w-72">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o NIT…"
            leadingIcon={<Search size={18} strokeWidth={1.5} />}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<ShieldCheck size={28} strokeWidth={1.5} />}
              title={
                counts[tab] === 0
                  ? `Sin vendedores ${TAB_LABEL[tab].toLowerCase()}`
                  : 'Sin resultados'
              }
              description={
                counts[tab] === 0
                  ? tab === 'pending'
                    ? 'No hay solicitudes esperando revisión.'
                    : tab === 'approved'
                    ? 'Cuando apruebes vendedores aparecerán aquí.'
                    : 'No hay solicitudes rechazadas.'
                  : 'Ningún vendedor coincide con tu búsqueda.'
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {filteredSellers.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={s.logo}
                    alt={s.businessName}
                    fallback={s.businessName}
                    size="md"
                    square
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-neutral-900">
                        {s.businessName}
                      </p>
                      <VerificationStatusBadge status={getStatus(s)} />
                    </div>
                    <p className="truncate text-xs text-neutral-500">
                      {s.email}
                      {s.nit ? ` · NIT ${s.nit}` : ''}
                      {s.department ? ` · ${s.department}` : ''}
                    </p>
                    {s.verificationSubmittedAt && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Solicitud enviada el{' '}
                        {formatDateShort(s.verificationSubmittedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedId(s.id)}
                  >
                    Revisar
                  </Button>
                  {getStatus(s) === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => void handleApprove(s)}
                        disabled={submitting}
                        leadingIcon={<Check size={14} strokeWidth={1.5} />}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setRejectModalFor(s)
                          setRejectReason('')
                        }}
                        disabled={submitting}
                        leadingIcon={<X size={14} strokeWidth={1.5} />}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detalle del vendedor */}
      <Modal
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title={selected?.businessName ?? 'Vendedor'}
        description="Datos del negocio y documentos enviados"
        size="lg"
        footer={
          selected && getStatus(selected) === 'pending' ? (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setRejectModalFor(selected)
                  setRejectReason('')
                }}
                disabled={submitting}
                leadingIcon={<X size={16} strokeWidth={1.5} />}
              >
                Rechazar
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleApprove(selected)}
                loading={submitting}
                leadingIcon={<Check size={16} strokeWidth={1.5} />}
              >
                Aprobar vendedor
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setSelectedId(null)}>
              Cerrar
            </Button>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <Avatar
                src={selected.logo}
                alt={selected.businessName}
                fallback={selected.businessName}
                size="lg"
                square
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-lg font-semibold text-neutral-900">
                    {selected.businessName}
                  </h3>
                  <VerificationStatusBadge status={getStatus(selected)} />
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {selected.email}
                </p>
                {selected.description && (
                  <p className="mt-2 text-sm text-neutral-900">
                    {selected.description}
                  </p>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  NIT
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {selected.nit ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Plan
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  <Badge
                    variant={
                      selected.subscriptionPlan === 'none'
                        ? 'default'
                        : 'success'
                    }
                  >
                    {subscriptionLabel(selected.subscriptionPlan)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Ubicación
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {[selected.municipality, selected.department]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Asociación
                </dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {selected.association ?? '—'}
                </dd>
              </div>
              {selected.verificationSubmittedAt && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Solicitud enviada
                  </dt>
                  <dd className="mt-0.5 font-medium text-neutral-900">
                    {formatDateShort(selected.verificationSubmittedAt)}
                  </dd>
                </div>
              )}
              {selected.verificationReviewedAt && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Revisada
                  </dt>
                  <dd className="mt-0.5 font-medium text-neutral-900">
                    {formatDateShort(selected.verificationReviewedAt)}
                  </dd>
                </div>
              )}
            </dl>

            <section>
              <h4 className="mb-2 text-sm font-semibold text-neutral-900">
                Documentos enviados
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DocumentTile
                  label="Documento de identidad"
                  src={selected.verificationDocs?.idDocument}
                />
                <DocumentTile
                  label="Certificado NIT"
                  src={selected.verificationDocs?.nitDocument}
                />
              </div>
              {!selected.verificationDocs?.idDocument &&
                !selected.verificationDocs?.nitDocument && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent-100 bg-accent-100/40 p-3 text-sm text-accent-900">
                    <AlertCircle
                      size={16}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0"
                    />
                    <span>
                      Este vendedor todavía no ha cargado documentos. Pídele
                      que los suba antes de aprobar.
                    </span>
                  </div>
                )}
            </section>

            {getStatus(selected) === 'rejected' &&
              selected.verificationRejectionReason && (
                <section className="rounded-xl border border-[#FDEAEA] bg-[#FDEAEA]/40 p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#601212]">
                    <XCircle size={16} strokeWidth={1.5} />
                    Motivo del rechazo
                  </div>
                  <p className="text-sm text-[#601212]">
                    {selected.verificationRejectionReason}
                  </p>
                </section>
              )}

            {getStatus(selected) === 'approved' && (
              <section className="rounded-xl border border-primary-100 bg-primary-50/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
                  <CheckCircle2 size={16} strokeWidth={1.5} />
                  Aprobado
                </div>
                <p className="mt-1 text-sm text-primary-700">
                  Este vendedor muestra el badge “Vendedor verificado” en su
                  perfil público.
                </p>
              </section>
            )}

            <div className="flex">
              <Link
                href={`/vendedor/${selected.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-200 px-2.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                <ExternalLink size={14} strokeWidth={1.5} />
                Ver perfil público
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de motivo de rechazo */}
      <Modal
        open={rejectModalFor !== null}
        onClose={() => {
          if (!submitting) {
            setRejectModalFor(null)
            setRejectReason('')
          }
        }}
        title="Rechazar solicitud"
        description={
          rejectModalFor
            ? `Explica a ${rejectModalFor.businessName} qué falta o qué debe corregir. El vendedor verá este mensaje.`
            : undefined
        }
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectModalFor(null)
                setRejectReason('')
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirmReject()}
              loading={submitting}
            >
              Rechazar solicitud
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="reject-reason"
            className="text-sm font-medium text-neutral-900"
          >
            Motivo del rechazo
          </label>
          <Textarea
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Ej. El NIT proporcionado no coincide con el registrado en SIN. Sube una imagen clara del Certificado de Inscripción al NIT actualizado."
            disabled={submitting}
          />
          <p className="text-xs text-neutral-500">Mínimo 10 caracteres.</p>
        </div>
      </Modal>
    </div>
  )
}

function DocumentTile({ label, src }: { label: string; src?: string }) {
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
            <ImageOff size={28} strokeWidth={1.5} />
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
