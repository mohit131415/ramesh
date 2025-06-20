"use client"

import { createContext, useState, useContext, useEffect } from "react"
import authService from "../services/authService"
import { toast } from "react-toastify"
import { tokenManager } from "../services/api"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Function to check authentication status
  const checkAuth = async () => {
    const accessToken = tokenManager.getToken()
    const userStr = localStorage.getItem("user")

    if (accessToken && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (e) {
        console.error("Error parsing user data:", e)
        clearAuthData()
      }
    }
    setLoading(false)
  }

  // Check auth on initial load and on tab visibility change
  useEffect(() => {
    checkAuth()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // When tab becomes visible, just check if we still have basic auth data
        const token = tokenManager.getToken()
        const userStr = localStorage.getItem("user")

        if (!token || !userStr) {
          console.log("Auth data missing on visibility change")
          clearAuthData()
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, []) // Empty dependency array ensures this runs once on mount and cleanup on unmount

  // Clear all auth data
  const clearAuthData = () => {
    tokenManager.clearTokens() // Clears tokens from localStorage and resets TokenManager state
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authService.login(email, password)

      if (response.status === "success") {
        const { user, access_token, refresh_token, expires_in } = response.data
        tokenManager.setTokens(access_token, refresh_token, expires_in) // Store new tokens
        localStorage.setItem("user", JSON.stringify(user))

        if (response.message) {
          toast.success(response.message)
        }

        setUser(user)
        setIsAuthenticated(true)
        return user
      } else {
        const errorMessage = response.message || "Login failed"
        toast.error(errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred during login"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const response = await authService.logout()
      if (response.status !== "success") {
        console.warn("Logout API returned an error:", response.message)
      } else if (response.message) {
        toast.success(response.message || "Logged out successfully")
      }
    } catch (err) {
      console.error("Logout error:", err)
      toast.error("Error during logout")
    } finally {
      clearAuthData() // Always clear auth data regardless of API success
      setLoading(false)
    }
  }

  const changePassword = async (currentPassword, newPassword, newPasswordConfirmation) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authService.changePassword(currentPassword, newPassword, newPasswordConfirmation)

      if (response.status === "success") {
        if (response.message) {
          toast.success(response.message)
        }
        // Automatically log out the user after successful password change
        setTimeout(() => {
          clearAuthData()
          window.location.href = "/login"
        }, 2000)
        return response
      } else {
        const errorMessage = response.message || "Password change failed"
        toast.error(errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred during password change"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email) => {
    setLoading(true)
    setError(null)

    try {
      const response = await authService.forgotPassword(email)
      if (response.status === "success") {
        return true
      } else {
        const errorMessage = response.message || "Password reset request failed"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred during password reset request"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    forgotPassword,
    handleTokenExpiration: tokenManager.handleTokenExpiration, // Expose for explicit handling if needed
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
