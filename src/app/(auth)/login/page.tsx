'use client'

import { FormEvent, Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Lock,
  Mail,
  Store,
  User as UserIcon,
} from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { ALL_MOCK_USERS, DEV_USERS } from '@/data/mock/users'
import { login as apiLogin } from '@/lib/api/auth'
import { Seller } from '@/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isSafeNext(value: string | null): value is string {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//'))
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageInner />
    </Suspense>
  )
}

function LoginFallback() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-6 py-16 shadow-sm"
      aria-busy="true"
    >
      <Spinner size="md" />
    </div>
  )
}

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const redirectTo = isSafeNext(next) ? next : '/'
  const { login } = useAuth()
  const { showSuccess, showError } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [quickLoadingId, setQuickLoadingId] = useState<string | null>(null)

  const anyLoading = submitting || quickLoadingId !== null

  function validateEmail(value: string): string | null {
    const v = value.trim()
    if (!v) return 'Ingresa tu correo'
    if (!EMAIL_RE.test(v)) return 'Ingresa un correo válido'
    return null
  }

  function validatePassword(value: string): string | null {
    if (!value) return 'Ingresa tu contraseña'
    if (value.length < 4) return 'Mínimo 4 caracteres'
    return null
  }

  async function finalizeLogin(userId: string, displayName: string) {
    await apiLogin(userId)
    login(userId)
    showSuccess(`¡Hola, ${displayName}!`, 'Bienvenido a Cafital')
    router.push(redirectTo)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const emailErr = validateEmail(email)
    const pwdErr = validatePassword(password)
    setEmailError(emailErr)
    setPasswordError(pwdErr)
    if (emailErr || pwdErr) return

    const match = ALL_MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (!match) {
      setEmailError('No encontramos una cuenta con ese correo')
      return
    }

    setSubmitting(true)
    try {
      const displayName =
        match.role === 'seller' ? (match as Seller).businessName : match.name
      await finalizeLogin(match.id, displayName)
    } catch {
      showError('No pudimos iniciar sesión', 'Inténtalo nuevamente en unos segundos')
      setSubmitting(false)
    }
  }

  async function onQuickLogin(userId: string, label: string) {
    if (anyLoading) return
    setQuickLoadingId(userId)
    try {
      await finalizeLogin(userId, label)
    } catch {
      showError('No pudimos iniciar sesión', 'Inténtalo nuevamente en unos segundos')
      setQuickLoadingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-serif text-3xl font-bold leading-tight text-neutral-900">
          Inicia sesión
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Accede a tu cuenta para explorar el marketplace del café boliviano.
        </p>
      </header>

      <section
        aria-labelledby="login-form-heading"
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 id="login-form-heading" className="sr-only">
          Formulario de inicio de sesión
        </h2>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <FormField label="Correo electrónico" required error={emailError ?? undefined}>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError(null)
              }}
              onBlur={() => setEmailError(validateEmail(email))}
              autoComplete="email"
              inputMode="email"
              placeholder="tucorreo@negocio.bo"
              leadingIcon={<Mail size={18} strokeWidth={1.5} />}
              aria-required="true"
              disabled={anyLoading}
            />
          </FormField>

          <FormField label="Contraseña" required error={passwordError ?? undefined}>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError(null)
              }}
              onBlur={() => setPasswordError(validatePassword(password))}
              autoComplete="current-password"
              placeholder="••••••••"
              leadingIcon={<Lock size={18} strokeWidth={1.5} />}
              aria-required="true"
              disabled={anyLoading}
            />
          </FormField>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitting}
            disabled={quickLoadingId !== null}
            trailingIcon={!submitting ? <ArrowRight size={18} strokeWidth={1.5} /> : undefined}
          >
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-500">
          ¿Aún no tienes cuenta?{' '}
          <Link
            href="/registro"
            className="font-medium text-primary-500 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </section>

      <section
        aria-labelledby="quick-access-heading"
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-4">
          <Badge variant="warning" className="mb-2 inline-flex">
            Modo demo
          </Badge>
          <h2
            id="quick-access-heading"
            className="font-serif text-xl font-semibold text-neutral-900"
          >
            Acceso rápido
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Cafital es un prototipo navegable. Entra con cualquier perfil para
            recorrer los distintos flujos.
          </p>
        </div>

        <ul role="list" className="flex flex-col gap-2">
          {DEV_USERS.map((u) => {
            const fullUser = ALL_MOCK_USERS.find((m) => m.id === u.id)
            const isSeller = u.role === 'Vendedor'
            const avatarSrc = isSeller
              ? (fullUser as Seller | undefined)?.logo
              : fullUser?.avatar
            const isLoadingThis = quickLoadingId === u.id
            const isDisabled = anyLoading && !isLoadingThis

            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onQuickLogin(u.id, u.label)}
                  disabled={isDisabled}
                  aria-busy={isLoadingThis || undefined}
                  className="group flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-left transition-colors hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-neutral-200 disabled:hover:bg-white"
                >
                  <Avatar
                    src={avatarSrc}
                    alt={isSeller ? `Logo de ${u.label}` : u.label}
                    fallback={u.label}
                    size="sm"
                    square={isSeller}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-neutral-900">
                        {u.label}
                      </span>
                      {u.plan === 'Exportación' && (
                        <BadgeCheck
                          size={14}
                          strokeWidth={1.5}
                          className="shrink-0 text-primary-500"
                          aria-label="Plan Exportación"
                        />
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        {u.role === 'Comprador' ? (
                          <UserIcon size={12} strokeWidth={1.5} aria-hidden />
                        ) : (
                          <Store size={12} strokeWidth={1.5} aria-hidden />
                        )}
                        {u.role}
                      </span>
                      {u.plan && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{u.plan}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {isLoadingThis ? (
                    <Spinner size="sm" />
                  ) : (
                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      className="shrink-0 text-neutral-300 transition-colors group-hover:text-primary-500"
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-neutral-500">
          También puedes cambiar de sesión desde el selector en la esquina
          inferior derecha (solo en desarrollo).
        </p>
      </section>
    </div>
  )
}
