import { create } from "zustand"
import { persist } from "zustand/middleware"
import apiClient from "../services/api-client"

// Helper function to safely show toast
const safeShowToast = (toastData) => {
  if (typeof window !== "undefined" && window.showToast) {
    window.showToast(toastData)
  } else {
    // Retry after a short delay
    setTimeout(() => {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast(toastData)
      }
    }, 100)
  }
}

// Create auth store with persistence
const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      token: null,
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      authStep: "register",
      otpType: null,
      currentPhone: "",
      isLoading: false,
      error: null,
      tokenExpiresAt: null,
      refreshToken: null,
      lastValidationTime: null,
      validationTimer: null,
      isValidating: false, // Prevent concurrent validations

      // Open auth modal
      openAuthModal: (step = "register") => {
        set({ isAuthModalOpen: true, authStep: step || "register", error: null })
      },

      // Close auth modal
      closeAuthModal: () => {
        set({ isAuthModalOpen: false })
        setTimeout(() => {
          set({ authStep: "register" })
          safeShowToast({
            title: "Authentication Cancelled",
            description: "You can sign in or create an account anytime from the user menu.",
            type: "info",
            duration: 3000,
          })
        }, 300)
      },

      // Set auth step
      setAuthStep: (step) => {
        set({ authStep: step, error: null })
      },

      // Set current phone
      setCurrentPhone: (phone) => {
        set({ currentPhone: phone })
      },

      // Request registration OTP
      requestRegister: async (phoneNumber) => {
        set({ isLoading: true, error: null, currentPhone: phoneNumber })

        try {
          const response = await apiClient.post("/api/public/register", {
            phone: phoneNumber,
          })

          const data = response.data

          if (data.status === "success") {
            const action = data.data?.action || "register"

            set({
              authStep: "verifyOtp",
              otpType: action,
              isLoading: false,
              error: null,
              isNewUser: action === "register",
            })

            safeShowToast({
              title: action === "register" ? "Verification Code Sent" : "Welcome Back!",
              description: data.data?.message || data.message || "Verification code sent successfully.",
              type: "success",
              duration: 5000,
            })

            return {
              success: true,
              message: data.message || data.data?.message,
              action: action,
            }
          } else {
            set({
              isLoading: false,
              error: data.message || "Failed to send OTP. Please try again.",
            })

            safeShowToast({
              title: "Registration Unsuccessful",
              description: data.message || "We couldn't send the verification code. Please try again in a moment.",
              type: "error",
              duration: 5000,
            })

            return { success: false, error: data.message }
          }
        } catch (error) {
          set({
            isLoading: false,
            error: "Network error. Please check your connection and try again.",
          })

          safeShowToast({
            title: "Connection Issue",
            description: "Please check your internet connection and try again.",
            type: "error",
            duration: 5000,
          })

          return { success: false, error: "Network error" }
        }
      },

      // Request login OTP
      requestLogin: async (phoneNumber) => {
        set({ isLoading: true, error: null, currentPhone: phoneNumber })

        try {
          const response = await apiClient.post("/api/public/login", {
            phone: phoneNumber,
          })

          const data = response.data

          if (data.status === "success") {
            const action = data.data?.action || "login"

            set({
              authStep: "verifyOtp",
              otpType: action,
              isLoading: false,
              error: null,
              isNewUser: action === "register",
            })

            safeShowToast({
              title: action === "register" ? "New Account Setup" : "Welcome Back!",
              description: data.data?.message || data.message || "Verification code sent successfully.",
              type: "success",
              duration: 5000,
            })

            return {
              success: true,
              isNewUser: action === "register",
              message: data.message || data.data?.message,
              action: action,
            }
          } else {
            set({
              isLoading: false,
              error: data.message || "Failed to send OTP. Please try again.",
            })

            safeShowToast({
              title: "Sign-in Unsuccessful",
              description: data.message || "We couldn't send the verification code. Please try again in a moment.",
              type: "error",
              duration: 5000,
            })

            return { success: false, error: data.message }
          }
        } catch (error) {
          set({
            isLoading: false,
            error: "Network error. Please check your connection and try again.",
          })

          safeShowToast({
            title: "Connection Issue",
            description: "Please check your internet connection and try again.",
            type: "error",
            duration: 5000,
          })

          return { success: false, error: "Network error" }
        }
      },

      // Verify OTP
      verifyOtp: async (otp) => {
        const { currentPhone, otpType } = get()

        if (!currentPhone || !otpType || !otp) {
          set({ error: "Missing required information." })
          return { success: false, error: "Missing required information." }
        }

        set({ isLoading: true, error: null })

        try {
          const response = await apiClient.post("/api/public/verify-otp", {
            phone_number: currentPhone,
            otp: otp,
            type: otpType,
          })

          const data = response.data

          if (response.status === 200 && data.status === "success") {
            if (data.data && data.data.access_token) {
              const now = new Date()
              const expiresIn = data.data.expires_in || 86400
              const tokenExpiresAt = new Date(now.getTime() + expiresIn * 1000)

              const user = {
                id: data.data.user_id,
                phone: currentPhone,
                user_type: data.data.user_type || "user",
              }

              set({
                token: data.data.access_token,
                refreshToken: data.data.refresh_token,
                user: user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                isAuthModalOpen: false,
                authStep: "register",
                currentPhone: "",
                otpType: null,
                tokenExpiresAt: tokenExpiresAt.toISOString(),
                lastValidationTime: now.toISOString(),
              })

              // Start smart validation timer
              const { startSmartValidation } = get()
              startSmartValidation()

              safeShowToast({
                title: otpType === "register" ? "Welcome to Ramesh Sweets!" : "Welcome Back!",
                description: data.data?.message || data.message || "Authentication successful!",
                type: "success",
                duration: 5000,
              })

              return { success: true, message: "Authentication successful" }
            } else {
              const errorMessage = "Authentication data incomplete. Please try again."

              set({
                isLoading: false,
                error: errorMessage,
              })

              safeShowToast({
                title: "Authentication Incomplete",
                description: errorMessage,
                type: "error",
                duration: 5000,
              })

              return { success: false, error: errorMessage }
            }
          } else {
            const errorMessage = data.message || data.error || "Failed to verify OTP. Please try again."

            set({
              isLoading: false,
              error: errorMessage,
            })

            safeShowToast({
              title: "Verification Failed",
              description: errorMessage,
              type: "error",
              duration: 5000,
            })

            return { success: false, error: errorMessage }
          }
        } catch (error) {
          const errorMessage = "Network error. Please check your connection and try again."

          set({
            isLoading: false,
            error: errorMessage,
          })

          safeShowToast({
            title: "Connection Issue",
            description: "Please check your internet connection and try again.",
            type: "error",
            duration: 5000,
          })

          return { success: false, error: "Network error" }
        }
      },

      // Smart validation - only validate when necessary
      validateToken: async (forceValidation = false) => {
        const { token, logout, lastValidationTime, isValidating } = get()

        if (!token) {
          return { valid: false, error: "No token available" }
        }

        // Prevent concurrent validations
        if (isValidating && !forceValidation) {
          return { valid: true, cached: true }
        }

        // Check if we recently validated (within last 3 minutes) and don't force
        if (!forceValidation && lastValidationTime) {
          const lastValidation = new Date(lastValidationTime)
          const now = new Date()
          const timeDiff = now.getTime() - lastValidation.getTime()
          const threeMinutes = 3 * 60 * 1000

          if (timeDiff < threeMinutes) {
            return { valid: true, cached: true }
          }
        }

        set({ isValidating: true })

        try {
          const response = await apiClient.post(
            "/api/public/validate-token",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )

          const data = response.data

          if (data.status === "error") {
            logout("Your session has expired. Please sign in again.")
            return { valid: false, error: data.message }
          }

          if (data.status === "success") {
            const updates = {
              lastValidationTime: new Date().toISOString(),
              isValidating: false,
            }

            if (data.data && data.data.user) {
              updates.user = data.data.user
            }

            set(updates)

            return { valid: true, user: data.data?.user }
          } else {
            logout("Your session has expired. Please sign in again.")
            return { valid: false, error: data.message }
          }
        } catch (error) {
          set({ isValidating: false })
          logout("Your session has expired. Please sign in again.")
          return { valid: false, error: "Network error" }
        }
      },

      // Start smart validation - validates at strategic intervals
      startSmartValidation: () => {
        const { validationTimer } = get()

        // Clear existing timer if any
        if (validationTimer) {
          clearInterval(validationTimer)
        }

        // Validate token every 10 minutes (less frequent but still secure)
        const timer = setInterval(
          async () => {
            const { isAuthenticated, validateToken } = get()
            if (isAuthenticated) {
              await validateToken(true) // Force validation in timer
            }
          },
          10 * 60 * 1000, // 10 minutes
        )

        set({ validationTimer: timer })
      },

      // Validate on important actions (call this before sensitive operations)
      validateForAction: async () => {
        const { isAuthenticated, validateToken } = get()

        if (!isAuthenticated) {
          return { valid: false, error: "Not authenticated" }
        }

        // Always validate for important actions
        return await validateToken(true)
      },

      // Logout
      logout: async (message = "You have been signed out successfully.") => {
        const { token, validationTimer } = get()
        let logoutSuccess = true

        // Clear validation timer
        if (validationTimer) {
          clearInterval(validationTimer)
        }

        if (token) {
          try {
            set({ isLoading: true })

            const response = await apiClient.post(
              "/api/public/logout",
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )

            const data = response.data

            if (data.status !== "success") {
              logoutSuccess = false
            }
          } catch (error) {
            logoutSuccess = false
          } finally {
            set({ isLoading: false })
          }
        }

        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          tokenExpiresAt: null,
          lastValidationTime: null,
          validationTimer: null,
          isValidating: false,
        })

        try {
          localStorage.removeItem("ramesh-sweets-cart-synced")
        } catch (error) {
          // Silent fail
        }

        safeShowToast({
          title: "Signed Out",
          description: logoutSuccess
            ? message
            : "You've been signed out, but there was an issue communicating with the server.",
          type: logoutSuccess ? "info" : "warning",
        })

        return { success: logoutSuccess }
      },

      // Refresh token
      refreshAccessToken: async () => {
        const { refreshToken, logout } = get()

        if (!refreshToken) {
          logout("Session expired. Please sign in again.")
          return { success: false, error: "No refresh token available" }
        }

        try {
          const response = await apiClient.post(
            "/api/public/refresh",
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            },
          )

          const data = response.data

          if (data.status === "success" && data.data && data.data.access_token) {
            const now = new Date()
            const expiresIn = data.data.expires_in || 86400
            const tokenExpiresAt = new Date(now.getTime() + expiresIn * 1000)

            set({
              token: data.data.access_token,
              refreshToken: data.data.refresh_token || refreshToken,
              tokenExpiresAt: tokenExpiresAt.toISOString(),
              lastValidationTime: now.toISOString(),
            })

            return { success: true }
          } else {
            logout("Session expired. Please sign in again.")
            return { success: false, error: data.message }
          }
        } catch (error) {
          logout("Session expired. Please sign in again.")
          return { success: false, error: "Network error" }
        }
      },

      // Check if token is expired
      isTokenExpired: () => {
        const { tokenExpiresAt } = get()
        if (!tokenExpiresAt) return false

        const expiryDate = new Date(tokenExpiresAt)
        const now = new Date()

        return now >= expiryDate
      },

      // Get remaining time until token expiration (in seconds)
      getTokenRemainingTime: () => {
        const { tokenExpiresAt } = get()
        if (!tokenExpiresAt) return 0

        const expiryDate = new Date(tokenExpiresAt)
        const now = new Date()

        const remainingMs = expiryDate.getTime() - now.getTime()
        return Math.max(0, Math.floor(remainingMs / 1000))
      },
    }),
    {
      name: "ramesh-auth-storage",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.user !== null,
        tokenExpiresAt: state.tokenExpiresAt,
        lastValidationTime: state.lastValidationTime,
      }),
    },
  ),
)

export default useAuthStore
