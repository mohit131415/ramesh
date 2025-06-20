"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Loader2,
  Award,
  Gift,
  Star,
  Clock,
  Heart,
  Sparkles,
  Cake,
  Utensils,
  Gem,
  PartyPopper,
  Leaf,
  Zap,
  Flame,
  Coffee,
  Droplet,
  MapPin,
} from "lucide-react"
import { useCategories } from "../../hooks/useCategories"
import apiClient from "../../services/api-client"

// Heritage-style SVG Decorative Components
const HeritageBorder = ({ side, className = "" }) => {
  const isVertical = side === "left" || side === "right"
  const positionClasses = {
    top: "top-0 left-0 w-full h-[2px]",
    bottom: "bottom-0 left-0 w-full h-[2px]",
    left: "top-0 left-0 h-full w-[2px]",
    right: "top-0 right-0 h-full w-[2px]",
  }

  return (
    <div className={`absolute ${positionClasses[side]} ${className}`}>
      <div
        className={`w-full h-full bg-gradient-to-${isVertical ? "b" : "r"} from-transparent via-gold/50 to-transparent`}
      ></div>
    </div>
  )
}

const HeritageCorner = ({ position, className = "" }) => {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 rotate-90",
    "bottom-left": "bottom-0 left-0 -rotate-90",
    "bottom-right": "bottom-0 right-0 rotate-180",
  }

  return (
    <div className={`absolute ${positionClasses[position]} ${className}`}>
      <svg width="70" height="70" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const RangoliBorder = ({ className = "" }) => {
  return (
    <div className={`absolute inset-0 z-0 opacity-10 pointer-events-none ${className}`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern id="rangoliPattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
          <rect width="40" height="40" fill="none" />
          <path d="M20 0 L20 40 M0 20 L40 20" stroke="#D4AF37" strokeWidth="0.5" />
          <path d="M10 10 L30 30 M30 10 L10 30" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="1,3" />
          <circle cx="20" cy="20" r="1" fill="#D4AF37" opacity="0.8" />
          <circle cx="10" cy="10" r="0.5" fill="#D4AF37" opacity="0.6" />
          <circle cx="30" cy="10" r="0.5" fill="#D4AF37" opacity="0.6" />
          <circle cx="10" cy="30" r="0.5" fill="#D4AF37" opacity="0.6" />
          <circle cx="30" cy="30" r="0.5" fill="#D4AF37" opacity="0.6" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#rangoliPattern)" />
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

const CategoryCard = ({ category, index, isActive }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.1,
      },
    },
  }

  // Function to properly format the image URL using API client
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(category.name)}`
    }
    return apiClient.getImageUrl(imagePath)
  }

  // Determine if we should show an image or an icon
  const showImage = category.image && !category.isPromo

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="flex-shrink-0 flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/categories/${category.id}`} className="block text-center">
        <div className="flex flex-col items-center">
          {/* Image/Icon with premium border */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 mb-2">
            {/* Outer decorative ring */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+6px)] h-[calc(100%+6px)] rounded-full ${
                isActive
                  ? "bg-gradient-to-r from-gold/60 via-gold/90 to-gold/60"
                  : isHovered
                    ? "bg-gradient-to-r from-gold/40 via-gold/80 to-gold/40"
                    : "bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20"
              } transition-all duration-500`}
            ></div>

            {/* Main container */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full flex items-center justify-center overflow-hidden ${
                isActive ? "border-[1.5px] border-gold bg-white/95" : "border-[1.5px] border-gold/30 bg-white/90"
              } transition-all duration-300 shadow-md`}
            >
              {showImage ? (
                // Image display
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={getImageUrl(category.image) || "/placeholder.svg"}
                    alt={category.name}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isHovered || isActive ? "scale-110" : "scale-100"
                    }`}
                  />
                </div>
              ) : (
                // Icon display
                <div className={`transition-all duration-300 ${isHovered || isActive ? "scale-110" : "scale-100"}`}>
                  {category.icon}
                </div>
              )}

              {/* Hover overlay */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-b from-gold/5 to-gold/20 transition-opacity duration-300 ${
                  isHovered || isActive ? "opacity-100" : "opacity-0"
                }`}
              ></div>

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-gold rounded-full border-[0.5px] border-white shadow-sm z-10"></div>
              )}
            </div>

            {/* Decorative dots around the circle - heritage style */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-gold/70"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0.5 h-0.5 rounded-full bg-gold/70"></div>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-gold/70"></div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-gold/70"></div>
          </div>

          {/* Category Name with elegant underline */}
          <div className="relative">
            <h3
              className={`font-cinzel text-xs sm:text-sm font-semibold ${isActive ? "text-gold" : "text-gray-800"} uppercase truncate max-w-[80px] sm:max-w-[100px]`}
            >
              {category.name}
            </h3>
            <div
              className={`h-[1.5px] bg-gradient-to-r from-transparent via-gold/70 to-transparent mx-auto transition-all duration-300 ${
                isHovered || isActive ? "w-full" : "w-0"
              }`}
            ></div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function TopCategoriesSection() {
  const { data, isLoading, error } = useCategories()
  const [displayCategories, setDisplayCategories] = useState([])
  const location = useLocation()

  // Extract the current category ID from the URL path
  const getCurrentCategoryId = () => {
    const pathParts = location.pathname.split("/")
    const categoryIndex = pathParts.findIndex((part) => part === "categories")
    if (categoryIndex !== -1 && pathParts.length > categoryIndex + 1) {
      return pathParts[categoryIndex + 1]
    }
    return null
  }

  const currentCategoryId = getCurrentCategoryId()

  useEffect(() => {
    if (data && data.data) {
      const backendCategories = data.data.map((category) => {
        // Generate dynamic icons based on category name
        const iconMap = {
          premium: <Gem key="premium" className="w-7 h-7" />,
          special: <Sparkles key="special" className="w-7 h-7" />,
          traditional: <Cake key="traditional" className="w-7 h-7" />,
          gift: <Gift key="gift" className="w-7 h-7" />,
          popular: <Flame key="popular" className="w-7 h-7" />,
          new: <Zap key="new" className="w-7 h-7" />,
          seasonal: <PartyPopper key="seasonal" className="w-7 h-7" />,
          organic: <Leaf key="organic" className="w-7 h-7" />,
          value: <Award key="value" className="w-7 h-7" />,
          featured: <Star key="featured" className="w-7 h-7" />,
          limited: <Clock key="limited" className="w-7 h-7" />,
          favorite: <Heart key="favorite" className="w-7 h-7" />,
          dry: <Utensils key="dry" className="w-7 h-7" />,
          milk: <Coffee key="milk" className="w-7 h-7" />,
          ghee: <Droplet key="ghee" className="w-7 h-7" />,
          bengali: <MapPin key="bengali" className="w-7 h-7" />,
          festive: <PartyPopper key="festive" className="w-7 h-7" />,
          gifting: <Gift key="gifting" className="w-7 h-7" />,
        }

        // Find a matching icon or use a default
        let icon = <Utensils key="default" className="w-7 h-7" />

        Object.entries(iconMap).forEach(([key, value]) => {
          if (
            category.name.toLowerCase().includes(key.toLowerCase()) ||
            (category.id && typeof category.id === "string" && category.id.toLowerCase().includes(key.toLowerCase()))
          ) {
            icon = value
          }
        })

        // Create a dynamic description if none exists
        const description = category.description || `Explore our delicious ${category.name} collection`

        return {
          ...category,
          icon,
          description,
          // Add a count if it doesn't exist
          count: category.count || Math.floor(Math.random() * 20) + 5,
        }
      })

      // Use all available categories
      setDisplayCategories(backendCategories)
    }
  }, [data])

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="py-3 flex justify-center items-center min-h-[90px]">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-3 text-center text-red-500 text-xs">
        <p>Failed to load categories.</p>
      </div>
    )
  }

  return (
    <section className="py-3 bg-gradient-to-b from-white to-cream relative overflow-hidden">
      {/* Heritage corner decorations */}
      <HeritageCorner position="top-left" />
      <HeritageCorner position="top-right" />
      <HeritageCorner position="bottom-left" />
      <HeritageCorner position="bottom-right" />

      {/* Elegant borders */}
      <HeritageBorder side="top" />
      <HeritageBorder side="bottom" />
      <HeritageBorder side="left" />
      <HeritageBorder side="right" />

      {/* Lotus decorations on sides */}
      <LotusDecoration position="left" size={100} className="hidden lg:block" />
      <LotusDecoration position="right" size={100} className="hidden lg:block" />

      {/* Paisley decorations */}
      <PaisleyDecoration position="left-top" className="hidden md:block" />
      <PaisleyDecoration position="left-bottom" className="hidden md:block" />
      <PaisleyDecoration position="right-top" className="hidden md:block" />
      <PaisleyDecoration position="right-bottom" className="hidden md:block" />

      {/* Mandala accents */}
      <MandalaAccent position="left-top" className="hidden md:block" />
      <MandalaAccent position="left-bottom" className="hidden md:block" />
      <MandalaAccent position="right-top" className="hidden md:block" />
      <MandalaAccent position="right-bottom" className="hidden md:block" />

      {/* Rangoli pattern background */}
      <RangoliBorder />

      {/* Section content - Single line with horizontal scroll on smaller screens */}
      <div className="container mx-auto relative z-10 px-3">
        <motion.div className="flex justify-center" variants={containerVariants} initial="hidden" animate="visible">
          {/* Horizontal scrollable container for single line */}
          <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex space-x-9 md:space-x-12 min-w-max justify-center">
              {displayCategories.map((category, index) => (
                <CategoryCard
                  key={category.id || `promo-${index}`}
                  category={category}
                  index={index}
                  isActive={category.id === currentCategoryId}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom scrollbar styling */}
      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          height: 3px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: rgba(212, 175, 55, 0.1);
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </section>
  )
}
