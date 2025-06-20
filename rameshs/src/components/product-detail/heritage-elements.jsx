"use client"

import { motion } from "framer-motion"

export function HeritagePattern({ className = "", variant = "default" }) {
  const patternVariants = {
    default: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d="M50,0 L100,50 L50,100 L0,50 Z" stroke="#D4AF37" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
        <path d="M50,10 L90,50 L50,90 L10,50 Z" stroke="#D4AF37" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
        <path d="M50,20 L80,50 L50,80 L20,50 Z" stroke="#D4AF37" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
        <path d="M50,30 L70,50 L50,70 L30,50 Z" stroke="#D4AF37" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
        <path d="M50,40 L60,50 L50,60 L40,50 Z" stroke="#D4AF37" strokeWidth="0.5" fill="none" strokeOpacity="0.3" />
        <circle cx="50" cy="50" r="2" fill="#D4AF37" fillOpacity="0.3" />
      </svg>
    ),
    circular: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="50" cy="50" r="49" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="50" cy="50" r="40" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="50" cy="50" r="30" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="50" cy="50" r="20" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="50" cy="50" r="10" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" />
        <circle cx="50" cy="50" r="2" fill="#D4AF37" fillOpacity="0.3" />
      </svg>
    ),
    floral: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z"
          stroke="#D4AF37"
          strokeWidth="0.5"
          fill="none"
          strokeOpacity="0.3"
        />
        <path
          d="M50,20 C65,20 80,35 80,50 C80,65 65,80 50,80 C35,80 20,65 20,50 C20,35 35,20 50,20 Z"
          stroke="#D4AF37"
          strokeWidth="0.5"
          fill="none"
          strokeOpacity="0.3"
        />
        <path
          d="M25,50 C25,36.2 36.2,25 50,25 C63.8,25 75,36.2 75,50"
          stroke="#D4AF37"
          strokeWidth="0.5"
          fill="none"
          strokeOpacity="0.3"
        />
        <path
          d="M75,50 C75,63.8 63.8,75 50,75 C36.2,75 25,63.8 25,50"
          stroke="#D4AF37"
          strokeWidth="0.5"
          fill="none"
          strokeOpacity="0.3"
        />
        <circle cx="50" cy="50" r="2" fill="#D4AF37" fillOpacity="0.3" />
        <path
          d="M50,0 L50,100 M0,50 L100,50"
          stroke="#D4AF37"
          strokeWidth="0.5"
          strokeOpacity="0.2"
          strokeDasharray="2 4"
        />
      </svg>
    ),
  }

  return patternVariants[variant] || patternVariants.default
}

