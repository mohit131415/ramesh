"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ShoppingBag, AlertTriangle, RefreshCw, X, ChevronRight, Heart, Tag } from "lucide-react"
import useCartStore from "../store/cartStore"
import LoadingSpinner from "../components/common/loading-spinner"
import EditVariantPopup from "../components/cart/edit-variant-popup"
import CartSummary from "../components/cart/cart-summary"
import PremiumCartItem from "../components/cart/premium-cart-item"

const CartPage = () => {
  const {
    items,
    inactive_items,
    invalid_items,
    totals,
    isLoading,
    error,
    hasInitialized,
    fetchCart,
    updateCartItem,
    removeCartItem,
    appliedCoupon,
    inactiveCoupon,
    removeCoupon,
  } = useCartStore()

  const [editingItem, setEditingItem] = useState(null)
  const [isClearingInactive, setIsClearingInactive] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isRemovingItems, setIsRemovingItems] = useState(false)
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false)

  // Fetch cart data when cart page is accessed - force fresh load after login
  useEffect(() => {
    const shouldFetchCart = () => {
      // Always fetch if not initialized
      if (!hasInitialized && !hasFetched && !isLoading) {
        return true
      }

      // Force fresh fetch if user just logged in (check for auth state change)
      const authStorage = localStorage.getItem("ramesh-auth-storage")
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage)
          const isAuthenticated = !!authData.state?.token

          // If user is authenticated and we haven't fetched yet, or if this is a fresh page load
          if (isAuthenticated && (!hasFetched || !hasInitialized)) {
            return true
          }
        } catch (error) {
          console.error("Error checking auth state:", error)
        }
      }

      return false
    }

    if (shouldFetchCart()) {
      setHasFetched(true)
      fetchCart()
    }
  }, [hasInitialized, hasFetched, isLoading, fetchCart])

  // Additional effect to handle fresh load on route change
  useEffect(() => {
    // Force fresh cart data when component mounts (page visit)
    const handlePageVisit = () => {
      // Reset the hasFetched flag to allow fresh fetch
      setHasFetched(false)
    }

    handlePageVisit()
  }, []) // Empty dependency array means this runs only on mount

  const allItems = [...(items || []), ...(inactive_items || []), ...(invalid_items || [])]
  const hasInactiveItems = inactive_items && inactive_items.length > 0
  const hasInactiveCoupon = !!inactiveCoupon
  const hasActiveItems = items && items.length > 0
  const hasAnyIssues = hasInactiveItems || hasInactiveCoupon

  // Handle clear all inactive items
  const handleClearInactiveItems = async () => {
    if (!inactive_items || inactive_items.length === 0) return

    try {
      setIsClearingInactive(true)
      const removePromises = inactive_items.map((item) => removeCartItem(`local_${item.product_id}_${item.variant_id}`))
      await Promise.all(removePromises)

      if (window.showToast) {
        window.showToast({
          title: "Items Cleared! 🧹",
          description: `${inactive_items.length} unavailable items have been removed from your cart`,
          type: "success",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error clearing inactive items:", error)
      if (window.showToast) {
        window.showToast({
          title: "Oops! Something went wrong",
          description: "Failed to clear unavailable items. Please try again.",
          type: "error",
          duration: 3000,
        })
      }
    } finally {
      setIsClearingInactive(false)
    }
  }

  // Handle removing inactive items
  const handleRemoveInactiveItems = async () => {
    if (!inactive_items || inactive_items.length === 0) {
      setShowCheckoutModal(false)
      return
    }

    try {
      setIsRemovingItems(true)
      const removePromises = inactive_items.map((item) => removeCartItem(`local_${item.product_id}_${item.variant_id}`))
      await Promise.all(removePromises)

      if (window.showToast) {
        window.showToast({
          title: "All set! ✨",
          description: `${inactive_items.length} unavailable items removed. Your cart is ready!`,
          type: "success",
          duration: 3000,
        })
      }

      return true
    } catch (error) {
      console.error("Error removing inactive items:", error)
      if (window.showToast) {
        window.showToast({
          title: "Oops! Something went wrong",
          description: "Failed to remove unavailable items. Please try again.",
          type: "error",
          duration: 3000,
        })
      }
      return false
    } finally {
      setIsRemovingItems(false)
    }
  }

  // Handle removing inactive coupon
  const handleRemoveInactiveCoupon = async () => {
    if (!inactiveCoupon) {
      return
    }

    try {
      setIsRemovingCoupon(true)
      await removeCoupon()

      if (window.showToast) {
        window.showToast({
          title: "Coupon removed! 🎫",
          description: `"${inactiveCoupon.code}" has been removed. You can apply a new one!`,
          type: "success",
          duration: 3000,
        })
      }

      return true
    } catch (error) {
      console.error("Error removing inactive coupon:", error)
      if (window.showToast) {
        window.showToast({
          title: "Oops! Something went wrong",
          description: "Failed to remove the coupon. Please try again.",
          type: "error",
          duration: 3000,
        })
      }
      return false
    } finally {
      setIsRemovingCoupon(false)
    }
  }

  // Handle edit item
  const handleEditItem = (item) => {
    setEditingItem(item)
  }

  // Close edit popup
  const handleCloseEdit = () => {
    setEditingItem(null)
  }

  // Handle checkout validation
  const handleCheckoutValidation = () => {
    // Check if there are any issues
    if (hasAnyIssues) {
      setShowCheckoutModal(true)
      return false
    }

    // All validations passed
    return true
  }

  // Handle resolving all issues
  const handleResolveAllIssues = async () => {
    let success = true

    // Remove inactive coupon first
    if (hasInactiveCoupon) {
      const couponRemoved = await handleRemoveInactiveCoupon()
      if (!couponRemoved) success = false
    }

    // Remove inactive items
    if (hasInactiveItems && success) {
      const itemsRemoved = await handleRemoveInactiveItems()
      if (!itemsRemoved) success = false
    }

    if (success) {
      setShowCheckoutModal(false)
      // Small delay to let the cart update, then proceed
      setTimeout(() => {
        if (hasActiveItems) {
          // Trigger checkout through cart summary
          const checkoutEvent = new CustomEvent("proceedToCheckout")
          window.dispatchEvent(checkoutEvent)
        }
      }, 500)
    }
  }

  // Get modal content based on issues
  const getModalContent = () => {
    const issueCount = (hasInactiveItems ? 1 : 0) + (hasInactiveCoupon ? 1 : 0)
    const inactiveItemCount = inactive_items?.length || 0

    if (!hasActiveItems && hasAnyIssues) {
      // Everything is inactive - special case
      return {
        title: "Oops! Your cart needs some attention 💝",
        description: "All items in your cart are currently unavailable, and your coupon has expired.",
        content: (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Heart className="h-5 w-5 text-pink-500" />
                <p className="font-medium text-pink-800">Don't worry, we're here to help!</p>
              </div>
              <div className="text-sm text-pink-700 space-y-2">
                {hasInactiveItems && (
                  <p>
                    • {inactiveItemCount} item{inactiveItemCount > 1 ? "s" : ""} temporarily unavailable
                  </p>
                )}
                {hasInactiveCoupon && <p>• Coupon "{inactiveCoupon.code}" has expired</p>}
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              We'll clean up your cart and you can start fresh with our amazing collection of sweets! 🍬
            </p>
          </div>
        ),
        primaryAction: "Clean Cart & Browse Sweets",
        secondaryAction: "Keep Everything",
        primaryLink: "/products",
      }
    }

    if (hasInactiveItems && hasInactiveCoupon) {
      // Both issues
      return {
        title: "Almost ready to checkout! 🛒",
        description: "Just need to tidy up a couple of things first.",
        content: (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
                <p className="font-medium text-blue-800">Quick fixes needed:</p>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  • {inactiveItemCount} item{inactiveItemCount > 1 ? "s" : ""} currently unavailable
                </p>
                <p>• Coupon "{inactiveCoupon.code}" is no longer active</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Remove these and continue with your {items?.length || 0} available item
              {(items?.length || 0) !== 1 ? "s" : ""}! ✨
            </p>
          </div>
        ),
        primaryAction: "Fix & Continue to Checkout",
        secondaryAction: "Keep Everything",
      }
    }

    if (hasInactiveItems) {
      // Only inactive items
      return {
        title: "Some items need attention 📦",
        description: "A few items in your cart are temporarily unavailable.",
        content: (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <p className="font-medium text-orange-800">Temporarily unavailable:</p>
              </div>
              <div className="text-sm text-orange-700">
                <p>
                  {inactiveItemCount} item{inactiveItemCount > 1 ? "s" : ""} will be back soon!
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Remove these items and continue with your {items?.length || 0} available item
              {(items?.length || 0) !== 1 ? "s" : ""}! 🎉
            </p>
          </div>
        ),
        primaryAction: "Remove & Continue",
        secondaryAction: "Keep Items",
      }
    }

    if (hasInactiveCoupon) {
      // Only inactive coupon
      return {
        title: "Coupon needs updating 🎫",
        description: "Your coupon is no longer active, but we can fix that!",
        content: (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Tag className="h-5 w-5 text-red-500" />
                <p className="font-medium text-red-800">Expired coupon:</p>
              </div>
              <div className="text-sm text-red-700">
                <p>
                  "{inactiveCoupon.code}" - {inactiveCoupon.inactive_reason}
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Remove this coupon and you can apply a new one during checkout! 💫</p>
          </div>
        ),
        primaryAction: "Remove & Continue",
        secondaryAction: "Keep Coupon",
      }
    }

    return null
  }

  if (isLoading && !hasInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Compact Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Link to="/" className="hover:text-gray-700 transition-colors">
                      Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">Shopping Cart</span>
                  </nav>
                  <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Compact Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Link to="/" className="hover:text-gray-700 transition-colors">
                      Home
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">Shopping Cart</span>
                  </nav>
                  <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setHasFetched(false)
                fetchCart()
              }}
              style={{ backgroundColor: "#d3ae6e" }}
              className="hover:opacity-90 text-white px-6 py-2 rounded-lg shadow-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalQuantity = totals?.total_quantity || 0
  const totalItems = totals?.item_count || 0
  const modalContent = getModalContent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Compact Header with Breadcrumb */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <Link to="/" className="hover:text-gray-700 transition-colors">
                    Home
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">Shopping Cart</span>
                </nav>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-gray-900">Shopping Cart</h1>
                  {totals?.total_discount_amount > 0 && (
                    <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-semibold text-sm">
                        Total Saved: ₹{totals.total_discount_amount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold mb-1" style={{ color: "#d3ae6e" }}>
                ₹{(totals?.total || 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                {totalItems} {totalItems === 1 ? "item" : "items"} • {totalQuantity} qty
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {allItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <ShoppingBag size={64} className="text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Discover our delicious collection of premium Indian sweets!</p>
              <Link
                to="/products"
                style={{ backgroundColor: "#d3ae6e" }}
                className="inline-flex items-center hover:opacity-90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={18} className="mr-2" />
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Active Items */}
              {items && items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Available Items</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {items.map((item) => (
                    <PremiumCartItem
                      key={`${item.product_id}_${item.variant_id}`}
                      item={item}
                      onQuantityChange={updateCartItem}
                      onRemove={removeCartItem}
                      onEdit={handleEditItem}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              )}

              {/* Inactive Items */}
              {inactive_items && inactive_items.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-orange-400">
                  <div className="p-3 border-b bg-gradient-to-r from-orange-50 to-orange-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                        <div>
                          <h2 className="text-lg font-semibold text-orange-800">Temporarily Unavailable 😔</h2>
                          <p className="text-sm text-orange-600">
                            {inactive_items.length} {inactive_items.length === 1 ? "item" : "items"} will be back soon!
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClearInactiveItems}
                        disabled={isClearingInactive || isLoading}
                        className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-lg"
                      >
                        {isClearingInactive ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Clearing...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Clear All
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {inactive_items.map((item) => (
                      <div key={`inactive_${item.product_id}_${item.variant_id}`} className="opacity-60">
                        <PremiumCartItem
                          item={item}
                          onQuantityChange={updateCartItem}
                          onRemove={removeCartItem}
                          onEdit={handleEditItem}
                          isLoading={isLoading}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary - Optimized for one page */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <CartSummary onCheckoutValidation={handleCheckoutValidation} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Variant Popup */}
      {editingItem && <EditVariantPopup isOpen={true} onClose={handleCloseEdit} item={editingItem} />}

      {/* Checkout Issues Modal */}
      {showCheckoutModal && modalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{modalContent.title}</h3>
              <p className="text-gray-600">{modalContent.description}</p>
            </div>

            <div className="mb-6">{modalContent.content}</div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                {modalContent.secondaryAction}
              </button>
              {modalContent.primaryLink ? (
                <Link
                  to={modalContent.primaryLink}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#d3ae6e] to-[#c19c5d] text-white rounded-lg hover:opacity-90 transition-all font-medium text-center"
                  onClick={() => {
                    setShowCheckoutModal(false)
                    handleResolveAllIssues()
                  }}
                >
                  {modalContent.primaryAction}
                </Link>
              ) : (
                <button
                  onClick={handleResolveAllIssues}
                  disabled={isRemovingItems || isRemovingCoupon}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#d3ae6e] to-[#c19c5d] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 font-medium"
                >
                  {isRemovingItems || isRemovingCoupon ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Fixing...
                    </div>
                  ) : (
                    modalContent.primaryAction
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
