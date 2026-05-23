import Link from 'next/link';
import { SearchX, Sparkles, Store } from 'lucide-react';

import { Seller } from '@/types';
import { CardCarousel } from '@/components/ui/CardCarousel';
import { EmptyState } from '@/components/ui/EmptyState';

import { SellerCard } from '@/components/seller/SellerCard';
import { SellersFilterPanel } from '@/components/seller/SellersFilterPanel';
import { SellersMobileFiltersDrawer } from '@/components/seller/SellersMobileFiltersDrawer';
import { SellersToolbar } from '@/components/seller/SellersToolbar';
import { SellersGrid } from '@/components/seller/SellersGrid';
import {
  buildSellerIndex,
  pickFeaturedSellers,
  type SellerCommercialIndex,
} from '@/components/seller/sellerCategoriesUtils';
import { CERTIFICATION_OPTIONS } from '@/data/schemas/dynamicFilters';
import {
  countActiveSellerFilters,
  parseSellerFilters,
  SellerFiltersState,
} from '@/components/seller/sellerFiltersState';

import { listPublications } from '@/lib/api/publications';
import { listSellers } from '@/lib/api/users';

type SearchParamValue = string | string[] | undefined;

const PLAN_RANK = {
  exportacion: 0,
  cosecha: 1,
  semilla: 2,
  none: 3,
} as const;

export default async function VendedoresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const raw = await searchParams;
  const state = parseSellerFilters(raw);

  const [sellersAll, pubs] = await Promise.all([
    listSellers(),
    listPublications(), // solo activas por defecto
  ]);

  const indexMap = buildSellerIndex(sellersAll, pubs);
  const index: Record<string, SellerCommercialIndex> = Object.fromEntries(
    indexMap.entries(),
  );

  // Filtra y ordena en servidor (vista por defecto + filtros aplicados)
  const filtered = filterAndSort(sellersAll, index, state);

  const activeCount = countActiveSellerFilters(state);
  const grouped = state.category === null;
  // Cuando no hay categoría seleccionada mostramos agrupado;
  // si hay categoría (o búsqueda/filtros) el grid es plano.

  // Destacados: planes Cosecha + Exportación con al menos 1 publicación activa.
  // Solo se muestran cuando NO hay filtros activos, para que la pantalla
  // filtrada no se distraiga con elementos comerciales fuera del foco.
  const featured =
    activeCount === 0
      ? pickFeaturedSellers(sellersAll).filter(
          s => (index[s.id]?.activeCount ?? 0) > 0,
        )
      : [];

  return (
    <div className="bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <header className="mb-6 flex flex-col gap-1 sm:mb-8">
          <h1 className="font-serif text-2xl font-semibold text-neutral-900 sm:text-3xl">
            Vendedores
          </h1>
          <p className="text-sm text-neutral-500">
            Productores, tostadurías, proveedores de maquinaria, consultores y
            fincas del ecosistema del café en Bolivia.
          </p>
        </header>

        {featured.length > 0 && (
          <section
            aria-labelledby="featured-sellers-heading"
            className="mb-8 flex flex-col gap-4 sm:mb-10"
          >
            <div className="flex items-center gap-2">
              <Sparkles
                size={18}
                strokeWidth={1.5}
                className="text-primary-500"
                aria-hidden
              />
              <h2
                id="featured-sellers-heading"
                className="font-serif text-lg font-semibold text-neutral-900 sm:text-xl"
              >
                Destacados
              </h2>
            </div>
            <CardCarousel ariaLabel="Vendedores destacados">
              {featured.map(s => (
                <SellerCard
                  key={s.id}
                  seller={s}
                  categories={index[s.id]?.categories ?? []}
                  publicationsCount={index[s.id]?.activeCount}
                />
              ))}
            </CardCarousel>
          </section>
        )}

        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <SellersFilterPanel state={state} />
            </div>
          </aside>

          <div className="flex flex-col gap-5">
            <SellersToolbar
              state={state}
              resultCount={filtered.length}
              mobileFiltersTrigger={
                <SellersMobileFiltersDrawer state={state} />
              }
            />

            {filtered.length === 0 ? (
              <EmptyState
                icon={
                  activeCount > 0 ? (
                    <SearchX size={28} strokeWidth={1.5} />
                  ) : (
                    <Store size={28} strokeWidth={1.5} />
                  )
                }
                title={
                  activeCount > 0
                    ? 'Sin vendedores con estos filtros'
                    : 'Aún no hay vendedores activos'
                }
                description={
                  activeCount > 0
                    ? 'Prueba quitar algún filtro o limpiarlos para ver más resultados.'
                    : 'Pronto verás aquí los negocios del ecosistema del café boliviano.'
                }
                action={
                  activeCount > 0 ? (
                    <Link
                      href="/vendedores"
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary-500 bg-white px-4 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
                    >
                      Limpiar filtros
                    </Link>
                  ) : null
                }
              />
            ) : (
              <SellersGrid
                sellers={filtered}
                index={index}
                grouped={grouped}
                state={state}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function filterAndSort(
  sellers: Seller[],
  index: Record<string, SellerCommercialIndex>,
  state: SellerFiltersState,
): Seller[] {
  // Mapa slug → label para certificaciones (reutiliza el del catálogo)
  const certLabels = state.certifications
    .map(slug => CERTIFICATION_OPTIONS.find(o => o.value === slug)?.match)
    .filter((s): s is string => Boolean(s));

  const filtered = sellers.filter(s => {
    const info = index[s.id];
    // Sin publicaciones activas: ocultos del grid por decisión de UX
    if (!info || info.activeCount === 0) return false;
    if (state.verifiedOnly && s.subscriptionPlan === 'none') return false;
    if (state.category && !info.categories.includes(state.category))
      return false;
    if (state.department && s.department !== state.department) return false;
    if (certLabels.length > 0) {
      const has = certLabels.some(label => info.certifications.includes(label));
      if (!has) return false;
    }
    if (state.q) {
      const needle = state.q.toLowerCase();
      const hay = `${s.businessName} ${s.description ?? ''}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  switch (state.sort) {
    case 'alphabetic':
      return [...filtered].sort((a, b) =>
        a.businessName.localeCompare(b.businessName, 'es'),
      );
    case 'mostPublications':
      return [...filtered].sort((a, b) => {
        const diff =
          (index[b.id]?.activeCount ?? 0) - (index[a.id]?.activeCount ?? 0);
        if (diff !== 0) return diff;
        return a.businessName.localeCompare(b.businessName, 'es');
      });
    case 'featured':
    default:
      return [...filtered].sort((a, b) => {
        const rank =
          PLAN_RANK[a.subscriptionPlan] - PLAN_RANK[b.subscriptionPlan];
        if (rank !== 0) return rank;
        return a.businessName.localeCompare(b.businessName, 'es');
      });
  }
}
