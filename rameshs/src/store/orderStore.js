import { create } from "zustand"
import { persist } from "zustand/middleware"

const useOrderStore = create(
  persist(
    (set, get) => ({
      // Order history state
      orders: [],
      orderDetails: {},
      pagination: null,
      summary: null,
      filtersApplied: null,
      availableFilters: null,
      isLoading: false,
      error: null,

      // Filter and sort state
      currentFilters: {
        page: 1,
        limit: 10,
        search: "",
        status: "",
        payment_status: "",
        date_from: "",
        date_to: "",
        sort_by: "date",
        sort_order: "desc",
      },

      // Actions
      setOrders: (orders) => set({ orders, error: null }),

      setPagination: (pagination) => set({ pagination }),

      setSummary: (summary) => set({ summary }),

      setFiltersApplied: (filtersApplied) => set({ filtersApplied }),

      setAvailableFilters: (availableFilters) => set({ availableFilters }),

      setOrderDetails: (orderIdentifier, details) =>
        set((state) => ({
          orderDetails: {
            ...state.orderDetails,
            [orderIdentifier]: details,
          },
          error: null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // Filter management
      updateFilters: (newFilters) =>
        set((state) => ({
          currentFilters: {
            ...state.currentFilters,
            ...newFilters,
            // Reset page to 1 when filters change (except for page itself)
            page: newFilters.page !== undefined ? newFilters.page : 1,
          },
        })),

      resetFilters: () =>
        set({
          currentFilters: {
            page: 1,
            limit: 10,
            search: "",
            status: "",
            payment_status: "",
            date_from: "",
            date_to: "",
            sort_by: "date",
            sort_order: "desc",
          },
        }),

      // Pagination helpers
      setPage: (page) =>
        set((state) => ({
          currentFilters: {
            ...state.currentFilters,
            page,
          },
        })),

      nextPage: () =>
        set((state) => {
          const { pagination } = state
          if (pagination?.has_next) {
            return {
              currentFilters: {
                ...state.currentFilters,
                page: state.currentFilters.page + 1,
              },
            }
          }
          return state
        }),

      previousPage: () =>
        set((state) => {
          const { pagination } = state
          if (pagination?.has_prev) {
            return {
              currentFilters: {
                ...state.currentFilters,
                page: state.currentFilters.page - 1,
              },
            }
          }
          return state
        }),

      // Utility functions
      getOrderById: (orderId) => {
        const { orders } = get()
        return orders.find((order) => order.id === orderId)
      },

      getOrderByNumber: (orderNumber) => {
        const { orders } = get()
        return orders.find((order) => order.number === orderNumber)
      },

      getOrderDetails: (orderIdentifier) => {
        const { orderDetails } = get()
        return orderDetails[orderIdentifier]
      },

      hasOrderDetails: (orderIdentifier) => {
        const { orderDetails } = get()
        return !!orderDetails[orderIdentifier]
      },

      // Status helpers
      getOrdersByStatus: (status) => {
        const { orders } = get()
        return orders.filter((order) => order.status.code === status)
      },

      getOrderCountByStatus: (status) => {
        const { orders } = get()
        return orders.filter((order) => order.status.code === status).length
      },

      getTotalOrdersCount: () => {
        const { summary } = get()
        return summary?.total_orders || 0
      },

      getTotalAmountSpent: () => {
        const { summary } = get()
        return summary?.total_spent || 0
      },

      // Clear data (on logout)
      clearOrderData: () =>
        set({
          orders: [],
          orderDetails: {},
          pagination: null,
          summary: null,
          filtersApplied: null,
          availableFilters: null,
          error: null,
        }),

      // Search and filter helpers
      hasActiveFilters: () => {
        const { currentFilters } = get()
        return !!(
          currentFilters.search ||
          currentFilters.status ||
          currentFilters.payment_status ||
          currentFilters.date_from ||
          currentFilters.date_to ||
          currentFilters.sort_by !== "date" ||
          currentFilters.sort_order !== "desc"
        )
      },

      getActiveFiltersCount: () => {
        const { currentFilters } = get()
        let count = 0
        if (currentFilters.search) count++
        if (currentFilters.status) count++
        if (currentFilters.payment_status) count++
        if (currentFilters.date_from) count++
        if (currentFilters.date_to) count++
        if (currentFilters.sort_by !== "date") count++
        if (currentFilters.sort_order !== "desc") count++
        return count
      },
    }),
    {
      name: "ramesh-sweets-order-store",
      partialize: (state) => ({
        // Only persist filters, not the actual order data
        currentFilters: state.currentFilters,
      }),
    },
  ),
)

export default useOrderStore
