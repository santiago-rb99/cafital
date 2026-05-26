import Link from 'next/link'
import {
  ArrowRight,
  Coffee,
  Globe2,
  Handshake,
  Leaf,
  MapPin,
  Sparkles,
  Store,
  Truck,
  Users,
} from 'lucide-react'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { listSellers, listBuyers } from '@/lib/api/users'
import { listPublications } from '@/lib/api/publications'
import { listEvents } from '@/lib/api/events'
import { DEPARTMENTS } from '@/lib/utils'

export const metadata = {
  title: 'Sobre nosotros · Cafital',
  description:
    'Marketplace B2B del ecosistema del café en Bolivia. Conectamos a productores, tostadores, cafeterías y proveedores en una sola plataforma.',
}

export default async function SobreNosotrosPage() {
  const [sellers, buyers, publications, events] = await Promise.all([
    listSellers(),
    listBuyers(),
    listPublications(),
    listEvents(),
  ])

  // Departamentos con vendedores registrados (orden por cantidad descendente).
  const departmentCounts = new Map<string, number>()
  for (const s of sellers) {
    if (!s.department) continue
    departmentCounts.set(s.department, (departmentCounts.get(s.department) ?? 0) + 1)
  }
  const departmentEntries = DEPARTMENTS.map((dep) => ({
    name: dep,
    count: departmentCounts.get(dep) ?? 0,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const totalUsers = sellers.length + buyers.length

  return (
    <div className="bg-page">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Breadcrumbs items={[{ label: 'Sobre nosotros' }]} className="mb-5" />

        {/* HERO */}
        <header className="mb-12 flex flex-col items-center gap-5 text-center">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary-300 bg-primary-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-primary-700">
            <Coffee size={13} strokeWidth={1.5} aria-hidden />
            Hecho en Bolivia
          </span>
          <h1 className="font-serif text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            El marketplace del ecosistema cafetero boliviano
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-500">
            Cafital conecta a todos los actores de la cadena del café —
            productores, tostadurías, cafeterías, proveedores de maquinaria,
            técnicos y consultores — en una sola plataforma B2B pensada para
            Bolivia.
          </p>
        </header>

        {/* MISIÓN / OBJETIVO / PARA QUIÉN */}
        <div className="grid gap-4 sm:grid-cols-3">
          <PillarCard
            Icon={Sparkles}
            title="Nuestra misión"
            body="Impulsar el desarrollo del ecosistema cafetero boliviano conectando productores, tostadores y compradores con herramientas, conocimiento y tecnología de clase mundial."
          />
          <PillarCard
            Icon={Globe2}
            title="Por qué existimos"
            body="El café boliviano de especialidad necesita un canal directo entre quienes lo producen y quienes lo transforman. Cafital elimina intermediarios y simplifica la operación B2B."
          />
          <PillarCard
            Icon={Handshake}
            title="Para quién"
            body="Negocios del café en Bolivia: fincas, asociaciones, tostadurías, cafeterías, importadores de maquinaria, escuelas de barismo y consultores especializados."
          />
        </div>

        {/* MÉTRICAS */}
        <section
          aria-labelledby="numbers-heading"
          className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2
            id="numbers-heading"
            className="font-serif text-xl font-semibold text-neutral-900"
          >
            Cafital en números
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Cifras del ecosistema al día de hoy en la plataforma.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <NumberCell
              Icon={Store}
              value={sellers.length}
              label={sellers.length === 1 ? 'Vendedor' : 'Vendedores'}
            />
            <NumberCell
              Icon={Users}
              value={totalUsers}
              label="Cuentas registradas"
            />
            <NumberCell
              Icon={Coffee}
              value={publications.length}
              label={publications.length === 1 ? 'Publicación' : 'Publicaciones'}
            />
            <NumberCell
              Icon={Sparkles}
              value={events.length}
              label={events.length === 1 ? 'Evento' : 'Eventos'}
            />
          </dl>
        </section>

        {/* DEPARTAMENTOS */}
        <section
          aria-labelledby="reach-heading"
          className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <header className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div className="flex flex-col gap-1">
              <h2
                id="reach-heading"
                className="font-serif text-xl font-semibold text-neutral-900"
              >
                Nuestro alcance en Bolivia
              </h2>
              <p className="text-sm text-neutral-500">
                Departamentos con vendedores y compradores registrados.
              </p>
            </div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700">
              <Truck size={13} strokeWidth={1.5} aria-hidden />
              {departmentEntries.filter((d) => d.count > 0).length} de{' '}
              {DEPARTMENTS.length} departamentos activos
            </p>
          </header>
          <ul
            role="list"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3"
          >
            {departmentEntries.map((d) => (
              <li
                key={d.name}
                className={
                  d.count > 0
                    ? 'flex items-center justify-between gap-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2.5'
                    : 'flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-100/50 px-3 py-2.5'
                }
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900">
                  <MapPin
                    size={13}
                    strokeWidth={1.5}
                    className={d.count > 0 ? 'text-primary-500' : 'text-neutral-300'}
                    aria-hidden
                  />
                  {d.name}
                </span>
                {d.count > 0 ? (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-300 px-1.5 text-[11px] font-semibold text-white">
                    {d.count}
                  </span>
                ) : (
                  <span className="text-[11px] uppercase tracking-wider text-neutral-300">
                    Pronto
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* VALORES */}
        <section
          aria-labelledby="values-heading"
          className="mt-12 flex flex-col gap-6"
        >
          <h2
            id="values-heading"
            className="font-serif text-xl font-semibold text-neutral-900"
          >
            Lo que nos importa
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ValueCard
              Icon={Leaf}
              title="Café de origen"
              body="Privilegiamos el café boliviano de especialidad — Yungas, Caranavi, Sud Yungas, Chapare — y a quienes lo producen."
            />
            <ValueCard
              Icon={Handshake}
              title="Transacciones B2B"
              body="Todo en Cafital es entre negocios: cotizaciones, compras recurrentes, cobertura por departamento, NIT cuando aplica."
            />
            <ValueCard
              Icon={Sparkles}
              title="Profesionalización"
              body="Eventos, formación, consultoría y maquinaria de clase mundial al alcance de pequeños y grandes actores."
            />
            <ValueCard
              Icon={Globe2}
              title="Bolivia primero"
              body="Una plataforma diseñada para el ecosistema local — sus departamentos, sus zonas y sus reglas comerciales."
            />
          </div>
        </section>

        {/* CTA FINAL */}
        <section
          aria-label="Cómo empezar en Cafital"
          className="mt-12 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8"
        >
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Soy comprador
            </p>
            <h3 className="font-serif text-xl font-semibold text-neutral-900">
              Encontrá café y servicios en un solo lugar
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500">
              Explorá el catálogo de microlotes, equipos y servicios. Cotizá
              por WhatsApp o comprá directo.
            </p>
            <Link
              href="/catalogo"
              className="mt-auto inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              Ir al catálogo
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Soy vendedor
            </p>
            <h3 className="font-serif text-xl font-semibold text-neutral-900">
              Hacé crecer tu negocio cafetero
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500">
              Publicá productos, organizá eventos y llegá a compradores B2B en
              toda Bolivia. Activar tu tienda es gratis.
            </p>
            <Link
              href="/mi-tienda"
              className="mt-auto inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-secondary-300 bg-white px-4 text-sm font-semibold text-secondary-300 transition-colors hover:bg-secondary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
            >
              Quiero ser vendedor
              <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function PillarCard({
  Icon,
  title,
  body,
}: {
  Icon: typeof Sparkles
  title: string
  body: string
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-300">
        <Icon size={20} strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="font-serif text-base font-semibold text-neutral-900">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-neutral-500">{body}</p>
    </article>
  )
}

function NumberCell({
  Icon,
  value,
  label,
}: {
  Icon: typeof Store
  value: number
  label: string
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
        <Icon size={18} strokeWidth={1.5} aria-hidden />
      </span>
      <div className="flex flex-col">
        <span className="font-serif text-2xl font-semibold tabular-nums text-neutral-900">
          {value.toLocaleString('es-BO')}
        </span>
        <span className="text-xs text-neutral-500">{label}</span>
      </div>
    </div>
  )
}

function ValueCard({
  Icon,
  title,
  body,
}: {
  Icon: typeof Sparkles
  title: string
  body: string
}) {
  return (
    <article className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-5">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-50 text-secondary-300">
        <Icon size={18} strokeWidth={1.5} aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs leading-relaxed text-neutral-500">{body}</p>
      </div>
    </article>
  )
}
