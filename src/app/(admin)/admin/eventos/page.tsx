'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/contexts/ToastContext'
import { deleteEvent } from '@/lib/api/admin'
import { listSellers } from '@/lib/api/users'
import { mockEvents } from '@/data/mock/events'
import { CafeEvent, EventModality, EventStatus, EventType, Seller } from '@/types'
import { formatDateShort } from '@/lib/utils'

const TYPE_LABEL: Record<EventType, string> = {
  taller: 'Taller',
  cata: 'Cata',
  capacitacion: 'Capacitación',
  feria: 'Feria',
  competencia: 'Competencia',
  networking: 'Networking',
  tour_finca: 'Tour de finca',
  otro: 'Otro',
}

const MODALITY_LABEL: Record<EventModality, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrido: 'Híbrido',
}

const STATUS_BADGE: Record<EventStatus, { label: string; variant: 'success' | 'warning' | 'default' | 'error' }> = {
  active: { label: 'Activo', variant: 'success' },
  draft: { label: 'Borrador', variant: 'default' },
  finished: { label: 'Finalizado', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'error' },
}

export default function AdminEventosPage() {
  const { showSuccess, showError } = useToast()
  const [events, setEvents] = useState<CafeEvent[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<CafeEvent | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      // listEvents() filtra por status='active' por defecto. Para el panel admin
      // queremos verlos todos, así que leemos el mock directo + sellers reales.
      const ss = await listSellers()
      setEvents(mockEvents)
      setSellers(ss)
    } catch {
      showError('No pudimos cargar los eventos', 'Recarga la página')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sellerById = useMemo(
    () => new Map(sellers.map((s) => [s.id, s])),
    [sellers]
  )

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.date.localeCompare(b.date))
  }, [events])

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteEvent(deleteTarget.id)
      showSuccess('Evento eliminado', deleteTarget.name)
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    } catch {
      showError('No pudimos eliminar', 'Inténtalo de nuevo')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
          Eventos
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Modera los eventos publicados en la plataforma.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sin eventos publicados"
              description="Cuando los organizadores publiquen eventos, aparecerán aquí."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Organizador</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-center">Cupos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {sortedEvents.map((ev) => {
                  const seller = sellerById.get(ev.organizerId)
                  const status = STATUS_BADGE[ev.status]
                  return (
                    <tr key={ev.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                            {ev.image ? (
                              <Image
                                src={ev.image}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-neutral-900">
                              {ev.name}
                            </p>
                            <p className="truncate text-xs text-neutral-500">
                              {MODALITY_LABEL[ev.modality]}
                              {ev.city ? ` · ${ev.city}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{TYPE_LABEL[ev.type]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {seller ? (
                          <Link
                            href={`/vendedor/${seller.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-900 underline-offset-2 hover:underline"
                          >
                            {seller.businessName}
                          </Link>
                        ) : (
                          <span className="text-neutral-500">{ev.organizerId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        {formatDateShort(ev.date)}
                        <span className="block text-xs text-neutral-500">
                          {ev.startTime}
                          {ev.endTime ? `–${ev.endTime}` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-neutral-900">
                        {ev.capacity
                          ? `${ev.registeredCount} / ${ev.capacity}`
                          : `${ev.registeredCount} · sin límite`}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/eventos/${ev.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-200 px-2.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                            aria-label="Ver evento"
                          >
                            <ExternalLink size={14} strokeWidth={1.5} />
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(ev)}
                            leadingIcon={<Trash2 size={14} strokeWidth={1.5} />}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar evento"
        description={
          deleteTarget
            ? `Se eliminará "${deleteTarget.name}". Esta acción no se puede deshacer y afectará a las inscripciones.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="destructive"
      />
    </div>
  )
}
