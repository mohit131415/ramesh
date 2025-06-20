import axios from "axios"
import useAuthStore from "../store/authStore"

// Use Vite proxy for API calls
const API_BASE_URL = "" // Empty string for relative URLs
const API_TIMEOUT = Number.parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: API_TIMEOUT,
})

// Request interceptor for adding auth token and smart validation
apiClient.interceptors.request.use(
  async (config) => {
    // Try multiple ways to get the token
    let token = null

    // Method 1: Get from localStorage directly
    token = localStorage.getItem("auth_token")

    // Method 2: If not found, try getting from Zustand store
    if (!token) {
      try {
        const authState = useAuthStore.getState()
        token = authState.token
      } catch (error) {
        //console.warn("Could not get token from auth store:", error)
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
        //console.warn("Could not parse persisted auth:", error)
      }
    }

    // Add token to headers if found
    if (token) {
      config.headers.Authorization = `Bearer ${token}`

      // Smart validation for sensitive endpoints
      const sensitiveEndpoints = [
        "/api/api/cart",
        "/api/api/checkout",
        "/api/api/orders",
        "/api/api/profile",
        "/api/api/payment",
      ]

      const isSensitiveEndpoint = sensitiveEndpoints.some((endpoint) => config.url && config.url.includes(endpoint))

      // Validate token for sensitive operations
      if (isSensitiveEndpoint) {
        try {
          const { validateForAction } = useAuthStore.getState()
          const validation = await validateForAction()

          if (!validation.valid) {
            // Token is invalid, reject the request
            return Promise.reject(new Error("Authentication required"))
          }
        } catch (error) {
          // If validation fails, let the request proceed and handle in response interceptor
        }
      }
    }

    // IMPORTANT: Ensure all API calls use the correct double /api/ prefix
    if (config.url && !config.url.startsWith("/api/api/") && config.url.startsWith("/api/")) {
      config.url = config.url.replace("/api/", "/api/api/")
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    // NEW: Check if the response contains an API error in the body
    if (response.data && response.data.status === "error") {
      // Handle specific API errors that indicate authentication issues
      const errorMessage = response.data.message || ""

      // Check for authentication-related errors
      if (
        errorMessage.includes("undefined method") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("token") ||
        errorMessage.includes("unauthorized")
      ) {
        // Clear all possible token storage locations
        localStorage.removeItem("auth_token")
        localStorage.removeItem("ramesh-sweets-cart-synced")

        // Try to logout from auth store
        try {
          const { logout } = useAuthStore.getState()
          logout("Your session has expired. Please sign in again.")
        } catch (storeError) {
          // Silent fail
        }
      }
    }

    return response
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status
      const { status } = error.response

      if (status === 401) {
        // Unauthorized - clear all possible token storage locations
        localStorage.removeItem("auth_token")
        localStorage.removeItem("ramesh-sweets-cart-synced")

        // Try to logout from auth store
        try {
          const { logout } = useAuthStore.getState()
          logout("Your session has expired. Please sign in again.")
        } catch (storeError) {
          // Silent fail
        }
      }
    }

    return Promise.reject(error)
  },
)

// Image URL helper function
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg"

  // Check if it's already a full URL
  if (imagePath.startsWith("http")) return imagePath

  // Handle escaped slashes in the path (replace \/ with /)
  const cleanPath = imagePath.replace(/\\\//g, "/")

  // Use the correct URL structure with Vite proxy
  return `/api/public/${cleanPath}`
}

// Generic API methods
const get = async (endpoint) => {
  try {
    const response = await apiClient.get(`${endpoint}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error)
    throw error
  }
}

const post = async (endpoint, data) => {
  try {
    const response = await apiClient.post(`${endpoint}`, data)
    return response.data
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error)
    throw error
  }
}

const put = async (endpoint, data) => {
  try {
    const response = await apiClient.put(`${endpoint}`, data)
    return response.data
  } catch (error) {
    console.error(`Error putting to ${endpoint}:`, error)
    throw error
  }
}

const del = async (endpoint) => {
  try {
    const response = await apiClient.delete(`${endpoint}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting from ${endpoint}:`, error)
    throw error
  }
}

// Product-related API methods
const fetchProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value)
      }
    })

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    const response = await apiClient.get(`/api/api/public/products${queryString}`)

    return response.data
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error
  }
}

const fetchProductsBySubcategory = async (subcategoryId, params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add all params to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value)
      }
    })

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    const response = await apiClient.get(`/api/api/public/products/subcategory/${subcategoryId}${queryString}`)

    return response.data
  } catch (error) {
    console.error("Error fetching products by subcategory:", error)
    throw error
  }
}

const fetchProductBySlug = async (slug) => {
  try {
    if (!slug) {
      throw new Error("Product slug is required")
    }

    const response = await apiClient.get(`/api/api/public/products/slug/${slug}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error)
    throw error
  }
}

// Search API method
const search = async (query) => {
  try {
    if (!query) {
      throw new Error("Search query is required")
    }

    const response = await apiClient.get(`/api/api/public/search`, {
      params: { q: query },
    })
    return response.data
  } catch (error) {
    console.error(`Error searching for ${query}:`, error)
    throw error
  }
}

// Update the exported api object to include all methods
const api = {
  get: (endpoint) => {
    // Ensure endpoint has the correct double /api/ prefix
    if (endpoint && !endpoint.startsWith("/api/api/") && endpoint.startsWith("/api/")) {
      endpoint = endpoint.replace("/api/", "/api/api/")
    }
    return apiClient.get(endpoint)
  },
  post: (endpoint, data) => {
    // Ensure endpoint has the correct double /api/ prefix
    if (endpoint && !endpoint.startsWith("/api/api/") && endpoint.startsWith("/api/")) {
      endpoint = endpoint.replace("/api/", "/api/api/")
    }
    return apiClient.post(endpoint, data)
  },
  put: (endpoint, data) => {
    // Ensure endpoint has the correct double /api/ prefix
    if (endpoint && !endpoint.startsWith("/api/api/") && endpoint.startsWith("/api/")) {
      endpoint = endpoint.replace("/api/", "/api/api/")
    }
    return apiClient.put(endpoint, data)
  },
  delete: (endpoint) => {
    // Ensure endpoint has the correct double /api/ prefix
    if (endpoint && !endpoint.startsWith("/api/api/") && endpoint.startsWith("/api/")) {
      endpoint = endpoint.replace("/api/", "/api/api/")
    }
    return apiClient.delete(endpoint)
  },
  getImageUrl,
  fetchProducts,
  fetchProductsBySubcategory,
  fetchProductBySlug,
  search,
}

// Add getImageUrl method to apiClient instance for backward compatibility
apiClient.getImageUrl = getImageUrl

// Export the base URL for use in other parts of the application
export const BASE_URL = API_BASE_URL

export default apiClient
export {
  api,
  getImageUrl,
  get,
  post,
  put,
  del as delete,
  fetchProducts,
  fetchProductsBySubcategory,
  fetchProductBySlug,
  search,
}
