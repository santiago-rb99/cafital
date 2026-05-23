'use client'

import { Store } from 'lucide-react'
import { CartItem } from '@/types'
import { CartItemRow } from './CartItemRow'

interface CartItemsBySellerProps {
  items: CartItem[]
  variant?: 'compact' | 'full'
}

function groupBySeller(items: CartItem[]): Array<{
  sellerId: string
  sellerName: string
  items: CartItem[]
}> {
  const map = new Map<string, { sellerId: string; sellerName: string; items: CartItem[] }>()
  for (const item of items) {
    const entry = map.get(item.sellerId)
    if (entry) {
      entry.items.push(item)
    } else {
      map.set(item.sellerId, {
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        items: [item],
      })
    }
  }
  return [...map.values()]
}

export function CartItemsBySeller({
  items,
  variant = 'full',
}: CartItemsBySellerProps) {
  const groups = groupBySeller(items)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section
          key={group.sellerId}
          aria-label={`Items de ${group.sellerName}`}
          className="flex flex-col gap-3"
        >
          <header className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <Store size={14} strokeWidth={1.5} aria-hidden />
            Pedido a{' '}
            <span className="font-semibold text-neutral-900">
              {group.sellerName}
            </span>
            <span className="ml-1 text-neutral-300" aria-hidden>
              ·
            </span>
            <span>
              {group.items.length === 1
                ? '1 producto'
                : `${group.items.length} productos`}
            </span>
          </header>

          <ul role="list" className="flex flex-col gap-2.5">
            {group.items.map((item) => (
              <li key={`${item.publicationId}::${item.unit}`}>
                <CartItemRow item={item} variant={variant} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
