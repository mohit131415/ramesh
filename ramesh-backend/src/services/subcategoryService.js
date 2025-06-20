import api from "./api"
import { toast } from "react-toastify"
import { buildImageUrl } from "../config/api.config"

// Helper function to format image URL
const formatImageUrl = (imagePath) => {
  if (!imagePath) return null
  return buildImageUrl(imagePath)
}

const subcategoryService = {
  // Get all subcategories with optional filtering
  getAllSubcategories: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()

      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
          queryParams.append(key, filters[key])
        }
      })

      const queryString = queryParams.toString()
      const url = queryString ? `/subcategories?${queryString}` : "/subcategories"

      const response = await api.get(url)

      // Format image URLs in the response
      if (response.data?.status === "success" && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          response.data.data = response.data.data.map((subcategory) => {
            // First check if it's deleted and override the status
            const isDeleted =
              subcategory.deleted_at !== null && subcategory.deleted_at !== undefined && subcategory.deleted_at !== ""

            return {
              ...subcategory,
              // Override the status field for deleted items
              status: isDeleted ? "deleted" : subcategory.status,
              // Also keep the isDeleted flag for components that check it directly
              isDeleted: isDeleted,
              image_url: subcategory.image ? formatImageUrl(subcategory.image) : null,
            }
          })
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

  // Get a specific subcategory by ID
  getSubcategory: async (id) => {
    try {
      const response = await api.get(`/subcategories/${id}`)

      // Format image URL in the response
      if (response.data?.status === "success" && response.data?.data) {
        response.data.data = {
          ...response.data.data,
          image_url: response.data.data.image ? formatImageUrl(response.data.data.image) : null,
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

  // Create a new subcategory
  createSubcategory: async (subcategoryData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData()

      // Add all fields to FormData
      Object.keys(subcategoryData).forEach((key) => {
        if (subcategoryData[key] !== undefined && subcategoryData[key] !== null) {
          // Handle file upload separately
          if (key === "image" && subcategoryData[key] instanceof File) {
            formData.append(key, subcategoryData[key])
          } else if (key !== "image" || typeof subcategoryData[key] === "string") {
            formData.append(key, subcategoryData[key])
          }
        }
      })

      const response = await api.post("/subcategories", formData, {
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

  // Update an existing subcategory
  updateSubcategory: async (id, subcategoryData) => {
    try {
      // If subcategoryData is already a FormData object, use it directly
      let formData
      if (subcategoryData instanceof FormData) {
        formData = subcategoryData

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
        Object.keys(subcategoryData).forEach((key) => {
          if (subcategoryData[key] !== undefined && subcategoryData[key] !== null && subcategoryData[key] !== "") {
            // Handle file upload separately
            if (key === "image" && subcategoryData[key] instanceof File) {
              formData.append(key, subcategoryData[key])
            } else if (key !== "image" || typeof subcategoryData[key] === "string") {
              formData.append(key, subcategoryData[key])
            }
          }
        })

        // Explicitly handle image removal
        if (subcategoryData.remove_image) {
          formData.append("remove_image", "1")
        }
      }

      // Log what we're sending
      console.log("Updating subcategory with ID:", id)
      console.log("FormData contents:")
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + (pair[0] === "image" ? "File object" : pair[1]))
      }

      const response = await api.post(`/subcategories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      console.error("Subcategory update error:", error)
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

  // Delete a subcategory
  deleteSubcategory: async (id) => {
    try {
      const response = await api.delete(`/subcategories/${id}`)

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

  // Restore a deleted subcategory (super admin only)
  restoreSubcategory: async (id) => {
    try {
      const response = await api.post(`/subcategories/${id}/restore`)

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

  // Get subcategories by category
  getSubcategoriesByCategory: async (categoryId, params = {}) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams()

      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
          queryParams.append(key, params[key])
        }
      })

      const queryString = queryParams.toString()
      const url = queryString
        ? `/categories/${categoryId}/subcategories?${queryString}`
        : `/categories/${categoryId}/subcategories`

      const response = await api.get(url)

      // Format image URLs in the response
      if (response.data?.status === "success" && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          response.data.data = response.data.data.map((subcategory) => ({
            ...subcategory,
            image_url: subcategory.image ? formatImageUrl(subcategory.image) : null,
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

  /**
   * Get all subcategories with category information
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - Response with subcategories and their categories
   */
  getAllSubcategoriesWithCategories: async (filters = {}) => {
    try {
      // Add include_category parameter to get category information
      const queryParams = new URLSearchParams({
        ...filters,
        include_category: true,
      }).toString()

      const response = await api.get(`/subcategories?${queryParams}`)
      return response.data
    } catch (error) {
      console.error("Error fetching subcategories with categories:", error)
      return {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch subcategories",
        data: [],
      }
    }
  },
}

// Add the following function to the subcategoryService.js file:

// Restore a deleted subcategory
export const restoreSubcategory = async (id) => {
  try {
    const response = await api.patch(`/subcategories/${id}/restore`)
    return response.data
  } catch (error) {
    throw error
  }
}

export default subcategoryService