export function HeritageBorder({ className = "", variant = "horizontal" }) {
  const borderVariants = {
    horizontal: (
      <svg
        width="100%"
        height="8"
        viewBox="0 0 300 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d="M0 4H300" stroke="url(#paint0_linear)" strokeWidth="0.5" strokeDasharray="8 4" />
        <circle cx="150" cy="4" r="3" fill="#D4AF37" fillOpacity="0.3" />
        <circle cx="150" cy="4" r="1.5" fill="#D4AF37" fillOpacity="0.6" />
        <circle cx="75" cy="4" r="1" fill="#D4AF37" fillOpacity="0.4" />
        <circle cx="225" cy="4" r="1" fill="#D4AF37" fillOpacity="0.4" />
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="4" x2="300" y2="4" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="0.5" stopColor="#D4AF37" stopOpacity="0.6" />
            <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
    vertical: (
      <svg
        width="8"
        height="100%"
        viewBox="0 0 8 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d="M4 0V300" stroke="url(#paint0_linear)" strokeWidth="0.5" strokeDasharray="8 4" />
        <circle cx="4" cy="150" r="3" fill="#D4AF37" fillOpacity="0.3" />
        <circle cx="4" cy="150" r="1.5" fill="#D4AF37" fillOpacity="0.6" />
        <circle cx="4" cy="75" r="1" fill="#D4AF37" fillOpacity="0.4" />
        <circle cx="4" cy="225" r="1" fill="#D4AF37" fillOpacity="0.4" />
        <defs>
          <linearGradient id="paint0_linear" x1="4" y1="0" x2="4" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="0.5" stopColor="#D4AF37" stopOpacity="0.6" />
            <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
    diagonal: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path d="M0 0L100 100" stroke="url(#paint0_linear)" strokeWidth="0.5" strokeDasharray="8 4" />
        <circle cx="50" cy="50" r="3" fill="#D4AF37" fillOpacity="0.3" />
        <circle cx="50" cy="50" r="1.5" fill="#D4AF37" fillOpacity="0.6" />
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4AF37" stopOpacity="0" />
            <stop offset="0.5" stopColor="#D4AF37" stopOpacity="0.6" />
            <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
  }

  return borderVariants[variant] || borderVariants.horizontal
}

export function HeritageCorner({ className = "", position = "top-left" }) {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 rotate-90",
    "bottom-left": "bottom-0 left-0 -rotate-90",
    "bottom-right": "bottom-0 right-0 rotate-180",
  }

  return (
    <div className={`absolute w-12 h-12 ${positionClasses[position]} ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0L48 0L48 48" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.4" fill="none" />
        <path d="M8 8L40 8L40 40" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
        <path d="M16 16L32 16L32 32" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
        <circle cx="24" cy="24" r="1" fill="#D4AF37" fillOpacity="0.5" />
      </svg>
    </div>
  )
}

export function HeritageDecorativeLine({ className = "", variant = "horizontal" }) {
  const lineVariants = {
    horizontal: (
      <div className={`w-full flex items-center justify-center ${className}`}>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent flex-grow"></div>
        <div className="w-2 h-2 rounded-full bg-gold/30 mx-2"></div>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent flex-grow"></div>
      </div>
    ),
    vertical: (
      <div className={`h-full flex flex-col items-center justify-center ${className}`}>
        <div className="w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent flex-grow"></div>
        <div className="h-2 w-2 rounded-full bg-gold/30 my-2"></div>
        <div className="w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent flex-grow"></div>
      </div>
    ),
  }

  return lineVariants[variant] || lineVariants.horizontal
}

export function HeritageAnimatedBorder({ className = "" }) {
  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
      <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
      <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent"></div>

      <HeritageCorner position="top-left" />
      <HeritageCorner position="top-right" />
      <HeritageCorner position="bottom-left" />
      <HeritageCorner position="bottom-right" />
    </motion.div>
  )
}

export default function HeritageElements() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-cinzel text-gold-dark mb-4">Heritage Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="aspect-square border border-gold/20 rounded-lg overflow-hidden">
            <HeritagePattern variant="default" />
          </div>
          <div className="aspect-square border border-gold/20 rounded-lg overflow-hidden">
            <HeritagePattern variant="circular" />
          </div>
          <div className="aspect-square border border-gold/20 rounded-lg overflow-hidden">
            <HeritagePattern variant="floral" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-cinzel text-gold-dark mb-4">Heritage Borders</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gold/20 rounded-lg">
            <HeritageBorder variant="horizontal" />
          </div>
          <div className="p-4 border border-gold/20 rounded-lg h-32">
            <div className="flex h-full">
              <HeritageBorder variant="vertical" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-cinzel text-gold-dark mb-4">Heritage Corners</h3>
        <div className="p-8 border border-gold/20 rounded-lg relative">
          <HeritageCorner position="top-left" />
          <HeritageCorner position="top-right" />
          <HeritageCorner position="bottom-left" />
          <HeritageCorner position="bottom-right" />
          <p className="text-center text-gray-700 font-eb-garamond">Content with heritage corners</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-cinzel text-gold-dark mb-4">Heritage Decorative Lines</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gold/20 rounded-lg">
            <HeritageDecorativeLine variant="horizontal" />
          </div>
          <div className="p-4 border border-gold/20 rounded-lg h-32">
            <div className="flex h-full">
              <HeritageDecorativeLine variant="vertical" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-cinzel text-gold-dark mb-4">Heritage Animated Border</h3>
        <div className="p-8 border border-gold/20 rounded-lg relative min-h-[100px]">
          <HeritageAnimatedBorder />
          <p className="text-center text-gray-700 font-eb-garamond relative z-10">Content with animated border</p>
        </div>
      </div>
    </div>
  )
}
