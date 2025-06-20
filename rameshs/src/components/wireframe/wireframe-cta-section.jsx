"use client"

import { WireframeSectionHeader } from "./wireframe-section-header"
import { UniversalButton } from "../ui/universal-button"
import { Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react"
import useThemeStore from "../../store/themeStore"

function WireframeCTASection() {
  // Get section color from theme store (section index 8)
  const sectionColor = useThemeStore((state) => state.getSectionColor(8))
  const isPrimaryColor = sectionColor === useThemeStore((state) => state.sectionColors.primary)

  // Shadow style for primary color sections
  const shadowStyle = isPrimaryColor
    ? {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }
    : {}

  return (
    <section
      className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden"
      style={{ backgroundColor: sectionColor, ...shadowStyle }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header - Explicitly Left-Aligned */}
          <div className="flex justify-start mb-1 md:mb-2">
            <WireframeSectionHeader title="Join Our Sweet Legacy" className="mb-0 text-left" />
          </div>

          {/* Main CTA Container - Reduced spacing */}
          <div className="mt-3 sm:mt-4 md:mt-5 bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 shadow-xl sm:shadow-2xl relative overflow-hidden border border-[#78383b]/15">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-24 sm:w-32 md:w-40 lg:w-48 h-24 sm:h-32 md:h-40 lg:h-48 opacity-[0.03]">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M100 0C155.228 0 200 44.7715 200 100C200 155.228 155.228 200 100 200C44.7715 200 0 155.228 0 100C0 44.7715 44.7715 0 100 0Z"
                    fill="#78383b"
                  />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 w-20 sm:w-24 md:w-32 lg:w-40 h-20 sm:h-24 md:h-32 lg:h-40 opacity-[0.03]">
                <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="160" height="160" fill="#78383b" transform="rotate(45)" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="relative text-center">
              {/* CTA Buttons - Always on same line */}
              <div className="flex flex-row gap-2 sm:gap-4 md:gap-6 justify-center mb-8 sm:mb-10 md:mb-12">
                <UniversalButton
                  variant="primary"
                  size="lg"
                  className="flex-1 sm:flex-none px-3 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-sm sm:text-base md:text-lg font-cinzel tracking-wider shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl"
                >
                  Start Shopping
                </UniversalButton>
                <UniversalButton
                  variant="secondary"
                  size="lg"
                  className="flex-1 sm:flex-none px-3 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-sm sm:text-base md:text-lg font-cinzel tracking-wider shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl"
                >
                  Shop Now
                </UniversalButton>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-r from-white/80 to-white/70 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg sm:shadow-xl border border-[#78383b]/15">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-5 md:gap-6">
                  <div className="text-center lg:text-left">
                    <h5 className="font-bold text-[#78383b] mb-1 sm:mb-2 font-playfair text-base sm:text-lg">
                      Need Assistance?
                    </h5>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-[#78383b]/80 font-cinzel text-sm">
                      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>+91 98765 43210</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>care@rameshsweets.com</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#78383b]/10 to-[#78383b]/5 flex items-center justify-center text-[#78383b] hover:bg-gradient-to-br hover:from-[#78383b] hover:to-[#a0522d] hover:text-white transition-all duration-300 cursor-pointer shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl">
                      <Facebook className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#78383b]/10 to-[#78383b]/5 flex items-center justify-center text-[#78383b] hover:bg-gradient-to-br hover:from-[#78383b] hover:to-[#a0522d] hover:text-white transition-all duration-300 cursor-pointer shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl">
                      <Instagram className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#78383b]/10 to-[#78383b]/5 flex items-center justify-center text-[#78383b] hover:bg-gradient-to-br hover:from-[#78383b] hover:to-[#a0522d] hover:text-white transition-all duration-300 cursor-pointer shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl">
                      <Twitter className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 sm:top-16 md:top-20 left-10 sm:left-16 md:left-20 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 opacity-[0.02]">
          <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="64" cy="64" r="64" fill="#78383b" />
          </svg>
        </div>
        <div className="absolute bottom-10 sm:bottom-16 md:bottom-20 right-10 sm:right-16 md:right-20 w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 opacity-[0.02]">
          <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="96" height="96" fill="#78383b" transform="rotate(45)" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default WireframeCTASection
