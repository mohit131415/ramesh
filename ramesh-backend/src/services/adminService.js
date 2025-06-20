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

  // If the path starts directly with uploads, prepend the imageapi path
  if (imagePath.startsWith("uploads/")) {
    return `/imageapi/api/public/${imagePath}`
  }

  // For other paths, ensure they're properly formatted
  return `/imageapi/api/public/${imagePath}`
}

const adminService = {
  // Get all admins with optional filtering
  getAllAdmins: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()

      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
          queryParams.append(key, filters[key])
        }
      })

      const queryString = queryParams.toString()
      const url = queryString ? `/admins?${queryString}` : "/admins"

      const response = await api.get(url)

      // Format image URLs in the response
      if (response.data?.status === "success" && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          response.data.data = response.data.data.map((admin) => ({
            ...admin,
            profile_image_url: admin.profile_image ? formatImageUrl(admin.profile_image) : null,
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

  // Get a specific admin by ID
  getAdmin: async (id) => {
    try {
      const response = await api.get(`/admins/${id}`)

      // Format image URL in the response
      if (response.data?.status === "success" && response.data?.data) {
        response.data.data = {
          ...response.data.data,
          profile_image_url: response.data.data.profile_image ? formatImageUrl(response.data.data.profile_image) : null,
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

  // Create a new admin
  createAdmin: async (adminData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData()

      // Add all fields to FormData
      Object.keys(adminData).forEach((key) => {
        if (adminData[key] !== undefined && adminData[key] !== null) {
          // Handle file upload separately
          if (key === "profile_image" && adminData[key] instanceof File) {
            formData.append(key, adminData[key])
          } else if (key !== "profile_image" || typeof adminData[key] === "string") {
            formData.append(key, adminData[key])
          }
        }
      })

      const response = await api.post("/admins", formData, {
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

  // Update an existing admin
  updateAdmin: async (id, adminData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData()

      // Add all fields to FormData
      Object.keys(adminData).forEach((key) => {
        if (adminData[key] !== undefined && adminData[key] !== null && adminData[key] !== "") {
          // Handle file upload separately
          if (key === "profile_image" && adminData[key] instanceof File) {
            formData.append(key, adminData[key])
          } else if (key !== "profile_image" || typeof adminData[key] === "string") {
            formData.append(key, adminData[key])
          }
        }
      })

      // Use PUT method for update
      const response = await api.post(`/admins/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-HTTP-Method-Override": "PUT", // Some servers require this for PUT with FormData
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

  // Delete an admin
  deleteAdmin: async (id) => {
    try {
      const response = await api.delete(`/admins/${id}`)

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

  // Update admin status only
  updateAdminStatus: async (id, status) => {
    try {
      const response = await api.put(`/admins/${id}/status`, { status })
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
}

export default adminService
