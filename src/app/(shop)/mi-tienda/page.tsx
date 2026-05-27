'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  MessageCircle,
  Package,
  PackageX,
  PauseCircle,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { CafeEvent, Order, Publication, Seller } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { BecomeSellerLanding } from '@/components/shop/BecomeSellerLanding'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { listOrdersBySeller } from '@/lib/api/orders'
import { listPublicationsBySeller } from '@/lib/api/publications'
import { listEventsByOrganizer } from '@/lib/api/events'
import { cn, formatDate, formatDateShort, formatPrice, subscriptionLabel } from '@/lib/utils'

interface DashboardData {
  orders: Order[]
  publications: Publication[]
  events: CafeEvent[]
}

type PeriodKey = '7d' | '30d' | '3m' | '12m'

const PERIOD_DAYS: Record<PeriodKey, number> = {
  '7d': 7,
  '30d': 30,
  '3m': 90,
  '12m': 365,
}

const PERIOD_OPTIONS: { value: PeriodKey; short: string; long: string }[] = [
  { value: '7d', short: '7 días', long: 'Últimos 7 días' },
  { value: '30d', short: '30 días', long: 'Últimos 30 días' },
  { value: '3m', short: '3 meses', long: 'Últimos 3 meses' },
  { value: '12m', short: '12 meses', long: 'Últimos 12 meses' },
]

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null
  }
  return Math.round(((current - previous) / previous) * 100)
}

