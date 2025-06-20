"use client"

import { WireframeSectionHeader } from "./wireframe-section-header"
import { UniversalButton } from "../ui/universal-button"
import { Heart, MessageCircle, Instagram } from "lucide-react"
import useThemeStore from "../../store/themeStore"
import { useRef, useState } from "react"

function WireframeInstagramSection() {
  // Get section color from theme store (section index 7)
  const sectionColor = useThemeStore((state) => state.getSectionColor(7))
  const isPrimaryColor = sectionColor === useThemeStore((state) => state.sectionColors.primary)

  // Shadow style for primary color sections
  const shadowStyle = isPrimaryColor
    ? {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }
    : {}

  // Instagram reels for marquee
  const reels = [
    "/Instagram/reel00.mp4",
    "/Instagram/reel01.mp4",
    "/Instagram/reel02.mp4",
    "/Instagram/reel03.mp4",
    "/Instagram/reel04.mp4",
  ]

  // Duplicate reels for seamless infinite scrolling
  const duplicatedReels = [...reels, ...reels]

  // Marquee animation
  const [isHovered, setIsHovered] = useState(false)
  const marqueeRef = useRef(null)

  // Control marquee speed
  const speed = isHovered ? 0 : 1
  const duration = 30 // seconds for one complete cycle

  return (
    <section className="py-8 md:py-12" style={{ backgroundColor: sectionColor, ...shadowStyle }}>
      {/* Header and Instagram Handle with container */}
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header - Explicitly Left-Aligned with minimal spacing */}
          <div className="flex justify-start">
            <WireframeSectionHeader title="Sweet Stories" className="text-left" />
          </div>

          {/* Instagram Handle - Minimal spacing */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 md:gap-3 bg-white/60 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-full border border-[#78383b]/20 shadow-sm">
              <Instagram className="w-4 h-4 md:w-5 md:h-5 text-[#78383b]" />
              <span className="font-cinzel font-semibold text-sm md:text-base text-[#78383b] tracking-wide">
                @rameshsweetsandcakes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Reels Marquee - Full Width */}
      <div
        className="relative w-full overflow-hidden mb-8 md:mb-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={marqueeRef}
          className="flex gap-3 md:gap-4 transition-transform pl-4"
          style={{
            width: "fit-content",
            animation: `marquee ${duration}s linear infinite`,
            animationPlayState: isHovered ? "paused" : "running",
          }}
        >
          {duplicatedReels.map((reel, index) => (
            <div
              key={index}
              className="relative w-[160px] sm:w-[180px] md:w-[220px] lg:w-[280px] aspect-[9/16] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden flex-shrink-0 shadow-md border border-[#78383b]/10"
            >
              <video
                src={reel}
                className="w-full h-full object-cover"
                autoPlay={index < 5} // Only autoplay first set to save resources
                muted
                loop
                playsInline
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-[1.5rem] md:rounded-b-[2.5rem]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white">
                    <Heart className="w-3 h-3 md:w-4 md:h-4 fill-white text-white" />
                    <span className="text-xs md:text-sm">{Math.floor(Math.random() * 2000) + 500}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white">
                    <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm">{Math.floor(Math.random() * 100) + 10}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow Button with container
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <UniversalButton
              variant="primary"
              size="md"
              className="px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-cinzel tracking-wider"
            >
              <Instagram className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
              Follow Us on Instagram
            </UniversalButton>
          </div>
        </div>
      </div> */}

      {/* CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  )
}

export default WireframeInstagramSection
