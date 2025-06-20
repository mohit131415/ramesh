import { BASE_URL } from "./api-client"

// API base URL with proper path structure
const API_BASE_URL = `${BASE_URL}/api/api/public`

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const requestCache = new Map()
const pendingRequests = new Map()
const cacheTimestamps = new Map()
let initialDataLoaded = false
let initialApiCallMade = false
let initialApiCallPromise = null

/**
 * Debug logging function - can be enabled/disabled as needed
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 */
const debugLog = (message, data) => {
  const DEBUG = false // Set to false to disable logging
  if (DEBUG) {
    if (data) {
      console.log(`[ProductService] ${message}`, data)
    } else {
      console.log(`[ProductService] ${message}`)
    }
  }
}

/**
 * Clear a specific cache entry or the entire cache
 * @param {string|null} cacheKey - The specific cache key to clear, or null to clear all
 */
export const clearCacheEntry = (cacheKey = null) => {
  if (cacheKey) {
    // debugLog(`Clearing cache entry: ${cacheKey}`)
    requestCache.delete(cacheKey)
    cacheTimestamps.delete(cacheKey)
  } else {
    // debugLog("Clearing entire product cache")
    requestCache.clear()
    cacheTimestamps.clear()
  }
}

/**
 * Clear the entire product cache
 */
export const clearProductCache = () => {
  clearCacheEntry()
}

/**
 * Check if a cache entry is still valid
 * @param {string} cacheKey - The cache key to check
 * @returns {boolean} - Whether the cache entry is still valid
 */
const isCacheValid = (cacheKey) => {
  if (!requestCache.has(cacheKey) || !cacheTimestamps.has(cacheKey)) {
    return false
  }

  const timestamp = cacheTimestamps.get(cacheKey)
  return Date.now() - timestamp < CACHE_DURATION
}

/**
 * Make a request to the API with caching
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Request options
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<any>} - The response data
 */
const makeRequest = async (endpoint, options = {}, forceRefresh = false) => {
  const url = `${API_BASE_URL}${endpoint}`
  const cacheKey = `${url}:${JSON.stringify(options)}`

  // debugLog(`Making product API request to: ${url}`, options)

  // Check if we should use the cache
  if (!forceRefresh && isCacheValid(cacheKey)) {
    // debugLog(`Cache hit for: ${url}`)
    return requestCache.get(cacheKey)
  }

  // Check if there's a pending request for this URL
  if (pendingRequests.has(cacheKey)) {
    // debugLog(`Using pending request for: ${url}`)
    return pendingRequests.get(cacheKey)
  }

  // Make the request
  const requestPromise = new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Cache the response
      requestCache.set(cacheKey, data)
      cacheTimestamps.set(cacheKey, Date.now())
      pendingRequests.delete(cacheKey)

      // debugLog(`API request successful: ${url}`, { status: response.status })
      resolve(data)
    } catch (error) {
      pendingRequests.delete(cacheKey)
      // debugLog(`API request failed for ${url}: ${error.message}`)
      reject(error)
    }
  })

  pendingRequests.set(cacheKey, requestPromise)
  return requestPromise
}

/**
 * Get the price range for products
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The price range data
 */
export const getPriceRange = async (forceRefresh = false) => {
  try {
    return await makeRequest("/filters/price-range", {}, forceRefresh)
  } catch (error) {
    console.error("Failed to fetch price range:", error)
    throw error
  }
}

/**
 * Get comprehensive products with filtering
 * @param {Object} params - Filter parameters
 * @param {number|string|null} params.category_id - Category ID
 * @param {number|string|Array|null} params.subcategory_id - Subcategory ID(s)
 * @param {number|null} params.min_price - Minimum price
 * @param {number|null} params.max_price - Maximum price
 * @param {boolean|null} params.is_vegetarian - Vegetarian filter
 * @param {string} params.sort - Sort order
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.q - Search query
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @param {boolean} skipCache - Whether to skip the cache
 * @returns {Promise<Object>} - The product data
 */
