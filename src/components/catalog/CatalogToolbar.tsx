'use client'

import { ReactNode, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { X } from 'lucide-react'

import { Category, PublicationCategory } from '@/types'
import { SearchBar } from '@/components/ui/SearchBar'
import { Select } from '@/components/ui/Select'
import {
  CERTIFICATION_OPTIONS,
  getDynamicFiltersForSubcategory,
} from '@/data/schemas/dynamicFilters'

import {
  buildCatalogSearchParams,
  CatalogFiltersState,
  CatalogSort,
  SORT_OPTIONS,
} from './catalogFiltersState'

interface CatalogToolbarProps {
  state: CatalogFiltersState
  categories: Category[]
  resultCount: number
  /** Renderizado a la izquierda del select de orden (típicamente el trigger del drawer en mobile). */
  mobileFiltersTrigger?: ReactNode
}

const CATEGORY_LABEL: Record<PublicationCategory, string> = {
  A: 'Café e insumos',
  B: 'Maquinaria y equipo',
  C: 'Servicios profesionales',
  D: 'Terrenos y fincas',
}

interface ChipDef {
  key: string
  label: string
  remove: () => Partial<CatalogFiltersState>
}

export function CatalogToolbar({
  state,
  categories,
  resultCount,
  mobileFiltersTrigger,
}: CatalogToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState(state.q)

  // Mantener el input en sync si la URL cambia desde fuera (ej. limpiar filtros).
  // Patrón "Adjusting state based on props" — corre durante render.
  const [trackedQ, setTrackedQ] = useState(state.q)
  if (state.q !== trackedQ) {
    setTrackedQ(state.q)
    setQuery(state.q)
  }

  function navigate(next: Partial<CatalogFiltersState>) {
    const merged = { ...state, ...next }
    const params = buildCatalogSearchParams(merged)
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    navigate({ q: query.trim() })
  }

  function onSortChange(value: string) {
    navigate({ sort: value as CatalogSort })
  }

  const chips = buildActiveChips(state, categories)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={onSearchSubmit} className="flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => navigate({ q: '' })}
            placeholder="Buscar café verde, tostadora, consultoría…"
            aria-label="Buscar en el catálogo"
          />
        </form>

        <div className="flex items-center gap-2">
          {mobileFiltersTrigger}

          <label className="inline-flex items-center gap-2">
            <span className="hidden text-xs font-medium text-neutral-500 sm:inline">
              Ordenar
            </span>
            <Select
              value={state.sort}
              onChange={(e) => onSortChange(e.target.value)}
              options={SORT_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              aria-label="Ordenar resultados"
              containerClassName="min-w-[12rem]"
            />
          </label>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-2"
        aria-live="polite"
        aria-busy={pending}
      >
        <span className="text-xs font-medium text-neutral-500">
          {resultCount === 0
            ? 'Sin publicaciones'
            : resultCount === 1
              ? '1 publicación'
              : `${resultCount} publicaciones`}
        </span>

        {chips.length > 0 && (
          <span className="text-xs text-neutral-300" aria-hidden>
            ·
          </span>
        )}

        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => navigate(chip.remove())}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-900 transition-colors hover:border-neutral-300 hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            {chip.label}
            <X size={12} strokeWidth={1.5} aria-label="Quitar filtro" />
          </button>
        ))}
      </div>
    </div>
  )
}

function buildActiveChips(
  state: CatalogFiltersState,
  categories: Category[]
): ChipDef[] {
  const chips: ChipDef[] = []

  if (state.category) {
    chips.push({
      key: `cat:${state.category}`,
      label: CATEGORY_LABEL[state.category],
      // Quitar categoría también quita subcategoría y filtros dinámicos.
      remove: () => ({ category: null, subcategory: null, dynamic: {} }),
    })
  }

  if (state.subcategory) {
    const cat = categories.find((c) => c.id === state.category)
    const sub = cat?.subcategories.find((s) => s.id === state.subcategory)
    if (sub) {
      chips.push({
        key: `sub:${state.subcategory}`,
        label: sub.name,
        remove: () => ({ subcategory: null, dynamic: {} }),
      })
    }
  }

  if (state.department) {
    chips.push({
      key: `dept:${state.department}`,
      label: `Cobertura: ${state.department}`,
      remove: () => ({ department: null }),
    })
  }

  if (state.minPrice != null || state.maxPrice != null) {
    const label =
      state.minPrice != null && state.maxPrice != null
        ? `Bs. ${state.minPrice}–${state.maxPrice}`
        : state.minPrice != null
          ? `Desde Bs. ${state.minPrice}`
          : `Hasta Bs. ${state.maxPrice}`
    chips.push({
      key: 'price',
      label,
      remove: () => ({ minPrice: null, maxPrice: null }),
    })
  }

  for (const certSlug of state.certifications) {
    const cert = CERTIFICATION_OPTIONS.find((o) => o.value === certSlug)
    if (!cert) continue
    chips.push({
      key: `cert:${certSlug}`,
      label: cert.label,
      remove: () => ({
        certifications: state.certifications.filter((s) => s !== certSlug),
      }),
    })
  }

  const dynamicFilters = getDynamicFiltersForSubcategory(state.subcategory)
  for (const filter of dynamicFilters) {
    const slugs = state.dynamic[filter.key] ?? []
    for (const slug of slugs) {
      const opt = filter.options.find((o) => o.value === slug)
      if (!opt) continue
      chips.push({
        key: `dyn:${filter.key}:${slug}`,
        label: opt.label,
        remove: () => ({
          dynamic: {
            ...state.dynamic,
            [filter.key]: slugs.filter((s) => s !== slug),
          },
        }),
      })
    }
  }

  return chips
}
