'use client'

import { Coffee, Cog, MapPin, Wrench } from 'lucide-react'
import { mockCategories } from '@/data/mock/categories'
import { PublicationCategory } from '@/types'
import { cn } from '@/lib/utils'
import { PublicationFormData } from '../types'
import { StepErrors } from '../validation'

interface Props {
  data: PublicationFormData
  onChange: (patch: Partial<PublicationFormData>) => void
  errors: StepErrors
}

const ICONS: Record<PublicationCategory, typeof Coffee> = {
  A: Coffee,
  B: Cog,
  C: Wrench,
  D: MapPin,
}

export function Step1Category({ data, onChange, errors }: Props) {
  function pick(cat: PublicationCategory) {
    if (cat === data.category) return
    // Si cambia de categoría: limpiar subcategoría, atributos y reset de
    // priceMode forzado para D.
    const isLand = cat === 'D'
    onChange({
      category: cat,
      subcategory: '',
      attributes: {},
      priceMode: isLand ? 'quote' : data.priceMode,
      recurringEnabled: cat === 'A' || cat === 'C' ? data.recurringEnabled : false,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-neutral-900">
          ¿Qué vas a publicar?
        </h2>
        <p className="text-sm text-neutral-500">
          Elige la categoría que mejor describe tu publicación.
        </p>
      </header>

      <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {mockCategories.map((cat) => {
          const Icon = ICONS[cat.id]
          const active = data.category === cat.id
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => pick(cat.id)}
                aria-pressed={active}
                className={cn(
                  'flex w-full flex-col gap-2 rounded-2xl border bg-white p-5 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                  active
                    ? 'border-primary-500 ring-2 ring-primary-100'
                    : 'border-neutral-200 hover:border-primary-500'
                )}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Icon size={20} strokeWidth={1.5} aria-hidden />
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Categoría {cat.id}
                  </span>
                </span>
                <span className="font-serif text-base font-semibold text-neutral-900">
                  {cat.name}
                </span>
                <span className="text-sm leading-relaxed text-neutral-500">
                  {cat.description}
                </span>
                <span className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-neutral-500">
                  {cat.recurringAvailable && (
                    <span className="inline-flex items-center rounded bg-primary-50 px-1.5 py-0.5 font-medium text-primary-700">
                      Compra recurrente
                    </span>
                  )}
                  {cat.id === 'D' && (
                    <span className="inline-flex items-center rounded bg-accent-100 px-1.5 py-0.5 font-medium text-accent-900">
                      Solo cotización
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {errors.category && (
        <p className="text-xs text-[#D32F2F]" role="alert">
          {errors.category}
        </p>
      )}
    </div>
  )
}
