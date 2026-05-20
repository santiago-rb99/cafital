'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  step = 1,
  disabled,
  size = 'md',
  className,
  ariaLabel = 'Cantidad',
}: QuantitySelectorProps) {
  const clamp = (n: number) => {
    let v = n
    v = Math.max(min, v)
    if (typeof max === 'number') v = Math.min(max, v)
    return v
  }

  const dimensions =
    size === 'sm'
      ? { box: 'h-8', btn: 'w-8', value: 'w-10 text-sm' }
      : { box: 'h-10', btn: 'w-10', value: 'w-12 text-sm' }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-neutral-200 bg-white',
        dimensions.box,
        disabled && 'opacity-60',
        className
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        disabled={disabled || value <= min}
        aria-label="Disminuir"
        className={cn(
          'flex h-full items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300',
          dimensions.btn
        )}
      >
        <Minus size={16} strokeWidth={1.5} />
      </button>
      <span
        aria-live="polite"
        className={cn(
          'flex h-full items-center justify-center font-medium text-neutral-900 tabular-nums',
          dimensions.value
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        disabled={disabled || (typeof max === 'number' && value >= max)}
        aria-label="Aumentar"
        className={cn(
          'flex h-full items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300',
          dimensions.btn
        )}
      >
        <Plus size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
