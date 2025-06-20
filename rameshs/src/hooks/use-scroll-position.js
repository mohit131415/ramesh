"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook for tracking scroll position
 * @param {number} threshold - The scroll threshold to determine if scrolled
 * @returns {Object} - The scroll position and whether the page is scrolled past the threshold
 */
export function useScrollPosition(threshold = 50) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [direction, setDirection] = useState(null) // 'up' or 'down'
  const [lastScrollTop, setLastScrollTop] = useState(0)

  useEffect(() => {
    const updatePosition = () => {
      const position = window.pageYOffset
      setScrollPosition(position)
      setIsScrolled(position > threshold)
      
      // Determine scroll direction
      if (position > lastScrollTop) {
        setDirection('down')
      } else if (position < lastScrollTop) {
        setDirection('up')
      }
      
      setLastScrollTop(position)
    }

    window.addEventListener("scroll", updatePosition, { passive: true })

    // Initial check
    updatePosition()

    return () => window.removeEventListener("scroll", updatePosition)
  }, [threshold, lastScrollTop])

  return { scrollPosition, isScrolled, direction }
}
