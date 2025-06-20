import { Link } from "react-router-dom"
import { useSubcategories } from "../../hooks/useSubcategories"
import SubcategoryList from "../subcategory/subcategory-list"
import LoadingSpinner from "../common/loading-spinner"

export default function CategoryDetail({ category }) {
  const { data: subcategories, isLoading, isError } = useSubcategories(category?.id)

  if (!category) {
    return (
      <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-700">Category not found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gold/10">
      {/* Category Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-pink-100 to-pink-50 flex items-center justify-center overflow-hidden">
          {category.image_url ? (
            <img
              src={category.image_url || "/placeholder.svg"}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl font-cinzel text-gold/20">{category.name}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-cinzel font-bold text-gray-900">{category.name}</h1>
          {category.description && <p className="mt-2 text-gray-600 max-w-3xl">{category.description}</p>}
        </div>
      </div>

      {/* Category Content */}
      <div className="p-6 pt-16">
        {/* Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100/50">
            <h3 className="font-medium text-gray-900">Products</h3>
            <p className="text-2xl font-cinzel text-gold">{category.product_count || 0}</p>
          </div>

          <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100/50">
            <h3 className="font-medium text-gray-900">Subcategories</h3>
            <p className="text-2xl font-cinzel text-gold">
              {isLoading ? "..." : isError ? "N/A" : subcategories?.length || 0}
            </p>
          </div>

          <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100/50">
            <h3 className="font-medium text-gray-900">Browse Products</h3>
            <Link to={`/products?category=${category.id}`} className="mt-1 inline-block text-gold hover:underline">
              View All Products →
            </Link>
          </div>
        </div>

        {/* Subcategories Section */}
        <div className="mb-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="md" />
              <span className="ml-3 text-gray-600">Loading subcategories...</span>
            </div>
          ) : isError ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
              Failed to load subcategories. Please try again later.
            </div>
          ) : subcategories && subcategories.length > 0 ? (
            <SubcategoryList subcategories={subcategories} categoryId={category.id} />
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-600">No subcategories found for this category.</p>
              <Link
                to={`/products?category=${category.id}`}
                className="mt-3 inline-block px-4 py-2 bg-gold text-white rounded-md hover:bg-gold/90 transition-colors"
              >
                Browse All Products in this Category
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
