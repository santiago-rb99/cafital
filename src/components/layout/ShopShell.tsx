'use client'

import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Drawer, IconButton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { MarketplaceHeader } from './MarketplaceHeader'
import { ShopSidebar } from './ShopSidebar'

// Rutas dentro de (shop) accesibles para compradores. Cualquier otra ruta
// de /mi-tienda se considera exclusiva de vendedor.
const BUYER_ALLOWED_PATHS = new Set<string>([
  '/mi-tienda',
  '/mi-tienda/registro-vendedor',
])

export function ShopShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isSeller, isHydrated, user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Si un comprador intenta entrar por URL a una sub-ruta exclusiva de
  // vendedor, lo enviamos de vuelta a la landing.
  // Si un admin cae aquí, lo derivamos a su panel.
  useEffect(() => {
    if (!isHydrated) return
    if (user?.role === 'admin') {
      router.replace('/admin')
      return
    }
    if (user && user.role === 'buyer' && pathname && !BUYER_ALLOWED_PATHS.has(pathname)) {
      router.replace('/mi-tienda')
    }
  }, [isHydrated, user, pathname, router])

  // Comprador: layout simple con navbar global arriba, sin sidebar.
  if (!isSeller) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <a href="#shop-main-content" className="skip-link">
          Saltar al contenido
        </a>
        <MarketplaceHeader />
        <main id="shop-main-content" className="flex flex-1 flex-col bg-page">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <a href="#shop-main-content" className="skip-link">
        Saltar al contenido
      </a>
      <MarketplaceHeader />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar fijo — md+ */}
        <aside className="hidden border-r border-neutral-200 bg-white md:flex md:w-60 md:shrink-0 md:flex-col">
          <ShopSidebar />
        </aside>

        {/* Sub-bar mobile con acceso al sidebar de Mi Tienda. El navbar
            global ya está arriba; este sub-bar solo expone el drawer del
            sidebar (Pedidos, Publicaciones, etc.) en pantallas chicas. */}
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <Link
            href="/mi-tienda"
            className="font-serif text-base font-semibold text-neutral-900"
          >
            Mi Tienda
          </Link>
          <IconButton
            onClick={() => setDrawerOpen(true)}
            icon={<Menu size={20} strokeWidth={1.5} />}
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

        <main id="shop-main-content" className="flex-1 bg-page">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
