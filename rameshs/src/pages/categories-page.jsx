"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { HeritageHeaderDecoration, HeritageCorners } from "../components/ui/heritage-decorations"
import { UniversalButton } from "../components/ui/universal-button"
import { useCategories } from "../hooks/useCategories"
import useCategoryStore from "../store/categoryStore"
import { useState } from "react"
import CategoryCard from "../components/category/category-card"

export default function CategoriesPage() {
  const { currentPage, setCurrentPage, setSearchQuery } = useCategoryStore()

  // Fetch categories from API
  const [searchTerm, setSearchTerm] = useState("")
  const { data, isLoading, isError, error, refetch } = useCategories({
    page: currentPage,
    limit: 20,
    search: searchTerm,
  })

  // Get categories from the API response
  const categories = data?.data || []
  const metadata = data?.meta || { current_page: 1, per_page: 20, total: 0, total_pages: 1 }

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setSearchQuery(searchTerm)
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="min-h-screen bg-pink-50/30">
      {/* Hero Section with Products */}
      <section className="relative pt-16 md:pt-24 pb-16 bg-gradient-to-b from-pink-50 to-white">
        <div className="absolute inset-0 bg-[url('/images/pattern-light.png')] opacity-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="relative inline-block mb-6">
              <HeritageHeaderDecoration className="absolute -top-4 left-1/2 -translate-x-1/2 text-gold" />
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-gray-900">Sweet Categories</h1>
            </div>

            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Explore our extensive collection of authentic Indian sweets, carefully categorized to help you find your
              favorites or discover new delights.
            </p>

            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto"></div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200 max-w-2xl mx-auto">
              <p className="text-red-600">Error loading categories: {error?.message || "Unknown error"}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <p className="text-gray-600">No categories found. Please try a different search term.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {categories.map((category, index) => (
                <motion.div key={category.id} variants={itemVariants}>
                  <CategoryCard category={category} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {metadata.total_pages > 1 && (
            <div className="flex justify-center mt-8 mb-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, metadata.current_page - 1))}
                  disabled={metadata.current_page === 1}
                  className={`px-3 py-1 rounded border ${
                    metadata.current_page === 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gold/30 text-gold hover:bg-gold/10"
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: metadata.total_pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full ${
                      metadata.current_page === page
                        ? "bg-gold text-white"
                        : "bg-white text-gray-700 border border-gold/30 hover:bg-gold/10"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(metadata.total_pages, metadata.current_page + 1))}
                  disabled={metadata.current_page === metadata.total_pages}
                  className={`px-3 py-1 rounded border ${
                    metadata.current_page === metadata.total_pages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gold/30 text-gold hover:bg-gold/10"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-8 md:p-12 relative overflow-hidden border border-gold/20">
            <div className="absolute inset-0 bg-[url('/images/pattern-light.png')] opacity-10"></div>
            <HeritageCorners className="absolute inset-0 text-gold/30" />

            <div className="relative z-10 text-center">
              <h2 className="text-2xl md:text-3xl font-cinzel font-semibold text-gray-900 mb-4">
                Celebrate Special Occasions with Ramesh Sweets
              </h2>
              <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                From weddings to corporate events, our premium sweet collections add a touch of tradition and elegance
                to your celebrations. Customized packaging available for bulk orders.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/wedding-gifts">
                  <UniversalButton
                    variant="secondary"
                    size="lg"
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Wedding Collections
                  </UniversalButton>
                </Link>
                <Link to="/corporate-gifts">
                  <UniversalButton
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    Corporate Gifts
                  </UniversalButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
