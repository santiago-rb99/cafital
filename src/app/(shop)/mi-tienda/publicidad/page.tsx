'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock, Megaphone, Sparkles } from 'lucide-react'

import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { BecomeSellerLanding } from '@/components/shop/BecomeSellerLanding'
import { AppearancesProgress } from '@/components/shop/advertising/AppearancesProgress'
import { HeroAdvertisingCard } from '@/components/shop/advertising/HeroAdvertisingCard'
import { GalleryManagerCard } from '@/components/shop/advertising/GalleryManagerCard'
import { PromotedEventCard } from '@/components/shop/advertising/PromotedEventCard'

import { useAuth } from '@/contexts/AuthContext'
import { AdvertisingState, getAdvertising } from '@/lib/api/advertising'
import { listEventsByOrganizer } from '@/lib/api/events'
import { CafeEvent, Seller } from '@/types'
import { subscriptionLabel } from '@/lib/utils'

export default function MiTiendaPublicidadPage() {
  const { user, isHydrated } = useAuth()
  const [advertising, setAdvertising] = useState<AdvertisingState | null>(null)
  const [events, setEvents] = useState<CafeEvent[]>([])
  const [loading, setLoading] = useState(true)

  const [trackedSellerId, setTrackedSellerId] = useState<string | null>(null)
  if (user?.id !== trackedSellerId) {
    setTrackedSellerId(user?.id ?? null)
    setAdvertising(null)
    setEvents([])
    setLoading(true)
  }

  useEffect(() => {
    if (!user || user.role !== 'seller') return
    let cancelled = false
    Promise.all([
      getAdvertising(user.id),
      listEventsByOrganizer(user.id, { includeAllStatuses: true }),
    ])
      .then(([ad, evs]) => {
        if (!cancelled) {
          setAdvertising(ad)
          setEvents(evs)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  if (!isHydrated) return <PageSkeleton />
  if (user?.role === 'buyer') return <BecomeSellerLanding />
  if (loading || !advertising) return <PageSkeleton />

  const seller = user as Seller

  // Plan sin suscripción → estado bloqueado con CTA a Planes
  if (seller.subscriptionPlan === 'none') {
    return <LockedState />
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Publicidad
          </h1>
          <p className="text-sm text-neutral-500">
            Gestiona tu hero, galería y evento destacado. Plan actual:{' '}
            <Badge variant="primary">
              {subscriptionLabel(seller.subscriptionPlan)}
            </Badge>
          </p>
        </div>
      </header>

      <AppearancesProgress
        used={advertising.adAppearancesUsed}
        max={advertising.adAppearancesMax}
      />

      <HeroAdvertisingCard seller={seller} />

      <GalleryManagerCard seller={seller} galleryMax={advertising.galleryMax} />

      <PromotedEventCard seller={seller} events={events} />
    </div>
  )
}

function LockedState() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Publicidad
        </h1>
        <p className="text-sm text-neutral-500">
          Promociona tu tienda y tus eventos en el marketplace.
        </p>
      </header>

      <EmptyState
        icon={<Lock size={28} strokeWidth={1.5} />}
        title="La Publicidad está disponible desde el plan Semilla"
        description={
          <span>
            Activa una suscripción para aparecer en el hero del marketplace,
            destacar eventos y sumar imágenes adicionales a tu perfil.
          </span>
        }
        action={
          <Link
            href="/mi-tienda/planes"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <Sparkles size={16} strokeWidth={1.5} aria-hidden />
            Ver planes
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
          </Link>
        }
      />

      <BenefitsPreview />
    </div>
  )
}

function BenefitsPreview() {
  const items = [
    {
      title: 'Hero promocional',
      description:
        'Aparece en el hero de Home, Catálogo y Vendedores con tu propia imagen y copy.',
    },
    {
      title: 'Galería del perfil',
      description:
        'Suma hasta 10 imágenes adicionales a tu perfil público desde el plan Cosecha.',
    },
    {
      title: 'Eventos destacados',
      description:
        'Destaca uno de tus eventos en el hero de Eventos según la prioridad de tu plan.',
    },
  ]
  return (
    <section
      aria-labelledby="benefits-heading"
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <header className="flex items-center gap-2 border-b border-neutral-200 px-6 py-4">
        <Megaphone
          size={16}
          strokeWidth={1.5}
          className="text-neutral-500"
          aria-hidden
        />
        <h2
          id="benefits-heading"
          className="font-serif text-base font-semibold text-neutral-900"
        >
          Qué desbloqueas con un plan
        </h2>
      </header>
      <ul role="list" className="grid grid-cols-1 gap-px bg-neutral-200 md:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex flex-col gap-1.5 bg-white p-5"
          >
            <h3 className="text-sm font-semibold text-neutral-900">
              {item.title}
            </h3>
            <p className="text-xs leading-relaxed text-neutral-500">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </header>
      <Skeleton className="h-20 w-full" rounded="xl" />
      <Skeleton className="h-72 w-full" rounded="xl" />
      <Skeleton className="h-72 w-full" rounded="xl" />
      <Skeleton className="h-56 w-full" rounded="xl" />
    </div>
  )
}
