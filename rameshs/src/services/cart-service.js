// Cart Service - Handles all API calls related to cart functionality
import { BASE_URL } from "./api-client"

// Base URL for API calls - now using centralized BASE_URL
const API_BASE_URL = `${BASE_URL}/api/api/public`

// Local storage keys
const CART_STORAGE_KEY = "ramesh-sweets-cart-items"
const CART_COUPONS_KEY = "ramesh-sweets-cart-coupons"
const CART_SYNCED_FLAG = "ramesh-sweets-cart-synced"
const AUTH_STORAGE_KEY = "ramesh-auth-storage" // Zustand persist storage key

// Cache configuration
const cache = new Map()
const cacheTimestamps = new Map()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes for cart data (shorter than other services)

/**
 * Check if cache entry is valid
 * @param {string} cacheKey - The cache key to check
 * @returns {boolean} - Whether the cache is valid
 */
const isCacheValid = (cacheKey) => {
  const timestamp = cacheTimestamps.get(cacheKey)
  if (!timestamp) return false
  return Date.now() - timestamp < CACHE_DURATION
}

/**
 * Clear specific cache entry
 * @param {string} cacheKey - The cache key to clear
 */
const clearCacheEntry = (cacheKey) => {
  cache.delete(cacheKey)
  cacheTimestamps.delete(cacheKey)
}

/**
 * Clear all cart cache
 */
const clearCartCache = () => {
  cache.clear()
  cacheTimestamps.clear()
}

/**
 * Helper function to get auth token from multiple sources
 * @returns {string|null} - The authentication token or null
 */
const getAuthToken = () => {
  try {
    // Method 1: Direct from localStorage
    let token = localStorage.getItem("auth_token")

    // Method 2: From Zustand persisted storage
    if (!token) {
      const authStorage = localStorage.getItem(AUTH_STORAGE_KEY)
      if (authStorage) {
        const authData = JSON.parse(authStorage)
        token = authData.state?.token || authData.token
      }
    }

    return token
  } catch (error) {
    return null
  }
}

/**
 * Helper function to get user ID from Zustand storage
 * @returns {number|null} - The user ID or null
 */
const getUserId = () => {
  try {
    const authStorage = localStorage.getItem(AUTH_STORAGE_KEY)
    if (authStorage) {
      const authData = JSON.parse(authStorage)
      const userId = authData.state?.user?.id || null
      return userId
    }
  } catch (error) {}
  return null
}

/**
 * Helper function to set up request config with auth
 * @returns {object} - Request configuration object
 */
const getRequestConfig = () => {
  const token = getAuthToken()
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}

/**
 * Check if user is authenticated
 * @returns {boolean} - Whether user is authenticated
 */
const isAuthenticated = () => {
  const token = getAuthToken()
  return !!token
}

/**
 * Centralized request handler for cart API calls
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options
 * @param {string} cacheKey - Cache key for this request
 * @param {boolean} forceRefresh - Whether to bypass cache
 * @returns {Promise<object>} - API response
 */
const makeRequest = async (endpoint, options = {}, cacheKey = null, forceRefresh = false) => {
  const url = `${API_BASE_URL}${endpoint}`

  // Check cache first (only for GET requests)
  if (
    cacheKey &&
    !forceRefresh &&
    options.method !== "POST" &&
    options.method !== "PUT" &&
    options.method !== "DELETE"
  ) {
    if (isCacheValid(cacheKey) && cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }
  }

  try {
    const config = {
      ...getRequestConfig(),
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Cache successful responses (only for GET requests)
    if (cacheKey && (!options.method || options.method === "GET")) {
      cache.set(cacheKey, data)
      cacheTimestamps.set(cacheKey, Date.now())
    }

    // Clear related cache entries for write operations
    if (options.method === "POST" || options.method === "PUT" || options.method === "DELETE") {
      clearCartCache() // Clear all cart cache when cart is modified
    }

    return data
  } catch (error) {
    throw error
  }
}

/**
 * Helper function to get cart items from localStorage
 * @returns {Array} - Array of cart items
 */
const getLocalCartItems = () => {
  try {
    const items = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]")
    return items
  } catch (error) {
    return []
  }
}

