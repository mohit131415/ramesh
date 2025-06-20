import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { HeritageCorners } from "../../components/ui/heritage-decorations"
import { getImageUrl } from "../../services/api-client"

export default function CategoryCard({ category, index }) {
  return (
    <Link
      to={`/categories/${category.id}/subcategories`}
      className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gold/10 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl(category.image) || "/placeholder.svg"}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {category.featured && (
          <div className="absolute top-2 right-2 bg-gold/90 text-white text-xs font-medium px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>

      <div className="p-5 relative">
        <HeritageCorners size="sm" className="absolute inset-0 text-gold/30" />
        <h3 className="text-xl font-cinzel font-semibold text-gray-900 mb-2 group-hover:text-gold">{category.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.description}</p>

        {/* Subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Subcategories:</h4>
            <div className="flex flex-wrap gap-1">
              {category.subcategories.slice(0, 3).map((subcategory) => (
                <span key={subcategory.id} className="text-xs bg-pink-50 text-gray-700 px-2 py-1 rounded-full">
                  {subcategory.name}
                </span>
              ))}
              {category.subcategories.length > 3 && (
                <span className="text-xs bg-pink-50 text-gray-700 px-2 py-1 rounded-full">
                  +{category.subcategories.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{category.product_count} products</span>
          <span className="text-gold flex items-center text-sm font-medium group-hover:text-gold">
            View Subcategories
            <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
