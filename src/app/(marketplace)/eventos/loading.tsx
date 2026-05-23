import { EventCardSkeleton, PageGridSkeleton } from '@/components/ui'

export default function EventosLoading() {
  return (
    <PageGridSkeleton
      Item={EventCardSkeleton}
      count={9}
      withFilters
    />
  )
}
