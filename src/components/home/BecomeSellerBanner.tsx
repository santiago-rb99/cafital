import Link from 'next/link'
import { ArrowRight, BadgeCheck, Coffee, Store, TrendingUp } from 'lucide-react'

/**
 * CTA "Forma parte de Cafital" en el home — invita a compradores autenticados
 * y a visitantes a activar su cuenta de vendedor.
 *
 * El destino apunta a `/mi-tienda`, que:
 * - Para visitantes sin sesión → redirige a login y luego al gateway.
 * - Para compradores autenticados → muestra la landing `BecomeSellerLanding`
 *   con el botón "Quiero ser vendedor" (Sprint 5).
 */
export function BecomeSellerBanner() {
  return (
    <section
      aria-labelledby="become-seller-banner-heading"
      className="overflow-hidden rounded-2xl border border-primary-300 bg-primary-300 text-white shadow-md"
    >
      <div className="grid items-center gap-6 px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-[1.4fr_1fr] md:gap-10 md:py-14">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-white/90">
            <Store size={13} strokeWidth={1.5} aria-hidden />
            Forma parte de Cafital
          </span>
          <h2
            id="become-seller-banner-heading"
            className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl"
          >
            Vendé tu café, maquinaria o servicios en todo Bolivia
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/85">
            Llegá a tostadurías, cafeterías y compradores B2B verificados.
            Crear tu tienda es gratis y toma menos de 2 minutos.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/mi-tienda"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-primary-300 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-white/40"
            >
              Quiero ser vendedor
              <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
            </Link>
            <Link
              href="/sobre-nosotros"
              className="text-sm font-medium text-white/85 underline-offset-2 hover:text-white hover:underline focus:outline-none focus-visible:underline"
            >
              Saber más
            </Link>
          </div>
        </div>

        <ul
          role="list"
          className="grid grid-cols-2 gap-3 text-white/90 md:grid-cols-1"
        >
          {[
            {
              Icon: BadgeCheck,
              title: 'Compradores verificados',
              body: 'Tostadurías y cafeterías activas en toda Bolivia.',
            },
            {
              Icon: Coffee,
              title: 'Publicaciones ilimitadas',
              body: 'Café, equipos, insumos, servicios y eventos.',
            },
            {
              Icon: TrendingUp,
              title: 'Estadísticas en tiempo real',
              body: 'Mide visitas y ventas desde Mi Tienda.',
            },
          ].map(({ Icon, title, body }) => (
            <li
              key={title}
              className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-3"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                <Icon size={16} strokeWidth={1.5} aria-hidden />
              </span>
              <div className="flex flex-col">
                <p className="text-[13px] font-semibold leading-tight">
                  {title}
                </p>
                <p className="text-xs leading-relaxed text-white/75">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
