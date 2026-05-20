import { cn, formatPrice } from '@/lib/utils'

interface PriceTagProps {
  amount: number
  /** Discount percentage (e.g. 10 for 10%). When provided, the amount is shown as the discounted price. */
  discountPercent?: number
  unit?: string
  size?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'end'
  className?: string
}

const SIZE_STYLES = {
  sm: { price: 'text-base font-semibold', strike: 'text-xs', unit: 'text-xs' },
  md: { price: 'text-lg font-semibold', strike: 'text-sm', unit: 'text-xs' },
  lg: { price: 'text-2xl font-semibold font-serif', strike: 'text-sm', unit: 'text-sm' },
}

export function PriceTag({
  amount,
  discountPercent,
  unit,
  size = 'md',
  align = 'start',
  className,
}: PriceTagProps) {
  const cls = SIZE_STYLES[size]
  const hasDiscount = typeof discountPercent === 'number' && discountPercent > 0
  const originalAmount = hasDiscount
    ? amount / (1 - discountPercent! / 100)
    : null

  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 leading-tight',
        align === 'end' && 'items-end text-right',
        className
      )}
    >
      <div className="flex items-baseline gap-2">
        <span className={cn('text-neutral-900 tabular-nums', cls.price)}>
          {formatPrice(amount)}
        </span>
        {originalAmount !== null && (
          <span className={cn('text-neutral-500 line-through tabular-nums', cls.strike)}>
            {formatPrice(originalAmount)}
          </span>
        )}
      </div>
      {unit && <span className={cn('text-neutral-500', cls.unit)}>/ {unit}</span>}
    </div>
  )
}

interface QuotePriceProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function QuotePrice({ size = 'md', className }: QuotePriceProps) {
  const cls = SIZE_STYLES[size]
  return (
    <span className={cn('font-medium text-neutral-500', cls.price, className)}>
      Bajo cotización
    </span>
  )
}
