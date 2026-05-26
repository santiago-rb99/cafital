import Link from 'next/link'
import { Compass } from 'lucide-react'
import { MarketplaceShell } from '@/components/layout/MarketplaceShell'

export default function NotFound() {
  return (
    <MarketplaceShell>
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <Compass size={28} strokeWidth={1.5} />
          </div>

          <p className="mt-6 font-serif text-5xl font-bold text-neutral-900">404</p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-neutral-900">
            Página no encontrada
          </h1>
          <p className="mt-3 text-base text-neutral-500">
            La URL que buscas no existe o fue movida. Verifica el enlace o
            vuelve al catálogo para seguir explorando.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-300 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
            >
              Volver al inicio
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-primary-500 bg-white px-5 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
            >
              Ir al catálogo
            </Link>
          </div>
        </div>
      </div>
    </MarketplaceShell>
  )
}
