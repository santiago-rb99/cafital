import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid = false, className, disabled, rows = 4, ...rest }, ref) {
    const stateBorder = invalid
      ? 'border-[#D32F2F] focus:border-[#D32F2F] focus:ring-3 focus:ring-red-200/40'
      : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-3 focus:ring-primary-100/40'
    const disabledCls = disabled
      ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
      : 'bg-white'

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full rounded border px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-300 transition-colors focus:outline-none resize-y',
          stateBorder,
          disabledCls,
          className
        )}
        {...rest}
      />
    )
  }
)
