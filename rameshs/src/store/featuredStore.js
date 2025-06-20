import { create } from "zustand"

// Store for featured items
const useFeaturedStore = create((set) => ({
  // Featured products state
  featuredProducts: [],
  featuredProductsLoading: false,
  featuredProductsError: null,

  // Featured categories state
  featuredCategories: [],
  featuredCategoriesLoading: false,
  featuredCategoriesError: null,

  // Quick picks state
  quickPicks: [],
  quickPicksLoading: false,
  quickPicksError: null,

  // Set featured products
  setFeaturedProducts: (products) => set({ featuredProducts: products }),
  setFeaturedProductsLoading: (loading) => set({ featuredProductsLoading: loading }),
  setFeaturedProductsError: (error) => set({ featuredProductsError: error }),

  // Set featured categories
  setFeaturedCategories: (categories) => set({ featuredCategories: categories }),
  setFeaturedCategoriesLoading: (loading) => set({ featuredCategoriesLoading: loading }),
  setFeaturedCategoriesError: (error) => set({ featuredCategoriesError: error }),

  // Set quick picks
  setQuickPicks: (quickPicks) => set({ quickPicks: quickPicks }),
  setQuickPicksLoading: (loading) => set({ quickPicksLoading: loading }),
  setQuickPicksError: (error) => set({ quickPicksError: error }),

  // Reset all state
  resetState: () =>
    set({
      featuredProducts: [],
      featuredProductsLoading: false,
      featuredProductsError: null,
      featuredCategories: [],
      featuredCategoriesLoading: false,
      featuredCategoriesError: null,
      quickPicks: [],
      quickPicksLoading: false,
      quickPicksError: null,
    }),
}))

export default useFeaturedStore
