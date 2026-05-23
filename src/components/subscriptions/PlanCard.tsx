'use client'

import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PlanFeatures } from '@/lib/api/subscriptions'
import { SubscriptionPlan } from '@/types'
import { cn } from '@/lib/utils'

type ActionLabel =
  | 'current' // ya es el plan actual
  | 'upgrade' // subir desde un plan menor
  | 'downgrade' // bajar desde un plan superior
  | 'subscribe' // primer plan
  | 'unavailable' // sin sesión / no es vendedor

interface PlanCardProps {
  plan: PlanFeatures
  currentPlan: SubscriptionPlan
  /** Marcar este plan como "recomendado" visualmente. */
  recommended?: boolean
  onSelect: () => void
  loading?: boolean
}

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  none: 0,
  semilla: 1,
  cosecha: 2,
  exportacion: 3,
}

function resolveAction(
  cardPlan: SubscriptionPlan,
  currentPlan: SubscriptionPlan
): ActionLabel {
  if (cardPlan === currentPlan) return 'current'
  if (currentPlan === 'none') return 'subscribe'
  return PLAN_RANK[cardPlan] > PLAN_RANK[currentPlan]
    ? 'upgrade'
    : 'downgrade'
}

const ACTION_LABEL: Record<ActionLabel, string> = {
  current: 'Plan actual',
  upgrade: 'Cambiar a este plan',
  downgrade: 'Bajar a este plan',
  subscribe: 'Contratar',
  unavailable: 'Iniciar sesión como vendedor',
}

export function PlanCard({
  plan,
  currentPlan,
  recommended,
  onSelect,
  loading,
}: PlanCardProps) {
  const action = resolveAction(plan.id, currentPlan)
  const isCurrent = action === 'current'

  return (
    <article
      aria-labelledby={`plan-${plan.id}-name`}
      className={cn(
        'relative flex h-full flex-col gap-5 rounded-2xl border bg-white p-6 shadow-sm transition-shadow',
        recommended
          ? 'border-primary-500 ring-2 ring-primary-100'
          : 'border-neutral-200',
        isCurrent && 'bg-primary-50/40'
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary-300 px-3 py-1 text-[11px] font-semibold text-primary-900">
          <Sparkles size={12} strokeWidth={2} aria-hidden />
          Recomendado
        </span>
      )}

      <header className="flex flex-col gap-2">
        <h3
          id={`plan-${plan.id}-name`}
          className="font-serif text-xl font-semibold text-neutral-900"
        >
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif text-3xl font-bold tabular-nums text-neutral-900">
            ${plan.priceUsd.toFixed(2)}
          </span>
          <span className="text-sm text-neutral-500">USD/mes</span>
        </div>
      </header>

      <ul role="list" className="flex flex-col gap-2.5">
        {plan.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-sm text-neutral-900">
            <span
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-300 text-primary-900"
              aria-hidden
            >
              <Check size={12} strokeWidth={2.5} />
            </span>
            <span className="leading-relaxed">{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2">
        <Button
          type="button"
          variant={isCurrent ? 'secondary' : 'primary'}
          size="md"
          fullWidth
          onClick={onSelect}
          disabled={isCurrent || loading}
          loading={loading}
        >
          {ACTION_LABEL[action]}
        </Button>
      </div>
    </article>
  )
}
