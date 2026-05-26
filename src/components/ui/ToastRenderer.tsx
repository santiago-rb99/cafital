'use client'

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { ToastData, ToastType } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<
  ToastType,
  { bg: string; border: string; title: string; description: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    bg: 'bg-[#F4F7F4]',
    border: 'border-l-[#314531]',
    title: 'text-[#0C130C]',
    description: 'text-[#182618]',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'bg-[#FDEAEA]',
    border: 'border-l-[#D32F2F]',
    title: 'text-[#601212]',
    description: 'text-[#9A1F1F]',
    Icon: AlertCircle,
  },
  warning: {
    bg: 'bg-[#FDEFC2]',
    border: 'border-l-[#C9870E]',
    title: 'text-[#4A2E04]',
    description: 'text-[#8C5A08]',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-[#E3F2FD]',
    border: 'border-l-[#1565C0]',
    title: 'text-[#0D3C7A]',
    description: 'text-[#1565C0]',
    Icon: Info,
  },
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const styles = TYPE_STYLES[toast.type]
  const { Icon } = styles

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'anim-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border-l-[3px] px-4 py-3 shadow-md',
        styles.bg,
        styles.border
      )}
    >
      <Icon size={20} strokeWidth={1.5} className={cn('mt-0.5 shrink-0', styles.title)} />
      <div className="flex-1 leading-snug">
        <p className={cn('text-[13px] font-medium', styles.title)}>{toast.title}</p>
        {toast.description && (
          <p className={cn('mt-0.5 text-xs', styles.description)}>{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className={cn(
          'shrink-0 rounded p-0.5 transition-colors',
          'hover:bg-black/5',
          styles.title
        )}
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function ToastRenderer() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      aria-label="Notificaciones"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-end gap-2 p-4 sm:right-4 sm:bottom-4 sm:left-auto sm:p-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}
