'use client'

import { ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  id?: string
  className?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: ToggleProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  const track = checked ? 'bg-primary-300' : 'bg-neutral-300'
  const thumbPos = checked ? 'translate-x-[18px]' : 'translate-x-0.5'

  const switchEl = (
    <span className="relative inline-flex h-[22px] w-10 shrink-0 items-center">
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 rounded-full transition-colors',
          track,
          disabled && 'opacity-50'
        )}
      />
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-xs transition-transform',
          thumbPos
        )}
      />
    </span>
  )

  if (!label && !description) {
    return <span className={cn('inline-flex', className)}>{switchEl}</span>
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer items-center gap-3',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      {switchEl}
      <span className="flex flex-col">
        {label && (
          <span
            className={cn(
              'text-[13px] font-medium',
              checked ? 'text-primary-700' : 'text-neutral-900'
            )}
          >
            {label}
          </span>
        )}
        {description && (
          <span className="text-xs text-neutral-500">{description}</span>
        )}
      </span>
    </label>
  )
}
