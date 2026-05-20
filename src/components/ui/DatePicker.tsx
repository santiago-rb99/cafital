'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  invalid?: boolean
  containerClassName?: string
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(
    { invalid = false, disabled, containerClassName, className, ...rest },
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
        <Calendar
          size={18}
          strokeWidth={1.5}
          className="ml-3 mr-2 text-neutral-500"
          aria-hidden
        />
        <input
          ref={ref}
          type="date"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent pr-3 text-sm text-neutral-900 focus:outline-none disabled:cursor-not-allowed',
            className
          )}
          {...rest}
        />
      </div>
    )
  }
)
