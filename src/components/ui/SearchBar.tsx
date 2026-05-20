'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  size?: 'sm' | 'md'
  containerClassName?: string
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    {
      value,
      onChange,
      onClear,
      placeholder = 'Buscar…',
      size = 'md',
      disabled,
      containerClassName,
      className,
      ...rest
    },
    ref
  ) {
    const heightCls = size === 'sm' ? 'h-9' : 'h-10'

    const handleClear = () => {
      onChange('')
      onClear?.()
    }

    return (
      <div
        role="search"
        className={cn(
          'flex w-full items-center rounded-lg border border-neutral-200 bg-white transition-colors hover:border-neutral-300 focus-within:border-primary-500 focus-within:ring-3 focus-within:ring-primary-100/40',
          heightCls,
          disabled && 'bg-neutral-100 text-neutral-300',
          containerClassName
        )}
      >
        <Search
          size={18}
          strokeWidth={1.5}
          className="ml-3 mr-2 text-neutral-500"
          aria-hidden
        />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none disabled:cursor-not-allowed',
            className
          )}
          {...rest}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className="mr-2 rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>
    )
  }
)
