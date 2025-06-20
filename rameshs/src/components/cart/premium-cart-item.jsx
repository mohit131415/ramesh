"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Minus, Plus, Edit, Trash2, Star } from "lucide-react"

const PremiumCartItem = ({ item, onQuantityChange, onRemove, onEdit, isLoading = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Format price with proper currency symbol
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₹0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return `₹${numPrice.toFixed(2)}`
  }

  // Get image URL
  const getImageUrl = (imagePath, productName) => {
    if (!imagePath) {
      return `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(productName || "Indian sweet")}`
    }

    if (typeof imagePath === "object" && imagePath.image_path) {
      imagePath = imagePath.image_path
    }

    if (typeof imagePath !== "string") {
      return `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(productName || "Indian sweet")}`
    }

    if (imagePath.startsWith("http")) return imagePath
    if (imagePath.startsWith("uploads/")) return `/api/public/${imagePath}`
    if (imagePath.startsWith("/api/public/")) return imagePath

    return `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(productName || "Indian sweet")}`
  }

  // Calculate pricing details
  const unitPrice = Number.parseFloat(item.price) || 0
  const originalPrice = Number.parseFloat(item.original_price) || unitPrice
  const quantity = item.quantity || 1
  const lineTotal = item.line_total ? Number.parseFloat(item.line_total) : unitPrice * quantity
  const originalLineTotal = originalPrice * quantity
  const discountPercentage = Number.parseFloat(item.discount_percentage) || 0
  const totalSavings = originalLineTotal - lineTotal

  // Get variant name
  const getVariantName = (item) => {
    return item.current_variant?.name || item.variant_name || "Standard"
  }

  const handleQuantityChange = (newQuantity) => {
    const minQty = item?.min_quantity || 1
    const maxQty = item?.max_quantity || 10

    if (newQuantity < minQty) {
      onRemove(`local_${item.product_id}_${item.variant_id}`)
    } else if (newQuantity <= maxQty) {
      onQuantityChange(`local_${item.product_id}_${item.variant_id}`, newQuantity, item)
    }
  }

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md transition-all duration-300 hover:border-gray-300 shadow-sm">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
            {Math.round(discountPercentage)}% OFF
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Product Image - Compact but still big */}
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm group-hover:shadow-md transition-all duration-300">
            <img
              src={getImageUrl(item.image, item.name) || "/placeholder.svg"}
              alt={item.name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(item.name || "Indian sweet")}`
              }}
            />
          </div>

          {/* Premium Quality Badge */}
          <div
            className="absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-lg border border-white"
            style={{ backgroundColor: "#d3ae6e" }}
          >
            <Star className="w-2.5 h-2.5 text-white fill-current" />
          </div>
        </div>

        {/* Product Details - Ultra Compact */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-2">
              {/* Product Name */}
              <Link to={`/product/slug/${item.slug}`} className="transition-colors duration-200 group">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:opacity-80">
                  {item.name}
                </h3>
              </Link>

              {/* Variant */}
              <div className="mb-1">
                <span className="text-xs text-gray-600">{getVariantName(item)}</span>
              </div>

              {/* Pricing Information */}
              <div className="space-y-0.5 mb-2">
                {/* Unit Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-gray-900">{formatPrice(unitPrice)}</span>
                  <span className="text-xs text-gray-500">per unit</span>
                  {originalPrice > unitPrice && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                  )}
                </div>

                {/* Quantity Calculation */}
                {quantity > 1 && (
                  <div className="text-xs text-gray-600">
                    {formatPrice(unitPrice)} × {quantity} units
                  </div>
                )}

                {/* Savings */}
                {totalSavings > 0 && (
                  <div>
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                      Save {formatPrice(totalSavings)}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center">
                <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || quantity <= (item.min_quantity || 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <div className="px-2 py-1.5 bg-gray-50 border-x border-gray-300">
                    <span className="text-sm font-semibold text-gray-900 text-center block min-w-[1rem]">
                      {quantity}
                    </span>
                  </div>

                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || quantity >= (item.max_quantity || 10)}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Price and Actions */}
            <div className="text-center flex flex-col items-center gap-2 mt-4">
              {/* Line Total */}
              <div className="mb-2">
                <div className="text-lg font-bold mb-0.5" style={{ color: "#d3ae6e" }}>
                  {formatPrice(lineTotal)}
                </div>
                {originalLineTotal > lineTotal && (
                  <div className="text-xs text-gray-400 line-through">{formatPrice(originalLineTotal)}</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {item.available_variants && item.available_variants.length > 1 && (
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 hover:bg-gray-50 rounded transition-colors border border-gray-200 shadow-sm"
                    style={{ color: "#d3ae6e" }}
                    disabled={isLoading}
                    title="Edit variant"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => onRemove(`local_${item.product_id}_${item.variant_id}`)}
                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors border border-red-200 shadow-sm"
                  disabled={isLoading}
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PremiumCartItem
