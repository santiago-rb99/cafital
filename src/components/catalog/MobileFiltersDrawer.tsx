'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Category } from '@/types'
import { FilterPanel } from './FilterPanel'
import { CatalogFiltersState, countActiveFilters } from './catalogFiltersState'

interface MobileFiltersDrawerProps {
  state: CatalogFiltersState
  categories: Category[]
}

/**
 * Renderiza solo en mobile. El trigger del CatalogToolbar abre este drawer.
 * Se separa del Toolbar para que page.tsx pueda renderizar el trigger desde
 * la barra superior y el drawer al final.
 */
export function MobileFiltersDrawer({ state, categories }: MobileFiltersDrawerProps) {
  const [open, setOpen] = useState(false)
  const activeCount = countActiveFilters(state)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 lg:hidden"
      >
        <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden />
        Filtros
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-100 px-1.5 text-[11px] font-semibold text-primary-900">
            {activeCount}
          </span>
        )}
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filtros"
        side="left"
        size="md"
        ariaLabel="Panel de filtros del catálogo"
      >
        <FilterPanel
          state={state}
          categories={categories}
          onNavigate={() => setOpen(false)}
        />
      </Drawer>
    </>
  )
}
