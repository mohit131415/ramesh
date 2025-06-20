import { Link } from "react-router-dom"
import { ChevronRight, Package } from "lucide-react"

export default function SubcategoryList({ subcategories, categoryName }) {
  if (!subcategories || subcategories.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700">No Subcategories Found</h3>
        <p className="text-gray-500 mt-1">This category doesn't have any subcategories yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subcategories.map((subcategory) => (
        <Link
          key={subcategory.id}
          to={`/subcategory/${subcategory.id}`}
          className="bg-white rounded-lg p-4 border border-gold/10 hover:border-gold/30 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mr-3">
              <span className="text-lg font-cinzel text-gold">{subcategory.name.charAt(0)}</span>
            </div>
            <h3 className="font-medium text-gray-900 group-hover:text-gold transition-colors">{subcategory.name}</h3>
          </div>

          {subcategory.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{subcategory.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs bg-pink-50 px-2 py-1 rounded-full text-gray-700">
              {subcategory.product_count || 0} Products
            </span>
            <span className="flex items-center text-sm text-gold group-hover:underline">
              View Products
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
