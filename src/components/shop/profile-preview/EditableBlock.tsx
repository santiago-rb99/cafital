'use client'

import { ReactNode } from 'react'
import { ExternalLink, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableBlockProps {
  label: string
  /** Cuando false (toggle "Ver como visitante"), oculta overlays y bordes. */
  enabled: boolean
  /** Click en el lápiz / icono. */
  onEdit?: () => void
  /** Si se pasa un href, el botón pasa a ser un enlace con icono `ExternalLink`. */
  href?: string
  /** Etiqueta corta visible cuando el bloque está en hover. */
  hint?: string
  /** Variante con menos padding visual — útil para imágenes a sangrado. */
  flush?: boolean
  className?: string
  children: ReactNode
}

const BTN_BASE =
  'inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-primary-700 shadow-md ring-1 ring-primary-100 transition-all hover:bg-primary-50 hover:ring-primary-300 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100'

export function EditableBlock({
  label,
  enabled,
  onEdit,
  href,
  hint,
  flush = false,
  className,
  children,
}: EditableBlockProps) {
  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  const Icon = href ? ExternalLink : Pencil
  const ariaLabel = href ? `Ir a ${label}` : `Editar ${label}`

  const action = href ? (
    <a href={href} aria-label={ariaLabel} className={BTN_BASE}>
      <Icon size={14} strokeWidth={1.5} aria-hidden />
      <span className="hidden sm:inline">{hint ?? label}</span>
    </a>
  ) : (
    <button
      type="button"
      onClick={onEdit}
      aria-label={ariaLabel}
      className={BTN_BASE}
    >
      <Icon size={14} strokeWidth={1.5} aria-hidden />
      <span className="hidden sm:inline">{hint ?? 'Editar'}</span>
    </button>
  )

  return (
    <div
      className={cn(
        'group/editable relative rounded-2xl outline-2 outline-transparent transition-[outline-color] duration-200 hover:outline-primary-100 focus-within:outline-primary-300',
        flush && 'outline-offset-0',
        !flush && 'outline-offset-4',
        className,
      )}
    >
      {children}
      <div
        className={cn(
          'pointer-events-none absolute right-3 top-3 z-10 transition-all duration-200 ease-out sm:right-4 sm:top-4',
          // Mobile: always visible (touch-first, no hover).
          // Desktop: fade + scale in on hover / keyboard focus.
          'opacity-100 sm:scale-95 sm:opacity-0',
          'sm:group-hover/editable:scale-100 sm:group-hover/editable:opacity-100',
          'sm:group-focus-within/editable:scale-100 sm:group-focus-within/editable:opacity-100',
        )}
      >
        <div className="pointer-events-auto">{action}</div>
      </div>
    </div>
  )
}
