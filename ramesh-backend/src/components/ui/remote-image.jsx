"use client"

import { useState } from "react"

export default function RemoteImage({ src, alt, className, fallbackSrc = "/placeholder.svg", ...props }) {
  const [error, setError] = useState(false)

  // Map of image names to their blob URLs - no longer needed as we're using direct paths
  const getActualSrc = () => {
    if (error) return fallbackSrc
    return src
  }

  return (
    <img
      src={getActualSrc() || "/placeholder.svg"}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  )
}

