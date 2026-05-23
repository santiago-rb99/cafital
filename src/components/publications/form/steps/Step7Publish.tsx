'use client'

import { CheckCircle2, FileText, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PublicationFormData, PublishMode, toProductUnits } from '../types'

interface Props {
  data: PublicationFormData
  mode: PublishMode
  onModeChange: (mode: PublishMode) => void
  isEditing: boolean
}

export function Step7Publish({ data, mode, onModeChange, isEditing }: Props) {
  const completedUnits = toProductUnits(data.units)
  const isLand = data.category === 'D'

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-semibold text-neutral-900">
          {isEditing ? 'Guardar cambios' : 'Listo para publicar'}
        </h2>
        <p className="text-sm text-neutral-500">
          Revisa el resumen y elige si publicar ahora o guardar como borrador.
        </p>
      </header>

      {/* RESUMEN */}
      <dl className="grid grid-cols-1 gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <SummaryRow label="Título" value={data.title || '—'} />
        <SummaryRow
          label="Categoría"
          value={`Categoría ${data.category}${
            data.subcategory ? ` · ${data.subcategory}` : ''
          }`}
        />
        <SummaryRow label="Fotos" value={`${data.photos.length}`} />
        <SummaryRow
          label="Modo de precio"
          value={
            isLand
              ? 'Bajo cotización (terreno)'
              : data.priceMode === 'price'
                ? 'Con precio'
                : 'Bajo cotización'
          }
        />
        {data.priceMode === 'price' && !isLand && (
          <SummaryRow
            label="Unidades de venta"
            value={`${completedUnits.length}`}
          />
        )}
        {!isLand && (
          <SummaryRow
            label="Cobertura"
            value={
              data.coverage.length
                ? data.coverage.slice(0, 3).join(', ') +
                  (data.coverage.length > 3
                    ? ` y ${data.coverage.length - 3} más`
                    : '')
                : '—'
            }
          />
        )}
        {data.inventoryEnabled && typeof data.inventory === 'number' && (
          <SummaryRow label="Stock" value={`${data.inventory} unidades`} />
        )}
        {data.discountEnabled && typeof data.discount === 'number' && (
          <SummaryRow label="Descuento" value={`${data.discount}%`} />
        )}
        {(data.category === 'A' || data.category === 'C') && (
          <SummaryRow
            label="Compra recurrente"
            value={data.recurringEnabled ? 'Habilitada' : 'No disponible'}
          />
        )}
      </dl>

      {/* MODO DE PUBLICACIÓN */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13px] font-medium text-neutral-900">
          ¿Cómo deseas guardarla?
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ModeOption
            active={mode === 'active'}
            onClick={() => onModeChange('active')}
            Icon={Rocket}
            title="Publicar ahora"
            description="Estará visible en el catálogo de inmediato."
          />
          <ModeOption
            active={mode === 'draft'}
            onClick={() => onModeChange('draft')}
            Icon={FileText}
            title="Guardar como borrador"
            description="Podrás continuar editándola desde Mis publicaciones."
          />
        </div>
      </fieldset>

      <div className="flex items-start gap-3 rounded-xl border border-primary-300 bg-primary-50 p-4">
        <CheckCircle2
          size={18}
          strokeWidth={1.5}
          className="mt-0.5 shrink-0 text-primary-700"
          aria-hidden
        />
        <div className="text-sm text-primary-700">
          Confirma con el botón de abajo. Podrás editar la publicación luego
          desde <span className="font-semibold">Mis publicaciones</span>.
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </dt>
      <dd className="text-sm text-neutral-900">{value}</dd>
    </div>
  )
}

function ModeOption({
  active,
  onClick,
  Icon,
  title,
  description,
}: {
  active: boolean
  onClick: () => void
  Icon: typeof Rocket
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-start gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
        active
          ? 'border-primary-500 ring-2 ring-primary-100'
          : 'border-neutral-200 hover:border-primary-500'
      )}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        <Icon size={18} strokeWidth={1.5} aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-neutral-900">{title}</span>
        <span className="text-xs text-neutral-500">{description}</span>
      </span>
    </button>
  )
}
