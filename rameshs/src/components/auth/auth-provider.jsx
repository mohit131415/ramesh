"use client"

import { useEffect } from "react"
import useAuthStore from "../../store/authStore"
import AuthModal from "./auth-modal"
import { Toaster } from "../ui/toast"

const AuthProvider = ({ children }) => {
  const { validateToken, isTokenExpired, logout, isAuthenticated, openAuthModal } = useAuthStore()

  // Show modal on initial load if user is not authenticated
  useEffect(() => {
    // Check if user is not authenticated
    if (!isAuthenticated) {
      // Small delay to ensure the app is fully loaded
      const timer = setTimeout(() => {
        openAuthModal("register")
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, openAuthModal])

  // Validate token on mount and set up interval for periodic validation
  useEffect(() => {
    // Initial validation
    if (isAuthenticated) {
      // Check if token is expired based on stored expiry time
      if (isTokenExpired()) {
        logout("Your session has expired. Please login again.")
        return
      }

      // Validate with the server
      validateToken()
    }

    // Set up interval for periodic validation (every 5 minutes)
    const intervalId = setInterval(
      () => {
        if (isAuthenticated) {
          validateToken()
        }
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [validateToken, logout, isAuthenticated, isTokenExpired])

  return (
    <>
      {children}
      <AuthModal />
      <Toaster />
    </>
  )
}

export default AuthProvider
