import { ReactNode } from 'react'
import { MarketplaceHeader } from './MarketplaceHeader'
import { MarketplaceFooter } from './MarketplaceFooter'

export function MarketplaceShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <MarketplaceHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <MarketplaceFooter />
    </div>
  )
}
