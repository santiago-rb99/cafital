'use client'

import { PublicationFormWizard } from '@/components/publications/form/PublicationFormWizard'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/contexts/AuthContext'

export default function NuevaPublicacionPage() {
  const { user, isHydrated } = useAuth()

  if (!isHydrated || !user || user.role !== 'seller') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  return <PublicationFormWizard />
}
