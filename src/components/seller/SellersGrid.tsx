'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { PublicationCategory, Seller } from '@/types'
import { SellerCard } from './SellerCard'
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  type SellerCommercialIndex,
} from './sellerCategoriesUtils'
import {
  SellerFiltersState,
  buildSellerSearchParams,
} from './sellerFiltersState'

interface SellersGridProps {
  sellers: Seller[]
  index: Record<string, SellerCommercialIndex>
  /** Si true, agrupa por categoría con encabezado y "Ver todos". */
  grouped: boolean
  state: SellerFiltersState
}

const MAX_PER_GROUP = 8

export function SellersGrid({
  sellers,
  index,
  grouped,
  state,
}: SellersGridProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  function jumpToCategory(cat: PublicationCategory) {
    const merged: SellerFiltersState = { ...state, category: cat }
    const qs = buildSellerSearchParams(merged).toString()
    startTransition(() => {
      router.push(qs ? `/vendedores?${qs}` : '/vendedores', { scroll: false })
    })
  }

  if (!grouped) {
    return (
      <ul
        role="list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {sellers.map((s) => (
          <li key={s.id}>
            <SellerCard
              seller={s}
              categories={index[s.id]?.categories ?? []}
              publicationsCount={index[s.id]?.activeCount}
            />
          </li>
        ))}
      </ul>
    )
  }

  // Agrupado por categoría
  const groups = new Map<PublicationCategory, Seller[]>()
  for (const c of CATEGORY_ORDER) groups.set(c, [])
  for (const s of sellers) {
    const cats = index[s.id]?.categories ?? []
    for (const c of cats) groups.get(c)!.push(s)
  }

  return (
    <div className="flex flex-col gap-10">
      {CATEGORY_ORDER.map((c) => {
        const list = groups.get(c) ?? []
        if (list.length === 0) return null
        const truncated = list.slice(0, MAX_PER_GROUP)
        const hasMore = list.length > MAX_PER_GROUP
        return (
          <section
            key={c}
            aria-labelledby={`group-${c}-heading`}
            className="flex flex-col gap-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id={`group-${c}-heading`}
                className="font-serif text-lg font-semibold text-neutral-900 sm:text-xl"
              >
                {CATEGORY_LABEL[c]}
                <span className="ml-2 text-sm font-normal text-neutral-500">
                  ({list.length})
                </span>
              </h2>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => jumpToCategory(c)}
                  className="text-xs font-medium text-primary-500 transition-colors hover:text-primary-700 focus:outline-none focus-visible:underline"
                >
                  Ver todos
                </button>
              )}
            </div>
            <ul
              role="list"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {truncated.map((s) => (
                <li key={s.id}>
                  <SellerCard
                    seller={s}
                    categories={index[s.id]?.categories ?? []}
                    publicationsCount={index[s.id]?.activeCount}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
