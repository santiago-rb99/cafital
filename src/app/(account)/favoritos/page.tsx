'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Package, Store } from 'lucide-react'

import { Publication, Seller } from '@/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Tabs } from '@/components/ui/Tabs'

import { ProductCard } from '@/components/catalog/ProductCard'
import { SellerCard } from '@/components/seller/SellerCard'

import { useFavorites } from '@/hooks/useFavorites'
import { getPublication } from '@/lib/api/publications'
import { getSellerById, listSellers } from '@/lib/api/users'

type FavTab = 'publications' | 'sellers'

export default function FavoritosPage() {
  const { favoritePublications, favoriteSellers } = useFavorites()
  const [tab, setTab] = useState<FavTab>('publications')

  const [publications, setPublications] = useState<Publication[] | null>(null)
  const [sellersById, setSellersById] = useState<Map<string, Seller>>(new Map())
  const [sellers, setSellers] = useState<Seller[] | null>(null)

  // Reset al cambiar la lista de favoritos (patrón "reset state when prop changes").
  const [trackedPubsKey, setTrackedPubsKey] = useState<string | null>(null)
  const pubsKey = favoritePublications.join(',')
  if (pubsKey !== trackedPubsKey) {
    setTrackedPubsKey(pubsKey)
    setPublications(null)
  }
  const [trackedSellersKey, setTrackedSellersKey] = useState<string | null>(null)
  const sellersKey = favoriteSellers.join(',')
  if (sellersKey !== trackedSellersKey) {
    setTrackedSellersKey(sellersKey)
    setSellers(null)
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      Promise.all(favoritePublications.map((id) => getPublication(id))),
      listSellers(),
    ]).then(([pubs, allSellers]) => {
      if (cancelled) return
      const resolved = pubs.filter((p): p is Publication => p !== null)
      setPublications(resolved)
      setSellersById(new Map(allSellers.map((s) => [s.id, s])))
    })
    return () => {
      cancelled = true
    }
  }, [favoritePublications])

  useEffect(() => {
    let cancelled = false
    Promise.all(favoriteSellers.map((id) => getSellerById(id))).then((res) => {
      if (cancelled) return
      const resolved = res.filter((s): s is Seller => s !== null)
      setSellers(resolved)
    })
    return () => {
      cancelled = true
    }
  }, [favoriteSellers])

  const loadingPubs = publications === null
  const loadingSellers = sellers === null

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs items={[{ label: 'Favoritos' }]} className="mb-5" />

        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Favoritos
          </h1>
          <p className="text-sm text-neutral-500">
            Publicaciones y vendedores que guardaste.
          </p>
        </header>

        <Tabs
          items={[
            {
              value: 'publications',
              label: 'Publicaciones',
              count: favoritePublications.length,
              icon: <Package size={14} strokeWidth={1.5} />,
            },
            {
              value: 'sellers',
              label: 'Vendedores',
              count: favoriteSellers.length,
              icon: <Store size={14} strokeWidth={1.5} />,
            },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Tipo de favoritos"
          className="mb-6"
        />

        {tab === 'publications' ? (
          loadingPubs ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : publications.length === 0 ? (
            <EmptyState
              icon={<Heart size={28} strokeWidth={1.5} />}
              title="Aún no guardas publicaciones"
              description="Toca el corazón en cualquier publicación para guardarla aquí."
              action={
                <Link
                  href="/catalogo"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                >
                  Ir al catálogo
                </Link>
              }
            />
          ) : (
            <ul
              role="list"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {publications.map((pub) => {
                const seller = sellersById.get(pub.sellerId)
                return (
                  <li key={pub.id}>
                    <ProductCard
                      publication={pub}
                      sellerName={seller?.businessName ?? 'Vendedor Cafital'}
                    />
                  </li>
                )
              })}
            </ul>
          )
        ) : loadingSellers ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : sellers.length === 0 ? (
          <EmptyState
            icon={<Heart size={28} strokeWidth={1.5} />}
            title="Aún no guardas vendedores"
            description="Desde el perfil de cualquier vendedor puedes guardarlo para acceder rápido."
            action={
              <Link
                href="/vendedores"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
              >
                Ver vendedores
              </Link>
            }
          />
        ) : (
          <ul
            role="list"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sellers.map((seller) => (
              <li key={seller.id}>
                <SellerCard seller={seller} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
