'use client'

import { useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Eraser } from 'lucide-react'

import { EventModality, EventType } from '@/types'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { DEPARTMENTS } from '@/lib/utils'

import {
  buildEventSearchParams,
  countActiveEventFilters,
  EVENT_MODALITY_LABEL,
  EVENT_RANGE_LABEL,
  EVENT_TYPE_LABEL,
  EventDateRange,
  EventFiltersState,
} from './eventFiltersState'

interface EventFiltersProps {
  state: EventFiltersState
  onNavigate?: () => void
  className?: string
}

const TYPE_ORDER: EventType[] = [
  'taller',
  'cata',
  'capacitacion',
  'feria',
  'competencia',
  'networking',
  'tour_finca',
  'otro',
]

const RANGE_ORDER: EventDateRange[] = ['all', 'today', 'week', 'month']

export function EventFilters({ state, onNavigate, className }: EventFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  function navigate(next: Partial<EventFiltersState>) {
    const merged: EventFiltersState = { ...state, ...next }
    const qs = buildEventSearchParams(merged).toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      onNavigate?.()
    })
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname, { scroll: false })
      onNavigate?.()
    })
  }

  const activeCount = countActiveEventFilters(state)

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
        <Group title="Cuándo">
          <ul className="flex flex-col gap-1">
            {RANGE_ORDER.map((r) => (
              <li key={r}>
                <Row
                  label={EVENT_RANGE_LABEL[r]}
                  active={state.range === r}
                  onClick={() => navigate({ range: r })}
                />
              </li>
            ))}
          </ul>
        </Group>

        <Group title="Tipo de evento">
          <ul className="flex flex-col gap-1">
            <li>
              <Row
                label="Todos los tipos"
                active={state.type === null}
                onClick={() => navigate({ type: null })}
              />
            </li>
            {TYPE_ORDER.map((t) => (
              <li key={t}>
                <Row
                  label={EVENT_TYPE_LABEL[t]}
                  active={state.type === t}
                  onClick={() => navigate({ type: t })}
                />
              </li>
            ))}
          </ul>
        </Group>

        <Group title="Modalidad">
          <ul className="flex flex-col gap-1">
            <li>
              <Row
                label="Cualquier modalidad"
                active={state.modality === null}
                onClick={() => navigate({ modality: null })}
              />
            </li>
            {(Object.keys(EVENT_MODALITY_LABEL) as EventModality[]).map((m) => (
              <li key={m}>
                <Row
                  label={EVENT_MODALITY_LABEL[m]}
                  active={state.modality === m}
                  onClick={() => navigate({ modality: m })}
                />
              </li>
            ))}
          </ul>
        </Group>

        <Group title="Departamento">
          <Select
            value={state.department ?? ''}
            onChange={(e) =>
              navigate({ department: e.target.value || null })
            }
            options={[
              { value: '', label: 'Todos los departamentos' },
              ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
            ]}
            aria-label="Departamento"
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
  const id = `evt-flt-${title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-3">
      <p id={id} className="text-[13px] font-semibold text-neutral-900">
        {title}
      </p>
      {children}
    </div>
  )
}

function Row({
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
          ? 'bg-primary-50 font-medium text-primary-700'
          : 'text-neutral-900 hover:bg-neutral-100')
      }
    >
      <span>{label}</span>
    </button>
  )
}
