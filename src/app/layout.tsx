import type { Metadata } from 'next'
import { Manrope, Noto_Serif } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { DevSessionSwitcher } from '@/components/dev/SessionSwitcher'
import { ToastRenderer } from '@/components/ui/ToastRenderer'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cafital — Marketplace B2B del Café en Bolivia',
    template: '%s · Cafital',
  },
  description:
    'Marketplace B2B multivendor para el ecosistema completo del café en Bolivia. Conecta productores, tostadurías, cafeterías, maquinaria y servicios especializados.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
              <ToastRenderer />
              <DevSessionSwitcher />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
