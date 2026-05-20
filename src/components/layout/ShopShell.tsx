'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { Menu } from 'lucide-react'
import { Drawer, IconButton } from '@/components/ui'
import { ShopSidebar } from './ShopSidebar'

export function ShopShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      {/* Sidebar fijo — md+ */}
      <aside className="hidden border-r border-neutral-200 bg-white md:flex md:w-60 md:shrink-0 md:flex-col">
        <ShopSidebar />
      </aside>

      {/* Top bar — mobile */}
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
        <Link
          href="/mi-tienda"
          className="font-serif text-lg font-bold text-neutral-900"
        >
          Mi Tienda
        </Link>
        <IconButton
          onClick={() => setDrawerOpen(true)}
          icon={<Menu size={22} strokeWidth={1.5} />}
          label="Abrir menú de Mi Tienda"
        />
      </header>

      {/* Drawer — mobile */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="left"
        size="sm"
        ariaLabel="Navegación de Mi Tienda"
      >
        <div className="-mx-5 -my-4">
          <ShopSidebar onNavigate={() => setDrawerOpen(false)} />
        </div>
      </Drawer>

      <main className="flex-1 bg-neutral-100">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
