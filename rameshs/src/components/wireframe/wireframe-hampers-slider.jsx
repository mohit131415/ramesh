"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import WireframeSimpleProductCard from "./wireframe-simple-product-card"
import { WireframeSectionHeader } from "./wireframe-section-header"
import useThemeStore from "../../store/themeStore"

function WireframeHampersSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(5)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const sliderRef = useRef(null)

  // Hampers products data - 10 products with hover images
  const hampersProducts = [
    {
      id: 1,
      title: "Diwali Special Hamper",
      price: "₹2499",
      originalPrice: "₹2999",
      discount: 17,
      weight: "2kg",
      image: "/placeholder.svg?height=300&width=300&text=Diwali+Special+Hamper",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Diwali+Gift+Box",
    },
    {
      id: 2,
      title: "Wedding Gift Hamper",
      price: "₹3499",
      originalPrice: "₹3999",
      discount: 13,
      weight: "3kg",
      image: "/placeholder.svg?height=300&width=300&text=Wedding+Gift+Hamper",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Wedding+Box",
    },
    {
      id: 3,
      title: "Corporate Gift Box",
      price: "₹1999",
      originalPrice: "₹2399",
      discount: 17,
      weight: "1.5kg",
      image: "/placeholder.svg?height=300&width=300&text=Corporate+Gift+Box",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Corporate+Hamper",
    },
    {
      id: 4,
      title: "Festival Celebration Box",
      price: "₹2799",
      originalPrice: "₹3299",
      discount: 15,
      weight: "2.5kg",
      image: "/placeholder.svg?height=300&width=300&text=Festival+Celebration+Box",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Festival+Hamper",
    },
    {
      id: 5,
      title: "Premium Sweets Hamper",
      price: "₹4499",
      originalPrice: "₹5299",
      discount: 15,
      weight: "4kg",
      image: "/placeholder.svg?height=300&width=300&text=Premium+Sweets+Hamper",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Premium+Box",
    },
    {
      id: 6,
      title: "Birthday Special Hamper",
      price: "₹1799",
      originalPrice: "₹2199",
      discount: 18,
      weight: "1.5kg",
      image: "/placeholder.svg?height=300&width=300&text=Birthday+Special+Hamper",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Birthday+Box",
    },
    {
      id: 7,
      title: "Anniversary Gift Box",
      price: "₹2299",
      originalPrice: "₹2699",
      discount: 15,
      weight: "2kg",
      image: "/placeholder.svg?height=300&width=300&text=Anniversary+Gift+Box",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Anniversary+Hamper",
    },
    {
      id: 8,
      title: "Rakhi Special Hamper",
      price: "₹1599",
      originalPrice: "₹1899",
      discount: 16,
      weight: "1kg",
      image: "/placeholder.svg?height=300&width=300&text=Rakhi+Special+Hamper",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Rakhi+Box",
    },
    {
      id: 9,
      title: "Holi Celebration Box",
      price: "₹2199",
      originalPrice: "₹2599",
      discount: 15,
      weight: "2kg",
      image: "/placeholder.svg?height=300&width=300&text=Holi+Celebration+Box",
      hoverImage: "/placeholder.svg?height=300&width=300&text=Holi+Hamper",
    },
    {
      id: 10,
      title: "New Year Gift Hamper",
      price: "₹3299",
      originalPrice: "₹3899",
      discount: 15,
      weight: "3kg",
      image: "/placeholder.svg?height=300&width=300&text=New+Year+Gift+Hamper",
      hoverImage: "/placeholder.svg?height=300&width=300&text=New+Year+Box",
    },
  ]

  // Determine how many slides to show based on screen width - fixed to exactly 2 on mobile and 5 on desktop
  useEffect(() => {
    const handleResize = () => {
      // Mobile: Always show exactly 2 products
      if (window.innerWidth < 768) {
        setSlidesToShow(2)
      }
      // Tablet: Show 3-4 products
      else if (window.innerWidth < 1024) {
        setSlidesToShow(3)
      }
      // Desktop: Always show exactly 5 products
      else {
        setSlidesToShow(5)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate total slides
  const totalSlides = hampersProducts.length > 0 ? Math.ceil(hampersProducts.length / slidesToShow) : 0

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

  // Get the section background color and check if it needs shadow
  const sectionBgColor = useThemeStore((state) => state.getSectionColor(4)) // Section index 4
  const needsShadow = sectionBgColor === "#F7F2EE"

  return (
    <section
      className="pt-12 pb-8 md:pt-16 md:pb-10 lg:pt-20 lg:pb-12"
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
          <WireframeSectionHeader title="Hampers" className="mb-0 text-left" />
        </div>

        {/* Products slider */}
        <div className="relative">
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
                  {hampersProducts.slice(slideIndex * slidesToShow, (slideIndex + 1) * slidesToShow).map((item) => (
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
                    hampersProducts.length % slidesToShow !== 0 &&
                    Array.from({
                      length: slidesToShow - (hampersProducts.length % slidesToShow),
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
          <div className="flex items-center justify-center mt-6 relative">
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
            {hampersProducts.length > slidesToShow && (
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
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View all products link */}
        <div className="text-center mt-6">
          <a
            href="/hampers"
            className="font-['Playfair_Display'] text-base md:text-lg text-[#78383b] hover:text-[#78383b] inline-flex items-center gap-2 group transition-all duration-200 hover:underline"
          >
            <span>View All Hampers</span>
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

export default WireframeHampersSlider
