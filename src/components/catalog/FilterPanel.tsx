'use client'

import { useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Eraser } from 'lucide-react'

import { Category, PublicationCategory } from '@/types'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  CERTIFICATION_OPTIONS,
  DynamicFilter,
  getDynamicFiltersForSubcategory,
} from '@/data/schemas/dynamicFilters'
import { DEPARTMENTS } from '@/lib/utils'
import { cn } from '@/lib/utils'

import {
  buildCatalogSearchParams,
  CatalogFiltersState,
  countActiveFilters,
} from './catalogFiltersState'

interface FilterPanelProps {
  state: CatalogFiltersState
  categories: Category[]
  /** Cierra el drawer en mobile cuando el usuario navega. */
  onNavigate?: () => void
  className?: string
}

const CATEGORY_LABEL: Record<PublicationCategory, string> = {
  A: 'Café e insumos',
  B: 'Maquinaria y equipo',
  C: 'Servicios profesionales',
  D: 'Terrenos y fincas',
}

export function FilterPanel({
  state,
  categories,
  onNavigate,
  className,
}: FilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  // Filtros dinámicos: solo cuando hay exactamente UNA subcategoría seleccionada.
  const dynamicFilters: DynamicFilter[] = useMemo(
    () =>
      state.subcategories.length === 1
        ? getDynamicFiltersForSubcategory(state.subcategories[0])
        : [],
    [state.subcategories]
  )

  const activeCount = countActiveFilters(state)
  const selectedByCategory = useMemo(() => {
    const map = new Map<PublicationCategory, number>()
    for (const subId of state.subcategories) {
      for (const cat of categories) {
        if (cat.subcategories.some((s) => s.id === subId)) {
          map.set(cat.id, (map.get(cat.id) ?? 0) + 1)
          break
        }
      }
    }
    return map
  }, [state.subcategories, categories])

  // Categorías con subcategorías seleccionadas se abren por defecto.
  const [openCategories, setOpenCategories] = useState<Set<PublicationCategory>>(
    () => new Set(selectedByCategory.keys())
  )

  function toggleCategoryOpen(cat: PublicationCategory) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function navigate(next: Partial<CatalogFiltersState>) {
    const merged: CatalogFiltersState = {
      ...state,
      ...next,
      dynamic: { ...state.dynamic, ...(next.dynamic ?? {}) },
    }
    const params = buildCatalogSearchParams(merged)
    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
      onNavigate?.()
    })
  }

  function toggleSubcategory(subId: string) {
    const has = state.subcategories.includes(subId)
    const nextSubs = has
      ? state.subcategories.filter((s) => s !== subId)
      : [...state.subcategories, subId]
    // Si pasamos a 0 o ≥2 subcategorías, los filtros dinámicos pierden sentido.
    const nextDynamic = nextSubs.length === 1 ? state.dynamic : {}
    navigate({ subcategories: nextSubs, dynamic: nextDynamic })
  }

  function toggleCertification(slug: string) {
    const next = state.certifications.includes(slug)
      ? state.certifications.filter((s) => s !== slug)
      : [...state.certifications, slug]
    navigate({ certifications: next })
  }

  function toggleDynamic(filterKey: string, slug: string) {
    const current = state.dynamic[filterKey] ?? []
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug]
    navigate({ dynamic: { ...state.dynamic, [filterKey]: next } })
  }

  function setDepartment(value: string) {
    navigate({ department: value || null })
  }

  function setPrice(min: number | null, max: number | null) {
    navigate({ minPrice: min, maxPrice: max })
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname, { scroll: false })
      onNavigate?.()
    })
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 pb-3">
        <h2 className="font-serif text-lg font-semibold text-neutral-900">
          Filtros
          {activeCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-900">
              {activeCount}
            </span>
          )}
        </h2>
        {pending && <Spinner size="sm" label="Actualizando filtros" />}
        {activeCount > 0 && !pending && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <Eraser size={14} strokeWidth={1.5} aria-hidden />
            Limpiar
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* CATEGORÍAS — acordeón jerárquico */}
        <Group title="Categorías">
          <ul className="flex flex-col gap-1">
            {(['A', 'B', 'C', 'D'] as const).map((catId) => {
              const cat = categories.find((c) => c.id === catId)
              if (!cat) return null
              const isOpen = openCategories.has(catId)
              const count = selectedByCategory.get(catId) ?? 0
              return (
                <li key={catId} className="rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleCategoryOpen(catId)}
                    aria-expanded={isOpen}
                    aria-controls={`subcategories-${catId}`}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                      count > 0
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-neutral-900 hover:bg-neutral-100'
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {CATEGORY_LABEL[catId]}
                      {count > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-300 px-1.5 text-[11px] font-semibold text-white">
                          {count}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      size={16}
                      strokeWidth={1.5}
                      className={cn(
                        'shrink-0 text-neutral-500 transition-transform',
                        isOpen && 'rotate-180'
                      )}
                      aria-hidden
                    />
                  </button>
                  {isOpen && (
                    <ul
                      id={`subcategories-${catId}`}
                      className="mt-1 flex flex-col gap-1 border-l border-neutral-200 pl-4"
                    >
                      {cat.subcategories.map((sub) => (
                        <li key={sub.id} className="py-1">
                          <Checkbox
                            label={sub.name}
                            checked={state.subcategories.includes(sub.id)}
                            onChange={() => toggleSubcategory(sub.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </Group>

        {/* PRECIO */}
        <Group title="Rango de precio (Bs.)">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={state.minPrice ?? ''}
              onChange={(e) => {
                const v = e.target.value
                setPrice(v ? Number(v) : null, state.maxPrice)
              }}
              placeholder="Mínimo"
              aria-label="Precio mínimo"
            />
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={state.maxPrice ?? ''}
              onChange={(e) => {
                const v = e.target.value
                setPrice(state.minPrice, v ? Number(v) : null)
              }}
              placeholder="Máximo"
              aria-label="Precio máximo"
            />
          </div>
        </Group>

        {/* DEPARTAMENTO */}
        <Group title="Departamento de cobertura">
          <Select
            value={state.department ?? ''}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: '', label: 'Todos los departamentos' },
              ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
            ]}
            aria-label="Departamento"
          />
        </Group>

        {/* CERTIFICACIONES */}
        <Group title="Certificaciones">
          <ul className="flex flex-col gap-2">
            {CERTIFICATION_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <Checkbox
                  label={opt.label}
                  checked={state.certifications.includes(opt.value)}
                  onChange={() => toggleCertification(opt.value)}
                />
              </li>
            ))}
          </ul>
        </Group>

        {/* DINÁMICOS POR SUBCATEGORÍA — solo si hay UNA subcategoría seleccionada */}
        {dynamicFilters.length > 0 && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-neutral-500">
              Filtros específicos
            </p>
            {dynamicFilters.map((filter) => (
              <Group key={filter.key} title={filter.label}>
                <ul className="flex flex-col gap-2">
                  {filter.options.map((opt) => (
                    <li key={opt.value}>
                      <Checkbox
                        label={opt.label}
                        checked={(state.dynamic[filter.key] ?? []).includes(opt.value)}
                        onChange={() => toggleDynamic(filter.key, opt.value)}
                      />
                    </li>
                  ))}
                </ul>
              </Group>
            ))}
          </>
        )}

        {state.subcategories.length >= 2 && (
          <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-2 text-xs leading-relaxed text-neutral-500">
            Los filtros específicos (proceso, variedad, etc.) aparecen al
            seleccionar una sola subcategoría.
          </p>
        )}

        {/* Limpiar (acción terciaria abajo, redundante con la del header pero útil al final del scroll) */}
        {activeCount > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={clearAll}
            leadingIcon={<Eraser size={14} strokeWidth={1.5} />}
            fullWidth
          >
            Limpiar todos los filtros
          </Button>
        )}
      </div>
    </div>
  )
}

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const labelId = `flt-${title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-3">
      <p id={labelId} className="text-[13px] font-semibold text-neutral-900">
        {title}
      </p>
      {children}
    </div>
  )
}
