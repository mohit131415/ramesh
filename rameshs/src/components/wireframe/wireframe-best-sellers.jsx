"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { UniversalButton } from "../../components/ui/universal-button"
import { WireframeSectionHeader } from "./wireframe-section-header"
import WireframeProductCard from "./wireframe-product-card"

function WireframeBestSellers() {
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallMobile, setIsSmallMobile] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const sliderRef = useRef(null)
  const autoSlideTimerRef = useRef(null)
  const progressTimerRef = useRef(null)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsSmallMobile(window.innerWidth < 480)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const featuredProducts = [
    {
      title: "Premium Kaju Katli",
      subtitle: "Our signature cashew fudge made with pure ghee and finest cashews.",
      price: "₹399",
      originalPrice: "₹449",
      discount: 15,
      image: "/Sweets/BLUEBERRYPEDAP1.jpg",
      badge: "#1 BESTSELLER",
    },
    {
      title: "Royal Gulab Jamun",
      subtitle: "Traditional rose flavored sweet balls in aromatic sugar syrup.",
      price: "₹249",
      originalPrice: "₹299",
      discount: 17,
      image: "/Sweets/GATCHP1.jpg",
      badge: "#2 BESTSELLER",
    },
    {
      title: "Classic Rasgulla",
      subtitle: "Soft spongy sweet in delicate sugar syrup, a Bengali delicacy.",
      price: "₹199",
      originalPrice: "₹249",
      discount: 20,
      image: "/Sweets/KESARPEDAP1.jpg",
      badge: "#3 BESTSELLER",
    },
    {
      title: "Motichoor Laddu",
      subtitle: "Fine gram flour sweet balls with aromatic cardamom flavor.",
      price: "₹299",
      originalPrice: "₹349",
      discount: 14,
      image: "/Sweets/PANLADDOP1.jpg",
      badge: "#4 BESTSELLER",
    },
  ]

  const bestSellerItems = [
    {
      title: "Kaju Katli",
      subtitle: "Premium Cashew Fudge - 250gm",
      price: "Rs. 399.00",
      originalPrice: "Rs. 449.00",
      discount: 15,
      image: "/Sweets/BLUEBERRYPEDAP1.jpg",
      hoverImage: "/Sweets/BLUEBERRYPEDAP2.jpg",
    },
    {
      title: "Gulab Jamun",
      subtitle: "Traditional Rose Flavored Sweet - 250gm",
      price: "Rs. 249.00",
      image: "/Sweets/GATCHP1.jpg",
      hoverImage: "/Sweets/GATCHP2.jpg",
    },
    {
      title: "Rasgulla",
      subtitle: "Soft Spongy Sweet in Sugar Syrup - 250gm",
      price: "Rs. 199.00",
      originalPrice: "Rs. 249.00",
      discount: 20,
      image: "/Sweets/KESARPEDAP1.jpg",
      hoverImage: "/Sweets/KESARPEDAP2.jpg",
    },
    {
      title: "Motichoor Laddu",
      subtitle: "Fine Gram Flour Sweet Balls - 250gm",
      price: "Rs. 299.00",
      image: "/Sweets/PANLADDOP1.jpg",
      hoverImage: "/Sweets/PANLADDOP2.jpg",
    },
    {
      title: "Soan Papdi",
      subtitle: "Flaky Sweet Confection - 250gm",
      price: "Rs. 179.00",
      originalPrice: "Rs. 219.00",
      discount: 18,
      image: "/Sweets/BLUEBERRYPEDAP1.jpg",
      hoverImage: "/Sweets/BLUEBERRYPEDAP2.jpg",
    },
  ]

  // Setup touch events for mobile swipe
  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX
    }

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX
      handleSwipe()
    }

    const handleSwipe = () => {
      const swipeThreshold = 50
      if (touchStartX - touchEndX > swipeThreshold) {
        // Swipe left
        nextSlide()
      } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swipe right
        prevSlide()
      }
    }

    slider.addEventListener("touchstart", handleTouchStart, { passive: true })
    slider.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      slider.removeEventListener("touchstart", handleTouchStart)
      slider.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  // Auto-slide functionality
  useEffect(() => {
    // Clear any existing timers
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
    if (autoSlideTimerRef.current) clearTimeout(autoSlideTimerRef.current)

    if (isPaused) return

    const interval = 50 // Update every 50ms for smooth progress
    const duration = 5000 // 5 seconds total
    const increment = (interval / duration) * 100

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Instead of immediately changing slide, schedule it
          autoSlideTimerRef.current = setTimeout(() => {
            handleSlideChange((currentSlide + 1) % featuredProducts.length)
          }, 50)
          return 100 // Keep at 100% until the slide changes
        }
        return prev + increment
      })
    }, interval)

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      if (autoSlideTimerRef.current) clearTimeout(autoSlideTimerRef.current)
    }
  }, [currentSlide, isPaused])

  const handleSlideChange = (newSlide) => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setProgress(0) // Reset progress when manually changing slides

    // If it's a function, call it with current slide
    const nextSlide = typeof newSlide === "function" ? newSlide(currentSlide) : newSlide

    setTimeout(() => {
      setCurrentSlide(nextSlide)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 300)
  }

  const nextSlide = () => {
    handleSlideChange((currentSlide + 1) % featuredProducts.length)
  }

  const prevSlide = () => {
    handleSlideChange((currentSlide - 1 + featuredProducts.length) % featuredProducts.length)
  }

  const handleAddToCart = (productTitle) => {
    console.log(`Added ${productTitle} to cart`)
  }

  const currentProduct = featuredProducts[currentSlide]

  // Display only 4 products on mobile
  const displayedProducts = isMobile ? bestSellerItems.slice(0, 4) : bestSellerItems

  return (
    <section className="py-12 bg-[#fdf2f1]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <WireframeSectionHeader title="Best Seller" />

        {/* Featured Product Slider */}
        <div className="max-w-4xl lg:max-w-3xl mx-auto mb-16">
          <div
            ref={sliderRef}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 relative overflow-hidden h-48 sm:h-56 md:h-72 lg:h-80"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 text-[#78383b]" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 md:p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-[#78383b]" />
            </button>

            {/* Slide Indicator */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
              {currentSlide + 1}/{featuredProducts.length}
            </div>

            <div
              className={`flex flex-row h-full transition-all duration-500 ease-in-out ${
                isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
              }`}
            >
              {/* Product Image - Left side with 1:1 aspect ratio */}
              <div
                className="h-full flex items-center justify-center bg-gradient-to-br from-[#78383b]/10 to-[#78383b]/5 relative p-2 md:p-4"
                style={{ width: "min(50%, 320px)" }}
              >
                <div className="aspect-square w-full max-w-full max-h-full relative">
                  <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 md:px-2 rounded-full font-bold font-cinzel z-10">
                    {currentProduct.badge}
                  </div>
                  <img
                    src={currentProduct.image || "/placeholder.svg"}
                    alt={currentProduct.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out rounded-lg"
                  />
                </div>
              </div>

              {/* Product Details - Right side */}
              <div className="flex-1 h-full p-2 sm:p-3 md:p-6 flex flex-col justify-center">
                <div className="text-left">
                  <h3 className="text-sm sm:text-base md:text-2xl lg:text-xl font-bold mb-1 md:mb-2 text-[#78383b] font-cinzel line-clamp-1 md:line-clamp-none">
                    {currentProduct.title}
                  </h3>
                  <p className="text-xs md:text-base lg:text-sm mb-1 md:mb-3 text-[#78383b]/80 leading-relaxed line-clamp-2 md:line-clamp-none">
                    {currentProduct.subtitle}
                  </p>
                  <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                    <div className="text-sm sm:text-base md:text-xl lg:text-lg font-bold text-[#78383b] font-cinzel">
                      {currentProduct.price}
                    </div>
                    <div className="text-xs md:text-sm lg:text-xs text-[#78383b]/60 line-through font-cinzel">
                      {currentProduct.originalPrice}
                    </div>
                    <div className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-medium font-cinzel">
                      {currentProduct.discount}% OFF
                    </div>
                  </div>
                  <div className={`flex ${isSmallMobile ? "flex-col" : "flex-row"} gap-1 md:gap-2 justify-center mt-10`}>
                    <UniversalButton
                      variant="primary"
                      size="sm"
                      className="!h-6 !px-2 !py-0 !text-xs md:!h-12 md:!px-4 md:!py-2 md:!text-sm lg:!h-10 lg:!px-3 lg:!py-1.5 lg:!text-xs"
                      onClick={() => handleAddToCart(currentProduct.title)}
                    >
                      Add to Cart
                    </UniversalButton>
                    <UniversalButton
                      variant="secondary"
                      size="sm"
                      className="!h-6 !px-2 !py-0 !text-xs md:!h-12 md:!px-4 md:!py-2 md:!text-sm lg:!h-10 lg:!px-3 lg:!py-1.5 lg:!text-xs"
                    >
                      View Details
                    </UniversalButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Sellers Grid - 5 Products on desktop, 4 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 max-w-6xl mx-auto">
          {displayedProducts.map((item, index) => (
            <WireframeProductCard
              key={index}
              image={item.image}
              hoverImage={item.hoverImage}
              title={item.title}
              subtitle={item.subtitle}
              price={item.price}
              originalPrice={item.originalPrice}
              discount={item.discount}
              onAddToCart={() => handleAddToCart(item.title)}
              className="w-full"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default WireframeBestSellers
