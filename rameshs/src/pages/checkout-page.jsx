"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle,
  ArrowLeft,
  MapPin,
  Plus,
  Home,
  Building,
  Star,
  Shield,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Truck,
  Clock,
  Gift,
  Edit3,
  Eye,
} from "lucide-react"
import { UniversalButton } from "../components/ui/universal-button"
import useCartStore from "../store/cartStore"
import useCheckoutStore from "../store/checkoutStore"
import { useAddresses, useCreateAddress, useUpdateAddress } from "../hooks/useProfile"
import { usePrepareCheckout } from "../hooks/useCheckout"
import { Link } from "react-router-dom"
import ProductReview from "../components/checkout/product-review"
import AddressModal from "../components/common/address-modal"

// Order Summary Component for Summary Step - Optimized for screen height
function OrderSummaryForSummary({ checkoutData, currentStep, className = "", onContinue, disabled, isLoading }) {
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  const billBreakdown = checkoutData?.bill_breakdown || {}
  const summary = billBreakdown.summary || {}

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-fit max-h-[calc(100vh-8rem)] ${className}`}
    >
      {/* Compact header */}
      <div className="h-1 w-full bg-gradient-to-r from-[#d3ae6e]/60 via-[#d3ae6e] to-[#d3ae6e]/60"></div>

      <div className="p-3 border-b border-gray-100 bg-gradient-to-br from-[#d3ae6e]/5 to-transparent">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[#d3ae6e] flex items-center justify-center shadow-md">
            <ShoppingBag className="h-3 w-3 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Order Summary</h2>
            <p className="text-xs text-gray-600 font-medium">
              {summary.item_count || 0} {summary.item_count === 1 ? "item" : "items"} • {summary.total_quantity || 0}{" "}
              qty
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
        <div className="p-3 space-y-2">
          {/* Original Amount */}
          <div className="flex justify-between items-center text-xs bg-gray-50 rounded-lg p-2">
            <span className="text-gray-600 font-medium">{billBreakdown.cart_value?.description || "Cart Total"}</span>
            <span className="font-semibold text-gray-800">
              ₹{formatPrice(billBreakdown.cart_value?.original_amount)}
            </span>
          </div>

          {/* Product Discounts */}
          {billBreakdown.product_discounts?.amount > 0 && (
            <div className="flex justify-between items-center bg-emerald-50 rounded-lg p-2 border border-emerald-200">
              <span className="text-emerald-700 font-semibold flex items-center text-xs">
                <Gift className="h-3 w-3 mr-1" />
                {billBreakdown.product_discounts?.description || "Product Discounts"}
              </span>
              <span className="font-bold text-emerald-700 text-xs">
                -₹{formatPrice(billBreakdown.product_discounts?.amount)}
              </span>
            </div>
          )}

          {/* Compact Tax breakdown */}
          <div className="space-y-1 bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-medium">Base Amount</span>
              <span className="font-medium text-gray-800">
                ₹
                {formatPrice(
                  (billBreakdown.amount_after_product_discounts?.amount || 0) - (billBreakdown.tax?.amount || 0),
                )}
              </span>
            </div>

            {/* Tax Breakdown - Compact */}
            {billBreakdown.tax?.breakdown && billBreakdown.tax.amount > 0 && (
              <div className="space-y-0.5">
                {billBreakdown.tax.breakdown.tax_type === "cgst_sgst" && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>CGST + SGST (5%)</span>
                    <span>₹{formatPrice(billBreakdown.tax.breakdown.cgst + billBreakdown.tax.breakdown.sgst)}</span>
                  </div>
                )}
                {billBreakdown.tax.breakdown.tax_type === "igst" && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>IGST (5%)</span>
                    <span>₹{formatPrice(billBreakdown.tax.breakdown.igst)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Subtotal line - Compact */}
            <div className="pt-1 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold text-xs">
                  {billBreakdown.amount_after_product_discounts?.description || "Subtotal"}
                </span>
                <span className="font-bold text-gray-900 text-xs">
                  ₹{formatPrice(billBreakdown.amount_after_product_discounts?.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Coupon Discount - Compact */}
          {billBreakdown.coupon_discount?.applied && billBreakdown.coupon_discount?.amount > 0 && (
            <div className="flex justify-between items-center bg-green-50 rounded-lg p-2 border border-green-200">
              <span className="text-green-700 font-semibold flex items-center text-xs">
                <Gift className="h-3 w-3 mr-1" />
                Coupon ({billBreakdown.coupon_discount?.code})
              </span>
              <span className="font-bold text-green-700 text-xs">
                -₹{formatPrice(billBreakdown.coupon_discount?.amount)}
              </span>
            </div>
          )}

          {/* Shipping - Compact */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-700 font-medium">{billBreakdown.shipping?.description || "Shipping"}</span>
            {billBreakdown.shipping?.is_free ? (
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 line-through text-xs">
                  ₹{formatPrice(billBreakdown.shipping?.original_amount || 50)}
                </span>
                <span className="font-bold text-emerald-600 text-xs">FREE</span>
              </div>
            ) : (
              <span className="font-medium text-gray-900 text-xs">₹{formatPrice(billBreakdown.shipping?.amount)}</span>
            )}
          </div>

          {/* Payment Charges - Compact */}
          {billBreakdown.payment_charges?.applied && billBreakdown.payment_charges?.amount > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700 font-medium">
                {billBreakdown.payment_charges?.description || "Payment Charges"}
              </span>
              <span className="font-medium text-gray-900 text-xs">
                ₹{formatPrice(billBreakdown.payment_charges?.amount)}
              </span>
            </div>
          )}

          {/* Roundoff Section - Compact */}
          {billBreakdown.roundoff?.amount !== 0 && Math.abs(billBreakdown.roundoff?.amount || 0) > 0 && (
            <div className="space-y-1 bg-blue-50 rounded-lg p-2 border border-blue-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700 font-medium">Amount Before Roundoff</span>
                <span className="font-medium text-gray-800">
                  ₹{formatPrice(billBreakdown.amount_before_roundoff?.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700 font-medium flex items-center">
                  Roundoff Amount
                  {billBreakdown.roundoff?.note && (
                    <span className="ml-1 text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                      {billBreakdown.roundoff.note}
                    </span>
                  )}
                </span>
                <span
                  className={`font-semibold text-xs ${(billBreakdown.roundoff?.amount || 0) > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {(billBreakdown.roundoff?.amount || 0) > 0 ? "+" : ""}₹
                  {formatPrice(Math.abs(billBreakdown.roundoff?.amount || 0))}
                </span>
              </div>
            </div>
          )}

          {/* Total Savings Banner - Compact */}
          {billBreakdown.total_savings?.amount > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Gift className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 text-xs">Total Savings</p>
                  </div>
                </div>
                <p className="text-green-800 font-bold text-sm">₹{formatPrice(billBreakdown.total_savings?.amount)}</p>
              </div>
            </div>
          )}

          {/* Final Total - Compact */}
          <div className="pt-2 border-t border-dashed border-[#d3ae6e]/30">
            <div className="bg-gradient-to-r from-[#d3ae6e]/10 to-[#d3ae6e]/5 rounded-lg p-3 border border-[#d3ae6e]/20">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 text-sm">Total Amount</span>
                <span className="font-bold text-[#d3ae6e] text-xl tracking-tight">
                  ₹{formatPrice(checkoutData?.final_amount_to_pay)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      {onContinue && currentStep !== "payment" && (
        <div className="p-3 border-t border-gray-100 bg-white">
          <UniversalButton
            onClick={onContinue}
            disabled={disabled || isLoading}
            isLoading={isLoading}
            className="w-full"
            size="sm"
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <div className="flex items-center justify-center">
                Continue to Payment
                <ChevronRight className="h-3 w-3 ml-2" />
              </div>
            )}
          </UniversalButton>
        </div>
      )}
    </div>
  )
}

