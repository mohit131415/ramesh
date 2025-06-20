import { BASE_URL } from "./api-client"
import useAuthStore from "../store/authStore"

// Configuration
const API_BASE_URL = `${BASE_URL}/api/api/public`
const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes
const DEBUG_MODE = false // Disable debug logging to clean console

// Cache storage
const cache = new Map()
const cacheTimestamps = new Map()

/**
 * Debug logging function
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 */
const debugLog = (message, data) => {
  if (DEBUG_MODE) {
    console.log(`[Order Service] ${message}`, data || "")
  }
}

/**
 * Get authentication token from multiple sources
 * @returns {string|null} Authentication token
 */
const getAuthToken = () => {
  // Method 1: Get from localStorage directly
  let token = localStorage.getItem("auth_token")

  // Method 2: If not found, try getting from Zustand store
  if (!token) {
    try {
      const authState = useAuthStore.getState()
      token = authState.token
    } catch (error) {
      console.warn("Could not get token from auth store:", error)
    }
  }

  // Method 3: Try the persisted storage key that Zustand might use
  if (!token) {
    try {
      const persistedAuth = localStorage.getItem("ramesh-auth-storage")
      if (persistedAuth) {
        const parsed = JSON.parse(persistedAuth)
        token = parsed.state?.token || parsed.token
      }
    } catch (error) {
      console.warn("Could not parse persisted auth:", error)
    }
  }

  return token
}

/**
 * Check if cache entry is valid
 * @param {string} cacheKey - Cache key to check
 * @returns {boolean} Whether cache is valid
 */
const isCacheValid = (cacheKey) => {
  const timestamp = cacheTimestamps.get(cacheKey)
  if (!timestamp) return false
  return Date.now() - timestamp < CACHE_DURATION
}

/**
 * Clear specific cache entry
 * @param {string} cacheKey - Cache key to clear
 */
const clearCacheEntry = (cacheKey) => {
  cache.delete(cacheKey)
  cacheTimestamps.delete(cacheKey)
  debugLog(`Cache cleared for key: ${cacheKey}`)
}

/**
 * Clear all order cache
 */
const clearOrderCache = () => {
  cache.clear()
  cacheTimestamps.clear()
  debugLog("All order cache cleared")
}

/**
 * Normalize status data from API
 * @param {Object} status - Status object from API
 * @returns {Object} Normalized status object
 */
const normalizeStatus = (status) => {
  if (!status || !status.code) return { code: "placed", label: "Order Placed", color: "blue" }

  const statusCode = status.code.toLowerCase()

  // Status mapping with correct labels
  const statusMap = {
    placed: { label: "Order Placed", color: "blue" },
    preparing: { label: "Preparing", color: "orange" },
    prepared: { label: "Prepared", color: "amber" },
    shipped: { label: "Shipped", color: "purple" },
    delivered: { label: "Delivered", color: "green" },
    cancelled: { label: "Cancelled", color: "red" },
    refunded: { label: "Refunded", color: "indigo" },
    returned: { label: "Returned", color: "gray" },
  }

  const mappedStatus = statusMap[statusCode] || statusMap.placed

  return {
    ...status,
    code: statusCode,
    label: mappedStatus.label,
    color: mappedStatus.color,
  }
}

/**
 * Centralized request handler
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @param {boolean} useCache - Whether to use cache
 * @param {boolean} forceRefresh - Whether to force refresh
 * @returns {Promise<any>} API response
 */
