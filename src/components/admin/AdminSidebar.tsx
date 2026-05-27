'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import {
  BadgeCheck,
  Calendar,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { listSellersByVerification } from '@/lib/api/admin'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: ReactNode
  matchExact?: boolean
  badgeKey?: 'pendingVerifications'
}

const ADMIN_NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Resumen',
    icon: <LayoutDashboard size={18} strokeWidth={1.5} />,
    matchExact: true,
  },
  {
    href: '/admin/usuarios',
    label: 'Usuarios',
    icon: <Users size={18} strokeWidth={1.5} />,
  },
  {
    href: '/admin/verificaciones',
    label: 'Verificaciones',
    icon: <BadgeCheck size={18} strokeWidth={1.5} />,
    badgeKey: 'pendingVerifications',
  },
  {
    href: '/admin/publicaciones',
    label: 'Publicaciones',
    icon: <Package size={18} strokeWidth={1.5} />,
  },
  {
    href: '/admin/eventos',
    label: 'Eventos',
    icon: <Calendar size={18} strokeWidth={1.5} />,
  },
  {
    href: '/admin/suscripciones',
    label: 'Suscripciones',
    icon: <Sparkles size={18} strokeWidth={1.5} />,
  },
]

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    listSellersByVerification('pending')
      .then((sellers) => {
        if (!cancelled) setPendingCount(sellers.length)
      })
      .catch(() => {
        if (!cancelled) setPendingCount(0)
      })
    return () => {
      cancelled = true
    }
    // Re-fetch al cambiar de ruta (ej. tras aprobar/rechazar)
  }, [pathname])

  const badgeValueFor = (key?: NavItem['badgeKey']): number | null => {
    if (key === 'pendingVerifications') return pendingCount ?? null
    return null
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-neutral-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary-100 text-secondary-700"
          >
            <ShieldCheck size={22} strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">
              Panel admin
            </p>
            <p className="mt-0.5 truncate text-xs text-neutral-500">
              {user?.role === 'admin' ? user.name : 'Equipo Cafital'}
            </p>
          </div>
        </div>
      </div>

      <nav aria-label="Panel admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV.map((item) => {
            const active = item.matchExact
              ? pathname === item.href
              : pathname === item.href ||
                pathname?.startsWith(item.href + '/')
            const badgeValue = badgeValueFor(item.badgeKey)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <span
                    className={
                      active ? 'text-primary-500' : 'text-neutral-500'
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {badgeValue !== null && badgeValue > 0 && (
                    <span
                      aria-label={`${badgeValue} pendientes`}
                      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1.5 text-[11px] font-semibold text-white"
                    >
                      {badgeValue}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-neutral-200 px-5 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
        >
          ← Volver al marketplace
        </Link>
      </div>
    </div>
  )
}
