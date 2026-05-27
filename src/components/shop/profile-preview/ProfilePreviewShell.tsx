'use client'

import { useState } from 'react'
import { Eye, EyeOff, Store } from 'lucide-react'

import { Toggle } from '@/components/ui/Toggle'
import { CardCarousel } from '@/components/ui/CardCarousel'
import { EmptyState } from '@/components/ui/EmptyState'

import { ProductCard } from '@/components/catalog/ProductCard'
import { EventCard } from '@/components/events/EventCard'

import { SellerProfileHero } from '@/components/seller/SellerProfileHero'

import { AboutEditor } from '@/components/subscriptions/AboutEditor'

import { EditableBlock } from './EditableBlock'
import { BusinessIdentityEditor } from './BusinessIdentityEditor'
import { HeroInlineEditor } from './HeroInlineEditor'
import { GalleryInlineEditor } from './GalleryInlineEditor'

import { CafeEvent, Publication, Seller } from '@/types'
import { AdvertisingState } from '@/lib/api/advertising'
import { ButtonLink } from '@/components/ui/Button'

interface ProfilePreviewShellProps {
  seller: Seller
  advertising: AdvertisingState
  publications: Publication[]
  events: CafeEvent[]
}

export function ProfilePreviewShell({
  seller,
  advertising,
  publications,
  events,
}: ProfilePreviewShellProps) {
  const [viewAsVisitor, setViewAsVisitor] = useState(false)
  const [identityOpen, setIdentityOpen] = useState(false)
  const [heroOpen, setHeroOpen] = useState(false)

  const editing = !viewAsVisitor

  const hasPlan = seller.subscriptionPlan !== 'none'
  const showAbout = seller.subscriptionPlan === 'exportacion'
  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = events
    .filter((e) => e.status === 'active' && e.date >= today)
    .slice(0, 8)

  return (
    <div className="flex flex-col gap-6">
      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-700">
            <Eye size={12} strokeWidth={1.5} aria-hidden />
            Vista previa
          </span>
          <p className="text-sm text-neutral-500">
            Así se ve tu perfil público. Pasa el cursor sobre cada bloque para
            editarlo.
          </p>
        </div>
        <Toggle
          checked={viewAsVisitor}
          onChange={setViewAsVisitor}
          label={
            <span className="inline-flex items-center gap-1.5">
              {viewAsVisitor ? (
                <EyeOff size={12} strokeWidth={1.5} aria-hidden />
              ) : (
                <Eye size={12} strokeWidth={1.5} aria-hidden />
              )}
              Ver como visitante
            </span>
          }
          description={
            viewAsVisitor
              ? 'Overlays ocultos.'
              : 'Activa para ver la versión limpia.'
          }
        />
      </div>

      {/* IDENTIDAD (banner + logo + nombre + descripción) */}
      <EditableBlock
        label="identidad del negocio"
        hint="Editar identidad"
        enabled={editing}
        onEdit={() => setIdentityOpen(true)}
        flush
      >
        <SellerProfileHero
          seller={seller}
          publicationsCount={publications.length}
        />
      </EditableBlock>

      {/* HERO PROMOCIONAL */}
      {hasPlan ? (
        <EditableBlock
          label="hero promocional"
          hint="Editar hero"
          enabled={editing}
          onEdit={() => setHeroOpen(true)}
        >
          <HeroPreview seller={seller} advertising={advertising} />
        </EditableBlock>
      ) : (
        editing && <HeroPlaceholder />
      )}

      {/* SOBRE NOSOTROS */}
      {showAbout ? (
        <section className="flex flex-col gap-5">
          <AboutEditor seller={seller} />
        </section>
      ) : (
        editing && <AboutPlaceholder />
      )}

      {/* GALERÍA */}
      <GalleryInlineEditor
        seller={seller}
        galleryMax={advertising.galleryMax}
        enabled={editing}
      />

      {/* PUBLICACIONES */}
      <EditableBlock
        label="publicaciones"
        hint="Gestionar publicaciones"
        enabled={editing}
        href="/mi-tienda/publicaciones"
      >
        <section
          aria-labelledby="preview-publications-heading"
          className="flex flex-col gap-5"
        >
          <h2
            id="preview-publications-heading"
            className="font-serif text-2xl font-semibold text-neutral-900"
          >
            Publicaciones activas
          </h2>

          {publications.length === 0 ? (
            <EmptyState
              icon={<Store size={28} strokeWidth={1.5} />}
              title="Sin publicaciones por ahora"
              description="Aún no tienes publicaciones activas. Crea una desde Mis publicaciones."
            />
          ) : (
            <CardCarousel ariaLabel={`Publicaciones de ${seller.businessName}`}>
              {publications.map((pub) => (
                <ProductCard
                  key={pub.id}
                  publication={pub}
                  sellerName={seller.businessName}
                />
              ))}
            </CardCarousel>
          )}
        </section>
      </EditableBlock>

      {/* EVENTOS */}
      {upcomingEvents.length > 0 && (
        <EditableBlock
          label="eventos"
          hint="Gestionar eventos"
          enabled={editing}
          href="/mi-tienda/eventos"
        >
          <section
            aria-labelledby="preview-events-heading"
            className="flex flex-col gap-5"
          >
            <h2
              id="preview-events-heading"
              className="font-serif text-2xl font-semibold text-neutral-900"
            >
              Próximos eventos del vendedor
            </h2>
            <CardCarousel ariaLabel={`Eventos de ${seller.businessName}`}>
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  organizerName={seller.businessName}
                />
              ))}
            </CardCarousel>
          </section>
        </EditableBlock>
      )}

      {/* DRAWERS */}
      <BusinessIdentityEditor
        seller={seller}
        open={identityOpen}
        onClose={() => setIdentityOpen(false)}
      />
      <HeroInlineEditor
        seller={seller}
        open={heroOpen}
        onClose={() => setHeroOpen(false)}
      />
    </div>
  )
}

