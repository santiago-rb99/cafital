'use client'

import { useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Eraser } from 'lucide-react'

import { PublicationCategory } from '@/types'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Toggle } from '@/components/ui/Toggle'
import { CERTIFICATION_OPTIONS } from '@/data/schemas/dynamicFilters'
import { DEPARTMENTS } from '@/lib/utils'

import { CATEGORY_LABEL } from './sellerCategoriesUtils'
import {
  SellerFiltersState,
  buildSellerSearchParams,
  countActiveSellerFilters,
} from './sellerFiltersState'

interface SellersFilterPanelProps {
  state: SellerFiltersState
  onNavigate?: () => void
  className?: string
}

export function SellersFilterPanel({
  state,
  onNavigate,
  className,
}: SellersFilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  const activeCount = countActiveSellerFilters(state)

  function navigate(next: Partial<SellerFiltersState>) {
    const merged: SellerFiltersState = { ...state, ...next }
    const params = buildSellerSearchParams(merged)
    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
      onNavigate?.()
    })
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname, { scroll: false })
      onNavigate?.()
    })
  }

  function toggleCertification(slug: string) {
    const next = state.certifications.includes(slug)
      ? state.certifications.filter((s) => s !== slug)
      : [...state.certifications, slug]
    navigate({ certifications: next })
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
                onClick={() => navigate({ category: null })}
              />
            </li>
            {(['A', 'B', 'C', 'D'] as PublicationCategory[]).map((cat) => (
              <li key={cat}>
                <CategoryRow
                  label={CATEGORY_LABEL[cat]}
                  active={state.category === cat}
                  onClick={() => navigate({ category: cat })}
                />
              </li>
            ))}
          </ul>
        </Group>

        {/* DEPARTAMENTO */}
        <Group title="Departamento">
          <Select
            value={state.department ?? ''}
            onChange={(e) => navigate({ department: e.target.value || null })}
            options={[
              { value: '', label: 'Todos los departamentos' },
              ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
            ]}
            aria-label="Departamento del vendedor"
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

        {/* VERIFICADOS */}
        <Group title="Verificación">
          <Toggle
            checked={state.verifiedOnly}
            onChange={(v) => navigate({ verifiedOnly: v })}
            label="Solo verificados"
            description="Vendedores con plan activo."
          />
        </Group>

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
  const labelId = `sf-${title.replace(/\W+/g, '-').toLowerCase()}`
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
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 ' +
        (active
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-neutral-900 hover:bg-neutral-100')
      }
    >
      <span>{label}</span>
    </button>
  )
}
