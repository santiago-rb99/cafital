'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  invalid?: boolean
  disabled?: boolean
  searchable?: boolean
  emptyMessage?: string
  className?: string
  id?: string
  'aria-describedby'?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
  searchPlaceholder = 'Buscar…',
  invalid = false,
  disabled = false,
  searchable = true,
  emptyMessage = 'Sin resultados',
  className,
  id,
  'aria-describedby': describedBy,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const autoId = useId()
  const triggerId = id ?? autoId

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const toggle = (val: string) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val))
    else onChange([...value, val])
  }

  const remove = (val: string) => {
    onChange(value.filter((v) => v !== val))
  }

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const stateBorder = invalid
    ? 'border-[#D32F2F]'
    : open
      ? 'border-primary-500 ring-3 ring-primary-100/40'
      : 'border-neutral-200 hover:border-neutral-300'

  const selected = options.filter((o) => value.includes(o.value))

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        id={triggerId}
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-describedby={describedBy}
        className={cn(
          'flex min-h-10 w-full items-center gap-1.5 rounded border bg-white px-2 py-1 text-left text-sm text-neutral-900 transition-colors focus:outline-none',
          stateBorder,
          disabled && 'cursor-not-allowed bg-neutral-100 text-neutral-300'
        )}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1">
          {selected.length === 0 && (
            <span className="px-1 text-neutral-300">{placeholder}</span>
          )}
          {selected.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
            >
              {opt.label}
              <button
                type="button"
                aria-label={`Quitar ${opt.label}`}
                onClick={(e) => {
                  e.stopPropagation()
                  remove(opt.value)
                }}
                className="text-primary-700 hover:text-primary-900"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={cn('shrink-0 text-neutral-500 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md"
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-neutral-200 px-3">
              <Search size={16} strokeWidth={1.5} className="text-neutral-500" aria-hidden />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-neutral-500">{emptyMessage}</li>
            ) : (
              filtered.map((opt) => {
                const checked = value.includes(opt.value)
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={checked}
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-100',
                        checked && 'text-primary-700'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-4 w-4 items-center justify-center rounded border',
                          checked
                            ? 'border-primary-500 bg-primary-300'
                            : 'border-neutral-300 bg-white'
                        )}
                      >
                        {checked && (
                          <Check size={12} strokeWidth={2.5} className="text-white" />
                        )}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
