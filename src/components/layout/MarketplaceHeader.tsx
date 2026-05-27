'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Calendar,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Repeat,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Ticket,
  User as UserIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { Avatar, Drawer, IconButton, SearchBar } from '@/components/ui'
import { Seller, SubscriptionPlan } from '@/types'
import { cn, subscriptionLabel } from '@/lib/utils'
import { logout as apiLogout } from '@/lib/api/auth'
import { CartDrawer } from '@/components/cart/CartDrawer'

const PUBLIC_NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/vendedores', label: 'Vendedores' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
] as const

const SHOP_LINK = { href: '/mi-tienda', label: 'Mi Tienda' } as const
const ADMIN_LINK = { href: '/admin', label: 'Panel admin' } as const

export function MarketplaceHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isSeller, isAdmin, logout } = useAuth()
  const { itemCount, clearCart } = useCart()
  const { showSuccess, showError } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        menuRef.current?.contains(t) ||
        menuTriggerRef.current?.contains(t)
      ) return
      setMenuOpen(false)
    }
    const handleKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuTriggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  function submitSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    setMobileOpen(false)
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo')
  }

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    setMenuOpen(false)
    setMobileOpen(false)
    const farewell = displayName
    try {
      await apiLogout()
    } catch {
      showError(
        'No pudimos cerrar tu sesión',
        'Inténtalo nuevamente en unos segundos'
      )
      setLoggingOut(false)
      return
    }
    // Navegamos primero para evitar que un RouteGuard intercepte
    // y redirija a /login?next=<ruta protegida> mientras el state
    // de sesión cae a null.
    router.push('/')
    logout()
    clearCart()
    showSuccess('Sesión cerrada', `¡Hasta pronto, ${farewell}!`)
    setLoggingOut(false)
  }

  const sellerName = user?.role === 'seller' ? (user as Seller).businessName : null
  const displayName = sellerName ?? (user?.role === 'buyer' ? user.name : 'Invitado')
  const avatarSrc =
    user?.role === 'seller' ? (user as Seller).logo : user?.avatar

  return (
    <header className="sticky top-0 z-40 bg-primary-300 text-white shadow-sm">
      {/* FILA 1 — logo + búsqueda + acciones */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 font-serif text-xl font-bold text-white"
          aria-label="Cafital — Inicio"
        >
          Cafital
        </Link>

        {/* Search — md+. Sin max-width: ocupa todo el espacio disponible
            entre el logo y el bloque de acciones para llenar la fila. */}
        <form
          onSubmit={submitSearch}
          role="search"
          className="hidden flex-1 md:flex"
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar café, equipos, servicios…"
          />
        </form>

        {/* Spacer when search hidden */}
        <div className="flex-1 md:hidden" />

        {/* Icon actions — md+ */}
        <div className="hidden items-center gap-1 md:flex">
          {isSeller && (
            <PlansPill
              currentPlan={(user as Seller).subscriptionPlan}
              onClick={() => router.push('/mi-tienda/planes')}
            />
          )}
          <IconButton
            onClick={() => router.push('/favoritos')}
            icon={<Heart size={20} strokeWidth={1.5} />}
            label="Mis favoritos"
            className="text-white hover:bg-white/10 hover:text-white"
          />
          <CartIconButton count={itemCount} onClick={() => setCartOpen(true)} />

          {user ? (
            <div className="relative ml-1">
              <button
                ref={menuTriggerRef}
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-10 items-center gap-2 rounded-lg pl-1 pr-2 text-left transition-colors hover:bg-white/10"
              >
                <Avatar
                  src={avatarSrc}
                  alt={displayName}
                  fallback={displayName}
                  size="sm"
                  square={isSeller}
                />
                <span className="hidden text-sm font-medium text-white xl:inline-block xl:max-w-32 xl:truncate">
                  {displayName}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={cn(
                    'text-white/80 transition-transform',
                    menuOpen && 'rotate-180'
                  )}
                />
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md"
                >
                  <div className="border-b border-neutral-200 px-4 py-3">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {user.email}
                    </p>
                  </div>
                  {!isAdmin && (
                    <AccountMenu
                      isSeller={isSeller}
                      pathname={pathname}
                      onSelect={() => setMenuOpen(false)}
                    />
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
                    >
                      <LayoutDashboard size={16} strokeWidth={1.5} className="text-neutral-500" />
                      Panel admin
                    </Link>
                  )}
                  <div className="border-t border-neutral-200">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
                    >
                      <LogOut size={16} strokeWidth={1.5} className="text-neutral-500" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 h-10 rounded-lg bg-white px-4 text-sm font-semibold text-primary-300 transition-colors hover:bg-primary-50 inline-flex items-center"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <CartIconButton count={itemCount} onClick={() => setCartOpen(true)} />
          <IconButton
            onClick={() => setMobileOpen(true)}
            icon={<Menu size={22} strokeWidth={1.5} />}
            label="Abrir menú"
            className="text-white hover:bg-white/10 hover:text-white"
          />
        </div>
      </div>

      {/* FILA 2 — nav links centrados (md+). En mobile el drawer cubre
          esta navegación. */}
      <nav
        aria-label="Navegación principal"
        className="hidden border-t border-white/10 md:block"
      >
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-6 overflow-x-auto px-4 py-1.5 sm:px-6 sm:gap-8 lg:gap-12 lg:px-8">
          {PUBLIC_NAV_LINKS.map((link) => (
            <li key={link.href} className="shrink-0">
              <NavLink
                href={link.href}
                active={isActive(pathname, link.href)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {user && !isAdmin && (
            <li className="shrink-0">
              <NavLink
                href={SHOP_LINK.href}
                active={isActive(pathname, SHOP_LINK.href)}
              >
                {SHOP_LINK.label}
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li className="shrink-0">
              <NavLink
                href={ADMIN_LINK.href}
                active={isActive(pathname, ADMIN_LINK.href)}
              >
                {ADMIN_LINK.label}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        query={query}
        setQuery={setQuery}
        onSearch={submitSearch}
        onLogout={handleLogout}
        pathname={pathname}
        user={user}
        isSeller={isSeller}
        isAdmin={isAdmin}
        displayName={displayName}
        avatarSrc={avatarSrc}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  )
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(href + '/')
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-white/15 text-white'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      )}
    >
      {children}
    </Link>
  )
}

function PlansPill({
  currentPlan,
  onClick,
}: {
  currentPlan: SubscriptionPlan
  onClick: () => void
}) {
  const isFree = currentPlan === 'none'
  const label = isFree ? 'Mejorar plan' : subscriptionLabel(currentPlan)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isFree ? 'Ver planes disponibles' : `Ver planes — actual: ${label}`}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100',
        isFree
          ? 'border-white/30 bg-transparent text-white hover:bg-white/10'
          : 'border-white/40 bg-white/15 text-white hover:bg-white/25'
      )}
    >
      <Sparkles size={14} strokeWidth={1.5} aria-hidden />
      <span className="hidden xl:inline">{label}</span>
      <span className="xl:hidden">Planes</span>
    </button>
  )
}

function CartIconButton({
  count,
  onClick,
}: {
  count: number
  onClick: () => void
}) {
  return (
    <div className="relative">
      <IconButton
        onClick={onClick}
        icon={<ShoppingCart size={20} strokeWidth={1.5} />}
        label={`Carrito${count ? ` (${count} ítems)` : ''}`}
        className="text-white hover:bg-white/10 hover:text-white"
      />
      {count > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-primary-300"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  )
}

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  query: string
  setQuery: (v: string) => void
  onSearch: (e: FormEvent) => void
  onLogout: () => void
  pathname: string | null
  user: ReturnType<typeof useAuth>['user']
  isSeller: boolean
  isAdmin: boolean
  displayName: string
  avatarSrc: string | undefined
}

function MobileMenu({
  open,
  onClose,
  query,
  setQuery,
  onSearch,
  onLogout,
  pathname,
  user,
  isSeller,
  isAdmin,
  displayName,
  avatarSrc,
}: MobileMenuProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Menú" side="right" size="md">
      <div className="flex flex-col gap-6">
        <form onSubmit={(e) => { onSearch(e); onClose() }} role="search">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar en Cafital…"
          />
        </form>

        <nav aria-label="Navegación principal">
          <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
            Marketplace
          </p>
          <ul className="flex flex-col">
            {PUBLIC_NAV_LINKS.map((link) => (
              <MobileNavLink
                key={link.href}
                href={link.href}
                active={isActive(pathname, link.href)}
                onSelect={onClose}
              >
                {link.label}
              </MobileNavLink>
            ))}
            {user && !isAdmin && (
              <MobileNavLink
                href={SHOP_LINK.href}
                active={isActive(pathname, SHOP_LINK.href)}
                onSelect={onClose}
              >
                {SHOP_LINK.label}
              </MobileNavLink>
            )}
            {isAdmin && (
              <MobileNavLink
                href={ADMIN_LINK.href}
                active={isActive(pathname, ADMIN_LINK.href)}
                onSelect={onClose}
              >
                {ADMIN_LINK.label}
              </MobileNavLink>
            )}
          </ul>
        </nav>

        {user && !isAdmin && (
          <nav aria-label="Mi cuenta">
            <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Mi cuenta
            </p>
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <AccountMenu
                isSeller={isSeller}
                pathname={pathname}
                onSelect={onClose}
              />
            </div>
          </nav>
        )}

        <div className="mt-2 border-t border-neutral-200 pt-4">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  src={avatarSrc}
                  alt={displayName}
                  fallback={displayName}
                  size="sm"
                  square={isSeller}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-neutral-500">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Cerrar sesión"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Salir
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-primary-500 bg-white px-4 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}

function MobileNavLink({
  href,
  active,
  children,
  onSelect,
  icon,
  suffix,
}: {
  href: string
  active: boolean
  children: ReactNode
  onSelect: () => void
  icon?: ReactNode
  suffix?: string
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onSelect}
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          active
            ? 'bg-primary-50 text-primary-700'
            : 'text-neutral-900 hover:bg-neutral-100'
        )}
      >
        <span className="flex items-center gap-3">
          {icon && (
            <span className={active ? 'text-primary-500' : 'text-neutral-500'}>
              {icon}
            </span>
          )}
          {children}
        </span>
        {suffix && (
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-900">
            {suffix}
          </span>
        )}
      </Link>
    </li>
  )
}

/* ─── ACCOUNT MENU (grupos colapsables) ─────────────────────────
 * Compartido entre el dropdown desktop y la sección "Mi cuenta" del drawer
 * mobile. Cada grupo se expande/colapsa de forma independiente.
 */

type AccountMenuItem = {
  href: string
  label: string
  Icon: typeof Package
}

type AccountMenuGroup = {
  id: string
  label: string
  Icon: typeof ShoppingBag
  sellerOnly?: boolean
  items: AccountMenuItem[]
}

const ACCOUNT_MENU_GROUPS: AccountMenuGroup[] = [
  {
    id: 'compras',
    label: 'Compras',
    Icon: ShoppingBag,
    items: [
      { href: '/pedidos', label: 'Mis pedidos', Icon: Package },
      { href: '/suscripciones', label: 'Compras recurrentes', Icon: Repeat },
      { href: '/inscripciones', label: 'Mis inscripciones', Icon: Ticket },
      { href: '/favoritos', label: 'Favoritos', Icon: Heart },
    ],
  },
  {
    id: 'ventas',
    label: 'Ventas',
    Icon: Store,
    sellerOnly: true,
    items: [
      { href: '/mi-tienda', label: 'Resumen', Icon: LayoutDashboard },
      { href: '/mi-tienda/pedidos', label: 'Pedidos recibidos', Icon: ShoppingBag },
      { href: '/mi-tienda/publicaciones', label: 'Publicaciones', Icon: Package },
      { href: '/mi-tienda/eventos', label: 'Eventos', Icon: Calendar },
      { href: '/mi-tienda/planes', label: 'Planes', Icon: Sparkles },
    ],
  },
  {
    id: 'perfil',
    label: 'Mi perfil',
    Icon: UserIcon,
    items: [
      { href: '/perfil', label: 'Datos personales', Icon: UserIcon },
      { href: '/ajustes', label: 'Ajustes', Icon: Settings },
    ],
  },
]

function AccountMenu({
  isSeller,
  pathname,
  onSelect,
}: {
  isSeller: boolean
  pathname: string | null
  onSelect: () => void
}) {
  const visibleGroups = ACCOUNT_MENU_GROUPS.filter(
    (g) => !g.sellerOnly || isSeller
  )

  // Estado inicial: vendedor abre "Ventas", comprador abre "Compras".
  // El usuario puede expandir / colapsar otros grupos a voluntad.
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set<string>([isSeller ? 'ventas' : 'compras'])
  )

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <ul className="flex flex-col" role="menu">
      {visibleGroups.map((group) => {
        const isOpen = openIds.has(group.id)
        const GroupIcon = group.Icon
        const groupHasActive = group.items.some((item) =>
          isActive(pathname, item.href)
        )
        return (
          <li
            key={group.id}
            className="border-b border-neutral-200 last:border-b-0"
          >
            <button
              type="button"
              onClick={() => toggle(group.id)}
              aria-expanded={isOpen}
              aria-controls={`menu-group-${group.id}`}
              className={cn(
                'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:bg-neutral-100',
                groupHasActive && 'bg-primary-50/50'
              )}
            >
              <span className="inline-flex items-center gap-3 text-sm font-semibold text-neutral-900">
                <GroupIcon
                  size={16}
                  strokeWidth={1.5}
                  className={
                    groupHasActive ? 'text-primary-500' : 'text-neutral-500'
                  }
                  aria-hidden
                />
                {group.label}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={cn(
                  'text-neutral-500 transition-transform',
                  isOpen && 'rotate-180'
                )}
                aria-hidden
              />
            </button>
            {isOpen && (
              <ul id={`menu-group-${group.id}`} className="pb-2" role="group">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  const ItemIcon = item.Icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        role="menuitem"
                        onClick={onSelect}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 py-2 pl-12 pr-4 text-sm transition-colors',
                          active
                            ? 'bg-primary-50 font-medium text-primary-700'
                            : 'text-neutral-900 hover:bg-neutral-100'
                        )}
                      >
                        <ItemIcon
                          size={14}
                          strokeWidth={1.5}
                          className={
                            active ? 'text-primary-500' : 'text-neutral-500'
                          }
                          aria-hidden
                        />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}
