import { Megaphone } from 'lucide-react'
import { Badge, Tooltip } from '@/components/ui'
import { cn } from '@/lib/utils'

interface AppearancesProgressProps {
  used: number
  max: number
  className?: string
}

export function AppearancesProgress({
  used,
  max,
  className,
}: AppearancesProgressProps) {
  const safeMax = Math.max(max, 1)
  const pct = Math.min(100, Math.round((used / safeMax) * 100))
  const exhausted = used >= max && max > 0

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
            <Megaphone size={14} strokeWidth={1.5} aria-hidden />
          </span>
          <Tooltip
            content="Las apariciones se reinician el día 1 de cada mes."
            side="bottom"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              Apariciones este mes
            </span>
          </Tooltip>
        </div>
        {exhausted ? (
          <Badge variant="warning">Cupo agotado este mes</Badge>
        ) : (
          <span className="text-sm font-semibold tabular-nums text-neutral-900">
            {used} / {max}
          </span>
        )}
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${used} de ${max} apariciones usadas este mes`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            exhausted ? 'bg-[#C9870E]' : 'bg-primary-300',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
