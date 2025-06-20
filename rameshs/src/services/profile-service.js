import { BASE_URL } from "./api-client"
import useAuthStore from "../store/authStore"

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = {
  profile: null,
  completeness: null,
  addresses: null,
  defaultAddress: null,
  addressLimits: null,
  orders: null,
}

// API base URL
const API_BASE_URL = `${BASE_URL}/api/api/public`

/**
 * Clear all profile-related cache
 */
export const clearProfileCache = () => {
  Object.keys(cache).forEach((key) => {
    cache[key] = null
  })
}

/**
 * Clear specific cache entry
 * @param {string} key - Cache key to clear
 */
export const clearCacheEntry = (key) => {
  if (cache.hasOwnProperty(key)) {
    cache[key] = null
  }
}

/**
 * Check if cache entry is valid
 * @param {Object} cacheEntry - Cache entry to check
 * @returns {boolean} - Whether cache is valid
 */
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION
}

/**
 * Get authentication token using multiple methods
 * @returns {string|null} - Authentication token or null if not found
 */
const getAuthToken = () => {
  // Method 1: Get from localStorage directly (try multiple keys)
  let token = localStorage.getItem("auth_token")

  // Method 2: If not found, try getting from Zustand store
  if (!token) {
    try {
      const authState = useAuthStore.getState()
      token = authState.token
    } catch (error) {}
  }

  // Method 3: Try the persisted storage key that Zustand might use
  if (!token) {
    try {
      const persistedAuth = localStorage.getItem("ramesh-auth-storage")
      if (persistedAuth) {
        const parsed = JSON.parse(persistedAuth)
        token = parsed.state?.token || parsed.token
      }
    } catch (error) {}
  }

  return token
}

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - API response
 */
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication token not found")
    }

    // Prepare headers - only add Authorization, preserve other headers
    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      error.status = response.status
      error.errors = errorData.errors
      throw error
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Profile API request failed for ${endpoint}:`, error)
    throw error
  }
}

export const profileService = {
  /**
   * Get user profile
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} - Profile data
   */
  async getProfile(forceRefresh = false) {
    const cacheKey = "profile"

    // Check cache first
    if (!forceRefresh && isCacheValid(cache[cacheKey])) {
      return cache[cacheKey].data
    }

    try {
      const response = await makeRequest("/user/profile")
      const data = response.data

      // Cache the response
      cache[cacheKey] = {
        data,
        timestamp: Date.now(),
      }

      return data
    } catch (error) {
      if (error.status === 404) {
        throw new Error("Profile not found")
      }
      throw new Error(error.message || "Failed to fetch profile")
    }
  },

  /**
   * Create user profile
   * @param {Object|FormData} profileData - Profile data
   * @returns {Promise<Object>} - Created profile data
   */
  async createProfile(profileData) {
    try {
      const options = {
        method: "POST",
        body: profileData,
      }

      // Handle FormData for multipart upload - DON'T set Content-Type
      if (profileData instanceof FormData) {
        // Let browser set Content-Type with boundary automatically
        options.headers = {}
      } else {
        // Handle JSON data
        options.headers = {
          "Content-Type": "application/json",
        }
        options.body = JSON.stringify(profileData)
      }

      const response = await makeRequest("/user/profile", options)

      // Check for error status in the response
      if (response.status === "error") {
        const error = new Error(response.message || "Failed to create profile")
        if (response.message?.includes("Email is already in use")) {
          error.code = "EMAIL_IN_USE"
        }
        throw error
      }

      const data = response.data

      // Clear cache to force refresh
      clearCacheEntry("profile")
      clearCacheEntry("completeness")

      return data
    } catch (error) {
      if (error.status === 409 || error.code === "EMAIL_IN_USE" || error.message?.includes("Email is already in use")) {
        const emailError = new Error("Email is already in use")
        emailError.code = "EMAIL_IN_USE"
        throw emailError
      }
      if (error.status === 400) {
        const validationError = new Error(error.message || "Validation failed")
        validationError.errors = error.errors || {}
        validationError.status = 400
        throw validationError
      }
      throw new Error(error.message || "Failed to create profile")
    }
  },

  /**
   * Update user profile
   * @param {Object|FormData} updates - Profile updates
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateProfile(updates) {
    try {
      const options = {
        method: "PUT",
        body: updates,
      }

      // Handle FormData for multipart upload - DON'T set Content-Type
      if (updates instanceof FormData) {
        // Let browser set Content-Type with boundary automatically
        options.headers = {}
      } else {
        // Handle JSON data
        options.headers = {
          "Content-Type": "application/json",
        }
        options.body = JSON.stringify(updates)
      }

      const response = await makeRequest("/user/profile", options)

      // Check for error status in the response
      if (response.status === "error") {
        const error = new Error(response.message || "Failed to update profile")
        if (response.message?.includes("Email is already in use")) {
          error.code = "EMAIL_IN_USE"
        }
        throw error
      }

      const data = response.data

      // Clear cache to force refresh
      clearCacheEntry("profile")
      clearCacheEntry("completeness")

      return data
    } catch (error) {
      if (error.status === 404) {
        throw new Error("Profile not found")
      }
      if (error.status === 409 || error.code === "EMAIL_IN_USE" || error.message?.includes("Email is already in use")) {
        const emailError = new Error("Email is already in use")
        emailError.code = "EMAIL_IN_USE"
        throw emailError
      }
      if (error.status === 400) {
        const validationError = new Error(error.message || "Validation failed")
        validationError.errors = error.errors || {}
        validationError.status = 400
        throw validationError
      }
      throw new Error(error.message || "Failed to update profile")
    }
  },

  /**
   * Check profile completeness
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} - Completeness data
   */
  async checkCompleteness(forceRefresh = false) {
    const cacheKey = "completeness"

    // Check cache first
    if (!forceRefresh && isCacheValid(cache[cacheKey])) {
      return cache[cacheKey].data
    }

    try {
      const response = await makeRequest("/user/profile/completion")
      const data = response.data

      // Cache the response
      cache[cacheKey] = {
        data,
        timestamp: Date.now(),
      }

      return data
    } catch (error) {
      throw new Error(error.message || "Failed to check profile completeness")
    }
  },

  /**
   * Get user addresses
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} - Addresses data with meta
   */
  async getAddresses(forceRefresh = false) {
    const cacheKey = "addresses"

    // Check cache first
    if (!forceRefresh && isCacheValid(cache[cacheKey])) {
      return cache[cacheKey].data
    }

    try {
      const response = await makeRequest("/user/addresses")

      // Cache the full response
      cache[cacheKey] = {
        data: response,
        timestamp: Date.now(),
      }

      return response
    } catch (error) {
      throw new Error(error.message || "Failed to fetch addresses")
    }
  },

  /**
   * Get address by ID
   * @param {string|number} addressId - Address ID
   * @returns {Promise<Object>} - Address data
   */
  async getAddressById(addressId) {
    try {
      const response = await makeRequest(`/user/addresses/${addressId}`)
      return response.data
    } catch (error) {
      if (error.status === 404) {
        throw new Error("Address not found")
      }
      throw new Error(error.message || "Failed to fetch address")
    }
  },

  /**
   * Get default address
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} - Default address data
   */
  async getDefaultAddress(forceRefresh = false) {
    const cacheKey = "defaultAddress"

    // Check cache first
    if (!forceRefresh && isCacheValid(cache[cacheKey])) {
      return cache[cacheKey].data
    }

    try {
      const response = await makeRequest("/user/addresses/default/get")
      const data = response.data

      // Cache the response
      cache[cacheKey] = {
        data,
        timestamp: Date.now(),
      }

      return data
    } catch (error) {
      if (error.status === 404) {
        throw new Error("No default address found")
      }
      throw new Error(error.message || "Failed to fetch default address")
    }
  },

  /**
   * Get address limits
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} - Address limits data
   */
  async getAddressLimits(forceRefresh = false) {
    const cacheKey = "addressLimits"

    // Check cache first
    if (!forceRefresh && isCacheValid(cache[cacheKey])) {
      return cache[cacheKey].data
    }

    try {
      const response = await makeRequest("/user/addresses/limits/info")
      const data = response.data

      // Cache the response
      cache[cacheKey] = {
        data,
        timestamp: Date.now(),
      }

      return data
    } catch (error) {
      throw new Error(error.message || "Failed to fetch address limits")
    }
  },

  /**
   * Create new address
   * @param {Object} addressData - Address data
   * @returns {Promise<Object>} - Created address data
   */
  async createAddress(addressData) {
    try {
      const response = await makeRequest("/user/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      })

      // Clear address-related cache
      clearCacheEntry("addresses")
      clearCacheEntry("defaultAddress")

      return response.data
    } catch (error) {
      if (error.status === 400) {
        const validationError = new Error(error.message || "Validation failed")
        validationError.errors = error.errors || {}
        validationError.status = 400
        throw validationError
      }
      if (error.status === 409) {
        throw new Error(error.message || "Address limit exceeded")
      }
      throw new Error(error.message || "Failed to create address")
    }
  },

  /**
   * Update address
   * @param {string|number} addressId - Address ID
   * @param {Object} updates - Address updates
   * @returns {Promise<Object>} - Updated address data
   */
  async updateAddress(addressId, updates) {
    try {
      const response = await makeRequest(`/user/addresses/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      // Clear address-related cache
      clearCacheEntry("addresses")
      clearCacheEntry("defaultAddress")

      return response.data
    } catch (error) {
      if (error.status === 404) {
        throw new Error("Address not found")
      }
      if (error.status === 400) {
        const validationError = new Error(error.message || "Validation failed")
        validationError.errors = error.errors || {}
        validationError.status = 400
        throw validationError
      }
      throw new Error(error.message || "Failed to update address")
    }
  },

  /**
   * Delete address
   * @param {string|number} addressId - Address ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteAddress(addressId) {
    try {
      await makeRequest(`/user/addresses/${addressId}`, {
        method: "DELETE",
      })

      // Clear address-related cache
      clearCacheEntry("addresses")
      clearCacheEntry("defaultAddress")

      return true
    } catch (error) {
      if (error.status === 404) {
        throw new Error("Address not found")
      }
      if (error.status === 409) {
        throw new Error(error.message || "Cannot delete default address")
      }
      throw new Error(error.message || "Failed to delete address")
    }
  },

  /**
   * Set default address
   * @param {string|number} addressId - Address ID
   * @returns {Promise<Object>} - Updated default address data
   */
  async setDefaultAddress(addressId) {
    try {
      const response = await makeRequest(`/user/addresses/${addressId}/default`, {
        method: "PUT",
      })

      // Clear address-related cache
      clearCacheEntry("addresses")
      clearCacheEntry("defaultAddress")

      return response.data
    } catch (error) {
      if (error.status === 404) {
        throw new Error("Address not found")
      }
      throw new Error(error.message || "Failed to set default address")
    }
  },

  /**
   * Get order history
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} - Order history data
   */
  async getOrderHistory(page = 1, limit = 10, forceRefresh = false) {
    const cacheKey = `orders_${page}_${limit}`

    // Check cache first
    if (!forceRefresh && cache.orders && cache.orders[cacheKey] && isCacheValid(cache.orders[cacheKey])) {
      return cache.orders[cacheKey].data
    }

    try {
      const response = await makeRequest(`/orders?page=${page}&limit=${limit}`)
      const data = response.data || { orders: [], pagination: { total: 0, page, limit, total_pages: 1 } }

      // Initialize orders cache if needed
      if (!cache.orders) {
        cache.orders = {}
      }

      // Cache the response
      cache.orders[cacheKey] = {
        data,
        timestamp: Date.now(),
      }

      return data
    } catch (error) {
      // Return empty data if orders endpoint doesn't exist yet
      console.warn("Orders endpoint not available:", error.message)
      return { orders: [], pagination: { total: 0, page, limit, total_pages: 1 } }
    }
  },
}
