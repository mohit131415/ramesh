"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import ProductCard from "../products/product-card"
import { HeritageHeaderDecorationFull } from "../ui/heritage-decorations"
import LoadingSpinner from "../common/loading-spinner"
import { ChevronLeft, ChevronRight } from "lucide-react"

const RelatedProducts = ({ currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", "related", currentProductId],
    queryFn: async () => {
      const response = await fetch(`/api/api/public/products/${currentProductId}/related`)
      if (!response.ok) {
        throw new Error("Failed to fetch related products")
      }
      return response.json()
    },
    enabled: !!currentProductId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (data && data.status === "success" && data.data && data.data.products) {
      setRelatedProducts(data.data.products)
    }
  }, [data])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleNext = () => {
    const maxIndex = Math.max(0, relatedProducts.length - 4)
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex))
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !relatedProducts.length) {
    return null
  }

  const visibleProducts = relatedProducts.slice(currentIndex, currentIndex + 4)
  const canGoNext = currentIndex < relatedProducts.length - 4
  const canGoPrevious = currentIndex > 0

  return (
    <motion.div className="py-12" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <h2 className="font-cinzel text-3xl text-gray-900">You May Also Like</h2>
        <HeritageHeaderDecorationFull className="mt-4" />
      </motion.div>

      <motion.div className="relative" variants={itemVariants}>
        {/* Navigation buttons */}
        {relatedProducts.length > 4 && (
          <>
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gold/20 focus:outline-none focus:ring-2 focus:ring-gold/30 ${
                !canGoPrevious ? "opacity-50 cursor-not-allowed" : "hover:bg-gold/5"
              }`}
              aria-label="Previous products"
            >
              <ChevronLeft className="h-5 w-5 text-gold-dark" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gold/20 focus:outline-none focus:ring-2 focus:ring-gold/30 ${
                !canGoNext ? "opacity-50 cursor-not-allowed" : "hover:bg-gold/5"
              }`}
              aria-label="Next products"
            >
              <ChevronRight className="h-5 w-5 text-gold-dark" />
            </button>
          </>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {visibleProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="transform transition-transform hover:translate-y-[-5px]"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Pagination dots */}
        {relatedProducts.length > 4 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: Math.ceil(relatedProducts.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 4)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === Math.floor(currentIndex / 4) ? "bg-gold w-6" : "bg-gold/30 hover:bg-gold/50"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default RelatedProducts
