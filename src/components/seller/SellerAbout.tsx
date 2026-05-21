import { Compass, History, Target } from 'lucide-react'
import { Seller } from '@/types'

interface SellerAboutProps {
  about: NonNullable<Seller['about']>
}

const BLOCKS: Array<{
  key: keyof NonNullable<Seller['about']>
  title: string
  Icon: typeof Target
}> = [
  { key: 'mission', title: 'Misión', Icon: Target },
  { key: 'vision', title: 'Visión', Icon: Compass },
  { key: 'history', title: 'Historia', Icon: History },
]

export function SellerAbout({ about }: SellerAboutProps) {
  const filled = BLOCKS.filter((b) => about[b.key]?.trim())
  if (filled.length === 0) return null

  return (
    <section
      aria-labelledby="seller-about-heading"
      className="flex flex-col gap-5"
    >
      <h2
        id="seller-about-heading"
        className="font-serif text-2xl font-semibold text-neutral-900"
      >
        Sobre nosotros
      </h2>

      <ul role="list" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {filled.map(({ key, title, Icon }) => (
          <li
            key={key}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
              <Icon size={20} strokeWidth={1.5} aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
            <p className="text-sm leading-relaxed text-neutral-500">
              {about[key]}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
