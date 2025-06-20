"use client"

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    {/* Image skeleton */}
    <div className="w-full aspect-square bg-gray-200"></div>

    {/* Content skeleton */}
    <div className="p-4">
      {/* Category */}
      <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>

      {/* Title */}
      <div className="h-5 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-3"></div>

      {/* Ratings */}
      <div className="flex gap-1 mb-3">
        <div className="h-3 w-3 bg-gray-200 rounded"></div>
        <div className="h-3 w-3 bg-gray-200 rounded"></div>
        <div className="h-3 w-3 bg-gray-200 rounded"></div>
        <div className="h-3 w-3 bg-gray-200 rounded"></div>
        <div className="h-3 w-3 bg-gray-200 rounded"></div>
      </div>

      {/* Price */}
      <div className="h-5 w-20 bg-gray-200 rounded"></div>
    </div>
  </div>
)

export default ProductSkeleton
