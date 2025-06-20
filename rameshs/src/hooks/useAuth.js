"use client"

import { useCallback } from "react"
import useAuthStore from "../store/authStore"

export const useAuth = () => {
  const {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    openAuthModal,
    logout,
    validateToken,
    validateForAction,
    isTokenExpired,
    getTokenRemainingTime,
  } = useAuthStore()

  // Check if user is authenticated and token is valid (for general use)
  const checkAuth = useCallback(async () => {
    if (!isAuthenticated) return false

    // Check if token is expired based on stored expiry time
    if (isTokenExpired()) {
      await logout("Your session has expired. Please login again.")
      return false
    }

    // Use cached validation for general checks
    const result = await validateToken()
    return result.valid
  }, [isAuthenticated, isTokenExpired, logout, validateToken])

  // Check auth for sensitive operations (always validates with server)
  const checkAuthForAction = useCallback(async () => {
    if (!isAuthenticated) return false

    // Check if token is expired based on stored expiry time
    if (isTokenExpired()) {
      await logout("Your session has expired. Please login again.")
      return false
    }

    // Always validate with server for sensitive operations
    const result = await validateForAction()
    return result.valid
  }, [isAuthenticated, isTokenExpired, logout, validateForAction])

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    openAuthModal,
    logout,
    validateToken,
    validateForAction,
    checkAuth,
    checkAuthForAction, // New method for sensitive operations
    isTokenExpired,
    getTokenRemainingTime,
  }
}

export default useAuth
