"use client"

import { useState, useEffect } from "react"
import { X, Tag, Check, Copy, AlertCircle, Calendar, ShoppingBag } from "lucide-react"
import useAuthStore from "../../store/authStore"
import useCartStore from "../../store/cartStore"

const CouponPopup = ({ isOpen, onClose, onSelectCoupon }) => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [copiedCode, setCopiedCode] = useState("")
  const [applyingCoupons, setApplyingCoupons] = useState(new Set())
  const { isAuthenticated, openAuthModal } = useAuthStore()
  const { applyCoupon, totals, getAvailableCoupons } = useCartStore()

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchCoupons()
    }
  }, [isOpen, isAuthenticated])

  const fetchCoupons = async () => {
    if (!isAuthenticated) {
      openAuthModal("Please login to view coupons")
      onClose()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await getAvailableCoupons()

      if (response.status === "success") {
        setCoupons(response.data || [])
      } else {
        setError(response.message || "Failed to load coupons")
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
      setError("Failed to load coupons. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleApplyCoupon = async (code) => {
    if (!isAuthenticated) {
      openAuthModal("Please login to apply coupons")
      onClose()
      return
    }

    setApplyingCoupons((prev) => new Set(prev).add(code))

    try {
      const result = await applyCoupon(code)

      if (result.success) {
        onClose()
        if (window.showToast) {
          window.showToast({
            title: "Coupon Applied Successfully! 🎉",
            description: result.message || "Your discount has been applied to the cart.",
            type: "success",
            duration: 3000,
          })
        }
      } else {
        // Handle specific error types
        let errorTitle = "Coupon Application Failed"
        let errorDescription = result.message || "Failed to apply coupon"

        if (result.message?.includes("maximum number of times")) {
          errorTitle = "Coupon Already Used 🎫"
          errorDescription = "You've already used this coupon. Try a different one!"
        } else if (result.message?.includes("expired")) {
          errorTitle = "Coupon Expired ⏰"
          errorDescription = "This coupon has expired. Check out our other offers!"
        } else if (result.message?.includes("minimum")) {
          errorTitle = "Minimum Order Not Met 🛒"
          errorDescription = "Add more items to meet the minimum order requirement."
        } else if (result.message?.includes("not valid")) {
          errorTitle = "Invalid Coupon Code ❌"
          errorDescription = "Please check the code and try again."
        }

        setError(errorDescription)
        if (window.showToast) {
          window.showToast({
            title: errorTitle,
            description: errorDescription,
            type: "error",
            duration: 4000,
          })
        }
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      const errorMessage = "Failed to apply coupon. Please try again."
      setError(errorMessage)
      if (window.showToast) {
        window.showToast({
          title: "Application Error",
          description: errorMessage,
          type: "error",
          duration: 4000,
        })
      }
    } finally {
      setApplyingCoupons((prev) => {
        const newSet = new Set(prev)
        newSet.delete(code)
        return newSet
      })
    }
  }

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(""), 2000)
      if (window.showToast) {
        window.showToast({
          title: "Code Copied",
          description: `Coupon code "${code}" copied to clipboard.`,
          type: "success",
          duration: 2000,
        })
      }
    })
  }

  const formatRupees = (amount) => {
    if (!amount || amount === "0" || amount === "0.00") return "₹0"
    const numAmount = Number.parseFloat(amount)
    if (numAmount === 0) return "₹0"
    return `₹${numAmount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const today = new Date()
      const diffTime = date - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 0) return "Expired"
      if (diffDays === 1) return "Expires today"
      if (diffDays <= 3) return `${diffDays} days left`
      if (diffDays <= 7) return `${diffDays} days left`

      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    } catch {
      return ""
    }
  }

  const formatDiscount = (coupon) => {
    if (coupon.discount_type === "percentage") {
      const percentage = Number.parseFloat(coupon.discount_value)
      return `${percentage}% OFF`
    } else {
      const amount = Number.parseFloat(coupon.discount_value)
      return `₹${amount} OFF`
    }
  }

  const isEligible = (coupon) => {
    const cartTotal = totals?.total || 0
    const minOrder = Number.parseFloat(coupon.minimum_order_value || 0)
    return cartTotal >= minOrder
  }

  const isExpired = (coupon) => {
    if (!coupon.end_date) return false
    return new Date(coupon.end_date) < new Date()
  }

  const getRemainingAmount = (coupon) => {
    const cartTotal = totals?.total || 0
    const minOrder = Number.parseFloat(coupon.minimum_order_value || 0)
    return Math.max(0, minOrder - cartTotal)
  }

  const isExpiringSoon = (coupon) => {
    if (!coupon.end_date) return false
    const date = new Date(coupon.end_date)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || coupon.discount_type === filterType

    return matchesSearch && matchesFilter && coupon.is_active && !isExpired(coupon)
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d3ae6e] to-[#b8965a] rounded-xl flex items-center justify-center">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Available Offers</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <ShoppingBag className="h-4 w-4 text-[#d3ae6e]" />
                  <span>
                    Cart: <span className="font-semibold text-[#d3ae6e]">{formatRupees(totals?.total || 0)}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4 text-[#d3ae6e]" />
                  <span>
                    <span className="font-semibold text-[#d3ae6e]">{filteredCoupons.length}</span> offers
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#d3ae6e] focus:ring-2 focus:ring-[#d3ae6e]/10 focus:outline-none text-sm bg-white"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-[#d3ae6e] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                All ({coupons.filter((c) => c.is_active && !isExpired(c)).length})
              </button>
              <button
                onClick={() => setFilterType("percentage")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterType === "percentage"
                    ? "bg-[#d3ae6e] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                % Discount (
                {coupons.filter((c) => c.discount_type === "percentage" && c.is_active && !isExpired(c)).length})
              </button>
              <button
                onClick={() => setFilterType("fixed_amount")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterType === "fixed_amount"
                    ? "bg-[#d3ae6e] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                ₹ Off (
                {coupons.filter((c) => c.discount_type === "fixed_amount" && c.is_active && !isExpired(c)).length})
              </button>
            </div>
          </div>
        </div>

        {/* Coupons List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#d3ae6e] rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600 text-sm">Loading offers...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Unable to Load Offers</h3>
              <p className="text-gray-600 mb-4 text-sm max-w-sm">{error}</p>
              <button
                onClick={fetchCoupons}
                className="px-4 py-2 bg-[#d3ae6e] hover:bg-[#b8965a] text-white rounded-lg font-medium transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Tag className="h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-2">No Offers Found</h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || filterType !== "all" ? "No offers match your search." : "No offers available."}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredCoupons.map((coupon) => {
                const eligible = isEligible(coupon)
                const remainingAmount = getRemainingAmount(coupon)
                const isApplying = applyingCoupons.has(coupon.code)
                const expiringSoon = isExpiringSoon(coupon)

                return (
                  <div
                    key={coupon.id}
                    className={`relative bg-white border rounded-xl p-3 transition-all duration-200 ${
                      eligible
                        ? "border-gray-200 hover:border-[#d3ae6e] hover:shadow-sm"
                        : "border-gray-100 opacity-60 grayscale"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Discount Badge */}
                      <div className="flex items-center space-x-3">
                        <div
                          className={`px-3 py-2 rounded-lg font-bold text-sm ${
                            coupon.discount_type === "percentage"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {formatDiscount(coupon)}
                        </div>

                        {/* Coupon Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{coupon.name}</h3>
                          <p className="text-xs text-gray-600 line-clamp-1">{coupon.description}</p>
                        </div>
                      </div>

                      {/* Right: Code and Apply */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <div className="bg-gray-50 border border-gray-200 px-2 py-1 rounded text-xs font-mono font-semibold text-gray-800">
                            {coupon.code}
                          </div>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className={`p-1 rounded transition-colors ${
                              copiedCode === coupon.code
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                            }`}
                          >
                            {copiedCode === coupon.code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>

                        {eligible ? (
                          <button
                            onClick={() => handleApplyCoupon(coupon.code)}
                            disabled={isApplying}
                            className="bg-[#d3ae6e] hover:bg-[#b8965a] disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-xs flex items-center space-x-1"
                          >
                            {isApplying ? (
                              <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Applying...</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Apply</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium">
                            Not Eligible
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Details - Only Customer-Attractive Info */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ShoppingBag className="h-3 w-3" />
                          <span>Min: {formatRupees(coupon.minimum_order_value)}</span>
                        </div>

                        {coupon.maximum_discount_amount && Number.parseFloat(coupon.maximum_discount_amount) > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3 w-3" />
                            <span>Max: {formatRupees(coupon.maximum_discount_amount)}</span>
                          </div>
                        )}

                        {coupon.usage_limit && (
                          <div className="flex items-center space-x-1 text-blue-600">
                            <span>
                              Limit: {coupon.usage_limit} use{coupon.usage_limit > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}

                        {expiringSoon && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(coupon.end_date)}</span>
                          </div>
                        )}
                      </div>

                      {!eligible && remainingAmount > 0 && (
                        <div className="text-xs text-orange-600 font-medium">
                          Add {formatRupees(remainingAmount)} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CouponPopup
