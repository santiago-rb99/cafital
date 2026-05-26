'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import {
  BarChart3,
  Calendar,
  LayoutDashboard,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, Badge } from '@/components/ui'
import { Seller } from '@/types'
import { cn, subscriptionLabel } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: ReactNode
  matchExact?: boolean
  requiresPlan?: 'exportacion'
}

const SHOP_NAV: NavItem[] = [
  {
    href: '/mi-tienda',
    label: 'Resumen',
    icon: <LayoutDashboard size={18} strokeWidth={1.5} />,
    matchExact: true,
  },
  {
    href: '/mi-tienda/pedidos',
    label: 'Pedidos recibidos',
    icon: <ShoppingBag size={18} strokeWidth={1.5} />,
  },
  {
    href: '/mi-tienda/publicaciones',
    label: 'Mis publicaciones',
    icon: <Package size={18} strokeWidth={1.5} />,
  },
  {
    href: '/mi-tienda/eventos',
    label: 'Mis eventos',
    icon: <Calendar size={18} strokeWidth={1.5} />,
  },
  {
    href: '/mi-tienda/estadisticas',
    label: 'Estadísticas',
    icon: <BarChart3 size={18} strokeWidth={1.5} />,
    requiresPlan: 'exportacion',
  },
  {
    href: '/mi-tienda/planes',
    label: 'Planes',
    icon: <Sparkles size={18} strokeWidth={1.5} />,
  },
  {
    href: '/mi-tienda/ajustes',
    label: 'Ajustes de tienda',
    icon: <Settings size={18} strokeWidth={1.5} />,
  },
]

interface ShopSidebarProps {
  onNavigate?: () => void
}

export function ShopSidebar({ onNavigate }: ShopSidebarProps) {
  const pathname = usePathname()
  const { user, isSeller, subscriptionPlan } = useAuth()

  const seller = isSeller ? (user as Seller) : null
  const items = SHOP_NAV.filter(
    (item) => !item.requiresPlan || item.requiresPlan === subscriptionPlan
  )

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Encabezado del vendedor */}
      <div className="border-b border-neutral-200 px-5 py-5">
        {seller ? (
          <div className="flex items-center gap-3">
            <Avatar
              src={seller.logo}
              alt={seller.businessName}
              fallback={seller.businessName}
              size="md"
              square
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-900">
                {seller.businessName}
              </p>
              {seller.association && (
                <p
                  className="mt-0.5 truncate text-[11px] text-neutral-500"
                  title={seller.association}
                >
                  {seller.association}
                </p>
              )}
              {subscriptionPlan !== 'none' ? (
                <Badge variant="primary" className="mt-1">
                  {subscriptionLabel(subscriptionPlan)}
                </Badge>
              ) : (
                <p className="mt-0.5 text-xs text-neutral-500">Sin suscripción</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-neutral-500">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
              <Store size={20} strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Mi Tienda</p>
              <p className="text-xs">Inicia sesión como vendedor</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA primario */}
      <div className="border-b border-neutral-200 px-5 py-4">
        <Link
          href="/mi-tienda/publicaciones/nueva"
          onClick={onNavigate}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
        >
          <Plus size={18} strokeWidth={1.5} />
          Nueva publicación
        </Link>
      </div>

      {/* Navegación */}
      <nav aria-label="Mi Tienda" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = item.matchExact
              ? pathname === item.href
              : pathname === item.href ||
                pathname?.startsWith(item.href + '/')
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
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer del sidebar — atajo al marketplace */}
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
