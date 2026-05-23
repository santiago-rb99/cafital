'use client'

import { ReactNode, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { X } from 'lucide-react'

import { SearchBar } from '@/components/ui/SearchBar'
import { Select } from '@/components/ui/Select'
import { CERTIFICATION_OPTIONS } from '@/data/schemas/dynamicFilters'

import { CATEGORY_LABEL } from './sellerCategoriesUtils'
import {
  SORT_OPTIONS,
  SellerFiltersState,
  SellerSort,
  buildSellerSearchParams,
} from './sellerFiltersState'

interface SellersToolbarProps {
  state: SellerFiltersState
  resultCount: number
  mobileFiltersTrigger?: ReactNode
}

interface ChipDef {
  key: string
  label: string
  remove: () => Partial<SellerFiltersState>
}

export function SellersToolbar({
  state,
  resultCount,
  mobileFiltersTrigger,
}: SellersToolbarProps) {
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

  function navigate(next: Partial<SellerFiltersState>) {
    const merged: SellerFiltersState = { ...state, ...next }
    const params = buildSellerSearchParams(merged)
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    navigate({ q: query.trim() })
  }

  const chips = buildActiveChips(state)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={onSearchSubmit} className="flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => navigate({ q: '' })}
            placeholder="Buscar vendedor por nombre…"
            aria-label="Buscar vendedores"
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
              onChange={(e) => navigate({ sort: e.target.value as SellerSort })}
              options={SORT_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              aria-label="Ordenar vendedores"
              containerClassName="min-w-48"
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
            ? 'Sin vendedores'
            : resultCount === 1
              ? '1 vendedor'
              : `${resultCount} vendedores`}
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

function buildActiveChips(state: SellerFiltersState): ChipDef[] {
  const chips: ChipDef[] = []

  if (state.category) {
    chips.push({
      key: `cat:${state.category}`,
      label: CATEGORY_LABEL[state.category],
      remove: () => ({ category: null }),
    })
  }

  if (state.department) {
    chips.push({
      key: `dept:${state.department}`,
      label: `Depto: ${state.department}`,
      remove: () => ({ department: null }),
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

  if (state.verifiedOnly) {
    chips.push({
      key: 'verified',
      label: 'Solo verificados',
      remove: () => ({ verifiedOnly: false }),
    })
  }

  return chips
}
