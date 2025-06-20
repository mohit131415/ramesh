import api from "./api"

// Get all coupons with optional filtering
export const getCoupons = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add all params to query string
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        queryParams.append(key, params[key])
      }
    })

    const queryString = queryParams.toString()
    const url = queryString ? `/coupons?${queryString}` : "/coupons"

    const response = await api.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching coupons:", error)
    // Return the error response directly without throwing
    return (
      error.response?.data || {
        status: "error",
        message: error.message || "Failed to fetch coupons",
      }
    )
  }
}

// Get a single coupon by ID
export const getCouponById = async (id) => {
  try {
    const response = await api.get(`/coupons/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching coupon details:", error)
    // Return the error response directly without throwing
    return (
      error.response?.data || {
        status: "error",
        message: error.message || "Failed to fetch coupon details",
      }
    )
  }
}

// Get individual coupon statistics
export const getCouponStatistics = async (id, params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add all params to query string
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        queryParams.append(key, params[key])
      }
    })

    const queryString = queryParams.toString()
    const url = queryString ? `/coupons/${id}/statistics?${queryString}` : `/coupons/${id}/statistics`

    const response = await api.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching coupon statistics:", error)
    return (
      error.response?.data || {
        status: "error",
        message: error.message || "Failed to fetch coupon statistics",
      }
    )
  }
}

// Get overall coupons statistics
export const getCouponsOverviewStatistics = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams()

    // Add all params to query string
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        queryParams.append(key, params[key])
      }
    })

    const queryString = queryParams.toString()
    const url = queryString ? `/coupons/statistics/overview?${queryString}` : "/coupons/statistics/overview"

    const response = await api.get(url)
    return response.data
  } catch (error) {
    console.error("Error fetching coupons overview statistics:", error)
    return (
      error.response?.data || {
        status: "error",
        message: error.message || "Failed to fetch coupons overview statistics",
      }
    )
  }
}

// Create a new coupon
export const createCoupon = async (couponData) => {
  try {
    const response = await api.post("/coupons", couponData)
    return response.data
  } catch (error) {
    console.error("Error creating coupon:", error)
    // Return the error response directly without throwing
    return (
      error.response?.data || {
        status: "error",
        message: error.message || "Failed to create coupon",
      }
    )
  }
}

// Update an existing coupon
export const updateCoupon = async (id, couponData) => {
  try {
    const response = await api.put(`/coupons/${id}`, couponData)
    return response.data
  } catch (error) {
    console.error("Error updating coupon:", error)
    // Return the error response directly without throwing
    return (
      error.response?.data || {
        status: "error",
        message: error.message || "Failed to update coupon",
      }
    )
  }
}

// Delete a coupon (soft delete)
export const deleteCoupon = async (id) => {
  try {
    const response = await api.delete(`/coupons/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting coupon:", error)
    // Return the error response directly without throwing
    return (
      error.response?.data || {
        status: "error",
        message: error.message || "Failed to delete coupon",
      }
    )
  }
}

// Restore a previously deleted coupon
export const restoreCoupon = async (id) => {
  try {
    const response = await api.post(`/coupons/${id}/restore`)
    return response.data
  } catch (error) {
    console.error("Error restoring coupon:", error)
    // Return the error response directly without throwing
    return (
      error.response?.data || {
        status: "error",
        message: error.message || "Failed to restore coupon",
      }
    )
  }
}
