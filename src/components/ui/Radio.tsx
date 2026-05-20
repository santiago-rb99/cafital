'use client'

import {
  ChangeEvent,
  createContext,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useContext,
  useId,
} from 'react'
import { cn } from '@/lib/utils'

interface RadioGroupContextValue {
  name: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

interface RadioGroupProps {
  name?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  children: ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
  ariaLabel?: string
}

export function RadioGroup({
  name,
  value,
  onChange,
  disabled,
  children,
  className,
  orientation = 'vertical',
  ariaLabel,
}: RadioGroupProps) {
  const autoName = useId()
  return (
    <RadioGroupContext.Provider
      value={{ name: name ?? autoName, value, onChange, disabled }}
    >
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn(
          orientation === 'vertical' ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-4',
          className
        )}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'name' | 'onChange' | 'size'> {
  value: string
  label?: ReactNode
  description?: ReactNode
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, description, id, className, disabled, ...rest },
  ref
) {
  const ctx = useContext(RadioGroupContext)
  const autoId = useId()
  const inputId = id ?? autoId

  if (!ctx) {
    throw new Error('Radio must be used inside a RadioGroup')
  }

  const isDisabled = disabled || ctx.disabled
  const checked = ctx.value === value
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) ctx.onChange(value)
  }

  const dot = (
    <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
      <input
        ref={ref}
        id={inputId}
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={isDisabled}
        onChange={handle}
        className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full border border-neutral-300 bg-white transition-colors checked:border-primary-500 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50"
        {...rest}
      />
      <span
        aria-hidden
        className="pointer-events-none relative h-2 w-2 rounded-full bg-primary-500 opacity-0 transition-opacity peer-checked:opacity-100"
      />
    </span>
  )

  if (!label && !description) {
    return <span className={cn('inline-flex', className)}>{dot}</span>
  }

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer items-start gap-2.5',
        isDisabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      {dot}
      <span className="flex flex-col leading-tight">
        {label && (
          <span className="text-[13px] font-medium text-neutral-900">{label}</span>
        )}
        {description && (
          <span className="text-xs text-neutral-500">{description}</span>
        )}
      </span>
    </label>
  )
})
