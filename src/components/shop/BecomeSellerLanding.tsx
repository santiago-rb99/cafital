import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  LineChart,
  Package,
  Repeat,
  Store,
} from 'lucide-react'

const BENEFITS = [
  {
    Icon: Package,
    label: 'Publicaciones ilimitadas',
    description:
      'Sube café, maquinaria, insumos o servicios sin restricción de volumen.',
  },
  {
    Icon: BadgeCheck,
    label: 'Compradores verificados',
    description:
      'Llega a tostadurías, cafeterías y compradores B2B activos en toda Bolivia.',
  },
  {
    Icon: LineChart,
    label: 'Estadísticas de visitas',
    description:
      'Mide el desempeño de cada publicación y ajusta tu estrategia.',
  },
  {
    Icon: Repeat,
    label: 'Compras recurrentes',
    description:
      'Convierte clientes en suscriptores con pedidos automáticos semanales o mensuales.',
  },
]

export function BecomeSellerLanding() {
  return (
    <section
      aria-labelledby="become-seller-heading"
      className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 rounded-2xl border border-neutral-200 bg-white px-6 py-12 shadow-sm sm:px-10 sm:py-16"
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-300">
        <Store size={28} strokeWidth={1.5} aria-hidden />
      </span>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1
          id="become-seller-heading"
          className="font-serif text-3xl font-bold leading-tight text-neutral-900 sm:text-[36px]"
        >
          ¿Querés vender en Cafital?
        </h1>
        <p className="max-w-xl text-base text-neutral-500">
          Publicá tu café, maquinaria, insumos o servicios y llegá a
          compradores de toda Bolivia. Activar tu perfil de vendedor es
          gratis y toma menos de 2 minutos.
        </p>
      </div>

      <ul
        role="list"
        className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {BENEFITS.map(({ Icon, label, description }) => (
          <li
            key={label}
            className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
          >
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
              <Icon size={16} strokeWidth={1.5} aria-hidden />
            </span>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-neutral-900">{label}</p>
              <p className="text-xs leading-relaxed text-neutral-500">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-3">
        <Link
          href="/mi-tienda/registro-vendedor"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-300 px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          Quiero ser vendedor
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
        </Link>
        <Link
          href="/sobre-nosotros"
          className="text-sm font-medium text-primary-300 underline-offset-2 hover:text-primary-500 hover:underline focus:outline-none focus-visible:underline"
        >
          Saber más sobre Cafital
        </Link>
      </div>
    </section>
  )
}
