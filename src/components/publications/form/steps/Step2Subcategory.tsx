'use client'

import { Check } from 'lucide-react'
import { getCategoryById } from '@/data/mock/categories'
import { cn } from '@/lib/utils'
import { PublicationFormData } from '../types'
import { StepErrors } from '../validation'

interface Props {
  data: PublicationFormData
  onChange: (patch: Partial<PublicationFormData>) => void
  errors: StepErrors
}

export function Step2Subcategory({ data, onChange, errors }: Props) {
  const category = data.category ? getCategoryById(data.category) : null

  if (!category) {
    return (
      <p className="text-sm text-neutral-500">
        Vuelve al paso anterior para elegir una categoría.
      </p>
    )
  }

  function pick(subId: string) {
    if (subId === data.subcategory) return
    // Al cambiar de subcategoría, descartamos los atributos previos: cada
    // subcategoría tiene un esquema distinto.
    onChange({ subcategory: subId, attributes: {} })
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-neutral-900">
          Selecciona una subcategoría
        </h2>
        <p className="text-sm text-neutral-500">
          Define con más detalle dentro de <strong>{category.name}</strong>.
        </p>
      </header>

      <ul role="list" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {category.subcategories.map((sub) => {
          const active = data.subcategory === sub.id
          return (
            <li key={sub.id}>
              <button
                type="button"
                onClick={() => pick(sub.id)}
                aria-pressed={active}
                className={cn(
                  'flex w-full items-start justify-between gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
                  active
                    ? 'border-primary-500 ring-2 ring-primary-100'
                    : 'border-neutral-200 hover:border-primary-500'
                )}
              >
                <span className="flex-1 text-sm font-medium text-neutral-900">
                  {sub.name}
                </span>
                {active && (
                  <span
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-300 text-primary-900"
                    aria-hidden
                  >
                    <Check size={13} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {errors.subcategory && (
        <p className="text-xs text-[#D32F2F]" role="alert">
          {errors.subcategory}
        </p>
      )}
    </div>
  )
}
