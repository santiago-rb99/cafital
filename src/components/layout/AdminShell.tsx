'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { Menu } from 'lucide-react'
import { Drawer, IconButton } from '@/components/ui'
import { MarketplaceHeader } from './MarketplaceHeader'
import { AdminSidebar } from '../admin/AdminSidebar'

export function AdminShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <a href="#admin-main-content" className="skip-link">
        Saltar al contenido
      </a>
      <MarketplaceHeader />

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="hidden border-r border-neutral-200 bg-white md:flex md:w-60 md:shrink-0 md:flex-col">
          <AdminSidebar />
        </aside>

        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <Link
            href="/admin"
            className="font-serif text-base font-semibold text-neutral-900"
          >
            Panel admin
          </Link>
          <IconButton
            onClick={() => setDrawerOpen(true)}
            icon={<Menu size={20} strokeWidth={1.5} />}
            label="Abrir menú del panel admin"
          />
        </header>

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          side="left"
          size="sm"
          ariaLabel="Navegación del panel admin"
        >
          <div className="-mx-5 -my-4">
            <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </Drawer>

        <main id="admin-main-content" className="flex-1 bg-page">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
