import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Para el prototipo: número único de Cafital que recibe consultas y reenvía
 * al vendedor en producción. Evita falsear teléfonos de vendedores mock.
 */
const CAFITAL_DEMO_PHONE = '59170000000'

export interface WhatsAppButtonProps {
  /** Título del producto/finca/servicio a citar en el mensaje. */
  publicationTitle: string
  publicationId: string
  /** Cantidad seleccionada por el comprador, opcional. */
  quantity?: number
  /** Etiqueta de la unidad (ej. "Quintal (46 kg)"). */
  unit?: string
  /** Override del número del vendedor cuando esté disponible. */
  phone?: string
  /** Tono específico para fincas (cat D). */
  intent?: 'cotizar' | 'visitar-finca'
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

function buildMessage({
  publicationTitle,
  publicationId,
  quantity,
  unit,
  intent = 'cotizar',
}: Pick<
  WhatsAppButtonProps,
  'publicationTitle' | 'publicationId' | 'quantity' | 'unit' | 'intent'
>): string {
  if (intent === 'visitar-finca') {
    return [
      `Hola, me interesa la finca "${publicationTitle}".`,
      '¿Podemos coordinar una visita?',
      `Cafital — ${publicationId}`,
    ].join('\n')
  }

  const cantidad =
    quantity && unit
      ? `Cantidad estimada: ${quantity} ${unit}`
      : 'Cantidad estimada: [a completar]'

  return [
    'Hola, me interesa cotizar:',
    `"${publicationTitle}"`,
    cantidad,
    `Cafital — ${publicationId}`,
  ].join('\n')
}

export function WhatsAppButton({
  publicationTitle,
  publicationId,
  quantity,
  unit,
  phone = CAFITAL_DEMO_PHONE,
  intent,
  variant = 'secondary',
  size = 'lg',
  fullWidth = true,
  className,
}: WhatsAppButtonProps) {
  const message = buildMessage({
    publicationTitle,
    publicationId,
    quantity,
    unit,
    intent,
  })
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  const sizeCls = size === 'lg' ? 'h-12 px-5 text-base' : 'h-10 px-4 text-sm'
  const variantCls =
    variant === 'primary'
      ? 'bg-primary-300 text-white hover:bg-primary-500'
      : 'bg-white text-neutral-900 border border-neutral-200 hover:border-primary-500 hover:text-primary-700'

  const label = intent === 'visitar-finca' ? 'Coordinar visita' : 'Cotizar por WhatsApp'

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
        fullWidth && 'w-full',
        sizeCls,
        variantCls,
        className
      )}
    >
      <MessageCircle size={18} strokeWidth={1.5} aria-hidden />
      {label}
    </Link>
  )
}
