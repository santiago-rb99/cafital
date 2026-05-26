'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'

import { CafeEvent, EventStatus } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { deleteEvent, listEventsByOrganizer } from '@/lib/api/events'
import {
  EVENT_MODALITY_LABEL,
  EVENT_TYPE_LABEL,
} from '@/components/events/eventFiltersState'
import { cn, formatDateShort, formatPrice } from '@/lib/utils'

const STATUS_META: Record<
  EventStatus,
  { label: string; chip: string }
> = {
  active: { label: 'Activo', chip: 'bg-primary-50 text-primary-700' },
  draft: { label: 'Borrador', chip: 'bg-accent-100 text-accent-900' },
  finished: { label: 'Finalizado', chip: 'bg-neutral-200 text-neutral-500' },
  cancelled: { label: 'Cancelado', chip: 'bg-[#FDEAEA] text-error-dark' },
}

type FilterValue = 'all' | EventStatus

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'draft', label: 'Borradores' },
  { value: 'finished', label: 'Finalizados' },
]

export default function MiTiendaEventosPage() {
  const { user, isHydrated } = useAuth()
  const { showSuccess, showError } = useToast()
  const [events, setEvents] = useState<CafeEvent[] | null>(null)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [actingId, setActingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Reset al cambiar de seller (patrón "state from prop").
  const [trackedSellerId, setTrackedSellerId] = useState<string | null>(null)
  if (user?.id !== trackedSellerId) {
    setTrackedSellerId(user?.id ?? null)
    setEvents(null)
  }

  const reload = useCallback(() => {
    if (!user || user.role !== 'seller') return
    listEventsByOrganizer(user.id, { includeAllStatuses: true }).then(setEvents)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  const counts = useMemo(() => {
    const list = events ?? []
    const c: Record<FilterValue, number> = {
      all: list.length,
      active: 0,
      draft: 0,
      finished: 0,
      cancelled: 0,
    }
    for (const e of list) c[e.status]++
    return c
  }, [events])

  const visible = useMemo(
    () => {
      const list = events ?? []
      return filter === 'all' ? list : list.filter((e) => e.status === filter)
    },
    [filter, events]
  )

  async function onConfirmDelete() {
    if (!confirmDeleteId) return
    setActingId(confirmDeleteId)
    try {
      await deleteEvent(confirmDeleteId)
      setEvents((prev) => (prev ?? []).filter((e) => e.id !== confirmDeleteId))
      showSuccess('Evento eliminado')
    } catch {
      showError('No pudimos eliminar el evento')
    } finally {
      setActingId(null)
      setConfirmDeleteId(null)
    }
  }

  if (!isHydrated || events === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  const target = events.find((e) => e.id === confirmDeleteId)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Mis eventos
          </h1>
          <p className="text-sm text-neutral-500">
            Talleres, catas, ferias y capacitaciones que organizas.
          </p>
        </div>
        <Link
          href="/mi-tienda/eventos/nuevo"
          className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:self-auto"
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden />
          Nuevo evento
        </Link>
      </header>

      {events.length > 0 && (
        <div
          role="tablist"
          aria-label="Filtrar eventos por estado"
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

      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} strokeWidth={1.5} />}
          title="Aún no publicas eventos"
          description="Crea un taller, cata o capacitación para llegar a más compradores."
          action={
            <Link
              href="/mi-tienda/eventos/nuevo"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              <Plus size={16} strokeWidth={1.5} aria-hidden />
              Crear evento
            </Link>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} strokeWidth={1.5} />}
          title="Sin eventos en este estado"
          description="Cambia el filtro para ver otros."
        />
      ) : (
        <>
          {/* MOBILE */}
          <ul role="list" className="flex flex-col gap-3 md:hidden">
            {visible.map((event) => (
              <li key={event.id}>
                <EventMobileCard
                  event={event}
                  acting={actingId === event.id}
                  onDelete={() => setConfirmDeleteId(event.id)}
                />
              </li>
            ))}
          </ul>

          {/* DESKTOP */}
          <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-100/60 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Evento
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Fecha
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Modalidad
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Inscritos
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Precio
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
                {visible.map((event) => {
                  const acting = actingId === event.id
                  return (
                    <tr key={event.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative aspect-16/10 h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            <Image
                              src={event.image}
                              alt={event.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-medium text-neutral-900">
                              {event.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {EVENT_TYPE_LABEL[event.type]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-neutral-900">
                        {formatDateShort(event.date)}
                        <p className="text-xs text-neutral-500">
                          {event.startTime}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm text-neutral-900">
                        {EVENT_MODALITY_LABEL[event.modality]}
                      </td>
                      <td className="px-5 py-3 text-right text-sm tabular-nums text-neutral-900">
                        {event.registeredCount}
                        {event.capacity ? ` / ${event.capacity}` : ''}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-medium tabular-nums text-neutral-900">
                        {event.price === 'free'
                          ? 'Gratuito'
                          : formatPrice(event.price as number)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium',
                            STATUS_META[event.status].chip
                          )}
                        >
                          {STATUS_META[event.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/eventos/${event.id}`}
                            aria-label={`Ver ${event.name} en el marketplace`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                          >
                            <Eye size={16} strokeWidth={1.5} aria-hidden />
                          </Link>
                          <Link
                            href={`/mi-tienda/eventos/${event.id}/editar`}
                            aria-label={`Editar ${event.name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                          >
                            <Pencil size={16} strokeWidth={1.5} aria-hidden />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(event.id)}
                            disabled={acting}
                            aria-label={`Eliminar ${event.name}`}
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
        title="¿Eliminar este evento?"
        description={
          target
            ? `Eliminarás "${target.name}". Las inscripciones existentes se mantendrán pero el evento dejará de ser visible.`
            : 'Esta acción es permanente.'
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Volver"
        variant="destructive"
      />
    </div>
  )
}

function EventMobileCard({
  event,
  acting,
  onDelete,
}: {
  event: CafeEvent
  acting: boolean
  onDelete: () => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <span className="relative aspect-16/10 h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={event.image}
            alt={event.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="line-clamp-2 text-sm font-medium text-neutral-900">
            {event.name}
          </p>
          <p className="text-xs text-neutral-500">
            {EVENT_TYPE_LABEL[event.type]} · {EVENT_MODALITY_LABEL[event.modality]}
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <Calendar size={11} strokeWidth={1.5} aria-hidden />
            {formatDateShort(event.date)} · {event.startTime}
          </p>
          <span
            className={cn(
              'mt-1 inline-flex w-fit items-center rounded px-2 py-0.5 text-[11px] font-medium',
              STATUS_META[event.status].chip
            )}
          >
            {STATUS_META[event.status].label}
          </span>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 border-t border-neutral-200 pt-3 text-xs">
        <div className="inline-flex items-center gap-1">
          <Users size={12} strokeWidth={1.5} aria-hidden className="text-neutral-500" />
          <dt className="sr-only">Inscritos</dt>
          <dd className="text-neutral-900">
            {event.registeredCount}
            {event.capacity ? ` / ${event.capacity}` : ''} inscritos
          </dd>
        </div>
        <div>
          <dt className="sr-only">Precio</dt>
          <dd className="font-medium text-neutral-900">
            {event.price === 'free'
              ? 'Gratuito'
              : formatPrice(event.price as number)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-3">
        <Link
          href={`/eventos/${event.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          <Eye size={14} strokeWidth={1.5} aria-hidden />
          Ver
        </Link>
        <Link
          href={`/mi-tienda/eventos/${event.id}/editar`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-[13px] font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          <Pencil size={14} strokeWidth={1.5} aria-hidden />
          Editar
        </Link>
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
