"use client"

import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useOrders } from "../../contexts/OrderContext"
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Package,
  CreditCard,
  User,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  X,
} from "lucide-react"

const OrderList = () => {
  const navigate = useNavigate()
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    fetchOrders,
    updateFilters,
    resetFilters,
    exportOrders,
    clearError,
  } = useOrders()

  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [localFilters, setLocalFilters] = useState(filters)
  const [summary, setSummary] = useState(null)

  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    fetchOrders(1).then((response) => {
      if (response?.summary) {
        setSummary(response.summary)
      }
    })
  }, [fetchOrders])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // Debounce the search to avoid too many API calls
    clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: value })
      fetchOrders(1, { ...filters, search: value })
    }, 500)
  }

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    updateFilters(localFilters)
    fetchOrders(1, localFilters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    const clearedFilters = {
      status: "",
      payment_status: "",
      payment_method: "",
      search: "",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      sort_order: "desc",
    }
    setLocalFilters(clearedFilters)
    setSearchTerm("")
    resetFilters()
    fetchOrders(1, clearedFilters)
    setShowFilters(false)
  }

  const handlePageChange = (page) => {
    fetchOrders(page)
  }

  const handleExport = async () => {
    try {
      await exportOrders(filters)
    } catch (err) {
      console.error("Export failed:", err)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      placed: "bg-blue-100 text-blue-800 border-blue-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      preparing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      prepared: "bg-purple-100 text-purple-800 border-purple-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPaymentMethodLabel = (method) => {
    return method === "cod" ? "Cash on Delivery" : "Online Payment"
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders/statistics"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Statistics
          </Link>

          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-ramesh-gold text-white rounded-lg hover:bg-ramesh-gold/90 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="luxury-card rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_orders}</p>
              </div>
            </div>
          </div>

          <div className="luxury-card rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{Number.parseFloat(summary.total_revenue).toLocaleString()}/-
                </p>
              </div>
            </div>
          </div>

          <div className="luxury-card rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Placed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summary.placed_orders}</p>
              </div>
            </div>
          </div>

          <div className="luxury-card rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{summary.delivered_orders}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <X className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="luxury-card rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, customer name, or phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="luxury-input w-full pl-10 pr-4 py-2 rounded-lg"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.values(filters).some((v) => v && v !== "created_at" && v !== "desc") && (
              <span className="ml-2 inline-flex items-center justify-center w-2 h-2 bg-ramesh-gold rounded-full"></span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                <select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="luxury-input w-full rounded-lg"
                >
                  <option value="">All Statuses</option>
                  <option value="placed">Order Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="prepared">Prepared</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={localFilters.payment_status}
                  onChange={(e) => handleFilterChange("payment_status", e.target.value)}
                  className="luxury-input w-full rounded-lg"
                >
                  <option value="">All Payment Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={localFilters.payment_method}
                  onChange={(e) => handleFilterChange("payment_method", e.target.value)}
                  className="luxury-input w-full rounded-lg"
                >
                  <option value="">All Methods</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={localFilters.date_from}
                  onChange={(e) => handleFilterChange("date_from", e.target.value)}
                  className="luxury-input w-full rounded-lg"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={localFilters.date_to}
                  onChange={(e) => handleFilterChange("date_to", e.target.value)}
                  className="luxury-input w-full rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-ramesh-gold rounded-lg hover:bg-ramesh-gold/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="luxury-card rounded-lg">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders match your current filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Progress
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-yellow-50 hover:shadow-lg hover:border-l-4 hover:border-l-yellow-400 transition-all duration-300 cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{order.number}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {order.date} at {order.time}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Package className="h-4 w-4 mr-1" />
                            {order.summary.items} items ({order.summary.quantity} qty)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {order.customer.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-1" />
                            {order.customer.phone}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {order.shipping.city}, {order.shipping.state}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status.code)}`}
                          >
                            {order.status.label}
                          </span>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-ramesh-gold h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${order.status.progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{order.status.progress}% complete</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment.status)}`}
                          >
                            {order.payment.status}
                          </span>
                          <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {getPaymentMethodLabel(order.payment.method)}
                          </div>
                          {order.payment.status === "refunded" && (
                            <div className="text-xs text-red-600 mt-1">
                              ₹{order.payment.refund_amount || order.payment.amount}/- Refunded
                            </div>
                          )}
                          {order.payment.received && order.payment.status !== "refunded" && (
                            <div className="text-xs text-green-600 mt-1">✓ Payment Received</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">₹{order.summary.amount.toLocaleString()}/-</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/orders/${order.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-yellow-600 bg-yellow-100 rounded-lg hover:bg-yellow-200 hover:text-yellow-700 hover:shadow-md group-hover:bg-yellow-200 group-hover:shadow-md transition-all duration-300"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 hover:bg-yellow-50 hover:shadow-xl hover:border-l-4 hover:border-l-yellow-400 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{order.number}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {order.date} at {order.time}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status.code)}`}
                    >
                      {order.status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {order.customer.name}
                      </p>
                      <p className="text-sm text-gray-500">{order.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">₹{order.summary.amount.toLocaleString()}/-</p>
                      <p className="text-sm text-gray-500">{order.summary.items} items</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-ramesh-gold h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${order.status.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{order.status.progress}% complete</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment.status)}`}
                      >
                        {getPaymentMethodLabel(order.payment.method)} - {order.payment.status}
                      </span>
                      {order.payment.status === "refunded" && (
                        <div className="text-xs text-red-600">
                          ₹{order.payment.refund_amount || order.payment.amount}/- Refunded
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-yellow-600 bg-yellow-100 rounded-lg hover:bg-yellow-200 hover:text-yellow-700 hover:shadow-md group-hover:bg-yellow-200 group-hover:shadow-md transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.has_prev}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.has_next}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default OrderList