export const getComprehensiveProducts = async ({
  category_id = null,
  subcategory_id = null,
  min_price = null,
  max_price = null,
  is_vegetarian = null,
  sort = "popular",
  page = 1,
  limit = 12,
  q = "",
  forceRefresh = false,
  skipCache = false,
}) => {
  try {
    const params = new URLSearchParams()

    // Only add parameters that have actual values
    if (category_id) params.append("category_id", category_id)

    // Handle subcategory IDs properly
    if (subcategory_id) {
      if (Array.isArray(subcategory_id)) {
        subcategory_id.forEach((id) => params.append("subcategory_ids[]", id))
      } else if (typeof subcategory_id === "string" && subcategory_id.includes(",")) {
        subcategory_id.split(",").forEach((id) => params.append("subcategory_ids[]", id.trim()))
      } else {
        params.append("subcategory_ids[]", subcategory_id)
      }
    }

    // Only add price range parameters if they have actual values
    if (min_price !== null) params.append("min_price", min_price)
    if (max_price !== null) params.append("max_price", max_price)

    if (is_vegetarian !== null) params.append("is_vegetarian", is_vegetarian)
    if (sort) params.append("sort_by", sort)
    if (page) params.append("page", page)
    if (limit) params.append("limit", limit)

    // Add search query using the 'q' parameter
    if (q && q.trim().length > 0) {
      params.append("q", q.trim())
    }

    const endpoint = `/filters/comprehensive?${params.toString()}`

    // Handle initial API call
    if (!initialApiCallMade && !skipCache) {
      if (!initialApiCallPromise) {
        initialApiCallPromise = makeRequest(endpoint, {}, forceRefresh)
          .then((data) => {
            // Validate price range if it exists
            if (data?.data?.filters?.price_range) {
              const priceRange = data.data.filters.price_range

              if (priceRange.min_price === undefined || priceRange.max_price === undefined) {
                console.warn("Price range is missing min_price or max_price")
              }

              if (isNaN(Number(priceRange.min_price)) || isNaN(Number(priceRange.max_price))) {
                console.warn("Price range contains non-numeric values")
              }
            } else {
              console.warn("Price range data is not available")
            }

            initialApiCallMade = true
            initialDataLoaded = true
            return data
          })
          .catch((error) => {
            console.error("Initial API call failed:", error)
            throw error
          })
      }
      return initialApiCallPromise
    }

    // For subsequent calls, use the regular request function
    return await makeRequest(endpoint, {}, forceRefresh)
  } catch (error) {
    console.error("Error in getComprehensiveProducts:", error)
    throw error
  }
}

/**
 * Check if initial data has been loaded
 * @returns {boolean} - Whether initial data has been loaded
 */
export const isInitialDataLoaded = () => initialDataLoaded

/**
 * Get all products with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product data
 */
export const getProducts = async (page = 1, limit = 10, forceRefresh = false) => {
  return getComprehensiveProducts({ page, limit }, forceRefresh)
}

/**
 * Get sorted products with filtering
 * @param {Object} params - Filter parameters
 * @param {string} params.sort_by - Sort order
 * @param {number|string|null} params.category_id - Category ID
 * @param {number|string|null} params.subcategory_id - Subcategory ID
 * @param {Array|null} params.subcategory_ids - Subcategory IDs array
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product data
 */
export const getSortedProducts = async (
  {
    sort_by = "popular",
    category_id = null,
    subcategory_id = null,
    subcategory_ids = null,
    page = 1,
    limit = 12,
    search = "",
  },
  forceRefresh = false,
) => {
  // Use the comprehensive API for all requests
  return getComprehensiveProducts(
    {
      category_id,
      subcategory_id: subcategory_ids || subcategory_id,
      sort: sort_by,
      page,
      limit,
      q: search,
    },
    forceRefresh,
  )
}

/**
 * Get a single product by ID
 * @param {number|string} id - Product ID
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product data
 */
export const getProduct = async (id, forceRefresh = false) => {
  if (!id) {
    throw new Error("Product ID is required")
  }

  return makeRequest(`/products/${id}`, {}, forceRefresh)
}

/**
 * Get a single product by slug
 * @param {string} slug - Product slug
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product data
 */
export const getProductBySlug = async (slug, forceRefresh = false) => {
  if (!slug) {
    throw new Error("Product slug is required")
  }

  return makeRequest(`/products/slug/${slug}`, {}, forceRefresh)
}

