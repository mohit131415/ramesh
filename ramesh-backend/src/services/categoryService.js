import api from "./api"
import { toast } from "react-toastify"

// Helper function to format image URL
const formatImageUrl = (imagePath) => {
  if (!imagePath) return null

  // If the path already includes http or https, return as is
  if (imagePath.startsWith("http")) {
    return imagePath
  }

  // If the path already starts with /imageapi, return as is
  if (imagePath.startsWith("/imageapi")) {
    return imagePath
  }

  // If the path starts with uploads/, prepend the /imageapi/api/public/
  if (imagePath.startsWith("uploads/")) {
    return `/imageapi/api/public/${imagePath}`
  }

  // Otherwise, prepend the /imageapi/api/public/
  return `/imageapi/api/public/${imagePath}`
}

// Helper function to format category data including new is_takeaway field
const formatCategoryData = (category) => {
  return {
    ...category,
    image_url: category.image ? formatImageUrl(category.image) : null,
    is_takeaway: category.is_takeaway === 1 || category.is_takeaway === true, // Normalize boolean
  }
}

const categoryService = {
  // Get all categories with optional filtering
  getAllCategories: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()

      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
          queryParams.append(key, filters[key])
        }
      })

      const queryString = queryParams.toString()
      const url = queryString ? `/categories?${queryString}` : "/categories"

      const response = await api.get(url)

      // Format image URLs in the response
      if (response.data?.status === "success" && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          response.data.data = response.data.data.map((category) => ({
            ...category,
            image_url: category.image ? formatImageUrl(category.image) : null,
            is_takeaway: category.is_takeaway === 1 || category.is_takeaway === true, // Normalize boolean
          }))
        }
      }

      return response.data
    } catch (error) {
      // Check for token expiration
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Token has expired")
      ) {
        // Clear local storage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Show toast notification
        toast.error("Your session has expired. Please log in again.")

        // Redirect to login page
        window.location.href = "/login"

        return {
          status: "error",
          message: "Session expired",
          data: null,
        }
      }

      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  // Get category tree with optional filtering
  getCategoryTree: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()

      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
          queryParams.append(key, filters[key])
        }
      })

      const queryString = queryParams.toString()
      const url = queryString ? `/categories/tree?${queryString}` : "/categories/tree"

      const response = await api.get(url)

      // Format image URLs in the response
      if (response.data?.status === "success" && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          response.data.data = response.data.data.map((category) => ({
            ...category,
            image_url: category.image ? formatImageUrl(category.image) : null,
            is_takeaway: category.is_takeaway === 1 || category.is_takeaway === true, // Normalize boolean
            // Format subcategory images if they exist
            subcategories: Array.isArray(category.subcategories)
              ? category.subcategories.map((subcategory) => ({
                  ...subcategory,
                  image_url: subcategory.image ? formatImageUrl(subcategory.image) : null,
                }))
              : category.subcategories,
          }))
        }
      }

      return response.data
    } catch (error) {
      // Check for token expiration
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Token has expired")
      ) {
        // Clear local storage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Show toast notification
        toast.error("Your session has expired. Please log in again.")

        // Redirect to login page
        window.location.href = "/login"

        return {
          status: "error",
          message: "Session expired",
          data: null,
        }
      }

      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  // Get a specific category by ID
  getCategory: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`)

      // Format image URL in the response
      if (response.data?.status === "success" && response.data?.data) {
        response.data.data = {
          ...response.data.data,
          image_url: response.data.data.image ? formatImageUrl(response.data.data.image) : null,
          is_takeaway: response.data.data.is_takeaway === 1 || response.data.data.is_takeaway === true, // Normalize boolean
        }
      }

      return response.data
    } catch (error) {
      // Check for token expiration
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Token has expired")
      ) {
        // Clear local storage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Show toast notification
        toast.error("Your session has expired. Please log in again.")

        // Redirect to login page
        window.location.href = "/login"

        return {
          status: "error",
          message: "Session expired",
          data: null,
        }
      }

      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  // Create a new category
  createCategory: async (categoryData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData()

      // Add all fields to FormData
      Object.keys(categoryData).forEach((key) => {
        if (categoryData[key] !== undefined && categoryData[key] !== null) {
          // Handle file upload separately
          if (key === "image" && categoryData[key] instanceof File) {
            formData.append(key, categoryData[key])
          } else if (key === "is_takeaway") {
            // Convert boolean to integer for API
            formData.append(key, categoryData[key] ? "1" : "0")
          } else if (key !== "image" || typeof categoryData[key] === "string") {
            formData.append(key, categoryData[key])
          }
        }
      })

      const response = await api.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      // Check for token expiration
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Token has expired")
      ) {
        // Clear local storage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Show toast notification
        toast.error("Your session has expired. Please log in again.")

        // Redirect to login page
        window.location.href = "/login"

        return {
          status: "error",
          message: "Session expired",
          data: null,
        }
      }

      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  // Update an existing category
  updateCategory: async (id, categoryData) => {
    try {
      // If categoryData is already a FormData object, use it directly
      let formData
      if (categoryData instanceof FormData) {
        formData = categoryData

        // Make sure _method is set
        if (!formData.has("_method")) {
          formData.append("_method", "PUT")
        }
      } else {
        // Create FormData for file upload
        formData = new FormData()

        // Add method override for PUT
        formData.append("_method", "PUT")

        // Add all fields to FormData
        Object.keys(categoryData).forEach((key) => {
          if (categoryData[key] !== undefined && categoryData[key] !== null && categoryData[key] !== "") {
            // Handle file upload separately
            if (key === "image" && categoryData[key] instanceof File) {
              formData.append(key, categoryData[key])
            } else if (key === "is_takeaway") {
              // Convert boolean to integer for API
              formData.append(key, categoryData[key] ? "1" : "0")
            } else if (key !== "image" || typeof categoryData[key] === "string") {
              formData.append(key, categoryData[key])
            }
          }
        })

        // Explicitly handle image removal
        if (categoryData.remove_image) {
          formData.append("remove_image", "1")
        }
      }

      // Log what we're sending
      console.log("Updating category with ID:", id)
      console.log("FormData contents:")
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + (pair[0] === "image" ? "File object" : pair[1]))
      }

      const response = await api.post(`/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error("Category update error:", error)
      console.error("Error response:", error.response)

      // Check for token expiration
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Token has expired")
      ) {
        // Clear local storage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Show toast notification
        toast.error("Your session has expired. Please log in again.")

        // Redirect to login page
        window.location.href = "/login"

        return {
          status: "error",
          message: "Session expired",
          data: null,
        }
      }

      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`)

      return response.data
    } catch (error) {
      // Check for token expiration
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Token has expired")
      ) {
        // Clear local storage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Show toast notification
        toast.error("Your session has expired. Please log in again.")

        // Redirect to login page
        window.location.href = "/login"

        return {
          status: "error",
          message: "Session expired",
          data: null,
        }
      }

      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  // Restore a deleted category (super admin only)
  restoreCategory: async (id) => {
    try {
      const response = await api.post(`/categories/${id}/restore`)

      return response.data
    } catch (error) {
      // Check for token expiration
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Token has expired")
      ) {
        // Clear local storage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Show toast notification
        toast.error("Your session has expired. Please log in again.")

        // Redirect to login page
        window.location.href = "/login"

        return {
          status: "error",
          message: "Session expired",
          data: null,
        }
      }

      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },
  // Get all categories (fetches all pages)
  getAllCategoriesAtOnce: async (filters = {}) => {
    try {
      // First get the first page to determine total pages
      const initialResponse = await categoryService.getAllCategories({
        ...filters,
        page: 1,
        limit: 100, // Use a larger limit to reduce number of requests
      })

      if (initialResponse.status !== "success") {
        return initialResponse
      }

      const totalPages = initialResponse.meta?.total_pages || 1

      // If only one page, return the result
      if (totalPages === 1) {
        return initialResponse
      }

      // Otherwise, fetch all remaining pages
      const pageRequests = []
      for (let page = 2; page <= totalPages; page++) {
        pageRequests.push(
          categoryService.getAllCategories({
            ...filters,
            page,
            limit: 100,
          }),
        )
      }

      // Wait for all requests to complete
      const results = await Promise.all(pageRequests)

      // Combine all categories from all pages
      const allCategories = [
        ...(initialResponse.data || []),
        ...results.flatMap((result) => (result.status === "success" ? result.data || [] : [])),
      ]

      // Return combined result
      return {
        ...initialResponse,
        data: allCategories,
        meta: {
          ...initialResponse.meta,
          current_page: 1,
          total_pages: 1,
          per_page: allCategories.length,
        },
      }
    } catch (error) {
      // Check for token expiration
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("Invalid or expired token") ||
        error.response?.data?.message?.includes("Token has expired")
      ) {
        // Clear local storage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")

        // Show toast notification
        toast.error("Your session has expired. Please log in again.")

        // Redirect to login page
        window.location.href = "/login"

        return {
          status: "error",
          message: "Session expired",
          data: null,
        }
      }

      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },
  getCategoryTree: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams()

      // Add parameters to query string
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
          queryParams.append(key, params[key])
        }
      })

      const response = await api.get(`/categories/tree?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      console.error("Error fetching category tree:", error)
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch category tree",
      }
    }
  },
}

export default categoryService
