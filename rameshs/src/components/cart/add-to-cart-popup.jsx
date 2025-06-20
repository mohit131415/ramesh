"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, ShoppingCart, Check, AlertCircle, Minus, Plus } from "lucide-react"
import useCartStore from "../../store/cartStore"
import { formatWeight } from "../../lib/formatters"
import { toast } from "react-toastify"

const AddToCartPopup = ({ isOpen, onClose, product }) => {
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCartStore()
  const { items } = useCartStore()

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
    if (product && product.variants && product.variants.length > 0) {
      const sortedVariants = [...product.variants].sort((a, b) => {
        const priceA = a.sale_price && Number(a.sale_price) > 0 ? Number(a.sale_price) : Number(a.price)
        const priceB = b.sale_price && Number(b.sale_price) > 0 ? Number(b.sale_price) : Number(b.price)
        return priceA - priceB
      })

      setSelectedVariant(sortedVariants[0])

      // Get existing quantity in cart for this variant
      const existingQty =
        items.find((item) => item.product_id === product.id && item.variant_id === sortedVariants[0].id)?.quantity || 0

      const maxQty = sortedVariants[0].max_order_quantity || 10
      const maxAllowedToAdd = Math.max(0, maxQty - existingQty)

      if (maxAllowedToAdd === 0) {
        setQuantity(0)
      } else {
        setQuantity(Math.min(sortedVariants[0].min_order_quantity || 1, maxAllowedToAdd))
      }
    }

    setIsAdded(false)
  }, [product, isOpen, items])

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant)

    const existingQty =
      items.find((item) => item.product_id === product.id && item.variant_id === variant.id)?.quantity || 0

    const maxQty = variant.max_order_quantity || 10
    const maxAllowedToAdd = Math.max(0, maxQty - existingQty)

    if (maxAllowedToAdd === 0) {
      setQuantity(0)
    } else {
      setQuantity(Math.min(variant.min_order_quantity || 1, maxAllowedToAdd))
    }
    setIsAdded(false)
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith("http")) return imagePath
    if (imagePath.startsWith("/api/public/")) return imagePath
    if (imagePath.startsWith("uploads/") || imagePath.startsWith("/uploads/")) {
      return `/api/public/${imagePath.startsWith("/") ? imagePath.substring(1) : imagePath}`
    }
    return `/api/public/${imagePath}`
  }

  const primaryImage = product?.images?.find((img) => img.is_primary === 1)
  const imageUrl = primaryImage ? getImageUrl(primaryImage.image_path) : "/placeholder.svg"

  const handleAddToCart = async () => {
    if (!product) return

    const existingQty =
      items.find((item) => item.product_id === product.id && item.variant_id === selectedVariant.id)?.quantity || 0

    const maxQty = selectedVariant.max_order_quantity || 10
    const maxAllowedToAdd = Math.max(0, maxQty - existingQty)

    if (quantity > maxAllowedToAdd) {
      if (window.showToast) {
        window.showToast({
          title: "Quantity limit exceeded",
          description: `You can only add ${maxAllowedToAdd} more of this item. You already have ${existingQty} in cart.`,
          type: "error",
          duration: 5000,
        })
      }
      return
    }

    try {
      setIsAdding(true)

      const cartItem = {
        name: product.name,
        image: product.images?.[0] || "",
        price: selectedVariant?.price || product.price,
        tax_rate: product.tax_rate || 5,
        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              name: selectedVariant.variant_name,
              price: selectedVariant.price,
            }
          : null,
      }

      const result = await addToCart(product.id, selectedVariant?.id || 0, quantity, cartItem)

      if (result.success) {
        setIsAdded(true)

        setTimeout(() => {
          onClose()
          setQuantity(1)
          setSelectedVariant(product.variants?.[0] || null)
          setIsAdded(false)
        }, 1200)
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          title: "Failed to add item",
          description: error.message || "Failed to add item to cart",
          type: "error",
          duration: 5000,
        })
      } else {
        toast.error("Failed to add item to cart")
      }
    } finally {
      setIsAdding(false)
    }
  }

  const formatPrice = (value) => {
    if (!value) return "0.00"
    return Number.parseFloat(value).toFixed(2)
  }

  const getDiscountPercentage = (variant) => {
    if (!variant) return 0
    if (variant.sale_price && Number(variant.price) > Number(variant.sale_price)) {
      return Math.round(((Number(variant.price) - Number(variant.sale_price)) / Number(variant.price)) * 100)
    }
    return 0
  }

  const canAddVariant = (variant) => {
    const existingQty =
      items.find((item) => item.product_id === product.id && item.variant_id === variant.id)?.quantity || 0
    const maxQty = variant.max_order_quantity || 10
    return maxQty > existingQty
  }

  const getMaxAllowedQuantity = () => {
    if (!selectedVariant) return 0
    const existingQty =
      items.find((item) => item.product_id === product.id && item.variant_id === selectedVariant.id)?.quantity || 0
    const maxQty = selectedVariant.max_order_quantity || 10
    return Math.max(0, maxQty - existingQty)
  }

  if (!isOpen || !product) return null

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
        <div className="relative px-6 py-4 bg-gradient-to-r from-[#d3ae6e]/5 to-[#d3ae6e]/10 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-all shadow-sm"
          >
            <X size={16} className="text-gray-600" />
          </button>
          <div className="pr-10">
            <h3 className="text-xl font-bold text-gray-900">Add to Cart</h3>
            <p className="text-sm text-gray-600 mt-1">{product.name}</p>
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
                  <img src={imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  {selectedVariant && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#d3ae6e]">
                        ₹
                        {formatPrice(
                          selectedVariant.sale_price > 0 ? selectedVariant.sale_price : selectedVariant.price,
                        )}
                      </span>
                      {selectedVariant.sale_price > 0 &&
                        Number(selectedVariant.price) > Number(selectedVariant.sale_price) && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{formatPrice(selectedVariant.price)}
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
                <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {product.variants &&
                    product.variants.map((variant) => {
                      const isDisabled = !canAddVariant(variant)
                      const existingQty =
                        items.find((item) => item.product_id === product.id && item.variant_id === variant.id)
                          ?.quantity || 0
                      const isSelected = selectedVariant?.id === variant.id

                      return (
                        <button
                          key={variant.id}
                          onClick={() => !isDisabled && handleVariantChange(variant)}
                          disabled={isDisabled}
                          className={`
                            w-full p-2.5 rounded-lg border text-left transition-all flex-shrink-0 group
                            ${
                              isSelected
                                ? "border-[#d3ae6e] bg-[#d3ae6e]/8 shadow-sm"
                                : isDisabled
                                  ? "border-gray-200 bg-gray-50 opacity-60"
                                  : "border-gray-200 hover:border-[#d3ae6e]/50 hover:bg-gray-50"
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 text-sm truncate">
                                  {variant.variant_name}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                  {formatWeight(variant.weight, variant.weight_unit)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#d3ae6e]">
                                  ₹{formatPrice(variant.sale_price > 0 ? variant.sale_price : variant.price)}
                                </span>
                                {variant.sale_price > 0 && Number(variant.price) > Number(variant.sale_price) && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{formatPrice(variant.price)}
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
                              {existingQty > 0 && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                                  {existingQty} in cart
                                </span>
                              )}
                              {isDisabled && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle size={10} />
                                  Max
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Right Column - Quantity & Total - Fixed */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Quantity Selection */}
                {selectedVariant && getMaxAllowedQuantity() > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#d3ae6e] rounded-full"></span>
                        Quantity
                      </h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Max {getMaxAllowedQuantity()} more
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <button
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d3ae6e] hover:bg-[#d3ae6e]/5 transition-all shadow-sm"
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>
                      <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                      <button
                        onClick={() => quantity < getMaxAllowedQuantity() && setQuantity(quantity + 1)}
                        disabled={quantity >= getMaxAllowedQuantity()}
                        className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#d3ae6e] hover:bg-[#d3ae6e]/5 transition-all shadow-sm"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Total Price */}
                {selectedVariant && quantity > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-[#d3ae6e]/5 to-[#d3ae6e]/10 rounded-xl border border-[#d3ae6e]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">
                        Total ({quantity} item{quantity > 1 ? "s" : ""})
                      </span>
                      <span className="text-2xl font-bold text-[#d3ae6e]">
                        ₹
                        {formatPrice(
                          (selectedVariant.sale_price > 0 ? selectedVariant.sale_price : selectedVariant.price) *
                            quantity,
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !selectedVariant || isAdded || quantity === 0}
                className={`
                  w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg
                  ${
                    isAdded
                      ? "bg-green-500 text-white shadow-green-200"
                      : isAdding
                        ? "bg-[#d3ae6e]/70 text-white"
                        : quantity === 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                          : "bg-[#d3ae6e] hover:bg-[#c19c5d] text-white shadow-[#d3ae6e]/30 hover:shadow-xl hover:-translate-y-0.5"
                  }
                `}
              >
                {isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : isAdded ? (
                  <>
                    <Check size={20} />
                    <span>Added Successfully!</span>
                  </>
                ) : quantity === 0 ? (
                  <>
                    <AlertCircle size={20} />
                    <span>Cannot Add More</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
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

export default AddToCartPopup
