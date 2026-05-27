import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { VerificationStatus } from '@/types'

const STATUS_LABEL: Record<VerificationStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

export function VerificationStatusBadge({
  status,
}: {
  status: VerificationStatus
}) {
  if (status === 'approved') {
    return (
      <Badge
        variant="success"
        icon={<CheckCircle2 size={12} strokeWidth={1.5} />}
      >
        {STATUS_LABEL[status]}
      </Badge>
    )
  }
  if (status === 'rejected') {
    return (
      <Badge variant="error" icon={<XCircle size={12} strokeWidth={1.5} />}>
        {STATUS_LABEL[status]}
      </Badge>
    )
  }
  return (
    <Badge variant="warning" icon={<Clock size={12} strokeWidth={1.5} />}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
