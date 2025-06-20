import { create } from "zustand"
import { persist } from "zustand/middleware"
import cartService from "../services/cart-service"

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      items: [],
      inactive_items: [],
      invalid_items: [],
      totals: {
        subtotal: 0,
        base_amount: 0,
        tax_amount: 0,
        discount_amount: 0,
        total: 0,
        item_count: 0,
        total_quantity: 0,
        roundoff: 0, // Changed from roundoff_amount to roundoff to match API
      },
      summary: {
        subtotal: 0,
        discount: 0,
        tax_amount: 0,
        base_amount: 0,
        total: 0,
        total_items: 0,
        total_quantity: 0,
        roundoff: 0, // Changed from roundoff_amount to roundoff to match API
      },
      coupons: [],
      appliedCoupon: null,
      inactiveCoupon: null,
      loading: false,
      error: null,
      hasInitialized: false,
      isCartOpen: false,
      isCouponPopupOpen: false,

      setCartData: (data) => {
        set({
          items: data.items || [],
          coupons: data.coupons || [],
          summary: data.summary || {
            subtotal: 0,
            discount: 0,
            tax_amount: 0,
            base_amount: 0,
            total: 0,
            total_items: 0,
            roundoff: 0,
          },
          _hasInitialized: true,
        })
      },

      setCartOpen: (isOpen) => {
        set({ isCartOpen: isOpen })
      },

      setCouponPopupOpen: (isOpen) => set({ isCouponPopupOpen: isOpen }),

      toggleCart: () => {
        set((state) => ({ isCartOpen: !state.isCartOpen }))
      },

      setCart: (cartData) => {
        const items = cartData.items || []
        const inactive_items = cartData.inactive_items || []
        const invalid_items = cartData.invalid_items || []
        const totals = cartData.totals || {}
        const coupons = cartData.coupons || []
        const appliedCoupon = cartData.applied_coupon || null
        const inactiveCoupon = cartData.inactive_coupon || null

        // Extract roundoff directly from API response (matches the field name in your API)
        const roundoffValue = Number.parseFloat(totals.roundoff || 0)

        const summary = {
          subtotal: Number.parseFloat(totals.subtotal || 0),
          discount: Number.parseFloat(totals.total_discount_amount || totals.discount_amount || 0),
          coupon_discount: Number.parseFloat(totals.coupon_discount_amount || 0),
          product_discount: Number.parseFloat(totals.product_discount_amount || 0),
          tax_amount: Number.parseFloat(totals.tax_amount || 0),
          base_amount: Number.parseFloat(totals.base_amount || 0),
          total: Number.parseFloat(totals.total || 0),
          total_items: totals.item_count || items.length,
          total_quantity: totals.total_quantity || items.reduce((sum, item) => sum + (item.quantity || 0), 0),
          roundoff: roundoffValue, // Store as roundoff to match API
        }

        set({
          items,
          inactive_items,
          invalid_items,
          totals: {
            subtotal: summary.subtotal,
            base_amount: summary.base_amount,
            tax_amount: summary.tax_amount,
            discount_amount: summary.discount,
            coupon_discount_amount: summary.coupon_discount,
            product_discount_amount: summary.product_discount,
            total_discount_amount: summary.discount,
            total: summary.total,
            item_count: summary.total_items,
            total_quantity: summary.total_quantity,
            roundoff: roundoffValue, // Store as roundoff to match API
          },
          summary,
          coupons,
          appliedCoupon,
          inactiveCoupon,
          error: null,
          hasInitialized: true,
        })
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error, loading: false }),

      fetchCart: async () => {
        set({ loading: true, error: null })
        try {
          const response = await cartService.getCart()

          if (response.status === "success") {
            get().setCart(response.data)
          } else {
            set({ error: response.message || "Failed to fetch cart" })
          }
        } catch (error) {
          set({ error: error.message || "Failed to fetch cart" })
        } finally {
          set({ loading: false })
        }
      },

      addToCart: async (productId, variantId, quantity = 1, productDetails = {}, options = {}) => {
        set({ loading: true, error: null })
        try {
          const response = await cartService.addToCart(productId, variantId, quantity, productDetails)

          if (response.status === "success") {
            get().setCart(response.data)

            const currentPath = typeof window !== "undefined" ? window.location.pathname : ""
            const isOnCartPage = currentPath === "/cart"

            if (!isOnCartPage && options.openCartDrawer !== false) {
              set({ isCartOpen: true })
            }

            return { success: true, message: response.message }
          } else {
            set({ error: response.message || "Failed to add item to cart" })
            return { success: false, message: response.message || "Failed to add item to cart" }
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to add item to cart"
          set({ error: errorMessage })
          return { success: false, message: errorMessage }
        } finally {
          set({ loading: false })
        }
      },

      updateCartItem: async (itemId, quantity) => {
        set({ loading: true, error: null })
        try {
          const response = await cartService.updateCartItem(itemId, quantity)

          if (response.status === "success") {
            get().setCart(response.data)
            return { success: true, message: response.message }
          } else {
            set({ error: response.message || "Failed to update cart item" })
            return { success: false, message: response.message || "Failed to update cart item" }
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to update cart item"
          set({ error: errorMessage })
          return { success: false, message: errorMessage }
        } finally {
          set({ loading: false })
        }
      },

      removeCartItem: async (itemId) => {
        set({ loading: true, error: null })
        try {
          const response = await cartService.removeCartItem(itemId)

          if (response.status === "success") {
            get().setCart(response.data)
            return { success: true, message: response.message }
          } else {
            set({ error: response.message || "Failed to remove cart item" })
            return { success: false, message: response.message || "Failed to remove cart item" }
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to remove cart item"
          set({ error: errorMessage })
          return { success: false, message: errorMessage }
        } finally {
          set({ loading: false })
        }
      },

      getAvailableCoupons: async () => {
        try {
          const response = await cartService.getAvailableCoupons()
          return response
        } catch (error) {
          return {
            status: "error",
            message: error.response?.data?.message || error.message || "Failed to fetch coupons",
            data: [],
          }
        }
      },

      validateCoupon: async (couponCode, cartTotal) => {
        try {
          const response = await cartService.validateCoupon(couponCode, cartTotal)
          return response
        } catch (error) {
          return {
            status: "error",
            message: error.response?.data?.message || error.message || "Failed to validate coupon",
            data: null,
          }
        }
      },

      applyCoupon: async (couponCode) => {
        set({ loading: true, error: null })
        try {
          // First validate the coupon
          const cartTotal = get().totals?.total || 0
          const validationResponse = await get().validateCoupon(couponCode, cartTotal)

          if (validationResponse.status !== "success") {
            set({ error: validationResponse.message || "Coupon validation failed" })
            return { success: false, message: validationResponse.message || "Coupon validation failed" }
          }

          // If validation passes, apply the coupon
          const response = await cartService.applyCoupon(couponCode)

          if (response.status === "success") {
            get().setCart(response.data)
            return { success: true, message: response.message }
          } else {
            set({ error: response.message || "Failed to apply coupon" })
            return { success: false, message: response.message || "Failed to apply coupon" }
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to apply coupon"
          set({ error: errorMessage })
          return { success: false, message: errorMessage }
        } finally {
          set({ loading: false })
        }
      },

      removeCoupon: async () => {
        set({ loading: true, error: null })
        try {
          const response = await cartService.removeCoupon()

          if (response.status === "success") {
            get().setCart(response.data)
            return { success: true, message: response.message }
          } else {
            set({ error: response.message || "Failed to remove coupon" })
            return { success: false, message: response.message || "Failed to remove coupon" }
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to remove coupon"
          set({ error: errorMessage })
          return { success: false, message: errorMessage }
        } finally {
          set({ loading: false })
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null })
        try {
          const response = await cartService.clearCart()

          if (response.status === "success") {
            get().setCart(response.data)
            return { success: true, message: response.message }
          } else {
            set({ error: response.message || "Failed to clear cart" })
            return { success: false, message: response.message || "Failed to clear cart" }
          }
        } catch (error) {
          const errorMessage = error.message || "Failed to clear cart"
          set({ error: errorMessage })
          return { success: false, message: errorMessage }
        } finally {
          set({ loading: false })
        }
      },

      // Clear cart on logout
      clearCartOnLogout: async () => {
        set({ loading: true, error: null })
        try {
          const response = await cartService.clearCartOnLogout()

          if (response.status === "success") {
            get().setCart(response.data)
            return { success: true, message: response.message }
          } else {
            set({ error: response.message || "Failed to clear cart on logout" })
            return { success: false, message: response.message || "Failed to clear cart on logout" }
          }
        } catch (error) {
          const errorMessage = error.message || "Failed to clear cart on logout"
          set({ error: errorMessage })
          return { success: false, message: errorMessage }
        } finally {
          set({ loading: false })
        }
      },

      // Update sync method to be more precise and handle refresh
      syncCartAfterLogin: async () => {
        set({ loading: true, error: null })
        try {
          console.log("Starting cart sync after login...")
          const response = await cartService.syncCartAfterLogin()

          if (response.success) {
            console.log("Cart sync successful, updating cart state...")

            // Update cart state with synced data
            get().setCart(response.data)

            // Force a fresh fetch to ensure we have the latest data
            console.log("Fetching fresh cart data after sync...")
            await get().fetchCart()

            return { success: true, message: response.message }
          } else {
            console.error("Cart sync failed:", response.message)
            set({ error: response.message || "Failed to sync cart" })

            // Even if sync fails, try to fetch current cart
            try {
              console.log("Sync failed, attempting to fetch current cart...")
              await get().fetchCart()
            } catch (fetchError) {
              console.error("Failed to fetch cart after sync failure:", fetchError)
            }

            return { success: false, message: response.message || "Failed to sync cart" }
          }
        } catch (error) {
          console.error("Error in syncCartAfterLogin:", error)
          const errorMessage = error.message || "Failed to sync cart"
          set({ error: errorMessage })

          // Try to fetch current cart even on error
          try {
            console.log("Sync error, attempting to fetch current cart...")
            await get().fetchCart()
          } catch (fetchError) {
            console.error("Failed to fetch cart after sync error:", fetchError)
          }

          return { success: false, message: errorMessage }
        } finally {
          set({ loading: false })
        }
      },

      getTotals: () => {
        const state = get()
        return (
          state.totals ||
          state.summary || {
            subtotal: 0,
            base_amount: 0,
            tax_amount: 0,
            discount_amount: 0,
            total: 0,
            item_count: 0,
            total_quantity: 0,
            roundoff: 0,
          }
        )
      },

      getTotalItems: () => {
        const state = get()
        return state.totals?.item_count || state.summary?.total_items || state.items.length || 0
      },

      getTotalQuantity: () => {
        const state = get()
        return (
          state.totals?.total_quantity ||
          state.summary?.total_quantity ||
          state.items.reduce((total, item) => total + (item.quantity || 0), 0)
        )
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        inactive_items: state.inactive_items,
        invalid_items: state.invalid_items,
        totals: state.totals,
        summary: state.summary,
        coupons: state.coupons,
        appliedCoupon: state.appliedCoupon,
        inactiveCoupon: state.inactiveCoupon,
        hasInitialized: state.hasInitialized,
      }),
    },
  ),
)

if (typeof window !== "undefined") {
  window.openCartDrawer = () => {
    const { setCartOpen } = useCartStore.getState()
    setCartOpen(true)
  }
}

export default useCartStore
