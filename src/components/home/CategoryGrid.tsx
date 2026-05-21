import Link from 'next/link'
import { ArrowRight, Coffee, GraduationCap, MapPinned, Wrench } from 'lucide-react'
import { PublicationCategory } from '@/types'
import { cn } from '@/lib/utils'

interface CategoryDef {
  id: PublicationCategory
  name: string
  description: string
  Icon: typeof Coffee
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'A',
    name: 'Café e insumos',
    description: 'Verde, pergamino, tostado, molido, plantas, fertilizantes, empaques.',
    Icon: Coffee,
  },
  {
    id: 'B',
    name: 'Maquinaria y equipo',
    description: 'Tostadoras, molinos, equipos de finca, barismo y laboratorio.',
    Icon: Wrench,
  },
  {
    id: 'C',
    name: 'Servicios profesionales',
    description: 'Consultoría agronómica, formación en barismo, tostado, catación.',
    Icon: GraduationCap,
  },
  {
    id: 'D',
    name: 'Terrenos y fincas',
    description: 'Fincas en producción, lotes agrícolas y terrenos aptos para café.',
    Icon: MapPinned,
  },
]

export function CategoryGrid({ className }: { className?: string }) {
  return (
    <ul
      role="list"
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {CATEGORIES.map(({ id, name, description, Icon }) => (
        <li key={id}>
          <Link
            href={`/catalogo?category=${id}`}
            className="group flex h-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-3 focus-visible:ring-primary-100"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-500">
              <Icon size={22} strokeWidth={1.5} aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-neutral-900 group-hover:text-primary-700">
                {name}
              </h3>
              <p className="text-xs leading-relaxed text-neutral-500">
                {description}
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-medium text-primary-500 group-hover:text-primary-700">
              Ver categoría
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
