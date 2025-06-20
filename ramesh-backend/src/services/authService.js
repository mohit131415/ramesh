import api from "./api"

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password })

      // Check if the response has the expected format
      if (response.data && response.data.status === "success") {
        // Extract user data from the response
        const userData = response.data.data.user || response.data.data

        return {
          status: "success",
          message: response.data.message || "Login successful",
          data: {
            user: userData,
            access_token: response.data.data.access_token,
            refresh_token: response.data.data.refresh_token,
          },
        }
      } else {
        // If the response doesn't have the expected format but is still a successful HTTP response
        return {
          status: "error",
          message: response.data.message || "Unexpected response format",
          data: null,
        }
      }
    } catch (error) {
      // Handle network errors or HTTP error responses
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout")
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post("/auth/refresh", { refresh_token: refreshToken })
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  validateToken: async () => {
    try {
      const response = await api.get("/auth/validate")
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: {
          valid: false,
          reason: errorMessage,
        },
      }
    }
  },

  changePassword: async (currentPassword, newPassword, newPasswordConfirmation) => {
    try {
      const response = await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      })
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  resetPassword: async (token, password, confirmPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
        password_confirmation: confirmPassword,
      })

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },

  // Also add a method to request a password reset
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email })
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    }
  },
}

export default authService
