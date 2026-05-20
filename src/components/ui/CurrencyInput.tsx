'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size'> {
  value: number | ''
  onChange: (value: number | '') => void
  currency?: string
  invalid?: boolean
  containerClassName?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      onChange,
      currency = 'Bs.',
      invalid = false,
      disabled,
      containerClassName,
      className,
      ...rest
    },
    ref
  ) {
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
        <span
          className="flex h-full items-center border-r border-neutral-200 px-3 text-xs font-medium text-neutral-500"
          aria-hidden
        >
          {currency}
        </span>
        <input
          ref={ref}
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value
            if (v === '') return onChange('')
            const num = Number(v)
            if (!Number.isNaN(num)) onChange(num)
          }}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none disabled:cursor-not-allowed tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            className
          )}
          {...rest}
        />
      </div>
    )
  }
)
