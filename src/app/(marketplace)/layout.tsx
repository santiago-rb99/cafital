import { ReactNode } from 'react'
import { MarketplaceShell } from '@/components/layout/MarketplaceShell'

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <MarketplaceShell>{children}</MarketplaceShell>
}
