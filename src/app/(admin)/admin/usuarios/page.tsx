'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Search, ShieldOff, ShieldCheck } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/contexts/ToastContext'
import {
  listAllBuyers,
  listAllSellers,
  setUserSuspension,
} from '@/lib/api/admin'
import { mockOrders } from '@/data/mock/orders'
import { mockPublications } from '@/data/mock/publications'
import { subscriptionLabel } from '@/lib/utils'
import { Buyer, Seller, SubscriptionPlan } from '@/types'

type TabKey = 'sellers' | 'buyers'

interface SuspendTarget {
  id: string
  name: string
  suspended: boolean
  isSeller: boolean
}

const PLAN_BADGE_VARIANT: Record<SubscriptionPlan, 'default' | 'success' | 'primary'> = {
  none: 'default',
  semilla: 'success',
  cosecha: 'primary',
  exportacion: 'primary',
}

export default function AdminUsuariosPage() {
  const { showSuccess, showError } = useToast()
  const [tab, setTab] = useState<TabKey>('sellers')
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState<SuspendTarget | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const [b, s] = await Promise.all([listAllBuyers(), listAllSellers()])
      setBuyers(b)
      setSellers(s)
    } catch {
      showError('No pudimos cargar los usuarios', 'Recarga la página')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const publicationsBySeller = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of mockPublications) {
      if (p.status !== 'active') continue
      map.set(p.sellerId, (map.get(p.sellerId) ?? 0) + 1)
    }
    return map
  }, [])

  const ordersByBuyer = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of mockOrders) {
      map.set(o.buyerId, (map.get(o.buyerId) ?? 0) + 1)
    }
    return map
  }, [])

  const filteredSellers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sellers
    return sellers.filter(
      (s) =>
        s.businessName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    )
  }, [sellers, query])

  const filteredBuyers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return buyers
    return buyers.filter(
      (b) => b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)
    )
  }, [buyers, query])

  async function confirmSuspension() {
    if (!target) return
    try {
      await setUserSuspension(target.id, !target.suspended)
      showSuccess(
        !target.suspended ? 'Usuario suspendido' : 'Usuario reactivado',
        target.name
      )
      await refresh()
    } catch {
      showError('No pudimos actualizar el usuario', 'Inténtalo de nuevo')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Gestiona vendedores y compradores de la plataforma.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs<TabKey>
          variant="pills"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'sellers', label: 'Vendedores', count: sellers.length },
            { value: 'buyers', label: 'Compradores', count: buyers.length },
          ]}
        />

        <div className="sm:w-72">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            leadingIcon={<Search size={18} strokeWidth={1.5} />}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : tab === 'sellers' ? (
          filteredSellers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title={sellers.length === 0 ? 'Sin vendedores' : 'Sin resultados'}
                description={
                  sellers.length === 0
                    ? 'No hay vendedores registrados en la plataforma.'
                    : 'Ningún vendedor coincide con tu búsqueda.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Vendedor</th>
                    <th className="px-4 py-3">Departamento</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3 text-center">Publicaciones</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredSellers.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={s.logo}
                            alt={s.businessName}
                            fallback={s.businessName}
                            size="sm"
                            square
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-neutral-900">
                              {s.businessName}
                            </p>
                            <p className="truncate text-xs text-neutral-500">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {s.department ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={PLAN_BADGE_VARIANT[s.subscriptionPlan]}>
                          {subscriptionLabel(s.subscriptionPlan)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-neutral-900">
                        {publicationsBySeller.get(s.id) ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        {s.suspended ? (
                          <Badge variant="error">Suspendido</Badge>
                        ) : (
                          <Badge variant="success">Activo</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/vendedor/${s.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-200 px-2.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                          >
                            <ExternalLink size={14} strokeWidth={1.5} />
                            Ver
                          </Link>
                          <Button
                            size="sm"
                            variant={s.suspended ? 'primary' : 'destructive'}
                            onClick={() =>
                              setTarget({
                                id: s.id,
                                name: s.businessName,
                                suspended: !!s.suspended,
                                isSeller: true,
                              })
                            }
                            leadingIcon={
                              s.suspended ? (
                                <ShieldCheck size={14} strokeWidth={1.5} />
                              ) : (
                                <ShieldOff size={14} strokeWidth={1.5} />
                              )
                            }
                          >
                            {s.suspended ? 'Reactivar' : 'Suspender'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredBuyers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={buyers.length === 0 ? 'Sin compradores' : 'Sin resultados'}
              description={
                buyers.length === 0
                  ? 'No hay compradores registrados en la plataforma.'
                  : 'Ningún comprador coincide con tu búsqueda.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Comprador</th>
                  <th className="px-4 py-3">Departamento</th>
                  <th className="px-4 py-3 text-center">Pedidos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredBuyers.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={b.avatar}
                          alt={b.name}
                          fallback={b.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-900">
                            {b.name}
                          </p>
                          <p className="truncate text-xs text-neutral-500">
                            {b.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {b.department ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-neutral-900">
                      {ordersByBuyer.get(b.id) ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {b.suspended ? (
                        <Badge variant="error">Suspendido</Badge>
                      ) : (
                        <Badge variant="success">Activo</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={b.suspended ? 'primary' : 'destructive'}
                        onClick={() =>
                          setTarget({
                            id: b.id,
                            name: b.name,
                            suspended: !!b.suspended,
                            isSeller: false,
                          })
                        }
                        leadingIcon={
                          b.suspended ? (
                            <ShieldCheck size={14} strokeWidth={1.5} />
                          ) : (
                            <ShieldOff size={14} strokeWidth={1.5} />
                          )
                        }
                      >
                        {b.suspended ? 'Reactivar' : 'Suspender'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={confirmSuspension}
        title={
          target?.suspended
            ? 'Reactivar usuario'
            : `Suspender ${target?.isSeller ? 'vendedor' : 'comprador'}`
        }
        description={
          target?.suspended
            ? `${target.name} podrá volver a operar normalmente.`
            : `${target?.name ?? ''} perderá acceso a la plataforma hasta que sea reactivado.`
        }
        confirmLabel={target?.suspended ? 'Reactivar' : 'Suspender'}
        variant={target?.suspended ? 'primary' : 'destructive'}
      />
    </div>
  )
}
