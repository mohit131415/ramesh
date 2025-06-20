import SubcategoryCard from "./subcategory-card"
import { Link } from "react-router-dom"

export default function SubcategoryGrid({ subcategories = [], categoryName }) {
  if (!subcategories || subcategories.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-md border border-gold/10 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-3">No Subcategories Found</h3>
        <p className="text-gray-600 mb-6">There are no subcategories available in this category at the moment.</p>
        <Link
          to="/categories"
          className="inline-block px-6 py-3 bg-gold text-white rounded-md hover:bg-gold/90 transition-colors"
        >
          Browse All Categories
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {subcategories.map((subcategory) => (
        <SubcategoryCard key={subcategory.id} subcategory={subcategory} categoryName={categoryName} />
      ))}
    </div>
  )
}
