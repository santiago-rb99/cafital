import { notFound } from 'next/navigation'
import { BuyerOnboardingForm } from './BuyerOnboardingForm'
import { SellerOnboardingForm } from './SellerOnboardingForm'

export function generateStaticParams() {
  return [{ role: 'buyer' }, { role: 'seller' }]
}

export default async function OnboardingRolePage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const { role } = await params

  if (role === 'buyer') return <BuyerOnboardingForm />
  if (role === 'seller') return <SellerOnboardingForm />
  notFound()
}
