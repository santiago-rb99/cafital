'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Package } from 'lucide-react'

import { Order, OrderStatus } from '@/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { OrderCardSkeleton } from '@/components/ui/SkeletonPatterns'
import { Skeleton } from '@/components/ui/Skeleton'
import { OrderCard } from '@/components/orders/OrderCard'

import { useAuth } from '@/contexts/AuthContext'
import { listOrdersByBuyer } from '@/lib/api/orders'
import { cn } from '@/lib/utils'

type FilterValue = 'all' | OrderStatus

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'in_process', label: 'En proceso' },
  { value: 'completed', label: 'Completados' },
]

export default function PedidosPage() {
  const { user, isHydrated } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [filter, setFilter] = useState<FilterValue>('all')

  // Reset cuando cambia el usuario.
  const [trackedUserId, setTrackedUserId] = useState<string | null>(null)
  if (user?.id !== trackedUserId) {
    setTrackedUserId(user?.id ?? null)
    setOrders(null)
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    listOrdersByBuyer(user.id).then((data) => {
      if (!cancelled) setOrders(data)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const loading = user !== null && orders === null

  const counts = useMemo(() => {
    const list = orders ?? []
    const c: Record<FilterValue, number> = {
      all: list.length,
      pending: 0,
      in_process: 0,
      completed: 0,
    }
    for (const o of list) c[o.status]++
    return c
  }, [orders])

  const filtered = useMemo(
    () => {
      const list = orders ?? []
      return filter === 'all' ? list : list.filter((o) => o.status === filter)
    },
    [filter, orders]
  )

  if (!isHydrated || loading) {
    return (
      <div className="bg-page">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mb-6 flex flex-col gap-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0" rounded="md" />
            ))}
          </div>
          <ul role="list" className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i}>
                <OrderCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs items={[{ label: 'Mis pedidos' }]} className="mb-5" />

        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Mis pedidos
          </h1>
          <p className="text-sm text-neutral-500">
            Historial de compras realizadas en Cafital.
          </p>
        </header>

        {(orders?.length ?? 0) > 0 && (
          <div
            role="tablist"
            aria-label="Filtrar por estado"
            className="mb-6 flex gap-2 overflow-x-auto pb-1"
          >
            {FILTERS.map((f) => {
              const active = filter === f.value
              const count = counts[f.value]
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
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {(orders?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Package size={28} strokeWidth={1.5} />}
            title="No tienes pedidos todavía"
            description="Explora el catálogo y haz tu primera compra."
            action={
              <Link
                href="/catalogo"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
              >
                Ver catálogo
              </Link>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Package size={28} strokeWidth={1.5} />}
            title="Sin pedidos en este estado"
            description="Cambia el filtro para ver otros pedidos."
          />
        ) : (
          <ul role="list" className="flex flex-col gap-4">
            {filtered.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
