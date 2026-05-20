import Link from 'next/link'
import { Fragment, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: ReactNode
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Migas de pan" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-neutral-500">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <Fragment key={idx}>
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-neutral-900 hover:underline underline-offset-2"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={isLast ? 'font-medium text-neutral-900' : ''}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden className="text-neutral-300">
                  <ChevronRight size={14} strokeWidth={1.5} />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
