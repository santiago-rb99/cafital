import { forwardRef, ReactNode, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[]
  placeholder?: string
  invalid?: boolean
  leadingIcon?: ReactNode
  containerClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    placeholder,
    invalid = false,
    leadingIcon,
    containerClassName,
    className,
    disabled,
    value,
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
    ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed border-neutral-200'
    : ''

  return (
    <div className={cn(base, stateBorder, disabledCls, containerClassName)}>
      {leadingIcon && (
        <span className="pl-3 text-neutral-500" aria-hidden>
          {leadingIcon}
        </span>
      )}
      <select
        ref={ref}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-full w-full appearance-none bg-transparent pl-3 pr-9 text-sm text-neutral-900 focus:outline-none disabled:cursor-not-allowed',
          !value && placeholder && 'text-neutral-300',
          leadingIcon && 'pl-2',
          className
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        strokeWidth={1.5}
        className="pointer-events-none -ml-9 mr-3 text-neutral-500"
        aria-hidden
      />
    </div>
  )
})