/**
 * Helper function to save cart items to localStorage
 * @param {Array} items - Array of cart items to save
 */
const saveLocalCartItems = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

/**
 * Helper function to get applied coupons from localStorage
 * @returns {Array} - Array of applied coupons
 */
const getLocalCoupons = () => {
  try {
    const coupons = JSON.parse(localStorage.getItem(CART_COUPONS_KEY) || "[]")
    return coupons
  } catch (error) {
    return []
  }
}

/**
 * Helper function to save applied coupons to localStorage
 * @param {Array} coupons - Array of coupons to save
 */
const saveLocalCoupons = (coupons) => {
  localStorage.setItem(CART_COUPONS_KEY, JSON.stringify(coupons))
}

/**
 * Helper function to clear all local cart data
 */
const clearLocalCartData = () => {
  localStorage.removeItem(CART_STORAGE_KEY)
  localStorage.removeItem(CART_COUPONS_KEY)
  localStorage.removeItem(CART_SYNCED_FLAG)
}

/**
 * Helper function to check if cart has been synced for this user session
 * @returns {boolean} - Whether cart is synced
 */
const isCartSynced = () => {
  const userId = getUserId()
  if (!userId) return false

  const syncedFlag = localStorage.getItem(CART_SYNCED_FLAG)
  const synced = syncedFlag === userId.toString()
  return synced
}

/**
 * Helper function to mark cart as synced for this user session
 */
const markCartSynced = () => {
  const userId = getUserId()
  if (userId) {
    localStorage.setItem(CART_SYNCED_FLAG, userId.toString())
  }
}

/**
 * Helper function to safely parse price values
 * @param {any} price - Price value to parse
 * @returns {number} - Parsed price as number
 */
const parsePrice = (price) => {
  if (price === undefined || price === null) {
    return 0
  }

  if (typeof price === "number") {
    return price
  }

  if (typeof price === "string") {
    // Remove any non-numeric characters except decimal point
    const cleanedPrice = price.replace(/[^\d.]/g, "")
    return cleanedPrice ? Number.parseFloat(cleanedPrice) : 0
  }

  return 0
}

/**
 * Create empty cart structure
 * @returns {object} - Empty cart data structure
 */
const createEmptyCart = () => ({
  status: "success",
  message: "Cart is empty",
  data: {
    id: null,
    items: [],
    inactive_items: [],
    invalid_items: [],
    coupons: [],
    totals: {
      subtotal: 0,
      base_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      total: 0,
      item_count: 0,
      total_quantity: 0,
      roundoff_amount: 0,
    },
    summary: {
      subtotal: 0,
      discount: 0,
      tax_amount: 0,
      base_amount: 0,
      total: 0,
      total_items: 0,
      total_quantity: 0,
      roundoff_amount: 0,
    },
  },
})

