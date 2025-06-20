import { create } from "zustand"
import { persist } from "zustand/middleware"

const useProductStore = create(
  persist(
    (set, get) => ({
      // Products state
      products: [],
      productsBySubcategory: {}, // Store products by subcategory ID
      isLoading: false,
      error: null,

      // Search and filter state
      searchQuery: "",
      selectedCategory: null,
      selectedSubcategories: [],
      currentPage: 1,
      itemsPerPage: 12,
      totalPages: 1,
      totalItems: 0,

      // Sorting state
      sortBy: null, // Initially null, meaning no sorting is applied
      sortOptions: [], // Will be populated from API response

      // Price range filter - updated with correct values from API
      priceRange: { min: 129, max: 2500 },
      minDiscount: 0,

      // Categories and subcategories
      categories: [],
      subcategories: [],

      // Show more toggles
      showAllCategories: false,
      showAllSubcategories: false,

      // Add a new state property to track the overall price range - updated with correct values from API
      overallPriceRange: { min: 129, max: 1900 },

      // Actions
      setProducts: (products) => set({ products }),
      setProductsBySubcategory: (subcategoryId, products) =>
        set((state) => ({
          productsBySubcategory: {
            ...state.productsBySubcategory,
            [subcategoryId]: products,
          },
        })),
      clearProductsBySubcategory: (subcategoryId) =>
        set((state) => {
          const newProductsBySubcategory = { ...state.productsBySubcategory }
          delete newProductsBySubcategory[subcategoryId]
          return { productsBySubcategory: newProductsBySubcategory }
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Sorting actions
      setSortBy: (sortBy) => set({ sortBy, currentPage: 1 }), // Reset to page 1 when sort changes
      setSortOptions: (sortOptions) => set({ sortOptions }),

      // Pagination actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (limit) => set({ itemsPerPage: limit, currentPage: 1 }),
      setTotalPages: (pages) => set({ totalPages: pages }),
      setTotalItems: (total) => set({ totalItems: total }),

      // Filter actions
      setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

      // Modified to not clear subcategories when setting a category
      setSelectedCategory: (categoryId) =>
        set((state) => {
          // If setting to null, clear subcategories
          if (categoryId === null) {
            return {
              selectedCategory: null,
              selectedSubcategories: [],
              productsBySubcategory: {}, // Clear products when category changes
              currentPage: 1,
            }
          }

          // Otherwise, just set the category without clearing subcategories
          return {
            selectedCategory: categoryId,
            currentPage: 1,
          }
        }),

      setSelectedSubcategories: (subcategories) => set({ selectedSubcategories: subcategories, currentPage: 1 }),
      addSubcategory: (subcategoryId) =>
        set((state) => ({
          selectedSubcategories: [...state.selectedSubcategories, subcategoryId],
          currentPage: 1,
        })),
      removeSubcategory: (subcategoryId) =>
        set((state) => {
          // Remove subcategory from selected list
          const newSelectedSubcategories = state.selectedSubcategories.filter((id) => id !== subcategoryId)

          // Also remove its products
          const newProductsBySubcategory = { ...state.productsBySubcategory }
          delete newProductsBySubcategory[subcategoryId]

          return {
            selectedSubcategories: newSelectedSubcategories,
            productsBySubcategory: newProductsBySubcategory,
            currentPage: 1,
          }
        }),
      toggleSubcategory: (subcategoryId) =>
        set((state) => ({
          selectedSubcategories: state.selectedSubcategories.includes(subcategoryId)
            ? state.selectedSubcategories.filter((id) => id !== subcategoryId)
            : [...state.selectedSubcategories, subcategoryId],
        })),
      clearSelectedSubcategories: () => set({ selectedSubcategories: [] }), // Added clearSelectedSubcategories action
      setPriceRange: (range) => set({ priceRange: range, currentPage: 1 }),
      setMinDiscount: (discount) => set({ minDiscount: discount, currentPage: 1 }),

      // Categories and subcategories actions
      setCategories: (categories) => set({ categories }),
      setSubcategories: (subcategories) => set({ subcategories }),

      // Toggle show more actions
      toggleShowAllCategories: () => set((state) => ({ showAllCategories: !state.showAllCategories })),
      toggleShowAllSubcategories: () => set((state) => ({ showAllSubcategories: !state.showAllSubcategories })),

      // Add a setter for the overall price range
      setOverallPriceRange: (range) => set({ overallPriceRange: range }),

      // Update the resetFilters function to use the correct price range values
      resetFilters: () =>
        set({
          searchQuery: "",
          selectedCategory: null,
          selectedSubcategories: [],
          productsBySubcategory: {}, // Clear products by subcategory
          priceRange: { min: 129, max: 1900 }, // Updated with correct values from API
          minDiscount: 0,
          currentPage: 1,
          sortBy: "popular",
          showAllCategories: false,
          showAllSubcategories: false,
        }),

      // Get all products from all selected subcategories
      getAllProducts: () => {
        const state = get()
        let allProducts = []

        // If no subcategories are selected, return the main products array
        if (state.selectedSubcategories.length === 0) {
          return state.products
        }

        // Otherwise, combine products from all selected subcategories
        state.selectedSubcategories.forEach((subcategoryId) => {
          if (state.productsBySubcategory[subcategoryId]) {
            allProducts = [...allProducts, ...state.productsBySubcategory[subcategoryId]]
          }
        })

        return allProducts
      },

      // Add product to recently viewed
      addToRecentlyViewed: (product) =>
        set((state) => {
          // Remove product if it already exists in the list
          const filtered = state.recentlyViewed.filter((p) => p.id !== product.id)

          // Add product to the beginning of the list and limit to 10 items
          return {
            recentlyViewed: [product, ...filtered].slice(0, 10),
          }
        }),

      // Initialize recently viewed from localStorage
      initRecentlyViewed: () => {
        try {
          const stored = localStorage.getItem("recentlyViewed")
          if (stored) {
            const parsed = JSON.parse(stored)
            set({ recentlyViewed: parsed })
          }
        } catch (error) {
          console.error("Failed to load recently viewed products from localStorage:", error)
        }
      },

      // Recently viewed products
      recentlyViewed: [],
    }),
    {
      name: "product-store",
      partialize: (state) => ({
        recentlyViewed: state.recentlyViewed,
        sortBy: state.sortBy,
      }),
    },
  ),
)

// Add a new action to fetch the overall price range
export const fetchOverallPriceRange = async () => {
  try {
    const response = await fetch("/api/public/filters/products/price-range")
    if (!response.ok) {
      throw new Error("Failed to fetch overall price range")
    }
    const data = await response.json()
    if (data.status === "success" && data.data.overall_price_range) {
      return data.data.overall_price_range
    }
    return { min_price: 129, max_price: 1900 } // Updated default fallback with correct values from API
  } catch (error) {
    console.error("Error fetching overall price range:", error)
    return { min_price: 129, max_price: 1900 } // Updated default fallback with correct values from API
  }
}

// Add a helper function to build API query parameters for the comprehensive API
export const buildApiQueryParams = (state) => {
  const params = new URLSearchParams()

  // Add category filter if selected
  if (state.selectedCategory) {
    params.append("category_id", state.selectedCategory)
  }

  // Add subcategory filters if selected (as array format)
  if (state.selectedSubcategories && state.selectedSubcategories.length > 0) {
    state.selectedSubcategories.forEach((subcategoryId) => {
      params.append("subcategory_ids[]", subcategoryId)
    })
  }

  // Add price range filters
  if (state.priceRange) {
    params.append("min_price", state.priceRange.min)
    params.append("max_price", state.priceRange.max)
  }

  // Add sort parameter
  if (state.sortBy) {
    params.append("sort_by", state.sortBy)
  }

  // Add pagination parameters
  params.append("page", state.currentPage)
  params.append("limit", state.itemsPerPage)

  // Add discount filter if applicable
  if (state.minDiscount > 0) {
    params.append("min_discount", state.minDiscount)
  }

  // Add search query if present
  if (state.searchQuery) {
    params.append("search", state.searchQuery)
  }

  return params.toString()
}

export default useProductStore
