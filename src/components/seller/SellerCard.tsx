import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, MapPin } from 'lucide-react'
import { Seller, SubscriptionPlan } from '@/types'
import { cn } from '@/lib/utils'

interface SellerCardProps {
  seller: Seller
  publicationsCount?: number
  className?: string
}

const PLAN_LABEL: Record<Exclude<SubscriptionPlan, 'none'>, string> = {
  semilla: 'Plan Semilla',
  cosecha: 'Plan Cosecha',
  exportacion: 'Plan Exportación',
}

const PLAN_TONE: Record<
  Exclude<SubscriptionPlan, 'none'>,
  { badge: string; chipBg: string; chipText: string }
> = {
  semilla: {
    badge: 'text-primary-500',
    chipBg: 'bg-primary-50',
    chipText: 'text-primary-700',
  },
  cosecha: {
    badge: 'text-primary-500',
    chipBg: 'bg-primary-100',
    chipText: 'text-primary-900',
  },
  exportacion: {
    badge: 'text-accent-700',
    chipBg: 'bg-accent-100',
    chipText: 'text-accent-900',
  },
}

export function SellerCard({ seller, publicationsCount, className }: SellerCardProps) {
  const plan = seller.subscriptionPlan
  const planMeta = plan !== 'none' ? PLAN_TONE[plan] : null

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <Link
        href={`/vendedor/${seller.id}`}
        className="flex flex-1 flex-col focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
          {seller.banner ? (
            <Image
              src={seller.banner}
              alt={`Portada de ${seller.businessName}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAFAFA_25%,transparent_25%,transparent_50%,#FAFAFA_50%,#FAFAFA_75%,transparent_75%,transparent)] bg-[length:14px_14px]" />
          )}
          {planMeta && (
            <span
              className={cn(
                'absolute right-2 top-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium shadow-xs',
                planMeta.chipBg,
                planMeta.chipText
              )}
            >
              {PLAN_LABEL[plan as Exclude<SubscriptionPlan, 'none'>]}
            </span>
          )}
        </div>

        <div className="relative -mt-8 px-4 pb-4 pt-4">
          <div className="flex items-start gap-3">
            <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl border-4 border-white bg-neutral-100 shadow-sm">
              {seller.logo ? (
                <Image
                  src={seller.logo}
                  alt={`Logo de ${seller.businessName}`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500"
                  aria-label={`Logo de ${seller.businessName}`}
                >
                  {seller.businessName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>

            <div className="flex min-w-0 flex-1 flex-col pt-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
                  {seller.businessName}
                </h3>
                {planMeta && (
                  <BadgeCheck
                    size={14}
                    strokeWidth={1.5}
                    className={planMeta.badge}
                    aria-label="Vendedor verificado"
                  />
                )}
              </div>
              {seller.department && (
                <p className="flex items-center gap-1 truncate text-xs text-neutral-500">
                  <MapPin size={11} strokeWidth={1.5} aria-hidden />
                  {seller.municipality
                    ? `${seller.municipality}, ${seller.department}`
                    : seller.department}
                </p>
              )}
            </div>
          </div>

          {seller.description && (
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-neutral-500">
              {seller.description}
            </p>
          )}

          {typeof publicationsCount === 'number' && (
            <p className="mt-3 text-xs font-medium text-neutral-900">
              {publicationsCount === 0
                ? 'Sin publicaciones activas'
                : publicationsCount === 1
                  ? '1 publicación activa'
                  : `${publicationsCount} publicaciones activas`}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}
