'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size'> {
  value: number | ''
  onChange: (value: number | '') => void
  min?: number
  max?: number
  step?: number
  invalid?: boolean
  suffix?: ReactNode
  containerClassName?: string
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      value,
      onChange,
      min,
      max,
      step = 1,
      invalid = false,
      suffix,
      disabled,
      containerClassName,
      className,
      ...rest
    },
    ref
  ) {
    const clamp = (n: number) => {
      let v = n
      if (typeof min === 'number') v = Math.max(min, v)
      if (typeof max === 'number') v = Math.min(max, v)
      return v
    }

    const dec = () => {
      if (value === '') return onChange(typeof min === 'number' ? min : 0)
      onChange(clamp(value - step))
    }
    const inc = () => {
      if (value === '') return onChange(typeof min === 'number' ? min : step)
      onChange(clamp(value + step))
    }

    const stateBorder = invalid
      ? 'border-[#D32F2F] focus-within:ring-3 focus-within:ring-red-200/40'
      : 'border-neutral-200 hover:border-neutral-300 focus-within:border-primary-500 focus-within:ring-3 focus-within:ring-primary-100/40'

    return (
      <div
        className={cn(
          'flex h-10 w-full items-center rounded border bg-white transition-colors',
          stateBorder,
          disabled && 'bg-neutral-100 text-neutral-300',
          containerClassName
        )}
      >
        <button
          type="button"
          onClick={dec}
          disabled={disabled || (typeof min === 'number' && value !== '' && value <= min)}
          aria-label="Disminuir"
          className="flex h-full w-9 items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300"
        >
          <Minus size={16} strokeWidth={1.5} />
        </button>
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value
            if (v === '') return onChange('')
            const num = Number(v)
            if (!Number.isNaN(num)) onChange(num)
          }}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-center text-sm font-medium text-neutral-900 focus:outline-none disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            className
          )}
          {...rest}
        />
        {suffix && (
          <span className="px-2 text-xs text-neutral-500" aria-hidden>
            {suffix}
          </span>
        )}
        <button
          type="button"
          onClick={inc}
          disabled={disabled || (typeof max === 'number' && value !== '' && value >= max)}
          aria-label="Aumentar"
          className="flex h-full w-9 items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300"
        >
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>
    )
  }
)
