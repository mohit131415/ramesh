"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getFeaturedProducts,
  getFeaturedCategories,
  getQuickPicks,
  getAllFeaturedItems,
} from "../services/featured-service"
import useFeaturedStore from "../store/featuredStore"
import { useEffect } from "react"

// Hook for fetching featured products
export const useFeaturedProducts = () => {
  const { setFeaturedProducts, setFeaturedProductsLoading, setFeaturedProductsError } = useFeaturedStore()

  const query = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: () => getFeaturedProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    setFeaturedProductsLoading(query.isLoading)

    if (query.data?.status === "success") {
      setFeaturedProducts(query.data.data)
    }

    if (query.error) {
      setFeaturedProductsError(query.error)
    }
  }, [
    query.data,
    query.isLoading,
    query.error,
    setFeaturedProducts,
    setFeaturedProductsLoading,
    setFeaturedProductsError,
  ])

  return query
}

// Hook for fetching featured categories
export const useFeaturedCategories = () => {
  const { setFeaturedCategories, setFeaturedCategoriesLoading, setFeaturedCategoriesError } = useFeaturedStore()

  const query = useQuery({
    queryKey: ["featuredCategories"],
    queryFn: () => getFeaturedCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    setFeaturedCategoriesLoading(query.isLoading)

    if (query.data?.status === "success") {
      setFeaturedCategories(query.data.data)
    }

    if (query.error) {
      setFeaturedCategoriesError(query.error)
    }
  }, [
    query.data,
    query.isLoading,
    query.error,
    setFeaturedCategories,
    setFeaturedCategoriesLoading,
    setFeaturedCategoriesError,
  ])

  return query
}

// Hook for fetching quick picks
export const useQuickPicks = () => {
  const { setQuickPicks, setQuickPicksLoading, setQuickPicksError } = useFeaturedStore()

  const query = useQuery({
    queryKey: ["quickPicks"],
    queryFn: () => getQuickPicks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    setQuickPicksLoading(query.isLoading)

    if (query.data?.status === "success") {
      setQuickPicks(query.data.data)
    }

    if (query.error) {
      setQuickPicksError(query.error)
    }
  }, [query.data, query.isLoading, query.error, setQuickPicks, setQuickPicksLoading, setQuickPicksError])

  return query
}

// Hook for fetching all featured items
export const useAllFeaturedItems = () => {
  const {
    setFeaturedProducts,
    setFeaturedCategories,
    setQuickPicks,
    setFeaturedProductsLoading,
    setFeaturedCategoriesLoading,
    setQuickPicksLoading,
    setFeaturedProductsError,
    setFeaturedCategoriesError,
    setQuickPicksError,
  } = useFeaturedStore()

  const query = useQuery({
    queryKey: ["allFeaturedItems"],
    queryFn: () => getAllFeaturedItems(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    const isLoading = query.isLoading
    setFeaturedProductsLoading(isLoading)
    setFeaturedCategoriesLoading(isLoading)
    setQuickPicksLoading(isLoading)

    if (query.data?.status === "success") {
      setFeaturedProducts(query.data.data.featured_products || [])
      setFeaturedCategories(query.data.data.featured_categories || [])
      setQuickPicks(query.data.data.quick_picks || [])
    }

    if (query.error) {
      const error = query.error
      setFeaturedProductsError(error)
      setFeaturedCategoriesError(error)
      setQuickPicksError(error)
    }
  }, [
    query.data,
    query.isLoading,
    query.error,
    setFeaturedProducts,
    setFeaturedCategories,
    setQuickPicks,
    setFeaturedProductsLoading,
    setFeaturedCategoriesLoading,
    setQuickPicksLoading,
    setFeaturedProductsError,
    setFeaturedCategoriesError,
    setQuickPicksError,
  ])

  return query
}
