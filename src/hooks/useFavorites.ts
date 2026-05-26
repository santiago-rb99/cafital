'use client'

import { Favorites } from '@/types'
import { useLocalStorageState } from './useLocalStorageState'

const FAVORITES_KEY = 'cafital_favorites'

const empty: Favorites = { publications: [], sellers: [] }

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorageState<Favorites>(
    FAVORITES_KEY,
    empty
  )

  function togglePublication(id: string) {
    setFavorites((prev) =>
      prev.publications.includes(id)
        ? { ...prev, publications: prev.publications.filter((p) => p !== id) }
        : { ...prev, publications: [...prev.publications, id] }
    )
  }

  function toggleSeller(id: string) {
    setFavorites((prev) =>
      prev.sellers.includes(id)
        ? { ...prev, sellers: prev.sellers.filter((s) => s !== id) }
        : { ...prev, sellers: [...prev.sellers, id] }
    )
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
