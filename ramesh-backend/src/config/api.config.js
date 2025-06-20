/**
 * API Configuration
 * Centralized configuration for API base URLs only
 */

// Get environment variables
const getEnvVar = (key, required = true) => {
  const value = import.meta.env[key]
  if (required && !value) {
    throw new Error(`❌ Environment variable ${key} is required but not defined in your .env file`)
  }
  return value
}

// Base URLs - only from environment variables
export const API_BASE_URL = getEnvVar("VITE_API_BASE_URL")
export const IMAGE_API_BASE_URL = getEnvVar("VITE_IMAGE_API_BASE_URL")

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  IMAGE_BASE_URL: IMAGE_API_BASE_URL,
  TIMEOUT: Number.parseInt(getEnvVar("VITE_API_TIMEOUT", false) || "10000", 10),
}

// Export individual configurations for backward compatibility
export const BASE_URL = API_BASE_URL
export const TIMEOUT = API_CONFIG.TIMEOUT

// Utility function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`
}

// Utility function to build image URL - uses Vite proxy
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http")) return imagePath

  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath

  // Use Vite proxy path - this will be proxied to the actual image server
  // The /imageapi proxy is configured in vite.config.js
  return `/imageapi/api/public/${cleanPath}`
}
