'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from 'lucide-react'

import { Publication, PublicationStatus } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  deletePublication,
  listPublicationsBySeller,
  setPublicationStatus,
} from '@/lib/api/publications'
import { cn, formatPrice } from '@/lib/utils'

type FilterValue = 'all' | PublicationStatus

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'draft', label: 'Borradores' },
]

const STATUS_META: Record<
  PublicationStatus,
  { label: string; chip: string }
> = {
  active: { label: 'Activa', chip: 'bg-primary-50 text-primary-700' },
  paused: { label: 'Pausada', chip: 'bg-neutral-200 text-neutral-500' },
  draft: { label: 'Borrador', chip: 'bg-accent-100 text-accent-900' },
}

function lowestPrice(p: Publication): string {
  if (p.priceMode === 'quote' || p.category === 'D' || !p.units?.length)
    return 'Bajo cotización'
  const min = p.units.reduce((m, u) => Math.min(m, u.price), Infinity)
  return formatPrice(min)
}

export default function MisPublicacionesPage() {
  const { user, isHydrated } = useAuth()
  const { showSuccess, showError } = useToast()
  const [pubs, setPubs] = useState<Publication[] | null>(null)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [actingId, setActingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Reset al cambiar de seller (patrón "state from prop").
  const [trackedSellerId, setTrackedSellerId] = useState<string | null>(null)
  if (user?.id !== trackedSellerId) {
    setTrackedSellerId(user?.id ?? null)
    setPubs(null)
  }

  const reload = useCallback(() => {
    if (!user || user.role !== 'seller') return
    listPublicationsBySeller(user.id, { includeAllStatuses: true }).then(setPubs)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  const counts = useMemo(() => {
    const list = pubs ?? []
    const c: Record<FilterValue, number> = {
      all: list.length,
      active: 0,
      paused: 0,
      draft: 0,
    }
    for (const p of list) c[p.status]++
    return c
  }, [pubs])

  const visible = useMemo(
    () => {
      const list = pubs ?? []
      return filter === 'all' ? list : list.filter((p) => p.status === filter)
    },
    [filter, pubs]
  )

  async function onTogglePause(pub: Publication) {
    const next: PublicationStatus = pub.status === 'active' ? 'paused' : 'active'
    setActingId(pub.id)
    try {
      const updated = await setPublicationStatus(pub.id, next)
      setPubs((prev) => (prev ?? []).map((p) => (p.id === pub.id ? updated : p)))
      showSuccess(
        next === 'paused'
          ? 'Publicación pausada'
          : 'Publicación reactivada'
      )
    } catch {
      showError('No pudimos actualizar la publicación')
    } finally {
      setActingId(null)
    }
  }

  async function onConfirmDelete() {
    if (!confirmDeleteId) return
    setActingId(confirmDeleteId)
    try {
      await deletePublication(confirmDeleteId)
      setPubs((prev) => (prev ?? []).filter((p) => p.id !== confirmDeleteId))
      showSuccess('Publicación eliminada')
    } catch {
      showError('No pudimos eliminar la publicación')
    } finally {
      setActingId(null)
      setConfirmDeleteId(null)
    }
  }

  if (!isHydrated || pubs === null) {
    return <ListWithFiltersSkeleton title="Mis publicaciones" />
  }

  const target = pubs.find((p) => p.id === confirmDeleteId)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Mis publicaciones
          </h1>
          <p className="text-sm text-neutral-500">
            Gestiona el catálogo de productos y servicios de tu tienda.
          </p>
        </div>
        <Link
          href="/mi-tienda/publicaciones/nueva"
          className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:self-auto"
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden />
          Nueva publicación
        </Link>
      </header>

      {pubs.length > 0 && (
        <div
          role="tablist"
          aria-label="Filtrar por estado"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {FILTERS.map((f) => {
            const active = filter === f.value
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100'
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                    active
                      ? 'bg-primary-100 text-primary-900'
                      : 'bg-neutral-100 text-neutral-500'
                  )}
                >
                  {counts[f.value]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {pubs.length === 0 ? (
        <EmptyState
          icon={<Package size={28} strokeWidth={1.5} />}
          title="Tu tienda está lista, falta tu primera publicación"
          description="Los compradores podrán encontrarte una vez que publiques al menos un producto o servicio."
          action={
            <Link
              href="/mi-tienda/publicaciones/nueva"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              <Plus size={16} strokeWidth={1.5} aria-hidden />
              Crear publicación
            </Link>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Package size={28} strokeWidth={1.5} />}
          title="Sin publicaciones en este estado"
          description="Cambia el filtro para ver otras."
        />
      ) : (
        <>
          {/* MOBILE: cards */}
          <ul role="list" className="flex flex-col gap-3 md:hidden">
            {visible.map((pub) => (
              <li key={pub.id}>
                <PubMobileCard
                  pub={pub}
                  acting={actingId === pub.id}
                  onTogglePause={() => onTogglePause(pub)}
                  onDelete={() => setConfirmDeleteId(pub.id)}
                />
              </li>
            ))}
          </ul>

          {/* DESKTOP: tabla */}
          <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-100/60 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Publicación
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Precio desde
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Stock
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Estado
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {visible.map((pub) => {
                  const acting = actingId === pub.id
                  return (
                    <tr key={pub.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            <Image
                              src={pub.photos[0]}
                              alt={pub.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-medium text-neutral-900">
                              {pub.title}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {pub.views ?? 0} vistas
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-medium tabular-nums text-neutral-900">
                        {lowestPrice(pub)}
                      </td>
                      <td className="px-5 py-3 text-right text-sm tabular-nums text-neutral-900">
                        {pub.inventory ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium',
                            STATUS_META[pub.status].chip
                          )}
                        >
                          {STATUS_META[pub.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/publicacion/${pub.id}`}
                            aria-label={`Ver ${pub.title} en el marketplace`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                          >
                            <Eye size={16} strokeWidth={1.5} aria-hidden />
                          </Link>
                          <Link
                            href={`/mi-tienda/publicaciones/${pub.id}/editar`}
                            aria-label={`Editar ${pub.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                          >
                            <Pencil size={16} strokeWidth={1.5} aria-hidden />
                          </Link>
                          <button
                            type="button"
                            onClick={() => onTogglePause(pub)}
                            disabled={acting || pub.status === 'draft'}
                            aria-label={
                              pub.status === 'active'
                                ? `Pausar ${pub.title}`
                                : `Reactivar ${pub.title}`
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {pub.status === 'active' ? (
                              <Pause size={16} strokeWidth={1.5} aria-hidden />
                            ) : (
                              <Play size={16} strokeWidth={1.5} aria-hidden />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(pub.id)}
                            disabled={acting}
                            aria-label={`Eliminar ${pub.title}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={onConfirmDelete}
        title="¿Eliminar esta publicación?"
        description={
          target
            ? `Eliminarás "${target.title}" y dejará de estar disponible para compradores. Los pedidos previos no se ven afectados.`
            : 'Esta acción es permanente.'
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Volver"
        variant="destructive"
      />
    </div>
  )
}

function PubMobileCard({
  pub,
  acting,
  onTogglePause,
  onDelete,
}: {
  pub: Publication
  acting: boolean
  onTogglePause: () => void
  onDelete: () => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <span className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={pub.photos[0]}
            alt={pub.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="line-clamp-2 text-sm font-medium text-neutral-900">
            {pub.title}
          </p>
          <p className="text-xs text-neutral-500">
            {lowestPrice(pub)} · {pub.views ?? 0} vistas
          </p>
          <span
            className={cn(
              'mt-1 inline-flex w-fit items-center rounded px-2 py-0.5 text-[11px] font-medium',
              STATUS_META[pub.status].chip
            )}
          >
            {STATUS_META[pub.status].label}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-3">
        <Link
          href={`/publicacion/${pub.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          <Eye size={14} strokeWidth={1.5} aria-hidden />
          Ver
        </Link>
        <Link
          href={`/mi-tienda/publicaciones/${pub.id}/editar`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          <Pencil size={14} strokeWidth={1.5} aria-hidden />
          Editar
        </Link>
        <button
          type="button"
          onClick={onTogglePause}
          disabled={acting || pub.status === 'draft'}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pub.status === 'active' ? (
            <>
              <Pause size={14} strokeWidth={1.5} aria-hidden />
              Pausar
            </>
          ) : (
            <>
              <Play size={14} strokeWidth={1.5} aria-hidden />
              Reactivar
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={acting}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={14} strokeWidth={1.5} aria-hidden />
          Eliminar
        </button>
      </div>
    </article>
  )
}

function ListWithFiltersSkeleton({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            {title}
          </h1>
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44" rounded="md" />
      </header>

      {/* Tabs filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0" rounded="md" />
        ))}
      </div>

      {/* Rows */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <ul className="divide-y divide-neutral-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-12 w-12 shrink-0" rounded="md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" rounded="md" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
