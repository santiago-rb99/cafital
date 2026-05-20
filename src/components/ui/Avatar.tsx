import Image from 'next/image'
import { cn } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZE_MAP: Record<AvatarSize, { box: string; px: number; text: string }> = {
  xs: { box: 'h-7 w-7', px: 28, text: 'text-[11px]' },
  sm: { box: 'h-9 w-9', px: 36, text: 'text-xs' },
  md: { box: 'h-12 w-12', px: 48, text: 'text-sm' },
  lg: { box: 'h-16 w-16', px: 64, text: 'text-base' },
  xl: { box: 'h-20 w-20', px: 80, text: 'text-lg' },
}

interface AvatarProps {
  src?: string | null
  alt: string
  size?: AvatarSize
  fallback?: string
  className?: string
  square?: boolean
}

function initials(text: string) {
  return text
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Avatar({
  src,
  alt,
  size = 'md',
  fallback,
  className,
  square = false,
}: AvatarProps) {
  const { box, px, text } = SIZE_MAP[size]
  const radius = square ? 'rounded-lg' : 'rounded-full'

  if (src) {
    return (
      <span
        className={cn(
          'relative inline-block overflow-hidden bg-neutral-100',
          radius,
          box,
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="h-full w-full object-cover"
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center bg-neutral-200 font-medium text-neutral-500',
        radius,
        box,
        text,
        className
      )}
      aria-label={alt}
    >
      {initials(fallback ?? alt)}
    </span>
  )
}
