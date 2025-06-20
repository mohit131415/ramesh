"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import WireframeSimpleProductCard from "./wireframe-simple-product-card"
import { WireframeSectionHeader } from "./wireframe-section-header"
import useThemeStore from "../../store/themeStore"

function WireframeSweetsSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(5)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const sliderRef = useRef(null)

  // Sweets products data - 10 products with hover images
  const sweetsProducts = [
    {
      id: 1,
      title: "Royal Gatch",
      price: "₹329",
      originalPrice: "₹379",
      discount: 13,
      weight: "250g",
      image: "/Sweets/GATCHP1.jpg",
      hoverImage: "/Sweets/GATCHP2.jpg",
    },
    {
      id: 2,
      title: "Golden Kesar Peda",
      price: "₹229",
      originalPrice: "₹269",
      discount: 15,
      weight: "250g",
      image: "/Sweets/KESARPEDAP1.jpg",
      hoverImage: "/Sweets/KESARPEDAP2.jpg",
    },
    {
      id: 3,
      title: "Special Pan Laddu",
      price: "₹189",
      originalPrice: "₹219",
      discount: 14,
      weight: "250g",
      image: "/Sweets/PANLADDOP1.jpg",
      hoverImage: "/Sweets/PANLADDOP2.jpg",
    },
    {
      id: 4,
      title: "Deluxe Blueberry Peda",
      price: "₹449",
      originalPrice: "₹499",
      discount: 10,
      weight: "250g",
      image: "/Sweets/BLUEBERRYPEDAP1.jpg",
      hoverImage: "/Sweets/BLUEBERRYPEDAP2.jpg",
    },
    {
      id: 5,
      title: "Traditional Gatch",
      price: "₹279",
      originalPrice: "₹319",
      discount: 12,
      weight: "250g",
      image: "/Sweets/GATCHP2.jpg",
      hoverImage: "/Sweets/GATCHP1.jpg",
    },
    {
      id: 6,
      title: "Blueberry Peda",
      price: "₹399",
      originalPrice: "₹449",
      discount: 15,
      weight: "250g",
      image: "/Sweets/BLUEBERRYPEDAP2.jpg",
      hoverImage: "/Sweets/BLUEBERRYPEDAP1.jpg",
    },
    {
      id: 7,
      title: "Gatch Special",
      price: "₹249",
      originalPrice: "₹299",
      discount: 17,
      weight: "250g",
      image: "/Sweets/GATCHP1.jpg",
      hoverImage: "/Sweets/GATCHP2.jpg",
    },
    {
      id: 8,
      title: "Kesar Peda",
      price: "₹199",
      originalPrice: "₹249",
      discount: 20,
      weight: "250g",
      image: "/Sweets/KESARPEDAP2.jpg",
      hoverImage: "/Sweets/KESARPEDAP1.jpg",
    },
    {
      id: 9,
      title: "Premium Pan Laddu",
      price: "₹299",
      originalPrice: "₹349",
      discount: 14,
      weight: "250g",
      image: "/Sweets/PANLADDOP2.jpg",
      hoverImage: "/Sweets/PANLADDOP1.jpg",
    },
    {
      id: 10,
      title: "Soan Papdi",
      price: "₹179",
      originalPrice: "₹219",
      discount: 18,
      weight: "250g",
      image: "/Sweets/BLUEBERRYPEDAP1.jpg",
      hoverImage: "/Sweets/BLUEBERRYPEDAP2.jpg",
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
  const totalSlides = sweetsProducts.length > 0 ? Math.ceil(sweetsProducts.length / slidesToShow) : 0

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
  const sectionBgColor = useThemeStore((state) => state.getSectionColor(2)) // Section index 2
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
          <WireframeSectionHeader title="Sweets" className="mb-0 text-left" />
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
                  {sweetsProducts.slice(slideIndex * slidesToShow, (slideIndex + 1) * slidesToShow).map((item) => (
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
                    sweetsProducts.length % slidesToShow !== 0 &&
                    Array.from({
                      length: slidesToShow - (sweetsProducts.length % slidesToShow),
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
            {sweetsProducts.length > slidesToShow && (
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
            href="/sweets"
            className="font-['Playfair_Display'] text-base md:text-lg text-[#78383b] hover:text-[#78383b] inline-flex items-center gap-2 group transition-all duration-200 hover:underline"
          >
            <span>View All Sweets</span>
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

export default WireframeSweetsSlider
