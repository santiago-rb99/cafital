import { CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_META: Record<
  OrderStatus,
  { label: string; chip: string; Icon: typeof Clock }
> = {
  pending: {
    label: 'Pendiente',
    chip: 'bg-accent-100 text-accent-900',
    Icon: Clock,
  },
  in_process: {
    label: 'En proceso',
    chip: 'bg-primary-50 text-primary-700',
    Icon: Loader2,
  },
  completed: {
    label: 'Completado',
    chip: 'bg-primary-100 text-primary-900',
    Icon: CheckCircle2,
  },
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md'
  className?: string
}

export function OrderStatusBadge({
  status,
  size = 'md',
  className,
}: OrderStatusBadgeProps) {
  const meta = STATUS_META[status]
  const iconSize = size === 'sm' ? 12 : 14
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-medium',
        meta.chip,
        padding,
        className
      )}
    >
      <meta.Icon size={iconSize} strokeWidth={1.5} aria-hidden />
      {meta.label}
    </span>
  )
}
