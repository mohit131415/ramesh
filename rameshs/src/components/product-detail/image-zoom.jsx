"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Maximize2, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Heart } from "lucide-react"
import apiClient from "../../services/api-client"

export default function ImageZoom({ images = [], altText = "Product image" }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const imageRef = useRef(null)

  // Ensure we have at least one image
  const imageList = images.length > 0 ? images : [{ image_path: "/placeholder.svg" }]

  // Handle image loading
  useEffect(() => {
    if (imageList[currentIndex]) {
      setIsLoading(true)
      const img = new Image()
      img.src = apiClient.getImageUrl(imageList[currentIndex].image_path)
      img.onload = () => setIsLoading(false)
    }
  }, [currentIndex, imageList])

  // Handle keyboard navigation in fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullscreen) return

      switch (e.key) {
        case "ArrowLeft":
          handlePrevious()
          break
        case "ArrowRight":
          handleNext()
          break
        case "Escape":
          setIsFullscreen(false)
          break
        case "+":
          handleZoomIn()
          break
        case "-":
          handleZoomOut()
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen, currentIndex, imageList.length])

  // Reset zoom level when changing images or exiting fullscreen
  useEffect(() => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex, isFullscreen])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1))
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1))
  }

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index)
  }

  const handleFullscreenToggle = () => {
    setIsFullscreen((prev) => !prev)
  }

  const handleFavoriteToggle = () => {
    setIsFavorite((prev) => !prev)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1))
  }

  const handleMouseMove = (e) => {
    if (zoomLevel === 1 || !isFullscreen) return

    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    // Calculate the maximum translation based on zoom level
    const maxTranslateX = ((zoomLevel - 1) / zoomLevel) * 50
    const maxTranslateY = ((zoomLevel - 1) / zoomLevel) * 50

    // Calculate the translation percentage
    const translateX = maxTranslateX - (x / 100) * (maxTranslateX * 2)
    const translateY = maxTranslateY - (y / 100) * (maxTranslateY * 2)

    setPosition({ x: translateX, y: translateY })
  }

  return (
    <>
      <div className="product-gallery">
        {/* Main image */}
        <div className="gallery-main-image" onClick={handleFullscreenToggle}>
          {/* Decorative corners */}
          <div className="gallery-decorative-corner gallery-decorative-corner-tl"></div>
          <div className="gallery-decorative-corner gallery-decorative-corner-tr"></div>
          <div className="gallery-decorative-corner gallery-decorative-corner-bl"></div>
          <div className="gallery-decorative-corner gallery-decorative-corner-br"></div>

          {isLoading && (
            <div className="gallery-loading">
              <div className="gallery-loading-spinner"></div>
            </div>
          )}

          <img
            src={apiClient.getImageUrl(imageList[currentIndex].image_path) || "/placeholder.svg"}
            alt={altText}
            className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          />

          {/* Fullscreen button */}
          <button
            type="button"
            className="gallery-fullscreen-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleFullscreenToggle()
            }}
            aria-label="View fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Favorite button */}
          <button
            type="button"
            className={`gallery-favorite-btn ${isFavorite ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              handleFavoriteToggle()
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Thumbnails */}
        {imageList.length > 1 && (
          <div className="gallery-thumbnails">
            {imageList.map((image, index) => (
              <div
                key={index}
                className={`gallery-thumbnail ${index === currentIndex ? "active" : ""}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={apiClient.getImageUrl(image.image_path) || "/placeholder.svg"}
                  alt={`${altText} thumbnail ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="gallery-fullscreen-modal open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <button
              type="button"
              className="gallery-fullscreen-close"
              onClick={handleFullscreenToggle}
              aria-label="Close fullscreen view"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation buttons */}
            {imageList.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-fullscreen-nav gallery-fullscreen-prev"
                  onClick={handlePrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  className="gallery-fullscreen-nav gallery-fullscreen-next"
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Zoom controls */}
            <div className="absolute top-1.5rem left-1.5rem flex gap-2">
              <button
                type="button"
                className="gallery-fullscreen-nav"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="gallery-fullscreen-nav"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
            </div>

            {/* Main image container */}
            <div
              ref={containerRef}
              className="relative overflow-hidden"
              style={{ maxWidth: "90%", maxHeight: "80vh" }}
              onMouseMove={handleMouseMove}
            >
              <motion.img
                ref={imageRef}
                src={apiClient.getImageUrl(imageList[currentIndex].image_path)}
                alt={altText}
                className="gallery-fullscreen-image"
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x}%, ${position.y}%)`,
                  transition: zoomLevel === 1 ? "transform 0.3s ease" : "none",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Thumbnails */}
            {imageList.length > 1 && (
              <div className="gallery-fullscreen-thumbnails">
                {imageList.map((image, index) => (
                  <div
                    key={index}
                    className={`gallery-fullscreen-thumbnail ${index === currentIndex ? "active" : ""}`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <img
                      src={apiClient.getImageUrl(image.image_path) || "/placeholder.svg"}
                      alt={`${altText} thumbnail ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
