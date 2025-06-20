import api from "./api"

export const orderService = {
  // List orders with filters and pagination
  async getOrders(params = {}) {
    try {
      const response = await api.get("/admin/orders", { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get order details by ID
  async getOrderById(id) {
    try {
      const response = await api.get(`/admin/orders/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update order status
  async updateOrderStatus(id, data) {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Cancel order
  async cancelOrder(id, data) {
    try {
      const response = await api.put(`/admin/orders/${id}/cancel`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Process refund
  async processRefund(id, data) {
    try {
      const response = await api.put(`/admin/orders/${id}/refund`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update shipping details
  async updateShipping(id, data) {
    try {
      const response = await api.put(`/admin/orders/${id}/shipping`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Mark payment as received
  async markPaymentReceived(id, data) {
    try {
      const response = await api.put(`/admin/orders/${id}/payment-received`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Mark order as returned
  async markOrderReturn(id, data) {
    try {
      const response = await api.put(`/admin/orders/${id}/return`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get order statistics
  async getOrderStatistics(params = {}) {
    try {
      const response = await api.get("/admin/orders/statistics/overview", { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Export orders
  async exportOrders(params = {}) {
    try {
      const response = await api.get("/admin/orders/export", {
        params,
        responseType: "blob",
      })
      return response
    } catch (error) {
      throw error
    }
  },
}
