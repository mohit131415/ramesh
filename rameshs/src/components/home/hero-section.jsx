"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

// Replace the entire featuredProducts array with this updated version that includes both banner images
const featuredProducts = [
  {
    id: 1,
    image: "/banner/banner1.png",
    link: "/products?category=premium",
  },
  {
    id: 2,
    image: "/banner/banner2.png",
    link: "/products?category=featured",
  },
]

// Heritage-style SVG Decorative Components
const HeritageCorner = ({ position, className = "" }) => {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 rotate-90",
    "bottom-left": "bottom-0 left-0 -rotate-90",
    "bottom-right": "bottom-0 right-0 rotate-180",
  }

  return (
    <div className={`absolute ${positionClasses[position]} ${className}`}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Elegant corner frame */}
        <path
          d="M0 0C0 44.1828 35.8172 80 80 80V76C38.0264 76 4 41.9736 4 0H0Z"
          fill="url(#cornerGradient)"
          fillOpacity="0.5"
        />

        {/* Traditional paisley pattern */}
        <path
          d="M12 0C12 8 20 12 28 8C36 4 40 12 36 20C32 28 20 28 12 20"
          stroke="#D4AF37"
          strokeWidth="0.5"
          strokeOpacity="0.8"
          fill="none"
        />

        <path
          d="M0 12C8 12 12 20 8 28C4 36 12 40 20 36C28 32 28 20 20 12"
          stroke="#D4AF37"
          strokeWidth="0.5"
          strokeOpacity="0.8"
          fill="none"
        />

        {/* Decorative dots */}
        <circle cx="28" cy="8" r="1" fill="#D4AF37" fillOpacity="0.9" />
        <circle cx="36" cy="20" r="1" fill="#D4AF37" fillOpacity="0.9" />
        <circle cx="8" cy="28" r="1" fill="#D4AF37" fillOpacity="0.9" />
        <circle cx="20" cy="36" r="1" fill="#D4AF37" fillOpacity="0.9" />

        <defs>
          <linearGradient id="cornerGradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4AF37" />
            <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

const PaisleyDecoration = ({ position, className = "" }) => {
  const positionClasses = {
    "left-top": "top-[15%] left-[4%]",
    "left-bottom": "bottom-[15%] left-[4%]",
    "right-top": "top-[15%] right-[4%]",
    "right-bottom": "bottom-[15%] right-[4%]",
  }

  return (
    <div className={`absolute ${positionClasses[position]} opacity-30 pointer-events-none ${className}`}>
      <svg width="70" height="100" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Traditional paisley pattern */}
        <path
          d="M40 20C50 30 60 30 70 20C80 10 80 30 70 40C60 50 40 50 30 40C20 30 20 10 30 0C40 -10 60 0 60 20C60 40 40 60 20 60C0 60 -10 40 0 30C10 20 30 20 40 30C50 40 50 60 40 70C30 80 10 80 0 70"
          stroke="#D4AF37"
          strokeWidth="0.8"
          fill="none"
        />

        {/* Decorative elements */}
        <path d="M40 80C50 90 50 110 40 120" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="1,3" fill="none" />

        {/* Ornamental dots */}
        <circle cx="40" cy="20" r="1.5" fill="#D4AF37" />
        <circle cx="70" cy="40" r="1.5" fill="#D4AF37" />
        <circle cx="30" cy="40" r="1.5" fill="#D4AF37" />
        <circle cx="20" cy="60" r="1.5" fill="#D4AF37" />
        <circle cx="40" cy="70" r="1.5" fill="#D4AF37" />
      </svg>
    </div>
  )
}

