import Link from 'next/link'
import { ReactNode } from 'react'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-neutral-100">
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-neutral-900"
        >
          Cafital
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-4 py-6 text-center sm:px-6 lg:px-8">
        <p className="text-xs text-neutral-500">
          © {new Date().getFullYear()} Cafital
        </p>
      </footer>
    </div>
  )
}
