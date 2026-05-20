'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChipProps {
  children: ReactNode
  icon?: ReactNode
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
  removeLabel?: string
  disabled?: boolean
  className?: string
}

export function Chip({
  children,
  icon,
  selected = false,
  onClick,
  onRemove,
  removeLabel = 'Quitar',
  disabled = false,
  className,
}: ChipProps) {
  const interactive = Boolean(onClick) && !disabled
  const base =
    'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors'
  const tone = selected
    ? 'border-primary-500 bg-primary-50 text-primary-700'
    : 'border-neutral-200 bg-white text-neutral-900'
  const hover = interactive
    ? selected
      ? 'hover:bg-primary-100'
      : 'hover:border-neutral-300'
    : ''
  const disabledCls = disabled ? 'cursor-not-allowed opacity-50' : ''

  const inner = (
    <>
      {icon}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="-mr-1 ml-1 rounded-full p-0.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      )}
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={cn(base, tone, hover, disabledCls, className)}
      >
        {inner}
      </button>
    )
  }

  return (
    <span className={cn(base, tone, disabledCls, className)}>{inner}</span>
  )
}
