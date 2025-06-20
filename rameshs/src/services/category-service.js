// Category Service
// Uses Vite proxy configuration for API calls

import { BASE_URL } from "./api-client"

const API_BASE_URL = `${BASE_URL}/api/api/public`

// Create a request cache to prevent duplicate requests
const categoryCache = new Map()

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`)
  }
  return await response.json()
}

// ==================== CATEGORY SERVICES ====================

/**
 * Get all categories
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of items per page
 * @param {string} params.search - Search query
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Categories data
 */
export const getCategories = async (params = {}, forceRefresh = false) => {
  try {
    const queryParams = new URLSearchParams()

    // Add pagination and search params if provided
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search) queryParams.append("search", params.search)

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/categories${queryString ? `?${queryString}` : ""}`

    // Check cache first
    const cacheKey = url
    if (!forceRefresh && categoryCache.has(cacheKey)) {
      return categoryCache.get(cacheKey)
    }

    console.log(`Fetching categories from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    categoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw error
  }
}

/**
 * Get a single category by ID
 * @param {number|string} categoryId - Category ID
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Category data
 */
export const getCategoryById = async (categoryId, forceRefresh = false) => {
  try {
    if (!categoryId) {
      throw new Error("Category ID is required")
    }

    const url = `${API_BASE_URL}/categories/${categoryId}`
    const cacheKey = url

    if (!forceRefresh && categoryCache.has(cacheKey)) {
      return categoryCache.get(cacheKey)
    }

    console.log(`Fetching category by ID from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    categoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error)
    throw error
  }
}

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Category data
 */
export const getCategoryBySlug = async (slug, forceRefresh = false) => {
  try {
    if (!slug) {
      throw new Error("Category slug is required")
    }

    const url = `${API_BASE_URL}/categories/slug/${slug}`
    const cacheKey = url

    if (!forceRefresh && categoryCache.has(cacheKey)) {
      return categoryCache.get(cacheKey)
    }

    console.log(`Fetching category by slug from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    categoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error)
    throw error
  }
}

/**
 * Search categories
 * @param {string} query - Search query
 * @param {Object} params - Additional query parameters
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Search results
 */
export const searchCategories = async (query, params = {}, forceRefresh = false) => {
  try {
    if (!query) {
      throw new Error("Search query is required")
    }

    const queryParams = new URLSearchParams()
    queryParams.append("search", query)

    // Add additional params if provided
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)

    const url = `${API_BASE_URL}/categories/search?${queryParams.toString()}`
    const cacheKey = url

    if (!forceRefresh && categoryCache.has(cacheKey)) {
      return categoryCache.get(cacheKey)
    }

    console.log(`Searching categories from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    categoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error(`Error searching categories with query ${query}:`, error)
    throw error
  }
}

/**
 * Get categories with subcategory count
 * @param {Object} params - Query parameters
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Categories with subcategory counts
 */
export const getCategoriesWithSubcategoryCount = async (params = {}, forceRefresh = false) => {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("include_subcategory_count", "true")

    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search) queryParams.append("search", params.search)

    const url = `${API_BASE_URL}/categories?${queryParams.toString()}`
    const cacheKey = url

    if (!forceRefresh && categoryCache.has(cacheKey)) {
      return categoryCache.get(cacheKey)
    }

    console.log(`Fetching categories with subcategory count from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    categoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error("Error fetching categories with subcategory count:", error)
    throw error
  }
}

/**
 * Get featured categories
 * @param {Object} params - Query parameters
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Featured categories
 */
export const getFeaturedCategories = async (params = {}, forceRefresh = false) => {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("featured", "true")

    if (params.limit) queryParams.append("limit", params.limit)

    const url = `${API_BASE_URL}/categories?${queryParams.toString()}`
    const cacheKey = url

    if (!forceRefresh && categoryCache.has(cacheKey)) {
      return categoryCache.get(cacheKey)
    }

    console.log(`Fetching featured categories from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    categoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error("Error fetching featured categories:", error)
    throw error
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Clear category cache
 * @param {string} cacheKey - Specific cache key to clear (optional)
 */
export const clearCategoryCache = (cacheKey = null) => {
  if (cacheKey) {
    categoryCache.delete(cacheKey)
  } else {
    categoryCache.clear()
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCategoryCacheStats = () => {
  return {
    size: categoryCache.size,
    keys: Array.from(categoryCache.keys()),
  }
}

/**
 * Preload category data
 * @param {number|string} categoryId - Category ID
 * @returns {Promise<Object>} Preloaded category data
 */
export const preloadCategory = async (categoryId) => {
  try {
    return await getCategoryById(categoryId, false)
  } catch (error) {
    console.error(`Error preloading category ${categoryId}:`, error)
    return null
  }
}

// ==================== LEGACY COMPATIBILITY ====================

// Export legacy function names for backward compatibility
export const fetchCategories = getCategories

// Default export with all functions
export default {
  // Main category functions
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  searchCategories,
  getCategoriesWithSubcategoryCount,
  getFeaturedCategories,

  // Utility functions
  clearCategoryCache,
  getCategoryCacheStats,
  preloadCategory,

  // Legacy compatibility
  fetchCategories,
}
