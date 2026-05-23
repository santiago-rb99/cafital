'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton } from './IconButton'

type DrawerSide = 'right' | 'left' | 'bottom'
type DrawerSize = 'sm' | 'md' | 'lg'

const SIDE_BASE: Record<DrawerSide, string> = {
  right: 'top-0 right-0 h-full',
  left: 'top-0 left-0 h-full',
  bottom: 'bottom-0 inset-x-0 max-h-[90vh] rounded-t-2xl',
}

const SIDE_ANIM: Record<DrawerSide, string> = {
  right: 'anim-drawer-right',
  left: 'anim-drawer-left',
  bottom: 'anim-drawer-bottom',
}

const WIDTH_STYLES: Record<DrawerSize, string> = {
  sm: 'w-full sm:max-w-sm',
  md: 'w-full sm:max-w-md',
  lg: 'w-full sm:max-w-lg',
}

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  side?: DrawerSide
  size?: DrawerSize
  children: ReactNode
  footer?: ReactNode
  closeOnOverlay?: boolean
  className?: string
  ariaLabel?: string
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
  className,
  ariaLabel,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus inicial + bloqueo de scroll: SOLO dependen de `open` para que
  // re-renders del padre (con nueva referencia a `onClose`) no roben el
  // foco a inputs internos del drawer.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
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

  const widthCls = side === 'bottom' ? 'w-full' : WIDTH_STYLES[size]

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="anim-overlay-in absolute inset-0 bg-black/40"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={cn(
          'absolute flex flex-col border-neutral-200 bg-white shadow-lg focus:outline-none',
          SIDE_BASE[side],
          SIDE_ANIM[side],
          side === 'right' && 'border-l',
          side === 'left' && 'border-r',
          side === 'bottom' && 'border-t',
          widthCls,
          className
        )}
      >
        {(title || true) && (
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
            <div className="flex flex-col">
              {title && (
                <h2 className="font-serif text-lg font-semibold text-neutral-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
              )}
            </div>
            <IconButton
              size="sm"
              icon={<X size={18} strokeWidth={1.5} />}
              label="Cerrar"
              onClick={onClose}
            />
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-100/50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
