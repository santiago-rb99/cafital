import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react'

import { getOrder } from '@/lib/api/orders'
import { getUser } from '@/lib/api/users'
import { Seller } from '@/types'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

import { formatDateTime, formatPrice } from '@/lib/utils'

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) notFound()

  const sellerUser = await getUser(order.sellerId)
  const seller = sellerUser?.role === 'seller' ? (sellerUser as Seller) : null

  const isJustCreated = order.status === 'pending'
  const created = new Date(order.createdAt)
  const createdLabel = formatDateTime(
    order.createdAt,
    `${created.getHours().toString().padStart(2, '0')}:${created
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  )

  return (
    <div className="bg-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs
          items={[
            { label: 'Mis pedidos', href: '/pedidos' },
            { label: `Pedido ${order.id.slice(-8)}` },
          ]}
          className="mb-5"
        />

        {isJustCreated && (
          <section
            aria-label="Confirmación del pedido"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-primary-100 bg-primary-50 px-5 py-4 text-primary-900"
          >
            <CheckCircle2
              size={22}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-primary-500"
              aria-hidden
            />
            <div className="flex flex-col gap-0.5">
              <p className="font-serif text-lg font-semibold leading-tight">
                ¡Pedido confirmado!
              </p>
              <p className="text-sm leading-relaxed text-primary-700">
                Te avisaremos cuando el vendedor lo procese y lo despache.
              </p>
            </div>
          </section>
        )}

        <header className="mb-6 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
              Pedido {order.id.slice(-8)}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-neutral-500">
            Realizado el {createdLabel}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[1fr_320px] md:gap-8">
          <div className="flex flex-col gap-6">
            <section
              aria-labelledby="seller-heading"
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2
                id="seller-heading"
                className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500"
              >
                Pedido a
              </h2>
              <div className="flex items-center gap-3">
                <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                  {seller?.logo ? (
                    <Image
                      src={seller.logo}
                      alt={`Logo de ${order.sellerName}`}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-500">
                      {order.sellerName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-sm font-semibold text-neutral-900">
                    {order.sellerName}
                  </p>
                  {seller?.department && (
                    <p className="inline-flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin size={11} strokeWidth={1.5} aria-hidden />
                      {seller.municipality
                        ? `${seller.municipality}, ${seller.department}`
                        : seller.department}
                    </p>
                  )}
                </div>
                {seller && (
                  <Link
                    href={`/vendedor/${seller.id}`}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                  >
                    Ver tienda
                    <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
                  </Link>
                )}
              </div>
            </section>

            <section
              aria-labelledby="items-heading"
              className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
            >
              <h2
                id="items-heading"
                className="border-b border-neutral-200 px-6 py-4 text-xs font-medium uppercase tracking-wider text-neutral-500"
              >
                Productos
              </h2>
              <ul role="list" className="divide-y divide-neutral-200">
                {order.items.map((item, i) => (
                  <li
                    key={`${item.publicationId}-${i}`}
                    className="flex gap-3 p-4 sm:p-6"
                  >
                    <Link
                      href={`/publicacion/${item.publicationId}`}
                      className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                    >
                      <Image
                        src={item.photo}
                        alt={item.publicationTitle}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <Link
                        href={`/publicacion/${item.publicationId}`}
                        className="text-sm font-medium text-neutral-900 hover:text-primary-700 focus:outline-none focus-visible:underline"
                      >
                        {item.publicationTitle}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        {item.unit} · {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end text-right">
                      <span className="text-sm font-semibold tabular-nums text-neutral-900">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatPrice(item.unitPrice)} / unidad
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside aria-label="Total del pedido">
            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-neutral-900">
                Total
              </h2>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Productos</dt>
                  <dd className="tabular-nums text-neutral-900">
                    {order.items.length}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base">
                  <dt className="font-semibold text-neutral-900">Total</dt>
                  <dd className="font-serif text-xl font-semibold tabular-nums text-neutral-900">
                    {formatPrice(order.total)}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/pedidos"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                >
                  Ver mis pedidos
                </Link>
                <Link
                  href="/catalogo"
                  className="text-center text-sm font-medium text-primary-500 transition-colors hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
                >
                  Seguir explorando
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
