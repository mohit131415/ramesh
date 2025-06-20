const ProductBadge = ({ type, value }) => {
  if (type === "discount" && value) {
    return (
      <div className="absolute top-2 left-2 z-10 bg-[#d3ae6e] text-white text-xs font-medium px-2 py-1 rounded-sm shadow-md backdrop-blur-sm">
        {value}
      </div>
    )
  }

  if (type === "new") {
    return (
      <div className="absolute top-2 left-2 z-10 bg-white text-[#d3ae6e] text-xs font-medium px-2 py-1 rounded-sm border border-[#d3ae6e] shadow-md">
        NEW
      </div>
    )
  }

  if (type === "bestseller") {
    return (
      <div className="absolute top-2 left-2 z-10 bg-[#d3ae6e]/10 text-[#d3ae6e] text-xs font-medium px-2 py-1 rounded-sm border border-[#d3ae6e]/30 shadow-md">
        BESTSELLER
      </div>
    )
  }

  if (type === "limited") {
    return (
      <div className="absolute top-2 left-2 z-10 bg-red-50 text-red-600 text-xs font-medium px-2 py-1 rounded-sm border border-red-200 shadow-md">
        LIMITED EDITION
      </div>
    )
  }

  if (type === "veg") {
    return (
      <div className="flex items-center justify-center w-5 h-5 bg-white border border-green-600 rounded-sm">
        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
      </div>
    )
  }

  if (type === "non-veg") {
    return (
      <div className="flex items-center justify-center w-5 h-5 bg-white border border-red-600 rounded-sm">
        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
      </div>
    )
  }

  return null
}

export default ProductBadge
