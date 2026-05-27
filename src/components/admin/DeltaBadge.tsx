import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeltaBadgeProps {
  /** Cambio porcentual entero. `null` indica que no se puede calcular. */
  value: number | null
  /**
   * Cuando `true`, un valor positivo es bueno (verde) y negativo es malo
   * (rojo). Pasar `false` invierte la lógica (útil para métricas como
   * tiempo de respuesta donde menos es mejor).
   */
  positiveIsGood?: boolean
  className?: string
}

export function DeltaBadge({
  value,
  positiveIsGood = true,
  className,
}: DeltaBadgeProps) {
  if (value === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold bg-neutral-100 text-neutral-500',
          className
        )}
        title="Sin datos del período anterior"
      >
        —
      </span>
    )
  }
  if (value === 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold bg-neutral-100 text-neutral-500',
          className
        )}
      >
        <Minus size={11} strokeWidth={2} aria-hidden />
        0%
      </span>
    )
  }
  const positive = value > 0
  const good = positiveIsGood ? positive : !positive
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold',
        good
          ? 'bg-primary-50 text-primary-700'
          : 'bg-error-bg text-error-dark',
        className
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