/**
 * Search products
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product data
 */
export const searchProducts = async (query, page = 1, limit = 10, forceRefresh = false) => {
  return getComprehensiveProducts({ q: query, page, limit }, forceRefresh)
}

/**
 * Get products by category
 * @param {number|string} categoryId - Category ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product data
 */
export const getProductsByCategory = async (categoryId, page = 1, limit = 10, forceRefresh = false) => {
  if (!categoryId) {
    throw new Error("Category ID is required")
  }

  return getComprehensiveProducts({ category_id: categoryId, page, limit }, forceRefresh)
}

/**
 * Get products by subcategory
 * @param {number|string} subcategoryId - Subcategory ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product data
 */
export const getProductsBySubcategory = async (subcategoryId, page = 1, limit = 10, forceRefresh = false) => {
  if (!subcategoryId) {
    throw new Error("Subcategory ID is required")
  }

  return getComprehensiveProducts({ subcategory_id: subcategoryId, page, limit }, forceRefresh)
}

/**
 * Get featured products
 * @param {number} limit - Items to return
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The featured product data
 */
export const getFeaturedProducts = async (limit = 8, forceRefresh = false) => {
  return makeRequest(`/featured/products?limit=${limit}`, {}, forceRefresh)
}

/**
 * Get best selling products
 * @param {number} limit - Items to return
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The best selling product data
 */
export const getBestSellingProducts = async (limit = 8, forceRefresh = false) => {
  return makeRequest(`/featured/best-selling?limit=${limit}`, {}, forceRefresh)
}

/**
 * Get new arrivals
 * @param {number} limit - Items to return
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The new arrivals data
 */
export const getNewArrivals = async (limit = 8, forceRefresh = false) => {
  return makeRequest(`/featured/new-arrivals?limit=${limit}`, {}, forceRefresh)
}

/**
 * Get related products
 * @param {number|string} productId - Product ID
 * @param {number} limit - Items to return
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The related products data
 */
export const getRelatedProducts = async (productId, limit = 4, forceRefresh = false) => {
  if (!productId) {
    throw new Error("Product ID is required")
  }

  return makeRequest(`/products/${productId}/related?limit=${limit}`, {}, forceRefresh)
}

/**
 * Get product reviews
 * @param {number|string} productId - Product ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product reviews data
 */
export const getProductReviews = async (productId, page = 1, limit = 10, forceRefresh = false) => {
  if (!productId) {
    throw new Error("Product ID is required")
  }

  return makeRequest(`/products/${productId}/reviews?page=${page}&limit=${limit}`, {}, forceRefresh)
}

/**
 * Submit a product review
 * @param {number|string} productId - Product ID
 * @param {Object} reviewData - Review data
 * @returns {Promise<Object>} - The submission response
 */
export const submitProductReview = async (productId, reviewData) => {
  if (!productId) {
    throw new Error("Product ID is required")
  }

  if (!reviewData) {
    throw new Error("Review data is required")
  }

  return makeRequest(
    `/products/${productId}/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    },
    true,
  ) // Always force refresh for POST requests
}

/**
 * Get product variants
 * @param {number|string} productId - Product ID
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @returns {Promise<Object>} - The product variants data
 */
export const getProductVariants = async (productId, forceRefresh = false) => {
  if (!productId) {
    throw new Error("Product ID is required")
  }

  return makeRequest(`/products/${productId}/variants`, {}, forceRefresh)
}

// Legacy API methods - kept for backward compatibility
// Get all categories
export const getCategories = async () => {
  try {
    // Use the direct categories endpoint instead of filters/categories
    const response = await fetch(`${API_BASE_URL}/categories`)
    if (!response.ok) {
      throw new Error("Failed to fetch categories")
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

// Get all subcategories
export const getSubcategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/filters/subcategories`)
    if (!response.ok) {
      throw new Error("Failed to fetch subcategories")
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}

// Get subcategories by category
export const getSubcategoriesByCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/filters/subcategories/category/${categoryId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch subcategories by category")
    }
    return await response.json()
  } catch (error) {
    throw error
  }
}
