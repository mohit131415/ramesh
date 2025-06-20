// Subcategory Service
// Uses Vite proxy configuration for API calls

import { BASE_URL } from "./api-client"

const API_BASE_URL = `${BASE_URL}/api/api/public`

// Create a request cache to prevent duplicate requests
const subcategoryCache = new Map()

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`)
  }
  return await response.json()
}

// ==================== SUBCATEGORY SERVICES ====================

/**
 * Get all subcategories
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of items per page
 * @param {string} params.search - Search query
 * @param {number|string} params.category_id - Category ID to filter by
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Subcategories data
 */
export const getSubcategories = async (params = {}, forceRefresh = false) => {
  try {
    const queryParams = new URLSearchParams()

    // Add pagination and search params if provided
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search && typeof params.search === "string") queryParams.append("search", params.search)
    // Add category_id if provided
    if (params.category_id) queryParams.append("category_id", params.category_id)

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/subcategories${queryString ? `?${queryString}` : ""}`

    // Check cache first
    const cacheKey = url
    if (!forceRefresh && subcategoryCache.has(cacheKey)) {
      return subcategoryCache.get(cacheKey)
    }

    console.log(`Fetching subcategories from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    subcategoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    throw error
  }
}

/**
 * Get subcategories by category ID
 * @param {number|string} categoryId - Category ID
 * @param {Object} params - Query parameters
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Subcategories data
 */
export const getSubcategoriesByCategory = async (categoryId, params = {}, forceRefresh = false) => {
  try {
    if (!categoryId) {
      throw new Error("Category ID is required")
    }

    // Use the main getSubcategories function with category_id parameter
    return await getSubcategories({ ...params, category_id: categoryId }, forceRefresh)
  } catch (error) {
    console.error(`Error fetching subcategories for category ${categoryId}:`, error)
    throw error
  }
}

/**
 * Get a single subcategory by ID
 * @param {number|string} subcategoryId - Subcategory ID
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Subcategory data
 */
export const getSubcategoryById = async (subcategoryId, forceRefresh = false) => {
  try {
    if (!subcategoryId) {
      throw new Error("Subcategory ID is required")
    }

    const url = `${API_BASE_URL}/subcategories/${subcategoryId}`
    const cacheKey = url

    if (!forceRefresh && subcategoryCache.has(cacheKey)) {
      return subcategoryCache.get(cacheKey)
    }

    console.log(`Fetching subcategory by ID from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    subcategoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error(`Error fetching subcategory ${subcategoryId}:`, error)
    throw error
  }
}

/**
 * Get subcategory by slug
 * @param {string} slug - Subcategory slug
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Subcategory data
 */
export const getSubcategoryBySlug = async (slug, forceRefresh = false) => {
  try {
    if (!slug) {
      throw new Error("Subcategory slug is required")
    }

    const url = `${API_BASE_URL}/subcategories/slug/${slug}`
    const cacheKey = url

    if (!forceRefresh && subcategoryCache.has(cacheKey)) {
      return subcategoryCache.get(cacheKey)
    }

    console.log(`Fetching subcategory by slug from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    subcategoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error(`Error fetching subcategory with slug ${slug}:`, error)
    throw error
  }
}

/**
 * Search subcategories
 * @param {string} query - Search query
 * @param {Object} params - Additional query parameters
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Search results
 */
export const searchSubcategories = async (query, params = {}, forceRefresh = false) => {
  try {
    if (!query) {
      throw new Error("Search query is required")
    }

    // Use the main getSubcategories function with search parameter
    return await getSubcategories({ ...params, search: query }, forceRefresh)
  } catch (error) {
    console.error(`Error searching subcategories with query ${query}:`, error)
    throw error
  }
}

/**
 * Get subcategories with products count
 * @param {number|string} categoryId - Category ID (optional)
 * @param {Object} params - Query parameters
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Subcategories with product counts
 */
export const getSubcategoriesWithProductCount = async (categoryId = null, params = {}, forceRefresh = false) => {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("include_product_count", "true")

    if (categoryId) queryParams.append("category_id", categoryId)
    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search && typeof params.search === "string") queryParams.append("search", params.search)

    const url = `${API_BASE_URL}/subcategories?${queryParams.toString()}`
    const cacheKey = url

    if (!forceRefresh && subcategoryCache.has(cacheKey)) {
      return subcategoryCache.get(cacheKey)
    }

    console.log(`Fetching subcategories with product count from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    subcategoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error("Error fetching subcategories with product count:", error)
    throw error
  }
}

/**
 * Get featured subcategories
 * @param {Object} params - Query parameters
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} Featured subcategories
 */
export const getFeaturedSubcategories = async (params = {}, forceRefresh = false) => {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("featured", "true")

    if (params.limit) queryParams.append("limit", params.limit)
    if (params.category_id) queryParams.append("category_id", params.category_id)

    const url = `${API_BASE_URL}/subcategories?${queryParams.toString()}`
    const cacheKey = url

    if (!forceRefresh && subcategoryCache.has(cacheKey)) {
      return subcategoryCache.get(cacheKey)
    }

    console.log(`Fetching featured subcategories from: ${url}`)
    const response = await fetch(url)
    const data = await handleApiResponse(response)

    // Cache the result
    subcategoryCache.set(cacheKey, data)

    return data
  } catch (error) {
    console.error("Error fetching featured subcategories:", error)
    throw error
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Clear subcategory cache
 * @param {string} cacheKey - Specific cache key to clear (optional)
 */
export const clearSubcategoryCache = (cacheKey = null) => {
  if (cacheKey) {
    subcategoryCache.delete(cacheKey)
  } else {
    subcategoryCache.clear()
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getSubcategoryCacheStats = () => {
  return {
    size: subcategoryCache.size,
    keys: Array.from(subcategoryCache.keys()),
  }
}

/**
 * Preload subcategories for a category
 * @param {number|string} categoryId - Category ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Preloaded subcategories
 */
export const preloadSubcategoriesForCategory = async (categoryId, params = {}) => {
  try {
    return await getSubcategoriesByCategory(categoryId, params, false)
  } catch (error) {
    console.error(`Error preloading subcategories for category ${categoryId}:`, error)
    return null
  }
}

// ==================== LEGACY COMPATIBILITY ====================

// Export legacy function names for backward compatibility
export const fetchSubcategories = getSubcategories
export const fetchSubcategoriesByCategory = getSubcategoriesByCategory
export const fetchSubcategoryById = getSubcategoryById

// Default export with all functions
export default {
  // Main subcategory functions
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  getSubcategoryBySlug,
  searchSubcategories,
  getSubcategoriesWithProductCount,
  getFeaturedSubcategories,

  // Utility functions
  clearSubcategoryCache,
  getSubcategoryCacheStats,
  preloadSubcategoriesForCategory,

  // Legacy compatibility
  fetchSubcategories,
  fetchSubcategoriesByCategory,
  fetchSubcategoryById,
}
