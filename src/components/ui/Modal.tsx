'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton } from './IconButton'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_STYLES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  size?: ModalSize
  /** Cuerpo visible del modal. Omitir si la cabecera/descripción son suficientes. */
  children?: ReactNode
  footer?: ReactNode
  closeOnOverlay?: boolean
  hideCloseButton?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * Detecta children "vacíos" para no renderizar el wrapper con padding visible
 * cuando solo se pasó algo invisible (ej. un <span className="sr-only">).
 */
function hasVisibleChildren(children: ReactNode): boolean {
  if (children === null || children === undefined || children === false) return false
  if (typeof children === 'string' && children.trim() === '') return false
  return true
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
  hideCloseButton = false,
  className,
  ariaLabel,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus inicial + bloqueo de scroll: SOLO dependen de `open` para que
  // re-renders del padre (que pueden traer una nueva referencia a `onClose`)
  // no roben el foco a inputs internos.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  // Listener de Escape: depende de `onClose`. Re-attach silencioso si
  // cambia la referencia; no afecta al foco activo.
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div className="anim-overlay-in absolute inset-0 bg-black/40" aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'anim-modal-in relative z-10 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg focus:outline-none',
          SIZE_STYLES[size],
          className
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
            <div className="flex flex-col">
              {title && (
                <h2 className="font-serif text-xl font-semibold text-neutral-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-neutral-500">{description}</p>
              )}
            </div>
            {!hideCloseButton && (
              <IconButton
                size="sm"
                icon={<X size={18} strokeWidth={1.5} />}
                label="Cerrar"
                onClick={onClose}
              />
            )}
          </div>
        )}
        {hasVisibleChildren(children) && (
          <div className="px-6 py-5">{children}</div>
        )}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-100/50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
