"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"
import useThemeStore from "../../store/themeStore"

function WireframeTopCategories() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const scrollContainerRef = useRef(null)

  // Get section color from theme store (index 0 for first section)
  const getSectionColor = useThemeStore((state) => state.getSectionColor)
  const sectionBgColor = getSectionColor(0)

  // Check if this section has the primary color to add shadow
  const sectionColors = useThemeStore((state) => state.sectionColors)
  const hasShadow = sectionBgColor === sectionColors.primary

  const topCategories = [
    {
      name: "Sweets",
      image: "https://hirasweets.com/wp-content/uploads/2019/09/5-sweet-shops-in-surat-that-you-must-check-out-for-indian-wedding-sweets-1.jpg",
    },
    {
      name: "Chocolates",
      image:
        "https://images.squarespace-cdn.com/content/v1/613a355a1825c65d1f0a6a8a/0a4019eb-590a-4fc8-a6f4-ad30e9458a33/mainstream+chocolate.jpg",
    },
    {
      name: "DryFruits",
      image: "https://thumbs.dreamstime.com/b/decorated-dry-fruits-6802511.jpg",
    },
    {
      name: "Hampers",
      image: "/images/Hampers.jpg",
    },
    {
      name: "Beverages",
      image: "https://nawon.com.vn/wp-content/uploads/2024/01/soft-drinks.jpg",
    },
    {
      name: "Cakes",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV8HVNlxXVrnyR8oF8colNZeUCBGQaOdrGOA&s",
    },
    {
      name: "Bakery",
      image: "https://truicbusinessideas.com/wp-content/uploads/2024/08/bread-bakery-large.jpg",
    },
    {
      name: "Snacks",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe_dG2rMg8bFfveDbyKqalIbGQ68RjCCdjRg&s",
    },
    // {
    //   name: "Namkeen",
    //   image: "/placeholder.svg?height=80&width=80",
    // },
    // {
    //   name: "Pickles",
    //   image: "/placeholder.svg?height=80&width=80",
    // },
    // {
    //   name: "Ice Cream",
    //   image: "/placeholder.svg?height=80&width=80",
    // },
    // {
    //   name: "Mithai",
    //   image: "/placeholder.svg?height=80&width=80",
    // },
  ]

  // Split categories into slides of 8
  const categoriesPerSlide = 8
  const totalSlides = Math.ceil(topCategories.length / categoriesPerSlide)
  const hasMultipleSlides = topCategories.length > 8

  const getCurrentSlideCategories = () => {
    if (!hasMultipleSlides) {
      return topCategories
    }
    const startIndex = currentSlide * categoriesPerSlide
    const endIndex = startIndex + categoriesPerSlide
    return topCategories.slice(startIndex, endIndex)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))
  }

  return (
    <section
      className={`py-4 sm:py-6 md:py-10 lg:py-12 relative ${hasShadow ? "shadow-bottom" : ""}`}
      style={{
        backgroundColor: sectionBgColor,
        boxShadow: hasShadow ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Mobile: Horizontal scrollable layout showing all categories */}
        <div className="md:hidden">
          <div
            className="flex gap-6 overflow-x-auto px-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitScrollbar: { display: "none" },
            }}
          >
            {topCategories.map((category, index) => (
              <div key={index} className="relative flex flex-col items-center group cursor-pointer flex-shrink-0">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#d0b271]/30 shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#d0b271]/50 hover:scale-105">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-center text-[#78383b] leading-tight font-cinzel whitespace-nowrap">
                  {category.name}
                </p>
                <div className="h-0.5 w-0 bg-[#d0b271] mx-auto mt-1 group-hover:w-3/4 transition-all duration-300"></div>
              </div>
            ))}
          </div>
          {/* Scroll indicator dots - REMOVED for mobile */}
        </div>

        {/* Desktop: Grid or Slider based on category count */}
        <div className="hidden md:block">
          <div className="relative max-w-7xl mx-auto">
            {/* Left Arrow - Only show if more than 8 categories */}
            {hasMultipleSlides && (
              <button
                onClick={goToPrevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-[#d0b271]/20 flex items-center justify-center transition-all duration-300 hover:bg-[#d0b271]/10 hover:border-[#d0b271]/40 text-[#78383b]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Categories Grid */}
            <div className={hasMultipleSlides ? "px-12" : ""}>
              <div className="grid grid-cols-4 lg:grid-cols-8 gap-6 lg:gap-4 xl:gap-6 transition-all duration-500 ease-in-out">
                {getCurrentSlideCategories().map((category, index) => (
                  <div
                    key={hasMultipleSlides ? `${currentSlide}-${index}` : index}
                    className="relative flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-full overflow-hidden border-2 border-[#d0b271]/30 shadow-md hover:shadow-lg transition-all duration-300 hover:border-[#d0b271]/50 hover:scale-105">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-3 lg:mt-4 text-sm lg:text-base xl:text-lg font-medium text-center text-[#78383b] leading-tight font-cinzel">
                      {category.name}
                    </p>
                    <div className="h-0.5 w-0 bg-[#d0b271] mx-auto mt-1 group-hover:w-3/4 transition-all duration-300"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow - Only show if more than 8 categories */}
            {hasMultipleSlides && (
              <button
                onClick={goToNextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-[#d0b271]/20 flex items-center justify-center transition-all duration-300 hover:bg-[#d0b271]/10 hover:border-[#d0b271]/40 text-[#78383b]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Slide Indicators - Only show if more than 8 categories */}
            {hasMultipleSlides && totalSlides > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index ? "bg-[#d0b271] w-6" : "bg-[#d0b271]/30 hover:bg-[#d0b271]/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WireframeTopCategories
