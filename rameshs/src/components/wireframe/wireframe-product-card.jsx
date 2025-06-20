"use client"
import { useState } from "react"
import { UniversalButton } from "../ui/universal-button"

const WireframeProductCard = ({
  image = "/placeholder.svg?height=200&width=200",
  hoverImage = null,
  title = "Shree Heera Sweets",
  subtitle = "Spl. Pulp Orange Barfi - 250gm",
  price = "Rs. 249.00",
  originalPrice = null,
  discount = null,
  onAddToCart = () => {},
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 flex flex-col ${className}`}
      style={{
        boxShadow: isHovered ? "0 6px 12px -2px rgba(0, 0, 0, 0.15)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        height: "350px", // Fixed height for perfect uniformity
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image - Fixed height with improved transition */}
      <div className="w-full overflow-hidden relative flex-shrink-0" style={{ height: "200px" }}>
        {/* Discount Tag */}
        {discount && (
          <div
            className="absolute top-2 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 z-10"
            style={{
              borderTopRightRadius: "2px",
              borderBottomRightRadius: "2px",
            }}
          >
            {discount}% OFF
          </div>
        )}

        {/* Main Image */}
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            isHovered && hoverImage ? "opacity-0 transform scale-105" : "opacity-100 transform scale-100"
          }`}
          style={{
            transformOrigin: "center center",
          }}
        />

        {/* Hover Image */}
        {hoverImage && (
          <img
            src={hoverImage || "/placeholder.svg"}
            alt={`${title} - hover`}
            className={`w-full h-full object-cover absolute top-0 left-0 transition-all duration-1000 ease-in-out ${
              isHovered ? "opacity-100 transform scale-100" : "opacity-0 transform scale-95"
            }`}
            style={{
              transformOrigin: "center center",
            }}
          />
        )}

        {/* Subtle overlay on hover */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? "opacity-5" : "opacity-0"
          }`}
        />
      </div>

      {/* Content Area - Exactly 150px */}
      <div className="flex flex-col p-3 text-center" style={{ height: "150px" }}>
        {/* Title - Fixed height */}
        <div style={{ height: "20px", marginBottom: "4px" }}>
          <h3
            className="font-semibold text-sm leading-tight overflow-hidden font-cinzel"
            style={{
              color: "#78383b",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h3>
        </div>

        {/* Subtitle - Fixed height for exactly 2 lines */}
        <div style={{ height: "32px", marginBottom: "8px" }}>
          <p
            className="text-xs leading-tight overflow-hidden"
            style={{
              color: "#78383b",
              opacity: 0.9,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              textOverflow: "ellipsis",
              lineHeight: "16px",
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Spacer to push price and button to bottom */}
        <div className="flex-grow"></div>

        {/* Price - Fixed height */}
        <div style={{ height: "20px", marginBottom: "12px" }}>
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-sm font-cinzel" style={{ color: "#78383b" }}>
              {price}
            </span>
            {originalPrice && <span className="text-xs text-gray-400 line-through font-cinzel">{originalPrice}</span>}
          </div>
        </div>

        {/* Button - Fixed height with hover effect */}
        <div style={{ height: "32px" }}>
          <UniversalButton
            onClick={onAddToCart}
            className={`w-full border-0 uppercase tracking-wide font-medium text-xs h-full transition-all duration-300 font-cinzel ${
              isHovered ? "transform scale-105" : "transform scale-100"
            }`}
            style={{
              backgroundColor: "#c9a66b",
              color: "white",
            }}
            variant="primary"
          >
            ADD TO CART
          </UniversalButton>
        </div>
      </div>
    </div>
  )
}

export default WireframeProductCard
