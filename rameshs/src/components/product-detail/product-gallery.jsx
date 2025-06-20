"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, X } from "lucide-react"
import apiClient from "../../services/api-client"
import "./gallery-styles.css"

const ProductGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [images, setImages] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const galleryRef = useRef(null)
  const thumbnailsRef = useRef(null)
  const fullscreenImageRef = useRef(null)

  useEffect(() => {
    const initializeGallery = async () => {
      if (product && product.images && product.images.length > 0) {
        setIsLoading(true)

        // Find primary image or use first image
        const primaryImage = product.images.find((img) => img.is_primary === 1) || product.images[0]
        setSelectedImage(primaryImage)

        // Sort images by display_order
        const sortedImages = [...product.images].sort((a, b) => a.display_order - b.display_order)
        setImages(sortedImages)

        // Find index of primary image
        const primaryIndex = sortedImages.findIndex((img) => img.id === primaryImage.id)
        setCurrentIndex(primaryIndex >= 0 ? primaryIndex : 0)

        // Simulate loading
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      } else {
        setImages([])
        setSelectedImage(null)
        setIsLoading(false)
      }
    }

    initializeGallery()
  }, [product])

  // Scroll selected thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current && images.length > 0) {
      const selectedThumbnail = thumbnailsRef.current.querySelector(`[data-index="${currentIndex}"]`)
      if (selectedThumbnail) {
        selectedThumbnail.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [currentIndex, images.length])

  // Handle fullscreen keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        switch (e.key) {
          case "Escape":
            setIsFullscreen(false)
            break
          case "ArrowLeft":
            handlePrevImage(e)
            break
          case "ArrowRight":
            handleNextImage(e)
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
    }

    window.addEventListener("keydown", handleKeyDown)

    // Add body class when fullscreen is active
    if (isFullscreen) {
      document.body.classList.add("fullscreen-gallery-active")
    } else {
      document.body.classList.remove("fullscreen-gallery-active")
      // Reset zoom when exiting fullscreen
      setZoomLevel(1)
      setZoomPosition({ x: 0, y: 0 })
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.classList.remove("fullscreen-gallery-active")
    }
  }, [isFullscreen, currentIndex, images.length])

  if (!product || !images.length) {
    return (
      <div className="bg-gray-50 rounded-lg aspect-square w-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No images available</p>
        </div>
      </div>
    )
  }

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation()
    const newIndex = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
    // Reset zoom when changing images
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const handleNextImage = (e) => {
    if (e) e.stopPropagation()
    const newIndex = (currentIndex + 1) % images.length
    setCurrentIndex(newIndex)
    setSelectedImage(images[newIndex])
    // Reset zoom when changing images
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1))
  }

  const handleMouseMove = (e) => {
    if (!isFullscreen || zoomLevel === 1) return

    const { left, top, width, height } = fullscreenImageRef.current.getBoundingClientRect()

    // Calculate mouse position as percentage of container
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height

    // Calculate how much we can move the image based on zoom level
    const maxMoveX = (zoomLevel - 1) * 100
    const maxMoveY = (zoomLevel - 1) * 100

    // Calculate position to move the image (inverted so image moves with mouse)
    const posX = maxMoveX * (0.5 - x)
    const posY = maxMoveY * (0.5 - y)

    setZoomPosition({ x: posX, y: posY })
  }

  return (
    <div className={`space-y-4 gallery-container ${isFullscreen ? "fullscreen-gallery" : ""}`} ref={galleryRef}>
      {/* Main image */}
      <motion.div
        className="relative main-image-container group aspect-square w-full bg-white rounded-lg overflow-hidden border border-gold/20 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 left-4 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gold-dark hover:bg-white shadow-lg transition-all duration-300"
            >
              <Maximize2 className="h-5 w-5" />
            </button>

            {/* Main image */}
            <div className="w-full h-full flex items-center justify-center cursor-zoom-in" onClick={toggleFullscreen}>
              <img
                src={apiClient.getImageUrl(selectedImage?.image_path) || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/30 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/30 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/30 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/30 pointer-events-none"></div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-gold-dark hover:bg-gold hover:text-white flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-gold-dark hover:bg-gold hover:text-white flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <motion.div
          className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin"
          ref={thumbnailsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {images.map((image, index) => (
            <motion.button
              key={image.id || index}
              data-index={index}
              onClick={() => {
                setSelectedImage(image)
                setCurrentIndex(index)
              }}
              className={`relative rounded-md overflow-hidden border-2 flex-shrink-0 gallery-thumbnail ${
                selectedImage && selectedImage.id === image.id
                  ? "border-gold/80 shadow-md"
                  : "border-transparent hover:border-gold/40"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 bg-white">
                <img
                  src={apiClient.getImageUrl(image?.image_path) || "/placeholder.svg"}
                  alt={`${product.name} - view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 flex space-x-2">
              <button
                onClick={handleZoomIn}
                className="p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 flex items-center justify-center transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 text-white hover:bg-black/50 flex items-center justify-center transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Main fullscreen image */}
            <div
              className="relative overflow-hidden flex items-center justify-center w-full h-full"
              onMouseMove={handleMouseMove}
              ref={fullscreenImageRef}
            >
              <motion.img
                src={apiClient.getImageUrl(selectedImage?.image_path) || "/placeholder.svg"}
                alt={product.name}
                className={`max-h-[80vh] max-w-[90vw] object-contain ${zoomLevel > 1 ? "cursor-move" : "cursor-zoom-in"}`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${zoomPosition.x}px, ${zoomPosition.y}px)`,
                  transition: zoomLevel === 1 ? "transform 0.3s ease" : "none",
                }}
                onClick={() => {
                  if (zoomLevel === 1) {
                    handleZoomIn()
                  } else {
                    setZoomLevel(1)
                    setZoomPosition({ x: 0, y: 0 })
                  }
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 overflow-x-auto py-2 px-4">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => {
                      setSelectedImage(image)
                      setCurrentIndex(index)
                      // Reset zoom when changing images
                      setZoomLevel(1)
                      setZoomPosition({ x: 0, y: 0 })
                    }}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage && selectedImage.id === image.id
                        ? "border-gold shadow-md scale-110"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    <img
                      src={apiClient.getImageUrl(image?.image_path) || "/placeholder.svg"}
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductGallery
