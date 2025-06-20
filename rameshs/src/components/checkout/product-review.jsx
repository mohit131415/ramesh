"use client"

import { useState } from "react"

export default function ProductReview({ items = [] }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Format price helper
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return `${numPrice.toFixed(2)}`
  }

  // Format weight to remove unnecessary decimals
  const formatWeight = (weight) => {
    if (!weight) return ""
    const numWeight = Number.parseFloat(weight)
    // If it's a whole number, don't show decimals
    if (numWeight % 1 === 0) {
      return `${Math.floor(numWeight)}g`
    }
    // If it's >= 1000, convert to kg
    if (numWeight >= 1000) {
      const kg = numWeight / 1000
      return kg % 1 === 0 ? `${Math.floor(kg)}kg` : `${kg.toFixed(1)}kg`
    }
    return `${numWeight}g`
  }

  // Calculate discount percentage
  const getDiscountPercentage = (original, current) => {
    if (!original || !current || original <= current) return 0
    return Math.round(((original - current) / original) * 100)
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

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No items to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-900">Available Items</h3>
        <span className="text-xs text-gray-500">{items.length} items</span>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item) => {
          const discountPercentage = getDiscountPercentage(item.original_price, item.price)
          const unitPrice = Number.parseFloat(item.price) || 0
          const originalPrice = Number.parseFloat(item.original_price) || unitPrice
          const quantity = item.quantity || 1
          const lineTotal = item.line_total ? Number.parseFloat(item.line_total) : unitPrice * quantity
          const originalLineTotal = originalPrice * quantity
          const totalSavings = originalLineTotal - lineTotal

          return (
            <div
              key={`${item.id}-${item.variant_id}`}
              className="relative bg-white border border-gray-200 rounded-md p-2 shadow-sm"
            >
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md">
                    {discountPercentage}% OFF
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-50 border border-gray-200">
                    <img
                      src={getImageUrl(item.image, item.name) || "/placeholder.svg"}
                      alt={item.name}
                      className={`w-full h-full object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        e.target.src = `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(
                          item.name || "Indian sweet",
                        )}`
                      }}
                    />
                  </div>
                </div>

                {/* Product Details - Middle */}
                <div className="flex-1 min-w-0">
                  {/* Product Name */}
                  <div className="flex items-baseline gap-1">
                    <h4 className="font-semibold text-gray-900 text-xs">{item.name}</h4>
                    <span className="text-[9px] text-gray-500">
                      {item.variant.name} {formatWeight(item.variant.weight)}
                    </span>
                  </div>

                  {/* Price and Quantity */}
                  <div className="flex items-center text-[10px] text-gray-600 mt-0.5">
                    <span className="font-medium">₹{formatPrice(unitPrice)}</span>
                    <span className="mx-1">×</span>
                    <span>{quantity} units</span>
                    {originalPrice > unitPrice && (
                      <span className="ml-1 text-gray-400 line-through">₹{formatPrice(originalPrice)}</span>
                    )}
                  </div>

                  {/* Savings */}
                  {totalSavings > 0 && (
                    <div className="mt-0.5">
                      <span className="text-[10px] font-medium text-green-600">Save ₹{formatPrice(totalSavings)}</span>
                    </div>
                  )}
                </div>

                {/* Right side - Total price */}
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: "#d3ae6e" }}>
                    ₹{formatPrice(lineTotal)}
                  </div>
                  {originalLineTotal > lineTotal && (
                    <div className="text-[10px] text-gray-400 line-through">₹{formatPrice(originalLineTotal)}</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
