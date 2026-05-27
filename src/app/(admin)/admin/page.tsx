'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  DollarSign,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'

import { StatCard } from '@/components/admin/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/contexts/ToastContext'
import { getAdminStats, type AdminStats } from '@/lib/api/admin'
import { formatDateShort, subscriptionLabel } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { showError } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAdminStats()
      .then((s) => {
        if (!cancelled) setStats(s)
      })
      .catch(() => {
        if (!cancelled) showError('No pudimos cargar las métricas', 'Recarga la página para reintentar')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [showError])

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
          Resumen de la plataforma
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Visión general de usuarios, contenido y suscripciones.
        </p>
      </header>

      {/* KPIs */}
      <section aria-label="Métricas clave">
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
                label="Ingresos mensuales"
                value={`USD ${stats.monthlyRevenueUsd.toFixed(2)}`}
                hint="Suma de planes activos"
                icon={<DollarSign size={18} strokeWidth={1.5} />}
              />
            </>
          )}
        </div>
      </section>

      {/* Dos columnas: actividad reciente + suscripciones */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Actividad reciente */}
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
                    {p.status === 'active' ? 'Activa' : p.status === 'paused' ? 'Pausada' : 'Borrador'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* Suscripciones por plan */}
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

          {loading || !stats ? (
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
                  const total = Object.values(stats.subscriptionsByPlan).reduce(
                    (a, b) => a + b,
                    0
                  )
                  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
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
                    <Calendar size={12} strokeWidth={1.5} className="mr-1 inline" aria-hidden />
                    Eventos
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-serif text-xl font-bold text-neutral-900">
                    {stats.totalOrders}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    <ShoppingBag size={12} strokeWidth={1.5} className="mr-1 inline" aria-hidden />
                    Pedidos
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-serif text-xl font-bold text-neutral-900">
                    {Object.values(stats.subscriptionsByPlan).reduce(
                      (a, b) => a + b,
                      0
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    <Sparkles size={12} strokeWidth={1.5} className="mr-1 inline" aria-hidden />
                    Activas
                  </p>
                </div>
              </div>
            </>
          )}
        </article>
      </section>
    </div>
  )
}
