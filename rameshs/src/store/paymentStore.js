import { create } from "zustand"
import { persist } from "zustand/middleware"

const usePaymentStore = create(
  persist(
    (set, get) => ({
      // Payment state
      currentPayment: null,
      paymentMethods: [],
      selectedPaymentMethod: null,
      paymentStatus: "idle", // idle, initializing, processing, completed, failed

      // Order state
      currentOrder: null,
      orderStatus: "idle", // idle, creating, completed, failed

      // UI state
      isLoading: false,
      error: null,

      // Payment flow data
      paymentData: null,

      // Actions
      setPaymentMethods: (methods) => {
        set({ paymentMethods: methods, error: null })
      },

      setSelectedPaymentMethod: (method) => {
        set({ selectedPaymentMethod: method })
      },

      setCurrentPayment: (payment) => {
        set({ currentPayment: payment })
      },

      setPaymentStatus: (status) => {
        set({ paymentStatus: status })
      },

      setCurrentOrder: (order) => {
        set({ currentOrder: order })
      },

      setOrderStatus: (status) => {
        set({ orderStatus: status })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error, isLoading: false })
      },

      setPaymentData: (data) => {
        set({ paymentData: data })
      },

      clearError: () => {
        set({ error: null })
      },

      clearPayment: () => {
        set({
          currentPayment: null,
          selectedPaymentMethod: null,
          paymentStatus: "idle",
          paymentData: null,
          error: null,
        })
      },

      clearOrder: () => {
        set({
          currentOrder: null,
          orderStatus: "idle",
          error: null,
        })
      },

      resetPaymentFlow: () => {
        set({
          currentPayment: null,
          selectedPaymentMethod: null,
          paymentStatus: "idle",
          currentOrder: null,
          orderStatus: "idle",
          isLoading: false,
          error: null,
          paymentData: null,
        })
      },

      // Getters
      getPaymentMethod: (code) => {
        const state = get()
        return state.paymentMethods.find((method) => method.code === code)
      },

      isPaymentInProgress: () => {
        const state = get()
        return state.paymentStatus === "initializing" || state.paymentStatus === "processing"
      },

      isOrderInProgress: () => {
        const state = get()
        return state.orderStatus === "creating"
      },

      canProceedToPayment: () => {
        const state = get()
        return state.selectedPaymentMethod && !state.isLoading && !state.error
      },
    }),
    {
      name: "payment-storage",
      partialize: (state) => ({
        selectedPaymentMethod: state.selectedPaymentMethod,
      }),
    },
  ),
)

export default usePaymentStore
