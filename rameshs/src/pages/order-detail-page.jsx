"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Download,
  RotateCcw,
  Phone,
  ChevronRight,
  Copy,
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChefHat,
  PackageCheck,
  X,
  DollarSign,
  Undo2,
  Info,
  Shield,
  AlertTriangle,
} from "lucide-react"
import { useOrderDetails, useReorderItems } from "../hooks/useOrders.js"
import { useDownloadInvoice } from "../hooks/usePayment.js"
import LoadingSpinner from "../components/common/loading-spinner.jsx"
import { Button } from "../components/ui/button.jsx"
import apiClient from "../services/api-client.js"

const OrderDetailPage = () => {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [copiedTracking, setCopiedTracking] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Validate access token and handle refresh
  useEffect(() => {
    if (!orderNumber) {
      navigate("/profile?section=orders", { replace: true })
      return
    }

    if (!token) {
      // If no token in URL, try to get from sessionStorage (for refresh case)
      const storedToken = sessionStorage.getItem(`order_detail_token_${orderNumber}`)
      if (!storedToken) {
        navigate("/profile?section=orders", { replace: true })
        return
      }
      // Update URL with token from storage
      navigate(`/profile/orders/${orderNumber}?token=${storedToken}`, { replace: true })
      return
    }

    const storedToken = sessionStorage.getItem(`order_detail_token_${orderNumber}`)
    if (!storedToken || storedToken !== token) {
      // If tokens don't match, store the current token
      if (token) {
        sessionStorage.setItem(`order_detail_token_${orderNumber}`, token)
      } else {
        navigate("/profile?section=orders", { replace: true })
        return
      }
    }

    // Set expiration for token (30 minutes)
    const tokenExpiry = sessionStorage.getItem(`order_detail_token_expiry_${orderNumber}`)
    const now = Date.now()

    if (!tokenExpiry || now > Number.parseInt(tokenExpiry)) {
      // Set new expiry
      const expiryTime = now + 30 * 60 * 1000 // 30 minutes
      sessionStorage.setItem(`order_detail_token_expiry_${orderNumber}`, expiryTime.toString())

      // Set cleanup timer
      setTimeout(
        () => {
          sessionStorage.removeItem(`order_detail_token_${orderNumber}`)
          sessionStorage.removeItem(`order_detail_token_expiry_${orderNumber}`)
        },
        30 * 60 * 1000,
      )
    }
  }, [token, orderNumber, navigate])

  const {
    data: orderDetails,
    isLoading,
    error,
    refetch,
  } = useOrderDetails(orderNumber, {
    include_timeline: true,
    include_tracking: true,
    include_return_info: true,
  })

  const downloadInvoiceMutation = useDownloadInvoice()
  const reorderItems = useReorderItems()

  // Accurate status configuration for all order states
  const statusConfig = {
    placed: {
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "Order Placed",
      description: "Your order has been successfully placed",
      progress: 12.5,
    },
    preparing: {
      icon: ChefHat,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      label: "Preparing",
      description: "Your order is being prepared",
      progress: 25,
    },
    prepared: {
      icon: PackageCheck,
      color: "text-[#c7a668]",
      bg: "bg-amber-50",
      border: "border-[#c7a668]",
      label: "Prepared",
      description: "Your order is ready for shipment",
      progress: 50,
    },
    shipped: {
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      label: "Shipped",
      description: "Your order is on the way",
      progress: 75,
    },
    delivered: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      label: "Delivered",
      description: "Your order has been delivered",
      progress: 100,
    },
    cancelled: {
      icon: X,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Cancelled",
      description: "Your order has been cancelled",
      progress: 0,
    },
    refunded: {
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      label: "Refunded",
      description: "Your refund has been processed",
      progress: 100,
    },
    returned: {
      icon: Undo2,
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      label: "Returned",
      description: "Your order has been returned",
      progress: 100,
    },
  }

  // Payment status configuration
  const paymentStatusConfig = {
    paid: {
      color: "bg-green-100 text-green-800",
      label: "Payment Successful",
    },
    pending: {
      color: "bg-orange-100 text-orange-800",
      label: "Payment Pending",
    },
    failed: {
      color: "bg-red-100 text-red-800",
      label: "Payment Failed",
    },
    partially_refunded: {
      color: "bg-blue-100 text-blue-800",
      label: "Partially Refunded",
    },
    refunded: {
      color: "bg-indigo-100 text-indigo-800",
      label: "Refunded",
    },
    cancelled: {
      color: "bg-gray-100 text-gray-800",
      label: "Payment Cancelled",
    },
  }

  // Order status flow for timeline
  const statusFlow = ["placed", "preparing", "prepared", "shipped", "delivered"]
  const negativeStates = ["cancelled", "refunded", "returned"]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  // Helper function to construct image URL using apiClient
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=80&width=80"
    return apiClient.getImageUrl(imagePath)
  }

  const getStatusConfig = (status) => {
    const statusKey = status?.toLowerCase() || "placed"
    return statusConfig[statusKey] || statusConfig.placed
  }

  const getPaymentStatusConfig = (status) => {
    const statusKey = status?.toLowerCase() || "pending"
    return paymentStatusConfig[statusKey] || paymentStatusConfig.pending
  }

  const handleReorder = () => {
    reorderItems.mutate(orderNumber)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle browser refresh by checking if we have valid token
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Keep token in sessionStorage for refresh
      if (token && orderNumber) {
        sessionStorage.setItem(`order_detail_token_${orderNumber}`, token)
        sessionStorage.setItem(`order_detail_token_expiry_${orderNumber}`, (Date.now() + 30 * 60 * 1000).toString())
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [token, orderNumber])

  const handleDownloadInvoice = () => {
    if (orderNumber) {
      downloadInvoiceMutation.mutate(orderNumber)
    }
  }

  // Handle tracking URL redirect
  const handleTrackOrder = () => {
    if (tracking?.url) {
      window.open(tracking.url, "_blank", "noopener,noreferrer")
    }
  }

  // Generate timeline based on current status and actual timeline data
  const generateTimeline = (currentStatus, actualTimeline = []) => {
    const currentStatusKey = currentStatus?.toLowerCase() || "placed"

    // If it's a negative state, show only that state
    if (negativeStates.includes(currentStatusKey)) {
      return actualTimeline.length > 0
        ? actualTimeline.map((event) => ({
            ...event,
            label: statusConfig[event.status]?.label || event.label,
            description: statusConfig[event.status]?.description || event.description,
            completed: true,
          }))
        : [
            {
              status: currentStatusKey,
              label: statusConfig[currentStatusKey].label,
              description: statusConfig[currentStatusKey].description,
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString(),
              completed: true,
            },
          ]
    }

    // For positive flow, merge actual timeline with status flow
    const timeline = []
    const currentIndex = statusFlow.indexOf(currentStatusKey)

    statusFlow.forEach((status, index) => {
      const config = statusConfig[status]
      const isCompleted = index <= currentIndex
      const isCurrent = index === currentIndex

      // Check if we have actual data for this status
      const actualEvent = actualTimeline.find((event) => event.status?.toLowerCase() === status)

      timeline.push({
        status,
        label: config.label,
        description: config.description,
        date: actualEvent?.date || (isCompleted ? new Date().toLocaleDateString() : null),
        time: actualEvent?.time || (isCompleted ? new Date().toLocaleTimeString() : null),
        notes: actualEvent?.notes || null,
        completed: isCompleted,
        current: isCurrent,
        estimated: !actualEvent && !isCompleted,
      })
    })

    return timeline
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#c7a668] rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <LoadingSpinner />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Order Details</h3>
          <p className="text-gray-600">Please wait while we fetch your order information...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
          <p className="text-gray-600 mb-6">The order details could not be loaded.</p>
          <Button
            onClick={() => navigate("/profile?section=orders")}
            className="bg-[#c7a668] hover:bg-[#b8955e] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-6">You don't have permission to view this order or the access has expired.</p>
          <div className="flex items-center justify-center space-x-3">
            <Button
              onClick={() => navigate("/profile?section=orders")}
              className="bg-[#c7a668] hover:bg-[#b8955e] text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Extract data from the new API structure
  const basic = orderDetails?.basic || {}
  const items = orderDetails?.items?.items || []
  const itemsSummary = orderDetails?.items?.summary || {}
  const pricing = orderDetails?.pricing || {}
  const shipping = orderDetails?.shipping || {}
  const payment = orderDetails?.payment || {}
  const actualTimeline = orderDetails?.timeline || []
  const tracking = orderDetails?.tracking
  const actions = orderDetails?.actions || {}

  const currentStatus = basic?.status?.code || "placed"
  const paymentStatus = basic?.payment_status?.code || payment?.status || "pending"
  const statusConfigData = getStatusConfig(currentStatus)
  const paymentStatusData = getPaymentStatusConfig(paymentStatus)
  const StatusIcon = statusConfigData.icon

  // Generate complete timeline
  const timeline = generateTimeline(currentStatus, actualTimeline)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/profile?section=orders")}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <Link to="/" className="hover:text-gray-700 transition-colors">
                    Home
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <Link to="/profile?section=orders" className="hover:text-gray-700 transition-colors">
                    Orders
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">#{basic.number}</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>

              {/* Show tracking button for shipped orders */}
              {tracking?.number && (
                <Button variant="outline" onClick={handleTrackOrder} size="sm">
                  <Truck className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
              )}

              {/* Show invoice download for paid orders or when payment exists */}
              {(payment?.method || basic.payment_status) && (
                <Button variant="outline" onClick={handleDownloadInvoice} disabled={downloadInvoiceMutation.isLoading}>
                  {downloadInvoiceMutation.isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      View Invoice
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleReorder}
                disabled={reorderItems.isPending}
                className="bg-[#c7a668] hover:bg-[#b8955e] text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {reorderItems.isPending ? "Adding to Cart..." : "Reorder Items"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${statusConfigData.bg}`}>
                    <StatusIcon className={`h-6 w-6 ${statusConfigData.color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Order #{basic.number}</h2>
                    <p className="text-gray-600">
                      Placed on {basic.date} • {basic.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfigData.bg} ${statusConfigData.color}`}
                  >
                    {basic.status?.label || statusConfigData.label}
                  </span>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${paymentStatusData.color}`}
                    >
                      {basic.payment_status?.label || paymentStatusData.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special alert for partially refunded orders */}
              {paymentStatus === "partially_refunded" && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Partial Refund Processed</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        A partial refund has been processed for this order. Check the timeline below for details.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar - Only show for positive flow */}
              {!negativeStates.includes(currentStatus.toLowerCase()) && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Order Progress</span>
                    <span>{basic.status?.progress || statusConfigData.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#c7a668] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${basic.status?.progress || statusConfigData.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Enhanced Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {timeline.map((event, index) => {
                    const eventStatusConfig = statusConfig[event.status]
                    const EventIcon = eventStatusConfig.icon
                    const isLast = index === timeline.length - 1

                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`p-2 rounded-full ${
                              event.completed
                                ? eventStatusConfig.bg
                                : event.current
                                  ? eventStatusConfig.bg
                                  : "bg-gray-100"
                            }`}
                          >
                            <EventIcon
                              className={`h-4 w-4 ${
                                event.completed
                                  ? eventStatusConfig.color
                                  : event.current
                                    ? eventStatusConfig.color
                                    : "text-gray-400"
                              }`}
                            />
                          </div>
                          {!isLast && (
                            <div className={`w-px h-6 mt-2 ${event.completed ? "bg-[#c7a668]" : "bg-gray-200"}`}></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm font-medium ${
                                event.completed || event.current ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {event.label}
                            </h4>
                            {event.date && event.time && (
                              <span className="text-sm text-gray-500">
                                {event.date} • {event.time}
                              </span>
                            )}
                            {event.estimated && <span className="text-xs text-gray-400 italic">Estimated</span>}
                          </div>
                          <p
                            className={`text-sm mt-1 ${
                              event.completed || event.current ? "text-gray-600" : "text-gray-400"
                            }`}
                          >
                            {event.description}
                          </p>
                          {event.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600 italic">
                              "{event.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {tracking && tracking.number && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                        {tracking.carrier && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Shield className="w-3 h-3 mr-1" />
                            {tracking.carrier}
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-mono text-gray-900 mb-3">{tracking.number}</p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(tracking.number)
                            setCopiedTracking(true)
                            setTimeout(() => setCopiedTracking(false), 2000)
                          }}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          {copiedTracking ? "Copied!" : "Copy"}
                        </Button>
                        {tracking.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTrackOrder}
                            className="bg-[#c7a668] hover:bg-[#b8955e] text-white border-[#c7a668]"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Track Package
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No items found for this order</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={getImageUrl(item.product?.image) || "/placeholder.svg"}
                        alt={item.product?.name || "Product"}
                        className="w-20 h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product?.name || "Unknown Product"}</h4>
                        {item.product?.sku && <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>}
                        {item.variant?.name && (
                          <p className="text-sm text-gray-600 mt-1">Variant: {item.variant.name}</p>
                        )}
                        {item.pricing?.original !== item.pricing?.selling && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.pricing?.original)}
                            </span>
                            <span className="text-sm text-green-600 font-medium">
                              Save {formatCurrency(item.pricing?.discount)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.status?.code === "delivered"
                                ? "bg-green-100 text-green-800"
                                : item.status?.code === "shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : item.status?.code === "preparing"
                                    ? "bg-orange-100 text-orange-800"
                                    : item.status?.code === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.status?.label || "Order Placed"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.pricing?.selling)} each</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(item.pricing?.line_total)}</p>
                      </div>
                    </div>
                  ))}

                  {/* Items Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Total Items: {itemsSummary.total_items} ({itemsSummary.total_qty} units)
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(itemsSummary.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price</span>
                  <span className="text-gray-900">{formatCurrency(pricing?.original_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(pricing?.subtotal)}</span>
                </div>
                {pricing?.discounts?.product > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Discount</span>
                    <span className="text-green-600">-{formatCurrency(pricing.discounts.product)}</span>
                  </div>
                )}
                {pricing?.discounts?.coupon > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coupon Discount</span>
                    <span className="text-green-600">-{formatCurrency(pricing.discounts.coupon)}</span>
                  </div>
                )}
                {pricing?.taxes?.total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tax ({pricing.taxes.type === "cgst_sgst" ? "CGST + SGST" : "IGST"})
                    </span>
                    <span className="text-gray-900">{formatCurrency(pricing.taxes.total)}</span>
                  </div>
                )}
                {pricing?.charges?.shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Charges</span>
                    <span className="text-gray-900">{formatCurrency(pricing.charges.shipping)}</span>
                  </div>
                )}
                {pricing?.charges?.payment > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Charges</span>
                    <span className="text-gray-900">{formatCurrency(pricing.charges.payment)}</span>
                  </div>
                )}
                {pricing?.roundoff && pricing.roundoff !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roundoff</span>
                    <span className={pricing.roundoff < 0 ? "text-green-600" : "text-gray-900"}>
                      {pricing.roundoff < 0 ? "-" : "+"}
                      {formatCurrency(Math.abs(pricing.roundoff))}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(pricing?.final_total)}</span>
                  </div>
                </div>
                {pricing?.discounts?.total > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 mt-3">
                    <div className="flex items-center">
                      <Info className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        You saved {formatCurrency(pricing.discounts.total)}!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            {payment && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="text-gray-900">{payment.method_label}</span>
                  </div>
                  {payment.transaction_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="text-gray-900 font-mono text-sm">{payment.transaction_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatusData.color}`}
                    >
                      {basic.payment_status?.label || paymentStatusData.label}
                    </span>
                  </div>
                  {payment.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid On</span>
                      <span className="text-gray-900">{formatDate(payment.completed_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {shipping?.address && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#c7a668]" />
                  Shipping Address
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{shipping.address.name}</p>
                  <p className="text-gray-600">{shipping.address.line1}</p>
                  {shipping.address.line2 && <p className="text-gray-600">{shipping.address.line2}</p>}
                  <p className="text-gray-600">
                    {shipping.address.city}, {shipping.address.state} {shipping.address.pincode}
                  </p>
                  <p className="text-gray-600">{shipping.address.country}</p>
                  <div className="flex items-center pt-2">
                    <Phone className="h-4 w-4 mr-2 text-[#c7a668]" />
                    <span className="text-sm text-gray-600">{shipping.address.phone}</span>
                  </div>
                </div>
                {shipping.delivery?.estimated_date && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#c7a668]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {shipping.delivery.actual_date ? "Delivered On" : "Expected Delivery"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(shipping.delivery.estimated_date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
