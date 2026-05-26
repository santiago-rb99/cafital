'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'

import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { register as apiRegister } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/_client'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegistroPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { showSuccess, showError } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validateName(value: string): string | null {
    const v = value.trim()
    if (!v) return 'Ingresa tu nombre'
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
    const nErr = validateName(name)
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
      const newUser = await apiRegister({
        role: 'buyer',
        name: name.trim(),
        email: email.trim(),
      })

      login(newUser.id)
      showSuccess(
        '¡Cuenta creada!',
        'Completa tu perfil para empezar a explorar.'
      )
      router.push('/onboarding/buyer')
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
          Comienza a explorar Cafital. Si más adelante quieres vender, podrás
          activar tu tienda desde tu perfil.
        </p>
      </header>

      <section
        aria-labelledby="register-form-heading"
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 id="register-form-heading" className="sr-only">
          Datos de registro
        </h2>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <FormField label="Nombre completo" required error={nameError ?? undefined}>
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError(null)
              }}
              onBlur={() => setNameError(validateName(name))}
              autoComplete="name"
              placeholder="Juan Pérez"
              leadingIcon={<UserIcon size={18} strokeWidth={1.5} />}
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
            className="font-medium text-primary-300 underline-offset-2 hover:text-primary-500 hover:underline focus:outline-none focus-visible:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </div>
  )
}
