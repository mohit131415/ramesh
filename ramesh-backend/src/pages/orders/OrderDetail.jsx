"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useOrders } from "../../contexts/OrderContext"
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  RefreshCw,
  Calendar,
  Hash,
  ShoppingBag,
  IndianRupee,
  FileText,
} from "lucide-react"
import { buildImageUrl } from "../../config/api.config"

import StatusUpdateModal from "./components/StatusUpdateModal"
import CancelOrderModal from "./components/CancelOrderModal"
import RefundModal from "./components/RefundModal"
import ShippingModal from "./components/ShippingModal"
import PaymentReceivedModal from "./components/PaymentReceivedModal"
import ReturnModal from "./components/ReturnModal"
import InvoiceModal from "./components/InvoiceModal"

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentOrder,
    loading,
    error,
    fetchOrder,
    updateOrderStatus,
    cancelOrder,
    processRefund,
    updateShipping,
    markPaymentReceived,
    markOrderReturn,
    clearError,
  } = useOrders()

  const [activeModal, setActiveModal] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchOrder(id)
    }
  }, [id, fetchOrder])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

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
      returned: "bg-orange-100 text-orange-800 border-orange-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800 border-orange-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleActionClick = (action) => {
    setSelectedOrder(currentOrder)

    switch (action.action) {
      case "update_status":
      case "preparing":
      case "prepared":
      case "shipped":
      case "delivered":
      case "confirm":
        setActiveModal("status")
        break
      case "cancel":
      case "cancelled":
        setActiveModal("cancel")
        break
      case "refund":
      case "process_refund":
        setActiveModal("refund")
        break
      case "ship":
      case "add_shipping":
      case "update_shipping":
        setActiveModal("shipping")
        break
      case "mark_payment_received":
      case "payment_received":
        setActiveModal("payment")
        break
      case "return":
      case "mark_return":
      case "returned":
        setActiveModal("return")
        break
      default:
        console.log("Unknown action:", action.action)
        // For debugging - let's see what actions we're getting
        console.log("Available action object:", action)
    }
  }

  const handleStatusUpdate = async (orderId, data) => {
    try {
      await updateOrderStatus(orderId, data)
      await fetchOrder(id) // Refresh order data
      setActiveModal(null) // Close modal
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handleCancelOrder = async (orderId, data) => {
    try {
      await cancelOrder(orderId, data)
      await fetchOrder(id) // Refresh order data
      setActiveModal(null) // Close modal
    } catch (error) {
      console.error("Failed to cancel order:", error)
    }
  }

  const handleProcessRefund = async (orderId, data) => {
    try {
      await processRefund(orderId, data)
      await fetchOrder(id) // Refresh order data
      setActiveModal(null) // Close modal
    } catch (error) {
      console.error("Failed to process refund:", error)
    }
  }

  const handleUpdateShipping = async (orderId, data) => {
    try {
      await updateShipping(orderId, data)
      await fetchOrder(id) // Refresh order data
      setActiveModal(null) // Close modal
    } catch (error) {
      console.error("Failed to update shipping:", error)
    }
  }

  const handleMarkPaymentReceived = async (orderId, data) => {
    try {
      await markPaymentReceived(orderId, data)
      await fetchOrder(id) // Refresh order data
      setActiveModal(null) // Close modal
    } catch (error) {
      console.error("Failed to mark payment received:", error)
    }
  }

  const handleMarkReturn = async (orderId, data) => {
    try {
      await markOrderReturn(orderId, data)
      await fetchOrder(id) // Refresh order data
      setActiveModal(null) // Close modal
    } catch (error) {
      console.error("Failed to mark return:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Order</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchOrder(id)}
          className="inline-flex items-center px-4 py-2 bg-ramesh-gold text-white rounded-lg hover:bg-ramesh-gold/90"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
        <p className="text-gray-600">The order you're looking for doesn't exist.</p>
      </div>
    )
  }

  const { basic, customer, items, pricing, shipping, payment, timeline, available_actions } = currentOrder

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Hash className="h-6 w-6 mr-2 text-ramesh-gold" />
              {basic.number}
            </h1>
            <p className="text-gray-600 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-2" />
              Order placed on {basic.date} at {basic.time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-ramesh-gold bg-ramesh-gold/10 border border-ramesh-gold/20 rounded-lg hover:bg-ramesh-gold/20 focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:ring-offset-2"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Invoice
          </button>
          <button
            onClick={() => fetchOrder(id)}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(basic.status.code)}`}
            >
              {basic.status.label}
            </span>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getPaymentStatusColor(basic.payment_status.code)}`}
            >
              {basic.payment_status.label}
            </span>
          </div>

          {/* Action Buttons */}
          {available_actions && available_actions.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              {available_actions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleActionClick(action)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    action.action === "cancel" || action.action === "cancelled"
                      ? "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
                      : action.action === "refund"
                        ? "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100"
                        : action.action === "return"
                          ? "text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100"
                          : action.action === "mark_payment_received"
                            ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                            : "text-ramesh-gold bg-ramesh-gold/10 border border-ramesh-gold/20 hover:bg-ramesh-gold/20"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No actions available for this order</div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Order Progress</span>
            <span>{basic.status.progress}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-ramesh-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${basic.status.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Order Items ({items.summary.total_items} items, {items.summary.total_qty} qty)
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {items.items.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        item.product.image ? buildImageUrl(item.product.image) : "/placeholder.svg?height=80&width=80"
                      }
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                          {item.variant && (
                            <p className="text-sm text-gray-600">
                              Variant: {item.variant.name} ({item.variant.weight}g)
                            </p>
                          )}
                          <p className="text-sm text-gray-600">HSN: {item.product.hsn_code}</p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(item.status.code)}`}
                          >
                            {item.status.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{item.pricing.line_total}/-</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Original:</span>
                          <span className="ml-1 font-medium">₹{item.pricing.original}/-</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Selling:</span>
                          <span className="ml-1 font-medium">₹{item.pricing.selling}/-</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tax ({item.pricing.tax_rate}%):</span>
                          <span className="ml-1 font-medium">₹{item.pricing.tax_amount}/-</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Discount:</span>
                          <span className="ml-1 font-medium text-green-600">-₹{item.pricing.discount}/-</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <IndianRupee className="h-5 w-5 mr-2" />
                Pricing Details
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="font-medium">₹{pricing.original_price}/-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Amount:</span>
                  <span className="font-medium">₹{pricing.base_amount}/-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{pricing.subtotal}/-</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Product Discounts:</span>
                  <span className="font-medium">-₹{pricing.discounts.product}/-</span>
                </div>
                {pricing.discounts.coupon > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount:</span>
                    <span className="font-medium">-₹{pricing.discounts.coupon}/-</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({pricing.taxes.type.toUpperCase()}):</span>
                  <span className="font-medium">₹{pricing.taxes.total}/-</span>
                </div>
                {pricing.taxes.cgst > 0 && (
                  <div className="ml-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">CGST:</span>
                      <span>₹{pricing.taxes.cgst}/-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SGST:</span>
                      <span>₹{pricing.taxes.sgst}/-</span>
                    </div>
                  </div>
                )}
                {pricing.taxes.igst > 0 && (
                  <div className="ml-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">IGST:</span>
                      <span>₹{pricing.taxes.igst}/-</span>
                    </div>
                  </div>
                )}
                {pricing.charges.shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Charges:</span>
                    <span className="font-medium">₹{pricing.charges.shipping}/-</span>
                  </div>
                )}
                {pricing.charges.payment > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Gateway Charges:</span>
                    <span className="font-medium">₹{pricing.charges.payment}/-</span>
                  </div>
                )}
                {pricing.roundoff !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Round Off:</span>
                    <span className="font-medium">₹{pricing.roundoff}/-</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Final Total:</span>
                    <span>₹{pricing.final_total}/-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Order Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-ramesh-gold rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{event.label}</h4>
                        <span className="text-sm text-gray-500">
                          {event.date} at {event.time}
                        </span>
                      </div>
                      {event.notes && <p className="text-sm text-gray-600 mt-1">{event.notes}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {event.is_admin ? "Updated by admin" : "Updated by customer"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{customer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {customer.phone}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {customer.email}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </h2>
              {basic.status.code === "prepared" && (
                <button
                  onClick={() => {
                    setSelectedOrder(currentOrder)
                    setActiveModal("shipping")
                  }}
                  className="text-sm text-ramesh-gold hover:text-ramesh-gold/80"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-medium text-gray-900">{shipping.address.name}</p>
                <p className="text-gray-600">{shipping.address.phone}</p>
              </div>
              <div>
                <p className="text-gray-900">{shipping.address.line1}</p>
                {shipping.address.line2 && <p className="text-gray-900">{shipping.address.line2}</p>}
                <p className="text-gray-900">
                  {shipping.address.city}, {shipping.address.state} {shipping.address.pincode}
                </p>
                <p className="text-gray-900">{shipping.address.country}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                  {shipping.address.type}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Delivery Method</label>
                <p className="text-gray-900 capitalize">{shipping.delivery.method}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Estimated Delivery</label>
                <p className="text-gray-900">{shipping.delivery.estimated_date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Shipping Status</label>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipping.status.code)}`}
                >
                  {shipping.status.label}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Shipping Charges</label>
                <p className="text-gray-900">
                  {shipping.charges.is_free ? (
                    <span className="text-green-600 font-medium">Free Shipping</span>
                  ) : (
                    `₹${shipping.charges.amount}/-`
                  )}
                </p>
              </div>
              {shipping.tracking.number && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                  <p className="text-gray-900 flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    {shipping.tracking.number}
                  </p>
                  {shipping.tracking.url && (
                    <a
                      href={shipping.tracking.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ramesh-gold hover:text-ramesh-gold/80"
                    >
                      Track Package
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </h2>
              {payment.method === "cod" && basic.status.code === "delivered" && !payment.payment_received && (
                <button
                  onClick={() => {
                    setSelectedOrder(currentOrder)
                    setActiveModal("payment")
                  }}
                  className="text-sm text-ramesh-gold hover:text-ramesh-gold/80"
                >
                  Mark Received
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Method</label>
                <p className="text-gray-900">{payment.method_label}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}
                >
                  {payment.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Amount</label>
                <p className="text-gray-900 font-medium">₹{payment.amount}/-</p>
              </div>
              {payment.gateway_charges > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Gateway Charges</label>
                  <p className="text-gray-900">₹{payment.gateway_charges}/-</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Received</label>
                <p className="text-gray-900">
                  {payment.payment_received ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-orange-600 font-medium">No</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Initiated At</label>
                <p className="text-gray-900 text-sm">{payment.initiated_at}</p>
              </div>
              {payment.completed_at && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Completed At</label>
                  <p className="text-gray-900 text-sm">{payment.completed_at}</p>
                </div>
              )}
              {payment.transaction_id && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                  <p className="text-gray-900 font-mono text-sm">{payment.transaction_id}</p>
                </div>
              )}
              {payment.refund_amount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-red-800">Refund Processed</h4>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          <strong>Refund Amount:</strong> ₹{payment.refund_amount}/-
                        </p>
                        {payment.refund_reason && (
                          <p>
                            <strong>Reason:</strong> {payment.refund_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={activeModal === "status"}
        onClose={() => setActiveModal(null)}
        order={selectedOrder}
        onUpdate={handleStatusUpdate}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={activeModal === "cancel"}
        onClose={() => setActiveModal(null)}
        order={selectedOrder}
        onCancel={handleCancelOrder}
      />

      {/* Refund Modal */}
      <RefundModal
        isOpen={activeModal === "refund"}
        onClose={() => setActiveModal(null)}
        order={selectedOrder}
        onRefund={handleProcessRefund}
      />

      {/* Shipping Modal */}
      <ShippingModal
        isOpen={activeModal === "shipping"}
        onClose={() => setActiveModal(null)}
        order={selectedOrder}
        onUpdateShipping={handleUpdateShipping}
      />

      {/* Payment Received Modal */}
      <PaymentReceivedModal
        isOpen={activeModal === "payment"}
        onClose={() => setActiveModal(null)}
        order={selectedOrder}
        onMarkPaymentReceived={handleMarkPaymentReceived}
      />

      {/* Return Modal */}
      <ReturnModal
        isOpen={activeModal === "return"}
        onClose={() => setActiveModal(null)}
        order={selectedOrder}
        onMarkReturn={handleMarkReturn}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        orderId={basic.id}
        orderNumber={basic.number}
      />
    </div>
  )
}

export default OrderDetail
