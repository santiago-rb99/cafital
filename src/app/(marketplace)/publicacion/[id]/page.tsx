import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BadgeCheck, MapPin } from 'lucide-react'

import { Publication, Seller } from '@/types'
import {
  getPublication,
  listPublications,
} from '@/lib/api/publications'
import { getUser, listSellers } from '@/lib/api/users'
import { getSubcategory } from '@/lib/api/categories'

import { ImageGallery } from '@/components/ui/ImageGallery'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { AttributeRenderer } from '@/components/catalog/AttributeRenderer'
import { PurchasePanel } from '@/components/catalog/PurchasePanel'
import { RelatedPublications } from '@/components/catalog/RelatedPublications'

const CATEGORY_LABEL: Record<Publication['category'], string> = {
  A: 'Café e insumos',
  B: 'Maquinaria y equipo',
  C: 'Servicios profesionales',
  D: 'Terrenos y fincas',
}

export default async function PublicacionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const publication = await getPublication(id)
  if (!publication || publication.status !== 'active') notFound()

  const [sellerUser, subcategory, sellers] = await Promise.all([
    getUser(publication.sellerId),
    getSubcategory(publication.subcategory),
    listSellers(),
  ])

  const seller = sellerUser?.role === 'seller' ? (sellerUser as Seller) : null
  if (!seller) notFound()

  const sellersById = new Map(sellers.map((s) => [s.id, s]))

  const [moreFromSeller, sameSubcategory] = await Promise.all([
    listPublications({
      filters: { sellerId: seller.id },
      sort: 'recent',
    }),
    listPublications({
      filters: { subcategory: publication.subcategory },
      sort: 'recent',
    }),
  ])

  const moreFromSellerList = moreFromSeller
    .filter((p) => p.id !== publication.id)
    .slice(0, 8)
  const sameSubcategoryList = sameSubcategory
    .filter(
      (p) => p.id !== publication.id && p.sellerId !== publication.sellerId
    )
    .slice(0, 8)

  const isLand = publication.category === 'D'
  const isVerifiedSeller = seller.subscriptionPlan !== 'none'

  return (
    <div className="bg-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Breadcrumbs
          items={[
            { label: 'Catálogo', href: '/catalogo' },
            {
              label: CATEGORY_LABEL[publication.category],
              href: `/catalogo?category=${publication.category}`,
            },
            ...(subcategory
              ? [
                  {
                    label: subcategory.name,
                    href: `/catalogo?category=${publication.category}&subcategory=${subcategory.id}`,
                  },
                ]
              : []),
            { label: publication.title },
          ]}
          className="mb-5"
        />

        <div className="grid gap-6 md:grid-cols-[1fr_400px] md:gap-8 lg:gap-10">
          <div className="flex flex-col gap-3">
            <ImageGallery
              images={publication.photos}
              alt={publication.title}
            />
          </div>

          <div className="flex flex-col gap-4 md:sticky md:top-20 md:self-start">
            <div className="flex flex-col gap-2">
              {subcategory && (
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {subcategory.name}
                </p>
              )}
              <h1 className="font-serif text-2xl font-bold leading-tight text-neutral-900 sm:text-[28px]">
                {publication.title}
              </h1>
              <p className="text-xs text-neutral-500">
                por{' '}
                <Link
                  href={`/vendedor/${seller.id}`}
                  className="font-medium text-neutral-900 hover:text-primary-700 hover:underline focus:outline-none focus-visible:underline"
                >
                  {seller.businessName}
                </Link>
                {isVerifiedSeller && (
                  <BadgeCheck
                    size={12}
                    strokeWidth={1.5}
                    className="-mt-0.5 ml-1 inline text-primary-500"
                    aria-label="Vendedor verificado"
                  />
                )}
              </p>
            </div>

            <PurchasePanel
              publication={publication}
              sellerId={seller.id}
              sellerName={seller.businessName}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_400px] md:gap-8 lg:gap-10">
          <div className="flex flex-col gap-10">
            <section
              aria-labelledby="desc-heading"
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2
                id="desc-heading"
                className="mb-3 font-serif text-lg font-semibold text-neutral-900"
              >
                Descripción
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-900">
                {publication.description}
              </p>

              {publication.variants && (
                <div className="mt-5 border-t border-neutral-200 pt-5">
                  <h3 className="mb-2 text-[13px] font-semibold text-neutral-900">
                    Variantes disponibles
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-900">
                    {publication.variants}
                  </p>
                </div>
              )}

              {publication.coverage.length > 0 && (
                <div className="mt-5 border-t border-neutral-200 pt-5">
                  <h3 className="mb-2 text-[13px] font-semibold text-neutral-900">
                    Cobertura de envío
                  </h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {publication.coverage.map((dep) => (
                      <li
                        key={dep}
                        className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[13px] font-medium text-neutral-900"
                      >
                        <MapPin size={11} strokeWidth={1.5} aria-hidden />
                        {dep}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {Object.keys(publication.attributes).length > 0 && (
              <section
                aria-labelledby="specs-heading"
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <h2
                  id="specs-heading"
                  className="mb-5 font-serif text-lg font-semibold text-neutral-900"
                >
                  Especificaciones
                </h2>
                <AttributeRenderer attributes={publication.attributes} />
              </section>
            )}

            <SellerSummary seller={seller} verified={isVerifiedSeller} />
          </div>

          <div aria-hidden className="hidden md:block" />
        </div>

        {(moreFromSellerList.length > 0 || sameSubcategoryList.length > 0) && (
          <div className="mt-12 flex flex-col gap-10">
            {moreFromSellerList.length > 0 && (
              <RelatedPublications
                title={`Más de ${seller.businessName}`}
                publications={moreFromSellerList}
                sellersById={sellersById}
              />
            )}
            {!isLand && sameSubcategoryList.length > 0 && (
              <RelatedPublications
                title="Productos relacionados"
                publications={sameSubcategoryList}
                sellersById={sellersById}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SellerSummary({
  seller,
  verified,
}: {
  seller: Seller
  verified: boolean
}) {
  return (
    <section
      aria-labelledby="seller-heading"
      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <h2 id="seller-heading" className="sr-only">
        Sobre el vendedor
      </h2>

      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
        <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          {seller.logo ? (
            <Image
              src={seller.logo}
              alt={`Logo de ${seller.businessName}`}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-neutral-500">
              {seller.businessName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-semibold text-neutral-900">
              {seller.businessName}
            </h3>
            {verified && (
              <BadgeCheck
                size={14}
                strokeWidth={1.5}
                className="text-primary-500"
                aria-label="Vendedor verificado"
              />
            )}
          </div>
          {seller.department && (
            <p className="inline-flex items-center gap-1 text-xs text-neutral-500">
              <MapPin size={12} strokeWidth={1.5} aria-hidden />
              {seller.municipality
                ? `${seller.municipality}, ${seller.department}`
                : seller.department}
            </p>
          )}
          {seller.description && (
            <p className="text-sm leading-relaxed text-neutral-500">
              {seller.description}
            </p>
          )}
        </div>

        <Link
          href={`/vendedor/${seller.id}`}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:border-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
        >
          Ver tienda
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </section>
  )
}
