import { Eye, MessageCircle, ShoppingBag } from 'lucide-react'
import type { FunnelSnapshot } from '@/lib/api/admin'
import { DeltaBadge } from './DeltaBadge'

interface ConversionFunnelProps {
  current: FunnelSnapshot
  /** Cambios % vs período anterior por paso. */
  delta?: {
    views: number | null
    contacts: number | null
    orders: number | null
  }
}

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null
  return Math.round((numerator / denominator) * 1000) / 10
}

export function ConversionFunnel({ current, delta }: ConversionFunnelProps) {
  const { views, contacts, orders } = current
  const contactRate = rate(contacts, views)
  const orderRate = rate(orders, contacts)

  const max = Math.max(views, contacts, orders, 1)
  const steps = [
    {
      key: 'views' as const,
      label: 'Visitas',
      value: views,
      icon: <Eye size={16} strokeWidth={1.5} />,
      delta: delta?.views ?? null,
      width: (views / max) * 100,
    },
    {
      key: 'contacts' as const,
      label: 'Contactos por WhatsApp',
      value: contacts,
      icon: <MessageCircle size={16} strokeWidth={1.5} />,
      delta: delta?.contacts ?? null,
      width: (contacts / max) * 100,
    },
    {
      key: 'orders' as const,
      label: 'Pedidos',
      value: orders,
      icon: <ShoppingBag size={16} strokeWidth={1.5} />,
      delta: delta?.orders ?? null,
      width: (orders / max) * 100,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {steps.map((step) => (
          <li key={step.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-neutral-900">
                <span className="text-neutral-500">{step.icon}</span>
                <span className="font-medium">{step.label}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-serif text-base font-semibold text-neutral-900">
                  {step.value.toLocaleString('es-BO')}
                </span>
                <DeltaBadge value={step.delta} />
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={Math.round(step.width)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${step.label}: ${step.value}`}
              className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
            >
              <div
                className="h-full rounded-full bg-primary-300 transition-all"
                style={{ width: `${Math.max(step.width, 2)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4 text-xs">
        <RateCell
          label="Visita → contacto"
          value={contactRate}
        />
        <RateCell
          label="Contacto → pedido"
          value={orderRate}
        />
      </div>
    </div>
  )
}

function RateCell({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-neutral-500">{label}</span>
      <span className="mt-0.5 font-serif text-lg font-semibold text-neutral-900">
        {value === null ? '—' : `${value}%`}
      </span>
    </div>
  )
}
