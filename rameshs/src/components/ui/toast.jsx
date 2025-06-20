"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

// Global toast state
const globalToasts = []
let globalSetToasts = null

// Single toast instance tracker
const toastInstance = null

// Toast component
const Toast = ({ id, title, description, type = "default", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300) // Allow time for exit animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, id, onClose])

  // Determine background color based on type
  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-[#f8f3e9] to-[#f5efe2] border-[#d3ae6e]"
      case "error":
        return "bg-gradient-to-r from-red-50 to-red-50/80 border-red-400"
      case "warning":
        return "bg-gradient-to-r from-yellow-50 to-yellow-50/80 border-yellow-400"
      case "info":
        return "bg-gradient-to-r from-[#f8f3e9] to-[#f5efe2] border-[#d3ae6e]"
      default:
        return "bg-gradient-to-r from-white to-gray-50 border-[#e9dcc3]"
    }
  }

  // Determine icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-[#d3ae6e]" size={20} />
      case "error":
        return <AlertCircle className="text-red-500" size={20} />
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={20} />
      case "info":
        return <Info className="text-[#d3ae6e]" size={20} />
      default:
        return <Info className="text-[#8c6d3f]" size={20} />
    }
  }

  // Get text color based on type
  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-[#8c6d3f]"
      case "error":
        return "text-red-800"
      case "warning":
        return "text-yellow-800"
      case "info":
        return "text-[#8c6d3f]"
      default:
        return "text-[#8c6d3f]"
    }
  }

  // Get decorative SVG pattern based on type
  const getPatternColor = () => {
    switch (type) {
      case "success":
        return "#d3ae6e"
      case "error":
        return "#f87171"
      case "warning":
        return "#fbbf24"
      case "info":
        return "#d3ae6e"
      default:
        return "#d3ae6e"
    }
  }

  return (
    <div
      className={`relative transform transition-all duration-300 ease-in-out shadow-lg rounded-lg border-l-4 p-4 w-full overflow-hidden ${getBgColor()} ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      {/* Decorative SVG pattern background */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id={`toast-pattern-${id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 30c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z"
                fill={getPatternColor()}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#toast-pattern-${id})`} />
        </svg>
      </div>

      {/* Decorative corner SVG */}
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-10">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L100,0 L100,100 Z" fill={getPatternColor()} />
        </svg>
      </div>

      <div className="flex items-start relative z-10">
        {/* Logo and icon container */}
        <div className="flex-shrink-0 mr-3">
          <div className="relative">
            <img src="/images/ramesh-logo.svg" alt="Ramesh Sweets" className="h-10 w-auto" />
            <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 shadow-sm">{getIcon()}</div>
          </div>
        </div>

        <div className="flex-1">
          {title && <h3 className={`font-medium ${getTextColor()}`}>{title}</h3>}
          {description && <p className={`text-sm ${getTextColor()} opacity-90`}>{description}</p>}
        </div>

        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(id), 300)
          }}
          className="ml-4 inline-flex shrink-0 text-[#8c6d3f] hover:text-[#d3ae6e] transition-colors"
        >
          <X size={18} />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent overflow-hidden">
        <div
          className="h-full bg-[#d3ae6e]/30"
          style={{
            width: "100%",
            animation: `shrinkWidth ${duration}ms linear forwards`,
          }}
        ></div>
      </div>
    </div>
  )
}

// Toast container
export const Toaster = () => {
  const [toasts, setToasts] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    globalSetToasts = setToasts

    // Set up global toast function
    window.showToast = ({ title, description, type = "info", duration = 3000 }) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast = { id, title, description, type, duration }

      if (globalSetToasts) {
        globalSetToasts((prev) => [newToast])
      }

      return id
    }

    return () => {
      if (window.showToast) {
        delete window.showToast
      }
      globalSetToasts = null
    }
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  if (!mounted || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="w-full pointer-events-auto">
          <Toast {...toast} onClose={removeToast} />
        </div>
      ))}
    </div>,
    document.body,
  )
}

// Add keyframe animation
if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("toast-keyframes")
  if (!existingStyle) {
    const style = document.createElement("style")
    style.id = "toast-keyframes"
    style.textContent = `
      @keyframes shrinkWidth {
        from { width: 100%; }
        to { width: 0%; }
      }
    `
    document.head.appendChild(style)
  }
}

// Export function for direct use
export const toast = ({ title, description, type, duration }) => {
  if (window.showToast) {
    return window.showToast({ title, description, type, duration })
  }
}

export { Toast }
