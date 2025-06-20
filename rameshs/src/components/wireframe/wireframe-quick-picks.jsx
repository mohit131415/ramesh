"use client"

import { useState, useEffect } from "react"
import WireframeSimpleProductCard from "./wireframe-simple-product-card"
import { WireframeSectionHeader } from "./wireframe-section-header"
import useThemeStore from "../../store/themeStore"

export default function WireframeQuickPicks() {
  const [isMobile, setIsMobile] = useState(false)

  // Get section color from theme store (index 1 for second section)
  const getSectionColor = useThemeStore((state) => state.getSectionColor)
  const sectionBgColor = getSectionColor(1)

  // Check if this section has the primary color to add shadow
  const sectionColors = useThemeStore((state) => state.sectionColors)
  const hasShadow = sectionBgColor === sectionColors.primary

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const quickItems = [
    {
      title: "Blueberry Peda",
      price: "₹299",
      weight: "250g",
      image: "/Sweets/BLUEBERRYPEDAP1.jpg",
      hoverImage: "/Sweets/BLUEBERRYPEDAP2.jpg",
    },
    {
      title: "Gatch Special",
      price: "₹199",
      originalPrice: "₹249",
      discount: 20,
      weight: "250g",
      image: "/Sweets/GATCHP1.jpg",
      hoverImage: "/Sweets/GATCHP2.jpg",
    },
    {
      title: "Kesar Peda",
      price: "₹349",
      weight: "250g",
      image: "/Sweets/KESARPEDAP1.jpg",
      hoverImage: "/Sweets/KESARPEDAP2.jpg",
    },
    {
      title: "Pan Laddu",
      price: "₹223",
      originalPrice: "₹279",
      discount: 20,
      weight: "250g",
      image: "/Sweets/PANLADDOP1.jpg",
      hoverImage: "/Sweets/PANLADDOP2.jpg",
    },
    {
      title: "Blueberry Peda",
      price: "₹254",
      originalPrice: "₹299",
      discount: 15,
      weight: "250g",
      image: "/Sweets/BLUEBERRYPEDAP1.jpg",
      hoverImage: "/Sweets/BLUEBERRYPEDAP2.jpg",
    },
    {
      title: "Gatch Special",
      price: "₹249",
      weight: "250g",
      image: "/Sweets/GATCHP1.jpg",
      hoverImage: "/Sweets/GATCHP2.jpg",
    },
    {
      title: "Kesar Peda",
      price: "₹279",
      originalPrice: "₹349",
      discount: 20,
      weight: "250g",
      image: "/Sweets/KESARPEDAP1.jpg",
      hoverImage: "/Sweets/KESARPEDAP2.jpg",
    },
    {
      title: "Pan Laddu",
      price: "₹279",
      weight: "250g",
      image: "/Sweets/PANLADDOP1.jpg",
      hoverImage: "/Sweets/PANLADDOP2.jpg",
    },
    {
      title: "Blueberry Peda",
      price: "₹299",
      weight: "250g",
      image: "/Sweets/BLUEBERRYPEDAP1.jpg",
      hoverImage: "/Sweets/BLUEBERRYPEDAP2.jpg",
    },
    {
      title: "Gatch Special",
      price: "₹199",
      originalPrice: "₹249",
      discount: 20,
      weight: "250g",
      image: "/Sweets/GATCHP1.jpg",
      hoverImage: "/Sweets/GATCHP2.jpg",
    },
  ]

  // Display only 4 items on mobile, all 10 on larger screens
  const displayItems = isMobile ? quickItems.slice(0, 4) : quickItems

  const handleAddToCart = (productTitle) => {
    console.log(`Added ${productTitle} to cart`)
    // Add your cart logic here
  }

  return (
    <section
      className={`pt-8 pb-4 md:py-4 relative ${hasShadow ? "shadow-bottom" : ""}`}
      style={{
        backgroundColor: sectionBgColor,
        boxShadow: hasShadow ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading using WireframeSectionHeader - Left Aligned */}
        <div className="flex justify-start mb-0 sm:mb-1 md:mb-2">
          <WireframeSectionHeader title="Featured Items" />
        </div>

        {/* Responsive Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {displayItems.map((item, index) => (
            <WireframeSimpleProductCard
              key={index}
              image={item.image}
              hoverImage={item.hoverImage}
              title={item.title}
              price={item.price}
              originalPrice={item.originalPrice}
              discount={item.discount}
              weight={item.weight}
              onAddToCart={() => handleAddToCart(item.title)}
              className="w-full"
              cardBgColor={sectionBgColor}
            />
          ))}
        </div>

        {/* View All Text Link */}
        <div className="text-center mb-2">
          <a
            href="#"
            className="inline-block text-base font-medium transition-colors duration-200 hover:opacity-80 font-cinzel"
            style={{ color: "#78383b" }}
          >
            View All Products →
          </a>
        </div>
      </div>
    </section>
  )
}
