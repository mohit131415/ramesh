import { create } from "zustand"
import { persist } from "zustand/middleware"

const useCheckoutStore = create(
  persist(
    (set, get) => ({
      // Checkout data from API
      checkoutData: null,
      orderData: null,
      selectedAddress: null,
      selectedPaymentMethod: null,

      // UI state
      currentStep: "address",
      isLoading: false,
      error: null,
      orderComplete: false,

      // Actions
      setCheckoutData: (data) => {
        // console.log("Setting checkout data in store:", data)
        set({
          checkoutData: data,
          error: null,
        })
      },

      setOrderData: (data) => {
        // console.log("Setting order data in store:", data)
        set({
          orderData: data,
          orderComplete: true,
          error: null,
        })
      },

      setSelectedAddress: (address) => {
        set({ selectedAddress: address })
      },

      setSelectedPaymentMethod: (method) => {
        set({ selectedPaymentMethod: method })
      },

      setCurrentStep: (step) => {
        set({ currentStep: step })
      },

      setLoading: (loading) => {
        // console.log("Setting loading state:", loading)
        set({ isLoading: loading })
      },

      setError: (error) => {
        // console.log("Setting error in store:", error)
        set({ error, isLoading: false })
      },

      setOrderComplete: (complete) => {
        set({ orderComplete: complete })
      },

      clearError: () => {
        set({ error: null })
      },

      clearCheckoutData: () => {
        set({
          checkoutData: null,
          selectedAddress: null,
          selectedPaymentMethod: null,
          currentStep: "address",
          error: null,
        })
      },

      resetCheckout: () => {
        set({
          checkoutData: null,
          orderData: null,
          selectedAddress: null,
          selectedPaymentMethod: null,
          currentStep: "address",
          isLoading: false,
          error: null,
          orderComplete: false,
        })
      },

      // Getters
      getCheckoutItems: () => {
        const state = get()
        return state.checkoutData?.items || []
      },

      getCheckoutTotals: () => {
        const state = get()
        return state.checkoutData?.totals || {}
      },

      getShippingInfo: () => {
        const state = get()
        return state.checkoutData?.shipping_info || {}
      },

      getPaymentInfo: () => {
        const state = get()
        return state.checkoutData?.payment_info || {}
      },

      getTaxBreakdown: () => {
        const state = get()
        return state.checkoutData?.tax_breakdown || {}
      },

      getAppliedCoupon: () => {
        const state = get()
        return state.checkoutData?.applied_coupon || null
      },

      getStoreInfo: () => {
        const state = get()
        return state.checkoutData?.store_info || {}
      },
    }),
    {
      name: "checkout-storage",
      partialize: (state) => ({
        selectedAddress: state.selectedAddress,
        selectedPaymentMethod: state.selectedPaymentMethod,
        currentStep: state.currentStep,
      }),
    },
  ),
)

export default useCheckoutStore
