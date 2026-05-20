'use client'

import { Children, cloneElement, isValidElement, ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label?: ReactNode
  helper?: ReactNode
  error?: ReactNode
  required?: boolean
  optional?: boolean
  htmlFor?: string
  hideLabel?: boolean
  className?: string
  children: ReactNode
}

export function FormField({
  label,
  helper,
  error,
  required,
  optional,
  htmlFor,
  hideLabel,
  className,
  children,
}: FormFieldProps) {
  const autoId = useId()
  const fieldId = htmlFor ?? autoId
  const helperId = helper ? `${fieldId}-helper` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined

  const enhancedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    const props = child.props as Record<string, unknown>
    const next: Record<string, unknown> = {}
    if (!props.id) next.id = fieldId
    if (!props['aria-describedby'] && describedBy) next['aria-describedby'] = describedBy
    if (error && props['aria-invalid'] === undefined) {
      next['aria-invalid'] = true
      if (!('invalid' in props)) next.invalid = true
    }
    return Object.keys(next).length ? cloneElement(child, next) : child
  })

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'text-[13px] font-medium text-neutral-900',
            hideLabel && 'sr-only'
          )}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-[#D32F2F]" aria-hidden>
              *
            </span>
          )}
          {optional && !required && (
            <span className="ml-1 text-xs font-normal text-neutral-500">(opcional)</span>
          )}
        </label>
      )}
      {enhancedChildren}
      {error ? (
        <p id={errorId} className="text-xs text-[#D32F2F]">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-xs text-neutral-500">
          {helper}
        </p>
      ) : null}
    </div>
  )
}
