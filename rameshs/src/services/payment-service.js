import { BASE_URL } from "./api-client"
import useAuthStore from "../store/authStore"

/**
 * Payment Service
 * Handles all payment-related API calls with caching, authentication, and error handling
 */

// Configuration
const API_BASE_URL = `${BASE_URL}/api/api/public`
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes
const DEBUG = import.meta.env.DEV

// Cache storage
const cache = new Map()
const cacheTimestamps = new Map()

/**
 * Debug logging function
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 */
const debugLog = (message, data) => {
  if (DEBUG) {
    console.log(`[Payment Service] ${message}`, data || "")
  }
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
      debugLog("Could not get token from auth store:", error)
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
      debugLog("Could not parse persisted auth:", error)
    }
  }

  return token
}

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} - API response
 */
const makeRequest = async (endpoint, options = {}) => {
  const { method = "GET", data = null, headers = {}, forceRefresh = false } = options

  // Create cache key
  const cacheKey = `${method}:${endpoint}:${JSON.stringify(data)}`

  // Check cache first (only for GET requests)
  if (method === "GET" && !forceRefresh && isCacheValid(cacheKey)) {
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
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  }

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    requestOptions.body = JSON.stringify(data)
  }

  debugLog(`Making payment API request to: ${endpoint}`)

  try {
    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Payment API request failed for ${endpoint}: ${response.status} ${response.statusText} - ${
          errorData.message || "Unknown error"
        }`,
      )
    }

    const result = await response.json()

    // Cache successful GET requests
    if (method === "GET") {
      cache.set(cacheKey, result)
      cacheTimestamps.set(cacheKey, Date.now())
      debugLog(`Cached response for: ${endpoint}`)
    }

    debugLog(`Payment API request successful for: ${endpoint}`)
    return result
  } catch (error) {
    debugLog(`Payment API request failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * Clear specific cache entry
 * @param {string} cacheKey - Cache key to clear
 */
const clearCacheEntry = (cacheKey) => {
  cache.delete(cacheKey)
  cacheTimestamps.delete(cacheKey)
  debugLog(`Cleared cache entry: ${cacheKey}`)
}

/**
 * Clear all payment cache
 */
const clearPaymentCache = () => {
  cache.clear()
  cacheTimestamps.clear()
  debugLog("Cleared all payment cache")
}

/**
 * Payment Service Object
 */
const paymentService = {
  /**
   * Get available payment methods
   * @param {number} amount - Order amount
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise} - Payment methods response
   */
  getPaymentMethods: async (amount, forceRefresh = false) => {
    try {
      if (!amount || amount <= 0) {
        throw new Error("Valid amount is required")
      }

      debugLog(`Getting payment methods for amount: ${amount}`)

      // For demo purposes, return simulated data
      // In production, this would be: return await makeRequest(`/payment/methods?amount=${amount}`, { forceRefresh })

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: "success",
            data: {
              methods: [
                {
                  code: "cod",
                  name: "Cash on Delivery",
                  available: true,
                  charges: amount > 500 ? 0 : 30,
                  description: "Pay with cash when your order is delivered",
                  icon: "truck",
                },
                {
                  code: "card",
                  name: "Credit/Debit Card",
                  available: true,
                  charges: amount > 2000 ? 0 : 20,
                  description: "Pay securely with your credit or debit card",
                  icon: "credit-card",
                },
                {
                  code: "upi",
                  name: "UPI Payment",
                  available: true,
                  charges: 0,
                  description: "Pay instantly using UPI apps like GPay, PhonePe",
                  icon: "smartphone",
                },
                {
                  code: "netbanking",
                  name: "Net Banking",
                  available: true,
                  charges: 15,
                  description: "Pay directly from your bank account",
                  icon: "building",
                },
                {
                  code: "wallet",
                  name: "Digital Wallet",
                  available: amount <= 10000,
                  charges: 5,
                  description: "Pay using digital wallets like Paytm, PhonePe",
                  icon: "wallet",
                },
              ],
            },
            message: "Payment methods retrieved successfully",
          })
        }, 300)
      })
    } catch (error) {
      debugLog("Error getting payment methods:", error)
      throw error
    }
  },

  /**
   * Process payment
   * @param {string} paymentId - Payment ID
   * @param {Object} paymentDetails - Payment details
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise} - Payment processing response
   */
  processPayment: async (paymentId, paymentDetails, forceRefresh = false) => {
    try {
      if (!paymentId) {
        throw new Error("Payment ID is required")
      }

      if (!paymentDetails || !paymentDetails.amount || !paymentDetails.method) {
        throw new Error("Payment details with amount and method are required")
      }

      debugLog(`Processing payment: ${paymentId}`, paymentDetails)

      // Clear cache after payment processing
      clearPaymentCache()

      // For demo purposes, simulate payment processing
      // In production, this would be: return await makeRequest(`/payment/process/${paymentId}`, { method: "POST", data: paymentDetails, forceRefresh })

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 95% success rate for demo
          const isSuccess = Math.random() > 0.05

          if (isSuccess) {
            resolve({
              status: "success",
              data: {
                payment_id: paymentId,
                transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                status: "completed",
                amount: paymentDetails.amount,
                payment_method: paymentDetails.method,
                gateway_response: {
                  gateway_transaction_id: `gtw_${Date.now()}`,
                  gateway_status: "SUCCESS",
                },
                processed_at: new Date().toISOString(),
              },
              message: "Payment processed successfully",
            })
          } else {
            reject({
              status: "error",
              message: "Payment failed. Please try again.",
              error_code: "PAYMENT_FAILED",
              data: {
                payment_id: paymentId,
                failure_reason: "Gateway timeout",
                retry_allowed: true,
              },
            })
          }
        }, 2000)
      })
    } catch (error) {
      debugLog("Error processing payment:", error)
      throw error
    }
  },

  /**
   * Create order
   * @param {Object} orderData - Order data
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise} - Order creation response
   */
  createOrder: async (orderData, forceRefresh = false) => {
    try {
      if (!orderData) {
        throw new Error("Order data is required")
      }

      debugLog("Creating order:", orderData)

      // Clear cache after order creation
      clearPaymentCache()

      return await makeRequest("/orders/create", {
        method: "POST",
        data: orderData,
        forceRefresh,
      })
    } catch (error) {
      debugLog("Error creating order:", error)
      throw error
    }
  },

  /**
   * Download invoice
   * @param {string} orderNumber - Order number
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise} - Invoice HTML content
   */
  downloadInvoice: async (orderNumber, forceRefresh = false) => {
    try {
      if (!orderNumber) {
        throw new Error("Order number is required")
      }

      debugLog(`Downloading invoice for order: ${orderNumber}`)

      // Get authentication token
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Make request for HTML content
      const url = `${API_BASE_URL}/orders/invoice/${orderNumber}`
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/html",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to download invoice: ${response.status} ${response.statusText}`)
      }

      // Get HTML content
      const htmlContent = await response.text()
      debugLog(`Invoice HTML content received for order: ${orderNumber}`)

      return htmlContent
    } catch (error) {
      debugLog("Error downloading invoice:", error)
      throw error
    }
  },

  /**
   * Verify payment
   * @param {string} paymentId - Payment ID
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise} - Payment verification response
   */
  verifyPayment: async (paymentId, forceRefresh = false) => {
    try {
      if (!paymentId) {
        throw new Error("Payment ID is required")
      }

      debugLog(`Verifying payment: ${paymentId}`)

      // For demo purposes, simulate payment verification
      // In production, this would be: return await makeRequest(`/payment/verify/${paymentId}`, { forceRefresh })

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: "success",
            data: {
              payment_id: paymentId,
              status: "verified",
              verification_details: {
                verified_at: new Date().toISOString(),
                verification_method: "gateway_callback",
                gateway_status: "SUCCESS",
              },
            },
            message: "Payment verified successfully",
          })
        }, 500)
      })
    } catch (error) {
      debugLog("Error verifying payment:", error)
      throw error
    }
  },

  /**
   * Get payment status
   * @param {string} paymentId - Payment ID
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise} - Payment status response
   */
  getPaymentStatus: async (paymentId, forceRefresh = false) => {
    try {
      if (!paymentId) {
        throw new Error("Payment ID is required")
      }

      debugLog(`Getting payment status: ${paymentId}`)

      return await makeRequest(`/payment/status/${paymentId}`, { forceRefresh })
    } catch (error) {
      debugLog("Error getting payment status:", error)
      throw error
    }
  },

  /**
   * Refund payment
   * @param {string} paymentId - Payment ID
   * @param {Object} refundData - Refund details
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise} - Refund response
   */
  refundPayment: async (paymentId, refundData, forceRefresh = false) => {
    try {
      if (!paymentId) {
        throw new Error("Payment ID is required")
      }

      if (!refundData || !refundData.amount) {
        throw new Error("Refund data with amount is required")
      }

      debugLog(`Processing refund for payment: ${paymentId}`, refundData)

      // Clear cache after refund processing
      clearPaymentCache()

      return await makeRequest(`/payment/refund/${paymentId}`, {
        method: "POST",
        data: refundData,
        forceRefresh,
      })
    } catch (error) {
      debugLog("Error processing refund:", error)
      throw error
    }
  },

  // Utility functions
  clearCache: clearPaymentCache,
  clearCacheEntry,
}

export default paymentService
