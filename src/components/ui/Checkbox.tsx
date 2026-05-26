'use client'

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  description?: ReactNode
  invalid?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, invalid = false, id, className, disabled, ...rest },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId

  const box = (
    <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded border border-neutral-300 bg-white transition-colors checked:border-primary-500 checked:bg-primary-300 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[#D32F2F]"
        {...rest}
      />
      <Check
        size={14}
        strokeWidth={2.5}
        className="pointer-events-none relative text-white opacity-0 transition-opacity peer-checked:opacity-100"
      />
    </span>
  )

  if (!label && !description) {
    return <span className={cn('inline-flex', className)}>{box}</span>
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer items-start gap-2.5',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      {box}
      <span className="flex flex-col leading-tight">
        {label && (
          <span className="text-[13px] font-medium text-neutral-900">{label}</span>
        )}
        {description && (
          <span className="text-xs text-neutral-500">{description}</span>
        )}
      </span>
    </label>
  )
})
