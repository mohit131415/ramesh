"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronRight, AlertTriangle, PackageOpen } from "lucide-react"
import { useCategories } from "../hooks/useCategories"
import LoadingSpinner from "../components/common/loading-spinner"
import useCategoryStore from "../store/categoryStore"
import api from "../services/api-client"
import ProductCard from "../components/products/product-card"

export default function SubcategoryDetailPage() {
  const { subcategoryId } = useParams()
  const navigate = useNavigate()
  const { categories } = useCategoryStore()

  // Fetch all categories if not already loaded
  const { isLoading: isCategoriesLoading } = useCategories()

  // State for subcategory data
  const [parentCategory, setParentCategory] = useState(null)
  const [subcategory, setSubcategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for products
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  })

  useEffect(() => {
    const findSubcategory = async () => {
      if (!subcategoryId) return

      setIsLoading(true)
      setError(null)

      try {
        // Try to find the subcategory in each category
        for (const category of categories) {
          const { data } = await api.fetchSubcategories(category.id)

          if (!data) continue

          const foundSubcategory = data.find((sub) => sub.id.toString() === subcategoryId.toString())

          if (foundSubcategory) {
            setParentCategory(category)
            setSubcategory(foundSubcategory)
            break
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error finding subcategory:", err)
        setError(err)
        setIsLoading(false)
      }
    }

    if (categories.length > 0) {
      findSubcategory()
    }
  }, [categories, subcategoryId])

  // Fetch products when subcategory is loaded
  useEffect(() => {
    const fetchProducts = async () => {
      if (!subcategoryId) return

      setProductsLoading(true)
      setProductsError(null)

      try {
        const response = await api.fetchProductsBySubcategory(subcategoryId, {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        })

        if (response.status === "success" && response.data) {
          setProducts(response.data.products || [])
          setPagination({
            currentPage: response.data.page || 1,
            totalPages: response.data.total_pages || 1,
            totalItems: response.data.total || 0,
            itemsPerPage: response.data.limit || 12,
          })
        } else {
          setProducts([])
        }

        setProductsLoading(false)
      } catch (err) {
        console.error("Error fetching products for subcategory:", err)
        setProductsError(err)
        setProductsLoading(false)
      }
    }

    if (subcategory) {
      fetchProducts()
    }
  }, [subcategory, subcategoryId, pagination.currentPage, pagination.itemsPerPage])

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }))
      // Scroll to top when changing pages
      window.scrollTo(0, 0)
    }
  }

  // Redirect if subcategory not found after loading
  useEffect(() => {
    if (!isLoading && !subcategory && !error) {
      navigate("/categories", { replace: true })
    }
  }, [subcategory, isLoading, error, navigate])

  if (isLoading || isCategoriesLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50/30 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <h2 className="text-xl font-medium text-red-800 mb-2">Error Loading Subcategory</h2>
            <p className="text-red-600 mb-4">{error.message || "An unknown error occurred"}</p>
            <Link
              to="/categories"
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Return to Categories
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-pink-50/30 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50 p-6 rounded-lg text-center">
            <h2 className="text-xl font-medium text-yellow-800 mb-2">Subcategory Not Found</h2>
            <p className="text-yellow-600 mb-4">
              The subcategory you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/categories"
              className="inline-block px-6 py-3 bg-gold text-white rounded-md hover:bg-gold/90 transition-colors"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-gold">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link to="/categories" className="hover:text-gold">
              Categories
            </Link>
            {parentCategory && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link to={`/categories/${parentCategory.id}`} className="hover:text-gold">
                  {parentCategory.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-900 font-medium">{subcategory.name}</span>
          </div>
        </div>

        {/* Back Button */}
        <div className="mb-8">
          {parentCategory ? (
            <Link
              to={`/categories/${parentCategory.id}`}
              className="inline-flex items-center text-gold hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to {parentCategory.name}
            </Link>
          ) : (
            <Link to="/categories" className="inline-flex items-center text-gold hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Link>
          )}
        </div>

        {/* Subcategory Header */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gold/10 mb-8">
          <div className="relative h-64 bg-gray-100">
            {subcategory.image_url ? (
              <img
                src={subcategory.image_url || "/placeholder.svg"}
                alt={subcategory.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400 text-lg">No image available</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-cinzel font-bold">{subcategory.name}</h1>
              {parentCategory && (
                <p className="text-sm text-white/80 mt-1">
                  in <span className="font-medium">{parentCategory.name}</span>
                </p>
              )}
            </div>
          </div>

          <div className="p-6">
            {subcategory.description && <p className="text-gray-600 mb-4">{subcategory.description}</p>}

            <div className="flex flex-wrap gap-2">
              {pagination.totalItems > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-gray-700">
                  {pagination.totalItems} Products
                </span>
              )}
              {subcategory.meta_keywords && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {subcategory.meta_keywords.split(",").map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gold/10 mb-8">
          <h2 className="text-2xl font-cinzel font-semibold text-gray-900 mb-6">Products</h2>

          {/* Loading state */}
          {productsLoading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="md" />
            </div>
          )}

          {/* Error state */}
          {productsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Products</h3>
              <p className="text-red-600 mb-4">
                {productsError.message || "There was a problem loading the products. Please try again later."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!productsLoading && !productsError && products.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <PackageOpen className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">We couldn't find any products in this subcategory.</p>
              <Link
                to="/products"
                className="bg-[#d3ae6e] hover:bg-[#c19c5d] text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          )}

          {/* Products grid */}
          {!productsLoading && !productsError && products.length > 0 && (
            <>
              {/* Results count */}
              <div className="mb-6 text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{products.length}</span> of{" "}
                <span className="font-medium text-gray-900">{pagination.totalItems}</span> products
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        pagination.currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-md ${
                          pagination.currentPage === page
                            ? "bg-[#d3ae6e] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`px-3 py-1 rounded-md ${
                        pagination.currentPage === pagination.totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
