"use client"

import { useState, useEffect } from "react"

export default function WireframeHeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [animationDirection, setAnimationDirection] = useState("next")

  const slides = [
    {
      id: 1,
      image: "/banner/banner1.png",
      alt: "Banner 1",
    },
    {
      id: 2,
      image: "/banner/banner2.png",
      alt: "Banner 2",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationDirection("next")
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index) => {
    setAnimationDirection(index > currentSlide ? "next" : "prev")
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setAnimationDirection("next")
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setAnimationDirection("prev")
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative w-full aspect-[15/5] overflow-hidden">
      {/* Slider Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-all duration-800 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            } ${
              animationDirection === "next"
                ? index === currentSlide
                  ? "animate-slide-in-right"
                  : "animate-slide-out-left"
                : index === currentSlide
                  ? "animate-slide-in-left"
                  : "animate-slide-out-right"
            }`}
            style={{
              animation:
                index === currentSlide
                  ? animationDirection === "next"
                    ? "slideInRight 0.8s ease-out forwards"
                    : "slideInLeft 0.8s ease-out forwards"
                  : animationDirection === "next"
                    ? "slideOutLeft 0.8s ease-out forwards"
                    : "slideOutRight 0.8s ease-out forwards",
            }}
          >
            {/* Banner Image */}
            <img
              src={slide.image || "/placeholder.svg"}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />

            {/* Overlay with gradient for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {/* <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 md:left-8 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all group z-20 border border-white/30"
        aria-label="Previous slide"
      >
        <span className="text-xl sm:text-2xl md:text-3xl text-white group-hover:scale-110 transition-transform">‹</span>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 md:right-8 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all group z-20 border border-white/30"
        aria-label="Next slide"
      >
        <span className="text-xl sm:text-2xl md:text-3xl text-white group-hover:scale-110 transition-transform">›</span>
      </button> */}

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 border border-white/50 ${
              index === currentSlide ? "bg-white scale-125 shadow-lg" : "bg-white/30 hover:bg-white/50 hover:scale-110"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style>{`
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutLeft {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }
  
  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`}</style>
    </section>
  )
}
