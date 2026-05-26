'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

import { Check } from 'lucide-react'

import { Order, OrderStatus } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { Select } from '@/components/ui/Select'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { listOrdersBySeller, updateOrderStatus } from '@/lib/api/orders'
import { cn, formatDateShort, formatPrice } from '@/lib/utils'

type FilterValue = 'all' | OrderStatus

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'in_process', label: 'En proceso' },
  { value: 'completed', label: 'Completados' },
]

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_process', label: 'En proceso' },
  { value: 'completed', label: 'Completado' },
]

export default function MiTiendaPedidosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="md" />
        </div>
      }
    >
      <PedidosInner />
    </Suspense>
  )
}

function isFilterValue(value: string | null): value is FilterValue {
  return value === 'all' || value === 'pending' || value === 'in_process' || value === 'completed'
}

function PedidosInner() {
  const { user, isHydrated } = useAuth()
  const { showSuccess, showError } = useToast()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const initialFilter = searchParams.get('status')
  const [filter, setFilter] = useState<FilterValue>(
    isFilterValue(initialFilter) ? initialFilter : 'all'
  )
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Reset al cambiar de seller (patrón "state from prop").
  const [trackedSellerId, setTrackedSellerId] = useState<string | null>(null)
  if (user?.id !== trackedSellerId) {
    setTrackedSellerId(user?.id ?? null)
    setOrders(null)
  }

  const reload = useCallback(() => {
    if (!user || user.role !== 'seller') return
    listOrdersBySeller(user.id).then(setOrders)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

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

  const visible = useMemo(
    () => {
      const list = orders ?? []
      return filter === 'all' ? list : list.filter((o) => o.status === filter)
    },
    [filter, orders]
  )

  async function onStatusChange(order: Order, next: OrderStatus) {
    if (next === order.status) return
    setUpdatingId(order.id)
    try {
      const updated = await updateOrderStatus(order.id, next)
      setOrders((prev) => (prev ?? []).map((o) => (o.id === order.id ? updated : o)))
      showSuccess(
        'Estado actualizado',
        `Pedido ${order.id.slice(-8)} marcado como ${labelFor(next)}.`
      )
    } catch {
      showError('No pudimos actualizar el estado')
    } finally {
      setUpdatingId(null)
    }
  }

  if (!isHydrated || orders === null) {
    return <OrdersListSkeleton title="Pedidos recibidos" />
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Pedidos recibidos
        </h1>
        <p className="text-sm text-neutral-500">
          Gestiona y actualiza el estado de cada pedido.
        </p>
      </header>

      {orders.length > 0 && (
        <div
          role="tablist"
          aria-label="Filtrar pedidos por estado"
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

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={28} strokeWidth={1.5} />}
          title="Aún no recibes pedidos"
          description="Cuando un comprador realice un pedido de tus publicaciones aparecerá aquí."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={28} strokeWidth={1.5} />}
          title="Sin pedidos en este estado"
          description="Cambia el filtro para ver otros pedidos."
        />
      ) : (
        <>
          {/* MOBILE: cards apiladas */}
          <ul role="list" className="flex flex-col gap-3 md:hidden">
            {visible.map((order) => (
              <li key={order.id}>
                <OrderMobileCard
                  order={order}
                  updating={updatingId === order.id}
                  onChangeStatus={(s) => onStatusChange(order, s)}
                />
              </li>
            ))}
          </ul>

          {/* DESKTOP: tabla real */}
          <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-100/60 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Pedido
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Productos
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Cliente
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Fecha
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Total
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {visible.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-neutral-900">
                        #{order.id.slice(-8)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {order.items[0] && (
                          <span className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                            <Image
                              src={order.items[0].photo}
                              alt={order.items[0].publicationTitle}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm text-neutral-900">
                            {order.items[0]?.publicationTitle ?? '—'}
                          </p>
                          {order.items.length > 1 && (
                            <p className="text-xs text-neutral-500">
                              y {order.items.length - 1} más
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {order.shippingAddress ? (
                        <div className="flex flex-col">
                          <p className="line-clamp-1 text-sm font-medium text-neutral-900">
                            {order.shippingAddress.fullName}
                          </p>
                          <p className="line-clamp-1 text-xs text-neutral-500">
                            {order.shippingAddress.city},{' '}
                            {order.shippingAddress.department}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-300">
                          Sin envío físico
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-500">
                      {formatDateShort(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-neutral-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} size="sm" />
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(order, 'in_process')}
                            disabled={updatingId === order.id}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-300 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={14} strokeWidth={2} aria-hidden />
                            Confirmar
                          </button>
                        )}
                        <Select
                          value={order.status}
                          onChange={(e) =>
                            onStatusChange(order, e.target.value as OrderStatus)
                          }
                          disabled={updatingId === order.id}
                          options={STATUS_OPTIONS}
                          aria-label={`Cambiar estado del pedido ${order.id.slice(-8)}`}
                          containerClassName="h-9! min-w-[160px]!"
                          className="text-[13px]!"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function labelFor(status: OrderStatus): string {
  if (status === 'pending') return 'Pendiente'
  if (status === 'in_process') return 'En proceso'
  return 'Completado'
}

function OrderMobileCard({
  order,
  updating,
  onChangeStatus,
}: {
  order: Order
  updating: boolean
  onChangeStatus: (status: OrderStatus) => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Pedido #{order.id.slice(-8)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatDateShort(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} size="sm" />
      </header>

      {order.items[0] && (
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-100/50 p-2">
          <span className="relative aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white">
            <Image
              src={order.items[0].photo}
              alt={order.items[0].publicationTitle}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium text-neutral-900">
              {order.items[0].publicationTitle}
            </p>
            {order.items.length > 1 && (
              <p className="text-xs text-neutral-500">
                y {order.items.length - 1} más
              </p>
            )}
          </div>
        </div>
      )}

      {order.shippingAddress && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Cliente
          </span>
          <p className="text-sm font-medium text-neutral-900">
            {order.shippingAddress.fullName}
          </p>
          <p className="text-xs text-neutral-500">
            {order.shippingAddress.address}, {order.shippingAddress.city}
          </p>
        </div>
      )}

      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500">Total</span>
          <span className="text-base font-semibold tabular-nums text-neutral-900">
            {formatPrice(order.total)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-500">Estado</span>
          <Select
            value={order.status}
            onChange={(e) => onChangeStatus(e.target.value as OrderStatus)}
            disabled={updating}
            options={STATUS_OPTIONS}
            aria-label={`Cambiar estado del pedido ${order.id.slice(-8)}`}
            containerClassName="h-9! min-w-[160px]!"
            className="text-[13px]!"
          />
        </div>
      </div>

      {order.status === 'pending' && (
        <button
          type="button"
          onClick={() => onChangeStatus('in_process')}
          disabled={updating}
          className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={16} strokeWidth={2} aria-hidden />
          Confirmar pedido
        </button>
      )}
    </article>
  )
}

function OrdersListSkeleton({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
          {title}
        </h1>
        <Skeleton className="h-4 w-72 max-w-full" />
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0" rounded="md" />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <ul className="divide-y divide-neutral-200">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-10 w-10 shrink-0" rounded="md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-40" rounded="md" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
