"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "../components/ui/use-toast.jsx"
import useProductStore from "../store/productStore.js"
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  searchCategories,
  getFeaturedCategories,
} from "../services/category-service.js"

// Hook for fetching all categories
export const useCategories = (params = {}) => {
  const { setCategories } = useProductStore()

  const query = useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      try {
        const data = await getCategories(params)
        return data
      } catch (error) {
        console.error("Error fetching categories:", error)
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    retry: 2,
  })

  // Update store with categories data
  useEffect(() => {
    if (query.data) {
      // Handle both response formats: direct array or nested in data property
      const categoriesData = Array.isArray(query.data) ? query.data : query.data.data ? query.data.data : []
      setCategories(categoriesData)
    }
  }, [query.data, setCategories])

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading categories",
        description: "There was a problem loading the categories. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for fetching a single category by ID
export const useCategoryById = (categoryId) => {
  const query = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      if (!categoryId) return { data: null }

      try {
        const data = await getCategoryById(categoryId)
        return data
      } catch (error) {
        console.error("Error fetching category by ID:", error)
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
        title: "Error loading category",
        description: "There was a problem loading the category details. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for fetching category by slug
export const useCategoryBySlug = (slug) => {
  const query = useQuery({
    queryKey: ["category", "slug", slug],
    queryFn: async () => {
      if (!slug) return { data: null }

      try {
        const data = await getCategoryBySlug(slug)
        return data
      } catch (error) {
        console.error("Error fetching category by slug:", error)
        throw error
      }
    },
    enabled: !!slug, // Only run if slug exists
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (query.error) {
      toast({
        title: "Error loading category",
        description: "There was a problem loading the category details. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}

// Hook for searching categories
export const useSearchCategories = (query, params = {}) => {
  const searchQuery = useQuery({
    queryKey: ["categories", "search", query, params],
    queryFn: async () => {
      if (!query) return { data: [] }

      try {
        const data = await searchCategories(query, params)
        return data
      } catch (error) {
        console.error("Error searching categories:", error)
        throw error
      }
    },
    enabled: !!query, // Only run if query exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  })

  // Show error toast if query fails
  useEffect(() => {
    if (searchQuery.error) {
      toast({
        title: "Error searching categories",
        description: "There was a problem searching categories. Please try again.",
        variant: "destructive",
      })
    }
  }, [searchQuery.error])

  return searchQuery
}

// Hook for fetching featured categories
export const useFeaturedCategories = (params = {}) => {
  const query = useQuery({
    queryKey: ["categories", "featured", params],
    queryFn: async () => {
      try {
        const data = await getFeaturedCategories(params)
        return data
      } catch (error) {
        console.error("Error fetching featured categories:", error)
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
        title: "Error loading featured categories",
        description: "There was a problem loading featured categories. Please try again.",
        variant: "destructive",
      })
    }
  }, [query.error])

  return query
}
