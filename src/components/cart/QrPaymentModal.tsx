'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Smartphone } from 'lucide-react'

import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { cn, formatPrice } from '@/lib/utils'

interface QrPaymentModalProps {
  open: boolean
  amount: number
  /** Texto contextual (ej. el ID del pedido o nombre del evento). */
  reference?: string
  /** Tiempo total simulado en segundos hasta que se confirma el pago. */
  simulatedSeconds?: number
  /** Llamado cuando el "pago" fue confirmado y el caller puede continuar. */
  onConfirmed: () => void
  /** Llamado si el usuario cierra el modal antes de la confirmación. */
  onClose: () => void
}

type Phase = 'waiting' | 'verifying' | 'confirmed'

const STATIC_QR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 22 22" shape-rendering="crispEdges">` +
      `<rect width="22" height="22" fill="#fff"/>` +
      // 3 finder patterns (top-left, top-right, bottom-left)
      `<rect x="1" y="1" width="6" height="6" fill="#262626"/>` +
      `<rect x="2" y="2" width="4" height="4" fill="#fff"/>` +
      `<rect x="3" y="3" width="2" height="2" fill="#262626"/>` +
      `<rect x="15" y="1" width="6" height="6" fill="#262626"/>` +
      `<rect x="16" y="2" width="4" height="4" fill="#fff"/>` +
      `<rect x="17" y="3" width="2" height="2" fill="#262626"/>` +
      `<rect x="1" y="15" width="6" height="6" fill="#262626"/>` +
      `<rect x="2" y="16" width="4" height="4" fill="#fff"/>` +
      `<rect x="3" y="17" width="2" height="2" fill="#262626"/>` +
      // Datos pseudo-aleatorios pero estáticos.
      `<rect x="9" y="2" width="1" height="1" fill="#262626"/>` +
      `<rect x="11" y="3" width="1" height="1" fill="#262626"/>` +
      `<rect x="13" y="2" width="1" height="1" fill="#262626"/>` +
      `<rect x="9" y="5" width="1" height="1" fill="#262626"/>` +
      `<rect x="10" y="6" width="2" height="1" fill="#262626"/>` +
      `<rect x="13" y="5" width="1" height="2" fill="#262626"/>` +
      `<rect x="2" y="9" width="1" height="2" fill="#262626"/>` +
      `<rect x="4" y="10" width="1" height="1" fill="#262626"/>` +
      `<rect x="6" y="9" width="2" height="1" fill="#262626"/>` +
      `<rect x="9" y="9" width="1" height="2" fill="#262626"/>` +
      `<rect x="11" y="10" width="2" height="1" fill="#262626"/>` +
      `<rect x="14" y="9" width="1" height="2" fill="#262626"/>` +
      `<rect x="16" y="9" width="2" height="1" fill="#262626"/>` +
      `<rect x="19" y="10" width="1" height="1" fill="#262626"/>` +
      `<rect x="2" y="12" width="2" height="1" fill="#262626"/>` +
      `<rect x="5" y="13" width="1" height="1" fill="#262626"/>` +
      `<rect x="7" y="12" width="1" height="2" fill="#262626"/>` +
      `<rect x="10" y="13" width="2" height="1" fill="#262626"/>` +
      `<rect x="13" y="12" width="1" height="2" fill="#262626"/>` +
      `<rect x="15" y="13" width="2" height="1" fill="#262626"/>` +
      `<rect x="18" y="12" width="1" height="1" fill="#262626"/>` +
      `<rect x="20" y="13" width="1" height="2" fill="#262626"/>` +
      `<rect x="9" y="15" width="1" height="2" fill="#262626"/>` +
      `<rect x="11" y="16" width="3" height="1" fill="#262626"/>` +
      `<rect x="15" y="17" width="2" height="1" fill="#262626"/>` +
      `<rect x="18" y="16" width="1" height="2" fill="#262626"/>` +
      `<rect x="20" y="17" width="1" height="1" fill="#262626"/>` +
      `<rect x="11" y="19" width="2" height="1" fill="#262626"/>` +
      `<rect x="14" y="20" width="2" height="1" fill="#262626"/>` +
      `<rect x="17" y="19" width="1" height="2" fill="#262626"/>` +
    `</svg>`
  )

export function QrPaymentModal({
  open,
  amount,
  reference,
  simulatedSeconds = 4,
  onConfirmed,
  onClose,
}: QrPaymentModalProps) {
  const [phase, setPhase] = useState<Phase>('waiting')
  const [secondsLeft, setSecondsLeft] = useState(simulatedSeconds)

  useEffect(() => {
    if (!open) {
      setPhase('waiting')
      setSecondsLeft(simulatedSeconds)
      return
    }
    // Reset al abrir
    setPhase('waiting')
    setSecondsLeft(simulatedSeconds)

    const tick = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)

    const verifyAt = setTimeout(() => {
      setPhase('verifying')
    }, simulatedSeconds * 1000)

    const confirmAt = setTimeout(() => {
      setPhase('confirmed')
      // Damos 1s para mostrar el estado confirmado antes de seguir.
      setTimeout(onConfirmed, 1000)
    }, (simulatedSeconds + 1.5) * 1000)

    return () => {
      clearInterval(tick)
      clearTimeout(verifyAt)
      clearTimeout(confirmAt)
    }
  }, [open, simulatedSeconds, onConfirmed])

  // Mientras está en verifying/confirmed, deshabilitamos cierre por backdrop.
  const closable = phase === 'waiting'

  return (
    <Modal
      open={open}
      onClose={closable ? onClose : () => undefined}
      title="Pagar con QR"
      description={reference ?? 'Escanea el código desde tu app bancaria'}
      size="md"
      hideCloseButton={!closable}
    >
      <div className="flex flex-col items-center gap-5">
        {phase === 'waiting' && (
          <>
            <div className="rounded-2xl border-2 border-neutral-200 bg-white p-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={STATIC_QR}
                alt="Código QR de pago"
                width={220}
                height={220}
                className="h-55 w-55"
              />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="font-serif text-2xl font-semibold tabular-nums text-neutral-900">
                {formatPrice(amount)}
              </p>
              <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <Smartphone size={13} strokeWidth={1.5} aria-hidden />
                Esperando confirmación de tu banco · {secondsLeft}s
              </p>
            </div>
            <p className="text-center text-xs leading-relaxed text-neutral-500">
              Abre tu app de banco, escanea el QR y autoriza el pago.
              Al confirmarse, esta ventana avanzará automáticamente.
            </p>
          </>
        )}

        {phase === 'verifying' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner size="md" />
            <p className="text-sm font-medium text-neutral-900">
              Verificando pago…
            </p>
            <p className="text-xs text-neutral-500">
              Confirmando con la entidad bancaria.
            </p>
          </div>
        )}

        {phase === 'confirmed' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <span
              className={cn(
                'inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50'
              )}
            >
              <CheckCircle2
                size={32}
                strokeWidth={1.5}
                className="text-primary-300"
                aria-hidden
              />
            </span>
            <p className="font-serif text-lg font-semibold text-neutral-900">
              ¡Pago confirmado!
            </p>
            <p className="text-xs text-neutral-500">
              {formatPrice(amount)} — procesando tu pedido.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
