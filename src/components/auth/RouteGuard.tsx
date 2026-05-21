'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

interface RouteGuardProps {
  requireRole?: 'buyer' | 'seller'
  children: ReactNode
}

export function RouteGuard({ requireRole, children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isHydrated } = useAuth()
  const { showWarning } = useToast()
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (!isHydrated) return

    if (!user) {
      const next = encodeURIComponent(pathname ?? '/')
      router.replace(`/login?next=${next}`)
      return
    }

    if (requireRole && user.role !== requireRole) {
      if (!notifiedRef.current) {
        notifiedRef.current = true
        showWarning(
          'Acceso restringido',
          requireRole === 'seller'
            ? 'Esta sección es solo para vendedores.'
            : 'Esta sección requiere una cuenta de comprador.'
        )
      }
      router.replace('/')
    }
  }, [isHydrated, user, requireRole, pathname, router, showWarning])

  const allowed =
    isHydrated && user !== null && (!requireRole || user.role === requireRole)

  if (!allowed) {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 py-16"
        aria-busy="true"
        aria-live="polite"
      >
        <Spinner size="md" />
        <p className="text-sm text-neutral-500">Verificando tu sesión…</p>
      </div>
    )
  }

  return <>{children}</>
}
