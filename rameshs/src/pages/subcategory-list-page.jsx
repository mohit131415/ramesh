"use client"

import { useParams, Link, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { HeritageHeaderDecoration } from "../components/ui/heritage-decorations"
import { useSubcategoriesByCategory } from "../hooks/useSubcategories"
import { useCategoryById } from "../hooks/useCategories"
import useCategoryStore from "../store/categoryStore"
import api from "../services/api-client"

export default function SubcategoryListPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { setSelectedCategory } = useCategoryStore()

  // Fetch category details
  const { data: categoryData, isLoading: categoryLoading, isError: categoryError } = useCategoryById(categoryId)

  const category = categoryData?.data

  // Fetch subcategories
  const {
    data: subcategoriesData,
    isLoading: subcategoriesLoading,
    isError: subcategoriesError,
    error: subcategoriesErrorDetails,
    refetch,
  } = useSubcategoriesByCategory(categoryId)

  // Get subcategories from the response
  const subcategories = subcategoriesData?.data || []

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    // Use the API client to get the proper URL
    return api.getImageUrl(imagePath)
  }

  // Set the selected category in the store
  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId)
    }
  }, [categoryId, setSelectedCategory])

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
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-pink-50 to-white">
        <div className="absolute inset-0 bg-[url('/images/pattern-light.png')] opacity-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <button
            onClick={() => navigate("/categories")}
            className="flex items-center text-gold hover:text-gold-dark transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Categories</span>
          </button>

          <div className="max-w-3xl mx-auto text-center">
            <div className="relative inline-block mb-6">
              <HeritageHeaderDecoration className="absolute -top-4 left-1/2 -translate-x-1/2 text-gold" />
              {categoryLoading ? (
                <div className="h-10 w-64 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-gray-900">
                  {category?.name || "Subcategories"}
                </h1>
              )}
            </div>

            {categoryLoading ? (
              <div className="h-16 w-full max-w-2xl mx-auto bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                {category?.description || "Explore our delicious subcategories"}
              </p>
            )}

            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Subcategories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {subcategoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 animate-pulse rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : subcategoriesError ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600">
                Error loading subcategories: {subcategoriesErrorDetails?.message || "Unknown error"}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No subcategories found for this category.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {subcategories.map((subcategory) => (
                <motion.div key={subcategory.id} variants={itemVariants}>
                  <Link
                    to={`/products?subcategory=${subcategory.id}`}
                    className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gold/10 group"
                  >
                    <div className="relative h-48 overflow-hidden bg-pink-50">
                      {subcategory.image ? (
                        <img
                          src={getImageUrl(subcategory.image) || "/placeholder.svg"}
                          alt={subcategory.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = `/placeholder.svg?height=192&width=256&query=${encodeURIComponent(subcategory.name)}`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-cinzel text-gold/20">{subcategory.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-cinzel font-semibold text-gray-900 mb-2 group-hover:text-gold">
                        {subcategory.name}
                      </h3>
                      {subcategory.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{subcategory.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{subcategory.product_count || 0} products</span>
                        <span className="text-gold flex items-center text-sm font-medium">
                          View Products
                          <ArrowLeft className="ml-1 h-3 w-3 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
