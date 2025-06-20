import { create } from "zustand"

const useCategoryStore = create((set) => ({
  // Categories data
  categories: [],
  selectedCategory: null,
  currentPage: 1,
  searchQuery: "",
  metadata: {
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1,
  },

  // Subcategories data
  subcategories: [],
  selectedSubcategory: null,
  subcategoriesLoading: false,
  subcategoriesError: null,

  // Actions for categories
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }), // Reset to page 1 when searching
  setMetadata: (metadata) => set({ metadata }),

  // Actions for subcategories
  setSubcategories: (subcategories) => set({ subcategories }),
  setSelectedSubcategory: (subcategoryId) => set({ selectedSubcategory: subcategoryId }),
  setSubcategoriesLoading: (loading) => set({ subcategoriesLoading: loading }),
  setSubcategoriesError: (error) => set({ subcategoriesError: error }),

  // Reset all filters
  resetFilters: () =>
    set({
      selectedCategory: null,
      selectedSubcategory: null,
      currentPage: 1,
      searchQuery: "",
    }),
}))

export default useCategoryStore
