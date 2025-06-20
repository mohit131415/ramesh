"use client"

import { useState, useEffect } from "react"

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)

  // Show button after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <a
      href="https://api.whatsapp.com/send/?phone=7038818181&text=Hi%20Ramesh%20Sweets,%20I%20would%20like%20to%20place%20an%20order%20or%20make%20an%20inquiry."
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-14 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 shadow-lg transition-all duration-300 hover:scale-110 hidden md:flex ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      aria-label="Contact us on WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></div>
      <div className="relative w-8 h-8 flex items-center justify-center">
        <img src="/images/WhatsApp.svg" alt="WhatsApp" className="w-full h-full" />
      </div>
    </a>
  )
}
