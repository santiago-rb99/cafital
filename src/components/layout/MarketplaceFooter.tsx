import Link from 'next/link'

const COLUMNS: Array<{
  title: string
  links: Array<{ href: string; label: string }>
}> = [
  {
    title: 'Marketplace',
    links: [
      { href: '/catalogo', label: 'Catálogo' },
      { href: '/eventos', label: 'Eventos' },
      { href: '/vendedores', label: 'Vendedores' },
    ],
  },
  {
    title: 'Mi cuenta',
    links: [
      { href: '/perfil', label: 'Mi perfil' },
      { href: '/pedidos', label: 'Mis pedidos' },
      { href: '/favoritos', label: 'Favoritos' },
      { href: '/suscripciones', label: 'Compras recurrentes' },
    ],
  },
  {
    title: 'Vendedores',
    links: [
      { href: '/mi-tienda', label: 'Mi Tienda' },
      { href: '/suscripciones/planes', label: 'Planes de suscripción' },
      { href: '/registro?role=seller', label: 'Vender en Cafital' },
    ],
  },
]

export function MarketplaceFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)] md:gap-8">
          <div>
            <Link
              href="/"
              className="font-serif text-xl font-bold text-neutral-900"
              aria-label="Cafital — Inicio"
            >
              Cafital
            </Link>
            <p className="mt-3 max-w-xs text-sm text-neutral-500">
              Marketplace B2B del ecosistema del café en Bolivia. Conectamos
              productores, tostadurías, cafeterías, maquinaria y servicios
              especializados.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Cafital · Hecho en Bolivia
          </p>
          <p className="text-xs text-neutral-300">
            Prototipo demo · Datos simulados
          </p>
        </div>
      </div>
    </footer>
  )
}