const makeRequest = async (endpoint, options = {}, useCache = true, forceRefresh = false) => {
  const cacheKey = `${endpoint}_${JSON.stringify(options)}`

  // Check cache first
  if (useCache && !forceRefresh && isCacheValid(cacheKey)) {
    debugLog(`Cache hit for: ${endpoint}`)
    return cache.get(cacheKey)
  }

  // Get authentication token
  const token = getAuthToken()
  if (!token) {
    throw new Error("Authentication token not found")
  }

  // Prepare request
  const url = `${API_BASE_URL}${endpoint}`
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  }

  debugLog(`Making order API request to: ${endpoint}`)

  try {
    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Cache successful responses
    if (useCache && response.ok) {
      cache.set(cacheKey, data)
      cacheTimestamps.set(cacheKey, Date.now())
    }

    debugLog(`Order API request successful for: ${endpoint}`)
    return data
  } catch (error) {
    debugLog(`Order API request failed for ${endpoint}: ${error.message}`)
    throw new Error(`Failed to ${endpoint}: ${error.message}`)
  }
}

/**
 * Validate order ID format - Updated to allow alphanumeric characters
 * @param {string} orderNumber - Order number to validate
 * @returns {boolean} Whether order ID is valid
 */
const validateOrderId = (orderNumber) => {
  if (!orderNumber || typeof orderNumber !== "string") return false
  // Updated regex to allow alphanumeric characters after the initial letters
  // Format: 2 letters followed by alphanumeric characters (minimum 8 characters total)
  return /^[A-Z]{2}[A-Z0-9]{6,}$/i.test(orderNumber)
}

/**
 * Format order data for consistency
 * @param {Object} order - Raw order data
 * @returns {Object} Formatted order data
 */
const formatOrderData = (order) => {
  if (!order) return null

  try {
    return {
      ...order,
      order_date: order.order_date ? new Date(order.order_date) : null,
      delivery_date: order.delivery_date ? new Date(order.delivery_date) : null,
      total_amount: Number.parseFloat(order.total_amount || 0),
      status: normalizeStatus(order.status), // Use normalized status
    }
  } catch (error) {
    console.warn("Error formatting order data:", error, order)
    // Return order as-is if formatting fails
    return {
      ...order,
      status: normalizeStatus(order.status),
    }
  }
}

/**
 * Get order history with filtering and pagination
 * @param {Object} params - Query parameters
 * @param {boolean} forceRefresh - Whether to force refresh
 * @returns {Promise<Object>} Order history data
 */
