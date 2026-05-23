'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, Eye, Lock, Sparkles, TrendingUp } from 'lucide-react'

import { Publication, Seller } from '@/types'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'

import { useAuth } from '@/contexts/AuthContext'
import { listPublicationsBySeller } from '@/lib/api/publications'
import { cn } from '@/lib/utils'

export default function MiTiendaEstadisticasPage() {
  const { user, isHydrated } = useAuth()
  const seller = user?.role === 'seller' ? (user as Seller) : null
  const hasAccess = seller?.subscriptionPlan === 'exportacion'

  const [pubs, setPubs] = useState<Publication[] | null>(null)

  useEffect(() => {
    if (!isHydrated || !seller || !hasAccess) return
    let cancelled = false
    listPublicationsBySeller(seller.id, { includeAllStatuses: true }).then(
      (list) => {
        if (!cancelled) setPubs(list)
      }
    )
    return () => {
      cancelled = true
    }
  }, [seller, isHydrated, hasAccess])

  const loading = hasAccess && pubs === null

  const summary = useMemo(() => {
    const list = pubs ?? []
    const active = list.filter((p) => p.status === 'active')
    const totalViews = active.reduce((sum, p) => sum + (p.views ?? 0), 0)
    const avgViews = active.length === 0 ? 0 : Math.round(totalViews / active.length)
    const topPub = [...active].sort(
      (a, b) => (b.views ?? 0) - (a.views ?? 0)
    )[0]
    return { active, totalViews, avgViews, topPub }
  }, [pubs])

  if (!isHydrated || (hasAccess && loading)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (!seller) return null

  if (!hasAccess) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Estadísticas
          </h1>
          <p className="text-sm text-neutral-500">
            Disponible para el plan Exportación.
          </p>
        </header>
        <UpgradePrompt />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Estadísticas
          </h1>
          <p className="text-sm text-neutral-500">
            Visitas a tus publicaciones activas.
          </p>
        </div>
        <span className="inline-flex h-8 w-fit items-center gap-1.5 self-start rounded-full bg-primary-50 px-3 text-[12px] font-semibold text-primary-700 sm:self-auto">
          <Sparkles size={12} strokeWidth={2} aria-hidden />
          Beneficio Plan Exportación
        </span>
      </header>

      {/* KPIs */}
      <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatKpi
          title="Vistas totales"
          value={summary.totalViews.toLocaleString('es-BO')}
          subtitle={`${summary.active.length} ${summary.active.length === 1 ? 'publicación activa' : 'publicaciones activas'}`}
          Icon={Eye}
        />
        <StatKpi
          title="Promedio por publicación"
          value={summary.avgViews.toLocaleString('es-BO')}
          subtitle="vistas en su período de vida"
          Icon={TrendingUp}
        />
        <StatKpi
          title="Más vista"
          value={
            summary.topPub
              ? (summary.topPub.views ?? 0).toLocaleString('es-BO')
              : '—'
          }
          subtitle={summary.topPub?.title ?? 'Sin datos aún'}
          Icon={BarChart3}
        />
      </ul>

      {/* TABLA DE VISTAS */}
      {summary.active.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={28} strokeWidth={1.5} />}
          title="Aún no hay datos"
          description="Cuando publiques contenido activo empezaremos a registrar visitas aquí."
        />
      ) : (
        <PublicationViewsTable
          publications={[...summary.active].sort(
            (a, b) => (b.views ?? 0) - (a.views ?? 0)
          )}
          maxViews={summary.topPub?.views ?? 0}
        />
      )}
    </div>
  )
}

function StatKpi({
  title,
  value,
  subtitle,
  Icon,
}: {
  title: string
  value: string
  subtitle: string
  Icon: typeof Eye
}) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
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
        <p className="line-clamp-1 text-xs text-neutral-500">{subtitle}</p>
      </div>
    </li>
  )
}

function PublicationViewsTable({
  publications,
  maxViews,
}: {
  publications: Publication[]
  maxViews: number
}) {
  return (
    <section
      aria-labelledby="views-table-heading"
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <header className="border-b border-neutral-200 px-5 py-4 sm:px-6">
        <h2
          id="views-table-heading"
          className="font-serif text-base font-semibold text-neutral-900"
        >
          Visitas por publicación
        </h2>
      </header>

      <ul role="list" className="divide-y divide-neutral-200">
        {publications.map((pub) => {
          const views = pub.views ?? 0
          const pct = maxViews === 0 ? 0 : Math.round((views / maxViews) * 100)
          return (
            <li key={pub.id}>
              <Link
                href={`/publicacion/${pub.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:bg-neutral-100 sm:px-6"
              >
                <span className="relative aspect-square h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  <Image
                    src={pub.photos[0]}
                    alt={pub.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="line-clamp-1 text-sm font-medium text-neutral-900">
                    {pub.title}
                  </p>
                  <div className="flex items-center gap-3">
                    <span
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100"
                      aria-hidden
                    >
                      <span
                        className={cn(
                          'block h-full rounded-full bg-primary-300',
                          pct === 0 && 'opacity-30'
                        )}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-neutral-500">
                      {views.toLocaleString('es-BO')} vistas
                    </span>
                  </div>
                </div>

                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="hidden shrink-0 text-neutral-300 sm:block"
                  aria-hidden
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function UpgradePrompt() {
  return (
    <section
      aria-labelledby="upgrade-heading"
      className="flex flex-col items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
        <Lock size={20} strokeWidth={1.5} aria-hidden />
      </span>
      <h2
        id="upgrade-heading"
        className="font-serif text-xl font-semibold text-neutral-900"
      >
        Estadísticas son parte del Plan Exportación
      </h2>
      <p className="max-w-prose text-sm leading-relaxed text-neutral-500">
        Activa el Plan Exportación para ver cuántas personas visitan cada una de
        tus publicaciones y entender qué productos generan más interés.
      </p>
      <ul role="list" className="flex flex-col gap-1.5 text-sm text-neutral-900">
        <li className="inline-flex items-center gap-2">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-300 text-[10px] font-bold text-primary-900">
            ✓
          </span>
          Vistas totales y promedio
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-300 text-[10px] font-bold text-primary-900">
            ✓
          </span>
          Ranking de publicaciones más visitadas
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-300 text-[10px] font-bold text-primary-900">
            ✓
          </span>
          Bloque &ldquo;Sobre nosotros&rdquo; + carrusel hasta 10 imágenes
        </li>
      </ul>
      <ButtonLink
        href="/mi-tienda/planes"
        size="md"
        trailingIcon={<ArrowRight size={16} strokeWidth={1.5} />}
      >
        Ver planes
      </ButtonLink>
    </section>
  )
}