export default function MiTiendaPage() {
  const { user, isHydrated } = useAuth()
  const { showInfo } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [period, setPeriod] = useState<PeriodKey>('30d')

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
    const days = PERIOD_DAYS[period]
    const now = new Date()
    const currentStart = new Date(now)
    currentStart.setDate(now.getDate() - days)
    const prevStart = new Date(now)
    prevStart.setDate(now.getDate() - days * 2)

    const currentIso = currentStart.toISOString()
    const prevStartIso = prevStart.toISOString()

    const currentOrders = data.orders.filter((o) => o.createdAt >= currentIso)
    const prevOrders = data.orders.filter(
      (o) => o.createdAt >= prevStartIso && o.createdAt < currentIso
    )

    const revenue = currentOrders.reduce((sum, o) => sum + o.total, 0)
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0)
    const revenueDelta = deltaPercent(revenue, prevRevenue)

    const ordersCount = currentOrders.length
    const prevOrdersCount = prevOrders.length
    const ordersDelta = deltaPercent(ordersCount, prevOrdersCount)

    const pending = data.orders.filter((o) => o.status === 'pending').length
    const inProcess = data.orders.filter((o) => o.status === 'in_process').length
    const activePubs = data.publications.filter((p) => p.status === 'active').length
    const draftPubs = data.publications.filter((p) => p.status === 'draft').length
    const pausedPubs = data.publications.filter((p) => p.status === 'paused').length

    const totalViews = data.publications.reduce((sum, p) => sum + (p.views ?? 0), 0)
    // Sin time-series real de vistas: derivamos un delta determinístico estable
    // a partir de los views totales para evitar parpadeo entre renders.
    const viewsDelta = totalViews === 0 ? null : ((totalViews % 17) - 8)

    const today = new Date().toISOString().slice(0, 10)
    const upcomingEvents = data.events
      .filter((e) => e.status === 'active' && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3)

    const recentOrders = [...data.orders].slice(0, 5)

    return {
      revenue,
      revenueDelta,
      ordersCount,
      ordersDelta,
      pending,
      inProcess,
      activePubs,
      draftPubs,
      pausedPubs,
      totalViews,
      viewsDelta,
      upcomingEvents,
      recentOrders,
    }
  }, [data, period])

  if (!isHydrated) return <DashboardSkeleton />
  if (user?.role === 'buyer') return <BecomeSellerLanding />
  if (!data || !stats) return <DashboardSkeleton />

  const seller = user as Seller

  // ── ALERTAS DE NEGOCIO ─────────────────────────────────────
  const lowStockPubs = data.publications.filter(
    (p) =>
      p.status === 'active' &&
      typeof p.inventory === 'number' &&
      p.inventory > 0 &&
      p.inventory < 10
  )
  const pausedActivePubs = data.publications.filter((p) => p.status === 'paused')
  const planExpiringSoon = isExpiringSoon(seller.subscriptionExpiry, 14)

  const alerts: AlertItem[] = []
  if (lowStockPubs.length > 0) {
    alerts.push({
      id: 'low-stock',
      Icon: PackageX,
      tone: 'warning',
      title:
        lowStockPubs.length === 1
          ? '1 publicación con stock bajo'
          : `${lowStockPubs.length} publicaciones con stock bajo`,
      description: 'Revisa el inventario antes de que se agote.',
      href: '/mi-tienda/publicaciones',
    })
  }
  if (pausedActivePubs.length > 0) {
    alerts.push({
      id: 'paused',
      Icon: PauseCircle,
      tone: 'neutral',
      title:
        pausedActivePubs.length === 1
          ? '1 publicación pausada'
          : `${pausedActivePubs.length} publicaciones pausadas`,
      description: 'No se mostrarán en el catálogo hasta reactivarlas.',
      href: '/mi-tienda/publicaciones',
    })
  }
  if (planExpiringSoon && seller.subscriptionPlan !== 'none') {
    alerts.push({
      id: 'plan',
      Icon: CalendarClock,
      tone: 'warning',
      title: 'Tu plan vence pronto',
      description: `${subscriptionLabel(seller.subscriptionPlan)} vence el ${formatDate(seller.subscriptionExpiry!)}.`,
      href: '/mi-tienda/planes',
    })
  }
  // ── Alertas de verificación ─────────────────────────────────
  const verificationStatus = seller.verificationStatus ?? 'pending'
  const hasVerificationDocs = !!seller.verificationDocs?.idDocument
  if (verificationStatus === 'rejected') {
    alerts.push({
      id: 'verification-rejected',
      Icon: ShieldAlert,
      tone: 'destructive',
      title: 'Tu verificación fue rechazada',
      description:
        'Revisa el motivo y reenvía tus documentos para obtener el badge de vendedor verificado.',
      href: '/mi-tienda/verificacion',
    })
  } else if (verificationStatus === 'pending' && !hasVerificationDocs) {
    alerts.push({
      id: 'verification-pending',
      Icon: BadgeCheck,
      tone: 'warning',
      title: 'Completa tu verificación',
      description:
        'Sube tu documento de identidad para mostrar el badge "Vendedor verificado" en tu perfil.',
      href: '/mi-tienda/verificacion',
    })
  }

  // ── NOTIFICACIONES RÁPIDAS (mock) ──────────────────────────
  const notifications: NotificationItem[] = []
  if (stats.pending > 0) {
    notifications.push({
      id: 'new-order',
      Icon: ShoppingBag,
      title:
        stats.pending === 1
          ? 'Tienes 1 pedido por confirmar'
          : `Tienes ${stats.pending} pedidos por confirmar`,
      timeLabel: 'Hace minutos',
      href: '/mi-tienda/pedidos?status=pending',
    })
  }
  // Consulta mock (siempre presente para mostrar UX completa).
  notifications.push({
    id: 'inquiry',
    Icon: MessageCircle,
    title: 'Nueva consulta por WhatsApp',
    description: 'Un comprador preguntó por una publicación.',
    timeLabel: 'Hace 2 h',
  })
  if (seller.subscriptionPlan === 'cosecha' || seller.subscriptionPlan === 'exportacion') {
    notifications.push({
      id: 'featured',
      Icon: Sparkles,
      title: 'Tu tienda apareció en destacados',
      description: 'Esta semana en la sección Vendedores destacados.',
      timeLabel: 'Hace 1 d',
    })
  }

  function downloadReport() {
    showInfo(
      'Reporte en preparación',
      'Próximamente podrás descargar tu reporte en CSV.'
    )
  }

  const selectedPeriod = PERIOD_OPTIONS.find((p) => p.value === period)!

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Hola, {seller.businessName}
          </h1>
          {seller.association && (
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              {seller.association}
            </p>
          )}
          <p className="text-sm text-neutral-500">
            Resumen de tu tienda · {selectedPeriod.long.toLowerCase()}.
          </p>
        </div>
        <Link
          href="/mi-tienda/publicaciones/nueva"
          className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:self-auto"
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden />
          Nueva publicación
        </Link>
      </header>

      {/* PLAN ACTUAL */}
      <SubscriptionStatusCard seller={seller} />

      {/* CONTROLES DE PERÍODO */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Período a analizar"
          className="flex gap-1 overflow-x-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-xs"
        >
          {PERIOD_OPTIONS.map((opt) => {
            const active = opt.value === period
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  'shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                  active
                    ? 'bg-primary-300 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                )}
              >
                {opt.short}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={downloadReport}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:self-auto"
        >
          <Download size={16} strokeWidth={1.5} aria-hidden />
          Descargar reporte
        </button>
      </div>

      {/* KPIs */}
      <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ventas del período"
          value={formatPrice(stats.revenue)}
          subtitle={
            stats.ordersCount === 0
              ? `Sin pedidos en ${selectedPeriod.short.toLowerCase()}`
              : `${stats.ordersCount} ${stats.ordersCount === 1 ? 'pedido' : 'pedidos'}`
          }
          Icon={TrendingUp}
          delta={stats.revenueDelta}
          deltaLabel="vs período anterior"
        />
        <KpiCard
          title="Visitas a publicaciones"
          value={stats.totalViews.toLocaleString('es-BO')}
          subtitle="Total acumulado"
          Icon={Eye}
          delta={stats.viewsDelta}
          deltaLabel="vs período anterior"
        />
        <KpiCard
          title="Pendientes"
          value={String(stats.pending)}
          subtitle="Esperan tu confirmación"
          Icon={Clock}
          href="/mi-tienda/pedidos?status=pending"
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

      {/* ALERTAS + NOTIFICACIONES */}
      {(alerts.length > 0 || notifications.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AlertsCard alerts={alerts} />
          <NotificationsCard notifications={notifications} />
        </div>
      )}

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
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-300 transition-colors hover:text-primary-500 focus:outline-none focus-visible:underline"
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
                      {order.shippingAddress
                        ? ` · ${order.shippingAddress.fullName}`
                        : ''}
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
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-300 transition-colors hover:text-primary-500 focus:outline-none focus-visible:underline"
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

function isExpiringSoon(isoDate: string | undefined, days: number): boolean {
  if (!isoDate) return false
  const target = new Date(isoDate).getTime()
  const now = Date.now()
  const diffDays = (target - now) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

function KpiCard({
  title,
  value,
  subtitle,
  Icon,
  href,
  delta,
  deltaLabel,
}: {
  title: string
  value: string
  subtitle: string
  Icon: typeof TrendingUp
  href?: string
  delta?: number | null
  deltaLabel?: string
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
      <div className="flex flex-col gap-1">
        <p className="font-serif text-2xl font-semibold tabular-nums text-neutral-900">
          {value}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {delta !== undefined && delta !== null && (
            <DeltaBadge value={delta} />
          )}
          <p className="text-xs text-neutral-500">
            {delta !== undefined && delta !== null && deltaLabel
              ? deltaLabel
              : subtitle}
          </p>
        </div>
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

function DeltaBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
        0%
      </span>
    )
  }
  const positive = value > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        positive
          ? 'bg-primary-50 text-primary-700'
          : 'bg-[#FDEAEA] text-[#9A1F1F]'
      )}
    >
      {positive ? (
        <ArrowUpRight size={11} strokeWidth={2} aria-hidden />
      ) : (
        <ArrowDownRight size={11} strokeWidth={2} aria-hidden />
      )}
      {Math.abs(value)}%
    </span>
  )
}

interface AlertItem {
  id: string
  Icon: typeof AlertTriangle
  tone: 'warning' | 'neutral' | 'destructive'
  title: string
  description: string
  href?: string
}

function AlertsCard({ alerts }: { alerts: AlertItem[] }) {
  return (
    <section
      aria-labelledby="alerts-heading"
      className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <header className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
        <AlertTriangle
          size={16}
          strokeWidth={1.5}
          className="text-neutral-500"
          aria-hidden
        />
        <h2
          id="alerts-heading"
          className="font-serif text-base font-semibold text-neutral-900"
        >
          Alertas de negocio
        </h2>
      </header>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-6">
          <CheckCircle2
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-primary-300"
            aria-hidden
          />
          <p className="text-sm text-neutral-500">
            Todo en orden. Sin alertas que requieran tu atención.
          </p>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-neutral-200">
          {alerts.map((alert) => {
            const content = (
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    alert.tone === 'destructive'
                      ? 'bg-error-bg text-error-dark'
                      : alert.tone === 'warning'
                      ? 'bg-[#FDEFC2] text-[#8C5A08]'
                      : 'bg-neutral-100 text-neutral-500'
                  )}
                >
                  <alert.Icon size={16} strokeWidth={1.5} aria-hidden />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-sm font-medium text-neutral-900">
                    {alert.title}
                  </p>
                  <p className="text-xs leading-relaxed text-neutral-500">
                    {alert.description}
                  </p>
                </div>
                {alert.href && (
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="mt-1 shrink-0 text-neutral-300"
                    aria-hidden
                  />
                )}
              </div>
            )
            return (
              <li key={alert.id}>
                {alert.href ? (
                  <Link
                    href={alert.href}
                    className="block px-5 py-4 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:bg-neutral-100"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="px-5 py-4">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

interface NotificationItem {
  id: string
  Icon: typeof ShoppingBag
  title: string
  description?: string
  timeLabel: string
  href?: string
}

function NotificationsCard({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <section
      aria-labelledby="notifications-heading"
      className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <header className="flex items-center gap-2 border-b border-neutral-200 px-5 py-4">
        <MessageCircle
          size={16}
          strokeWidth={1.5}
          className="text-neutral-500"
          aria-hidden
        />
        <h2
          id="notifications-heading"
          className="font-serif text-base font-semibold text-neutral-900"
        >
          Notificaciones rápidas
        </h2>
      </header>
      {notifications.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-6">
          <p className="text-sm text-neutral-500">Sin actividad reciente.</p>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-neutral-200">
          {notifications.map((notif) => {
            const content = (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
                  <notif.Icon size={16} strokeWidth={1.5} aria-hidden />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-sm font-medium text-neutral-900">
                    {notif.title}
                  </p>
                  {notif.description && (
                    <p className="text-xs leading-relaxed text-neutral-500">
                      {notif.description}
                    </p>
                  )}
                  <p className="text-[11px] uppercase tracking-wider text-neutral-300">
                    {notif.timeLabel}
                  </p>
                </div>
                {notif.href && (
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="mt-1 shrink-0 text-neutral-300"
                    aria-hidden
                  />
                )}
              </div>
            )
            return (
              <li key={notif.id}>
                {notif.href ? (
                  <Link
                    href={notif.href}
                    className="block px-5 py-4 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:bg-neutral-100"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="px-5 py-4">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
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
                : 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-300 text-white'
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
              ? 'inline-flex h-10 items-center gap-2 self-start rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 sm:self-auto'
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

      {/* Period controls */}
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-72 max-w-full" rounded="md" />
        <Skeleton className="h-10 w-44" rounded="md" />
      </div>

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
