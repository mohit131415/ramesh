"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, TrendingUp, ArrowDownAZ, ArrowUpAZ, ArrowDownUp, ArrowUpDown, Percent } from "lucide-react"
import useProductStore from "../../store/productStore"

const ProductSort = () => {
  const { sortBy, setSortBy } = useProductStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Default sort options if API hasn't provided them yet
  const [localSortOptions, setLocalSortOptions] = useState([
    { value: "", label: "Sort by" },
    { value: "popular", label: "Popular" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "discount_low", label: "Discount: Low to High" },
    { value: "discount_high", label: "Discount: High to Low" },
  ])

  // Get sort options from the store or use local defaults
  const { sortOptions } = useProductStore()

  useEffect(() => {
    if (sortOptions && sortOptions.length > 0) {
      // Add the "Sort by" option to the beginning of the array
      setLocalSortOptions([{ value: "", label: "Sort by" }, ...sortOptions])
    }
  }, [sortOptions])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get the icon for each sort option
  const getSortIcon = (value) => {
    switch (value) {
      case "popular":
        return <TrendingUp size={16} />
      case "name_asc":
        return <ArrowDownAZ size={16} />
      case "name_desc":
        return <ArrowUpAZ size={16} />
      case "price_low":
        return <ArrowDownUp size={16} />
      case "price_high":
        return <ArrowUpDown size={16} />
      case "discount_low":
      case "discount_high":
        return <Percent size={16} />
      default:
        return <TrendingUp size={16} />
    }
  }

  // Get the current selected option label
  const getCurrentSortLabel = () => {
    if (!sortBy || sortBy === "") return "Sort by"
    const option = localSortOptions.find((opt) => opt.value === sortBy)
    return option ? option.label : "Sort by"
  }

  const handleSelectOption = (value) => {
    setSortBy(value)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block w-48" ref={dropdownRef}>
      <button
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2">
          {sortBy && getSortIcon(sortBy)}
          {getCurrentSortLabel()}
        </span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <ul className="py-1 overflow-auto text-base max-h-60" role="listbox">
            {localSortOptions.map((option) => (
              <li
                key={option.value}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                  sortBy === option.value ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleSelectOption(option.value)}
                role="option"
                aria-selected={sortBy === option.value}
              >
                <div className="flex items-center gap-2">
                  {option.value && getSortIcon(option.value)}
                  <span className={`block truncate ${sortBy === option.value ? "font-medium" : "font-normal"}`}>
                    {option.label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProductSort
