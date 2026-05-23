'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Ticket } from 'lucide-react'

import { CafeEvent } from '@/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Tabs } from '@/components/ui/Tabs'
import { RegistrationCard } from '@/components/events/RegistrationCard'

import { useAuth } from '@/contexts/AuthContext'
import {
  EventRegistration,
  getEvent,
  listRegistrationsByUser,
} from '@/lib/api/events'

type Tab = 'upcoming' | 'past'

export default function InscripcionesPage() {
  const { user, isHydrated } = useAuth()
  const [registrations, setRegistrations] = useState<EventRegistration[] | null>(null)
  const [eventsById, setEventsById] = useState<Map<string, CafeEvent>>(new Map())
  const [tab, setTab] = useState<Tab>('upcoming')

  // Reset al cambiar de usuario.
  const [trackedUserId, setTrackedUserId] = useState<string | null>(null)
  if (user?.id !== trackedUserId) {
    setTrackedUserId(user?.id ?? null)
    setRegistrations(null)
  }

  const reload = useCallback(() => {
    if (!user) return
    listRegistrationsByUser(user.id).then(async (regs) => {
      setRegistrations(regs)
      const events = await Promise.all(regs.map((r) => getEvent(r.eventId)))
      const map = new Map<string, CafeEvent>()
      for (const e of events) {
        if (e) map.set(e.id, e)
      }
      setEventsById(map)
    })
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  const today = new Date().toISOString().slice(0, 10)

  const { upcoming, past } = useMemo(() => {
    const u: EventRegistration[] = []
    const p: EventRegistration[] = []
    for (const r of registrations ?? []) {
      const e = eventsById.get(r.eventId)
      if (!e) continue
      if (e.date >= today) u.push(r)
      else p.push(r)
    }
    return { upcoming: u, past: p }
  }, [registrations, eventsById, today])

  if (!isHydrated || registrations === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  const visible = tab === 'upcoming' ? upcoming : past

  return (
    <div className="bg-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs items={[{ label: 'Mis inscripciones' }]} className="mb-5" />

        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Mis inscripciones
          </h1>
          <p className="text-sm text-neutral-500">
            Eventos en los que estás inscrito o que ya pasaron.
          </p>
        </header>

        {registrations.length === 0 ? (
          <EmptyState
            icon={<Ticket size={28} strokeWidth={1.5} />}
            title="Sin inscripciones todavía"
            description="Explora los próximos eventos del ecosistema cafetero boliviano."
            action={
              <Link
                href="/eventos"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
              >
                Ver eventos
              </Link>
            }
          />
        ) : (
          <>
            <Tabs
              items={[
                { value: 'upcoming', label: 'Próximos', count: upcoming.length },
                { value: 'past', label: 'Pasados', count: past.length },
              ]}
              value={tab}
              onChange={setTab}
              ariaLabel="Inscripciones por fecha"
              className="mb-6"
            />

            {visible.length === 0 ? (
              <EmptyState
                icon={<Ticket size={28} strokeWidth={1.5} />}
                title={
                  tab === 'upcoming'
                    ? 'Sin inscripciones próximas'
                    : 'Sin inscripciones pasadas'
                }
                description={
                  tab === 'upcoming'
                    ? 'Cuando te inscribas en un evento futuro aparecerá aquí.'
                    : 'Aquí verás tus inscripciones a eventos ya realizados.'
                }
              />
            ) : (
              <ul role="list" className="flex flex-col gap-4">
                {visible.map((r) => {
                  const ev = eventsById.get(r.eventId)
                  if (!ev) return null
                  return (
                    <li key={r.id}>
                      <RegistrationCard
                        registration={r}
                        event={ev}
                        onChange={reload}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}
