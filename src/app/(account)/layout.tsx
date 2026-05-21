import { ReactNode } from 'react'
import { MarketplaceShell } from '@/components/layout/MarketplaceShell'
import { RouteGuard } from '@/components/auth/RouteGuard'

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <MarketplaceShell>
      <RouteGuard>{children}</RouteGuard>
    </MarketplaceShell>
  )
}
