"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ShoppingCart, Check, Search } from "lucide-react"
import useCartStore from "../../store/cartStore"
import useProductStore from "../../store/productStore"
import AddToCartPopup from "../cart/add-to-cart-popup"
import apiClient from "../../services/api-client"

const ProductCard = ({ product, isSearchResult, onShowPopup }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [showAddToCartPopup, setShowAddToCartPopup] = useState(false)
  const { addItem } = useCartStore()
  const { searchQuery } = useProductStore()

  // Handle missing product data with defaults
  const {
    id,
    name = "Product Name",
    slug = "product-slug",
    variants = [],
    images = [],
    category,
    tags = [],
    is_vegetarian = true,
  } = product || {}

  // Apply highlight effect when card appears in search results
  useEffect(() => {
    if (isSearchResult && searchQuery) {
      setIsHighlighted(true)
      const timer = setTimeout(() => {
        setIsHighlighted(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSearchResult, searchQuery])

  // Get the primary image
  const primaryImage = images.find((img) => img.is_primary === 1)

  // Find the variant with the lowest effective price (sale price or regular price)
  const primaryVariant =
    variants.length > 0
      ? variants.sort((a, b) => {
          const priceA = a.sale_price && Number(a.sale_price) > 0 ? Number(a.sale_price) : Number(a.price)
          const priceB = b.sale_price && Number(b.sale_price) > 0 ? Number(b.sale_price) : Number(b.price)
          return priceA - priceB
        })[0]
      : { price: 0, sale_price: 0, variant_name: "" }

  const price = primaryVariant.price ? Number.parseFloat(primaryVariant.price) : 0
  const salePrice = primaryVariant.sale_price ? Number.parseFloat(primaryVariant.sale_price) : 0
  const variantName = primaryVariant.variant_name || ""
  const discount = salePrice && price > salePrice ? Math.round(((price - salePrice) / price) * 100) : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Check if onShowPopup is provided, if not, use internal popup
    if (onShowPopup && typeof onShowPopup === "function") {
      onShowPopup(product)
    } else {
      // Use internal popup if onShowPopup is not provided
      setShowAddToCartPopup(true)
    }
  }

  const handlePopupAddToCart = async () => {
    setIsAddingToCart(true)

    try {
      // Get the selected variant for the current product
      const variant = primaryVariant
      const cartItem = {
        name: product.name,
        image: product.images?.[0] || "",
        price: variant.sale_price > 0 ? variant.sale_price : variant.price,
        tax_rate: product.tax_rate || 5,
        variant: {
          id: variant.id,
          name: variant.variant_name || variant.weight,
          price: variant.sale_price > 0 ? variant.sale_price : variant.price,
        },
      }

      // Add the item to the cart using the store method
      const result = await addItem({
        id: product.id,
        quantity: 1,
        selectedVariant: { id: variant.id || 0 },
        ...cartItem,
      })

      if (result.success) {
        setIsAddingToCart(false)
        setIsAddedToCart(true)

        // Reset after a short delay
        setTimeout(() => {
          setIsAddedToCart(false)
          setShowAddToCartPopup(false)
        }, 1500)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      setIsAddingToCart(false)
    }
  }

  // Generate product URL - use slug if available, otherwise use ID
  const productUrl = slug ? `/product/slug/${slug}` : `/product/${id}`

  // Format price with proper decimal places
  const formatPrice = (value) => {
    if (!value) return "0.00"
    return Number.parseFloat(value).toFixed(2)
  }

  // Get variant sizes for display
  const getVariantSizes = () => {
    if (variants.length === 0) return []

    // Extract unique sizes from variants
    const sizes = [...new Set(variants.map((v) => v.variant_name))]
    return sizes.slice(0, 2) // Only show first 2 sizes
  }

  // Highlight matching text in product name
  const highlightMatchingText = (text, query) => {
    if (!query || query.length < 2) return text

    try {
      const regex = new RegExp(`(${query})`, "gi")
      return text.replace(regex, '<span class="bg-yellow-200">$1</span>')
    } catch (e) {
      return text
    }
  }

  const variantSizes = getVariantSizes()
  const hasMoreSizes = variants.length > 2

  // Determine if this product matches the search query
  const matchesSearch =
    searchQuery &&
    (name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category && category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tags && tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))))

  return (
    <div className={`relative group transition-all duration-500 ${isHighlighted ? "scale-105 z-10" : ""}`}>
      {/* Add to Cart Popup - Only show if using internal popup */}
      {!onShowPopup && (
        <AddToCartPopup
          isOpen={showAddToCartPopup}
          onClose={() => setShowAddToCartPopup(false)}
          product={product}
          onAddToCart={handlePopupAddToCart}
          isAddingToCart={isAddingToCart}
          isAddedToCart={isAddedToCart}
        />
      )}

      {/* Search result indicator */}
      {matchesSearch && searchQuery && (
        <div
          className={`absolute -top-3 -right-3 z-30 transition-opacity duration-500 ${isHighlighted ? "opacity-100" : "opacity-0"}`}
        >
          <div className="bg-[#d3ae6e] text-white rounded-full p-1.5 shadow-lg">
            <Search size={16} />
          </div>
        </div>
      )}

      {/* Heritage border container */}
      <div
        className={`absolute -inset-1.5 bg-white rounded-lg z-0 group-hover:shadow-xl transition-all duration-300 
        ${isHighlighted ? "shadow-[0_0_15px_rgba(211,174,110,0.5)] border border-[#d3ae6e]" : ""}`}
      >
        {/* Heritage border SVG */}
        <svg
          className={`absolute inset-0 w-full h-full text-[#d3ae6e] opacity-80 group-hover:opacity-100 transition-opacity duration-300 
            ${isHighlighted ? "opacity-100" : ""}`}
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top border with paisley pattern */}
          <path d="M20 20 H380" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 8" />

          {/* Bottom border with paisley pattern */}
          <path d="M20 380 H380" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 8" />

          {/* Left border with paisley pattern */}
          <path d="M20 20 V380" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 8" />

          {/* Right border with paisley pattern */}
          <path d="M380 20 V380" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 8" />

          {/* Top left corner ornament - Paisley inspired */}
          <path
            d="M20 20 C40 20, 40 40, 20 40 C20 30, 30 20, 20 20 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M20 20 C50 20, 50 50, 20 50 C20 35, 35 20, 20 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1 2"
          />
          <circle cx="30" cy="30" r="3" fill="currentColor" fillOpacity="0.6" />

          {/* Top right corner ornament - Paisley inspired */}
          <path
            d="M380 20 C360 20, 360 40, 380 40 C380 30, 370 20, 380 20 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M380 20 C350 20, 350 50, 380 50 C380 35, 365 20, 380 20 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1 2"
          />
          <circle cx="370" cy="30" r="3" fill="currentColor" fillOpacity="0.6" />

          {/* Bottom left corner ornament - Paisley inspired */}
          <path
            d="M20 380 C40 380, 40 360, 20 360 C20 370, 30 380, 20 380 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M20 380 C50 380, 50 350, 20 350 C20 365, 35 380, 20 380 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1 2"
          />
          <circle cx="30" cy="370" r="3" fill="currentColor" fillOpacity="0.6" />

          {/* Bottom right corner ornament - Paisley inspired */}
          <path
            d="M380 380 C360 380, 360 360, 380 360 C380 370, 370 380, 380 380 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M380 380 C350 380, 350 350, 380 350 C380 365, 365 380, 380 380 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1 2"
          />
          <circle cx="370" cy="370" r="3" fill="currentColor" fillOpacity="0.6" />

          {/* Decorative center elements on each side */}
          {/* Top */}
          <path
            d="M200 20 C205 25, 210 20, 215 25 C220 30, 215 35, 220 40 C215 35, 210 40, 205 35 C200 30, 205 25, 200 20 Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="0.5"
          />

          {/* Bottom */}
          <path
            d="M200 380 C205 375, 210 380, 215 375 C220 370, 215 365, 220 360 C215 365, 210 360, 205 365 C200 370, 205 375, 200 380 Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="0.5"
          />

          {/* Left */}
          <path
            d="M20 200 C25 195, 20 190, 25 185 C30 180, 35 185, 40 180 C35 185, 40 190, 35 195 C30 200, 25 195, 20 200 Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="0.5"
          />

          {/* Right */}
          <path
            d="M380 200 C375 195, 380 190, 375 185 C370 180, 365 185, 360 180 C365 185, 360 190, 365 195 C370 200, 375 195, 380 200 Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </svg>

        {/* Additional decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 overflow-hidden">
          <svg viewBox="0 0 64 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M32 0C24 0 24 16 16 16H48C40 16 40 0 32 0Z"
              fill="#d3ae6e"
              fillOpacity="0.1"
              stroke="#d3ae6e"
              strokeWidth="0.5"
            />
            <path d="M32 4C28 4 28 12 24 12H40C36 12 36 4 32 4Z" fill="none" stroke="#d3ae6e" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 overflow-hidden">
          <svg viewBox="0 0 64 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M32 16C24 16 24 0 16 0H48C40 0 40 16 32 16Z"
              fill="#d3ae6e"
              fillOpacity="0.1"
              stroke="#d3ae6e"
              strokeWidth="0.5"
            />
            <path d="M32 12C28 12 28 4 24 4H40C36 4 36 12 32 12Z" fill="none" stroke="#d3ae6e" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-4 overflow-hidden">
          <svg viewBox="0 0 16 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M0 32C0 24 16 24 16 16V48C16 40 0 40 0 32Z"
              fill="#d3ae6e"
              fillOpacity="0.1"
              stroke="#d3ae6e"
              strokeWidth="0.5"
            />
            <path d="M4 32C4 28 12 28 12 24V40C12 36 4 36 4 32Z" fill="none" stroke="#d3ae6e" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-4 overflow-hidden">
          <svg viewBox="0 0 16 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M16 32C16 24 0 24 0 16V48C0 40 16 40 16 32Z"
              fill="#d3ae6e"
              fillOpacity="0.1"
              stroke="#d3ae6e"
              strokeWidth="0.5"
            />
            <path d="M12 32C12 28 4 28 4 24V40C4 36 12 36 12 32Z" fill="none" stroke="#d3ae6e" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      <div
        className={`rounded-lg overflow-hidden bg-white shadow-sm relative z-10 group-hover:shadow-md transition-all duration-300 
        ${isHighlighted ? "shadow-md" : ""}`}
      >
        {/* Product image with hover effect */}
        <div className="relative">
          <Link to={productUrl} className="block relative aspect-square overflow-hidden">
            <img
              src={primaryImage ? apiClient.getImageUrl(primaryImage.image_path) : "/placeholder.svg"}
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 
                ${isHighlighted ? "scale-105 brightness-105" : ""}`}
              loading="lazy"
            />

            {/* Search highlight overlay */}
            {matchesSearch && searchQuery && isHighlighted && (
              <div className="absolute inset-0 bg-[#d3ae6e] bg-opacity-10 animate-pulse"></div>
            )}
          </Link>

          {/* Vegetarian indicator */}
          <div className="absolute top-3 left-3 z-20">
            {is_vegetarian === 1 && (
              <div className="bg-green-500 rounded-full p-1 w-6 h-6 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Discount badge with premium design */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 z-20">
              <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm flex items-center">
                <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {discount}% OFF
              </div>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-3">
          {/* Category tags */}
          <div className="mb-2 flex flex-wrap gap-1">
            {category && (
              <span
                className={`inline-block text-xs bg-[#f8f5f0] text-[#8a733f] px-3 py-1 rounded-full
                ${matchesSearch && searchQuery && category.name.toLowerCase().includes(searchQuery.toLowerCase()) ? "bg-yellow-100 text-[#8a733f] font-medium" : ""}`}
              >
                {category.name}
              </span>
            )}
            {tags && tags.length > 0 && (
              <span
                className={`inline-block text-xs bg-[#f8f5f0] text-[#8a733f] px-3 py-1 rounded-full
                ${matchesSearch && searchQuery && tags[0].name.toLowerCase().includes(searchQuery.toLowerCase()) ? "bg-yellow-100 text-[#8a733f] font-medium" : ""}`}
              >
                {tags[0].name}
              </span>
            )}
          </div>

          {/* Product name with highlighted search term */}
          <Link to={productUrl}>
            <h3
              className={`text-gray-800 mb-1 text-lg font-medium line-clamp-1 group-hover:text-[#d3ae6e] transition-colors duration-300
              ${matchesSearch && searchQuery && name.toLowerCase().includes(searchQuery.toLowerCase()) ? "text-[#d3ae6e]" : ""}`}
            >
              {matchesSearch && searchQuery && name.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                <span dangerouslySetInnerHTML={{ __html: highlightMatchingText(name, searchQuery) }} />
              ) : (
                name
              )}
            </h3>
          </Link>

          {/* From Small 250g text */}
          <div className="text-sm text-gray-500 mb-2">From Small 250g</div>

          {/* Pricing information */}
          <div className="flex items-center mb-3">
            <span className="text-lg font-semibold text-[#d3ae6e]">
              ₹{formatPrice(salePrice > 0 ? salePrice : price)}
            </span>
            {salePrice > 0 && price > salePrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">₹{formatPrice(price)}</span>
            )}
          </div>

          {/* Size options with premium styling */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="text-xs border border-gray-300 px-3 py-1.5 rounded-full bg-gray-50 group-hover:border-[#d3ae6e] transition-colors duration-300">
              Small 250g
            </div>
            <div className="text-xs border border-gray-300 px-3 py-1.5 rounded-full group-hover:border-[#d3ae6e] transition-colors duration-300">
              Medium 500g
            </div>
            {hasMoreSizes && (
              <div className="text-xs border border-gray-300 px-3 py-1.5 rounded-full group-hover:border-[#d3ae6e] transition-colors duration-300">
                +1 more
              </div>
            )}
          </div>

          {/* Add to cart button with premium design */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`w-full py-2.5 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
              isAddedToCart ? "bg-green-600 text-white" : "bg-[#d3ae6e] hover:bg-[#c19c5d] text-white"
            } ${isHighlighted ? "shadow-md" : ""}`}
          >
            {isAddingToCart ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </span>
            ) : isAddedToCart ? (
              <span className="flex items-center">
                <Check size={16} className="mr-1" />
                Added to Cart
              </span>
            ) : (
              <span className="flex items-center justify-center w-full">
                <ShoppingCart size={16} className="mr-1" />
                Add to Cart
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
