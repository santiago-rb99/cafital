'use client'

import { useEffect, useState } from 'react'

import { Skeleton } from '@/components/ui/Skeleton'
import { BecomeSellerLanding } from '@/components/shop/BecomeSellerLanding'
import { ProfilePreviewShell } from '@/components/shop/profile-preview/ProfilePreviewShell'

import { useAuth } from '@/contexts/AuthContext'
import { AdvertisingState, getAdvertising } from '@/lib/api/advertising'
import { listPublicationsBySeller } from '@/lib/api/publications'
import { listEventsByOrganizer } from '@/lib/api/events'
import { CafeEvent, Publication, Seller } from '@/types'

interface ProfileData {
  advertising: AdvertisingState
  publications: Publication[]
  events: CafeEvent[]
}

export default function MiTiendaPerfilPage() {
  const { user, isHydrated } = useAuth()
  const [data, setData] = useState<ProfileData | null>(null)

  const [trackedSellerId, setTrackedSellerId] = useState<string | null>(null)
  if (user?.id !== trackedSellerId) {
    setTrackedSellerId(user?.id ?? null)
    setData(null)
  }

  useEffect(() => {
    if (!user || user.role !== 'seller') return
    let cancelled = false
    Promise.all([
      getAdvertising(user.id),
      listPublicationsBySeller(user.id),
      listEventsByOrganizer(user.id),
    ]).then(([advertising, publications, events]) => {
      if (!cancelled) setData({ advertising, publications, events })
    })
    return () => {
      cancelled = true
    }
  }, [user])

  if (!isHydrated) return <PageSkeleton />
  if (user?.role === 'buyer') return <BecomeSellerLanding />
  if (!data) return <PageSkeleton />

  const seller = user as Seller

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Mi perfil público
        </h1>
        <p className="text-sm text-neutral-500">
          Edita tu perfil sin salir de la página — los cambios se reflejan en
          tiempo real.
        </p>
      </header>

      <ProfilePreviewShell
        seller={seller}
        advertising={data.advertising}
        publications={data.publications}
        events={data.events}
      />
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </header>
      <Skeleton className="h-16 w-full" rounded="xl" />
      <Skeleton className="h-72 w-full" rounded="xl" />
      <Skeleton className="h-72 w-full" rounded="xl" />
      <Skeleton className="h-56 w-full" rounded="xl" />
    </div>
  )
}
