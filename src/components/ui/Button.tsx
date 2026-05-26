import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'checkout'
  | 'destructive'
  | 'ghost'
  | 'link'

export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-300 text-white hover:bg-primary-500 active:bg-primary-700 disabled:bg-neutral-200 disabled:text-neutral-300',
  secondary:
    'bg-white text-secondary-300 border border-secondary-300 hover:bg-secondary-50 disabled:bg-neutral-100 disabled:text-neutral-300 disabled:border-neutral-200',
  checkout:
    'bg-accent-500 text-white hover:bg-accent-700 disabled:bg-neutral-200 disabled:text-neutral-300',
  destructive:
    'bg-[#D32F2F] text-white hover:bg-[#9A1F1F] disabled:bg-neutral-200 disabled:text-neutral-300',
  ghost:
    'bg-transparent text-neutral-900 hover:bg-neutral-100 disabled:text-neutral-300',
  link:
    'bg-transparent text-primary-300 hover:text-primary-500 underline-offset-2 hover:underline disabled:text-neutral-300 px-0 h-auto',
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  children?: ReactNode
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type AnchorProps = CommonProps & {
  href: string
  target?: string
  rel?: string
  className?: string
  onClick?: () => void
  'aria-label'?: string
}

function buildClassName({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: Pick<CommonProps, 'variant' | 'size' | 'fullWidth'> & { className?: string }) {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed select-none',
    VARIANT_STYLES[variant],
    variant === 'link' ? 'h-auto px-0' : SIZE_STYLES[size],
    fullWidth && 'w-full',
    className
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    leadingIcon,
    trailingIcon,
    children,
    className,
    disabled,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buildClassName({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  )
})

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth,
  leadingIcon,
  trailingIcon,
  children,
  className,
  href,
  target,
  rel,
  onClick,
  ...rest
}: AnchorProps) {
  const external = href.startsWith('http')
  const computedRel = rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)
  const classes = buildClassName({ variant, size, fullWidth, className })

  if (external) {
    return (
      <a
        href={href}
        target={target}
        rel={computedRel}
        className={classes}
        onClick={onClick}
        {...rest}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} onClick={onClick} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  )
}
