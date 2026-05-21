import { ReactNode } from 'react'
import { ShopShell } from '@/components/layout/ShopShell'
import { RouteGuard } from '@/components/auth/RouteGuard'

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <ShopShell>
      <RouteGuard requireRole="seller">{children}</RouteGuard>
    </ShopShell>
  )
}
