import api from "../services/api"

export const userService = {
  // Get users with optional filtering and pagination
  getUsers: async (params = {}) => {
    try {
      const response = await api.get("/admin/users", { params })
      return response.data
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },

  // Update user status
  updateUserStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/users/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error(`Error updating user ${id} status:`, error)
      throw error
    }
  },

  // Get user statistics
  getUserStatistics: async () => {
    try {
      const response = await api.get("/admin/users/statistics")
      return response.data
    } catch (error) {
      console.error("Error fetching user statistics:", error)
      throw error
    }
  },

  // Export users
  exportUsers: async (params = {}) => {
    try {
      const { format = "csv", ...otherParams } = params

      if (format === "csv") {
        // For CSV, we need to handle the blob response
        const response = await api.get("/admin/users/export", {
          params: { format, ...otherParams },
          responseType: "blob",
        })
        return response.data
      } else {
        // For JSON, handle as regular response
        const response = await api.get("/admin/users/export", {
          params: { format, ...otherParams },
        })
        return response.data
      }
    } catch (error) {
      console.error("Error exporting users:", error)
      throw error
    }
  },
}
