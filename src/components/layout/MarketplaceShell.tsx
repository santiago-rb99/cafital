import { ReactNode } from 'react'
import { MarketplaceHeader } from './MarketplaceHeader'
import { MarketplaceFooter } from './MarketplaceFooter'

export function MarketplaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <MarketplaceHeader />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </div>
  )
}
