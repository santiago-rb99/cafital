'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    // En producción se enviaría a un error reporter (Sentry, etc.)
    console.error('[cafital] runtime error', error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center bg-neutral-100 px-4 py-16 sm:py-24">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FDEAEA] text-[#D32F2F]">
          <AlertTriangle size={28} strokeWidth={1.5} />
        </div>

        <h1 className="mt-6 font-serif text-2xl font-semibold text-neutral-900">
          Algo salió mal
        </h1>
        <p className="mt-3 text-base text-neutral-500">
          Tuvimos un problema mostrando esta sección. Puedes reintentar o
          volver al inicio.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="mt-4 max-h-32 overflow-auto rounded border border-neutral-200 bg-neutral-100 px-3 py-2 text-left text-xs text-neutral-500">
            {error.message}
            {error.digest && `\n\ndigest: ${error.digest}`}
          </pre>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-300 px-5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-primary-500 bg-white px-5 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
