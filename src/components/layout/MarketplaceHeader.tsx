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
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Repeat,
  ShoppingCart,
  Store,
  User as UserIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Avatar, Drawer, IconButton, SearchBar } from '@/components/ui'
import { Seller } from '@/types'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/vendedores', label: 'Vendedores' },
] as const

export function MarketplaceHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isSeller, logout } = useAuth()
  const { itemCount } = useCart()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  function handleLogout() {
    logout()
    setMenuOpen(false)
    setMobileOpen(false)
    router.push('/login')
  }

  const sellerName = user?.role === 'seller' ? (user as Seller).businessName : null
  const displayName = sellerName ?? (user?.role === 'buyer' ? user.name : 'Invitado')
  const avatarSrc =
    user?.role === 'seller' ? (user as Seller).logo : user?.avatar

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 font-serif text-xl font-bold text-neutral-900"
          aria-label="Cafital — Inicio"
        >
          Cafital
        </Link>

        {/* Search — desktop */}
        <form
          onSubmit={submitSearch}
          role="search"
          className="hidden flex-1 md:flex md:max-w-xl"
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar café, equipos, servicios…"
          />
        </form>

        {/* Spacer when search hidden */}
        <div className="flex-1 md:hidden" />

        {/* Nav links — lg+ only */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              active={isActive(pathname, link.href)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Icon actions — md+ */}
        <div className="hidden items-center gap-1 md:flex">
          <IconButton
            onClick={() => router.push('/favoritos')}
            icon={<Heart size={20} strokeWidth={1.5} />}
            label="Mis favoritos"
          />
          <CartIconButton count={itemCount} onClick={() => router.push('/carrito')} />

          {user ? (
            <div className="relative ml-1">
              <button
                ref={menuTriggerRef}
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex h-10 items-center gap-2 rounded-lg pl-1 pr-2 text-left transition-colors hover:bg-neutral-100"
              >
                <Avatar
                  src={avatarSrc}
                  alt={displayName}
                  fallback={displayName}
                  size="sm"
                  square={isSeller}
                />
                <span className="hidden text-sm font-medium text-neutral-900 xl:inline-block xl:max-w-32 xl:truncate">
                  {displayName}
                </span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={cn(
                    'text-neutral-500 transition-transform',
                    menuOpen && 'rotate-180'
                  )}
                />
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md"
                >
                  <div className="border-b border-neutral-200 px-4 py-3">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {user.email}
                    </p>
                  </div>
                  <ul className="py-1">
                    <MenuItem
                      href="/perfil"
                      icon={<UserIcon size={18} strokeWidth={1.5} />}
                      onSelect={() => setMenuOpen(false)}
                    >
                      Mi perfil
                    </MenuItem>
                    <MenuItem
                      href="/pedidos"
                      icon={<Package size={18} strokeWidth={1.5} />}
                      onSelect={() => setMenuOpen(false)}
                    >
                      Mis pedidos
                    </MenuItem>
                    <MenuItem
                      href="/suscripciones"
                      icon={<Repeat size={18} strokeWidth={1.5} />}
                      onSelect={() => setMenuOpen(false)}
                    >
                      Compras recurrentes
                    </MenuItem>
                    {isSeller && (
                      <MenuItem
                        href="/mi-tienda"
                        icon={<Store size={18} strokeWidth={1.5} />}
                        onSelect={() => setMenuOpen(false)}
                      >
                        Mi Tienda
                      </MenuItem>
                    )}
                  </ul>
                  <div className="border-t border-neutral-200 py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
                    >
                      <LogOut size={18} strokeWidth={1.5} className="text-neutral-500" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 h-10 rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500 inline-flex items-center"
            >
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 md:hidden">
          <CartIconButton count={itemCount} onClick={() => router.push('/carrito')} />
          <IconButton
            onClick={() => setMobileOpen(true)}
            icon={<Menu size={22} strokeWidth={1.5} />}
            label="Abrir menú"
          />
        </div>

        {/* Hamburger — md (sin lg) para acceder a nav links */}
        <div className="hidden md:flex lg:hidden">
          <IconButton
            onClick={() => setMobileOpen(true)}
            icon={<Menu size={22} strokeWidth={1.5} />}
            label="Abrir navegación"
          />
        </div>
      </div>

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
        displayName={displayName}
        avatarSrc={avatarSrc}
        itemCount={itemCount}
      />
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
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
      )}
    >
      {children}
    </Link>
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
      />
      {count > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-300 px-1 text-[10px] font-semibold text-primary-900"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  )
}

function MenuItem({
  href,
  icon,
  children,
  onSelect,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
  onSelect: () => void
}) {
  return (
    <li>
      <Link
        href={href}
        role="menuitem"
        onClick={onSelect}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-900 transition-colors hover:bg-neutral-100"
      >
        <span className="text-neutral-500">{icon}</span>
        {children}
      </Link>
    </li>
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
  displayName: string
  avatarSrc: string | undefined
  itemCount: number
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
  displayName,
  avatarSrc,
  itemCount,
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
            {NAV_LINKS.map((link) => (
              <MobileNavLink
                key={link.href}
                href={link.href}
                active={isActive(pathname, link.href)}
                onSelect={onClose}
              >
                {link.label}
              </MobileNavLink>
            ))}
          </ul>
        </nav>

        <nav aria-label="Mi cuenta">
          <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
            Mi cuenta
          </p>
          <ul className="flex flex-col">
            <MobileNavLink
              href="/favoritos"
              active={isActive(pathname, '/favoritos')}
              onSelect={onClose}
              icon={<Heart size={18} strokeWidth={1.5} />}
            >
              Favoritos
            </MobileNavLink>
            <MobileNavLink
              href="/carrito"
              active={isActive(pathname, '/carrito')}
              onSelect={onClose}
              icon={<ShoppingCart size={18} strokeWidth={1.5} />}
              suffix={itemCount > 0 ? `${itemCount}` : undefined}
            >
              Carrito
            </MobileNavLink>
            <MobileNavLink
              href="/perfil"
              active={isActive(pathname, '/perfil')}
              onSelect={onClose}
              icon={<UserIcon size={18} strokeWidth={1.5} />}
            >
              Mi perfil
            </MobileNavLink>
            <MobileNavLink
              href="/pedidos"
              active={isActive(pathname, '/pedidos')}
              onSelect={onClose}
              icon={<Package size={18} strokeWidth={1.5} />}
            >
              Mis pedidos
            </MobileNavLink>
            <MobileNavLink
              href="/suscripciones"
              active={isActive(pathname, '/suscripciones')}
              onSelect={onClose}
              icon={<Repeat size={18} strokeWidth={1.5} />}
            >
              Compras recurrentes
            </MobileNavLink>
            {isSeller && (
              <MobileNavLink
                href="/mi-tienda"
                active={isActive(pathname, '/mi-tienda')}
                onSelect={onClose}
                icon={<Store size={18} strokeWidth={1.5} />}
              >
                Mi Tienda
              </MobileNavLink>
            )}
          </ul>
        </nav>

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
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-300 px-4 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-500"
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
