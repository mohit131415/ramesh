"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import WireframeSimpleProductCard from "./wireframe-simple-product-card"
import { WireframeSectionHeader } from "./wireframe-section-header"
import useThemeStore from "../../store/themeStore"

function WireframeDryFruitsSlider() {
  // Get the section background color and check if it needs shadow
  const sectionBgColor = useThemeStore((state) => state.getSectionColor(3)) // Section index 3
  const needsShadow = sectionBgColor === "#F7F2EE"

  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(5)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const sliderRef = useRef(null)

  // Dry Fruits products data - 10 products with hover images
  const dryFruitsProducts = [
    {
      id: 1,
      title: "Premium Almonds",
      price: "₹799",
      originalPrice: "₹899",
      discount: 11,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Premium+Almonds",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Almonds+Pack",
    },
    {
      id: 2,
      title: "Cashew Nuts",
      price: "₹1299",
      originalPrice: "₹1499",
      discount: 13,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Cashew+Nuts",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Cashew+Pack",
    },
    {
      id: 3,
      title: "Walnuts",
      price: "₹1199",
      originalPrice: "₹1399",
      discount: 14,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Walnuts",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Walnut+Pack",
    },
    {
      id: 4,
      title: "Pistachios",
      price: "₹1899",
      originalPrice: "₹2199",
      discount: 14,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Pistachios",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Pistachio+Pack",
    },
    {
      id: 5,
      title: "Dates (Khajoor)",
      price: "₹449",
      originalPrice: "₹549",
      discount: 18,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Dates+Khajoor",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Dates+Pack",
    },
    {
      id: 6,
      title: "Raisins (Kishmish)",
      price: "₹299",
      originalPrice: "₹349",
      discount: 14,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Raisins+Kishmish",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Raisins+Pack",
    },
    {
      id: 7,
      title: "Dried Figs (Anjeer)",
      price: "₹899",
      originalPrice: "₹1099",
      discount: 18,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Dried+Figs+Anjeer",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Figs+Pack",
    },
    {
      id: 8,
      title: "Mixed Dry Fruits",
      price: "₹1599",
      originalPrice: "₹1899",
      discount: 16,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Mixed+Dry+Fruits",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Mixed+Pack",
    },
    {
      id: 9,
      title: "Apricots (Khumani)",
      price: "₹649",
      originalPrice: "₹799",
      discount: 19,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Apricots+Khumani",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Apricots+Pack",
    },
    {
      id: 10,
      title: "Pine Nuts (Chilgoza)",
      price: "₹2499",
      originalPrice: "₹2899",
      discount: 14,
      weight: "500g",
      image: "/placeholder.svg?height=300&width=300&text=Pine+Nuts+Chilgoza",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Pine+Nuts+Pack",
    },
  ]

  // Determine how many slides to show based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(2)
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(3)
      } else {
        setSlidesToShow(5)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate total slides
  const totalSlides = dryFruitsProducts.length > 0 ? Math.ceil(dryFruitsProducts.length / slidesToShow) : 0

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      setCurrentSlide(0)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else {
      setCurrentSlide(totalSlides - 1)
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

  return (
    <section
      className="pt-12 pb-6 md:pt-16 lg:pt-20 md:pb-8"
      style={{
        backgroundColor: sectionBgColor,
        ...(needsShadow && {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }),
      }}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Section Header - Explicitly Left-Aligned */}
        <div className="flex justify-start mb-1 md:mb-2">
          <WireframeSectionHeader title="Dry Fruits" className="mb-0 text-left" />
        </div>

        {/* Products slider */}
        <div className="mb-8 md:mb-10 relative">
          {/* Slider container */}
          <div
            className="overflow-hidden"
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {/* Group products into slides */}
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="flex-shrink-0 w-full flex">
                  {dryFruitsProducts.slice(slideIndex * slidesToShow, (slideIndex + 1) * slidesToShow).map((item) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 px-2 md:px-3"
                      style={{ width: `${100 / slidesToShow}%` }}
                    >
                      <WireframeSimpleProductCard
                        image={item.image}
                        hoverImage={item.hoverImage}
                        title={item.title}
                        price={item.price}
                        originalPrice={item.originalPrice}
                        discount={item.discount}
                        weight={item.weight}
                        onAddToCart={() => console.log(`Added ${item.title} to cart`)}
                        className="h-full"
                        cardBgColor={sectionBgColor}
                      />
                    </div>
                  ))}

                  {/* Fill empty slots with placeholder divs to maintain layout */}
                  {slideIndex === totalSlides - 1 &&
                    dryFruitsProducts.length % slidesToShow !== 0 &&
                    Array.from({
                      length: slidesToShow - (dryFruitsProducts.length % slidesToShow),
                    }).map((_, i) => (
                      <div
                        key={`placeholder-${i}`}
                        className="flex-shrink-0 px-2 md:px-3"
                        style={{ width: `${100 / slidesToShow}%` }}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row with Pagination Dots (Center) and Navigation Arrows (Right) */}
          <div className="flex items-center justify-center mt-8 relative">
            {/* Pagination Dots - Center */}
            {totalSlides > 1 && (
              <div className="flex space-x-1.5">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index ? "w-6 bg-[#78383b]" : "w-2 bg-[#78383b]/30 hover:bg-[#78383b]/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Navigation Arrows - Right Side (Absolute positioned) */}
            {dryFruitsProducts.length > slidesToShow && (
              <div className="flex items-center gap-3 absolute right-0 top-2">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 flex items-center justify-center bg-transparent border border-[#78383b]/30 rounded-full text-[#78383b] hover:bg-[#78383b]/5 hover:border-[#78383b]/50 transition-all duration-200"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 flex items-center justify-center bg-transparent border border-[#78383b]/30 rounded-full text-[#78383b] hover:bg-[#78383b]/5 hover:border-[#78383b]/50 transition-all duration-200"
                  aria-label="Next slide"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View all products link */}
        <div className="text-center">
          <a
            href="/dry-fruits"
            className="font-['Playfair_Display'] text-base md:text-lg text-[#78383b] hover:text-[#78383b] inline-flex items-center gap-2 group transition-all duration-200 hover:underline"
          >
            <span>View All Dry Fruits</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

export default WireframeDryFruitsSlider
