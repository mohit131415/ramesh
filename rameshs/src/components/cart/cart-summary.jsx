"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, CheckCircle, Tag, AlertTriangle, X } from "lucide-react"
import useCartStore from "../../store/cartStore"
import CouponPopup from "./coupon-popup"
import useAuthStore from "../../store/authStore"
import { UniversalButton } from "../ui/universal-button"
import cartService from "../../services/cart-service"

export default function CartSummary({ className = "", showTitle = true, onCheckoutValidation }) {
  const { items, inactive_items, totals, coupons, applyCoupon, removeCoupon, appliedCoupon, inactiveCoupon } =
    useCartStore()
  const [couponInput, setCouponInput] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [couponError, setCouponError] = useState("")
  const [showCouponPopup, setShowCouponPopup] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isRemovingInactiveCoupon, setIsRemovingInactiveCoupon] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, openAuthModal } = useAuthStore()

  // Format price helper
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  // Get values from the totals object
  const subtotal = totals?.subtotal || 0
  const baseAmount = totals?.base_amount || 0
  const taxAmount = totals?.tax_amount || 0
  const productDiscountAmount = totals?.product_discount_amount || 0
  const couponDiscountAmount = totals?.coupon_discount_amount || 0
  const totalDiscountAmount = totals?.total_discount_amount || 0
  const total = totals?.total || 0
  const totalItems = totals?.item_count || 0
  const totalQuantity = totals?.total_quantity || 0
  const roundoffAmount = totals?.roundoff || 0

  // Get applied coupon information from the cart data
  const hasCouponApplied = !!appliedCoupon
  const hasInactiveCoupon = !!inactiveCoupon
  const hasInactiveItems = inactive_items && inactive_items.length > 0
  const hasActiveItems = items && items.length > 0
  const hasAnyIssues = hasInactiveItems || hasInactiveCoupon

  // Reset coupon input when coupon is removed
  useEffect(() => {
    if (!hasCouponApplied) {
      setCouponInput("")
    }
  }, [hasCouponApplied])

  // Listen for checkout event from cart page
  useEffect(() => {
    const handleProceedToCheckout = () => {
      if (!hasAnyIssues) {
        handleCheckout()
      }
    }

    window.addEventListener("proceedToCheckout", handleProceedToCheckout)
    return () => window.removeEventListener("proceedToCheckout", handleProceedToCheckout)
  }, [hasAnyIssues])

  const handleApplyCoupon = async (e) => {
    e.preventDefault()

    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal("login", "Please login to apply a coupon")
      return
    }

    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setIsApplying(true)
    setCouponError("")

    try {
      // First validate the coupon
      const validateResponse = await cartService.validateCoupon(couponInput, total)

      if (validateResponse.status !== "success") {
        setCouponError(validateResponse.message || "Invalid coupon code")
        setIsApplying(false)
        return
      }

      // If validation passes, apply the coupon
      const result = await applyCoupon(couponInput)
      if (!result.success) {
        setCouponError(result.message || "Invalid coupon code")
      } else {
        setCouponInput("")
        if (window.showToast) {
          window.showToast({
            title: "Coupon Applied! 🎉",
            description: `Great! You're saving with "${couponInput}"`,
            type: "success",
            duration: 3000,
          })
        }
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      setCouponError("Failed to apply coupon")
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon()
      setCouponError("")
      setCouponInput("")
      if (window.showToast) {
        window.showToast({
          title: "Coupon Removed",
          description: "You can apply a different coupon if you'd like!",
          type: "info",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error removing coupon:", error)
      setCouponError("Failed to remove coupon")
    }
  }

  const handleRemoveInactiveCoupon = async () => {
    try {
      setIsRemovingInactiveCoupon(true)
      await removeCoupon()
      setCouponError("")
      setCouponInput("")
      if (window.showToast) {
        window.showToast({
          title: "Inactive Coupon Removed! 🎫",
          description: `"${inactiveCoupon.code}" has been removed. You can apply a new one!`,
          type: "success",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error removing inactive coupon:", error)
      setCouponError("Failed to remove inactive coupon")
    } finally {
      setIsRemovingInactiveCoupon(false)
    }
  }

  const handleCheckout = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal("login", "Please login to proceed to checkout")
      return
    }

    // Use validation callback if provided (for cart page)
    if (onCheckoutValidation) {
      const canProceed = onCheckoutValidation()
      if (!canProceed) {
        return // Validation failed, parent will handle showing modals
      }
    } else {
      // Direct validation for other components (like cart drawer)
      if (hasInactiveItems) {
        if (window.showToast) {
          window.showToast({
            title: "Cart needs attention! 🛒",
            description: "Please remove unavailable items before proceeding.",
            type: "warning",
            duration: 5000,
          })
        }
        return
      }

      if (hasInactiveCoupon) {
        if (window.showToast) {
          window.showToast({
            title: "Coupon expired! 🎫",
            description: "Please remove the inactive coupon before proceeding.",
            type: "warning",
            duration: 5000,
          })
        }
        return
      }
    }

    setIsCheckingOut(true)

    try {
      // Directly proceed to checkout
      if (window.showToast) {
        window.showToast({
          title: "Proceeding to Checkout! 🛒",
          description: "Taking you to the checkout page...",
          type: "success",
          duration: 2000,
        })
      }

      // Proceed to checkout
      setTimeout(() => {
        navigate("/checkout")
        setIsCheckingOut(false)
      }, 500)
    } catch (error) {
      console.error("Error during checkout:", error)

      // Handle different types of errors
      if (error.message?.includes("401") || error.message?.includes("unauthorized")) {
        openAuthModal("login", "Please login again to continue")
      } else {
        if (window.showToast) {
          window.showToast({
            title: "Checkout Error",
            description: "Something went wrong. Please try again.",
            type: "error",
            duration: 3000,
          })
        }
      }

      setIsCheckingOut(false)
    }
  }

  const handleOpenCouponPopup = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      openAuthModal("login", "Please login to browse coupons")
      return
    }
    setShowCouponPopup(true)
  }

  // Get button text based on cart state
  const getCheckoutButtonText = () => {
    if (!isAuthenticated) {
      return "Login to Checkout"
    }

    if (isCheckingOut) {
      return "Proceeding to Checkout..."
    }

    if (!hasActiveItems && hasAnyIssues) {
      return "Fix Cart Issues First"
    }

    if (hasAnyIssues) {
      return "Review & Checkout"
    }

    return "Proceed to Checkout"
  }

  return (
    <>
      <div className={`bg-white rounded-lg border border-gold/20 shadow-sm overflow-hidden ${className}`}>
        {/* Decorative top border */}
        <div className="h-1 w-full bg-gradient-to-r from-gold/30 via-pink/30 to-gold/30"></div>

        {showTitle && (
          <div className="p-3 border-b border-gold/10">
            <h2 className="text-lg font-medium text-amber-900">Order Summary</h2>
            <p className="text-xs text-gray-600 mt-1">
              {totalItems} {totalItems === 1 ? "item" : "items"} • {totalQuantity} total quantity
            </p>
          </div>
        )}

        {/* Warning for inactive items */}
        {hasInactiveItems && (
          <div className="mx-3 mt-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800 text-sm">Items Temporarily Unavailable</p>
                <p className="text-xs text-orange-600 mt-1">
                  {inactive_items.length} {inactive_items.length === 1 ? "item" : "items"} will be back soon!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning for inactive coupon */}
        {hasInactiveCoupon && (
          <div className="mx-3 mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <Tag className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800 text-sm">Coupon Expired 😔</p>
                  <p className="text-xs text-red-600 mt-1">
                    <span className="font-medium">"{inactiveCoupon.code}"</span> - {inactiveCoupon.inactive_reason}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveInactiveCoupon}
                disabled={isRemovingInactiveCoupon}
                className="flex items-center px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {isRemovingInactiveCoupon ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Savings Banner - Show when coupon is applied */}
        {hasCouponApplied && couponDiscountAmount > 0 && (
          <div className="mx-3 mt-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 text-xs">Coupon Applied! 🎉</p>
                  <p className="text-green-600 text-xs">Code: {appliedCoupon.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-800 font-bold text-sm">₹{formatPrice(couponDiscountAmount)} Saved</p>
                <p className="text-green-600 text-xs">{appliedCoupon.discount_value}% OFF</p>
              </div>
            </div>
          </div>
        )}

        {/* Order summary content */}
        <div className="p-3 space-y-3">
          {/* Decorative divider */}
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px bg-gold/20 flex-grow"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gold/30"></div>
            <div className="h-px bg-gold/20 flex-grow"></div>
          </div>

          {/* Summary items */}
          <div className="space-y-2">
            {/* Show original price if there's any discount */}
            {totalDiscountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original Price</span>
                <span className="font-medium text-gray-800">₹{formatPrice(subtotal + totalDiscountAmount)}</span>
              </div>
            )}

            {/* Product discount */}
            {productDiscountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Item Discount</span>
                <span className="font-medium text-green-600">-₹{formatPrice(productDiscountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal (After Item Discount)</span>
              <span className="font-medium text-gray-800">₹{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span className="ml-3">• Base Amount</span>
              <span>₹{formatPrice(baseAmount)}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span className="ml-3">• GST (5%)</span>
              <span>₹{formatPrice(taxAmount)}</span>
            </div>

            {/* Active coupon discount - only show if there's actually a coupon applied and working */}
            {hasCouponApplied && couponDiscountAmount > 0 && (
              <div className="flex justify-between text-sm bg-green-50 -mx-3 px-3 py-2 rounded-lg">
                <span className="text-green-700 flex items-center font-medium">
                  <Tag className="h-3 w-3 mr-2" />
                  Coupon Discount ({appliedCoupon.code})
                  <button
                    onClick={handleRemoveCoupon}
                    className="ml-2 text-red-500 text-xs underline hover:text-red-700"
                  >
                    Remove
                  </button>
                </span>
                <span className="font-bold text-green-700">-₹{formatPrice(couponDiscountAmount)}</span>
              </div>
            )}

            {/* Inactive coupon display in summary - ONLY show once */}
            {hasInactiveCoupon && (
              <div className="flex justify-between text-sm bg-red-50 -mx-3 px-3 py-2 rounded-lg border-l-4 border-red-400">
                <span className="text-red-700 flex items-center font-medium">
                  <Tag className="h-3 w-3 mr-2" />
                  <span className="line-through">Coupon ({inactiveCoupon.code})</span>
                  <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">EXPIRED</span>
                  <button
                    onClick={handleRemoveInactiveCoupon}
                    disabled={isRemovingInactiveCoupon}
                    className="ml-2 text-red-600 text-xs underline hover:text-red-800 disabled:opacity-50"
                  >
                    {isRemovingInactiveCoupon ? "Removing..." : "Remove"}
                  </button>
                </span>
                <span className="font-medium text-red-600 line-through">
                  -₹{formatPrice(inactiveCoupon.discount_value || 0)}
                </span>
              </div>
            )}

            {/* Roundoff amount - only show if roundoff exists and is non-zero */}
            {roundoffAmount !== 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Before Roundoff</span>
                  <span className="font-medium text-gray-800">₹{formatPrice(total - roundoffAmount)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Roundoff Amount</span>
                  <span className={`font-medium ${roundoffAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                    {roundoffAmount > 0 ? "+" : ""}₹{formatPrice(Math.abs(roundoffAmount))}
                  </span>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-dashed border-gold/20">
              <div className="flex justify-between">
                <span className="font-medium text-gray-800">
                  Total {roundoffAmount !== 0 ? "(After Roundoff)" : ""}
                </span>
                <span className="font-bold text-amber-900 text-lg">₹{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Coupon code input */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="coupon" className="text-sm font-medium text-gray-700">
                Have a coupon? 🎫
              </label>
              <button
                onClick={handleOpenCouponPopup}
                className="text-xs text-gold hover:text-gold-dark transition-colors"
              >
                Browse Coupons
              </button>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <input
                type="text"
                id="coupon"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 border border-gold/30 focus:border-gold/70 rounded-md px-3 py-2 text-sm focus:outline-none transition-colors"
                disabled={isApplying}
              />
              <UniversalButton
                type="submit"
                disabled={isApplying || !couponInput.trim()}
                isLoading={isApplying}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap"
              >
                Apply
              </UniversalButton>
            </form>

            {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}
          </div>

          {/* Checkout button */}
          <UniversalButton
            onClick={handleCheckout}
            disabled={!items || items.length === 0 || isCheckingOut}
            isLoading={isCheckingOut}
            className="w-full"
            size="lg"
          >
            <div className="flex items-center justify-center">
              {getCheckoutButtonText()}
              {!isCheckingOut && <ArrowRight className="ml-2 h-4 w-4" />}
            </div>
          </UniversalButton>

          {/* Note about shipping */}
          <div className="text-center text-xs text-gray-500">Shipping charges will be calculated at checkout</div>
        </div>

        {/* Coupon popup */}
        <CouponPopup
          isOpen={showCouponPopup}
          onClose={() => setShowCouponPopup(false)}
          onSelectCoupon={(code) => {
            setCouponInput(code)
            setShowCouponPopup(false)
          }}
        />
      </div>
    </>
  )
}
