'use client'

import { useMemo, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Eraser } from 'lucide-react'

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

  const dynamicFilters: DynamicFilter[] = useMemo(
    () => getDynamicFiltersForSubcategory(state.subcategory),
    [state.subcategory]
  )

  const subcategories = useMemo(() => {
    if (!state.category) return []
    return categories.find((c) => c.id === state.category)?.subcategories ?? []
  }, [state.category, categories])

  const activeCount = countActiveFilters(state)

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

  function setCategory(cat: PublicationCategory | null) {
    // Cambiar categoría resetea subcategoría y filtros dinámicos.
    navigate({ category: cat, subcategory: null, dynamic: {} })
  }

  function setSubcategory(sub: string | null) {
    // Cambiar subcategoría resetea filtros dinámicos.
    navigate({ subcategory: sub, dynamic: {} })
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
        {/* CATEGORÍA */}
        <Group title="Categoría">
          <ul className="flex flex-col gap-1">
            <li>
              <CategoryRow
                label="Todas las categorías"
                active={state.category === null}
                onClick={() => setCategory(null)}
              />
            </li>
            {(['A', 'B', 'C', 'D'] as const).map((cat) => (
              <li key={cat}>
                <CategoryRow
                  label={CATEGORY_LABEL[cat]}
                  active={state.category === cat}
                  onClick={() => setCategory(cat)}
                />
              </li>
            ))}
          </ul>
        </Group>

        {/* SUBCATEGORÍA */}
        {state.category && subcategories.length > 0 && (
          <Group title="Subcategoría">
            <ul className="flex flex-col gap-1">
              <li>
                <CategoryRow
                  label="Todas"
                  active={state.subcategory === null}
                  onClick={() => setSubcategory(null)}
                  size="sm"
                />
              </li>
              {subcategories.map((sub) => (
                <li key={sub.id}>
                  <CategoryRow
                    label={sub.name}
                    active={state.subcategory === sub.id}
                    onClick={() => setSubcategory(sub.id)}
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          </Group>
        )}

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

        {/* DINÁMICOS POR SUBCATEGORÍA */}
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

function CategoryRow({
  label,
  active,
  onClick,
  size = 'md',
}: {
  label: string
  active: boolean
  onClick: () => void
  size?: 'sm' | 'md'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 ' +
        (active
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-neutral-900 hover:bg-neutral-100') +
        (size === 'sm' ? ' text-[13px]' : ' text-sm')
      }
    >
      <span>{label}</span>
    </button>
  )
}
