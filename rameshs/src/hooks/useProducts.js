"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import { toast } from "../components/ui/use-toast"
import useProductStore from "../store/productStore"
import { getComprehensiveProducts, clearProductCache } from "../services/product-service"

// Debug function for development purposes
const debugLog = () => {}

// Build API query parameters from the product store state
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

  // Add price range filters only if they have actual values
  if (state.priceRange && state.priceRange.min !== null && state.priceRange.max !== null) {
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

  // Add search query if present - use 'q' parameter for the comprehensive API
  if (state.searchQuery) {
    params.append("q", state.searchQuery)
  }

  return params.toString()
}

// Hook for fetching products with infinite scrolling
export const useInfiniteProducts = (enabled = true) => {
  const {
    searchQuery,
    itemsPerPage,
    selectedCategory,
    selectedSubcategories,
    minDiscount,
    sortBy,
    priceRange,
    setSortOptions,
    setTotalItems,
  } = useProductStore()

  // Ref to track previous query parameters
  const prevQueryRef = useRef({
    searchQuery: null,
    selectedCategory: null,
    selectedSubcategories: [],
    sortBy: null,
    priceRange: { min: 0, max: 0 },
  })

  // Ref to track if this is the initial query
  const isInitialQuery = useRef(true)

  // Create a stable query key that changes only when filters change
  const queryKey = useMemo(
    () => [
      "infiniteProducts",
      searchQuery,
      itemsPerPage,
      selectedCategory,
      selectedSubcategories,
      minDiscount,
      sortBy,
      priceRange.min,
      priceRange.max,
    ],
    [
      searchQuery,
      itemsPerPage,
      selectedCategory,
      selectedSubcategories,
      minDiscount,
      sortBy,
      priceRange.min,
      priceRange.max,
    ],
  )

  // Check if filters have changed significantly
  useEffect(() => {
    // Skip this check on the initial render
    if (isInitialQuery.current) {
      isInitialQuery.current = false
      return
    }

    const currentQuery = {
      searchQuery,
      selectedCategory,
      selectedSubcategories,
      sortBy,
      priceRange,
    }

    const hasSignificantChanges =
      currentQuery.searchQuery !== prevQueryRef.current.searchQuery ||
      currentQuery.selectedCategory !== prevQueryRef.current.selectedCategory ||
      JSON.stringify(currentQuery.selectedSubcategories) !==
        JSON.stringify(prevQueryRef.current.selectedSubcategories) ||
      currentQuery.sortBy !== prevQueryRef.current.sortBy ||
      currentQuery.priceRange.min !== prevQueryRef.current.priceRange.min ||
      currentQuery.priceRange.max !== prevQueryRef.current.priceRange.max

    if (hasSignificantChanges) {
      clearProductCache()
      prevQueryRef.current = { ...currentQuery }
    }
  }, [searchQuery, selectedCategory, selectedSubcategories, sortBy, priceRange])

  // Fetch products page function for infinite query
  const fetchProductsPage = async ({ pageParam = 1 }) => {
    try {
      // Prepare filter parameters - always use the comprehensive API
      const filterParams = {
        category_id: selectedCategory,
        subcategory_id: selectedSubcategories.length > 0 ? selectedSubcategories : null,
        sort: sortBy || "popular",
        page: pageParam,
        limit: itemsPerPage,
        skipCache: false, // Use cache if available
      }

      // Only include price range if both min and max are not null
      if (priceRange.min !== null && priceRange.max !== null) {
        filterParams.min_price = priceRange.min
        filterParams.max_price = priceRange.max
      }

      // Add search query using the 'q' parameter for the comprehensive API
      if (searchQuery) {
        filterParams.q = searchQuery
      }

      // Call the comprehensive API
      const response = await getComprehensiveProducts(filterParams)

      // Update sort options if available in the response
      if (response?.data?.filters?.sort_options) {
        setSortOptions(response.data.filters.sort_options)
      }

      // Extract products and pagination info based on response structure
      let products = []
      let totalPages = 1
      let totalItems = 0

      // Handle search response structure
      if (response?.data?.products && Array.isArray(response.data.products)) {
        products = response.data.products
        totalPages = response.data.pagination?.last_page || 1
        totalItems = response.data.pagination?.total || products.length
      }
      // Handle comprehensive API response structure
      else if (response?.data?.products?.items) {
        products = response.data.products.items
        totalPages = response.data.products.total_pages || 1
        totalItems = response.data.products.total || products.length
      }

      // Update store with total items
      setTotalItems(totalItems)

      // Apply client-side filtering for discount if needed
      if (minDiscount > 0 && Array.isArray(products)) {
        products = products.filter((product) => {
          // Check if any variant has the minimum discount
          return (
            product.variants &&
            product.variants.some((v) => Number.parseFloat(v.discount_percentage || 0) >= minDiscount)
          )
        })
      }

      // Return the data in the format expected by useInfiniteQuery
      return {
        products,
        nextPage: pageParam + 1,
        totalPages,
        isLastPage: pageParam >= totalPages,
      }
    } catch (error) {
      console.error("Error fetching products:", error)

      // Show toast but don't break the UI
      toast({
        title: "Error Loading Products",
        description: "There was a problem loading the products. Please try again.",
        variant: "error",
      })

      // Return empty results to maintain UI stability
      return {
        products: [],
        nextPage: 1,
        totalPages: 1,
        isLastPage: true,
      }
    }
  }

  // Use TanStack Query's useInfiniteQuery to fetch and cache data
  const query = useInfiniteQuery({
    queryKey,
    queryFn: fetchProductsPage,
    getNextPageParam: (lastPage) => {
      // Return undefined if we've reached the last page
      return lastPage.isLastPage ? undefined : lastPage.nextPage
    },
    keepPreviousData: true,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry failed requests twice
    enabled: enabled, // Only run this query when enabled is true
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading products",
        description: "There was a problem loading the products. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Original hooks for backward compatibility
export const useProducts = (enabled = true) => {
  const {
    searchQuery,
    currentPage,
    itemsPerPage,
    selectedCategory,
    selectedSubcategories,
    minDiscount,
    sortBy,
    priceRange,
    setSortOptions,
    setTotalPages,
    setTotalItems,
  } = useProductStore()

  // Create a stable query key
  const queryKey = useMemo(
    () => [
      "products",
      searchQuery,
      currentPage,
      itemsPerPage,
      selectedCategory,
      selectedSubcategories,
      minDiscount,
      sortBy,
      priceRange.min,
      priceRange.max,
    ],
    [
      searchQuery,
      currentPage,
      itemsPerPage,
      selectedCategory,
      selectedSubcategories,
      minDiscount,
      sortBy,
      priceRange.min,
      priceRange.max,
    ],
  )

  // Fetch products using the comprehensive API
  const fetchProducts = async () => {
    try {
      // Prepare filter parameters
      const filterParams = {
        category_id: selectedCategory,
        subcategory_id: selectedSubcategories.length > 0 ? selectedSubcategories : null,
        min_price: priceRange.min > 0 ? priceRange.min : null,
        max_price: priceRange.max < 10000 ? priceRange.max : null,
        sort: sortBy || "popular",
        page: currentPage,
        limit: itemsPerPage,
        skipCache: false, // Use cache if available
      }

      // Add search query using the 'q' parameter for the comprehensive API
      if (searchQuery) {
        filterParams.q = searchQuery
      }

      // Call the comprehensive API
      const response = await getComprehensiveProducts(filterParams)

      // Update sort options if available in the response
      if (response?.data?.filters?.sort_options) {
        setSortOptions(response.data.filters.sort_options)
      }

      // Update store with pagination data based on response structure
      if (response?.data?.products?.total_pages) {
        // Comprehensive API structure
        setTotalPages(response.data.products.total_pages || 1)
        setTotalItems(response.data.products.total || 0)
      } else if (response?.data?.pagination) {
        // Search API structure
        setTotalPages(response.data.pagination.last_page || 1)
        setTotalItems(response.data.pagination.total || 0)
      }

      // Apply client-side filtering for discount if needed
      // Extract products based on response structure
      if (response?.data?.products?.items) {
        // Comprehensive API structure
        let products = response.data.products.items

        // Apply discount filter
        if (minDiscount > 0) {
          products = products.filter((product) => {
            // Check if any variant has the minimum discount
            return product.variants.some((v) => Number.parseFloat(v.discount_percentage || 0) >= minDiscount)
          })
        }

        // Update the response with filtered products
        response.data.products.items = products
      } else if (response?.data?.products && Array.isArray(response.data.products)) {
        // Search API structure
        let products = response.data.products

        // Apply discount filter
        if (minDiscount > 0) {
          products = products.filter((product) => {
            // Check if any variant has the minimum discount
            return product.variants.some((v) => Number.parseFloat(v.discount_percentage || 0) >= minDiscount)
          })
        }

        // Update the response with filtered products
        response.data.products = products
      }

      return response
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  }

  // Use TanStack Query to fetch and cache data
  const query = useQuery({
    queryKey,
    queryFn: fetchProducts,
    keepPreviousData: true, // Keep old data while fetching new data
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry failed requests twice
    enabled: enabled, // Only run this query when enabled is true
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading products",
        description: "There was a problem loading the products. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for fetching products by subcategory
export const useProductsBySubcategory = (subcategoryId, enabled = true) => {
  const { currentPage, itemsPerPage, setProductsBySubcategory, setTotalItems, setTotalPages } = useProductStore()

  // Create a query key that includes the subcategory ID
  const queryKey = useMemo(
    () => ["products", "subcategory", subcategoryId, currentPage, itemsPerPage],
    [subcategoryId, currentPage, itemsPerPage],
  )

  // Use TanStack Query to fetch and cache data
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Use the comprehensive API for subcategory filtering
        const response = await getComprehensiveProducts({
          subcategory_id: subcategoryId,
          page: currentPage,
          limit: itemsPerPage,
        })

        // Extract products from response based on structure
        let products = []

        if (response.data?.products?.items) {
          products = response.data.products.items
        } else if (response.data?.products && Array.isArray(response.data.products)) {
          products = response.data.products
        }

        // Store the products for this subcategory
        setProductsBySubcategory(subcategoryId, products)

        // Update pagination info based on response structure
        if (response?.data?.products?.total_pages) {
          setTotalPages(response.data.products.total_pages || 1)
          setTotalItems(response.data.products.total || products.length)
        } else if (response?.data?.pagination) {
          setTotalPages(response.data.pagination.last_page || 1)
          setTotalItems(response.data.pagination.total || products.length)
        }

        return response
      } catch (error) {
        console.error(`Error fetching products for subcategory ${subcategoryId}:`, error)
        throw error
      }
    },
    keepPreviousData: true,
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
    enabled: enabled && !!subcategoryId,
    refetchOnWindowFocus: false,
  })

  return query
}

// Other hooks remain the same...
export const useProduct = (productId) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await fetch(`/api/api/public/products/${productId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product")
      }
      return response.json()
    },
    enabled: !!productId, // Only run if productId exists
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
  })
}

export const useProductBySlug = (slug) => {
  return useQuery({
    queryKey: ["product", "slug", slug],
    queryFn: async () => {
      const response = await fetch(`/api/api/public/products/slug/${slug}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product by slug")
      }
      return response.json()
    },
    enabled: !!slug, // Only run if slug exists
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
  })
}
