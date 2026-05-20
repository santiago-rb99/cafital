'use client'

import { useEffect, useState } from 'react'
import { Favorites } from '@/types'

const FAVORITES_KEY = 'cafital_favorites'

const empty: Favorites = { publications: [], sellers: [] }

function load(): Favorites {
  if (typeof window === 'undefined') return empty
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : empty
  } catch {
    return empty
  }
}

function save(f: Favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(f))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>(empty)

  useEffect(() => {
    setFavorites(load())
  }, [])

  function togglePublication(id: string) {
    setFavorites((prev) => {
      const next = prev.publications.includes(id)
        ? { ...prev, publications: prev.publications.filter((p) => p !== id) }
        : { ...prev, publications: [...prev.publications, id] }
      save(next)
      return next
    })
  }

  function toggleSeller(id: string) {
    setFavorites((prev) => {
      const next = prev.sellers.includes(id)
        ? { ...prev, sellers: prev.sellers.filter((s) => s !== id) }
        : { ...prev, sellers: [...prev.sellers, id] }
      save(next)
      return next
    })
  }

  return {
    favoritePublications: favorites.publications,
    favoriteSellers: favorites.sellers,
    togglePublication,
    toggleSeller,
    isPublicationFavorite: (id: string) => favorites.publications.includes(id),
    isSellerFavorite: (id: string) => favorites.sellers.includes(id),
  }
}
