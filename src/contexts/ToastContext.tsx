'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ToastData, ToastType } from '@/types'
import { generateId } from '@/lib/utils'

interface ToastContextType {
  toasts: ToastData[]
  showToast: (data: Omit<ToastData, 'id'>) => void
  showSuccess: (title: string, description?: string) => void
  showError: (title: string, description?: string) => void
  showWarning: (title: string, description?: string) => void
  showInfo: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (data: Omit<ToastData, 'id'>) => {
      const id = generateId()
      setToasts((prev) => [...prev, { ...data, id }])
      if (data.type !== 'error') {
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
      }
    },
    [dismiss]
  )

  const show = (type: ToastType) => (title: string, description?: string) =>
    showToast({ type, title, description })

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess: show('success'),
        showError: show('error'),
        showWarning: show('warning'),
        showInfo: show('info'),
        dismiss,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
