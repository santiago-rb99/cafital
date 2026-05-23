import { PageGridSkeleton, ProductCardSkeleton } from '@/components/ui'

export default function CatalogoLoading() {
  return (
    <PageGridSkeleton
      Item={ProductCardSkeleton}
      count={12}
      withFilters
    />
  )
}
