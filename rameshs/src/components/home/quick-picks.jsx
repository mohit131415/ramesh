"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useCartStore from "../../store/cartStore"
import { Eye, ShoppingBag, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import HeritageSectionHeader from "../ui/heritage-section-header"
import { UniversalButton } from "../ui/universal-button"
import { useQuickPicks } from "../../hooks/useFeaturedItems"
import useFeaturedStore from "../../store/featuredStore"
import AddToCartPopup from "../cart/add-to-cart-popup"
import apiClient from "../../services/api-client"



// Product Card Component - Improved UI with always visible buttons
const ProductCard = ({ product, onAddToCart, onShowPopup }) => {
  const navigate = useNavigate()

  // Get primary image path
  const getProductImage = (product) => {
    if (!product || !product.images || product.images.length === 0) {
      return "/placeholder.svg"
    }

    // Find primary image or use the first one
    const primaryImage = product.images.find((img) => img.is_primary === 1) || product.images[0]
    return apiClient.getImageUrl(primaryImage.image_path)
  }

  // Get variant details
  const getDefaultVariant = (product) => {
    if (!product || !product.variants || product.variants.length === 0) {
      return { price: 0, sale_price: 0, weight: "0g" }
    }

    // Find the smallest variant (usually the default one)
    return product.variants.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))[0]
  }

  const handleViewDetails = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/product/slug/${product.slug}`)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Instead of directly adding to cart, show the popup
    onShowPopup(product)
  }

  if (!product) return null

  const variant = getDefaultVariant(product)
  const imageSrc = getProductImage(product)
  const price = Number.parseFloat(variant.price)
  const salePrice = Number.parseFloat(variant.sale_price)

  // Calculate discount percentage if there's a sale price
  const discountPercentage = salePrice && salePrice < price ? Math.round(((price - salePrice) / price) * 100) : 0

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gold/10">
      {/* Product image with zoom effect */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Discount badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-sm">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        {/* Product name */}
        <h3 className="font-cinzel text-base font-semibold mb-2 text-center line-clamp-1 text-gray-800">
          {product.name}
        </h3>

        {/* Rating stars */}
        <div className="flex justify-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 text-gold fill-gold" />
            ))}
          </div>
        </div>

        {/* Price display */}
        <div className="flex justify-center items-center gap-2 mb-4">
          {salePrice && salePrice < price ? (
            <>
              <p className="text-gold-dark font-bold text-lg">₹{salePrice}</p>
              <p className="text-gray-400 text-sm line-through">₹{price}</p>
            </>
          ) : (
            <p className="text-gold-dark font-bold text-lg">₹{price}</p>
          )}
        </div>

        {/* Button container - always visible */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleViewDetails}
            className="flex items-center justify-center gap-1 py-2 px-3 bg-white border border-gold text-gold text-xs font-medium rounded-sm hover:bg-gold/5 transition-colors"
          >
            <Eye className="w-3 h-3" />
            VIEW
          </button>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1 py-2 px-3 bg-gold text-white text-xs font-medium rounded-sm hover:bg-gold-dark transition-colors"
          >
            <ShoppingBag className="w-3 h-3" />
            ADD
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuickPicks() {
  const { addItem } = useCartStore()
  const navigate = useNavigate()
  const sliderRef = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(5)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // State for popup
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  // Get quick picks from the store
  const { quickPicks, quickPicksLoading } = useFeaturedStore()

  // Fetch quick picks using TanStack Query
  const { isError } = useQuickPicks()

  // Determine how many slides to show based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(2)
      } else if (window.innerWidth < 768) {
        setSlidesToShow(3)
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(4)
      } else {
        setSlidesToShow(5)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate total slides - improved calculation for 15 products
  const totalSlides = quickPicks.length > 0 ? Math.ceil(quickPicks.length / slidesToShow) : 0

  // Handle showing the popup
  const handleShowPopup = (product) => {
    setSelectedProduct(product)
    setShowPopup(true)
  }

  // Handle adding to cart from popup
  const handlePopupAddToCart = () => {
    setIsAddingToCart(true)

    // Get the product and variant details
    const product = selectedProduct
    const variant = product.variants?.find((v) => v.id === selectedProduct.variants[0]?.id) || product.variants?.[0]

    const cartItem = {
      name: product.name,
      image: product.images?.[0] || "",
      price: variant?.price || product.price,
      tax_rate: product.tax_rate || 5,
      variant: variant
        ? {
            id: variant.id,
            name: variant.variant_name || variant.weight,
            price: variant.price,
          }
        : null,
    }

    // Add the item to the cart using the store method
    handleAddToCart(product.id, variant?.id || 0, 1, cartItem)

    // Simulate a short delay for better UX
    setTimeout(() => {
      setIsAddingToCart(false)
      setIsAddedToCart(true)

      // Reset after a short delay
      setTimeout(() => {
        setIsAddedToCart(false)
        setShowPopup(false)
        setSelectedProduct(null)
      }, 1500)
    }, 800)
  }

  // Update the main handleAddToCart function
  const handleAddToCart = async (productId, variantId, quantity = 1, cartItem = null) => {
    const result = await addItem({
      id: productId,
      quantity: quantity,
      selectedVariant: { id: variantId },
      ...cartItem,
    })
    return result
  }

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      setCurrentSlide(0) // Loop back to the first slide
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else {
      setCurrentSlide(totalSlides - 1) // Loop to the last slide
    }
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide()
    }

    if (touchStart - touchEnd < -75) {
      prevSlide()
    }
  }

  // Render loading state
  if (quickPicksLoading) {
    return (
      <section className="py-20" style={{ backgroundColor: "#FFF9FB" }}>
        <div className="container mx-auto px-4">
          <HeritageSectionHeader
            title="Premium Selection"
            subtitle="Handcrafted delicacies made with traditional recipes"
            preTitle="QUICK PICKS"
          />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        </div>
      </section>
    )
  }

  // Render error state
  if (isError) {
    return (
      <section className="py-20" style={{ backgroundColor: "#FFF9FB" }}>
        <div className="container mx-auto px-4">
          <HeritageSectionHeader
            title="Premium Selection"
            subtitle="Handcrafted delicacies made with traditional recipes"
            preTitle="QUICK PICKS"
          />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load quick picks</p>
              <UniversalButton variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Retry
              </UniversalButton>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 relative" style={{ backgroundColor: "#FFF9FB" }}>
      {/* Simple gold accent line at top */}
      <div className="w-24 h-px bg-gold/60 mx-auto mb-16"></div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <HeritageSectionHeader
          title="Premium Selection"
          subtitle="Handcrafted delicacies made with traditional recipes"
          preTitle="QUICK PICKS"
        />

        {/* Products slider */}
        <div className="mt-16 mb-16 relative">
          {/* Slider navigation buttons */}
          {quickPicks.length > slidesToShow && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/90 border border-gold/30 rounded-full text-gold hover:bg-gold/5 transition-colors shadow-md -ml-5"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/90 border border-gold/30 rounded-full text-gold hover:bg-gold/5 transition-colors shadow-md -mr-5"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Slider container */}
          <div
            className="overflow-hidden"
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              className="flex"
              initial={false}
              animate={{
                x: `-${currentSlide * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Group products into slides */}
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="flex-shrink-0 w-full flex">
                  {quickPicks.slice(slideIndex * slidesToShow, (slideIndex + 1) * slidesToShow).map((item) => (
                    <motion.div
                      key={item.id}
                      className={`flex-shrink-0 px-2`}
                      style={{ width: `${100 / slidesToShow}%` }}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={item} onAddToCart={handleAddToCart} onShowPopup={handleShowPopup} />
                    </motion.div>
                  ))}

                  {/* Fill empty slots with placeholder divs to maintain layout */}
                  {slideIndex === totalSlides - 1 &&
                    Array.from({
                      length:
                        slidesToShow -
                        (quickPicks.length % slidesToShow === 0 ? slidesToShow : quickPicks.length % slidesToShow),
                    }).map((_, i) => (
                      <div
                        key={`placeholder-${i}`}
                        className="flex-shrink-0 px-2"
                        style={{ width: `${100 / slidesToShow}%` }}
                      />
                    ))}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Slider pagination dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? "w-6 bg-gold" : "bg-gold/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Simple gold accent line before button */}
        <div className="w-24 h-px bg-gold/60 mx-auto mb-8"></div>

        {/* View all products button */}
        <div className="text-center">
          <UniversalButton variant="secondary" size="default" icon={<Eye />} onClick={() => navigate("/products")}>
            VIEW ALL PRODUCTS
          </UniversalButton>
        </div>
      </div>

      {/* Add to Cart Popup - Placed at the outer component level */}
      {showPopup && selectedProduct && (
        <AddToCartPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          product={selectedProduct}
          onAddToCart={handlePopupAddToCart}
          isAddingToCart={isAddingToCart}
          isAddedToCart={isAddedToCart}
        />
      )}
    </section>
  )
}
