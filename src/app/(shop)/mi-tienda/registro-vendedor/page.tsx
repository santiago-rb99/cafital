import { SellerOnboardingForm } from '@/app/(auth)/onboarding/[role]/SellerOnboardingForm'

export default function RegistroVendedorPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <SellerOnboardingForm mode="upgrade" />
    </div>
  )
}
