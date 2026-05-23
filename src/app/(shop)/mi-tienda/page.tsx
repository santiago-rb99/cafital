'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Clock,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { CafeEvent, Order, Publication, Seller } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

import { useAuth } from '@/contexts/AuthContext'
import { listOrdersBySeller } from '@/lib/api/orders'
import { listPublicationsBySeller } from '@/lib/api/publications'
import { listEventsByOrganizer } from '@/lib/api/events'
import { formatDate, formatDateShort, formatPrice, subscriptionLabel } from '@/lib/utils'

interface DashboardData {
  orders: Order[]
  publications: Publication[]
  events: CafeEvent[]
}

export default function MiTiendaPage() {
  const { user, isHydrated } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  // Reset data si cambia el seller (patrón "state from prop")
  const [trackedSellerId, setTrackedSellerId] = useState<string | null>(null)
  if (user?.id !== trackedSellerId) {
    setTrackedSellerId(user?.id ?? null)
    setData(null)
  }

  useEffect(() => {
    if (!user || user.role !== 'seller') return
    let cancelled = false
    Promise.all([
      listOrdersBySeller(user.id),
      listPublicationsBySeller(user.id, { includeAllStatuses: true }),
      listEventsByOrganizer(user.id, { includeAllStatuses: true }),
    ]).then(([orders, publications, events]) => {
      if (!cancelled) setData({ orders, publications, events })
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const stats = useMemo(() => {
    if (!data) return null
    const last30Iso = new Date()
    last30Iso.setDate(last30Iso.getDate() - 30)
    const last30 = last30Iso.toISOString()

    const recent = data.orders.filter((o) => o.createdAt >= last30)
    const revenue = recent.reduce((sum, o) => sum + o.total, 0)
    const pending = data.orders.filter((o) => o.status === 'pending').length
    const inProcess = data.orders.filter((o) => o.status === 'in_process').length
    const activePubs = data.publications.filter((p) => p.status === 'active').length
    const draftPubs = data.publications.filter((p) => p.status === 'draft').length
    const pausedPubs = data.publications.filter((p) => p.status === 'paused').length

    const today = new Date().toISOString().slice(0, 10)
    const upcomingEvents = data.events
      .filter((e) => e.status === 'active' && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)

    const recentOrders = [...data.orders].slice(0, 5)

    return {
      revenue,
      revenueOrders: recent.length,
      pending,
      inProcess,
      activePubs,
      draftPubs,
      pausedPubs,
      upcomingEvents,
      recentOrders,
    }
  }, [data])

  if (!isHydrated || !data || !stats) {
    return <DashboardSkeleton />
  }

  const seller = user as Seller

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Hola, {seller.businessName}
          </h1>
          <p className="text-sm text-neutral-500">
            Resumen de tu tienda en los últimos 30 días.
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

      {/* PLAN ACTUAL */}
      <SubscriptionStatusCard seller={seller} />

      {/* KPIs */}
      <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ventas del período"
          value={formatPrice(stats.revenue)}
          subtitle={
            stats.revenueOrders === 0
              ? 'Sin pedidos en 30 días'
              : `${stats.revenueOrders} ${stats.revenueOrders === 1 ? 'pedido' : 'pedidos'}`
          }
          Icon={TrendingUp}
        />
        <KpiCard
          title="Pendientes"
          value={String(stats.pending)}
          subtitle="Esperan tu confirmación"
          Icon={Clock}
          href="/mi-tienda/pedidos?status=pending"
        />
        <KpiCard
          title="En proceso"
          value={String(stats.inProcess)}
          subtitle="Pedidos en preparación"
          Icon={ShoppingBag}
          href="/mi-tienda/pedidos?status=in_process"
        />
        <KpiCard
          title="Publicaciones activas"
          value={String(stats.activePubs)}
          subtitle={
            stats.pausedPubs + stats.draftPubs === 0
              ? 'Todas en línea'
              : `${stats.pausedPubs} pausadas · ${stats.draftPubs} borradores`
          }
          Icon={Package}
          href="/mi-tienda/publicaciones"
        />
      </ul>

      {/* PEDIDOS RECIENTES */}
      <section
        aria-labelledby="recent-orders-heading"
        className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
      >
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4">
          <h2
            id="recent-orders-heading"
            className="font-serif text-lg font-semibold text-neutral-900"
          >
            Pedidos recientes
          </h2>
          <Link
            href="/mi-tienda/pedidos"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 transition-colors hover:text-primary-700 focus:outline-none focus-visible:underline"
          >
            Ver todos
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
          </Link>
        </header>

        {stats.recentOrders.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<ShoppingBag size={28} strokeWidth={1.5} />}
              title="Aún sin pedidos"
              description="Cuando recibas tu primer pedido aparecerá aquí."
            />
          </div>
        ) : (
          <ul role="list" className="divide-y divide-neutral-200">
            {stats.recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/pedido/${order.id}`}
                  className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:bg-neutral-100"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      Pedido {order.id.slice(-8)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDateShort(order.createdAt)} ·{' '}
                      {order.items.length}{' '}
                      {order.items.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums text-neutral-900">
                      {formatPrice(order.total)}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* EVENTOS PRÓXIMOS */}
      {stats.upcomingEvents.length > 0 && (
        <section
          aria-labelledby="upcoming-events-heading"
          className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
          <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-6 py-4">
            <h2
              id="upcoming-events-heading"
              className="font-serif text-lg font-semibold text-neutral-900"
            >
              Mis próximos eventos
            </h2>
            <Link
              href="/mi-tienda/eventos"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 transition-colors hover:text-primary-700 focus:outline-none focus-visible:underline"
            >
              Ver todos
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
            </Link>
          </header>
          <ul role="list" className="divide-y divide-neutral-200">
            {stats.upcomingEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/eventos/${event.id}`}
                  className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:bg-neutral-100"
                >
                  <Calendar
                    size={18}
                    strokeWidth={1.5}
                    className="shrink-0 text-neutral-500"
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="line-clamp-1 text-sm font-medium text-neutral-900">
                      {event.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDateShort(event.date)} · {event.startTime} ·{' '}
                      {event.registeredCount}
                      {event.capacity ? ` / ${event.capacity}` : ''} inscritos
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="shrink-0 text-neutral-300"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function KpiCard({
  title,
  value,
  subtitle,
  Icon,
  href,
}: {
  title: string
  value: string
  subtitle: string
  Icon: typeof TrendingUp
  href?: string
}) {
  const inner = (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {title}
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
          <Icon size={18} strokeWidth={1.5} aria-hidden />
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="font-serif text-2xl font-semibold tabular-nums text-neutral-900">
          {value}
        </p>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className="block focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          {inner}
        </Link>
      </li>
    )
  }
  return <li>{inner}</li>
}

function SubscriptionStatusCard({ seller }: { seller: Seller }) {
  const isFree = seller.subscriptionPlan === 'none'
  return (
    <section
      aria-labelledby="subscription-status-heading"
      className={
        isFree
          ? 'rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6'
          : 'rounded-2xl border border-primary-300 bg-primary-50 p-5 shadow-sm sm:p-6'
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={
              isFree
                ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500'
                : 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-300 text-primary-900'
            }
          >
            <Sparkles size={20} strokeWidth={1.5} aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h2
              id="subscription-status-heading"
              className={
                isFree
                  ? 'text-sm font-semibold text-neutral-900'
                  : 'text-sm font-semibold text-primary-700'
              }
            >
              {isFree
                ? 'Estás en el plan gratuito'
                : `Plan actual: ${subscriptionLabel(seller.subscriptionPlan)}`}
            </h2>
            <p
              className={
                isFree
                  ? 'text-sm text-neutral-500'
                  : 'text-sm text-primary-700/80'
              }
            >
              {isFree
                ? 'Activa un plan para aparecer en el hero, en destacados y desbloquear secciones premium.'
                : seller.subscriptionExpiry
                  ? `Próxima renovación: ${formatDate(seller.subscriptionExpiry)}`
                  : 'Renovación mensual automática.'}
            </p>
          </div>
        </div>
        <Link
          href="/mi-tienda/planes"
          className={
            isFree
              ? 'inline-flex h-10 items-center gap-2 self-start rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:self-auto'
              : 'inline-flex h-10 items-center gap-2 self-start rounded-lg border border-primary-500 bg-white px-4 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:self-auto'
          }
        >
          {isFree ? 'Ver planes' : 'Cambiar plan'}
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44" rounded="md" />
      </header>

      {/* Plan banner */}
      <Skeleton className="h-24 w-full" rounded="xl" />

      {/* KPIs */}
      <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-32 w-full" rounded="xl" />
          </li>
        ))}
      </ul>

      {/* Pedidos recientes */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Skeleton className="mb-4 h-5 w-40" />
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10" rounded="md" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-16" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