// Cart Service object
const cartService = {
  /**
   * Get cart - uses API when authenticated, local storage when not
   * @param {boolean} forceRefresh - Whether to bypass cache
   * @returns {Promise<object>} - Cart data
   */
  getCart: async (forceRefresh = false) => {
    const cacheKey = isAuthenticated() ? "authenticated_cart" : "local_cart"

    // If user is authenticated, use the /cart endpoint (auth required)
    if (isAuthenticated()) {
      try {
        return await makeRequest("/cart", { method: "GET" }, cacheKey, forceRefresh)
      } catch (error) {
        // Return empty cart structure on error
        return {
          ...createEmptyCart(),
          status: "error",
          message: error.message || "Failed to fetch cart",
        }
      }
    }

    // For non-authenticated users, use the cart/items API (no auth required)
    const items = getLocalCartItems()

    if (items.length === 0) {
      return createEmptyCart()
    }

    try {
      // Use the cart/items API for detailed product information (no auth required)
      const response = await makeRequest(
        "/cart/items",
        {
          method: "POST",
          body: JSON.stringify({
            items: items.map((item) => ({
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
            })),
          }),
        },
        null, // Don't cache POST requests
        forceRefresh,
      )

      // Extract data from API response
      const apiData = response.data
      const apiItems = apiData.items || []
      const inactiveItems = apiData.inactive_items || []
      const invalidItems = apiData.invalid_items || []
      const totals = apiData.totals || {}

      // Filter out invalid items from local storage
      if (invalidItems && invalidItems.length > 0) {
        const validItemIds = new Set(apiItems.map((item) => `${item.product_id}_${item.variant_id}`))
        const updatedItems = items.filter((item) => validItemIds.has(`${item.product_id}_${item.variant_id}`))
        saveLocalCartItems(updatedItems)

        // Show warning for invalid items
        if (window.showToast) {
          window.showToast({
            title: "Some items were removed",
            description: "Some items in your cart are no longer available.",
            type: "warning",
            duration: 5000,
          })
        }
      }

      // Update local items with API data
      const updatedLocalItems = items.map((localItem) => {
        const apiItem = apiItems.find(
          (item) => item.product_id === localItem.product_id && item.variant_id === localItem.variant_id,
        )

        if (apiItem) {
          return {
            ...localItem,
            name: apiItem.name,
            slug: apiItem.slug,
            image: apiItem.image,
            price: apiItem.price,
            tax_rate: apiItem.tax_rate,
          }
        }
        return localItem
      })

      saveLocalCartItems(updatedLocalItems)

      // Format the response to match our expected structure
      return {
        status: "success",
        message: "Cart retrieved successfully",
        data: {
          id: null,
          items: apiItems.map((item) => ({
            id: `local_${item.product_id}_${item.variant_id}`,
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            category: item.category,
            brand: item.brand,
            image: item.image,
            quantity: item.quantity,
            price: parsePrice(item.price),
            price_with_tax: parsePrice(item.price),
            tax_rate: item.tax_rate,
            base_price: item.base_price,
            base_amount: item.base_amount || item.base_price * item.quantity,
            igst_amount: item.tax_amount,
            tax_amount: item.tax_amount,
            line_tax_amount: item.line_tax_amount || item.tax_amount * item.quantity,
            line_total: item.line_total,
            is_active: item.is_active,
            stock_status: item.stock_status,
            current_variant: item.current_variant,
            available_variants: item.available_variants,
            variant_name: item.current_variant?.name,
            original_price: item.original_price,
            discount_percentage: item.discount_percentage,
            discount_amount: item.discount_amount,
            line_discount_amount: item.line_discount_amount,
            min_quantity: item.min_quantity,
            max_quantity: item.max_quantity,
            quantity_status: item.quantity_status,
          })),
          inactive_items: inactiveItems.map((item) => ({
            id: `inactive_${item.product_id}_${item.variant_id}`,
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: item.name,
            slug: item.slug,
            image: item.image,
            quantity: item.quantity,
            price: parsePrice(item.price),
            current_variant: item.current_variant,
            available_variants: item.available_variants,
            variant_name: item.current_variant?.name,
            original_price: item.original_price,
            discount_percentage: item.discount_percentage,
            reason: item.reason,
            stock_status: item.stock_status,
          })),
          invalid_items: invalidItems.map((item) => ({
            id: `invalid_${item.product_id}_${item.variant_id}`,
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: item.name,
            slug: item.slug,
            image: item.image,
            quantity: item.quantity,
            price: parsePrice(item.price),
            current_variant: item.current_variant,
            available_variants: item.available_variants,
            variant_name: item.current_variant?.name,
            original_price: item.original_price,
            reason: item.reason,
          })),
          coupons: getLocalCoupons(),
          totals: {
            subtotal: parsePrice(totals.subtotal) || 0,
            base_amount: parsePrice(totals.base_amount) || 0,
            tax_amount: parsePrice(totals.tax_amount) || 0,
            discount_amount: parsePrice(totals.discount_amount) || 0,
            total: parsePrice(totals.total) || 0,
            item_count: totals.item_count || 0,
            total_quantity: totals.total_quantity || 0,
            roundoff_amount: parsePrice(totals.roundoff_amount) || 0,
          },
          summary: {
            subtotal: parsePrice(totals.subtotal) || 0,
            discount: parsePrice(totals.discount_amount) || 0,
            tax_amount: parsePrice(totals.tax_amount) || 0,
            base_amount: parsePrice(totals.base_amount) || 0,
            total: parsePrice(totals.total) || 0,
            total_items: totals.item_count || 0,
            total_quantity: totals.total_quantity || 0,
            roundoff_amount: parsePrice(totals.roundoff_amount) || 0,
          },
        },
      }
    } catch (error) {
      // Return empty cart structure on error
      return {
        ...createEmptyCart(),
        status: "error",
        message: error.message || "Failed to fetch cart",
      }
    }
  },

  /**
   * Add item to cart
   * @param {number} productId - Product ID
   * @param {number} variantId - Variant ID
   * @param {number} quantity - Quantity to add
   * @param {object} productDetails - Additional product details
   * @returns {Promise<object>} - Updated cart data
   */
  addToCart: async (productId, variantId, quantity = 1, productDetails = {}) => {
    // If user is authenticated, use the /cart/add endpoint (auth required)
    if (isAuthenticated()) {
      try {
        const data = {
          product_id: productId,
          variant_id: variantId,
          quantity: quantity,
        }

        return await makeRequest("/cart/add", {
          method: "POST",
          body: JSON.stringify(data),
        })
      } catch (error) {
        throw error
      }
    }

    // For non-authenticated users, add to local storage
    const items = getLocalCartItems()
    const existingItemIndex = items.findIndex((item) => item.product_id === productId && item.variant_id === variantId)

    if (existingItemIndex !== -1) {
      // Update existing item
      items[existingItemIndex].quantity += quantity
    } else {
      // Add new item with proper variant information
      items.push({
        id: `local_${productId}_${variantId}`,
        product_id: productId,
        variant_id: variantId,
        name: productDetails.name || "Product",
        slug: productDetails.slug || null,
        image: productDetails.image || "",
        quantity: quantity,
        price: productDetails.price || 0,
        tax_rate: productDetails.tax_rate || 5, // Default to 5% if not specified
        variant: productDetails.variant || null,
      })
    }

    // Save to localStorage
    saveLocalCartItems(items)

    // Return the updated cart
    return await cartService.getCart(true) // Force refresh
  },

  /**
   * Update cart item quantity
   * @param {string} itemId - Item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<object>} - Updated cart data
   */
  updateCartItem: async (itemId, quantity) => {
    // If user is authenticated, use the /cart/update endpoint (auth required)
    if (isAuthenticated()) {
      try {
        let productId = null
        let variantId = null

        // Extract product_id and variant_id from itemId
        if (itemId.startsWith("local_")) {
          const parts = itemId.replace("local_", "").split("_")
          if (parts.length === 2) {
            productId = Number.parseInt(parts[0])
            variantId = Number.parseInt(parts[1])
          }
        }

        // For authenticated users, send product_id, variant_id, and quantity
        const data = {
          product_id: productId,
          variant_id: variantId,
          quantity: quantity,
        }

        return await makeRequest("/cart/update", {
          method: "PUT",
          body: JSON.stringify(data),
        })
      } catch (error) {
        throw error
      }
    }

    // For non-authenticated users, update in local storage
    const items = getLocalCartItems()
    let productId, variantId

    // Extract product_id and variant_id from the itemId
    if (itemId.startsWith("local_")) {
      const parts = itemId.replace("local_", "").split("_")
      if (parts.length === 2) {
        productId = Number.parseInt(parts[0])
        variantId = Number.parseInt(parts[1])
      }
    }

    // Find the item by id or by product_id and variant_id
    const itemIndex = items.findIndex(
      (item) =>
        item.id === itemId ||
        (productId && variantId && item.product_id === productId && item.variant_id === variantId),
    )

    if (itemIndex !== -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        items.splice(itemIndex, 1)
      } else {
        // Update quantity
        items[itemIndex].quantity = quantity
      }
      saveLocalCartItems(items)
    }

    // Return the updated cart
    return await cartService.getCart(true) // Force refresh
  },

  /**
   * Remove item from cart
   * @param {string} itemId - Item ID to remove
   * @returns {Promise<object>} - Updated cart data
   */
  removeCartItem: async (itemId) => {
    // If user is authenticated, use the /cart/remove endpoint (auth required)
    if (isAuthenticated()) {
      try {
        let productId = null
        let variantId = null
        let quantity = 1 // Default quantity

        // If itemId is in local format, extract product_id and variant_id
        if (itemId.startsWith("local_")) {
          const parts = itemId.replace("local_", "").split("_")
          if (parts.length === 2) {
            productId = Number.parseInt(parts[0])
            variantId = Number.parseInt(parts[1])
          }
        }

        // Get current cart to find the quantity of the item being removed
        try {
          const currentCartResponse = await makeRequest("/cart", { method: "GET" })
          const currentCart = currentCartResponse.data
          const items = currentCart.items || []

          // Find the item to get its current quantity
          const itemToRemove = items.find((item) => item.product_id === productId && item.variant_id === variantId)

          if (itemToRemove) {
            quantity = itemToRemove.quantity
          }
        } catch (error) {
          // Use default quantity if we can't fetch current cart
        }

        // For authenticated users, we should send product_id, variant_id, and quantity
        const data = {
          product_id: productId,
          variant_id: variantId,
          quantity: quantity,
        }

        return await makeRequest("/cart/remove", {
          method: "DELETE",
          body: JSON.stringify(data),
        })
      } catch (error) {
        throw error
      }
    }

    // For non-authenticated users, remove from local storage
    const items = getLocalCartItems()
    let productId, variantId

    // Extract product_id and variant_id from the itemId
    if (itemId.startsWith("local_")) {
      const parts = itemId.replace("local_", "").split("_")
      if (parts.length === 2) {
        productId = Number.parseInt(parts[0])
        variantId = Number.parseInt(parts[1])
      }
    }

    // Filter out the item by id or by product_id and variant_id
    const updatedItems = items.filter(
      (item) =>
        item.id !== itemId &&
        !(productId && variantId && item.product_id === productId && item.variant_id === variantId),
    )

    saveLocalCartItems(updatedItems)

    // Return the updated cart
    return await cartService.getCart(true) // Force refresh
  },

  /**
   * Get available coupons
   * @param {boolean} forceRefresh - Whether to bypass cache
   * @returns {Promise<object>} - Available coupons
   */
  getAvailableCoupons: async (forceRefresh = false) => {
    // This endpoint requires authentication
    if (!isAuthenticated()) {
      return {
        status: "error",
        message: "Authentication required",
        data: [],
      }
    }

    try {
      return await makeRequest("/cart/coupons", { method: "GET" }, "available_coupons", forceRefresh)
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to fetch coupons",
        data: [],
      }
    }
  },

  /**
   * Validate coupon
   * @param {string} couponCode - Coupon code to validate
   * @param {number} cartTotal - Cart total amount
   * @returns {Promise<object>} - Validation result
   */
  validateCoupon: async (couponCode, cartTotal) => {
    // This endpoint requires authentication
    if (!isAuthenticated()) {
      return {
        status: "error",
        message: "Authentication required",
        data: null,
      }
    }

    try {
      const data = {
        coupon_code: couponCode,
        cart_total: cartTotal,
      }

      return await makeRequest("/cart/coupon/validate", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Invalid coupon code",
        data: null,
      }
    }
  },

  /**
   * Apply coupon to cart
   * @param {string} couponCode - Coupon code to apply
   * @returns {Promise<object>} - Application result
   */
  applyCoupon: async (couponCode) => {
    // This endpoint requires authentication
    if (!isAuthenticated()) {
      return {
        status: "error",
        message: "Authentication required",
        data: null,
      }
    }

    try {
      const data = {
        coupon_code: couponCode,
      }

      return await makeRequest("/cart/coupon/apply", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to apply coupon",
        data: null,
      }
    }
  },

  /**
   * Remove coupon from cart
   * @returns {Promise<object>} - Removal result
   */
  removeCoupon: async () => {
    // This endpoint requires authentication
    if (!isAuthenticated()) {
      return {
        status: "error",
        message: "Authentication required",
        data: null,
      }
    }

    try {
      return await makeRequest("/cart/coupon/remove", { method: "DELETE" })
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to remove coupon",
        data: null,
      }
    }
  },

  /**
   * Sync local cart with server after login and clear local storage
   * @returns {Promise<object>} - Sync result
   */
  syncCartAfterLogin: async () => {
    try {
      // Get the auth token
      const token = getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Get local cart items
      const localItems = getLocalCartItems()

      // Check if cart has already been synced for this user session
      if (isCartSynced()) {
        // Even if already synced, fetch the current cart to ensure we have latest data
        const cartData = await cartService.getCart(true) // Force refresh
        return {
          status: "success",
          message: "Cart already synced",
          success: true,
          data: cartData.data,
        }
      }

      // If local storage is empty, just fetch server cart and mark as synced
      if (!localItems || localItems.length === 0) {
        // Mark cart as synced for this user session
        markCartSynced()

        // Fetch the server cart
        const cartData = await cartService.getCart(true) // Force refresh

        return {
          status: "success",
          message: "No local items to sync, server cart loaded",
          success: true,
          data: cartData.data,
        }
      }

      // Format items for the sync API
      const items = localItems.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      }))

      // Call the sync API to merge local cart with server cart (auth required)
      const syncResponse = await makeRequest("/cart/sync", {
        method: "POST",
        body: JSON.stringify({ items }),
      })

      // Clear local storage cart after successful sync
      clearLocalCartData()

      // Mark cart as synced for this user session
      markCartSynced()

      // After syncing, fetch the updated cart using the /cart endpoint (auth required)
      const updatedCart = await cartService.getCart(true) // Force refresh

      return {
        status: "success",
        message: `Cart synced successfully with ${localItems.length} items`,
        success: true,
        data: updatedCart.data,
      }
    } catch (error) {
      // If sync fails, try to at least fetch the server cart
      try {
        const serverCart = await cartService.getCart(true) // Force refresh

        // Clear local storage since we couldn't sync
        clearLocalCartData()
        markCartSynced() // Mark as synced to prevent retry loops

        return {
          status: "partial_success",
          message: "Sync failed but server cart loaded. Some local items may be lost.",
          success: true, // Still return success so the app continues to work
          data: serverCart.data,
        }
      } catch (fetchError) {
        return {
          status: "error",
          message: error.message || "Failed to sync cart and fetch server data",
          success: false,
          data: null,
        }
      }
    }
  },

  /**
   * Clear cart
   * @returns {Promise<object>} - Clear result
   */
  clearCart: async () => {
    // If user is authenticated, remove items one by one using API
    if (isAuthenticated()) {
      try {
        const cartResponse = await cartService.getCart(true) // Force refresh
        const items = cartResponse.data.items || []

        // Remove each item using API
        for (const item of items) {
          await cartService.removeCartItem(item.id)
        }

        // Remove any applied coupons using API
        try {
          await cartService.removeCoupon()
        } catch (error) {
          // Ignore coupon removal errors if no coupon is applied
        }

        return await cartService.getCart(true) // Force refresh
      } catch (error) {
        throw error
      }
    }

    // For non-authenticated users, clear local storage
    saveLocalCartItems([])
    saveLocalCoupons([])

    return createEmptyCart()
  },

  /**
   * Calculate cart (no auth required) - only used for non-authenticated users
   * @param {Array} items - Cart items
   * @param {string} couponCode - Coupon code (optional)
   * @param {string} shippingPincode - Shipping pincode (optional)
   * @returns {Promise<object>} - Calculation result
   */
  calculateCart: async (items, couponCode = null, shippingPincode = null) => {
    try {
      const data = {
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        coupon_code: couponCode,
        shipping_pincode: shippingPincode,
      }

      return await makeRequest("/cart/calculate", {
        method: "POST",
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw error
    }
  },

  /**
   * Clear cart on logout
   * @returns {Promise<object>} - Clear result
   */
  clearCartOnLogout: async () => {
    try {
      // Clear any sync flags
      localStorage.removeItem(CART_SYNCED_FLAG)

      // Clear local cart data
      clearLocalCartData()

      // Clear all cache
      clearCartCache()

      return createEmptyCart()
    } catch (error) {
      return {
        status: "error",
        message: error.message || "Failed to clear cart on logout",
        data: null,
      }
    }
  },

  // Utility functions
  clearLocalCartData,
  isCartSynced,
  markCartSynced,
  clearCartCache,
  clearCacheEntry,
}

export default cartService
