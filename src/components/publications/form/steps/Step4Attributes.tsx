'use client'

import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { NumberInput } from '@/components/ui/NumberInput'
import { Select } from '@/components/ui/Select'
import {
  AttributeField,
  getAttributesForSubcategory,
} from '@/data/schemas/publicationAttributes'
import { PublicationFormData } from '../types'
import { StepErrors } from '../validation'

interface Props {
  data: PublicationFormData
  onChange: (patch: Partial<PublicationFormData>) => void
  errors: StepErrors
}

export function Step4Attributes({ data, onChange, errors }: Props) {
  const schema = getAttributesForSubcategory(data.subcategory)

  if (schema.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="font-serif text-xl font-semibold text-neutral-900">
          Características
        </h2>
        <p className="text-sm text-neutral-500">
          Esta subcategoría no tiene atributos específicos a completar. Puedes
          continuar al siguiente paso.
        </p>
      </div>
    )
  }

  function patchAttr(key: string, value: string | string[] | undefined) {
    const next = { ...data.attributes }
    if (
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete next[key]
    } else {
      next[key] = value
    }

    // Si el campo recién modificado es padre de algún cascade, limpiar la
    // selección del hijo cuando ya no sea válida para el nuevo padre.
    for (const f of schema) {
      if (f.type !== 'cascade' || !f.cascade || f.cascade.from !== key) continue
      const childValue = next[f.key]
      if (typeof childValue !== 'string') continue
      const newOptions =
        typeof value === 'string' ? f.cascade.map[value] ?? [] : []
      if (!newOptions.includes(childValue)) {
        delete next[f.key]
      }
    }

    onChange({ attributes: next })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-neutral-900">
          Características
        </h2>
        <p className="text-sm text-neutral-500">
          Estos datos ayudan a que los compradores te encuentren al filtrar.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {schema.map((field) => {
          const parentValue =
            field.type === 'cascade' && field.cascade
              ? data.attributes[field.cascade.from]
              : undefined
          return (
            <AttributeFieldRow
              key={field.key}
              field={field}
              value={data.attributes[field.key]}
              onChange={(v) => patchAttr(field.key, v)}
              error={errors[field.key]}
              parentValue={
                typeof parentValue === 'string' ? parentValue : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

function AttributeFieldRow({
  field,
  value,
  onChange,
  error,
  parentValue,
}: {
  field: AttributeField
  value: string | string[] | undefined
  onChange: (v: string | string[] | undefined) => void
  error?: string
  parentValue?: string
}) {
  const label = field.label ?? field.key

  if (field.type === 'select' && field.options) {
    const v = typeof value === 'string' ? value : ''
    return (
      <FormField label={label} required={field.required} error={error} helper={field.helper}>
        <Select
          value={v}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="Selecciona"
          options={field.options.map((o) => ({ value: o, label: o }))}
        />
      </FormField>
    )
  }

  if (field.type === 'multiselect' && field.options) {
    const arr = Array.isArray(value) ? value : value ? [value] : []
    return (
      <FormField label={label} required={field.required} error={error} helper={field.helper}>
        <MultiSelect
          value={arr}
          onChange={(next) => onChange(next.length ? next : undefined)}
          options={field.options.map((o) => ({ value: o, label: o }))}
          placeholder="Selecciona"
        />
      </FormField>
    )
  }

  if (field.type === 'cascade' && field.cascade) {
    const options = parentValue ? field.cascade.map[parentValue] ?? [] : []
    const v = typeof value === 'string' ? value : ''
    const disabled = !parentValue
    const helperOverride = !parentValue
      ? field.helper ?? 'Selecciona primero el departamento.'
      : options.length === 0
        ? 'Este departamento no tiene zonas cafeteras registradas. Puedes continuar sin zona.'
        : field.helper
    return (
      <FormField
        label={label}
        required={field.required}
        error={error}
        helper={helperOverride}
      >
        <Select
          value={v}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={disabled ? 'Elige un departamento primero' : 'Selecciona'}
          disabled={disabled || options.length === 0}
          options={options.map((o) => ({ value: o, label: o }))}
        />
      </FormField>
    )
  }

  if (field.type === 'number') {
    const raw = typeof value === 'string' && value !== '' ? Number(value) : NaN
    const v: number | '' = Number.isNaN(raw) ? '' : raw
    return (
      <FormField label={label} required={field.required} error={error} helper={field.helper}>
        <NumberInput
          value={v}
          onChange={(n) => onChange(n === '' ? undefined : String(n))}
          min={field.min ?? 0}
          max={field.max}
          step={field.step ?? 1}
          suffix={field.suffix}
          placeholder={field.placeholder}
        />
      </FormField>
    )
  }

  // text
  const v = typeof value === 'string' ? value : ''
  return (
    <FormField label={label} required={field.required} error={error} helper={field.helper}>
      <Input
        type="text"
        value={v}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={field.placeholder}
      />
    </FormField>
  )
}
