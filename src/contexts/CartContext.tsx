'use client'

import { createContext, useContext, ReactNode } from 'react'
import { CartItem } from '@/types'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'

const CART_KEY = 'cafital_cart'
const SAVED_KEY = 'cafital_cart_saved'

interface CartContextType {
  items: CartItem[]
  savedItems: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (publicationId: string, unit: string) => void
  updateQuantity: (publicationId: string, unit: string, quantity: number) => void
  /** Mueve un ítem del carrito activo a "guardados para más tarde". */
  saveForLater: (publicationId: string, unit: string) => void
  /** Devuelve un ítem guardado al carrito activo. */
  restoreFromSaved: (publicationId: string, unit: string) => void
  /** Elimina un ítem guardado sin pasar por el carrito. */
  removeSavedItem: (publicationId: string, unit: string) => void
  clearCart: () => void
  total: number
  itemCount: number
  savedCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const EMPTY_ITEMS: CartItem[] = []

function itemKey(publicationId: string, unit: string) {
  return `${publicationId}::${unit}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorageState<CartItem[]>(CART_KEY, EMPTY_ITEMS)
  const [savedItems, setSavedItems] = useLocalStorageState<CartItem[]>(
    SAVED_KEY,
    EMPTY_ITEMS
  )

  function addItem(item: CartItem) {
    setItems((prev) => {
      const key = itemKey(item.publicationId, item.unit)
      const existing = prev.find((i) => itemKey(i.publicationId, i.unit) === key)
      return existing
        ? prev.map((i) =>
            itemKey(i.publicationId, i.unit) === key
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        : [...prev, item]
    })
  }

  function removeItem(publicationId: string, unit: string) {
    const key = itemKey(publicationId, unit)
    setItems((prev) => prev.filter((i) => itemKey(i.publicationId, i.unit) !== key))
  }

  function updateQuantity(publicationId: string, unit: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(publicationId, unit)
      return
    }
    const key = itemKey(publicationId, unit)
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.publicationId, i.unit) === key ? { ...i, quantity } : i
      )
    )
  }

  function saveForLater(publicationId: string, unit: string) {
    const key = itemKey(publicationId, unit)
    const target = items.find((i) => itemKey(i.publicationId, i.unit) === key)
    if (!target) return
    setItems((prev) => prev.filter((i) => itemKey(i.publicationId, i.unit) !== key))
    setSavedItems((prev) => {
      // Si ya existe el mismo ítem en guardados, lo dejamos como está (no duplicar).
      const existsInSaved = prev.some(
        (i) => itemKey(i.publicationId, i.unit) === key
      )
      return existsInSaved ? prev : [...prev, target]
    })
  }

  function restoreFromSaved(publicationId: string, unit: string) {
    const key = itemKey(publicationId, unit)
    const target = savedItems.find((i) => itemKey(i.publicationId, i.unit) === key)
    if (!target) return
    setSavedItems((prev) =>
      prev.filter((i) => itemKey(i.publicationId, i.unit) !== key)
    )
    addItem(target)
  }

  function removeSavedItem(publicationId: string, unit: string) {
    const key = itemKey(publicationId, unit)
    setSavedItems((prev) =>
      prev.filter((i) => itemKey(i.publicationId, i.unit) !== key)
    )
  }

  function clearCart() {
    setItems(EMPTY_ITEMS)
  }

  // Solo el carrito ACTIVO suma al total y al itemCount (los guardados no).
  const total = items.reduce((sum, i) => {
    const price = i.discount ? i.unitPrice * (1 - i.discount / 100) : i.unitPrice
    return sum + price * i.quantity
  }, 0)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const savedCount = savedItems.length

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        addItem,
        removeItem,
        updateQuantity,
        saveForLater,
        restoreFromSaved,
        removeSavedItem,
        clearCart,
        total,
        itemCount,
        savedCount,
      }}
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
