"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { WireframeSectionHeader } from "./wireframe-section-header"
import { UniversalButton } from "../ui/universal-button"

function WireframeProductSlider({ title, bgColor = "#fdf2f1", products = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Show 5 products on large screens, 3 on medium, 2 on small, 1 on mobile
  const itemsPerPage = {
    lg: 5,
    md: 3,
    sm: 2,
    xs: 1,
  }

  const maxIndex = Math.max(0, products.length - itemsPerPage.lg)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <section className="py-4 md:py-6 px-4" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <WireframeSectionHeader title={title} />
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border border-[#78383b] text-[#78383b] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#78383b]/10 transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full border border-[#78383b] text-[#78383b] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#78383b]/10 transition-colors"
              aria-label="Next products"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage.lg)}%)` }}
          >
            {products.map((product, index) => (
              <div key={product.id} className="w-full lg:w-1/5 md:w-1/3 sm:w-1/2 flex-shrink-0 px-3">
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl mb-3 aspect-square bg-white shadow-sm">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-[#78383b] text-white text-xs font-bold px-2 py-1 rounded">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  <h3
                    className="font-bold text-lg mb-1 text-[#78383b]"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#78383b] font-semibold">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-500 text-sm line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <UniversalButton size="sm">Add</UniversalButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <UniversalButton variant="ghost" className="group inline-flex items-center gap-2">
            View All {title}
            <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </UniversalButton>
        </div>
      </div>
    </section>
  )
}

export { WireframeProductSlider }
