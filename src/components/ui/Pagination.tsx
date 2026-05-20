'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
  ariaLabel?: string
}

function buildPages(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | 'gap')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) pages.push('gap')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('gap')
  pages.push(total)
  return pages
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
  ariaLabel = 'Paginación',
}: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = buildPages(page, totalPages)

  return (
    <nav aria-label={ariaLabel} className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Página anterior"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>
      {pages.map((p, idx) =>
        p === 'gap' ? (
          <span key={`gap-${idx}`} className="px-1.5 text-sm text-neutral-500" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors',
              p === page
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </nav>
  )
}
