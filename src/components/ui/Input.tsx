import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    invalid = false,
    leadingIcon,
    trailingIcon,
    containerClassName,
    className,
    disabled,
    ...rest
  },
  ref
) {
  const base =
    'flex h-10 w-full items-center rounded border bg-white transition-colors'
  const stateBorder = invalid
    ? 'border-[#D32F2F] focus-within:border-[#D32F2F] focus-within:ring-3 focus-within:ring-red-200/40'
    : 'border-neutral-200 hover:border-neutral-300 focus-within:border-primary-500 focus-within:ring-3 focus-within:ring-primary-100/40'
  const disabledCls = disabled
    ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed border-neutral-200 hover:border-neutral-200 focus-within:ring-0'
    : ''

  return (
    <div className={cn(base, stateBorder, disabledCls, containerClassName)}>
      {leadingIcon && (
        <span className="pl-3 text-neutral-500" aria-hidden>
          {leadingIcon}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none disabled:cursor-not-allowed',
          leadingIcon && 'pl-2',
          trailingIcon && 'pr-2',
          className
        )}
        {...rest}
      />
      {trailingIcon && (
        <span className="pr-3 text-neutral-500" aria-hidden>
          {trailingIcon}
        </span>
      )}
    </div>
  )
})
