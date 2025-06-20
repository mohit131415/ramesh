"use client"

import { useEffect } from "react"

// This component ensures we don't have multiple toast systems
const ToastInitializer = () => {
  useEffect(() => {
    // Check if we need a fallback toast system
    if (!window.showToast) {
      // Simple fallback toast function
      window.showToast = ({ title, description, type }) => {
        console.log(`Toast (fallback): ${type} - ${title}: ${description}`)
        return true
      }
      console.log("Fallback toast initialized")
    }
  }, [])

  return null
}

export default ToastInitializer
