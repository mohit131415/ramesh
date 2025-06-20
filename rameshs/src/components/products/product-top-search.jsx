"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import useProductStore from "../../store/productStore"

const ProductTopSearch = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const setSearchQuery = useProductStore((state) => state.setSearchQuery)

  const handleSearch = (e) => {
    e.preventDefault()

    // Trim the search term to remove whitespace
    const trimmedSearchTerm = searchTerm.trim()

    // Special case for "0" - silently do nothing
    if (trimmedSearchTerm === "0") {
      return
    }

    // Only validate that search term is not empty
    if (!trimmedSearchTerm) {
      return
    }

    setSearchQuery(trimmedSearchTerm)
  }

  const handleClear = () => {
    setSearchTerm("")
    setSearchQuery("")
  }

  return (
    <div className="w-full max-w-xl mx-auto mb-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for sweets, gift boxes, etc."
            className="w-full py-3 pl-4 pr-12 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="absolute right-0 top-0 h-full px-4 bg-gradient-to-r from-[#d3ae6e] to-[#c19c5d] text-white rounded-r-md hover:from-[#c19c5d] hover:to-[#b08c4d] transition-all"
        >
          <Search size={20} />
        </button>
      </form>
    </div>
  )
}

export default ProductTopSearch
