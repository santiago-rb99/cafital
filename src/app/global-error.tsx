'use client'

import { useEffect } from 'react'
import './globals.css'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[cafital] root layout error', error)
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-100">
        <title>Error inesperado · Cafital</title>
        <div className="flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <h1
              style={{ fontFamily: 'Georgia, "Noto Serif", serif' }}
              className="text-2xl font-semibold text-neutral-900"
            >
              Error inesperado
            </h1>
            <p className="mt-3 text-base text-neutral-500">
              Cafital se cayó por completo. Estamos viendo qué pasó. Puedes
              reintentar o recargar la página.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <pre className="mt-4 max-h-32 overflow-auto rounded border border-neutral-200 bg-neutral-100 px-3 py-2 text-left text-xs text-neutral-500">
                {error.message}
                {error.digest && `\n\ndigest: ${error.digest}`}
              </pre>
            )}

            <button
              type="button"
              onClick={() => unstable_retry()}
              className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-primary-300 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
