"use client"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, Cake, Cookie, Dessert, Croissant, Candy, Utensils } from "lucide-react"
import { HeritageHeaderDecoration, HeritageCorners } from "../components/ui/heritage-decorations"
import { useCategory, useSubcategoriesByCategoryId } from "../hooks/use-category-queries"
import LoadingSpinner from "../components/common/loading-spinner"
import { useEffect, useState } from "react"

export default function SubcategoriesPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState("")

  // Fetch category and subcategories data
  const { data: categoryData, isLoading: isCategoryLoading, error: categoryError } = useCategory(categoryId)

  const {
    data: subcategoriesData,
    isLoading: isSubcategoriesLoading,
    error: subcategoriesError,
  } = useSubcategoriesByCategoryId(categoryId)

  // Set category name from the first subcategory's category if available
  useEffect(() => {
    if (subcategoriesData?.data?.length > 0 && subcategoriesData.data[0].category) {
      setCategoryName(subcategoriesData.data[0].category.name)
    } else if (categoryData?.data?.name) {
      setCategoryName(categoryData.data.name)
    }
  }, [subcategoriesData, categoryData])

  const isLoading = isCategoryLoading || isSubcategoriesLoading
  const error = categoryError || subcategoriesError

  // Function to get appropriate icon based on subcategory name
  const getSubcategoryIcon = (subcategoryName) => {
    const name = subcategoryName.toLowerCase()

    if (name.includes("ladoo") || name.includes("laddoo")) return <Candy className="w-full h-full p-3 text-gold" />
    if (name.includes("barfi") || name.includes("burfi")) return <Cake className="w-full h-full p-3 text-gold" />
    if (name.includes("kaju") || name.includes("cashew")) return <Candy className="w-full h-full p-3 text-gold" />
    if (name.includes("rasgulla") || name.includes("gulab")) return <Dessert className="w-full h-full p-3 text-gold" />
    if (name.includes("mysore") || name.includes("pak")) return <Cookie className="w-full h-full p-3 text-gold" />
    if (name.includes("sandesh")) return <Cake className="w-full h-full p-3 text-gold" />
    if (name.includes("gujiya")) return <Croissant className="w-full h-full p-3 text-gold" />
    if (name.includes("besan")) return <Cookie className="w-full h-full p-3 text-gold" />
    if (name.includes("oreo")) return <Cookie className="w-full h-full p-3 text-gold" />
    if (name.includes("choco")) return <Candy className="w-full h-full p-3 text-gold" />

    // Default icon for other subcategories
    return <Utensils className="w-full h-full p-3 text-gold" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50/30 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50/30 flex flex-col justify-center items-center">
        <p className="text-red-500 mb-4">Error loading category data. Please try again later.</p>
        <button
          onClick={() => navigate("/categories")}
          className="px-4 py-2 bg-gold text-white rounded-md hover:bg-gold-dark transition-colors"
        >
          Back to Categories
        </button>
      </div>
    )
  }

  // Get subcategories from the response
  const subcategories = subcategoriesData?.data || []

  return (
    <div className="min-h-screen bg-pink-50/30">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-pink-50 to-white">
        <div className="absolute inset-0 bg-[url('/images/pattern-light.png')] opacity-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Link
              to="/categories"
              className="inline-flex items-center text-gold hover:text-gold-dark transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Categories</span>
            </Link>

            <div className="relative inline-block mb-6">
              <HeritageHeaderDecoration className="absolute -top-4 left-1/2 -translate-x-1/2 text-gold" />
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-gray-900">{categoryName}</h1>
            </div>

            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Explore our delicious collection of sweets in this category.
            </p>

            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Subcategories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 relative">
            <h2 className="text-2xl md:text-3xl font-cinzel font-semibold text-center text-gray-900 mb-3">
              Browse {categoryName} Varieties
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold/70 to-transparent mx-auto mb-6"></div>
            <p className="text-center text-gray-700 max-w-2xl mx-auto">
              Discover our specialized collection of {categoryName.toLowerCase()} varieties, each with its unique flavor
              and tradition.
            </p>
          </div>

          {subcategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">No subcategories found for this category.</p>
              <Link
                to={`/products?category=${categoryId}`}
                className="inline-flex items-center px-6 py-3 bg-gold text-white rounded-md hover:bg-gold-dark transition-colors"
              >
                View All Products in this Category
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {subcategories.map((subcategory) => (
                <motion.div key={subcategory.id} variants={itemVariants} className="group">
                  <Link
                    to={`/products?subcategory=${subcategory.id}`}
                    className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gold/10"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {subcategory.image_url ? (
                        <img
                          src={subcategory.image_url || "/placeholder.svg"}
                          alt={subcategory.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center group-hover:bg-pink-200/50 transition-all duration-500">
                          {getSubcategoryIcon(subcategory.name)}
                        </div>
                      )}
                    </div>

                    <div className="p-5 relative">
                      <HeritageCorners size="sm" className="absolute inset-0 text-gold/30" />
                      <h3 className="text-xl font-cinzel font-semibold text-gray-900 mb-2 group-hover:text-gold">
                        {subcategory.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{subcategory.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{subcategory.product_count} products</span>
                        <span className="text-gold flex items-center text-sm font-medium group-hover:text-gold">
                          View Products
                          <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
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

      {/* Direct to Products CTA */}
      <section className="py-16 bg-pink-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-lg p-8 md:p-12 relative overflow-hidden border border-gold/20">
            <div className="absolute inset-0 bg-[url('/images/pattern-light.png')] opacity-10"></div>
            <HeritageCorners className="absolute inset-0 text-gold/30" />

            <div className="relative z-10 text-center">
              <h2 className="text-2xl md:text-3xl font-cinzel font-semibold text-gray-900 mb-4">
                Browse All {categoryName} Products
              </h2>
              <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? View our complete collection of {categoryName.toLowerCase()}{" "}
                products.
              </p>

              <Link
                to={`/products?category=${categoryId}`}
                className="inline-flex items-center px-6 py-3 bg-gold text-white rounded-md hover:bg-gold-dark transition-colors"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
