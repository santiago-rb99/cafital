'use client'

import { Tabs } from '@/components/ui/Tabs'
import {
  ADMIN_PERIOD_LABEL,
  adminPeriodShort,
  type AdminPeriodKey,
} from '@/lib/api/admin'

const ORDER: AdminPeriodKey[] = ['7d', '30d', '90d', 'mtd']

export function PeriodSelector({
  value,
  onChange,
}: {
  value: AdminPeriodKey
  onChange: (value: AdminPeriodKey) => void
}) {
  return (
    <Tabs<AdminPeriodKey>
      variant="pills"
      value={value}
      onChange={onChange}
      ariaLabel="Período de las métricas"
      items={ORDER.map((k) => ({
        value: k,
        label: adminPeriodShort(k),
      }))}
    />
  )
}

export { ADMIN_PERIOD_LABEL }
