'use client'

import { useId } from 'react'
import { Info, Plus, Trash2 } from 'lucide-react'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { FormField } from '@/components/ui/FormField'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { NumberInput } from '@/components/ui/NumberInput'
import { Toggle } from '@/components/ui/Toggle'
import { COVERAGE_OPTIONS, UNIT_PRESETS } from '@/data/schemas/publicationAttributes'
import { PriceMode } from '@/types'
import { cn } from '@/lib/utils'
import { PublicationFormData, PublicationUnitDraft } from '../types'
import { StepErrors } from '../validation'

interface Props {
  data: PublicationFormData
  onChange: (patch: Partial<PublicationFormData>) => void
  errors: StepErrors
}

let unitCounter = 0
const nextUnitId = () => `unit-${Date.now()}-${unitCounter++}`

function emptyUnit(): PublicationUnitDraft {
  return { id: nextUnitId(), unit: '', price: '', minQuantity: 1 }
}

export function Step5Pricing({ data, onChange, errors }: Props) {
  const isLand = data.category === 'D'
  const recurringEligible = data.category === 'A' || data.category === 'C'
  const unitListId = useId()

  function setPriceMode(mode: PriceMode) {
    onChange({ priceMode: mode })
  }

  function setUnits(units: PublicationUnitDraft[]) {
    onChange({ units })
  }

  function patchUnit(id: string, patch: Partial<PublicationUnitDraft>) {
    setUnits(data.units.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  function addUnit() {
    setUnits([...data.units, emptyUnit()])
  }

  function removeUnit(id: string) {
    setUnits(data.units.filter((u) => u.id !== id))
  }

  // Cat D: paso simplificado
  if (isLand) {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="font-serif text-xl font-semibold text-neutral-900">
            Precio y logística
          </h2>
          <p className="text-sm text-neutral-500">
            Los terrenos y fincas se gestionan únicamente bajo cotización.
          </p>
        </header>

        <div className="flex gap-3 rounded-xl border border-neutral-200 bg-neutral-100 p-4">
          <Info
            size={18}
            strokeWidth={1.5}
            className="mt-0.5 shrink-0 text-neutral-500"
            aria-hidden
          />
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium text-neutral-900">
              Esta publicación solo recibirá consultas por WhatsApp.
            </p>
            <p className="text-neutral-500">
              Los compradores no podrán agregarla al carrito ni activar compras
              recurrentes. Coordinarás visitas y precios directamente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-neutral-900">
          Precio y logística
        </h2>
        <p className="text-sm text-neutral-500">
          Define cómo se vende tu publicación y dónde la haces llegar.
        </p>
      </header>

      {/* MODO DE PRECIO */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13px] font-medium text-neutral-900">
          Modalidad de precio
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <PriceModeOption
            active={data.priceMode === 'price'}
            onClick={() => setPriceMode('price')}
            title="Con precio"
            description="Defines precios por unidad y los compradores pueden agregar al carrito."
          />
          <PriceModeOption
            active={data.priceMode === 'quote'}
            onClick={() => setPriceMode('quote')}
            title="Bajo cotización"
            description="Solo recibes consultas por WhatsApp; el precio se acuerda 1 a 1."
          />
        </div>
      </fieldset>

      {/* UNIDADES (solo si con precio) */}
      {data.priceMode === 'price' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-[13px] font-semibold text-neutral-900">
              Unidades de venta
            </h3>
            <p className="text-xs text-neutral-500">
              Agrega las presentaciones que ofreces con su precio y cantidad
              mínima.
            </p>
          </div>

          {data.units.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-5 text-center">
              <p className="text-sm text-neutral-500">
                Aún no agregaste unidades de venta.
              </p>
            </div>
          )}

          {data.units.length > 0 && (
            <ul role="list" className="flex flex-col gap-3">
              {data.units.map((unit, idx) => (
                <li
                  key={unit.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Unidad {idx + 1}
                    </span>
                    {data.units.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUnit(unit.id)}
                        aria-label={`Quitar unidad ${idx + 1}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#D32F2F] focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                      >
                        <Trash2 size={15} strokeWidth={1.5} aria-hidden />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <FormField label="Unidad" required>
                      <input
                        type="text"
                        list={unitListId}
                        value={unit.unit}
                        onChange={(e) => patchUnit(unit.id, { unit: e.target.value })}
                        placeholder="Selecciona o escribe"
                        className="h-10 w-full rounded border border-neutral-200 bg-white px-3 text-sm text-neutral-900 transition-colors placeholder:text-neutral-300 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100/40"
                        aria-label={`Unidad ${idx + 1}`}
                      />
                    </FormField>

                    <FormField label="Precio" required>
                      <CurrencyInput
                        value={unit.price}
                        onChange={(v) => patchUnit(unit.id, { price: v })}
                      />
                    </FormField>

                    <FormField label="Cantidad mínima" required>
                      <NumberInput
                        value={unit.minQuantity}
                        onChange={(v) => patchUnit(unit.id, { minQuantity: v })}
                        min={1}
                      />
                    </FormField>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={addUnit}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <Plus size={16} strokeWidth={1.5} aria-hidden />
            Agregar unidad
          </button>

          {errors.units && (
            <p className="text-xs text-[#D32F2F]" role="alert">
              {errors.units}
            </p>
          )}

          <datalist id={unitListId}>
            {UNIT_PRESETS.filter((u) => u !== 'Otro').map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>
      )}

      {/* COBERTURA */}
      <FormField
        label="Cobertura de despacho"
        required
        error={errors.coverage}
        helper={
          !errors.coverage
            ? 'Departamentos a los que llegas con tu publicación.'
            : undefined
        }
      >
        <MultiSelect
          value={data.coverage}
          onChange={(coverage) => onChange({ coverage })}
          options={COVERAGE_OPTIONS.map((c) => ({ value: c, label: c }))}
          placeholder="Selecciona departamentos"
        />
      </FormField>

      {/* INVENTARIO */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <Toggle
          checked={data.inventoryEnabled}
          onChange={(v) =>
            onChange({
              inventoryEnabled: v,
              inventory: v ? (data.inventory === '' ? 10 : data.inventory) : '',
            })
          }
          label="Control de inventario"
          description="Muestra a los compradores cuántas unidades quedan disponibles."
        />
        {data.inventoryEnabled && (
          <div className="mt-3 border-t border-neutral-200 pt-3">
            <FormField label="Stock disponible" error={errors.inventory}>
              <NumberInput
                value={data.inventory}
                onChange={(v) => onChange({ inventory: v })}
                min={0}
                suffix="unidades"
              />
            </FormField>
          </div>
        )}
      </div>

      {/* DESCUENTO */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <Toggle
          checked={data.discountEnabled}
          onChange={(v) =>
            onChange({
              discountEnabled: v,
              discount: v ? (data.discount === '' ? 10 : data.discount) : '',
            })
          }
          label="Aplicar descuento"
          description="Aparecerá un badge con el porcentaje sobre la foto principal."
        />
        {data.discountEnabled && (
          <div className="mt-3 border-t border-neutral-200 pt-3">
            <FormField label="Porcentaje de descuento" error={errors.discount}>
              <NumberInput
                value={data.discount}
                onChange={(v) => onChange({ discount: v })}
                min={1}
                max={90}
                suffix="%"
              />
            </FormField>
          </div>
        )}
      </div>

      {/* COMPRA RECURRENTE */}
      {recurringEligible && data.priceMode === 'price' && (
        <div className={cn('rounded-xl border border-neutral-200 bg-white p-4 shadow-sm')}>
          <Toggle
            checked={data.recurringEnabled}
            onChange={(v) => onChange({ recurringEnabled: v })}
            label="Permitir compra recurrente"
            description="Los compradores pueden activar entregas automáticas con la frecuencia que prefieran."
          />
        </div>
      )}
    </div>
  )
}

function PriceModeOption({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean
  onClick: () => void
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-col gap-1 rounded-xl border bg-white p-4 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
        active
          ? 'border-primary-500 ring-2 ring-primary-100'
          : 'border-neutral-200 hover:border-primary-500'
      )}
    >
      <span className="text-sm font-semibold text-neutral-900">{title}</span>
      <span className="text-xs leading-relaxed text-neutral-500">
        {description}
      </span>
    </button>
  )
}
