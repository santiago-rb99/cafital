import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'dark'

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-500',
  primary: 'bg-primary-100 text-primary-900',
  success: 'bg-primary-50 text-primary-700',
  warning: 'bg-accent-100 text-accent-900',
  error: 'bg-[#FDEAEA] text-[#601212]',
  dark: 'bg-neutral-900 text-white',
}

interface BadgeProps {
  variant?: BadgeVariant
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  )
}
