"use client"

import { WireframeSectionHeader } from "./wireframe-section-header"
import useThemeStore from "../../store/themeStore"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

function WireframeTestimonialsSection() {
  // Get section color from theme store (section index 6)
  const sectionColor = useThemeStore((state) => state.getSectionColor(6))
  const isPrimaryColor = sectionColor === useThemeStore((state) => state.sectionColors.primary)

  // Shadow style for primary color sections
  const shadowStyle = isPrimaryColor
    ? {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }
    : {}

  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Delhi",
      rating: 5,
      date: "November 2024",
      text: "Ordered kaju katli for my daughter's wedding. The taste was exactly like my mother used to make. Guests couldn't stop praising the quality.",
      image: "/placeholder.svg?height=60&width=60&text=RK",
      verified: true,
      productOrdered: "Kaju Katli - 2kg",
    },
    {
      name: "Priya Sharma",
      location: "Bangalore",
      rating: 5,
      date: "December 2024",
      text: "Amazing gulab jamuns! Soft, perfectly sweet, and delivered fresh. My family loved them. Will definitely order again for festivals.",
      image: "/placeholder.svg?height=60&width=60&text=PS",
      verified: true,
      productOrdered: "Gulab Jamun Box",
    },
    {
      name: "Amit Patel",
      location: "Ahmedabad",
      rating: 5,
      date: "October 2024",
      text: "Best rasgulla I've had outside Bengal! The texture was perfect and the sweetness was just right. Highly recommend for sweet lovers.",
      image: "/placeholder.svg?height=60&width=60&text=AP",
      verified: true,
      productOrdered: "Bengali Rasgulla",
    },
  ]

  // Testimonial slider state for mobile
  const [testimonialCurrentSlide, setTestimonialCurrentSlide] = useState(0)

  const nextTestimonial = () => {
    if (testimonialCurrentSlide < testimonials.length - 1) {
      setTestimonialCurrentSlide(testimonialCurrentSlide + 1)
    } else {
      setTestimonialCurrentSlide(0)
    }
  }

  const prevTestimonial = () => {
    if (testimonialCurrentSlide > 0) {
      setTestimonialCurrentSlide(testimonialCurrentSlide - 1)
    } else {
      setTestimonialCurrentSlide(testimonials.length - 1)
    }
  }

  const trustMetrics = [
    { icon: "⭐", value: "4.9/5", label: "Customer Rating", subtext: "Based on 12,000+ reviews" },
    { icon: "📦", value: "50K+", label: "Orders Delivered", subtext: "In the last 12 months" },
    { icon: "🏆", value: "25+", label: "Years Experience", subtext: "Traditional sweet making" },
    { icon: "🚚", value: "99.8%", label: "On-Time Delivery", subtext: "Across India" },
  ]

  return (
    <section className="py-8 md:py-12 lg:py-16" style={{ backgroundColor: sectionColor, ...shadowStyle }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header - Explicitly Left-Aligned */}
        <div className="flex justify-start mb-1 md:mb-2">
          <WireframeSectionHeader title="Customer Stories" className="mb-0 text-left" />
        </div>

        {/* Trust Metrics - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12 lg:mb-16">
          {trustMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 text-center shadow-sm border border-[#78383b]/10 hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-xl sm:text-2xl md:text-3xl mb-2 md:mb-3">{metric.icon}</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#78383b] mb-1">{metric.value}</div>
              <div className="text-xs sm:text-sm font-medium text-[#78383b] mb-1">{metric.label}</div>
              <div className="text-xs text-[#78383b]/60 leading-tight">{metric.subtext}</div>
            </div>
          ))}
        </div>

        {/* Customer Reviews Slider - Mobile Responsive */}
        <div className="mb-8 md:mb-12 lg:mb-16">
          {/* Desktop: Show all 3 testimonials in grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-[#78383b]/10 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#78383b]/10 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-[#78383b] font-['Playfair_Display'] text-sm md:text-base truncate">
                        {testimonial.name}
                      </h4>
                      {testimonial.verified && (
                        <span className="text-green-500 text-xs md:text-sm flex-shrink-0">✓</span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-[#78383b]/60">{testimonial.location}</p>
                  </div>
                </div>

                <div className="flex text-yellow-400 text-sm mb-2 md:mb-3">{"★".repeat(testimonial.rating)}</div>

                <p className="text-xs md:text-sm leading-relaxed text-[#78383b] mb-3 md:mb-4">"{testimonial.text}"</p>

                <div className="flex items-center justify-between text-xs text-[#78383b]/60">
                  <span>{testimonial.date}</span>
                  <span className="bg-[#78383b]/5 px-2 py-1 rounded text-xs truncate max-w-[120px]">
                    {testimonial.productOrdered}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Show testimonials in slider */}
          <div className="md:hidden">
            <div className="relative">
              {/* Slider container */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${testimonialCurrentSlide * 100}%)`,
                  }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="flex-shrink-0 w-full px-2">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#78383b]/10">
                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full border-2 border-[#78383b]/10 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-[#78383b] font-['Playfair_Display'] text-sm truncate">
                                {testimonial.name}
                              </h4>
                              {testimonial.verified && <span className="text-green-500 text-xs flex-shrink-0">✓</span>}
                            </div>
                            <p className="text-xs text-[#78383b]/60">{testimonial.location}</p>
                          </div>
                        </div>

                        <div className="flex text-yellow-400 text-sm mb-2">{"★".repeat(testimonial.rating)}</div>

                        <p className="text-xs leading-relaxed text-[#78383b] mb-3">"{testimonial.text}"</p>

                        <div className="flex items-center justify-between text-xs text-[#78383b]/60">
                          <span>{testimonial.date}</span>
                          <span className="bg-[#78383b]/5 px-2 py-1 rounded text-xs truncate max-w-[120px]">
                            {testimonial.productOrdered}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row with Pagination Dots (Center) and Navigation Arrows (Right) */}
              <div className="flex items-center justify-center mt-6 relative">
                {/* Pagination Dots - Center */}
                <div className="flex space-x-1.5">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setTestimonialCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        testimonialCurrentSlide === index
                          ? "w-6 bg-[#78383b]"
                          : "w-2 bg-[#78383b]/30 hover:bg-[#78383b]/50"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation Arrows - Right Side (Absolute positioned) */}
                <div className="flex items-center gap-3 absolute right-0 top-2">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border border-[#78383b]/30 rounded-full text-[#78383b] hover:bg-[#78383b]/5 hover:border-[#78383b]/50 transition-all duration-200"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 flex items-center justify-center bg-transparent border border-[#78383b]/30 rounded-full text-[#78383b] hover:bg-[#78383b]/5 hover:border-[#78383b]/50 transition-all duration-200"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View All Reviews Button */}
        <div className="text-center">
          <a
            href="/reviews"
            className="font-['Playfair_Display'] text-base md:text-lg text-[#78383b] hover:text-[#78383b] inline-flex items-center gap-2 group transition-all duration-200 hover:underline"
          >
            <span>View All Reviews</span>
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

export default WireframeTestimonialsSection
