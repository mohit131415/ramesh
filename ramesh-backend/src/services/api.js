import axios from "axios"
import { toast } from "react-toastify"

// Add a caching utility at the top of the file
const API_CACHE = {
  data: {},
  timestamps: {},
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds

  // Get cached data if it exists and is not expired
  get: function (key) {
    const data = this.data[key]
    const timestamp = this.timestamps[key]

    if (!data || !timestamp) return null

    const now = Date.now()
    if (now - timestamp > this.CACHE_DURATION) {
      // Cache expired, clear it
      delete this.data[key]
      delete this.timestamps[key]
      return null
    }

    return data
  },

  // Set data in cache
  set: function (key, data) {
    this.data[key] = data
    this.timestamps[key] = Date.now()
  },

  // Clear specific cache entry
  clear: function (key) {
    delete this.data[key]
    delete this.timestamps[key]
  },

  // Clear all cache
  clearAll: function () {
    this.data = {}
    this.timestamps = {}
  },
}

// Token management system
const TokenManager = {
  // Constants
  TOKEN_STORAGE_KEY: "accessToken",
  REFRESH_TOKEN_STORAGE_KEY: "refreshToken",
  TOKEN_EXPIRY_KEY: "tokenExpiry",

  // State
  isRefreshing: false,
  refreshSubscribers: [],
  isValidating: false,
  validationPromise: null,

  // Get the stored token
  getToken: function () {
    return localStorage.getItem(this.TOKEN_STORAGE_KEY)
  },

  // Get the stored refresh token
  getRefreshToken: function () {
    return localStorage.getItem(this.REFRESH_TOKEN_STORAGE_KEY)
  },

  // Get token expiry timestamp
  getTokenExpiry: function () {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
    return expiry ? Number.parseInt(expiry, 10) : 0
  },

  // Set tokens and expiry
  setTokens: function (accessToken, refreshToken, expiresIn = 14400) {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_STORAGE_KEY, refreshToken)
    }

    // Calculate expiry time (current time + expiresIn seconds - 5 minute buffer)
    const expiryTime = Date.now() + (expiresIn - 300) * 1000
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString())
  },

  // Clear all tokens
  clearTokens: function () {
    localStorage.removeItem(this.TOKEN_STORAGE_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
    this.isRefreshing = false
    this.refreshSubscribers = []
    this.isValidating = false
    this.validationPromise = null
  },

  // Subscribe to token refresh
  subscribeTokenRefresh: function (callback) {
    this.refreshSubscribers.push(callback)
  },

  // Notify all subscribers about the new token
  notifySubscribers: function (token) {
    this.refreshSubscribers.forEach((callback) => {
      try {
        callback(token)
      } catch (error) {
        // console.error("Error in refresh subscriber:", error)
      }
    })
    this.refreshSubscribers = []
  },

  // Validate the current token with server
  validateToken: async function () {
    const token = this.getToken()
    if (!token) return false

    // If validation is already in progress, wait for it
    if (this.isValidating && this.validationPromise) {
      // console.log("Token validation already in progress, waiting...")
      return this.validationPromise
    }

    this.isValidating = true
    this.validationPromise = this._performValidation(token)

    try {
      const result = await this.validationPromise
      return result
    } finally {
      this.isValidating = false
      this.validationPromise = null
    }
  },

  // Perform the actual validation
  _performValidation: async (token) => {
    try {
      // console.log("Validating token with server...")

      const response = await axios.post(
        "/api/auth/validate",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const isValid = response.data.status === "success" && response.data.data?.valid === true

      // if (isValid) {
      //   console.log("Token validation successful - token is valid")
      // } else {
      //   console.log("Token validation failed - server says invalid")
      // }

      return isValid
    } catch (error) {
      // console.log("Token validation failed - network/server error:", error.message)
      return false
    }
  },

  // Refresh the token
  refreshToken: async function () {
    // If already refreshing, wait for the current refresh to complete
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.subscribeTokenRefresh((token) => {
          if (token) {
            resolve(token)
          } else {
            reject(new Error("Token refresh failed"))
          }
        })
      })
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      this.clearTokens()
      throw new Error("No refresh token available")
    }

    this.isRefreshing = true

    try {
      // console.log("Refreshing token...")

      const response = await axios.post("/api/auth/refresh", {
        refresh_token: refreshToken,
      })

      if (response.data.status === "success") {
        const { access_token, refresh_token, expires_in } = response.data.data

        // Store the new tokens
        this.setTokens(access_token, refresh_token, expires_in)

        // Notify subscribers
        this.notifySubscribers(access_token)

        // console.log("Token refreshed successfully")
        return access_token
      } else {
        this.notifySubscribers(null)
        this.clearTokens()
        throw new Error(response.data.message || "Token refresh failed")
      }
    } catch (error) {
      // console.error("Token refresh failed:", error)
      this.notifySubscribers(null)
      this.clearTokens()
      throw error
    } finally {
      this.isRefreshing = false
    }
  },

  // Get a valid token (validate first, then refresh if needed)
  getValidToken: async function () {
    const currentToken = this.getToken()
    if (!currentToken) {
      this.clearTokens()
      return null
    }

    // First validate the token
    const isValid = await this.validateToken()

    if (isValid) {
      return currentToken
    }

    // If validation fails, try to refresh
    try {
      const newToken = await this.refreshToken()
      return newToken
    } catch (error) {
      // console.error("Failed to refresh token:", error)
      this.handleTokenExpiration()
      throw error
    }
  },

  // Handle token expiration
  handleTokenExpiration: function () {
    // console.log("Handling token expiration")

    // Clear tokens and state
    this.clearTokens()

    // Clear user data
    localStorage.removeItem("user")

    // Show notification
    toast.error("Your session has expired. Please log in again.", {
      position: "top-center",
      autoClose: 3000,
    })

    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "/login"
    }, 1000)
  },
}

