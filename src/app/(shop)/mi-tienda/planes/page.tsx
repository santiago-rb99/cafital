'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Spinner } from '@/components/ui/Spinner'
import { PlanCard } from '@/components/subscriptions/PlanCard'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { listPlans, PlanFeatures, subscribe } from '@/lib/api/subscriptions'
import { Seller, SubscriptionPlan } from '@/types'
import { formatDate, subscriptionLabel } from '@/lib/utils'

export default function MiTiendaPlanesPage() {
  const { user, isHydrated, refreshUser } = useAuth()
  const { showSuccess, showError } = useToast()
  const router = useRouter()

  const seller = user?.role === 'seller' ? (user as Seller) : null
  const currentPlan: SubscriptionPlan = seller?.subscriptionPlan ?? 'none'

  const [plans, setPlans] = useState<PlanFeatures[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    let cancelled = false
    listPlans()
      .then((p) => {
        if (!cancelled) setPlans(p)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function goCheckout(plan: PlanFeatures) {
    if (!seller || plan.id === seller.subscriptionPlan) return
    router.push(`/mi-tienda/planes/checkout?plan=${plan.id}`)
  }

  async function doCancel() {
    if (!seller) return
    setCancelling(true)
    try {
      await subscribe(seller.id, 'none')
      refreshUser()
      showSuccess(
        'Suscripción cancelada',
        'Tu cuenta volvió al plan gratuito.'
      )
    } catch {
      showError('No pudimos cancelar la suscripción')
    } finally {
      setCancelling(false)
      setConfirmCancel(false)
    }
  }

  if (!isHydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (!seller) return null

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Planes de Cafital
        </h1>
        <p className="text-sm text-neutral-500">
          Más visibilidad, más espacios premium y mejores herramientas para tu
          tienda.
        </p>
      </header>

      {/* PLAN ACTUAL */}
      <CurrentPlanBanner
        seller={seller}
        onCancel={() => setConfirmCancel(true)}
      />

      {/* PLANES */}
      <ul
        role="list"
        className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {plans.map((plan) => (
          <li key={plan.id} className="h-full">
            <PlanCard
              plan={plan}
              currentPlan={currentPlan}
              recommended={plan.id === 'cosecha'}
              onSelect={() => goCheckout(plan)}
            />
          </li>
        ))}
      </ul>

      <p className="text-xs text-neutral-500">
        Los planes se renuevan mensualmente. Puedes cambiar o cancelar en
        cualquier momento desde esta página.
      </p>

      {/* CONFIRMACIÓN DE CANCELACIÓN */}
      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={doCancel}
        title="¿Cancelar tu suscripción?"
        description="Volverás al plan gratuito. Perderás aparecer en hero, badges de verificación y demás beneficios premium hasta que vuelvas a contratar."
        confirmLabel={cancelling ? 'Cancelando…' : 'Sí, cancelar'}
        cancelLabel="Mantener plan"
        variant="destructive"
      />
    </div>
  )
}

function CurrentPlanBanner({
  seller,
  onCancel,
}: {
  seller: Seller
  onCancel: () => void
}) {
  if (seller.subscriptionPlan === 'none') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
          <CalendarClock size={20} strokeWidth={1.5} aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-neutral-900">
            Estás en el plan gratuito
          </p>
          <p className="text-sm text-neutral-500">
            Tu tienda es visible pero sin destacados ni espacios premium.
            Activa un plan para subir.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary-300 bg-primary-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-300 text-white">
          <CalendarClock size={20} strokeWidth={1.5} aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-primary-700">
            Plan actual: {subscriptionLabel(seller.subscriptionPlan)}
          </p>
          <p className="text-sm text-primary-700/80">
            {seller.subscriptionExpiry
              ? `Próxima renovación: ${formatDate(seller.subscriptionExpiry)}`
              : 'Renovación mensual automática.'}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="md"
        onClick={onCancel}
        leadingIcon={<XCircle size={16} strokeWidth={1.5} />}
      >
        Cancelar suscripción
      </Button>
    </div>
  )
}
