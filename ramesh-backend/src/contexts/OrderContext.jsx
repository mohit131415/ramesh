"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { orderService } from "../services/orderService"

const OrderContext = createContext()

export const useOrders = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false,
  })
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
    payment_method: "",
    search: "",
    date_from: "",
    date_to: "",
    sort_by: "created_at",
    sort_order: "desc",
  })
  const [statistics, setStatistics] = useState(null)

  // Fetch orders with current filters and pagination
  const fetchOrders = useCallback(
    async (page = 1, customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const params = {
          page,
          limit: pagination.limit,
          ...filters,
          ...customFilters,
        }

        // Remove empty filters
        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await orderService.getOrders(params)

        if (response.status === "success") {
          setOrders(response.data.orders)
          setPagination(response.meta.pagination)
          return response.data
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders")
        console.error("Error fetching orders:", err)
      } finally {
        setLoading(false)
      }
    },
    [filters, pagination.limit],
  )

  // Fetch single order
  const fetchOrder = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await orderService.getOrderById(id)

      if (response.status === "success") {
        setCurrentOrder(response.data)
        return response.data
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order")
      console.error("Error fetching order:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update order status
  const updateOrderStatus = useCallback(
    async (id, statusData) => {
      setLoading(true)
      setError(null)

      try {
        const response = await orderService.updateOrderStatus(id, statusData)

        if (response.status === "success") {
          // Update current order if it's the same
          if (currentOrder && currentOrder.basic.id === id) {
            setCurrentOrder(response.data.data)
          }

          // Update orders list
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === id ? { ...order, status: response.data.data.basic.status } : order,
            ),
          )

          return response.data
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update order status")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [currentOrder],
  )

  // Cancel order
  const cancelOrder = useCallback(
    async (id, cancelData) => {
      setLoading(true)
      setError(null)

      try {
        const response = await orderService.cancelOrder(id, cancelData)

        if (response.status === "success") {
          // Update current order if it's the same
          if (currentOrder && currentOrder.basic.id === id) {
            setCurrentOrder(response.data.data)
          }

          // Update orders list
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === id ? { ...order, status: { code: "cancelled", label: "Cancelled", color: "red" } } : order,
            ),
          )

          return response.data
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to cancel order")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [currentOrder],
  )

  // Process refund
  const processRefund = useCallback(
    async (id, refundData) => {
      setLoading(true)
      setError(null)

      try {
        const response = await orderService.processRefund(id, refundData)

        if (response.status === "success") {
          // Update current order if it's the same
          if (currentOrder && currentOrder.basic.id === id) {
            setCurrentOrder(response.data.data)
          }

          return response.data
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to process refund")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [currentOrder],
  )

  // Update shipping details
  const updateShipping = useCallback(
    async (id, shippingData) => {
      setLoading(true)
      setError(null)

      try {
        const response = await orderService.updateShipping(id, shippingData)

        if (response.status === "success") {
          // Update current order if it's the same
          if (currentOrder && currentOrder.basic.id === id) {
            setCurrentOrder(response.data.data)
          }

          return response.data
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update shipping details")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [currentOrder],
  )

  // Mark payment as received
  const markPaymentReceived = useCallback(
    async (id, paymentData) => {
      setLoading(true)
      setError(null)

      try {
        const response = await orderService.markPaymentReceived(id, paymentData)

        if (response.status === "success") {
          // Update current order if it's the same
          if (currentOrder && currentOrder.basic.id === id) {
            setCurrentOrder(response.data.data)
          }

          return response.data
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to mark payment as received")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [currentOrder],
  )

  // Mark order as returned
  const markOrderReturn = useCallback(
    async (id, returnData) => {
      setLoading(true)
      setError(null)

      try {
        const response = await orderService.markOrderReturn(id, returnData)

        if (response.status === "success") {
          // Update current order if it's the same
          if (currentOrder && currentOrder.basic.id === id) {
            setCurrentOrder(response.data.data)
          }

          return response.data
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to mark order as returned")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [currentOrder],
  )

  // Fetch order statistics
  const fetchStatistics = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await orderService.getOrderStatistics(params)

      if (response.status === "success") {
        setStatistics(response.data)
        return response.data
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch statistics")
      console.error("Error fetching statistics:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Export orders
  const exportOrders = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await orderService.exportOrders(params)

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `orders-${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export orders")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: "",
      payment_status: "",
      payment_method: "",
      search: "",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      sort_order: "desc",
    })
  }, [])

  // Clear current order
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null)
  }, [])

  const value = {
    // State
    orders,
    currentOrder,
    loading,
    error,
    pagination,
    filters,
    statistics,

    // Actions
    fetchOrders,
    fetchOrder,
    updateOrderStatus,
    cancelOrder,
    processRefund,
    updateShipping,
    markPaymentReceived,
    markOrderReturn,
    fetchStatistics,
    exportOrders,
    updateFilters,
    resetFilters,
    clearCurrentOrder,

    // Utilities
    setError: (error) => setError(error),
    clearError: () => setError(null),
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}
