'use client'

import { EventForm } from '@/components/events/form/EventForm'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/contexts/AuthContext'

export default function NuevoEventoPage() {
  const { user, isHydrated } = useAuth()

  if (!isHydrated || !user || user.role !== 'seller') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  return <EventForm />
}
