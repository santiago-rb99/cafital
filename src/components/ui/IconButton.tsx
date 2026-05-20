import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type IconButtonVariant = 'ghost' | 'outline' | 'solid' | 'destructive'
type IconButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_STYLES: Record<IconButtonVariant, string> = {
  ghost:
    'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:text-neutral-300',
  outline:
    'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 disabled:text-neutral-300',
  solid:
    'bg-primary-300 text-primary-900 hover:bg-primary-500 disabled:bg-neutral-200 disabled:text-neutral-300',
  destructive:
    'bg-transparent text-[#D32F2F] hover:bg-[#FDEAEA] disabled:text-neutral-300',
}

const SIZE_STYLES: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8 rounded',
  md: 'h-10 w-10 rounded-lg',
  lg: 'h-12 w-12 rounded-lg',
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: IconButtonSize
  icon: ReactNode
  label: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = 'ghost',
      size = 'md',
      icon,
      label,
      className,
      type = 'button',
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className
        )}
        {...rest}
      >
        {icon}
      </button>
    )
  }
)
