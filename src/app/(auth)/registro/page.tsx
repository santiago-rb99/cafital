'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronRight,
  Lock,
  Mail,
  Store,
  User as UserIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { register as apiRegister } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/_client'

type Role = 'buyer' | 'seller'

const ROLE_OPTIONS: Array<{
  role: Role
  title: string
  description: string
  Icon: typeof UserIcon
}> = [
  {
    role: 'buyer',
    title: 'Comprador',
    description:
      'Para descubrir, cotizar y comprar productos, servicios y eventos del ecosistema del café.',
    Icon: UserIcon,
  },
  {
    role: 'seller',
    title: 'Vendedor',
    description:
      'Para publicar tus productos, equipos, servicios o eventos y vender en todo Bolivia.',
    Icon: Store,
  },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegistroPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { showSuccess, showError } = useToast()

  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<Role | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const nameLabel = role === 'seller' ? 'Nombre del negocio' : 'Nombre completo'
  const namePlaceholder =
    role === 'seller' ? 'Tostadora Yungas' : 'Juan Pérez'

  function chooseRole(next: Role) {
    setRole(next)
    setStep(2)
  }

  function backToStep1() {
    setStep(1)
    setNameError(null)
    setEmailError(null)
    setPwdError(null)
    setConfirmError(null)
  }

  function validateName(value: string): string | null {
    const v = value.trim()
    if (!v) return role === 'seller' ? 'Ingresa el nombre de tu negocio' : 'Ingresa tu nombre'
    if (v.length < 2) return 'Debe tener al menos 2 caracteres'
    return null
  }

  function validateEmail(value: string): string | null {
    const v = value.trim()
    if (!v) return 'Ingresa tu correo'
    if (!EMAIL_RE.test(v)) return 'Ingresa un correo válido'
    return null
  }

  function validatePwd(value: string): string | null {
    if (!value) return 'Crea una contraseña'
    if (value.length < 8) return 'Mínimo 8 caracteres'
    return null
  }

  function validateConfirm(value: string, pwd: string): string | null {
    if (!value) return 'Confirma tu contraseña'
    if (value !== pwd) return 'Las contraseñas no coinciden'
    return null
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!role) return

    const nErr = validateName(displayName)
    const eErr = validateEmail(email)
    const pErr = validatePwd(password)
    const cErr = validateConfirm(confirm, password)
    setNameError(nErr)
    setEmailError(eErr)
    setPwdError(pErr)
    setConfirmError(cErr)
    if (nErr || eErr || pErr || cErr) return

    setSubmitting(true)
    try {
      const newUser =
        role === 'buyer'
          ? await apiRegister({
              role: 'buyer',
              name: displayName.trim(),
              email: email.trim(),
            })
          : await apiRegister({
              role: 'seller',
              businessName: displayName.trim(),
              email: email.trim(),
            })

      login(newUser.id)
      showSuccess(
        '¡Cuenta creada!',
        role === 'seller'
          ? 'Completa tu tienda para empezar a publicar.'
          : 'Completa tu perfil para empezar a explorar.'
      )
      router.push(`/onboarding/${role}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEmailError('Ya existe una cuenta con ese correo')
      } else {
        showError('No pudimos crear tu cuenta', 'Inténtalo nuevamente en unos segundos')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-serif text-3xl font-bold leading-tight text-neutral-900">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {step === 1
            ? 'Elige cómo vas a usar Cafital.'
            : role === 'seller'
              ? 'Cuéntanos lo esencial. Podrás completar tu tienda en el siguiente paso.'
              : 'Cuéntanos lo esencial. Podrás completar tu perfil más adelante.'}
        </p>

        <div
          className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500"
          aria-live="polite"
        >
          <span>Paso {step} de 2</span>
          <span className="flex gap-1" aria-hidden>
            <span
              className={cn(
                'h-1 w-8 rounded-full',
                step >= 1 ? 'bg-primary-300' : 'bg-neutral-200'
              )}
            />
            <span
              className={cn(
                'h-1 w-8 rounded-full',
                step >= 2 ? 'bg-primary-300' : 'bg-neutral-200'
              )}
            />
          </span>
        </div>
      </header>

      {step === 1 ? (
        <section
          aria-labelledby="role-picker-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 id="role-picker-heading" className="sr-only">
            Elige tu tipo de cuenta
          </h2>

          <ul role="list" className="flex flex-col gap-3">
            {ROLE_OPTIONS.map(({ role: r, title, description, Icon }) => (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => chooseRole(r)}
                  className="group flex w-full items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-3 focus-visible:ring-primary-100"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-white group-hover:text-primary-500">
                    <Icon size={22} strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="flex-1">
                    <span className="block text-base font-semibold text-neutral-900">
                      Soy {title.toLowerCase()}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-neutral-500">
                      {description}
                    </span>
                  </span>
                  <ChevronRight
                    size={18}
                    strokeWidth={1.5}
                    className="mt-1 shrink-0 text-neutral-300 transition-colors group-hover:text-primary-500"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-center text-sm text-neutral-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-500 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </section>
      ) : (
        <section
          aria-labelledby="register-form-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={backToStep1}
              disabled={submitting}
              aria-label="Volver al paso anterior"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
            </button>
            <div className="flex-1">
              <h2
                id="register-form-heading"
                className="text-sm font-medium text-neutral-500"
              >
                Cuenta de {role === 'seller' ? 'vendedor' : 'comprador'}
              </h2>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <FormField label={nameLabel} required error={nameError ?? undefined}>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  if (nameError) setNameError(null)
                }}
                onBlur={() => setNameError(validateName(displayName))}
                autoComplete={role === 'seller' ? 'organization' : 'name'}
                placeholder={namePlaceholder}
                leadingIcon={
                  role === 'seller' ? (
                    <Building2 size={18} strokeWidth={1.5} />
                  ) : (
                    <UserIcon size={18} strokeWidth={1.5} />
                  )
                }
                aria-required="true"
                disabled={submitting}
              />
            </FormField>

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
                disabled={submitting}
              />
            </FormField>

            <FormField
              label="Contraseña"
              required
              error={pwdError ?? undefined}
              helper={!pwdError ? 'Mínimo 8 caracteres.' : undefined}
            >
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (pwdError) setPwdError(null)
                  if (confirmError && e.target.value === confirm) setConfirmError(null)
                }}
                onBlur={() => setPwdError(validatePwd(password))}
                autoComplete="new-password"
                placeholder="••••••••"
                leadingIcon={<Lock size={18} strokeWidth={1.5} />}
                aria-required="true"
                disabled={submitting}
              />
            </FormField>

            <FormField
              label="Confirmar contraseña"
              required
              error={confirmError ?? undefined}
            >
              <Input
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value)
                  if (confirmError) setConfirmError(null)
                }}
                onBlur={() => setConfirmError(validateConfirm(confirm, password))}
                autoComplete="new-password"
                placeholder="••••••••"
                leadingIcon={<Lock size={18} strokeWidth={1.5} />}
                aria-required="true"
                disabled={submitting}
              />
            </FormField>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
              trailingIcon={
                !submitting ? <ArrowRight size={18} strokeWidth={1.5} /> : undefined
              }
            >
              Crear cuenta
            </Button>
          </form>

          <p className="mt-5 text-center text-xs leading-relaxed text-neutral-500">
            Al crear una cuenta aceptas los Términos de servicio y la Política
            de privacidad de Cafital.
          </p>

          <p className="mt-3 text-center text-sm text-neutral-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-500 underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </section>
      )}
    </div>
  )
}
