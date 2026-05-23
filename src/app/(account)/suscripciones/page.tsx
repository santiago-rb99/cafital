'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Repeat2 } from 'lucide-react'

import { RecurringSubscription } from '@/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { RecurringSubscriptionCard } from '@/components/recurring/RecurringSubscriptionCard'

import { useAuth } from '@/contexts/AuthContext'
import { listRecurringByBuyer } from '@/lib/api/recurring'

export default function SuscripcionesPage() {
  const { user, isHydrated } = useAuth()
  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[] | null>(null)

  const reload = useCallback(() => {
    if (!user) return
    listRecurringByBuyer(user.id).then(setSubscriptions)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])


  if (!isHydrated || subscriptions === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  const activeCount = subscriptions.filter((s) => s.active).length

  return (
    <div className="bg-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs items={[{ label: 'Compras recurrentes' }]} className="mb-5" />

        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Compras recurrentes
          </h1>
          <p className="text-sm text-neutral-500">
            {subscriptions.length === 0
              ? 'Aún no tienes compras recurrentes.'
              : `${activeCount} de ${subscriptions.length} activas. Te avisamos 3 días antes de cada entrega.`}
          </p>
        </header>

        {subscriptions.length === 0 ? (
          <EmptyState
            icon={<Repeat2 size={28} strokeWidth={1.5} />}
            title="Sin compras recurrentes"
            description="Activa compra recurrente desde cualquier publicación de café o servicios para programar entregas automáticas."
            action={
              <Link
                href="/catalogo?category=A"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
              >
                Ver café e insumos
              </Link>
            }
          />
        ) : (
          <ul role="list" className="flex flex-col gap-4">
            {subscriptions.map((sub) => (
              <li key={sub.id}>
                <RecurringSubscriptionCard subscription={sub} onChange={reload} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
