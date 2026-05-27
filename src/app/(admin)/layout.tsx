import { ReactNode } from 'react'
import { AdminShell } from '@/components/layout/AdminShell'
import { RouteGuard } from '@/components/auth/RouteGuard'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requireRole="admin">
      <AdminShell>{children}</AdminShell>
    </RouteGuard>
  )
}