export const getOrderHistory = async (params = {}, forceRefresh = false) => {
  try {
    // Build query string
    const queryParams = new URLSearchParams()

    // Add default sort parameters if not provided
    if (!params.sort_by) queryParams.append("sort_by", "order_date")
    if (!params.sort_order) queryParams.append("sort_order", "desc")

    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.status) queryParams.append("status", params.status)
    if (params.date_from) queryParams.append("date_from", params.date_from)
    if (params.date_to) queryParams.append("date_to", params.date_to)
    if (params.search) queryParams.append("search", params.search)

    const endpoint = `/orders/history${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    const response = await makeRequest(endpoint, {}, true, forceRefresh)

    // Format orders data safely and normalize status
    if (response.data?.orders && Array.isArray(response.data.orders)) {
      response.data.orders = response.data.orders
        .map((order) => ({
          ...formatOrderData(order),
          status: normalizeStatus(order.status),
        }))
        .filter(Boolean)
    }

    return response
  } catch (error) {
    console.error(`Error fetching order history:`, error)
    throw error
  }
}

/**
 * Get order details by order number
 * @param {string} orderNumber - Order number
 * @param {Object} options - Additional options
 * @param {boolean} forceRefresh - Whether to force refresh
 */
export const getOrderDetails = async (orderNumber, options = {}, forceRefresh = false) => {
  try {
    // Use the correct endpoint: /orders/details/{orderNumber}
    const endpoint = `/orders/details/${orderNumber}`
    const response = await makeRequest(endpoint, {}, true, forceRefresh)

    // Format order data and normalize status
    if (response.data) {
      response.data = {
        ...formatOrderData(response.data),
        status: normalizeStatus(response.data.status),
      }
    }

    return response
  } catch (error) {
    console.error(`Error fetching order details for ${orderNumber}:`, error)
    throw error
  }
}

/**
 * Get order tracking information
 * @param {string} orderNumber - Order number
 * @param {boolean} forceRefresh - Whether to force refresh
 * @returns {Promise<Object>} Order tracking data
 */
export const getOrderTracking = async (orderNumber, forceRefresh = false) => {
  try {
    console.log(`Order number validation skipped for tracking: ${orderNumber}`)

    const endpoint = `/orders/${orderNumber}/tracking`
    return await makeRequest(endpoint, {}, true, forceRefresh)
  } catch (error) {
    console.error(`Error fetching order tracking for ${orderNumber}:`, error)
    throw error
  }
}

/**
 * Cancel an order
 * @param {string} orderNumber - Order number to cancel
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelOrder = async (orderNumber, reason = "") => {
  try {
    console.log(`Order number validation skipped for cancellation: ${orderNumber}`)

    const endpoint = `/orders/${orderNumber}/cancel`
    const response = await makeRequest(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
      false, // Don't cache cancel requests
    )

    // Clear cache for this order
    clearCacheEntry(`/orders/details/${orderNumber}`)
    clearCacheEntry(`/orders/history`)

    return response
  } catch (error) {
    console.error(`Error cancelling order ${orderNumber}:`, error)
    throw error
  }
}

/**
 * Reorder items from a previous order
 * @param {string} orderNumber - Order number to reorder from
 * @returns {Promise<Object>} Reorder response
 */
export const reorderItems = async (orderNumber) => {
  try {
    console.log(`Order number validation skipped for reorder: ${orderNumber}`)

    const endpoint = `/orders/${orderNumber}/reorder`
    return await makeRequest(
      endpoint,
      {
        method: "POST",
      },
      false, // Don't cache reorder requests
    )
  } catch (error) {
    console.error(`Error reordering items from ${orderNumber}:`, error)
    throw error
  }
}

/**
 * Get order invoice
 * @param {string} orderNumber - Order number
 * @returns {Promise<Object>} Invoice data
 */
export const getOrderInvoice = async (orderNumber) => {
  try {
    console.log(`Order number validation skipped for invoice: ${orderNumber}`)

    const endpoint = `/orders/invoice/${orderNumber}`
    return await makeRequest(endpoint, {}, false) // Don't cache invoices
  } catch (error) {
    console.error(`Error fetching invoice for ${orderNumber}:`, error)
    throw error
  }
}

/**
 * Search orders
 * @param {string} query - Search query
 * @param {Object} params - Additional parameters
 * @param {boolean} forceRefresh - Whether to force refresh
 * @returns {Promise<Object>} Search results
 */
export const searchOrders = async (query, params = {}, forceRefresh = false) => {
  try {
    if (!query || typeof query !== "string" || query.trim() === "") {
      throw new Error("Search query is required")
    }

    return await getOrderHistory({ ...params, search: query.trim() }, forceRefresh)
  } catch (error) {
    console.error(`Error searching orders with query ${query}:`, error)
    throw error
  }
}

/**
 * Get order statistics/summary
 * @param {Object} params - Query parameters
 * @param {boolean} forceRefresh - Whether to force refresh
 * @returns {Promise<Object>} Order statistics
 */
export const getOrderStatistics = async (params = {}, forceRefresh = false) => {
  try {
    const queryParams = new URLSearchParams()
    if (params.date_from) queryParams.append("date_from", params.date_from)
    if (params.date_to) queryParams.append("date_to", params.date_to)

    const endpoint = `/orders/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    return await makeRequest(endpoint, {}, true, forceRefresh)
  } catch (error) {
    console.error(`Error fetching order statistics:`, error)
    throw error
  }
}

// Create orderService object for backward compatibility
export const orderService = {
  getOrderHistory,
  getOrderDetails,
  getOrderTracking,
  cancelOrder,
  reorderItems,
  getOrderInvoice,
  searchOrders,
  getOrderStatistics,
  clearOrderCache,
  clearCacheEntry,
}

// Export cache management functions
export { clearOrderCache, clearCacheEntry }

// Default export for backward compatibility
export default orderService
