'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, XCircle } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatCard } from '@/components/admin/StatCard'
import { useToast } from '@/contexts/ToastContext'
import { cancelSubscription, listAllSellers } from '@/lib/api/admin'
import {
  Seller,
  SubscriptionPlan,
  SUBSCRIPTION_PRICES,
} from '@/types'
import { formatDateShort, subscriptionLabel } from '@/lib/utils'

const APPEARANCES_BY_PLAN: Record<Exclude<SubscriptionPlan, 'none'>, number> = {
  semilla: 1,
  cosecha: 3,
  exportacion: 7,
}

const PLAN_BADGE_VARIANT: Record<SubscriptionPlan, 'default' | 'success' | 'primary'> = {
  none: 'default',
  semilla: 'success',
  cosecha: 'primary',
  exportacion: 'primary',
}

export default function AdminSuscripcionesPage() {
  const { showSuccess, showError } = useToast()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState<Seller | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const ss = await listAllSellers()
      setSellers(ss)
    } catch {
      showError('No pudimos cargar las suscripciones', 'Recarga la página')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeSubs = useMemo(
    () => sellers.filter((s) => s.subscriptionPlan !== 'none'),
    [sellers]
  )

  const monthlyRevenue = useMemo(
    () =>
      activeSubs.reduce(
        (sum, s) => sum + SUBSCRIPTION_PRICES[s.subscriptionPlan],
        0
      ),
    [activeSubs]
  )

  async function confirmCancel() {
    if (!target) return
    try {
      await cancelSubscription(target.id)
      showSuccess('Suscripción cancelada', target.businessName)
      await refresh()
    } catch {
      showError('No pudimos cancelar', 'Inténtalo de nuevo')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
          Suscripciones
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Vendedores con plan activo en la plataforma.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Suscripciones activas"
          value={loading ? '—' : activeSubs.length}
        />
        <StatCard
          label="Ingresos mensuales"
          value={loading ? '—' : `USD ${monthlyRevenue.toFixed(2)}`}
          hint="Suma de planes vigentes"
        />
        <StatCard
          label="Vendedores sin plan"
          value={loading ? '—' : sellers.length - activeSubs.length}
        />
      </section>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : activeSubs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sin suscripciones activas"
              description="Cuando un vendedor contrate un plan, aparecerá aquí."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Expira</th>
                  <th className="px-4 py-3 text-center">Apariciones</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {activeSubs.map((s) => {
                  const plan = s.subscriptionPlan as Exclude<SubscriptionPlan, 'none'>
                  const max = APPEARANCES_BY_PLAN[plan]
                  const used = s.adAppearancesUsed ?? 0
                  return (
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
                      <td className="px-4 py-3">
                        <Badge variant={PLAN_BADGE_VARIANT[s.subscriptionPlan]}>
                          {subscriptionLabel(s.subscriptionPlan)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        USD {SUBSCRIPTION_PRICES[s.subscriptionPlan].toFixed(2)}
                        <span className="block text-xs text-neutral-500">por mes</span>
                      </td>
                      <td className="px-4 py-3 text-neutral-900">
                        {s.subscriptionExpiry
                          ? formatDateShort(s.subscriptionExpiry)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-neutral-900">
                        {used} / {max}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/vendedor/${s.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-200 px-2.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                            aria-label="Ver perfil"
                          >
                            <ExternalLink size={14} strokeWidth={1.5} />
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setTarget(s)}
                            leadingIcon={<XCircle size={14} strokeWidth={1.5} />}
                          >
                            Cancelar
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
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={confirmCancel}
        title="Cancelar suscripción"
        description={
          target
            ? `${target.businessName} pasará a “Sin plan”. Perderá los beneficios del ${subscriptionLabel(target.subscriptionPlan)}.`
            : ''
        }
        confirmLabel="Cancelar plan"
        cancelLabel="Volver"
        variant="destructive"
      />
    </div>
  )
}
