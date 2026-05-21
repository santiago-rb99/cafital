import { Publication, Seller } from '@/types'
import { CardCarousel } from '@/components/ui/CardCarousel'
import { ProductCard } from './ProductCard'

interface RelatedPublicationsProps {
  title: string
  publications: Publication[]
  sellersById: Map<string, Seller>
}

export function RelatedPublications({
  title,
  publications,
  sellersById,
}: RelatedPublicationsProps) {
  if (publications.length === 0) return null

  return (
    <section
      aria-labelledby="related-heading"
      className="flex flex-col gap-5"
    >
      <h2
        id="related-heading"
        className="font-serif text-2xl font-semibold text-neutral-900"
      >
        {title}
      </h2>

      <CardCarousel ariaLabel={title}>
        {publications.map((pub) => {
          const seller = sellersById.get(pub.sellerId)
          return (
            <ProductCard
              key={pub.id}
              publication={pub}
              sellerName={seller?.businessName ?? 'Vendedor Cafital'}
            />
          )
        })}
      </CardCarousel>
    </section>
  )
}
