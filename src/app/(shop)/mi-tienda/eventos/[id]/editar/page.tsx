'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { CafeEvent } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { EventForm } from '@/components/events/form/EventForm'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getEvent } from '@/lib/api/events'

export default function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user, isHydrated } = useAuth()
  const { showError } = useToast()
  const router = useRouter()
  const [event, setEvent] = useState<CafeEvent | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!isHydrated) return
    if (!user || user.role !== 'seller') return
    let cancelled = false
    getEvent(id).then((e) => {
      if (cancelled) return
      if (!e) {
        setNotFound(true)
      } else if (e.organizerId !== user.id) {
        showError('No puedes editar este evento')
        router.replace('/mi-tienda/eventos')
      } else {
        setEvent(e)
      }
    })
    return () => {
      cancelled = true
    }
  }, [id, user, isHydrated, router, showError])

  const loading = !event && !notFound

  if (!isHydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (notFound) {
    return (
      <EmptyState
        title="Evento no encontrado"
        description="El evento que buscas no existe o fue eliminado."
        action={
          <Link
            href="/mi-tienda/eventos"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
            Volver a Mis eventos
          </Link>
        }
      />
    )
  }

  if (!event) return null

  return <EventForm initial={event} />
}
