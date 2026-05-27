'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar,
  DollarSign,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react'

import { ConversionFunnel } from '@/components/admin/ConversionFunnel'
import { DeltaBadge } from '@/components/admin/DeltaBadge'
import { PeriodSelector } from '@/components/admin/PeriodSelector'
import { StatCard } from '@/components/admin/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/contexts/ToastContext'
import {
  ADMIN_PERIOD_LABEL,
  getAdminStats,
  type AdminPeriodKey,
  type AdminStats,
} from '@/lib/api/admin'
import { formatDateShort, formatPrice, subscriptionLabel } from '@/lib/utils'

const VALID_PERIODS: AdminPeriodKey[] = ['7d', '30d', '90d', 'mtd']

function parsePeriod(raw: string | null): AdminPeriodKey {
  if (raw && (VALID_PERIODS as string[]).includes(raw)) {
    return raw as AdminPeriodKey
  }
  return '30d'
}

export default function AdminDashboardPage() {
  const { showError } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const period = parsePeriod(searchParams.get('period'))

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAdminStats(period)
      .then((s) => {
        if (!cancelled) setStats(s)
      })
      .catch(() => {
        if (!cancelled)
          showError(
            'No pudimos cargar las métricas',
            'Recarga la página para reintentar'
          )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [period, showError])

  const setPeriod = useCallback(
    (next: AdminPeriodKey) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next === '30d') params.delete('period')
      else params.set('period', next)
      const query = params.toString()
      router.replace(`/admin${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
            Resumen de la plataforma
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Métricas de negocio · {ADMIN_PERIOD_LABEL[period].toLowerCase()}.
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </header>

      {/* Verificaciones pendientes */}
      {!loading && stats && stats.pendingVerifications > 0 && (
        <Link
          href="/admin/verificaciones"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-accent-100 bg-accent-100/40 p-4 transition-colors hover:bg-accent-100/60 focus:outline-none focus-visible:ring-3 focus-visible:ring-accent-100"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-white"
            >
              <ShieldCheck size={20} strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-accent-900">
                {stats.pendingVerifications}{' '}
                {stats.pendingVerifications === 1
                  ? 'vendedor espera verificación'
                  : 'vendedores esperan verificación'}
              </p>
              <p className="text-xs text-accent-900/70">
                Revisa documentos y aprueba o rechaza solicitudes.
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-accent-900 group-hover:underline">
            Revisar →
          </span>
        </Link>
      )}

      {/* KPIs de negocio (dependen del período) */}
      <BusinessKpis stats={stats} loading={loading} />

      {/* KPIs estructurales (no dependen del período) */}
      <StructuralKpis stats={stats} loading={loading} />

      {/* Embudo de conversión + actividad reciente */}
      <section className="grid gap-6 lg:grid-cols-2">
        <FunnelCard stats={stats} loading={loading} />
        <RecentPublicationsCard stats={stats} loading={loading} />
      </section>

      {/* Suscripciones por plan */}
      <section>
        <SubscriptionsCard stats={stats} loading={loading} />
      </section>
    </div>
  )
}

/* ─── Bloques ──────────────────────────────────────────────── */

function BusinessKpis({
  stats,
  loading,
}: {
  stats: AdminStats | null
  loading: boolean
}) {
  return (
    <section aria-label="Métricas de negocio del período">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading || !stats ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="GMV (volumen bruto)"
              value={formatPrice(stats.current.gmv)}
              hint="Suma de pedidos completados"
              icon={<TrendingUp size={18} strokeWidth={1.5} />}
              delta={<DeltaBadge value={stats.delta.gmv} />}
            />
            <StatCard
              label="Transacciones completadas"
              value={stats.current.transactionsCompleted}
              hint={`${stats.current.funnel.orders} pedidos totales en el período`}
              icon={<Receipt size={18} strokeWidth={1.5} />}
              delta={
                <DeltaBadge value={stats.delta.transactionsCompleted} />
              }
            />
            <StatCard
              label="Ingresos por suscripciones"
              value={`USD ${stats.monthlyRevenueUsd.toFixed(2)}`}
              hint="Suma mensual de planes activos"
              icon={<DollarSign size={18} strokeWidth={1.5} />}
              delta={
                <DeltaBadge value={stats.delta.subscriptionRevenue} />
              }
            />
          </>
        )}
      </div>
    </section>
  )
}

function StructuralKpis({
  stats,
  loading,
}: {
  stats: AdminStats | null
  loading: boolean
}) {
  return (
    <section aria-label="Métricas estructurales">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !stats ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Vendedores activos"
              value={stats.activeSellers}
              hint={
                stats.suspendedSellers > 0
                  ? `${stats.suspendedSellers} suspendidos`
                  : 'Sin suspendidos'
              }
              icon={<Store size={18} strokeWidth={1.5} />}
            />
            <StatCard
              label="Compradores activos"
              value={stats.activeBuyers}
              hint={
                stats.suspendedBuyers > 0
                  ? `${stats.suspendedBuyers} suspendidos`
                  : 'Sin suspendidos'
              }
              icon={<Users size={18} strokeWidth={1.5} />}
            />
            <StatCard
              label="Publicaciones activas"
              value={stats.activePublications}
              hint={`${stats.totalOrders} pedidos en total`}
              icon={<Package size={18} strokeWidth={1.5} />}
            />
            <StatCard
              label="Eventos"
              value={stats.totalEvents}
              hint="Publicados en la plataforma"
              icon={<Calendar size={18} strokeWidth={1.5} />}
            />
          </>
        )}
      </div>
    </section>
  )
}

function FunnelCard({
  stats,
  loading,
}: {
  stats: AdminStats | null
  loading: boolean
}) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-0.5">
        <h2 className="font-serif text-lg font-semibold text-neutral-900">
          Embudo de conversión
        </h2>
        <p className="text-xs text-neutral-500">
          Visitas → contactos por WhatsApp → pedidos del período.
        </p>
      </div>
      {loading || !stats ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : stats.current.funnel.views === 0 ? (
        <EmptyState
          title="Sin actividad en el período"
          description="Ajusta el período en la parte superior para ver más datos."
        />
      ) : (
        <ConversionFunnel
          current={stats.current.funnel}
          delta={{
            views: stats.delta.views,
            contacts: stats.delta.contacts,
            orders: stats.delta.orders,
          }}
        />
      )}
    </article>
  )
}

function RecentPublicationsCard({
  stats,
  loading,
}: {
  stats: AdminStats | null
  loading: boolean
}) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-neutral-900">
          Publicaciones recientes
        </h2>
        <Link
          href="/admin/publicaciones"
          className="text-xs font-medium text-primary-500 hover:text-primary-700"
        >
          Ver todas
        </Link>
      </div>
      {loading || !stats ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-12 rounded-lg" />
            </li>
          ))}
        </ul>
      ) : stats.recentPublications.length === 0 ? (
        <EmptyState
          icon={<Package size={32} strokeWidth={1.5} />}
          title="Sin publicaciones todavía"
          description="Cuando los vendedores publiquen, aparecerán aquí."
        />
      ) : (
        <ul className="flex flex-col">
          {stats.recentPublications.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 border-b border-neutral-200 py-3 last:border-b-0 last:pb-0 first:pt-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {p.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Categoría {p.category} · {formatDateShort(p.createdAt)}
                </p>
              </div>
              <Badge variant={p.status === 'active' ? 'success' : 'default'}>
                {p.status === 'active'
                  ? 'Activa'
                  : p.status === 'paused'
                  ? 'Pausada'
                  : 'Borrador'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function SubscriptionsCard({
  stats,
  loading,
}: {
  stats: AdminStats | null
  loading: boolean
}) {
  const subscriptionTotals = useMemo(() => {
    if (!stats) return null
    const total = Object.values(stats.subscriptionsByPlan).reduce(
      (a, b) => a + b,
      0
    )
    return { total }
  }, [stats])

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-neutral-900">
          Suscripciones por plan
        </h2>
        <Link
          href="/admin/suscripciones"
          className="text-xs font-medium text-primary-500 hover:text-primary-700"
        >
          Ver detalle
        </Link>
      </div>

      {loading || !stats || !subscriptionTotals ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {(['semilla', 'cosecha', 'exportacion'] as const).map((plan) => {
              const count = stats.subscriptionsByPlan[plan]
              const pct =
                subscriptionTotals.total === 0
                  ? 0
                  : Math.round((count / subscriptionTotals.total) * 100)
              return (
                <li key={plan}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-900">
                      {subscriptionLabel(plan)}
                    </span>
                    <span className="text-neutral-500">
                      {count} {count === 1 ? 'vendedor' : 'vendedores'}
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${subscriptionLabel(plan)}: ${pct}%`}
                  >
                    <div
                      className="h-full rounded-full bg-primary-300 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-4">
            <div className="text-center">
              <p className="font-serif text-xl font-bold text-neutral-900">
                {stats.totalEvents}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                <Calendar
                  size={12}
                  strokeWidth={1.5}
                  className="mr-1 inline"
                  aria-hidden
                />
                Eventos
              </p>
            </div>
            <div className="text-center">
              <p className="font-serif text-xl font-bold text-neutral-900">
                {stats.totalOrders}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                <ShoppingBag
                  size={12}
                  strokeWidth={1.5}
                  className="mr-1 inline"
                  aria-hidden
                />
                Pedidos
              </p>
            </div>
            <div className="text-center">
              <p className="font-serif text-xl font-bold text-neutral-900">
                {subscriptionTotals.total}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                <Sparkles
                  size={12}
                  strokeWidth={1.5}
                  className="mr-1 inline"
                  aria-hidden
                />
                Activas
              </p>
            </div>
          </div>
        </>
      )}
    </article>
  )
}
