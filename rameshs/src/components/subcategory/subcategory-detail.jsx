import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function SubcategoryDetail({ subcategory, category }) {
  if (!subcategory) {
    return (
      <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-700">Subcategory not found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gold/10">
      {/* Subcategory Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-pink-100 to-pink-50 flex items-center justify-center overflow-hidden">
          {subcategory.image_url ? (
            <img
              src={subcategory.image_url || "/placeholder.svg"}
              alt={subcategory.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl font-cinzel text-gold/20">{subcategory.name}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          {category && (
            <div className="mb-2">
              <Link
                to={`/categories/${category.id}`}
                className="text-sm text-gold hover:underline inline-flex items-center"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to {category.name}
              </Link>
            </div>
          )}
          <h1 className="text-3xl font-cinzel font-bold text-gray-900">{subcategory.name}</h1>
          {subcategory.description && <p className="mt-2 text-gray-600 max-w-3xl">{subcategory.description}</p>}
        </div>
      </div>

      {/* Subcategory Content */}
      <div className="p-6 pt-16">
        {/* Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100/50">
            <h3 className="font-medium text-gray-900">Products</h3>
            <p className="text-2xl font-cinzel text-gold">{subcategory.product_count || 0}</p>
          </div>

          <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100/50">
            <h3 className="font-medium text-gray-900">Browse Products</h3>
            <Link
              to={`/products?category=${category?.id}&subcategory=${subcategory.id}`}
              className="mt-1 inline-block text-gold hover:underline"
            >
              View All Products →
            </Link>
          </div>
        </div>

        {/* Products will be loaded here when the API is available */}
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">Products will be displayed here once the API is available.</p>
          <Link
            to={`/products?category=${category?.id}&subcategory=${subcategory.id}`}
            className="mt-3 inline-block px-4 py-2 bg-gold text-white rounded-md hover:bg-gold/90 transition-colors"
          >
            Browse All Products in this Subcategory
          </Link>
        </div>
      </div>
    </div>
  )
}
