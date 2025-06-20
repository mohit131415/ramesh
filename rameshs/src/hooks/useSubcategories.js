"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "../components/ui/use-toast.jsx"
import {
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  getSubcategoryBySlug,
  searchSubcategories,
  getSubcategoriesWithProductCount,
  getFeaturedSubcategories,
} from "../services/subcategory-service.js"

// Hook for fetching all subcategories (without category filter)
export const useSubcategories = (params = {}) => {
  const query = useQuery({
    queryKey: ["subcategories", "all", params],
    queryFn: async () => {
      try {
        console.log("useSubcategories called with params:", params)
        const response = await getSubcategories(params)
        return response
      } catch (error) {
        console.error("Error fetching subcategories:", error)
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading subcategories",
        description: "There was a problem loading the subcategories. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for fetching subcategories by category ID
export const useSubcategoriesByCategory = (categoryId, params = {}) => {
  const query = useQuery({
    queryKey: ["subcategories", "category", categoryId, params],
    queryFn: async () => {
      if (!categoryId) {
        throw new Error("Category ID is required")
      }

      try {
        console.log("useSubcategoriesByCategory called with categoryId:", categoryId, "params:", params)
        const response = await getSubcategoriesByCategory(categoryId, params)
        return response
      } catch (error) {
        console.error("Error fetching subcategories by category:", error)
        throw error
      }
    },
    enabled: !!categoryId, // Only run if categoryId exists
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading subcategories",
        description: "There was a problem loading the subcategories for this category. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for fetching a single subcategory by ID
export const useSubcategoryById = (subcategoryId) => {
  const query = useQuery({
    queryKey: ["subcategory", subcategoryId],
    queryFn: async () => {
      if (!subcategoryId) {
        throw new Error("Subcategory ID is required")
      }

      try {
        console.log("useSubcategoryById called with subcategoryId:", subcategoryId)
        const response = await getSubcategoryById(subcategoryId)
        return response
      } catch (error) {
        console.error("Error fetching subcategory:", error)
        throw error
      }
    },
    enabled: !!subcategoryId, // Only run if subcategoryId exists
    staleTime: 15 * 60 * 1000, // Consider data fresh for 15 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading subcategory",
        description: "There was a problem loading the subcategory details. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for fetching a subcategory by slug
export const useSubcategoryBySlug = (slug) => {
  const query = useQuery({
    queryKey: ["subcategory", "slug", slug],
    queryFn: async () => {
      if (!slug) {
        throw new Error("Subcategory slug is required")
      }

      try {
        console.log("useSubcategoryBySlug called with slug:", slug)
        const response = await getSubcategoryBySlug(slug)
        return response
      } catch (error) {
        console.error("Error fetching subcategory by slug:", error)
        throw error
      }
    },
    enabled: !!slug, // Only run if slug exists
    staleTime: 15 * 60 * 1000, // Consider data fresh for 15 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading subcategory",
        description: "There was a problem loading the subcategory. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for searching subcategories
export const useSearchSubcategories = (searchQuery, params = {}) => {
  const query = useQuery({
    queryKey: ["subcategories", "search", searchQuery, params],
    queryFn: async () => {
      if (!searchQuery || typeof searchQuery !== "string" || searchQuery.trim().length === 0) {
        return { data: [], total: 0 }
      }

      try {
        console.log("useSearchSubcategories called with searchQuery:", searchQuery, "params:", params)
        const response = await searchSubcategories(searchQuery.trim(), params)
        return response
      } catch (error) {
        console.error("Error searching subcategories:", error)
        throw error
      }
    },
    enabled: !!searchQuery && typeof searchQuery === "string" && searchQuery.trim().length > 0,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error searching subcategories",
        description: "There was a problem searching subcategories. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for fetching subcategories with product count
export const useSubcategoriesWithProductCount = (categoryId = null, params = {}) => {
  const query = useQuery({
    queryKey: ["subcategories", "with-product-count", categoryId, params],
    queryFn: async () => {
      try {
        console.log("useSubcategoriesWithProductCount called with categoryId:", categoryId, "params:", params)
        const response = await getSubcategoriesWithProductCount(categoryId, params)
        return response
      } catch (error) {
        console.error("Error fetching subcategories with product count:", error)
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading subcategories",
        description: "There was a problem loading subcategories with product counts. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for fetching featured subcategories
export const useFeaturedSubcategories = (params = {}) => {
  const query = useQuery({
    queryKey: ["subcategories", "featured", params],
    queryFn: async () => {
      try {
        console.log("useFeaturedSubcategories called with params:", params)
        const response = await getFeaturedSubcategories(params)
        return response
      } catch (error) {
        console.error("Error fetching featured subcategories:", error)
        throw error
      }
    },
    staleTime: 15 * 60 * 1000, // Consider data fresh for 15 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading featured subcategories",
        description: "There was a problem loading featured subcategories. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Legacy compatibility
const useSubcategoriesLegacy = useSubcategoriesByCategory

export default {
  useSubcategories,
  useSubcategoriesByCategory,
  useSubcategoryById,
  useSubcategoryBySlug,
  useSearchSubcategories,
  useSubcategoriesWithProductCount,
  useFeaturedSubcategories,
  useSubcategoriesLegacy,
}
