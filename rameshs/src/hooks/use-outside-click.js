"use client"

import { useEffect, useRef } from "react"

/**
 * Custom hook for detecting clicks outside a component
 * @param {Function} callback - The callback to run when a click outside is detected
 * @param {boolean} active - Whether the detection is active
 * @returns {React.RefObject} - The ref to attach to the component
 */
export function useOutsideClick(callback, active = true) {
  const ref = useRef(null)

  useEffect(() => {
    if (!active) return

    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event)
      }
    }

    document.addEventListener("mousedown", handleClick)
    document.addEventListener("touchstart", handleClick)

    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("touchstart", handleClick)
    }
  }, [callback, active])

  return ref
}

/**
 * Custom hook for detecting escape key press
 * @param {Function} callback - The callback to run when escape is pressed
 * @param {boolean} active - Whether the detection is active
 */
export function useEscapeKey(callback, active = true) {
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        callback(event)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [callback, active])
}

