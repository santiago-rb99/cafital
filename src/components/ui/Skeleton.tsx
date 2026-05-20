import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const ROUNDED_MAP = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
}

export function Skeleton({ className, rounded = 'sm' }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'block animate-pulse bg-neutral-200',
        ROUNDED_MAP[rounded],
        className
      )}
    />
  )
}
