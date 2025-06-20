import { create } from "zustand"
import { persist } from "zustand/middleware"

// Create a favorites store
const useFavoritesStore = create(
  persist(
    (set, get) => ({
      // Favorites state
      favorites: [],

      // Add a product to favorites
      addFavorite: (product) => {
        const { favorites } = get()

        // Check if product already exists in favorites
        if (favorites.some((item) => item.id === product.id)) {
          return
        }

        set({
          favorites: [...favorites, product],
        })
      },

      // Remove a product from favorites
      removeFavorite: (productId) => {
        const { favorites } = get()
        set({
          favorites: favorites.filter((item) => item.id !== productId),
        })
      },

      // Check if a product is in favorites
      isFavorite: (productId) => {
        const { favorites } = get()
        return favorites.some((item) => item.id === productId)
      },

      // Toggle a product in favorites
      toggleFavorite: (product) => {
        const { favorites, isFavorite, addFavorite, removeFavorite } = get()

        if (isFavorite(product.id)) {
          removeFavorite(product.id)
        } else {
          addFavorite(product)
        }
      },
    }),
    {
      name: "favorites-store",
    },
  ),
)

export default useFavoritesStore