function HeroPreview({
  seller,
  advertising,
}: {
  seller: Seller
  advertising: AdvertisingState
}) {
  const image =
    advertising.heroImage ??
    seller.banner ??
    '/images/eventos/expo-cafe-hero.jpg'
  const copy =
    advertising.heroCopy ?? seller.description ?? `Conoce a ${seller.businessName}.`

  return (
    <section
      aria-labelledby="preview-hero-heading"
      className="flex flex-col gap-3"
    >
      <h2
        id="preview-hero-heading"
        className="font-serif text-2xl font-semibold text-neutral-900"
      >
        Tu slide en el hero
      </h2>
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
        <div
          className="relative aspect-3/1 w-full"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-neutral-900/75 via-neutral-900/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:p-8">
            <span className="inline-flex w-fit items-center gap-1 rounded bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
              {seller.businessName}
            </span>
            <p className="max-w-2xl font-serif text-lg font-semibold leading-snug text-white sm:text-xl">
              {copy}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroPlaceholder() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-2xl font-semibold text-neutral-900">
        Hero promocional
      </h2>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center shadow-xs">
        <p className="max-w-md text-sm text-neutral-500">
          Disponible desde el <strong>plan Semilla</strong>. Aparece en el hero
          de Home, Catálogo y Vendedores con tu propia imagen y copy.
        </p>
        <ButtonLink href="/mi-tienda/planes" size="md">
          Ver planes
        </ButtonLink>
      </div>
    </section>
  )
}

function AboutPlaceholder() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-2xl font-semibold text-neutral-900">
        Sobre nosotros
      </h2>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-10 text-center shadow-xs">
        <p className="max-w-md text-sm text-neutral-500">
          Cuenta tu misión, visión e historia. Disponible desde el{' '}
          <strong>plan Exportación</strong>.
        </p>
        <ButtonLink href="/mi-tienda/planes" size="md">
          Ver planes
        </ButtonLink>
      </div>
    </section>
  )
}

