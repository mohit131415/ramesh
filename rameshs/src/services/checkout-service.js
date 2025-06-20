/**
 * Checkout API service for handling checkout preparation and completion
 */
import { BASE_URL } from "./api-client"
import useAuthStore from "../store/authStore"

// Configuration
const API_BASE_URL = `${BASE_URL}/api/api/public`
const CACHE_DURATION = 1 * 60 * 1000 // 1 minute (short cache for checkout data)

// Cache storage
const cache = new Map()
const cacheTimestamps = new Map()

/**
 * Debug logging function
 * @param {string} message - Log message
 * @param {*} data - Additional data to log
 */
const debugLog = (message, data) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Checkout Service] ${message}`, data || "")
  }
}

/**
 * Get authentication token from multiple sources
 * @returns {string|null} - Authentication token
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
 * @returns {boolean} - Whether cache is valid
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
 * Clear all checkout cache
 */
const clearCheckoutCache = () => {
  cache.clear()
  cacheTimestamps.clear()
  debugLog("All checkout cache cleared")
}

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @param {string} cacheKey - Cache key for GET requests
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} - API response
 */
const makeRequest = async (endpoint, options = {}, cacheKey = null, forceRefresh = false) => {
  const { method = "GET", body, headers = {} } = options

  // Check cache for GET requests
  if (method === "GET" && cacheKey && !forceRefresh && isCacheValid(cacheKey)) {
    debugLog(`Cache hit for: ${cacheKey}`)
    return cache.get(cacheKey)
  }

  // Get authentication token
  const token = getAuthToken()
  if (!token) {
    throw new Error("Authentication token not found")
  }

  // Prepare request headers
  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...headers,
  }

  const url = `${API_BASE_URL}${endpoint}`
  debugLog(`Making checkout API request to: ${endpoint}`)

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // Cache GET requests
    if (method === "GET" && cacheKey) {
      cache.set(cacheKey, data)
      cacheTimestamps.set(cacheKey, Date.now())
      debugLog(`Cached response for: ${cacheKey}`)
    }

    debugLog(`Checkout API request successful for ${endpoint}`)
    return data
  } catch (error) {
    debugLog(`Checkout API request failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * Checkout service object with all API functions
 */
