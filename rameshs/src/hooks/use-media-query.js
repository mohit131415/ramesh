"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook for responsive design with media queries
 * @param {string} query - The media query to match
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Ensure we're in the browser environment
    if (!isClient || typeof window === 'undefined') return

    const media = window.matchMedia(query)

    // Update the state with the current value
    const updateMatches = () => {
      setMatches(media.matches)
    }

    // Set the initial value
    updateMatches()

    // Add the change listener
    if (media.addEventListener) {
      media.addEventListener("change", updateMatches)
      return () => media.removeEventListener("change", updateMatches)
    } else {
      // Fallback for older browsers
      media.addListener(updateMatches)
      return () => media.removeListener(updateMatches)
    }
  }, [query, isClient])

  return matches
}

/**
 * Predefined breakpoints for common screen sizes
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
}

/**
 * Custom hook for checking if the screen is mobile
 * @returns {boolean} - Whether the screen is mobile
 */
export function useIsMobile() {
  return !useMediaQuery(breakpoints.md)
}

/**
 * Custom hook for checking if the screen is tablet or larger
 * @returns {boolean} - Whether the screen is tablet or larger
 */
export function useIsTabletOrLarger() {
  return useMediaQuery(breakpoints.md)
}

/**
 * Custom hook for checking if the screen is desktop or larger
 * @returns {boolean} - Whether the screen is desktop or larger
 */
export function useIsDesktopOrLarger() {
  return useMediaQuery(breakpoints.lg)
}
