"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Updated slider data to match the screenshot content
const sliderData = [
  {
    id: 1,
    title: "GULAB JAMUN SPECIAL",
    subtitle: "CLASSIC FAVORITES",
    description: "Our signature Gulab Jamun, made with khoya and soaked in aromatic sugar syrup with cardamom",
    image: "/images/hero/gulab-jamun-almonds.png",
    link: "/products?category=classic",
    buttonText: "DISCOVER CLASSICS",
  },
  {
    id: 2,
    title: "CELEBRATION COLLECTION",
    subtitle: "FESTIVE DELIGHTS",
    description: "Elevate your special occasions with our handcrafted festive sweets made with premium ingredients",
    image: "/images/hero/assorted-sweets-red-rose.png",
    link: "/products?category=festive",
    buttonText: "VIEW COLLECTION",
  },
  {
    id: 3,
    title: "PREMIUM GIFT BOXES",
    subtitle: "SIGNATURE CREATIONS",
    description: "Exquisite gift boxes featuring our finest selection of traditional and contemporary sweets",
    image: "/images/hero/yellow-sweets-pink-roses.png",
    link: "/products?category=gift-boxes",
    buttonText: "SHOP GIFT BOXES",
  },
  {
    id: 4,
    title: "AUTHENTIC SINDHI SWEETS",
    subtitle: "HERITAGE & TRADITION",
    description: "Experience the rich flavors of traditional Sindhi delicacies crafted with age-old family recipes",
    image: "/images/hero/kaju-katli-box.png",
    link: "/products?category=sindhi-special",
    buttonText: "EXPLORE HERITAGE",
  },
  {
    id: 5,
    title: "SEASONAL DELIGHTS",
    subtitle: "LIMITED EDITION",
    description: "Seasonal specialties crafted with the freshest ingredients for a truly memorable experience",
    image: "/images/hero/gulab-jamun-yellow-roses.png",
    link: "/products?category=seasonal",
    buttonText: "LIMITED EDITIONS",
  },
  {
    id: 6,
    title: "ASSORTED SWEET BOXES",
    subtitle: "CURATED COLLECTIONS",
    description: "Handpicked assortments of our most popular sweets, perfect for gifting or special occasions",
    image: "/images/hero/assorted-sweets-dates.png",
    link: "/products?category=assorted",
    buttonText: "BROWSE ASSORTMENTS",
  },
  {
    id: 7,
    title: "ARTISANAL SWEET BOXES",
    subtitle: "LUXURY COLLECTION",
    description: "Our signature collection of premium sweets arranged in elegant gift boxes perfect for any occasion",
    image: "/images/hero/premium-sweets-box-sunflower.png",
    link: "/products?category=premium",
    buttonText: "LUXURY SELECTION",
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [direction, setDirection] = useState(0)
  const slideTimerRef = useRef(null)

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      setIsTransitioning(true)
      const imagePromises = sliderData.map((slide) => {
        return new Promise((resolve) => {
          const img = new Image()
          img.src = slide.image
          img.onload = () => resolve()
        })
      })

      await Promise.all(imagePromises)
      setImagesLoaded(true)
      setIsTransitioning(false)
    }

    preloadImages()
  }, [])

  // Auto-advance the slider
  useEffect(() => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current)
    }

    slideTimerRef.current = setTimeout(() => {
      if (!isTransitioning) {
        goToNextSlide()
      }
    }, 6000)

    return () => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current)
      }
    }
  }, [currentSlide, isTransitioning])

  // Navigation functions
  const goToNextSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDirection(1)
    setCurrentSlide((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsTransitioning(false), 800)
  }

  const goToPrevSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDirection(-1)
    setCurrentSlide((prev) => (prev === 0 ? sliderData.length - 1 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 800)
  }

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "5%" : "-5%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "tween", duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.7 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? "-5%" : "5%",
      opacity: 0,
      transition: {
        x: { type: "tween", duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.7 },
      },
    }),
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + custom * 0.1,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }
    } ,
  }

  return (
    <section
      className="relative h-[50vh] w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Product showcase"
    >
      {/* Loading screen */}
      {!imagesLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center">
            <img src="/images/ramesh-logo.svg" alt="Ramesh Sweets Logo" className="w-32 h-32 object-contain mb-6" />
            <div className="relative w-48 h-0.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>
            <p className="mt-4 text-gold/80 font-cinzel text-sm tracking-widest">LOADING EXPERIENCE</p>
          </div>
        </div>
      )}

      {/* Background Images */}
      <div className="absolute inset-0" aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`slide-${currentSlide}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {/* Image with overlay */}
            <div className="relative w-full h-full">
              <img
                src={sliderData[currentSlide].image || "/placeholder.svg"}
                alt=""
                className="w-full h-full object-cover object-center"
              />

              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="container mx-auto px-8">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={`content-${currentSlide}`} initial="hidden" animate="visible" exit="exit">
                {/* Subtitle */}
                <motion.div variants={textVariants} custom={0} className="mb-4">
                  <p className="font-cinzel text-gold tracking-[0.25em] text-sm">{sliderData[currentSlide].subtitle}</p>
                </motion.div>

                {/* Title */}
                <motion.div variants={textVariants} custom={1} className="mb-6">
                  <h1 className="font-cinzel text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                    {sliderData[currentSlide].title}
                  </h1>
                </motion.div>

                {/* Divider */}
                <motion.div variants={textVariants} custom={2} className="w-24 h-0.5 bg-gold mb-6"></motion.div>

                {/* Description */}
                <motion.div variants={textVariants} custom={3} className="mb-10">
                  <p className="font-eb-garamond text-xl text-white/90 leading-relaxed max-w-xl">
                    {sliderData[currentSlide].description}
                  </p>
                </motion.div>

                {/* Button */}
                <motion.div variants={textVariants} custom={4}>
                  <a
                    href={sliderData[currentSlide].link}
                    className="inline-block px-8 py-3 bg-gold text-black font-cinzel font-medium tracking-wider text-sm hover:bg-gold/90 transition-colors duration-300"
                  >
                    {sliderData[currentSlide].buttonText}
                  </a>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Styled to match screenshot */}
      <div className="absolute bottom-12 left-8 z-20 flex space-x-6">
        <button
          className="w-12 h-12 flex items-center justify-center border border-gold/50 text-gold hover:bg-gold/10 transition-colors duration-300"
          onClick={goToPrevSlide}
          aria-label="Previous slide"
          disabled={isTransitioning}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="w-12 h-12 flex items-center justify-center border border-gold/50 text-gold hover:bg-gold/10 transition-colors duration-300"
          onClick={goToNextSlide}
          aria-label="Next slide"
          disabled={isTransitioning}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slide Number - Styled to match screenshot */}
      <div className="absolute top-12 right-8 z-20">
        <p className="font-cinzel text-gold">
          <span className="text-2xl">{currentSlide + 1}</span>
          <span className="mx-1 text-gold/50">/</span>
          <span className="text-sm text-gold/70">{sliderData.length}</span>
        </p>
      </div>
    </section>
  )
}
