"use client"

import { useEffect, useState } from "react"
import useAuthStore from "../../store/authStore"
import useCartStore from "../../store/cartStore"

// Helper function to get cart items from localStorage
const getLocalCartItems = () => {
  try {
    const items = localStorage.getItem("ramesh-sweets-cart-items")
    return items ? JSON.parse(items) : []
  } catch (error) {
    console.error("Error parsing local cart items:", error)
    return []
  }
}

// This component will handle cart synchronization after login and logout
const AuthSyncHandler = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { syncCartAfterLogin, fetchCart, hasInitialized, clearCartOnLogout } = useCartStore()
  const [previousAuthState, setPreviousAuthState] = useState(isAuthenticated)
  const [hasSyncedForUser, setHasSyncedForUser] = useState(false)

  // This effect will run whenever authentication state changes
  useEffect(() => {
    const handleAuthStateChange = async () => {
      // User just logged in
      if (isAuthenticated && !previousAuthState && user?.id) {
        console.log("User logged in, checking for cart sync...")

        // Reset sync flag for new login
        setHasSyncedForUser(false)

        // Clear any previous profile completion skip flags
        sessionStorage.removeItem("profile-completion-skipped")

        try {
          // Check if there are any local cart items to sync
          const localCartItems = getLocalCartItems()

          console.log(`Found ${localCartItems.length} local cart items to sync`)

          // Always call sync after login, even if no local items
          if (!hasSyncedForUser) {
            console.log("Syncing cart with server...")

            // Show loading toast
            if (window.showToast) {
              window.showToast({
                title: "Syncing Your Cart",
                description:
                  localCartItems.length > 0
                    ? `Syncing ${localCartItems.length} item(s) with your account...`
                    : "Loading your cart from server...",
                type: "info",
                duration: 3000,
              })
            }

            // Call the sync function
            const result = await syncCartAfterLogin()

            if (result.success) {
              // Mark as synced for this session
              setHasSyncedForUser(true)

              // Show success toast
              if (window.showToast) {
                window.showToast({
                  title: "Cart Synced",
                  description:
                    localCartItems.length > 0
                      ? `${localCartItems.length} item(s) synced with your account.`
                      : "Your cart has been loaded successfully.",
                  type: "success",
                  duration: 3000,
                })
              }

              // Force refresh cart data after sync
              console.log("Forcing cart refresh after sync...")
              await fetchCart()
            } else {
              console.error("Cart sync failed:", result.message)

              // Show error toast
              if (window.showToast) {
                window.showToast({
                  title: "Cart Sync Failed",
                  description: result.message || "We couldn't sync your cart. Please try again later.",
                  type: "error",
                  duration: 5000,
                })
              }

              // Even if sync fails, try to fetch server cart
              console.log("Sync failed, attempting to fetch server cart...")
              await fetchCart()
            }
          }
        } catch (error) {
          console.error("Error during cart sync:", error)

          // Show error toast
          if (window.showToast) {
            window.showToast({
              title: "Cart Sync Failed",
              description: "We couldn't sync your cart. Please try again later.",
              type: "error",
              duration: 5000,
            })
          }

          // Try to fetch server cart even if sync fails
          try {
            console.log("Attempting to fetch server cart after sync error...")
            await fetchCart()
          } catch (fetchError) {
            console.error("Failed to fetch server cart:", fetchError)
          }
        }
      }

      // User just logged out
      if (!isAuthenticated && previousAuthState) {
        console.log("User logged out, clearing cart...")

        try {
          // Clear cart on logout
          await clearCartOnLogout()

          // Reset sync flag
          setHasSyncedForUser(false)

          // Clear profile completion flags
          sessionStorage.removeItem("profile-completion-skipped")

          console.log("Cart cleared successfully on logout")
        } catch (error) {
          console.error("Error clearing cart on logout:", error)
        }
      }

      // Update previous auth state
      setPreviousAuthState(isAuthenticated)
    }

    handleAuthStateChange()
  }, [
    isAuthenticated,
    user?.id,
    previousAuthState,
    syncCartAfterLogin,
    fetchCart,
    hasInitialized,
    clearCartOnLogout,
    hasSyncedForUser,
  ])

  // This component doesn't render anything
  return null
}

export default AuthSyncHandler
