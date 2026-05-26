import { ReactNode } from 'react'
import { ShopShell } from '@/components/layout/ShopShell'
import { RouteGuard } from '@/components/auth/RouteGuard'

export default function ShopLayout({ children }: { children: ReactNode }) {
  // Tanto compradores como vendedores acceden a /mi-tienda. Los compradores
  // ven una landing para convertirse en vendedor; los vendedores ven su
  // dashboard. Sub-rutas exclusivas de vendedor montan su propio guard.
  return (
    <RouteGuard>
      <ShopShell>{children}</ShopShell>
    </RouteGuard>
  )
}
