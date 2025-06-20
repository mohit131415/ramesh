"use client"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  RotateCcw,
  ShoppingBag,
  X,
  Calendar,
  CreditCard,
  Download,
  ChefHat,
  PackageCheck,
  DollarSign,
  Undo2,
} from "lucide-react"
import {
  useOrderHistory,
  useOrderPagination,
  useDownloadInvoice,
  useReorderItems,
  useCancelOrder,
} from "../../hooks/useOrders"
import { Button } from "../ui/button"
import { formatCurrency } from "../../lib/formatters"
import apiClient from "../../services/api-client"
import useOrderStore from "../../store/orderStore"

const OrderHistorySection = () => {
  const navigate = useNavigate()
  const resetFilters = useOrderStore((state) => state.resetFilters)

  // Reset to page 1 when component mounts
  useEffect(() => {
    resetFilters()
  }, [resetFilters])

  // Hooks
  const { data: orderData, isLoading, refetch } = useOrderHistory()
  const { pagination, setPage, canGoNext, canGoPrevious, currentPage, totalPages } = useOrderPagination()
  const downloadInvoice = useDownloadInvoice()
  const reorderItems = useReorderItems()
  const cancelOrder = useCancelOrder()

  // Fresh load when component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  const orders = orderData?.orders || []
  const summary = orderData?.summary || { total_orders: 0, total_spent: 0 }

  // Accurate status configuration matching all order states
  const statusConfig = {
    placed: {
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
      label: "Order Placed",
    },
    preparing: {
      icon: ChefHat,
      color: "text-orange-600",
      bg: "bg-orange-50",
      textColor: "text-orange-600",
      label: "Preparing",
    },
    prepared: {
      icon: PackageCheck,
      color: "text-[#c7a668]",
      bg: "bg-amber-50",
      textColor: "text-[#c7a668]",
      label: "Prepared",
    },
    shipped: {
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
      textColor: "text-purple-600",
      label: "Shipped",
    },
    delivered: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      textColor: "text-green-600",
      label: "Delivered",
    },
    cancelled: {
      icon: X,
      color: "text-red-600",
      bg: "bg-red-50",
      textColor: "text-red-600",
      label: "Cancelled",
    },
    refunded: {
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      textColor: "text-indigo-600",
      label: "Refunded",
    },
    returned: {
      icon: Undo2,
      color: "text-gray-600",
      bg: "bg-gray-50",
      textColor: "text-gray-600",
      label: "Returned",
    },
  }

  // Payment status configuration
  const paymentStatusConfig = {
    paid: {
      color: "text-green-600",
      bg: "bg-green-50",
      label: "Paid",
    },
    pending: {
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      label: "Pending",
    },
    failed: {
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Failed",
    },
    partially_refunded: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Partially Refunded",
    },
    refunded: {
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      label: "Refunded",
    },
    cancelled: {
      color: "text-gray-600",
      bg: "bg-gray-50",
      label: "Cancelled",
    },
  }

  // Get payment status configuration
  const getPaymentStatusConfig = (paymentStatus) => {
    const statusCode = paymentStatus?.toLowerCase() || "pending"
    return paymentStatusConfig[statusCode] || paymentStatusConfig.pending
  }

  // Handlers
  const handleViewOrder = (orderNumber) => {
    const accessToken = btoa(`${orderNumber}_${Date.now()}_${Math.random()}`)
    sessionStorage.setItem(`order_detail_token_${orderNumber}`, accessToken)
    navigate(`/profile/orders/${orderNumber}?token=${accessToken}`)
  }

  const handleDownloadInvoice = (orderNumber) => {
    downloadInvoice.mutate(orderNumber)
  }

  const handleReorder = (orderNumber) => {
    reorderItems.mutate(orderNumber)
  }

  const handleCancelOrder = (orderNumber) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      cancelOrder.mutate(orderNumber)
    }
  }

  // Get status configuration based on status code
  const getStatusConfig = (status) => {
    const statusCode = status?.code?.toLowerCase() || "placed"
    const config = statusConfig[statusCode] || statusConfig.placed

    // Override label to ensure it's correct
    const correctLabel =
      {
        placed: "Order Placed",
        preparing: "Preparing",
        prepared: "Prepared",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
        refunded: "Refunded",
        returned: "Returned",
      }[statusCode] || "Order Placed"

    return {
      ...config,
      label: correctLabel,
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="h-20 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Order History</h1>
          <p className="text-sm text-gray-600 mt-1">
            {summary.total_orders} orders • {formatCurrency(summary.total_spent)} total spent
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here.</p>
            <Button onClick={() => navigate("/")} className="bg-[#c7a668] hover:bg-[#b8955e] text-white">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfigData = getStatusConfig(order.status)
              const StatusIcon = statusConfigData.icon

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-full ${statusConfigData.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfigData.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">Order #{order.number}</h3>
                        <p className="text-xs text-gray-600">
                          {order.date} • {order.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 mb-1">
                        <div className={`text-xs font-medium ${statusConfigData.textColor}`}>
                          {statusConfigData.label}
                        </div>
                        {order.payment?.status && (
                          <div
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentStatusConfig(order.payment.status).bg} ${getPaymentStatusConfig(order.payment.status).color}`}
                          >
                            {getPaymentStatusConfig(order.payment.status).label}
                          </div>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.summary?.amount)}</p>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <img
                            src={apiClient.getImageUrl(item.image) || "/placeholder.svg"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded border"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg?height=48&width=48"
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-600">Qty: {item.qty}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking Section - Only show if tracking exists */}
                  {order.tracking?.number && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-purple-900 mb-1">Package Tracking</h4>
                          <p className="text-xs text-purple-700">Tracking ID: {order.tracking.number}</p>
                        </div>
                        {order.tracking.url && (
                          <Button
                            onClick={() => window.open(order.tracking.url, "_blank")}
                            variant="outline"
                            className="border-purple-300 text-purple-700 hover:bg-purple-100 text-xs px-3 py-1 h-7"
                          >
                            <Truck className="w-3 h-3 mr-1" />
                            Track Package
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Info Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
                    <div>
                      <p className="text-gray-500 mb-1">Payment Method</p>
                      <div className="flex items-center">
                        <CreditCard className="w-3 h-3 text-[#c7a668] mr-1" />
                        <span className="font-medium text-gray-900">{order.payment?.label}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Expected Delivery</p>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 text-[#c7a668] mr-1" />
                        <span className="font-medium text-gray-900">
                          {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "TBD"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Order Summary</p>
                      <div className="flex items-center">
                        <Package className="w-3 h-3 text-[#c7a668] mr-1" />
                        <span className="font-medium text-gray-900">
                          {order.summary?.items} items ({order.summary?.quantity} units)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                    <Button
                      onClick={() => handleViewOrder(order.number)}
                      className="bg-[#c7a668] hover:bg-[#b8955e] text-white text-xs px-4 py-2 h-8"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>

                    {order.actions?.reorder && (
                      <Button
                        onClick={() => handleReorder(order.number)}
                        disabled={reorderItems.isPending}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-4 py-2 h-8"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        {reorderItems.isPending ? "Adding..." : "Reorder"}
                      </Button>
                    )}

                    {order.actions?.cancel && (
                      <Button
                        onClick={() => handleCancelOrder(order.number)}
                        disabled={cancelOrder.isPending}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 text-xs px-4 py-2 h-8"
                      >
                        <X className="w-3 h-3 mr-1" />
                        {cancelOrder.isPending ? "Cancelling..." : "Cancel"}
                      </Button>
                    )}
                    {order.actions?.invoice && (
                      <Button
                        onClick={() => handleDownloadInvoice(order.number)}
                        disabled={downloadInvoice.isPending}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-4 py-2 h-8"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        {downloadInvoice.isPending ? "Downloading..." : "Invoice"}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} • {pagination.total} total orders
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={!canGoPrevious}
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1 h-8 disabled:opacity-50"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {/* Show first page */}
                  {currentPage > 3 && (
                    <>
                      <button onClick={() => setPage(1)} className="px-2 py-1 text-xs rounded hover:bg-gray-100">
                        1
                      </button>
                      {currentPage > 4 && <span className="text-xs text-gray-400">...</span>}
                    </>
                  )}

                  {/* Show pages around current page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    // Skip if already shown
                    if (
                      (currentPage > 3 && pageNum === 1) ||
                      (currentPage < totalPages - 2 && pageNum === totalPages)
                    ) {
                      return null
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-2 py-1 text-xs rounded ${
                          currentPage === pageNum ? "bg-[#c7a668] text-white" : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  {/* Show last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="text-xs text-gray-400">...</span>}
                      <button
                        onClick={() => setPage(totalPages)}
                        className="px-2 py-1 text-xs rounded hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={!canGoNext}
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1 h-8 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistorySection
