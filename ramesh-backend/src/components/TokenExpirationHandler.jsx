"use client"

import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

const TokenExpirationHandler = ({ children }) => {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    // Set up interval to periodically check if we still have a token
    const intervalId = setInterval(
      () => {
        const token = localStorage.getItem("accessToken")
        const user = localStorage.getItem("user")

        // If token or user data is missing, handle expiration
        if (!token || !user) {
          console.log("Token or user data missing, handling expiration...")
          // Clear any remaining auth data and redirect
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("tokenExpiry")
          localStorage.removeItem("user")
          window.location.href = "/login"
        }
      },
      10 * 60 * 1000, // Check every 10 minutes
    )

    return () => {
      clearInterval(intervalId)
    }
  }, [isAuthenticated])

  return children
}

export default TokenExpirationHandler
