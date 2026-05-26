'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Globe,
  LogOut,
  Mail,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { logout as apiLogout } from '@/lib/api/auth'

export default function AjustesPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { clearCart } = useCart()
  const { showSuccess, showError, showInfo } = useToast()

  // Preferencias locales — el prototipo las mantiene en memoria.
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [whatsappNotifs, setWhatsappNotifs] = useState(true)
  const [marketing, setMarketing] = useState(false)

  const [confirmLogout, setConfirmLogout] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function onConfirmLogout() {
    try {
      await apiLogout()
      router.push('/')
      logout()
      clearCart()
      showSuccess('Sesión cerrada')
    } catch {
      showError('No pudimos cerrar tu sesión')
    } finally {
      setConfirmLogout(false)
    }
  }

  function onConfirmDelete() {
    setConfirmDelete(false)
    showInfo(
      'Eliminar cuenta',
      'En el prototipo esta acción no procede. Contáctanos para procesar la baja.'
    )
  }

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs items={[{ label: 'Ajustes' }]} className="mb-5" />

        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Ajustes
          </h1>
          <p className="text-sm text-neutral-500">
            Preferencias de tu cuenta {user?.email ? `(${user.email})` : ''}.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <Section
            title="Notificaciones"
            icon={<Bell size={18} strokeWidth={1.5} />}
          >
            <PreferenceRow
              icon={<Mail size={16} strokeWidth={1.5} />}
              label="Correos transaccionales"
              description="Confirmaciones de pedidos y avisos del vendedor."
            >
              <Toggle
                checked={emailNotifs}
                onChange={setEmailNotifs}
                aria-label="Correos transaccionales"
              />
            </PreferenceRow>
            <PreferenceRow
              icon={<MessageCircle size={16} strokeWidth={1.5} />}
              label="WhatsApp"
              description="Avisos de próximas entregas y cambios de estado."
            >
              <Toggle
                checked={whatsappNotifs}
                onChange={setWhatsappNotifs}
                aria-label="Notificaciones por WhatsApp"
              />
            </PreferenceRow>
            <PreferenceRow
              icon={<Globe size={16} strokeWidth={1.5} />}
              label="Novedades de Cafital"
              description="Recibe ferias, nuevos vendedores y promociones."
            >
              <Toggle
                checked={marketing}
                onChange={setMarketing}
                aria-label="Recibir novedades"
              />
            </PreferenceRow>
          </Section>

          <Section title="Sesión" icon={<LogOut size={18} strokeWidth={1.5} />}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-neutral-900">
                  Cerrar sesión en este dispositivo
                </p>
                <p className="text-xs text-neutral-500">
                  Volverás a la pantalla de inicio.
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                leadingIcon={<LogOut size={16} strokeWidth={1.5} />}
                onClick={() => setConfirmLogout(true)}
              >
                Cerrar sesión
              </Button>
            </div>
          </Section>

          <Section
            title="Eliminar cuenta"
            icon={<ShieldAlert size={18} strokeWidth={1.5} />}
            tone="danger"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-neutral-900">
                  Eliminar mi cuenta y datos
                </p>
                <p className="text-xs text-neutral-500">
                  Esta acción es permanente. Tus publicaciones y pedidos quedarán
                  inaccesibles.
                </p>
              </div>
              <Button
                variant="destructive"
                size="md"
                onClick={() => setConfirmDelete(true)}
              >
                Eliminar cuenta
              </Button>
            </div>
          </Section>
        </div>

        <ConfirmDialog
          open={confirmLogout}
          onClose={() => setConfirmLogout(false)}
          onConfirm={onConfirmLogout}
          title="¿Cerrar sesión?"
          description="Volverás a la pantalla de inicio. Tu carrito local se vaciará."
          confirmLabel="Sí, cerrar sesión"
          cancelLabel="Volver"
        />

        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={onConfirmDelete}
          title="¿Eliminar definitivamente tu cuenta?"
          description="Esta acción es irreversible y no procesará devoluciones de pedidos en curso."
          confirmLabel="Sí, eliminar"
          cancelLabel="Volver"
          variant="destructive"
        />
      </div>
    </div>
  )
}

function Section({
  title,
  icon,
  tone = 'default',
  children,
}: {
  title: string
  icon: React.ReactNode
  tone?: 'default' | 'danger'
  children: React.ReactNode
}) {
  return (
    <section
      aria-label={title}
      className={
        'flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm ' +
        (tone === 'danger' ? 'border-[#FDEAEA]' : 'border-neutral-200')
      }
    >
      <header className="flex items-center gap-2">
        <span
          className={
            'inline-flex h-9 w-9 items-center justify-center rounded-lg ' +
            (tone === 'danger'
              ? 'bg-[#FDEAEA] text-error-dark'
              : 'bg-neutral-100 text-neutral-500')
          }
        >
          {icon}
        </span>
        <h2 className="font-serif text-lg font-semibold text-neutral-900">
          {title}
        </h2>
      </header>
      <div className="flex flex-col divide-y divide-neutral-200">
        {children}
      </div>
    </section>
  )
}

function PreferenceRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-neutral-500" aria-hidden>
          {icon}
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-neutral-900">{label}</p>
          <p className="text-xs leading-relaxed text-neutral-500">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
