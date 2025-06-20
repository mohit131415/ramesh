"use client"

import { useState, useEffect } from "react"
import { X, Truck, CheckCircle } from "lucide-react"
import useThemeStore from "@/store/themeStore"

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Get primary color from theme store
  const getSectionColor = useThemeStore((state) => state.getSectionColor)
  const primaryColor = getSectionColor(0) // Gets #F7F2EE

  // Check if current color is primary to add shadow
  const isPrimaryColor = primaryColor === "#F7F2EE"

  const announcements = [
    {
      icon: Truck,
      text: "Free Delivery Above ₹500",
    },
    {
      icon: CheckCircle,
      text: "Fresh Sweets Made Daily",
    },
  ]

  // Handle mobile detection and auto-rotation
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Auto-rotate only on mobile
    let timer
    if (isMobile) {
      timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length)
      }, 3000)
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
      if (timer) clearInterval(timer)
    }
  }, [isMobile])

  if (!isVisible) return null

  return (
    <div
      className="border-b border-[#d0b271]/20 py-1.5 text-center relative"
      style={{
        backgroundColor: primaryColor,
        boxShadow: isPrimaryColor ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none",
      }}
    >
      {/* Subtle gold accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d0b271] to-transparent"></div>

      <div className="container mx-auto flex items-center justify-center px-4">
        {/* Mobile Slider (visible on mobile only) */}
        {isMobile ? (
          <div className="flex items-center justify-center w-full">
            <div className="relative w-full max-w-sm">
              {announcements.map((announcement, index) => {
                const IconComponent = announcement.icon
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-center space-x-2 transition-all duration-700 ease-in-out ${
                      index === currentIndex
                        ? "opacity-100 transform translate-x-0"
                        : "opacity-0 transform translate-x-4 absolute inset-0"
                    }`}
                  >
                    <IconComponent className="text-[#8b5a3c] h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-[#8b5a3c] font-medium text-xs font-cinzel">{announcement.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Desktop content */
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Truck className="text-[#8b5a3c] h-3.5 w-3.5" />
              <span className="text-[#8b5a3c] font-medium text-xs font-cinzel">Free Delivery Above ₹500</span>
            </div>

            <span className="h-3 w-px bg-[#d0b271]/40"></span>

            <div className="flex items-center space-x-2">
              <CheckCircle className="text-[#d0b271] h-3.5 w-3.5" />
              <span className="text-[#8b5a3c] text-xs font-medium font-cinzel">Fresh Sweets Made Daily</span>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 text-[#8b5a3c]/60 hover:text-[#8b5a3c] transition-colors p-1 rounded-full hover:bg-white/30"
          aria-label="Close announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bottom gold accent */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d0b271]/30 to-transparent"></div>
    </div>
  )
}
