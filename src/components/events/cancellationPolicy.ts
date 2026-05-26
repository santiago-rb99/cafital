/**
 * Política de cancelación / reembolso para inscripciones a eventos pagos.
 *
 * Tiers calculados a partir de la cantidad de días entre HOY y la fecha del
 * evento. El primer tier que aplica gana (orden descendente de días).
 *
 * - 14+ días → 100%
 * - 7+ días  → 80%
 * - 2+ días (48h+) → 60%
 * - <48h → 0% (sin reembolso)
 *
 * Para eventos gratuitos no se evalúa este modelo: el comprador libera
 * el cupo sin movimiento de dinero.
 */

export type RefundTone = 'success' | 'warning' | 'danger'

export interface RefundTier {
  /** Porcentaje a reembolsar (0–100). */
  percent: number
  /** Etiqueta corta, ej. "100% de reembolso". */
  label: string
  /** Tono visual sugerido para badges/iconos. */
  tone: RefundTone
  /** Texto explicativo de UX. */
  message: string
}

export function refundTierFor(eventDateIso: string, today: Date = new Date()): RefundTier {
  const event = new Date(eventDateIso)
  const diffMs = event.getTime() - today.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays >= 14) {
    return {
      percent: 100,
      label: 'Reembolso 100%',
      tone: 'success',
      message:
        'Puedes cancelar esta inscripción y recibir un reembolso completo. El dinero será devuelto a tu método de pago original en 3 a 10 días hábiles.',
    }
  }

  if (diffDays >= 7) {
    return {
      percent: 80,
      label: 'Reembolso 80%',
      tone: 'warning',
      message:
        'Tu inscripción reservó un cupo y costos administrativos. Recibirás un reembolso parcial del 80% del valor pagado en 3 a 10 días hábiles.',
    }
  }

  if (diffDays >= 2) {
    return {
      percent: 60,
      label: 'Reembolso 60%',
      tone: 'warning',
      message:
        'A menos de una semana del evento aplicamos un reembolso parcial del 60% para cubrir costos operativos ya comprometidos.',
    }
  }

  return {
    percent: 0,
    label: 'Sin reembolso',
    tone: 'danger',
    message:
      'A menos de 48 horas del evento ya no es posible reembolsar el pago. Puedes ceder tu entrada contactando al organizador.',
  }
}
