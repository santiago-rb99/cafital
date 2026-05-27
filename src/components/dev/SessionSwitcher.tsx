'use client'

import { useState } from 'react'
import { ChevronUp, User, Store, BadgeCheck, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DEV_USERS } from '@/data/mock/users'
import { Seller } from '@/types'
import { subscriptionLabel } from '@/lib/utils'

export function DevSessionSwitcher() {
  const [open, setOpen] = useState(false)
  const { user, login } = useAuth()

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans text-sm">
      {open && (
        <div className="mb-2 bg-neutral-900 text-neutral-50 rounded-xl shadow-lg border border-neutral-700 overflow-hidden w-64">
          <div className="px-4 py-3 border-b border-neutral-700 text-xs text-neutral-300 font-medium uppercase tracking-wider">
            Dev — Cambiar sesión
          </div>
          <ul>
            {DEV_USERS.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => { login(u.id); setOpen(false) }}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    user?.id === u.id
                      ? 'bg-primary-900 text-primary-100'
                      : 'hover:bg-neutral-800 text-neutral-50',
                  ].join(' ')}
                >
                  <span className="shrink-0">
                    {u.role === 'Comprador'
                      ? <User size={16} strokeWidth={1.5} />
                      : u.role === 'Administrador'
                        ? <ShieldCheck size={16} strokeWidth={1.5} />
                        : <Store size={16} strokeWidth={1.5} />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block truncate font-medium">{u.label}</span>
                    <span className="block text-xs text-neutral-400">
                      {u.role}{u.plan ? ` · ${u.plan}` : ''}
                    </span>
                  </span>
                  {user?.id === u.id && (
                    <BadgeCheck size={14} strokeWidth={1.5} className="text-primary-300 shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-neutral-900 text-neutral-50 px-3 py-2 rounded-lg shadow-lg border border-neutral-700 hover:bg-neutral-800 transition-colors"
      >
        <span className="text-xs text-neutral-400">Sesión:</span>
        <span className="font-medium text-xs truncate max-w-32">
          {user?.role === 'seller'
            ? (user as Seller).businessName
            : user?.role === 'buyer' || user?.role === 'admin'
              ? user.name
              : 'Sin sesión'}
        </span>
        {user?.role === 'seller' && (user as Seller).subscriptionPlan !== 'none' && (
          <span className="text-xs text-primary-300">
            · {subscriptionLabel((user as Seller).subscriptionPlan)}
          </span>
        )}
        <ChevronUp
          size={14}
          strokeWidth={1.5}
          className={`transition-transform ${open ? '' : 'rotate-180'}`}
        />
      </button>
    </div>
  )
}