// Cart Summary Component for Address Step - Optimized for screen height
function CartSummaryForAddress({ totals, className = "", onContinue, disabled, isLoading }) {
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-fit max-h-[calc(100vh-8rem)] ${className}`}
    >
      {/* Compact header */}
      <div className="h-1 w-full bg-gradient-to-r from-[#d3ae6e]/60 via-[#d3ae6e] to-[#d3ae6e]/60"></div>

      <div className="p-3 border-b border-gray-100 bg-gradient-to-br from-[#d3ae6e]/5 to-transparent">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[#d3ae6e] flex items-center justify-center shadow-md">
            <ShoppingBag className="h-3 w-3 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Order Summary</h2>
            <p className="text-xs text-gray-600 font-medium">
              {totals?.item_count || 0} {totals?.item_count === 1 ? "item" : "items"} • {totals?.total_quantity || 0}{" "}
              qty
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
        <div className="p-3 space-y-2">
          {/* Show original price if there's any discount */}
          {totals?.discount_amount > 0 && (
            <div className="flex justify-between items-center text-xs bg-gray-50 rounded-lg p-2">
              <span className="text-gray-600 font-medium">Original Price</span>
              <span className="font-semibold text-gray-800">
                ₹{formatPrice((totals?.subtotal || 0) + (totals?.discount_amount || 0))}
              </span>
            </div>
          )}

          {/* Product discount */}
          {totals?.product_discount_amount > 0 && (
            <div className="flex justify-between items-center bg-emerald-50 rounded-lg p-2 border border-emerald-200">
              <span className="text-emerald-700 font-semibold flex items-center text-xs">
                <Gift className="h-3 w-3 mr-1" />
                Item Discount
              </span>
              <span className="font-bold text-emerald-700 text-xs">
                -₹{formatPrice(totals.product_discount_amount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-700 font-medium">Subtotal ({totals?.item_count || 0} items)</span>
            <span className="font-bold text-gray-900">₹{formatPrice(totals?.subtotal || 0)}</span>
          </div>

          <div className="ml-2 space-y-0.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>• Base Amount</span>
              <span className="font-medium">₹{formatPrice(totals?.base_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>• GST (5%)</span>
              <span className="font-medium">₹{formatPrice(totals?.tax_amount || 0)}</span>
            </div>
          </div>

          {/* Coupon discount */}
          {totals?.coupon_discount_amount > 0 && (
            <div className="flex justify-between items-center bg-green-50 rounded-lg p-2 border border-green-200">
              <span className="text-green-700 font-semibold flex items-center text-xs">
                <Gift className="h-3 w-3 mr-1" />
                Coupon Discount
              </span>
              <span className="font-bold text-green-700 text-xs">-₹{formatPrice(totals.coupon_discount_amount)}</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-700 font-medium">Shipping</span>
            <span className="font-medium text-[#d3ae6e]">To be calculated</span>
          </div>

          {/* Roundoff section - Compact */}
          {totals?.roundoff !== 0 && Math.abs(totals?.roundoff || 0) > 0 && (
            <div className="space-y-1 bg-blue-50 rounded-lg p-2 border border-blue-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700 font-medium">Amount Before Roundoff</span>
                <span className="font-medium text-gray-800">
                  ₹{formatPrice((totals?.total || 0) - (totals?.roundoff || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-700 font-medium">Roundoff Amount</span>
                <span
                  className={`font-semibold text-xs ${(totals?.roundoff || 0) > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {(totals?.roundoff || 0) > 0 ? "+" : ""}₹{formatPrice(Math.abs(totals?.roundoff || 0))}
                </span>
              </div>
            </div>
          )}

          {/* Total section */}
          <div className="pt-2 border-t border-dashed border-[#d3ae6e]/30">
            <div className="bg-gradient-to-r from-[#d3ae6e]/10 to-[#d3ae6e]/5 rounded-lg p-2 border border-[#d3ae6e]/20">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 text-sm">Estimated Total</span>
                <span className="font-bold text-[#d3ae6e] text-lg tracking-tight">
                  ₹{formatPrice(totals?.total || 0)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 text-right font-medium">Final price calculated at checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <UniversalButton
          onClick={onContinue}
          disabled={disabled || isLoading}
          isLoading={isLoading}
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            "Preparing Checkout..."
          ) : (
            <div className="flex items-center justify-center">
              Continue to Summary
              <ChevronRight className="h-3 w-3 ml-2" />
            </div>
          )}
        </UniversalButton>
        {disabled && (
          <p className="text-xs text-gray-500 text-center mt-2 font-medium">
            Please select an address above to continue
          </p>
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totals, clearCart } = useCartStore()
  const {
    checkoutData,
    orderData,
    selectedAddress,
    selectedPaymentMethod,
    currentStep,
    isLoading,
    error,
    orderComplete,
    setSelectedAddress,
    setSelectedPaymentMethod,
    setCurrentStep,
    setOrderComplete,
    clearError,
    resetCheckout,
  } = useCheckoutStore()

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  // Reset checkout to address step when component mounts
  useEffect(() => {
    setCurrentStep("address")
    setSelectedPaymentMethod(null)
    clearError()
  }, [setCurrentStep, setSelectedPaymentMethod, clearError])

  // TanStack Query hooks
  const { data: addressesData, isLoading: addressesLoading } = useAddresses()

  // Extract addresses and meta information properly from API response
  const addresses = Array.isArray(addressesData) ? addressesData : addressesData?.data || []

  // Extract meta information from structured response
  const addressMeta =
    !Array.isArray(addressesData) && addressesData?.meta
      ? addressesData.meta
      : {
          total_addresses: addresses.length,
          max_addresses: 5,
          can_add_more: addresses.length < 5,
        }

  // Use the meta directly without additional fallback
  const safeAddressMeta = addressMeta

  const createAddressMutation = useCreateAddress()
  const updateAddressMutation = useUpdateAddress()
  const prepareCheckoutMutation = usePrepareCheckout()

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((addr) => addr.is_default)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress)
      } else {
        setSelectedAddress(addresses[0])
      }
    }
  }, [addresses, selectedAddress, setSelectedAddress])

  // Redirect to cart if cart is empty and not completing an order
  useEffect(() => {
    if (items.length === 0 && !orderComplete && !orderData) {
      navigate("/cart")
    }
  }, [items.length, orderComplete, orderData, navigate])

  // Clear error when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  // Format price helper
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
  }

  const handleSetDefault = async (addressId, event) => {
    event.stopPropagation()

    try {
      await updateAddressMutation.mutateAsync({
        addressId: addressId,
        updates: { is_default: true },
      })

      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Default Address Updated",
          description: "Your default address has been updated successfully.",
          type: "success",
        })
      }
    } catch (error) {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Update Failed",
          description: "Failed to set default address. Please try again.",
          type: "error",
        })
      }
    }
  }

  const handleAddressConfirm = async () => {
    if (!selectedAddress) {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Please select an address",
          description: "You need to select a delivery address to continue.",
          type: "error",
        })
      }
      return
    }

    try {
      const result = await prepareCheckoutMutation.mutateAsync({
        address_id: selectedAddress.id,
      })

      if (result && result.data) {
        const adjustedItems = result.data.items?.filter((item) => item.was_quantity_adjusted) || []
        if (adjustedItems.length > 0) {
          if (typeof window !== "undefined" && window.showToast) {
            window.showToast({
              title: "Quantity Adjusted",
              description: `${adjustedItems.length} item(s) had their quantities adjusted due to availability limits.`,
              type: "warning",
            })
          }
        }

        setCurrentStep("summary")
        window.scrollTo(0, 0)

        if (typeof window !== "undefined" && window.showToast) {
          window.showToast({
            title: "Address Confirmed",
            description: "Proceeding to order summary.",
            type: "success",
          })
        }
      } else {
        throw new Error("No checkout data received")
      }
    } catch (error) {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Checkout Error",
          description: error.message || "Failed to prepare checkout. Please try again.",
          type: "error",
        })
      }
    }
  }

  const handleSummaryConfirm = () => {
    setCurrentStep("payment")
    window.scrollTo(0, 0)
  }

  const handleAddNewAddress = () => {
    // Check if user can add more addresses
    if (!safeAddressMeta.can_add_more) {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Address Limit Reached",
          description: `You can only have ${safeAddressMeta.max_addresses} addresses. Please delete an existing address first.`,
          type: "error",
        })
      }
      return
    }

    setEditingAddress(null)
    setIsAddressModalOpen(true)
  }

  const handleSaveAddress = async (formData) => {
    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          addressId: editingAddress.id,
          updates: formData,
        })

        if (typeof window !== "undefined" && window.showToast) {
          window.showToast({
            title: "Address Updated",
            description: "Your address has been updated successfully.",
            type: "success",
          })
        }
      } else {
        const newAddress = await createAddressMutation.mutateAsync(formData)
        if (newAddress) {
          setSelectedAddress(newAddress)
        }

        if (typeof window !== "undefined" && window.showToast) {
          window.showToast({
            title: "Address Added",
            description: "Your new address has been saved and selected.",
            type: "success",
          })
        }
      }
      setIsAddressModalOpen(false)
      setEditingAddress(null)
    } catch (error) {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Error",
          description: "Failed to save address. Please try again.",
          type: "error",
        })
      }
    }
  }

  const handlePaymentMethodChange = async (method) => {
    setSelectedPaymentMethod(method)

    // Re-prepare checkout with selected payment method to get updated charges
    if (selectedAddress && method) {
      try {
        await prepareCheckoutMutation.mutateAsync({
          address_id: selectedAddress.id,
          payment_method: method,
        })
      } catch (error) {
        // Silent error handling for payment method change
      }
    }
  }

  const createCODOrder = async () => {
    try {
      setIsCreatingOrder(true)
      const orderPayload = {
        address_id: selectedAddress.id,
        payment_method: "cod",
        additional_data: {
          delivery_notes: "Please handle with care",
        },
      }

      // Get auth token from the auth store state
      const authState = JSON.parse(localStorage.getItem("ramesh-auth-storage") || "{}")
      const token = authState?.state?.token || ""

      if (!token) {
        throw new Error("Authentication token not found. Please login again.")
      }

      // Direct API call to create order endpoint
      const response = await fetch("/api/api/public/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create order")
      }

      const result = await response.json()

      if (result.status === "success" && result.data) {
        const orderData = result.data

        // Store the order data in the checkout store
        useCheckoutStore.getState().setOrderData(orderData)
        setOrderComplete(true)
        clearCart()

        // Set up token-based access for success page (same as online payment flow)
        const orderToken = btoa(`${orderData.order_number}_${Date.now()}_${Math.random()}`)
        sessionStorage.setItem("order_access_token", orderToken)
        sessionStorage.setItem("order_data", JSON.stringify(orderData))

        // Navigate to order success page with token
        navigate(`/order-success?token=${orderToken}`, { replace: true })

        if (typeof window !== "undefined" && window.showToast) {
          window.showToast({
            title: "Order placed successfully!",
            description: "Thank you for your order. You will receive a confirmation email shortly.",
            type: "success",
          })
        }
      } else {
        throw new Error(result.message || "Failed to create order")
      }
    } catch (error) {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Order Creation Failed",
          description: error.message || "Could not create your order. Please try again.",
          type: "error",
        })
      }
      throw error
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const handleProceedToPayment = async (paymentMethod) => {
    if (!paymentMethod || !checkoutData) return

    try {
      if (paymentMethod === "cod") {
        // Direct order creation for COD - bypass complete API entirely
        await createCODOrder()
      } else if (paymentMethod === "online") {
        // Redirect to payment page for online payments
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

        // Store checkout data for payment page
        sessionStorage.setItem(
          "checkout_data",
          JSON.stringify({
            orderData: {
              address_id: selectedAddress.id,
              payment_method: "online",
              additional_data: {
                delivery_notes: "Please handle with care",
              },
            },
            checkoutData,
            paymentMethod: "online",
          }),
        )

        // Navigate to payment page
        navigate(`/payment?id=${paymentId}`)
      }
    } catch (error) {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Payment Error",
          description: error.message || "Failed to proceed to payment. Please try again.",
          type: "error",
        })
      }
    }
  }

  const handleBackToAddress = () => {
    setCurrentStep("address")
    setSelectedPaymentMethod(null)
    clearError()
    window.scrollTo(0, 0)
  }

  const handleBackToSummary = () => {
    setCurrentStep("summary")
    setSelectedPaymentMethod(null)
    clearError()
    window.scrollTo(0, 0)
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />
      case "work":
        return <Building className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const formatAddress = (address) => {
    if (!address) return ""
    if (address.full_address) {
      return address.full_address
    }
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code || address.pincode,
    ].filter(Boolean)
    return parts.join(", ")
  }

  const handleEditAddress = (address, event) => {
    event.stopPropagation()
    setEditingAddress(address)
    setIsAddressModalOpen(true)
  }

  // Get summary data from the new response format
  const summary = checkoutData?.bill_breakdown?.summary || {}
  const totalQuantity = summary?.total_quantity || totals?.total_quantity || 0
  const totalItems = summary?.item_count || totals?.item_count || 0

  // Check if user is near or at address limit
  const isNearLimit =
    safeAddressMeta.total_addresses >= safeAddressMeta.max_addresses - 1 && safeAddressMeta.can_add_more
  const hasReachedLimit = !safeAddressMeta.can_add_more

  // Order complete view
  // The order complete view has been removed to force redirection to the order success page

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Sticky Header - positioned below main header */}
      <div className="sticky top-16 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            {/* Left section - Back button and breadcrumb */}
            <div className="flex items-center space-x-3 w-1/4">
              <Link
                to="/cart"
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <nav className="flex items-center space-x-2 text-xs text-gray-500">
                  <Link to="/" className="hover:text-gray-700 transition-colors font-medium">
                    Home
                  </Link>
                  <ChevronRight className="w-3 h-3" />
                  <Link to="/cart" className="hover:text-gray-700 transition-colors font-medium">
                    Cart
                  </Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-gray-900 font-semibold">Checkout</span>
                </nav>
                <h1 className="text-base font-bold text-gray-900 tracking-tight">Secure Checkout</h1>
              </div>
            </div>

            {/* Center section - Progress Steps */}
            <div className="flex items-center justify-center w-2/4">
              <div className="flex items-center">
                {/* Step 1: Address */}
                <div className="flex items-center">
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                      currentStep === "address"
                        ? "bg-gradient-to-br from-[#d3ae6e] to-[#c19c5d] shadow-lg"
                        : currentStep === "summary" || currentStep === "payment"
                          ? "bg-green-500 shadow-md"
                          : "bg-gray-100"
                    }`}
                  >
                    {currentStep === "summary" || currentStep === "payment" ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <MapPin className={`h-4 w-4 ${currentStep === "address" ? "text-white" : "text-gray-400"}`} />
                    )}
                  </div>
                  <div className="ml-2">
                    <h3
                      className={`font-bold text-xs ${
                        currentStep === "address"
                          ? "text-[#d3ae6e]"
                          : currentStep === "summary" || currentStep === "payment"
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}
                    >
                      Address
                    </h3>
                  </div>
                </div>

                {/* Progress Line 1 */}
                <div className="w-16 mx-3">
                  <div className="h-1 bg-gray-200 rounded-full relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d3ae6e] to-[#c19c5d] rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: currentStep === "address" ? "0%" : "100%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Step 2: Summary */}
                <div className="flex items-center">
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                      currentStep === "summary"
                        ? "bg-gradient-to-br from-[#d3ae6e] to-[#c19c5d] shadow-lg"
                        : currentStep === "payment"
                          ? "bg-green-500 shadow-md"
                          : "bg-gray-100"
                    }`}
                  >
                    {currentStep === "payment" ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <Eye className={`h-4 w-4 ${currentStep === "summary" ? "text-white" : "text-gray-400"}`} />
                    )}
                  </div>
                  <div className="ml-2">
                    <h3
                      className={`font-bold text-xs ${
                        currentStep === "summary"
                          ? "text-[#d3ae6e]"
                          : currentStep === "payment"
                            ? "text-green-600"
                            : "text-gray-500"
                      }`}
                    >
                      Summary
                    </h3>
                  </div>
                </div>

                {/* Progress Line 2 */}
                <div className="w-16 mx-3">
                  <div className="h-1 bg-gray-200 rounded-full relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d3ae6e] to-[#c19c5d] rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: currentStep === "payment" ? "100%" : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Step 3: Payment */}
                <div className="flex items-center">
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                      currentStep === "payment"
                        ? "bg-gradient-to-br from-[#d3ae6e] to-[#c19c5d] shadow-lg"
                        : "bg-gray-100"
                    }`}
                  >
                    <CreditCard className={`h-4 w-4 ${currentStep === "payment" ? "text-white" : "text-gray-400"}`} />
                  </div>
                  <div className="ml-2">
                    <h3
                      className={`font-bold text-xs ${currentStep === "payment" ? "text-[#d3ae6e]" : "text-gray-500"}`}
                    >
                      Payment
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Right section - Price information */}
            <div className="text-right w-1/4">
              <div className="text-lg font-bold text-[#d3ae6e]">
                ₹{checkoutData ? formatPrice(checkoutData.final_amount_to_pay) : formatPrice(totals?.total || 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {totalItems} {totalItems === 1 ? "item" : "items"} • {totalQuantity} qty
              </div>
              {/* Show total savings if available */}
              {totals?.total_discount_amount > 0 && (
                <div className="text-xs text-green-600 font-semibold mt-1">
                  Total Saved: ₹{formatPrice(totals.total_discount_amount)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800 text-sm">Error</h3>
                <p className="text-red-700 text-xs">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address Selection */}
            {currentStep === "address" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-fit">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-[#d3ae6e]/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#d3ae6e] flex items-center justify-center shadow-md">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Select Delivery Address</h2>
                        <p className="text-xs text-gray-600">Choose your preferred delivery location for this order</p>
                      </div>
                    </div>
                    {/* Improved Add Address Button */}
                    <button
                      onClick={handleAddNewAddress}
                      disabled={hasReachedLimit}
                      className={`group relative overflow-hidden px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                        hasReachedLimit
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                          : "bg-gradient-to-r from-[#d3ae6e] to-[#c19c5d] hover:from-[#c19c5d] hover:to-[#d3ae6e] text-white shadow-md hover:shadow-lg"
                      }`}
                      title={
                        hasReachedLimit
                          ? `Maximum ${safeAddressMeta.max_addresses} addresses allowed`
                          : "Add new address"
                      }
                    >
                      <div className="relative flex items-center">
                        <Plus className={`h-3 w-3 mr-1 ${hasReachedLimit ? "text-gray-400" : "text-white"}`} />
                        <span>{hasReachedLimit ? "Limit Reached" : "Add Address"}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Address Content */}
                <div className="p-4">
                  {addressesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#d3ae6e] border-t-transparent"></div>
                    </div>
                  ) : !addresses || addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Delivery Addresses</h3>
                      <p className="text-gray-600 mb-4 text-sm max-w-md mx-auto">
                        Add your first delivery address to continue with your premium shopping experience
                      </p>
                      <UniversalButton onClick={handleAddNewAddress} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Address
                      </UniversalButton>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-700">
                          Saved Addresses ({safeAddressMeta.total_addresses}/{safeAddressMeta.max_addresses})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => handleAddressSelect(address)}
                            className={`group relative border rounded-lg p-3 cursor-pointer transition-all duration-300 hover:shadow-md ${
                              selectedAddress?.id === address.id
                                ? "border-[#d3ae6e] bg-[#d3ae6e]/5 shadow-md"
                                : "border-gray-200 hover:border-[#d3ae6e]/60"
                            }`}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    selectedAddress?.id === address.id
                                      ? "bg-[#d3ae6e] text-white"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {getAddressIcon(address.address_type || address.type)}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-1">
                                  <h4 className="text-sm font-semibold text-gray-900 capitalize truncate">
                                    {address.address_type || address.type}
                                  </h4>
                                  {address.is_default && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#d3ae6e] text-white">
                                      <Shield className="h-2 w-2 mr-0.5" />
                                      Default
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs text-gray-700 font-medium truncate">
                                    {address.contact_name || address.name} • {address.contact_phone || address.phone}
                                  </p>
                                  <p className="text-xs text-gray-600 line-clamp-2">{formatAddress(address)}</p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end ml-2 space-y-1">
                                {!address.is_default && (
                                  <button
                                    onClick={(e) => handleSetDefault(address.id, e)}
                                    disabled={updateAddressMutation.isLoading}
                                    className="flex items-center px-1.5 py-0.5 text-xs font-medium text-[#d3ae6e] bg-[#d3ae6e]/10 border border-[#d3ae6e]/20 rounded hover:bg-[#d3ae6e]/20"
                                    title="Set as default address"
                                  >
                                    <Star className="h-3 w-3 mr-0.5" />
                                    Default
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleEditAddress(address, e)}
                                  className="flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200"
                                  title="Edit address"
                                >
                                  <Edit3 className="h-3 w-3 mr-0.5" />
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Order Summary */}
            {currentStep === "summary" && (
              <>
                <UniversalButton variant="ghost" size="sm" className="mb-3" onClick={handleBackToAddress}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Address
                </UniversalButton>

                {/* Delivery Address & Shipping Info Section */}
                {selectedAddress && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-4">
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Delivery Address */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-lg bg-[#d3ae6e] flex items-center justify-center shadow-lg mr-3">
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm">Delivery Address</h3>
                              {selectedAddress.is_default && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-[#d3ae6e] text-white mt-1">
                                  <Shield className="h-2 w-2 mr-1" />
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                            <p className="font-bold text-gray-900 mb-1 text-sm">
                              {selectedAddress.contact_name || selectedAddress.name}
                            </p>
                            <p className="text-gray-600 mb-2 font-medium text-xs">
                              {selectedAddress.contact_phone || selectedAddress.phone}
                            </p>
                            <p className="text-gray-700 leading-relaxed font-medium text-xs">
                              {formatAddress(selectedAddress)}
                            </p>
                          </div>
                        </div>

                        {/* Shipping Details */}
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg mr-3">
                              <Truck className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm">Shipping Details</h3>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-700 font-semibold text-xs">Delivery Time</span>
                              </div>
                              <span className="font-bold text-gray-900 text-xs">
                                {checkoutData?.shipping?.delivery_time || "1-2 business days"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 font-semibold text-xs">Shipping Charges</span>
                              {checkoutData?.shipping?.is_free ? (
                                <div className="flex items-center space-x-1">
                                  <span className="text-gray-400 line-through text-xs">
                                    ₹{formatPrice(checkoutData.shipping.savings || 50)}
                                  </span>
                                  <span className="font-bold text-emerald-600 text-xs">FREE</span>
                                </div>
                              ) : (
                                <span className="font-bold text-gray-900 text-xs">
                                  ₹{formatPrice(checkoutData?.shipping?.charges || 0)}
                                </span>
                              )}
                            </div>
                            {checkoutData?.shipping?.is_free && (
                              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-2 mt-2">
                                <div className="flex items-center">
                                  <Gift className="h-3 w-3 text-emerald-600 mr-2" />
                                  <span className="text-emerald-700 font-bold text-xs">
                                    {checkoutData.shipping.message || "🎉 You saved ₹50 on shipping!"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Review Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-[#d3ae6e]/5 to-transparent">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#d3ae6e] flex items-center justify-center shadow-lg">
                        <ShoppingBag className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Review Your Order</h2>
                        <p className="text-gray-600 text-xs font-medium">
                          {totalItems} {totalItems === 1 ? "item" : "items"} • {totalQuantity} total quantity
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {checkoutData ? (
                      <ProductReview items={checkoutData.items} />
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#d3ae6e] border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Payment */}
            {currentStep === "payment" && (
              <>
                <UniversalButton variant="ghost" size="sm" className="mb-3" onClick={handleBackToSummary}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Summary
                </UniversalButton>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-[#d3ae6e]/5 to-transparent">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#d3ae6e] flex items-center justify-center shadow-lg">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Choose Payment Method</h2>
                        <p className="text-gray-600 text-xs font-medium">Select your preferred payment method</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {checkoutData?.payment?.methods && checkoutData.payment.methods.length > 0 ? (
                      <div className="space-y-4">
                        {checkoutData.payment.methods.map((method) => (
                          <div
                            key={method.code}
                            onClick={() => handlePaymentMethodChange(method.code)}
                            className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                              selectedPaymentMethod === method.code
                                ? "border-[#d3ae6e] bg-[#d3ae6e]/5 shadow-md"
                                : "border-gray-200 hover:border-[#d3ae6e]/60 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                                    selectedPaymentMethod === method.code
                                      ? "border-[#d3ae6e] bg-[#d3ae6e]"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedPaymentMethod === method.code && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{method.name}</h3>
                                  {method.charges > 0 && (
                                    <p className="text-sm text-gray-600">Additional charges: ₹{method.charges}</p>
                                  )}
                                </div>
                              </div>
                              {method.charges > 0 && (
                                <span className="text-sm font-medium text-gray-700">+₹{method.charges}</span>
                              )}
                            </div>
                          </div>
                        ))}

                        {selectedPaymentMethod && (
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <UniversalButton
                              onClick={() => handleProceedToPayment(selectedPaymentMethod)}
                              disabled={!selectedPaymentMethod || isCreatingOrder}
                              isLoading={isCreatingOrder}
                              className="w-full"
                            >
                              {isCreatingOrder
                                ? "Processing..."
                                : selectedPaymentMethod === "cod"
                                  ? "Place Order"
                                  : "Proceed to Payment"}
                            </UniversalButton>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-4">
                          <AlertCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Options Unavailable</h3>
                        <p className="text-gray-600">
                          We're unable to load payment options at the moment. Please try again.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Cart Summary */}
          <div className="hidden lg:block">
            {currentStep === "address" && (
              <CartSummaryForAddress
                totals={totals}
                isLoading={prepareCheckoutMutation.isLoading}
                disabled={!selectedAddress}
                onContinue={handleAddressConfirm}
              />
            )}

            {(currentStep === "summary" || currentStep === "payment") && (
              <OrderSummaryForSummary
                checkoutData={checkoutData}
                currentStep={currentStep}
                isLoading={currentStep === "summary" ? prepareCheckoutMutation.isLoading : isCreatingOrder}
                disabled={currentStep === "payment" && !selectedPaymentMethod}
                onContinue={
                  currentStep === "summary" ? handleSummaryConfirm : () => handleProceedToPayment(selectedPaymentMethod)
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false)
          setEditingAddress(null)
        }}
        onSave={handleSaveAddress}
        isLoading={createAddressMutation.isLoading || updateAddressMutation.isLoading}
        editingAddress={editingAddress}
      />
    </div>
  )
}
