import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { orderService } from "../services/order-service"
import useAuthStore from "../store/authStore"
import useOrderStore from "../store/orderStore"

// Order history hook with filtering and pagination
export const useOrderHistory = () => {
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuthStore()
  const {
    currentFilters,
    setOrders,
    setPagination,
    setSummary,
    setFiltersApplied,
    setAvailableFilters,
    setLoading,
    setError,
  } = useOrderStore()

  return useQuery({
    queryKey: ["orders", "history", currentFilters],
    queryFn: async () => {
      try {
        setLoading(true)
        const response = await orderService.getOrderHistory(currentFilters)
        const data = response.data || response

        // Ensure orders have normalized status
        const normalizedOrders = (data.orders || []).map((order) => ({
          ...order,
          status: {
            ...order.status,
            // Force correct label based on status code
            label: getStatusLabel(order.status?.code),
          },
        }))

        setOrders(normalizedOrders)
        setPagination(data.pagination || null)
        setSummary(data.summary || null)
        setFiltersApplied(data.filters_applied || null)
        setAvailableFilters(data.filters || null)
        setError(null)

        return { ...data, orders: normalizedOrders }
      } catch (error) {
        console.error("Order history error:", error)
        setError(error.message)
        // Don't navigate to 404 - let the component handle the error
        throw error
      } finally {
        setLoading(false)
      }
    },
    enabled: isAuthenticated && !!token,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message?.includes("Authentication") || error.message?.includes("token")) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
  })
}

// Helper function to get correct status label
const getStatusLabel = (statusCode) => {
  const statusMap = {
    placed: "Order Placed",
    preparing: "Preparing",
    prepared: "Prepared",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
    returned: "Returned",
  }

  return statusMap[statusCode?.toLowerCase()] || "Order Placed"
}

// Order details hook with token validation
export const useOrderDetails = (orderNumber, options = {}) => {
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuthStore()
  const { setOrderDetails, setError } = useOrderStore()

  return useQuery({
    queryKey: ["orders", "details", orderNumber, options],
    queryFn: async () => {
      try {
        const accessToken = sessionStorage.getItem(`order_detail_token_${orderNumber}`)
        if (!accessToken) {
          throw new Error("Access token required")
        }

        const response = await orderService.getOrderDetails(orderNumber, {
          ...options,
          access_token: accessToken,
        })
        const data = response.data || response

        // Normalize status
        if (data.status) {
          data.status.label = getStatusLabel(data.status.code)
        }

        setOrderDetails(orderNumber, data)
        setError(null)
        return data
      } catch (error) {
        console.error("Order details error:", error)
        setError(error.message)
        // Only navigate to 404 for specific errors
        if (error.message?.includes("not found") || error.message?.includes("404")) {
          navigate("/404", { replace: true })
        }
        throw error
      }
    },
    enabled: isAuthenticated && !!token && !!orderNumber,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

// Download invoice mutation - opens in popup tab
export const useDownloadInvoice = () => {
  const { token } = useAuthStore()
  const { setError } = useOrderStore()

  return useMutation({
    mutationFn: async (orderNumber) => {
      try {
        // Construct the invoice URL with authentication
        const invoiceUrl = `/api/api/public/orders/invoice/${orderNumber}`

        // Create a temporary form to send the auth token via POST to avoid URL length issues
        const form = document.createElement("form")
        form.method = "POST"
        form.action = invoiceUrl
        form.target = "invoice-popup"
        form.style.display = "none"

        // Add auth token as form data
        const tokenInput = document.createElement("input")
        tokenInput.type = "hidden"
        tokenInput.name = "auth_token"
        tokenInput.value = token
        form.appendChild(tokenInput)

        document.body.appendChild(form)

        // Open popup window
        const popup = window.open(
          "",
          "invoice-popup",
          "width=800,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no",
        )

        if (!popup) {
          // Fallback if popup is blocked - open in new tab
          const fallbackUrl = `${invoiceUrl}?auth_token=${encodeURIComponent(token)}`
          window.open(fallbackUrl, "_blank")
          document.body.removeChild(form)
          return { success: true, method: "tab" }
        }

        // Submit form to popup
        form.submit()

        // Clean up
        document.body.removeChild(form)

        // Focus the popup
        popup.focus()

        return { success: true, method: "popup", orderNumber }
      } catch (error) {
        throw new Error(error.message || "Failed to open invoice")
      }
    },
    onSuccess: (result) => {
      setError(null)

      if (window.showToast) {
        window.showToast({
          title: "Invoice Opened",
          description: result.method === "popup" ? "Invoice opened in popup window." : "Invoice opened in new tab.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)
      if (window.showToast) {
        window.showToast({
          title: "Failed to Open Invoice",
          description: error.message || "Failed to open invoice. Please try again.",
          type: "error",
        })
      }
    },
  })
}

// Reorder items mutation
export const useReorderItems = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setError } = useOrderStore()

  return useMutation({
    mutationFn: orderService.reorderItems,
    onSuccess: (data, orderNumber) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      setError(null)

      if (window.showToast) {
        window.showToast({
          title: "Items Added to Cart",
          description: "Items from your previous order have been added to cart.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)
      if (window.showToast) {
        window.showToast({
          title: "Reorder Failed",
          description: error.message || "Failed to reorder items. Please try again.",
          type: "error",
        })
      }
    },
  })
}

// Cancel order mutation
export const useCancelOrder = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setError } = useOrderStore()

  return useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: (data, orderNumber) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setError(null)

      if (window.showToast) {
        window.showToast({
          title: "Order Cancelled",
          description: "Your order has been cancelled successfully.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)
      if (window.showToast) {
        window.showToast({
          title: "Cancellation Failed",
          description: error.message || "Failed to cancel order. Please try again.",
          type: "error",
        })
      }
    },
  })
}

// Custom hook for order status counts
export const useOrderStatusCounts = () => {
  const { summary } = useOrderStore()

  return {
    total: summary?.total_orders || 0,
    byStatus: summary?.by_status || [],
  }
}

// Custom hook for pagination helpers
export const useOrderPagination = () => {
  const { pagination, setPage, nextPage, previousPage } = useOrderStore()

  return {
    pagination,
    setPage: (page) => {
      // Ensure page is within valid range
      const validPage = Math.max(1, Math.min(page, pagination?.pages || 1))
      setPage(validPage)
    },
    nextPage,
    previousPage,
    canGoNext: pagination?.has_next || false,
    canGoPrevious: pagination?.has_prev || false,
    currentPage: pagination?.page || 1,
    totalPages: pagination?.pages || 1,
    totalItems: pagination?.total || 0,
    perPage: pagination?.limit || 10,
  }
}

// Custom hook for filter management
export const useOrderFilters = () => {
  const { currentFilters, updateFilters, resetFilters, hasActiveFilters, getActiveFiltersCount, availableFilters } =
    useOrderStore()

  return {
    filters: currentFilters,
    availableFilters,
    updateFilters,
    resetFilters,
    hasActiveFilters: hasActiveFilters(),
    activeFiltersCount: getActiveFiltersCount(),
  }
}
