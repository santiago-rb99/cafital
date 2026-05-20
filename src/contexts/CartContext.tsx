'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem } from '@/types'

const CART_KEY = 'cafital_cart'

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (publicationId: string, unit: string) => void
  updateQuantity: (publicationId: string, unit: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

function itemKey(publicationId: string, unit: string) {
  return `${publicationId}::${unit}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY)
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch { /* noop */ }
    }
  }, [])

  function persist(next: CartItem[]) {
    setItems(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }

  function addItem(item: CartItem) {
    setItems((prev) => {
      const key = itemKey(item.publicationId, item.unit)
      const existing = prev.find((i) => itemKey(i.publicationId, i.unit) === key)
      const next = existing
        ? prev.map((i) =>
            itemKey(i.publicationId, i.unit) === key
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        : [...prev, item]
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      return next
    })
  }

  function removeItem(publicationId: string, unit: string) {
    const key = itemKey(publicationId, unit)
    persist(items.filter((i) => itemKey(i.publicationId, i.unit) !== key))
  }

  function updateQuantity(publicationId: string, unit: string, quantity: number) {
    if (quantity <= 0) { removeItem(publicationId, unit); return }
    const key = itemKey(publicationId, unit)
    persist(items.map((i) =>
      itemKey(i.publicationId, i.unit) === key ? { ...i, quantity } : i
    ))
  }

  function clearCart() {
    persist([])
  }

  const total = items.reduce((sum, i) => {
    const price = i.discount ? i.unitPrice * (1 - i.discount / 100) : i.unitPrice
    return sum + price * i.quantity
  }, 0)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
