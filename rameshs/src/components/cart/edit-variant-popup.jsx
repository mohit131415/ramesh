"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import { X, ShoppingCart, Minus, Plus, Check, AlertCircle } from "lucide-react"
import useCartStore from "../../store/cartStore"
import { formatWeight } from "../../lib/formatters"

const EditVariantPopup = ({ isOpen, onClose, item }) => {
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const { items, removeCartItem, addToCart } = useCartStore()
  const location = useLocation()

  // Prevent background scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && item) {
      let currentVariant = null

      if (item.available_variants && item.available_variants.length > 0) {
        currentVariant = item.available_variants.find((v) => v.is_current === true) || item.available_variants[0]
        setSelectedVariant(currentVariant)
      } else if (item.current_variant) {
        setSelectedVariant(item.current_variant)
      }

      setQuantity(item.quantity || 1)
      setIsUpdated(false)
    }
  }, [isOpen, item])

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant)
    setIsUpdated(false)

    if (quantity < variant.min_quantity || quantity > variant.max_quantity) {
      setQuantity(variant.min_quantity || 1)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg?height=120&width=120&query=indian+sweet"
    if (imagePath.startsWith("http")) return imagePath
    if (imagePath.startsWith("uploads/")) {
      return `/api/public/${imagePath}`
    }
    if (imagePath.startsWith("/api/public/")) return imagePath
    return `/api/public/${imagePath}`
  }

  const imageUrl = item?.image ? getImageUrl(item.image) : "/placeholder.svg?height=120&width=120&query=indian+sweet"

  const handleUpdateVariant = async () => {
    if (!item || !selectedVariant) return

    const maxQty = selectedVariant.max_quantity || 10
    const minQty = selectedVariant.min_quantity || 1

    if (quantity > maxQty) {
      if (window.showToast) {
        window.showToast({
          title: "Quantity limit exceeded",
          description: `Maximum quantity for this variant is ${maxQty}`,
          type: "error",
          duration: 5000,
        })
      }
      return
    }

    if (quantity < minQty) {
      if (window.showToast) {
        window.showToast({
          title: "Minimum quantity required",
          description: `Minimum quantity for this variant is ${minQty}`,
          type: "error",
          duration: 5000,
        })
      }
      return
    }

    try {
      setIsUpdating(true)

      await removeCartItem(`local_${item.product_id}_${item.variant_id}`)

      const cartItem = {
        name: item.name,
        image: item.image || null,
        price: selectedVariant.price,
        tax_rate: item.tax_rate || 5,
        variant: {
          id: selectedVariant.id,
          name: selectedVariant.name,
          price: selectedVariant.price,
        },
      }

      const result = await addToCart(item.product_id, selectedVariant.id, quantity, cartItem, {
        openCartDrawer: false,
      })

      if (result.success) {
        setIsUpdated(true)

        if (window.showToast) {
          window.showToast({
            title: "Item updated",
            description: "Your cart item has been updated successfully",
            type: "success",
            duration: 3000,
          })
        }

        setTimeout(() => {
          onClose()
          setIsUpdated(false)
        }, 1200)
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          title: "Failed to update item",
          description: error.message || "Failed to update cart item",
          type: "error",
          duration: 5000,
        })
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const formatPrice = (value) => {
    if (!value) return "0.00"
    return Number.parseFloat(value).toFixed(2)
  }

  const getDiscountPercentage = (variant) => {
    if (!variant || !variant.discount_percentage) return 0
    return Math.round(Number.parseFloat(variant.discount_percentage))
  }

  const hasChanges = () => {
    if (!item || !selectedVariant) return false

    const currentVariant = item.available_variants?.find((v) => v.is_current === true)
    const currentVariantId = currentVariant?.id || item.variant_id
    const currentQuantity = item.quantity || 1

    return selectedVariant.id !== currentVariantId || quantity !== currentQuantity
  }

  const getQuantityLimits = () => {
    if (selectedVariant) {
      return {
        min: selectedVariant.min_quantity || 1,
        max: selectedVariant.max_quantity || 10,
      }
    }
    return {
      min: item?.min_quantity || 1,
      max: item?.max_quantity || 10,
    }
  }

  const quantityLimits = getQuantityLimits()

  const calculateTotal = () => {
    if (!selectedVariant) return "0.00"
    const price = Number(selectedVariant.price) || 0
    return formatPrice(price * quantity)
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl h-[70vh] flex flex-col overflow-hidden border border-gray-100"
      >
        {/* Header - Fixed */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-all shadow-sm"
          >
            <X size={16} className="text-gray-600" />
          </button>
          <div className="pr-10">
            <h3 className="text-xl font-bold text-gray-900">Edit Cart Item</h3>
            <p className="text-sm text-gray-600 mt-1">{item.name}</p>
          </div>
        </div>

        {/* Content - Fixed Layout */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column - Product Info & Variants */}
            <div className="flex flex-col">
              {/* Product Image & Price - Fixed */}
              <div className="flex items-center gap-4 mb-4 flex-shrink-0 p-3 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 shadow-sm border border-gray-100">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=120&width=120&query=indian+sweet"
                    }}
                  />
                </div>
                <div className="flex-1">
                  {selectedVariant && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#d3ae6e]">₹{formatPrice(selectedVariant.price)}</span>
                      {selectedVariant.original_price &&
                        Number(selectedVariant.original_price) > Number(selectedVariant.price) && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{formatPrice(selectedVariant.original_price)}
                          </span>
                        )}
                    </div>
                  )}
                  {getDiscountPercentage(selectedVariant) > 0 && (
                    <span className="inline-block mt-1 text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                      {getDiscountPercentage(selectedVariant)}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selection - Scrollable */}
              <div className="flex-1 flex flex-col min-h-0">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex-shrink-0 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d3ae6e] rounded-full"></span>
                  Choose Size
                </h4>
                {item.available_variants && item.available_variants.length > 0 ? (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {item.available_variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id

                      return (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantChange(variant)}
                          className={`
                            w-full p-2.5 rounded-lg border text-left transition-all flex-shrink-0 group
                            ${isSelected ? "border-[#d3ae6e] bg-[#d3ae6e]/8 shadow-sm" : "border-gray-200 hover:border-[#d3ae6e]/50 hover:bg-gray-50"}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 text-sm truncate">{variant.name}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                  {formatWeight(variant.weight, variant.attributes?.weight_unit || "g")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#d3ae6e]">₹{formatPrice(variant.price)}</span>
                                {variant.original_price && Number(variant.original_price) > Number(variant.price) && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{formatPrice(variant.original_price)}
                                  </span>
                                )}
                                {getDiscountPercentage(variant) > 0 && (
                                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                                    {getDiscountPercentage(variant)}% OFF
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              {isSelected && (
                                <div className="w-5 h-5 bg-[#d3ae6e] rounded-full flex items-center justify-center shadow-sm">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                              {variant.is_current && (
                                <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-xl flex-shrink-0">
                    <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">No variants available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Quantity & Total - Fixed */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Quantity Selection */}
                {selectedVariant && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#d3ae6e] rounded-full"></span>
                        Quantity
                      </h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Min: {quantityLimits.min} • Max: {quantityLimits.max}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <button
                        onClick={() => quantity > quantityLimits.min && setQuantity(quantity - 1)}
                        disabled={quantity <= quantityLimits.min}
                        className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d3ae6e] hover:bg-[#d3ae6e]/5 transition-all shadow-sm"
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>
                      <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                      <button
                        onClick={() => quantity < quantityLimits.max && setQuantity(quantity + 1)}
                        disabled={quantity >= quantityLimits.max}
                        className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d3ae6e] hover:bg-[#d3ae6e]/5 transition-all shadow-sm"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Total Price */}
                {selectedVariant && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-[#d3ae6e]/5 to-[#d3ae6e]/10 rounded-xl border border-[#d3ae6e]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">
                        Total ({quantity} item{quantity > 1 ? "s" : ""})
                      </span>
                      <span className="text-2xl font-bold text-[#d3ae6e]">₹{calculateTotal()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Update Button */}
              <button
                onClick={handleUpdateVariant}
                disabled={isUpdating || !selectedVariant || isUpdated || !hasChanges()}
                className={`
                  w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg
                  ${
                    isUpdated
                      ? "bg-green-500 text-white shadow-green-200"
                      : isUpdating
                        ? "bg-[#d3ae6e]/70 text-white"
                        : hasChanges()
                          ? "bg-[#d3ae6e] hover:bg-[#c19c5d] text-white shadow-[#d3ae6e]/30 hover:shadow-xl hover:-translate-y-0.5"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                  }
                `}
              >
                {isUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Cart...</span>
                  </>
                ) : isUpdated ? (
                  <>
                    <Check size={20} />
                    <span>Updated Successfully!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>{hasChanges() ? "Update Cart" : "No Changes"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EditVariantPopup
