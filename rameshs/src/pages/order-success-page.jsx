"use client"

import { useEffect, useState } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import {
  CheckCircle,
  Download,
  ArrowRight,
  Package,
  Truck,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  Home,
  AlertTriangle,
} from "lucide-react"
import { UniversalButton } from "../components/ui/universal-button"
import usePaymentStore from "../store/paymentStore"
import { useDownloadInvoice } from "../hooks/usePayment"
import useAuth from "../hooks/useAuth"

// CSS for animations
const animationStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-fadeInUp-delay-1 {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.3s forwards;
}

.animate-fadeInUp-delay-2 {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.6s forwards;
}

.animate-fadeInUp-delay-3 {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 0.9s forwards;
}

.animate-fadeInRight {
  opacity: 0;
  animation: fadeInRight 0.8s ease-out 0.5s forwards;
}

.animate-pulse-custom {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-ping-custom {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-bounce-custom {
  animation: bounce 1s infinite;
}

.confetti {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: confetti-fall 3s ease-out forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
`

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearOrder, resetPaymentFlow } = usePaymentStore()
  const downloadInvoiceMutation = useDownloadInvoice()
  const { isAuthenticated } = useAuth()

  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccessEffect, setShowSuccessEffect] = useState(true)
  const [confetti, setConfetti] = useState([])

  // Get token from URL params
  const token = searchParams.get("token")

  // Generate confetti
  useEffect(() => {
    if (showSuccessEffect) {
      const newConfetti = []
      for (let i = 0; i < 100; i++) {
        newConfetti.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `-10px`,
          size: `${Math.random() * 6 + 3}px`,
          color: [
            "#d3ae6e", // gold
            "#10b981", // green
            "#3b82f6", // blue
            "#f59e0b", // orange
            "#8b5cf6", // purple
          ][Math.floor(Math.random() * 5)],
          delay: `${Math.random() * 3}s`,
          duration: `${Math.random() * 2 + 2}s`,
        })
      }
      setConfetti(newConfetti)
    }
  }, [showSuccessEffect])

  // Verify access and load order data
  useEffect(() => {
    const verifyAccess = () => {
      try {
        if (!isAuthenticated) {
          setError("Please log in to view your order")
          navigate("/", { replace: true })
          return
        }

        if (!token) {
          setError("Invalid order access")
          navigate("/", { replace: true })
          return
        }

        const storedToken = sessionStorage.getItem("order_access_token")
        if (!storedToken || storedToken !== token) {
          setError("Order access expired or invalid")
          navigate("/", { replace: true })
          return
        }

        const storedOrderData = sessionStorage.getItem("order_data")
        if (!storedOrderData) {
          setError("Order data not found")
          navigate("/", { replace: true })
          return
        }

        const parsedOrderData = JSON.parse(storedOrderData)
        setOrderData(parsedOrderData)
        setIsLoading(false)

        setTimeout(
          () => {
            sessionStorage.removeItem("order_access_token")
            sessionStorage.removeItem("order_data")
          },
          5 * 60 * 1000,
        )
      } catch (err) {
        console.error("Error verifying order access:", err)
        setError("Failed to load order information")
        navigate("/", { replace: true })
      }
    }

    verifyAccess()
  }, [token, isAuthenticated, navigate])

  // Hide success effect after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccessEffect(false)
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      resetPaymentFlow()
    }
  }, [resetPaymentFlow])

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDownloadInvoice = () => {
    if (orderData?.order_number) {
      downloadInvoiceMutation.mutate(orderData.order_number)
    }
  }

  const handleContinueShopping = () => {
    clearOrder()
    sessionStorage.removeItem("order_access_token")
    sessionStorage.removeItem("order_data")
    navigate("/")
  }

  const handleViewOrders = () => {
    clearOrder()
    sessionStorage.removeItem("order_access_token")
    sessionStorage.removeItem("order_data")
    navigate("/profile?section=orders")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#d3ae6e] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            {error || "You don't have permission to view this order or the access has expired."}
          </p>
          <div className="space-y-3">
            <UniversalButton onClick={() => navigate("/")} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </UniversalButton>
            <UniversalButton onClick={() => navigate("/profile?section=orders")} variant="outline" className="w-full">
              <Package className="h-4 w-4 mr-2" />
              View Your Orders
            </UniversalButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Add animation styles */}
      <style>{animationStyles}</style>

      {/* Confetti Effect */}
      {showSuccessEffect && (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
          {confetti.map((item) => (
            <div
              key={item.id}
              className="confetti"
              style={{
                left: item.left,
                top: item.top,
                width: item.size,
                height: item.size,
                backgroundColor: item.color,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
            <Link to="/" className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/cart" className="hover:text-gray-700 transition-colors">
              Cart
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/checkout" className="hover:text-gray-700 transition-colors">
              Checkout
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Order Confirmation</span>
          </nav>
          <h1 className="text-2xl font-semibold text-gray-900">Order Confirmed</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        {/* Success Header with Animation */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse-custom">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            {/* Pulse effect */}
            {showSuccessEffect && (
              <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full animate-ping-custom opacity-20"></div>
            )}
          </div>

          <h1 className="text-3xl font-semibold text-gray-900 mb-4">🎉 Order Placed Successfully</h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Thank you for your order! We're preparing your delicious sweets and will notify you once they're ready for
            delivery.
          </p>

          <div className="inline-flex items-center bg-[#d3ae6e]/10 px-6 py-3 rounded-lg border border-[#d3ae6e]/20 animate-pulse-custom">
            <span className="text-lg font-semibold text-[#d3ae6e]">Order #{orderData.order_number}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-fadeInUp-delay-1">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#d3ae6e] rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                    <p className="text-sm text-gray-600">Your order details and status</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <label className="text-sm font-medium text-gray-500">Order Date</label>
                      </div>
                      <p className="text-gray-900 font-medium">{formatDate(orderData.order_date)}</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <label className="text-sm font-medium text-gray-500">Payment Method</label>
                      </div>
                      <p className="text-gray-900 font-medium capitalize">
                        {orderData.payment_method || orderData.payment_details?.method || "N/A"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <label className="text-sm font-medium text-gray-500">Order Status</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            orderData.status === "placed"
                              ? "bg-green-500"
                              : orderData.status === "processing"
                                ? "bg-blue-500"
                                : orderData.status === "shipped"
                                  ? "bg-purple-500"
                                  : orderData.status === "delivered"
                                    ? "bg-green-600"
                                    : "bg-gray-500"
                          }`}
                        ></div>
                        <span className="text-gray-900 font-medium capitalize">{orderData.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Items</label>
                      <p className="text-gray-900 font-medium">
                        {orderData.items_count} items • {orderData.total_quantity} quantity
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Payment Status</label>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            orderData.payment_status === "completed" ||
                            orderData.payment_details?.status === "completed"
                              ? "bg-green-500"
                              : orderData.payment_status === "pending" ||
                                  orderData.payment_details?.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-gray-900 font-medium capitalize">
                          {orderData.payment_status || orderData.payment_details?.status || "unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Total Amount</label>
                      <p className="text-2xl font-semibold text-[#d3ae6e]">₹{formatPrice(orderData.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-fadeInUp-delay-2">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Delivery Information</h2>
                    <p className="text-sm text-gray-600">Expected delivery and address details</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <h3 className="font-medium text-gray-900">Expected Delivery</h3>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-lg font-semibold text-green-700">
                        {formatDate(orderData.estimated_delivery_date)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">We'll notify you when your order is out for delivery</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <h3 className="font-medium text-gray-900">Delivery Address</h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <User className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">{orderData.shipping_address?.name}</p>
                          <p className="text-gray-600 mt-1">{orderData.shipping_address?.address}</p>
                          <p className="text-gray-600">
                            {orderData.shipping_address?.city}, {orderData.shipping_address?.state}
                          </p>
                          <p className="text-gray-600">PIN: {orderData.shipping_address?.pincode}</p>
                          <p className="text-gray-600 mt-2">{orderData.shipping_address?.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200 animate-fadeInUp-delay-3">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Secure Order</h3>
                  <p className="text-sm text-gray-600">
                    This order confirmation is secured and will expire automatically for your privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8 animate-fadeInRight">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Actions</h3>
              </div>

              <div className="p-6 space-y-4">
                <UniversalButton
                  onClick={handleDownloadInvoice}
                  disabled={downloadInvoiceMutation.isLoading}
                  isLoading={downloadInvoiceMutation.isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </UniversalButton>

                <UniversalButton onClick={handleViewOrders} variant="outline" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  View All Orders
                </UniversalButton>

                <UniversalButton onClick={handleContinueShopping} className="w-full">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </UniversalButton>
              </div>
            </div>
          </div>
        </div>

        {/* Order Process Steps */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 animate-fadeInUp-delay-3">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">What's Next?</h2>
            <p className="text-sm text-gray-600">Here's what happens after your order</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Order Processing</h3>
                <p className="text-sm text-gray-600">
                  We're preparing your fresh sweets with care and attention to quality.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Out for Delivery</h3>
                <p className="text-sm text-gray-600">
                  You'll receive tracking information once your order is dispatched.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Delivered</h3>
                <p className="text-sm text-gray-600">
                  Enjoy your delicious sweets and thank you for choosing Ramesh Sweets!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  