"use client"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to the top of the page with smooth animation
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }, [pathname])

  return null // This component doesn't render anything
}
