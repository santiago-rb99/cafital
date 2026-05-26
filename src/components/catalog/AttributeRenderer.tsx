import { Publication } from '@/types'
import { cn } from '@/lib/utils'

interface AttributeRendererProps {
  attributes: Publication['attributes']
  className?: string
  /**
   * - `list` (default): cards en 2 columnas, label arriba y valor abajo.
   * - `table`: filas tipo spec-sheet — label a la izquierda, valor a la derecha, separadores horizontales.
   */
  variant?: 'list' | 'table'
}

/**
 * Renderiza el bloque "Especificaciones" como una lista de definiciones.
 * Acepta valores string o string[]; los arrays se muestran como chips.
 * El UX-skill B2B pide densidad alta y todo visible (no detrás de "Ver más").
 */
export function AttributeRenderer({
  attributes,
  className,
  variant = 'list',
}: AttributeRendererProps) {
  const entries = Object.entries(attributes).filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === 'string' && value.trim() === '')
  )

  if (entries.length === 0) return null

  if (variant === 'table') {
    return (
      <dl
        className={cn(
          'overflow-hidden rounded-lg border border-neutral-200 bg-white',
          className
        )}
      >
        {entries.map(([key, value], i) => (
          <div
            key={key}
            className={cn(
              'grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-4 px-4 py-3 sm:px-5',
              i % 2 === 0 ? 'bg-white' : 'bg-neutral-100/60',
              i !== entries.length - 1 && 'border-b border-neutral-200'
            )}
          >
            <dt className="text-[13px] font-medium text-neutral-500">{key}</dt>
            <dd className="text-[13px] text-neutral-900">
              {Array.isArray(value) ? (
                <ul className="flex flex-wrap gap-1.5">
                  {value.map((v) => (
                    <li
                      key={v}
                      className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-[12px] font-medium text-neutral-900"
                    >
                      {v}
                    </li>
                  ))}
                </ul>
              ) : (
                <span>{value}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2',
        className
      )}
    >
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            {key}
          </dt>
          <dd className="text-sm text-neutral-900">
            {Array.isArray(value) ? (
              <ul className="flex flex-wrap gap-1.5">
                {value.map((v) => (
                  <li
                    key={v}
                    className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-[13px] font-medium text-neutral-900"
                  >
                    {v}
                  </li>
                ))}
              </ul>
            ) : (
              <span>{value}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
