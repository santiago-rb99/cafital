'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Publication } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { PublicationFormWizard } from '@/components/publications/form/PublicationFormWizard'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getPublication } from '@/lib/api/publications'

export default function EditarPublicacionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user, isHydrated } = useAuth()
  const { showError } = useToast()
  const router = useRouter()
  const [publication, setPublication] = useState<Publication | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!isHydrated) return
    if (!user || user.role !== 'seller') return
    let cancelled = false
    getPublication(id).then((p) => {
      if (cancelled) return
      if (!p) {
        setNotFound(true)
      } else if (p.sellerId !== user.id) {
        showError('No puedes editar esta publicación')
        router.replace('/mi-tienda/publicaciones')
      } else {
        setPublication(p)
      }
    })
    return () => {
      cancelled = true
    }
  }, [id, user, isHydrated, router, showError])

  const loading = !publication && !notFound

  if (!isHydrated || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (notFound) {
    return (
      <EmptyState
        title="Publicación no encontrada"
        description="La publicación que buscas no existe o fue eliminada."
        action={
          <Link
            href="/mi-tienda/publicaciones"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
            Volver a Mis publicaciones
          </Link>
        }
      />
    )
  }

  if (!publication) return null

  return <PublicationFormWizard initial={publication} />
}
