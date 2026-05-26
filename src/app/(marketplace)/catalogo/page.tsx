import { SearchX } from 'lucide-react'
import Link from 'next/link'

import { listCategories } from '@/lib/api/categories'
import { listPublications } from '@/lib/api/publications'
import { listSellers } from '@/lib/api/users'

import { ProductCard } from '@/components/catalog/ProductCard'
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { MobileFiltersDrawer } from '@/components/catalog/MobileFiltersDrawer'
import {
  parseCatalogFilters,
  toApiFilters,
} from '@/components/catalog/catalogFiltersState'
import { getDynamicFiltersForSubcategory } from '@/data/schemas/dynamicFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { HeroBanner } from '@/components/home/HeroBanner'
import { buildSellerHeroSlides } from '@/components/home/heroSlides'

type SearchParamValue = string | string[] | undefined

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>
}) {
  const raw = await searchParams
  const state = parseCatalogFilters(raw)

  const [categories, sellers] = await Promise.all([
    listCategories(),
    listSellers(),
  ])

  const dynamicFilters =
    state.subcategories.length === 1
      ? getDynamicFiltersForSubcategory(state.subcategories[0])
      : []
  const publications = await listPublications({
    filters: toApiFilters(state, dynamicFilters),
    sort: state.sort,
  })

  const sellersById = new Map(sellers.map((s) => [s.id, s]))
  const heroSlides = buildSellerHeroSlides(sellers)

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {heroSlides.length > 0 && (
          <div className="mb-8 sm:mb-10">
            <HeroBanner slides={heroSlides} />
          </div>
        )}

        <header className="mb-6 flex flex-col gap-1 sm:mb-8">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Catálogo
          </h1>
          <p className="text-sm text-neutral-500">
            Café, equipos, servicios y terrenos del ecosistema cafetero boliviano.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <FilterPanel state={state} categories={categories} />
            </div>
          </aside>

          <div className="flex flex-col gap-5">
            <CatalogToolbar
              state={state}
              categories={categories}
              resultCount={publications.length}
              mobileFiltersTrigger={
                <MobileFiltersDrawer state={state} categories={categories} />
              }
            />

            {publications.length === 0 ? (
              <EmptyState
                icon={<SearchX size={28} strokeWidth={1.5} />}
                title="Sin resultados"
                description="No encontramos publicaciones que coincidan con tus filtros. Prueba ajustarlos o limpiarlos."
                action={
                  <Link
                    href="/catalogo"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-500 bg-white px-4 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                  >
                    Limpiar filtros
                  </Link>
                }
              />
            ) : (
              <ul
                role="list"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
