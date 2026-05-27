'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Star, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/contexts/ToastContext'
import {
  deletePublication,
  setPublicationFeatured,
} from '@/lib/api/admin'
import { listPublications } from '@/lib/api/publications'
import { listSellers } from '@/lib/api/users'
import { Publication, PublicationCategory, Seller } from '@/types'
import { formatPrice } from '@/lib/utils'

const CATEGORY_LABEL: Record<PublicationCategory, string> = {
  A: 'A · Café e insumos',
  B: 'B · Maquinaria',
  C: 'C · Servicios',
  D: 'D · Terrenos',
}

type CategoryFilter = PublicationCategory | 'all'

export default function AdminPublicacionesPage() {
  const { showSuccess, showError } = useToast()
  const [publications, setPublications] = useState<Publication[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const [pubs, ss] = await Promise.all([
        listPublications({ filters: { status: undefined } }),
        listSellers(),
      ])
      setPublications(pubs)
      setSellers(ss)
    } catch {
      showError('No pudimos cargar las publicaciones', 'Recarga la página')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sellerById = useMemo(() => {
    return new Map(sellers.map((s) => [s.id, s]))
  }, [sellers])

  const filtered = useMemo(() => {
    if (filter === 'all') return publications
    return publications.filter((p) => p.category === filter)
  }, [publications, filter])

  async function toggleFeatured(p: Publication) {
    try {
      await setPublicationFeatured(p.id, !p.featured)
      showSuccess(
        !p.featured ? 'Publicación destacada' : 'Destaque retirado',
        p.title
      )
      await refresh()
    } catch {
      showError('No pudimos actualizar', 'Inténtalo de nuevo')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deletePublication(deleteTarget.id)
      showSuccess('Publicación eliminada', deleteTarget.title)
      await refresh()
    } catch {
      showError('No pudimos eliminar', 'Inténtalo de nuevo')
    }
  }

  function getDisplayPrice(p: Publication): string {
    if (p.priceMode === 'quote') return 'Bajo cotización'
    if (!p.units || p.units.length === 0) return '—'
    const min = p.units.reduce(
      (acc, u) => Math.min(acc, u.price),
      Number.POSITIVE_INFINITY
    )
    return `Desde ${formatPrice(min)}`
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
          Publicaciones
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Modera el catálogo: destaca contenido valioso o retira publicaciones que infringen las reglas.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Chip
          selected={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          Todas ({publications.length})
        </Chip>
        {(['A', 'B', 'C', 'D'] as PublicationCategory[]).map((cat) => {
          const count = publications.filter((p) => p.category === cat).length
          return (
            <Chip
              key={cat}
              selected={filter === cat}
              onClick={() => setFilter(cat)}
            >
              {CATEGORY_LABEL[cat]} ({count})
            </Chip>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sin publicaciones en esta categoría"
              description="Cambia el filtro para ver otras publicaciones."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Publicación</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filtered.map((p) => {
                  const seller = sellerById.get(p.sellerId)
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                            {p.photos[0] ? (
                              <Image
                                src={p.photos[0]}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {p.featured && (
                                <Star
                                  size={14}
                                  strokeWidth={1.5}
                                  className="shrink-0 fill-accent-500 text-accent-500"
                                  aria-label="Destacada"
                                />
                              )}
                              <p className="truncate font-medium text-neutral-900">
                                {p.title}
                              </p>
                            </div>
                            <p className="truncate text-xs text-neutral-500">
                              {p.subcategory}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{p.category}</Badge>
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
                          <span className="text-neutral-500">{p.sellerId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        {getDisplayPrice(p)}
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'active' ? (
                          <Badge variant="success">Activa</Badge>
                        ) : p.status === 'paused' ? (
                          <Badge variant="warning">Pausada</Badge>
                        ) : (
                          <Badge variant="default">Borrador</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/publicacion/${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-200 px-2.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                            aria-label="Ver publicación"
                          >
                            <ExternalLink size={14} strokeWidth={1.5} />
                          </Link>
                          <Button
                            size="sm"
                            variant={p.featured ? 'secondary' : 'ghost'}
                            onClick={() => toggleFeatured(p)}
                            leadingIcon={<Star size={14} strokeWidth={1.5} />}
                          >
                            {p.featured ? 'Quitar' : 'Destacar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(p)}
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
        title="Eliminar publicación"
        description={
          deleteTarget
            ? `Se eliminará "${deleteTarget.title}". Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="destructive"
      />
    </div>
  )
}
