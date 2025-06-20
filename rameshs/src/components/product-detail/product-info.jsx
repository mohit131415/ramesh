"use client"

import React, { useState } from "react"
import useCartStore from "../../store/cartStore"

const ProductInfo = ({ product, selectedVariant, setSelectedVariant, hideHeader = false }) => {
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState("")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addToCart, items } = useCartStore()

  // Initialize selectedVariant with the first variant if not already set
  React.useEffect(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      // Find the variant with the lowest sale_price or price
      const lowestPriceVariant = product.variants.reduce((lowest, current) => {
        const lowestPrice = lowest.sale_price || lowest.price
        const currentPrice = current.sale_price || current.price
        return Number.parseFloat(currentPrice) < Number.parseFloat(lowestPrice) ? current : lowest
      }, product.variants[0])

      setSelectedVariant(lowestPriceVariant)
    }
  }, [product, selectedVariant, setSelectedVariant])

  // Get existing quantity in cart for the selected variant
  const getExistingCartQuantity = () => {
    if (!selectedVariant) return 0

    const existingItem = items.find((item) => item.product_id === product.id && item.variant_id === selectedVariant.id)

    return existingItem ? existingItem.quantity : 0
  }

  // Handle quantity changes with cart validation
  const handleQuantityChange = (newQuantity) => {
    if (selectedVariant) {
      const maxQty = selectedVariant.max_order_quantity || 10
      const minQty = selectedVariant.min_order_quantity || 1
      const existingQty = getExistingCartQuantity()

      const maxAllowedToAdd = Math.max(0, maxQty - existingQty)

      if (newQuantity > maxAllowedToAdd) {
        setQuantity(maxAllowedToAdd)
        if (maxAllowedToAdd < maxQty) {
          setError(`You already have ${existingQty} of this item in cart. Maximum allowed is ${maxQty}.`)
        }
        return
      }

      const validQuantity = Math.max(minQty, Math.min(maxAllowedToAdd, newQuantity))
      setQuantity(validQuantity)
      setError("")
    } else {
      setQuantity(Math.max(1, newQuantity))
    }
  }

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant)
    setError("")

    const existingQty =
      items.find((item) => item.product_id === product.id && item.variant_id === variant.id)?.quantity || 0

    const maxQty = variant.max_order_quantity || 10
    const maxAllowedToAdd = Math.max(0, maxQty - existingQty)

    if (maxAllowedToAdd === 0) {
      setQuantity(0)
      setError(`Maximum quantity (${maxQty}) already in cart for this variant.`)
    } else {
      const minQty = variant.min_order_quantity || 1
      setQuantity(Math.min(minQty, maxAllowedToAdd))
    }
  }

  // Add to cart function
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setError("Please select a variant")
      return
    }

    const existingQty = getExistingCartQuantity()
    const maxQty = selectedVariant.max_order_quantity || 10
    const totalQuantity = existingQty + quantity

    // Validate total quantity doesn't exceed maximum
    if (totalQuantity > maxQty) {
      setError(`Cannot add ${quantity} items. You already have ${existingQty} in cart. Maximum allowed is ${maxQty}.`)
      return
    }

    if (quantity <= 0) {
      setError("Please select a valid quantity")
      return
    }

    setIsAddingToCart(true)
    setError("")

    try {
      // Create a product object with all necessary details (same as add-to-cart popup)
      const cartItem = {
        name: product.name,
        image: product.images?.[0]?.image_path || "",
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

      // Use the same format as add-to-cart popup
      const result = await addToCart(product.id, selectedVariant?.id || 0, quantity, cartItem)

      if (result.success) {
        setAddedToCart(true)

        // Reset quantity and show updated limits
        const newExistingQty = existingQty + quantity
        const newMaxAllowedToAdd = Math.max(0, maxQty - newExistingQty)

        if (newMaxAllowedToAdd === 0) {
          setQuantity(0)
        } else {
          setQuantity(Math.min(selectedVariant.min_order_quantity || 1, newMaxAllowedToAdd))
        }

        // Reset after a delay
        setTimeout(() => {
          setAddedToCart(false)
        }, 3000)
      }
    } catch (error) {
      setError(error.message || "Failed to add item to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Simple price formatter function
  const formatPriceValue = (price) => {
    if (!price) return "0"
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  // Calculate current price
  const currentPrice = selectedVariant ? selectedVariant.sale_price || selectedVariant.price : product.price || "0"

  const originalPrice = selectedVariant?.price
  const hasDiscount =
    selectedVariant?.sale_price &&
    Number.parseFloat(selectedVariant.sale_price) < Number.parseFloat(selectedVariant.price)

  // Format weight
  const formatWeight = (weight, unit) => {
    if (!weight) return ""
    if (unit === "g") {
      return `${Number.parseFloat(weight).toFixed(0)}g`
    } else if (unit === "kg") {
      return `${Number.parseFloat(weight).toFixed(2)}kg`
    }
    return `${weight} ${unit}`
  }

  // Get current cart status for selected variant
  const existingCartQty = getExistingCartQuantity()
  const maxQty = selectedVariant?.max_order_quantity || 10
  const maxAllowedToAdd = Math.max(0, maxQty - existingCartQty)

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.short_description || product.description}</p>
        </div>
      )}

      {/* Price Display */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold" style={{ color: "#d3ae6e" }}>
            ₹{formatPriceValue(currentPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xl text-gray-500 line-through">₹{formatPriceValue(originalPrice)}</span>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                {Number.parseFloat(selectedVariant.discount_percentage).toFixed(0)}% OFF
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-600">Inclusive of all taxes • {product.tax_rate}% GST</p>
      </div>

      {/* Variant selection */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Select Size:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {product.variants.map((variant) => {
              const variantPrice = variant.sale_price || variant.price
              const isSelected = selectedVariant?.id === variant.id
              const variantExistingQty =
                items.find((item) => item.product_id === product.id && item.variant_id === variant.id)?.quantity || 0
              const variantMaxQty = variant.max_order_quantity || 10
              const isVariantMaxed = variantExistingQty >= variantMaxQty

              return (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? "ring-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  } ${isVariantMaxed ? "opacity-60" : ""}`}
                  style={
                    isSelected
                      ? {
                          borderColor: "#d3ae6e",
                          backgroundColor: "#faf8f3",
                          ringColor: "#d3ae6e",
                          ringWidth: "2px",
                        }
                      : {}
                  }
                >
                  <div className="font-medium text-gray-900">{variant.variant_name}</div>
                  <div className="text-sm text-gray-600">{formatWeight(variant.weight, variant.weight_unit)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold" style={{ color: "#d3ae6e" }}>
                      ₹{formatPriceValue(variantPrice)}
                    </span>
                    {variant.sale_price && (
                      <span className="text-xs text-gray-500 line-through">₹{formatPriceValue(variant.price)}</span>
                    )}
                  </div>
                  {variantExistingQty > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {variantExistingQty} in cart {isVariantMaxed && "(Max reached)"}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Cart Status */}
      {selectedVariant && existingCartQty > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            You already have {existingCartQty} of this item in your cart.
            {maxAllowedToAdd > 0 ? ` You can add ${maxAllowedToAdd} more.` : " Maximum quantity reached."}
          </p>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={quantity <= 1 || maxAllowedToAdd <= 0}
          >
            -
          </button>
          <span className="px-4 py-2 min-w-[60px] text-center border-x border-gray-300">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={quantity >= maxAllowedToAdd || maxAllowedToAdd <= 0}
          >
            +
          </button>
        </div>
        {selectedVariant && (
          <span className="text-xs text-gray-500">
            {existingCartQty > 0 && `${existingCartQty} in cart, `}
            Max: {maxAllowedToAdd} more
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Shelf Life:</span>
          <span className="ml-2 font-medium">{product.shelf_life || "N/A"}</span>
        </div>
        <div>
          <span className="text-gray-600">Category:</span>
          <span className="ml-2 font-medium">{product.category?.name || "N/A"}</span>
        </div>
        <div>
          <span className="text-gray-600">Type:</span>
          <span className="ml-2 font-medium">{product.is_vegetarian ? "🌱 Vegetarian" : "Non-Vegetarian"}</span>
        </div>
        <div>
          <span className="text-gray-600">Weight:</span>
          <span className="ml-2 font-medium">
            {selectedVariant ? formatWeight(selectedVariant.weight, selectedVariant.weight_unit) : "N/A"}
          </span>
        </div>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart || !selectedVariant || quantity <= 0 || maxAllowedToAdd <= 0}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
          isAddingToCart || !selectedVariant || quantity <= 0 || maxAllowedToAdd <= 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : addedToCart
              ? "bg-green-600 text-white"
              : "text-white"
        }`}
        style={
          !isAddingToCart && !addedToCart && selectedVariant && quantity > 0 && maxAllowedToAdd > 0
            ? {
                backgroundColor: "#d3ae6e",
              }
            : {}
        }
        onMouseEnter={(e) => {
          if (!isAddingToCart && !addedToCart && selectedVariant && quantity > 0 && maxAllowedToAdd > 0) {
            e.target.style.backgroundColor = "#c19a5a"
          }
        }}
        onMouseLeave={(e) => {
          if (!isAddingToCart && !addedToCart && selectedVariant && quantity > 0 && maxAllowedToAdd > 0) {
            e.target.style.backgroundColor = "#d3ae6e"
          }
        }}
      >
        {isAddingToCart ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Adding to Cart...
          </div>
        ) : addedToCart ? (
          "✓ Added to Cart!"
        ) : maxAllowedToAdd <= 0 ? (
          "Maximum Quantity in Cart"
        ) : (
          `Add to Cart - ₹${formatPriceValue((Number.parseFloat(currentPrice) * quantity).toFixed(2))}`
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Storage Instructions */}
      {product.storage_instructions && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">Storage Instructions</h4>
          <p className="text-blue-700 text-sm">{product.storage_instructions}</p>
        </div>
      )}
    </div>
  )
}

export default ProductInfo