const LotusDecoration = ({ position, size = 100, className = "" }) => {
  const positionClasses = {
    left: "left-[6%] top-1/2 -translate-y-1/2",
    right: "right-[6%] top-1/2 -translate-y-1/2",
  }

  return (
    <div className={`absolute ${positionClasses[position]} opacity-25 pointer-events-none ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lotus flower pattern */}
        <path
          d="M50 10C60 20 70 20 80 10C70 30 70 50 80 70C70 60 60 60 50 70C40 60 30 60 20 70C30 50 30 30 20 10C30 20 40 20 50 10Z"
          stroke="#D4AF37"
          strokeWidth="0.8"
          fill="none"
        />

        <path
          d="M50 20C57 27 64 27 70 20C64 35 64 50 70 65C64 58 57 58 50 65C43 58 36 58 30 65C36 50 36 35 30 20C36 27 43 27 50 20Z"
          stroke="#D4AF37"
          strokeWidth="0.8"
          fill="none"
        />

        <path
          d="M50 30C54 34 58 34 62 30C58 40 58 50 62 60C58 56 54 56 50 60C46 56 42 56 38 60C42 50 42 40 38 30C42 34 46 34 50 30Z"
          stroke="#D4AF37"
          strokeWidth="0.8"
          fill="none"
        />

        {/* Center */}
        <circle cx="50" cy="50" r="5" stroke="#D4AF37" strokeWidth="0.8" fill="none" />
        <circle cx="50" cy="50" r="2" fill="#D4AF37" />

        {/* Decorative dots */}
        <circle cx="50" cy="10" r="1.5" fill="#D4AF37" />
        <circle cx="80" cy="10" r="1.5" fill="#D4AF37" />
        <circle cx="20" cy="10" r="1.5" fill="#D4AF37" />
        <circle cx="80" cy="70" r="1.5" fill="#D4AF37" />
        <circle cx="20" cy="70" r="1.5" fill="#D4AF37" />
        <circle cx="50" cy="70" r="1.5" fill="#D4AF37" />
      </svg>
    </div>
  )
}

const MandalaAccent = ({ position, size = 50, className = "" }) => {
  const positionClasses = {
    "left-top": "top-[10%] left-[12%]",
    "left-bottom": "bottom-[10%] left-[12%]",
    "right-top": "top-[10%] right-[12%]",
    "right-bottom": "bottom-[10%] right-[12%]",
  }

  return (
    <div className={`absolute ${positionClasses[position]} opacity-20 pointer-events-none ${className}`}>
      <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Simple mandala pattern */}
        <circle cx="30" cy="30" r="29" stroke="#D4AF37" strokeWidth="0.8" />

        <path d="M30 1 L30 59 M1 30 L59 30 M8 8 L52 52 M8 52 L52 8" stroke="#D4AF37" strokeWidth="0.5" />

        <path d="M30 10 C40 20, 40 40, 30 50 C20 40, 20 20, 30 10" stroke="#D4AF37" strokeWidth="0.5" fill="none" />

        <path d="M10 30 C20 40, 40 40, 50 30 C40 20, 20 20, 10 30" stroke="#D4AF37" strokeWidth="0.5" fill="none" />

        <circle cx="30" cy="30" r="5" stroke="#D4AF37" strokeWidth="0.5" fill="none" />
        <circle cx="30" cy="30" r="2" fill="#D4AF37" />
      </svg>
    </div>
  )
}

const BorderPattern = ({ className = "" }) => {
  return (
    <div className={`absolute inset-x-0 bottom-0 h-16 opacity-30 pointer-events-none overflow-hidden ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 64"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="borderPattern"
          patternUnits="userSpaceOnUse"
          width="80"
          height="64"
          patternTransform="translate(0,0)"
        >
          <path
            d="M0 32C10 22 20 12 40 12C60 12 70 22 80 32C70 42 60 52 40 52C20 52 10 42 0 32Z"
            stroke="#D4AF37"
            strokeWidth="0.8"
            fill="none"
          />
          <circle cx="40" cy="12" r="1" fill="#D4AF37" />
          <circle cx="40" cy="52" r="1" fill="#D4AF37" />
          <circle cx="0" cy="32" r="1" fill="#D4AF37" />
          <circle cx="80" cy="32" r="1" fill="#D4AF37" />
        </pattern>
        <rect width="100%" height="64" fill="url(#borderPattern)" />
      </svg>
    </div>
  )
}

// Replace the entire HeroSection component with this improved version
export default function HeroSection() {
  const [currentProduct, setCurrentProduct] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = featuredProducts.map((product) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.src = product.image
          img.onload = () => resolve()
          img.crossOrigin = "anonymous"
        })
      })

      await Promise.all(imagePromises)
      setImagesLoaded(true)
    }

    preloadImages()
  }, [])

  // Auto-advance slider
  useEffect(() => {
    if (featuredProducts.length <= 1) return

    const interval = setInterval(() => {
      handleNext()
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const handleNext = () => {
    if (isTransitioning || featuredProducts.length <= 1) return
    setIsTransitioning(true)
    setCurrentProduct((prev) => (prev === featuredProducts.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handlePrev = () => {
    if (isTransitioning || featuredProducts.length <= 1) return
    setIsTransitioning(true)
    setCurrentProduct((prev) => (prev === 0 ? featuredProducts.length - 1 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      handleNext()
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right
      handlePrev()
    }
  }

  // Animation variants
  const imageVariants = {
    initial: { scale: 1.05, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: {
      scale: 1.05,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  return (
    <section
      className="relative h-[60vh] w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading screen */}
      {!imagesLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center">
            <img src="/images/ramesh-logo.svg" alt="Ramesh Sweets Logo" className="w-32 h-32 object-contain mb-6" />
            <div className="relative w-48 h-0.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
            <p className="mt-4 text-gold/80 font-cinzel text-sm tracking-widest">LOADING</p>
          </div>
        </div>
      )}

      {/* Heritage decorative elements */}
      <HeritageCorner position="top-left" className="z-20 opacity-70" />
      <HeritageCorner position="top-right" className="z-20 opacity-70" />
      <HeritageCorner position="bottom-left" className="z-20 opacity-70" />
      <HeritageCorner position="bottom-right" className="z-20 opacity-70" />

      {/* Paisley decorations */}
      <PaisleyDecoration position="left-top" className="hidden md:block" />
      <PaisleyDecoration position="right-bottom" className="hidden md:block" />

      {/* Lotus decorations */}
      <LotusDecoration position="left" size={120} className="hidden lg:block" />
      <LotusDecoration position="right" size={120} className="hidden lg:block" />

      {/* Mandala accents */}
      <MandalaAccent position="right-top" className="hidden md:block" />
      <MandalaAccent position="left-bottom" className="hidden md:block" />

      {/* Border pattern at bottom */}
      <BorderPattern />

      {/* Banner Images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`product-${currentProduct}`}
            variants={imageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0"
          >
            <Link to={featuredProducts[currentProduct].link} className="block w-full h-full">
              <img
                src={featuredProducts[currentProduct].image || "/placeholder.svg"}
                alt={`Banner ${currentProduct + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls - Only show if there are multiple banners */}
      {featuredProducts.length > 1 && (
        <>
          {/* Improved navigation arrows */}
          <div className="absolute inset-0 z-20 flex items-center justify-between pointer-events-none px-4 md:px-8">
            <button
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-gold/30 text-gold hover:bg-white/20 active:bg-white/30 transition-all duration-300 rounded-full shadow-lg pointer-events-auto transform hover:scale-105 active:scale-95"
              onClick={handlePrev}
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-gold/30 text-gold hover:bg-white/20 active:bg-white/30 transition-all duration-300 rounded-full shadow-lg pointer-events-auto transform hover:scale-105 active:scale-95"
              onClick={handleNext}
              aria-label="Next banner"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Improved slide indicators */}
          <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
            {featuredProducts.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setCurrentProduct(index)
                    setTimeout(() => setIsTransitioning(false), 800)
                  }
                }}
                className={`relative h-2.5 transition-all duration-500 ease-out ${
                  currentProduct === index ? "w-10 bg-gold" : "w-2.5 bg-white/50 hover:bg-white/80"
                } rounded-full overflow-hidden shadow-md`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {currentProduct === index && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-200 to-gold"
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 4, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
