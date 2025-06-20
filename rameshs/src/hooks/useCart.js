"use client"
import { useEffect, useState, useCallback } from "react"
import useCartStore from "../store/cartStore"
import useAuth from "./useAuth"

// Simple cart hook - COMPLETELY LAZY LOADING
const useCart = () => {
  const { isAuthenticated, user } = useAuth()
  const [isCartSyncing, setIsCartSyncing] = useState(false)
  const [hasSyncedAfterLogin, setHasSyncedAfterLogin] = useState(false)

  // Get all cart state and methods from store
  const {
    items,
    coupons,
    summary,
    isLoading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    clearCart,
    syncCartAfterLogin: storeSyncCartAfterLogin,
    _hasInitialized,
  } = useCartStore()

  // Check if cart has been synced for this user session
  const hasCartBeenSynced = useCallback(() => {
    if (typeof localStorage === "undefined") return false

    const userId = user?.id
    if (!userId) return false

    const syncedFlag = localStorage.getItem("ramesh-sweets-cart-synced")
    return syncedFlag === userId.toString()
  }, [user?.id])

  // Sync cart after login - ONLY when explicitly called
  const syncCartAfterLogin = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return { success: false, message: "Not authenticated" }

    if (hasCartBeenSynced()) {
      setHasSyncedAfterLogin(true)
      return { success: true, message: "Cart already synced" }
    }

    try {
      setIsCartSyncing(true)
      const response = await storeSyncCartAfterLogin()

      if (response.success) {
        setHasSyncedAfterLogin(true)
      }

      return response
    } catch (error) {
      console.error("Error syncing cart:", error)
      return { success: false, message: error.message || "Failed to sync cart" }
    } finally {
      setIsCartSyncing(false)
    }
  }, [isAuthenticated, user?.id, hasCartBeenSynced, storeSyncCartAfterLogin])

  // REMOVED ALL AUTOMATIC INITIALIZATION AND SYNCING

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasSyncedAfterLogin(false)
    }
  }, [isAuthenticated])

  return {
    cart: { items, coupons, summary },
    isLoading: isLoading || isCartSyncing,
    error,
    addToCart,
    updateCartItem: updateQuantity,
    removeCartItem: removeItem,
    applyCoupon,
    removeCoupon,
    clearCart,
    refetchCart: fetchCart, // Manual fetch when needed
    syncCartAfterLogin,
    hasInitialized: _hasInitialized,
  }
}

// Named export for header.jsx - shows cart count without fetching
export const useCartContents = () => {
  const { items, summary, isLoading, error, _hasInitialized } = useCartStore()

  const cartItemCount = summary?.total_items || 0
  const hasItems = items && items.length > 0

  return {
    items,
    totalItems: cartItemCount,
    hasItems,
    subtotal: summary?.subtotal || 0,
    total: summary?.total || 0,
    isLoading,
    error,
    hasInitialized: _hasInitialized,
  }
}

export default useCart