// Flag to determine if we're on the activity logs page
const isActivityLogsPage = () => {
  return window.location.pathname.includes("/activities") || window.location.pathname.includes("/activity-logs")
}

// Create an axios instance with the correct base URL
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map()

// Modify the api instance to include caching for GET requests and prevent duplicates
const originalGet = api.get
api.get = async function (url, config = {}) {
  // Skip cache if explicitly requested
  if (config.skipCache) {
    return originalGet.call(this, url, config)
  }

  // Generate cache key from URL and any params
  const params = config.params ? JSON.stringify(config.params) : ""
  const cacheKey = `${url}${params}`
  const requestKey = `GET:${cacheKey}`

  // Check if the same request is already ongoing
  if (ongoingRequests.has(requestKey)) {
    // console.log(`Duplicate request detected for ${url}, waiting for ongoing request...`)
    return ongoingRequests.get(requestKey)
  }

  // Check cache first
  const cachedData = API_CACHE.get(cacheKey)
  if (cachedData) {
    // console.log(`Using cached data for ${url}`)
    return Promise.resolve(cachedData)
  }

  // If not in cache and not ongoing, make the request
  const requestPromise = originalGet
    .call(this, url, config)
    .then((response) => {
      // Cache the response
      API_CACHE.set(cacheKey, response)
      return response
    })
    .finally(() => {
      // Remove from ongoing requests when done
      ongoingRequests.delete(requestKey)
    })

  // Store the ongoing request
  ongoingRequests.set(requestKey, requestPromise)

  return requestPromise
}

// Add a method to clear cache when needed (e.g., after POST/PUT/DELETE operations)
api.clearCache = (urlPattern = null) => {
  if (urlPattern) {
    // Clear specific cache entries that match the pattern
    Object.keys(API_CACHE.data).forEach((key) => {
      if (key.includes(urlPattern)) {
        API_CACHE.clear(key)
      }
    })
  } else {
    // Clear all cache
    API_CACHE.clearAll()
  }
}

// Modify the POST, PUT, DELETE methods to clear relevant cache
const originalPost = api.post
api.post = async function (url, data, config = {}) {
  try {
    const response = await originalPost.call(this, url, data, config)
    // Clear cache for related endpoints
    api.clearCache(url.split("/").slice(0, -1).join("/"))
    return response
  } catch (error) {
    throw error
  }
}

const originalPut = api.put
api.put = async function (url, data, config = {}) {
  try {
    const response = await originalPut.call(this, url, data, config)
    // Clear cache for related endpoints
    api.clearCache(url.split("/").slice(0, -1).join("/"))
    return response
  } catch (error) {
    throw error
  }
}

const originalDelete = api.delete
api.delete = async function (url, config = {}) {
  try {
    const response = await originalDelete.call(this, url, config)
    // Clear cache for related endpoints
    api.clearCache(url.split("/").slice(0, -1).join("/"))
    return response
  } catch (error) {
    throw error
  }
}

// Add a request interceptor to validate token before every API call
api.interceptors.request.use(
  async (config) => {
    // Skip activity logs check if not on activity page
    if (!isActivityLogsPage() && (config.url.includes("/activities") || config.url.includes("/activity-logs"))) {
      const mockResponse = {
        status: 200,
        data: {
          status: "success",
          data: [],
          message: "Skipped API call - not on activity logs page",
        },
      }
      return Promise.resolve(mockResponse)
    }

    // Skip token validation for auth endpoints
    if (
      config.url &&
      (config.url.includes("/auth/login") ||
        config.url.includes("/auth/refresh") ||
        config.url.includes("/auth/validate"))
    ) {
      return config
    }

    try {
      // Get a valid token (this will validate and refresh if needed)
      const token = await TokenManager.getValidToken()

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      } else {
        // If we couldn't get a valid token, handle expiration
        TokenManager.handleTokenExpiration()
        return Promise.reject(new Error("No valid token available"))
      }
    } catch (error) {
      // console.error("Error getting valid token:", error)
      TokenManager.handleTokenExpiration()
      return Promise.reject(error)
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to handle token errors (backup in case validation missed something)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Check for token expiration error
    const isTokenExpired =
      error.response?.status === 401 ||
      error.response?.data?.message?.includes("Invalid or expired token") ||
      error.response?.data?.message?.includes("Token has expired") ||
      error.response?.data?.message?.includes("Unauthenticated")

    if (isTokenExpired && !originalRequest._retry) {
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true

      try {
        // console.log("Got 401 error despite validation, attempting refresh...")

        // Try to refresh the token
        const newToken = await TokenManager.refreshToken()

        if (newToken) {
          // Update the request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          // Retry the original request
          return api(originalRequest)
        }

        // If we reach here, something went wrong
        TokenManager.handleTokenExpiration()
        return Promise.reject(error)
      } catch (refreshError) {
        // console.error("Token refresh failed in response interceptor:", refreshError)
        TokenManager.handleTokenExpiration()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

// Export the TokenManager for use in other files
export const tokenManager = TokenManager

// Export the refreshToken and validateToken functions for backward compatibility
// These should primarily be used for explicit actions, not general API calls
export const refreshToken = async () => {
  try {
    await TokenManager.refreshToken()
    return true
  } catch (error) {
    return false
  }
}

export const validateToken = async () => {
  return TokenManager.validateToken()
}

export default api
