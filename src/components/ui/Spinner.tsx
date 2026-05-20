import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
}

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
  label?: string
}

export function Spinner({ size = 'md', className, label = 'Cargando' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-neutral-200 border-t-primary-500',
        SIZE_MAP[size],
        className
      )}
    />
  )
}
