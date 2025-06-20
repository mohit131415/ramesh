import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import api from "../../services/api-client"

export default function SubcategoryCard({ subcategory, categoryName }) {
  if (!subcategory) return null

  // Properly construct the image URL using the API's getImageUrl method
  const imageUrl = subcategory.image
    ? api.getImageUrl(subcategory.image)
    : `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(subcategory.name)}`

  // Redirect to products page with subcategory filter
  const productPageUrl = `/products?subcategory=${subcategory.id}`

  return (
    <Link
      to={productPageUrl}
      className="group bg-white rounded-lg overflow-hidden shadow-md border border-gold/10 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={subcategory.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(subcategory.name)}`
          }}
          loading="lazy"
        />
        {subcategory.product_count > 0 && (
          <div className="absolute top-3 right-3 bg-gold/90 text-white text-xs font-medium px-2 py-1 rounded-full">
            {subcategory.product_count} Products
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="font-cinzel font-semibold text-lg text-gray-900 mb-1 group-hover:text-gold transition-colors">
            {subcategory.name}
          </h3>

          {categoryName && (
            <p className="text-xs text-gray-500 mb-2">
              in <span className="font-medium">{categoryName}</span>
            </p>
          )}

          {subcategory.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{subcategory.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <span className="text-sm font-medium text-gold">View Products</span>
          <ChevronRight className="h-4 w-4 text-gold" />
        </div>
      </div>
    </Link>
  )
}
