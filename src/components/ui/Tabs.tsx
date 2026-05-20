'use client'

import { ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

export interface TabItem<T extends string = string> {
  value: T
  label: ReactNode
  count?: number
  icon?: ReactNode
}

interface TabsProps<T extends string = string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  variant?: 'underline' | 'pills'
  className?: string
  ariaLabel?: string
}

export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
  ariaLabel = 'Pestañas',
}: TabsProps<T>) {
  const groupId = useId()

  if (variant === 'pills') {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1',
          className
        )}
      >
        {items.map((item) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              role="tab"
              type="button"
              id={`${groupId}-${item.value}`}
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-500 hover:text-neutral-900'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {typeof item.count === 'number' && (
                <span
                  className={cn(
                    'ml-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                    active ? 'bg-primary-100 text-primary-900' : 'bg-neutral-100 text-neutral-500'
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex items-center gap-6 border-b border-neutral-200', className)}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            id={`${groupId}-${item.value}`}
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative inline-flex items-center gap-2 py-3 text-sm font-medium transition-colors',
              active ? 'text-primary-700' : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                  active ? 'bg-primary-100 text-primary-900' : 'bg-neutral-100 text-neutral-500'
                )}
              >
                {item.count}
              </span>
            )}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary-500"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
