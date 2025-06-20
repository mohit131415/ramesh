"use client"
import { useState } from "react"
import { UniversalButton } from "../ui/universal-button"

const WireframeSimpleProductCard = ({
  image = "/placeholder.svg?height=200&width=200",
  hoverImage = null,
  title = "Cake 2",
  price = "₹594",
  originalPrice = "₹897",
  discount = 12,
  weight = "250g",
  onAddToCart = () => {},
  className = "",
  cardBgColor = "#F7F2EE", // New prop for card background color
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className={`rounded-md overflow-hidden cursor-pointer transition-all duration-600 ease-out ${className}`}
      style={{
        backgroundColor: cardBgColor, // Use the passed background color
        boxShadow: isHovered ? "0 12px 30px -8px rgba(0, 0, 0, 0.18)" : "0 2px 8px -4px rgba(0, 0, 0, 0.05)",
        transform: isHovered ? "translate3d(0, -3px, 0)" : "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div
        className="w-full relative aspect-square overflow-hidden"
        style={{
          aspectRatio: "1 / 1",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
            <div
              className="bg-red-600 text-white text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-sm shadow-sm transition-all duration-400 ease-out"
              style={{
                transform: isHovered ? "translate3d(0, -1px, 0) scale(1.05)" : "translate3d(0, 0, 0) scale(1)",
              }}
            >
              {discount}% OFF
            </div>
          </div>
        )}

        {/* Main Image */}
        <div className="relative w-full h-full">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-900 ease-out ${
              isHovered && hoverImage ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setImageLoaded(true)}
            style={{
              aspectRatio: "1 / 1",
              transform: isHovered ? "translate3d(0, 0, 0) scale(1.12)" : "translate3d(0, 0, 0) scale(1)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              filter: isHovered ? "brightness(1.05)" : "brightness(1)",
            }}
          />

          {/* Hover Image */}
          {hoverImage && (
            <img
              src={hoverImage || "/placeholder.svg"}
              alt={`${title} - alternate view`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-900 ease-out ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              style={{
                aspectRatio: "1 / 1",
                transform: isHovered ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 0, 0) scale(1.12)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                filter: isHovered ? "brightness(1)" : "brightness(1.05)",
              }}
            />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-2 sm:p-3 space-y-1 sm:space-y-1.5">
        {/* Title */}
        <h3
          className="font-bold text-xs sm:text-sm md:text-base mb-0 font-cinzel line-clamp-1 transition-all duration-400 ease-out"
          style={{
            color: "#78383b",
            transform: isHovered ? "translate3d(0, -1px, 0)" : "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {title}
        </h3>

        {/* Weight */}
        <p
          className="text-[10px] sm:text-xs text-[#78383b]/70 font-medium transition-all duration-400 ease-out"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {weight}
        </p>

        {/* Price and Button Row */}
        <div className="flex items-center justify-between pt-0.5 sm:pt-1 gap-2">
          {/* Price */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span
              className="font-extrabold text-base sm:text-lg md:text-xl transition-all duration-400 ease-out whitespace-nowrap"
              style={{
                color: "#78383b",
                fontFamily:
                  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "-0.02em",
                fontWeight: "800",
                transform: isHovered ? "translate3d(0, 0, 0) scale(1.04)" : "translate3d(0, 0, 0) scale(1)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
            >
              {price}
            </span>
            {originalPrice && (
              <span
                className="text-xs sm:text-sm md:text-base line-through transition-all duration-400 ease-out whitespace-nowrap"
                style={{
                  color: "#78383b",
                  opacity: "0.7",
                  fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: "500",
                  letterSpacing: "-0.01em",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                }}
              >
                {originalPrice}
              </span>
            )}
          </div>

          {/* Universal Button */}
          <div className="flex-shrink-0">
            <UniversalButton
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart()
              }}
              size="sm"
              variant="primary"
              className="text-xs sm:text-xs px-3 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2"
            >
              ADD
            </UniversalButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WireframeSimpleProductCard
