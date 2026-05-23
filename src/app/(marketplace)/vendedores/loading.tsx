import { PageGridSkeleton, SellerCardSkeleton } from '@/components/ui'

export default function VendedoresLoading() {
  return (
    <PageGridSkeleton
      Item={SellerCardSkeleton}
      count={9}
      withFilters
    />
  )
}
