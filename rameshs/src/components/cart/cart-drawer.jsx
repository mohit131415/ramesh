"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { X, ShoppingBag, ArrowRight, Trash2, Tag, Plus } from "lucide-react"
import useCartStore from "../../store/cartStore"
import CouponPopup from "./coupon-popup"
import useAuthStore from "../../store/authStore"
import { profileService } from "../../services/profile-service"

const CartDrawer = () => {
  // Get everything from the store
  const {
    isCartOpen,
    setCartOpen,
    isCouponPopupOpen,
    setCouponPopupOpen,
    items,
    inactive_items,
    coupons,
    summary,
    isLoading,
    updateQuantity,
    removeItem,
    removeCoupon,
    inactiveCoupon,
  } = useCartStore()

  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")
  const navigate = useNavigate()

  const drawerRef = useRef(null)

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && isCartOpen) {
        setCartOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isCartOpen, setCartOpen])

  // Format price
  const formatPrice = (price) => {
    if (!price) return "0.00"
    return typeof price === "number" ? price.toFixed(2) : Number.parseFloat(price).toFixed(2)
  }

  // Get image URL with proper formatting
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return "/placeholder.svg"

    if (typeof imagePath === "object" && imagePath.image_path) {
      imagePath = imagePath.image_path
    }

    if (typeof imagePath !== "string") {
      return "/placeholder.svg"
    }

    if (imagePath.startsWith("http") || imagePath.startsWith("/api/public/")) {
      return imagePath
    }

    if (imagePath.startsWith("uploads/") || imagePath.startsWith("/uploads/")) {
      return `/api/public/${imagePath.startsWith("/") ? imagePath.substring(1) : imagePath}`
    }

    return "/placeholder.svg"
  }, [])

  // Handle quantity change
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(itemId)
    } else {
      await updateQuantity(itemId, newQuantity)
    }
  }

  // Handle remove item
  const handleRemoveItem = async (itemId) => {
    await removeItem(itemId)
  }

  // Handle remove coupon
  const handleRemoveCoupon = async () => {
    await removeCoupon()
  }

  // Open coupon popup
  const openCouponPopup = () => {
    setCouponPopupOpen(true)
  }

  const handleCheckout = async () => {
    // Check if user is authenticated
    const { isAuthenticated, openAuthModal } = useAuthStore.getState()

    if (!isAuthenticated) {
      openAuthModal("login", "Please login to proceed to checkout")
      return
    }

    // Check if there are inactive items - show warning but allow user to proceed to cart page
    const { inactive_items, inactiveCoupon } = useCartStore.getState()
    if ((inactive_items && inactive_items.length > 0) || inactiveCoupon) {
      // Close drawer and navigate to cart page where user can handle these issues
      setCartOpen(false)
      navigate("/cart")

      if (window.showToast) {
        window.showToast({
          title: "Action Required",
          description: "Please review and remove inactive items or coupons from your cart.",
          type: "warning",
          duration: 5000,
        })
      }
      return
    }

    setIsCheckingOut(true)
    setCheckoutError("")

    try {
      // Check if user has a profile
      console.log("Checking user profile completion status...")
      const completionResponse = await profileService.checkCompleteness()

      console.log("Profile completion response:", completionResponse)

      // Handle successful response
      if (completionResponse.status === "success") {
        const { completion_percentage, missing_fields } = completionResponse.data

        console.log(`Profile completion: ${completion_percentage}%`)
        console.log("Missing fields:", missing_fields)

        // If user has no profile (0% completion), redirect to profile page
        if (completion_percentage === 0) {
          console.log("No profile found, redirecting to profile page...")

          // Close the cart drawer first
          setCartOpen(false)

          // Show toast message
          if (window.showToast) {
            window.showToast({
              title: "Profile Required",
              description: "Please create your profile first to proceed with checkout.",
              type: "info",
            })
          }

          // Redirect to profile page
          setTimeout(() => {
            navigate("/profile")
            setIsCheckingOut(false)
          }, 1000)
          return
        }

        // If profile exists but is incomplete, warn user but allow checkout
        if (completion_percentage < 100 && completion_percentage > 0) {
          console.log("Profile is incomplete but exists, proceeding with checkout...")

          if (window.showToast) {
            window.showToast({
              title: "Profile Incomplete",
              description: "Consider completing your profile for a better experience.",
              type: "warning",
            })
          }
        }

        // Profile exists and is complete, proceed to checkout
        console.log("Profile check passed, proceeding to checkout...")
      } else {
        // Handle API error response
        console.error("Profile check failed:", completionResponse.message)
        setCheckoutError("Unable to verify profile. Please try again.")
        setIsCheckingOut(false)
        return
      }

      // Proceed to checkout after successful profile verification
      setTimeout(() => {
        setCartOpen(false) // Close drawer
        navigate("/checkout")
        setIsCheckingOut(false)
      }, 500)
    } catch (error) {
      console.error("Error during checkout preparation:", error)

      // Handle different types of errors
      if (error.message?.includes("401") || error.message?.includes("unauthorized")) {
        const { openAuthModal } = useAuthStore.getState()
        setCartOpen(false)
        openAuthModal("login", "Please login again to continue")
      } else {
        setCheckoutError("Failed to verify profile. Please try again.")
      }

      setIsCheckingOut(false)
    }
  }

  const hasInactiveItems = inactive_items && inactive_items.length > 0
  const hasInactiveCoupon = !!inactiveCoupon

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Cart drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingBag className="mr-2" size={20} />
            Your Cart ({summary.total_items || 0})
          </h2>
          <button onClick={() => setCartOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Cart content */}
        <div className="h-[calc(100%-180px)] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d3ae6e]"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some delicious sweets to your cart!</p>
              <button
                onClick={() => setCartOpen(false)}
                className="bg-[#d3ae6e] hover:bg-[#c19c5d] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={`${item.product_id}_${item.variant_id}`} className="py-4">
                    <div className="flex items-start">
                      {/* Product image */}
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={getImageUrl(item.image) || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                          loading="lazy"
                          onError={(e) => {
                            if (e.target.src !== "/placeholder.svg") {
                              e.target.src = "/placeholder.svg"
                            }
                          }}
                        />
                      </div>

                      {/* Product details */}
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              <Link to={`/product/slug/${item.slug}`} onClick={() => setCartOpen(false)}>
                                {item.name}
                              </Link>
                            </h3>
                            {item.variant_id && (
                              <p className="mt-1 text-xs text-gray-500">{item.variant_name || "Standard"}</p>
                            )}
                          </div>
                          <p className="text-sm font-medium text-[#d3ae6e]">₹{formatPrice(item.price)}</p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() =>
                                handleQuantityChange(`local_${item.product_id}_${item.variant_id}`, item.quantity - 1)
                              }
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-2 py-1 text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                handleQuantityChange(`local_${item.product_id}_${item.variant_id}`, item.quantity + 1)
                              }
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(`local_${item.product_id}_${item.variant_id}`)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Coupon section */}
              <div className="mt-4 mb-2">
                {coupons && coupons.length > 0 ? (
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Coupon applied: {coupons[0].code}</p>
                          <p className="text-xs text-green-600">You saved ₹{formatPrice(coupons[0].discount_amount)}</p>
                        </div>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-green-700 hover:text-green-900">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openCouponPopup}
                    className="w-full flex items-center justify-center py-2 border border-dashed border-[#d3ae6e] text-[#d3ae6e] rounded-md hover:bg-[#d3ae6e]/5 transition-colors"
                  >
                    <Plus size={16} className="mr-1" />
                    Apply Coupon
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 bg-gray-50 absolute bottom-0 left-0 right-0">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{formatPrice(summary.subtotal)}</span>
            </div>

            {summary.discount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Discount</span>
                <span>-₹{formatPrice(summary.discount)}</span>
              </div>
            )}

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-600">₹{formatPrice(summary.tax_amount)}</span>
            </div>

            <div className="flex justify-between mb-4 font-bold">
              <span>Total</span>
              <span>₹{formatPrice(summary.total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-[#d3ae6e] hover:bg-[#c19c5d] text-white py-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Checking Profile...
                </div>
              ) : hasInactiveItems || hasInactiveCoupon ? (
                "Review Cart & Checkout"
              ) : (
                <>
                  Checkout <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
            {checkoutError && <p className="text-red-500 text-xs text-center mt-1">{checkoutError}</p>}
            <button
              onClick={() => setCartOpen(false)}
              className="w-full mt-2 border border-gray-300 bg-white text-gray-700 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Coupon Popup */}
      <CouponPopup isOpen={isCouponPopupOpen} onClose={() => setCouponPopupOpen(false)} />
    </>
  )
}

export default CartDrawer