const checkoutService = {
  /**
   * Prepare checkout data with cart validation, tax calculation, and payment methods
   * @param {Object} params - Checkout preparation parameters
   * @param {number} [params.address_id] - Delivery address ID (uses default if not provided)
   * @param {string} [params.payment_method] - Payment method to calculate charges
   * @param {boolean} [forceRefresh=false] - Force refresh cache
   * @returns {Promise<Object>} - Prepared checkout data
   */
  async prepareCheckout(params = {}, forceRefresh = false) {
    try {
      debugLog("Preparing checkout with params:", params)

      const queryParams = new URLSearchParams()

      if (params.address_id) {
        queryParams.append("address_id", params.address_id)
      }

      if (params.payment_method) {
        queryParams.append("payment_method", params.payment_method)
      }

      const endpoint = `/checkout/prepare${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const cacheKey = `prepare_checkout_${JSON.stringify(params)}`

      const response = await makeRequest(endpoint, { method: "GET" }, cacheKey, forceRefresh)

      debugLog("Checkout preparation successful:", response)
      return response
    } catch (error) {
      debugLog("Checkout preparation failed:", error)
      throw error
    }
  },

  /**
   * Complete the checkout process and create an order
   * @param {Object} orderData - Order completion data
   * @param {number} orderData.address_id - Delivery address ID
   * @param {string} orderData.payment_method - Payment method (cod or online)
   * @param {string} [orderData.payment_id] - Payment ID (required for online payments)
   * @param {Object} [orderData.additional_data] - Additional order data
   * @returns {Promise<Object>} - Created order data
   */
  async completeCheckout(orderData) {
    try {
      debugLog("Completing checkout with data:", orderData)

      // Validate required fields
      if (!orderData.address_id) {
        throw new Error("Address ID is required")
      }

      if (!orderData.payment_method) {
        throw new Error("Payment method is required")
      }

      const response = await makeRequest("/checkout/complete", {
        method: "POST",
        body: orderData,
      })

      // Clear cache after successful checkout
      clearCheckoutCache()

      debugLog("Checkout completion successful:", response)
      return response
    } catch (error) {
      debugLog("Checkout completion failed:", error)
      throw error
    }
  },

  /**
   * Apply coupon to checkout
   * @param {string} couponCode - Coupon code to apply
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Object>} - Updated checkout data with coupon applied
   */
  async applyCoupon(couponCode, params = {}) {
    try {
      if (!couponCode) {
        throw new Error("Coupon code is required")
      }

      debugLog("Applying coupon:", couponCode)

      const response = await makeRequest("/checkout/apply-coupon", {
        method: "POST",
        body: { coupon_code: couponCode, ...params },
      })

      // Clear cache after coupon application
      clearCheckoutCache()

      debugLog("Coupon application successful:", response)
      return response
    } catch (error) {
      debugLog("Coupon application failed:", error)
      throw error
    }
  },

  /**
   * Remove coupon from checkout
   * @returns {Promise<Object>} - Updated checkout data with coupon removed
   */
  async removeCoupon() {
    try {
      debugLog("Removing coupon")

      const response = await makeRequest("/checkout/remove-coupon", {
        method: "POST",
      })

      // Clear cache after coupon removal
      clearCheckoutCache()

      debugLog("Coupon removal successful:", response)
      return response
    } catch (error) {
      debugLog("Coupon removal failed:", error)
      throw error
    }
  },

  /**
   * Validate checkout data before proceeding
   * @param {Object} checkoutData - Checkout data to validate
   * @returns {Object} - Validation result
   */
  validateCheckoutData(checkoutData) {
    const errors = []

    if (!checkoutData.address || !checkoutData.has_address) {
      errors.push("A delivery address is required")
    }

    if (!checkoutData.items || checkoutData.items.length === 0) {
      errors.push("Your cart is empty")
    }

    if (!checkoutData.payment_info?.selected_method) {
      errors.push("Please select a payment method")
    }

    // Validate minimum order amount
    if (checkoutData.totals?.final_total < 1) {
      errors.push("Order total must be greater than ₹1")
    }

    // Validate items availability
    if (checkoutData.items?.some((item) => !item.is_available)) {
      errors.push("Some items in your cart are no longer available")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Format checkout data for display
   * @param {Object} checkoutData - Raw checkout data from API
   * @returns {Object} - Formatted data for UI
   */
  formatCheckoutData(checkoutData) {
    if (!checkoutData) return null

    return {
      ...checkoutData,
      formattedTotals: {
        ...checkoutData.totals,
        subtotal: this.formatPrice(checkoutData.totals?.subtotal),
        productDiscountAmount: this.formatPrice(checkoutData.totals?.product_discount_amount),
        couponDiscountAmount: this.formatPrice(checkoutData.totals?.coupon_discount_amount),
        totalDiscountAmount: this.formatPrice(checkoutData.totals?.total_discount_amount),
        shippingCharges: this.formatPrice(checkoutData.totals?.shipping_charges),
        paymentCharges: this.formatPrice(checkoutData.totals?.payment_charges),
        finalTotal: this.formatPrice(checkoutData.totals?.final_total),
        taxAmount: this.formatPrice(checkoutData.totals?.tax_amount),
        baseAmount: this.formatPrice(checkoutData.totals?.base_amount),
      },
    }
  },

  /**
   * Format price for display
   * @param {number|string} price - Price to format
   * @returns {string} - Formatted price
   */
  formatPrice(price) {
    if (!price && price !== 0) return "0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return numPrice.toFixed(2)
  },

  /**
   * Clear checkout cache
   */
  clearCache: clearCheckoutCache,

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key to clear
   */
  clearCacheEntry,
}

export default checkoutService
