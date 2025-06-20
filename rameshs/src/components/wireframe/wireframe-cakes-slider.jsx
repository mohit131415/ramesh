"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import WireframeSimpleProductCard from "./wireframe-simple-product-card"
import { WireframeSectionHeader } from "./wireframe-section-header"
import useThemeStore from "../../store/themeStore"

function WireframeCakesSlider() {
  // Get the section background color and check if it needs shadow
  const sectionBgColor = useThemeStore((state) => state.getSectionColor(5)) // Section index 5
  const needsShadow = sectionBgColor === "#F7F2EE"

  const [currentSlide, setCurrentSlide] = useState(0)
  const [slidesToShow, setSlidesToShow] = useState(5)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const sliderRef = useRef(null)

  // Cakes products data - 10 products with hover images
  const cakesProducts = [
    {
      id: 1,
      title: "Chocolate Truffle Cake",
      price: "₹899",
      originalPrice: "₹1099",
      discount: 18,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      title: "Vanilla Sponge Cake",
      price: "₹649",
      originalPrice: "₹799",
      discount: 19,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      title: "Red Velvet Cake",
      price: "₹1199",
      originalPrice: "₹1399",
      discount: 14,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop",
    },
    {
      id: 4,
      title: "Black Forest Cake",
      price: "₹1049",
      originalPrice: "₹1249",
      discount: 16,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
    },
    {
      id: 5,
      title: "Butterscotch Cake",
      price: "₹749",
      originalPrice: "₹899",
      discount: 17,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
    },
    {
      id: 6,
      title: "Strawberry Cake",
      price: "₹849",
      originalPrice: "₹999",
      discount: 15,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    },
    {
      id: 7,
      title: "Pineapple Cake",
      price: "₹699",
      originalPrice: "₹849",
      discount: 18,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
    },
    {
      id: 8,
      title: "Mango Cake",
      price: "₹799",
      originalPrice: "₹949",
      discount: 16,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
    },
    {
      id: 9,
      title: "Coffee Cake",
      price: "₹949",
      originalPrice: "₹1149",
      discount: 17,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=400&fit=crop",
    },
    {
      id: 10,
      title: "Fruit Cake",
      price: "₹1149",
      originalPrice: "₹1349",
      discount: 15,
      weight: "1kg",
      image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
      hoverImage: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop",
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
  const totalSlides = cakesProducts.length > 0 ? Math.ceil(cakesProducts.length / slidesToShow) : 0

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
          <WireframeSectionHeader title="Cakes" className="mb-0 text-left" />
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
                  {cakesProducts.slice(slideIndex * slidesToShow, (slideIndex + 1) * slidesToShow).map((item) => (
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
                    cakesProducts.length % slidesToShow !== 0 &&
                    Array.from({
                      length: slidesToShow - (cakesProducts.length % slidesToShow),
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
            {cakesProducts.length > slidesToShow && (
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
            href="/cakes"
            className="font-['Playfair_Display'] text-base md:text-lg text-[#78383b] hover:text-[#78383b] inline-flex items-center gap-2 group transition-all duration-200 hover:underline"
          >
            <span>View All Cakes</span>
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

export default WireframeCakesSlider
