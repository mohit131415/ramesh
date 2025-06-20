"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import useProductStore from "../../store/productStore"
import { useQueryClient } from "@tanstack/react-query"
import { getComprehensiveProducts, clearProductCache } from "../../services/product-service"

// Custom debounce function implementation
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null)

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  )

  // Clean up the timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

const ProductFilter = () => {
  // Get the query client for manual invalidation
  const queryClient = useQueryClient()

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    subcategories: true,
    price: true,
  })

  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubcategories,
    setSelectedSubcategories,
    toggleSubcategory,
    priceRange,
    setPriceRange,
    showAllCategories,
    showAllSubcategories,
    toggleShowAllCategories,
    toggleShowAllSubcategories,
    resetFilters,
    setCurrentPage,
    overallPriceRange,
    setOverallPriceRange,
    clearSelectedSubcategories,
  } = useProductStore()

  // State for available categories and subcategories from the API
  const [availableCategories, setAvailableCategories] = useState([])
  const [availableSubcategories, setAvailableSubcategories] = useState([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)

  // Hardcoded fixed price range that will never change - updated with correct values from API
  const [FIXED_PRICE_RANGE, setFIXED_PRICE_RANGE] = useState({ min: 129, max: 2000 })

  // Local state for price range slider to provide smoother UX
  const [localPriceRange, setLocalPriceRange] = useState({ ...FIXED_PRICE_RANGE })
  const [isDragging, setIsDragging] = useState(false)
  const [isApplyingPrice, setIsApplyingPrice] = useState(false)
  const [pendingPriceChange, setPendingPriceChange] = useState(false)

  // Refs for the slider thumbs
  const minThumbRef = useRef(null)
  const maxThumbRef = useRef(null)
  const sliderTrackRef = useRef(null)

  // Ref to track if this is the initial load
  const isInitialLoad = useRef(true)

  // Ref to track if price range has been initialized from API
  const isPriceRangeInitialized = useRef(false)

  // Ref to track previous filter state to avoid unnecessary API calls
  const prevFiltersRef = useRef({
    category: null,
    subcategories: [],
    priceRange: { ...FIXED_PRICE_RANGE },
  })

  // Ref to track the filter fetch timeout
  const filterFetchTimeoutRef = useRef(null)

  // Initialize price range on component mount
  useEffect(() => {
    // Set the fixed price range in the store
    setOverallPriceRange(FIXED_PRICE_RANGE)

    // If price range hasn't been set yet, initialize it with the fixed values
    if (priceRange.min === null || priceRange.max === null) {
      setPriceRange(FIXED_PRICE_RANGE)
      setLocalPriceRange(FIXED_PRICE_RANGE)
      isPriceRangeInitialized.current = true
    }
  }, [])

  // Update local price range when store changes, but only on initial load
  useEffect(() => {
    // Only update if priceRange has actual values (not null)
    if (priceRange.min !== null && priceRange.max !== null) {
      // Only initialize local price range on first load
      if (isInitialLoad.current || (!isDragging && !pendingPriceChange)) {
        setLocalPriceRange({
          min: priceRange.min,
          max: priceRange.max,
        })
      }
    }
  }, [priceRange, isDragging, pendingPriceChange])

  // Define the fetch filters function
  const fetchFilters = async (params) => {
    setIsLoadingFilters(true)
    try {
      // Make a single API call with all needed parameters
      const response = await getComprehensiveProducts({
        ...params,
        skipCache: false, // Use cache if available
      })

      if (response.status === "success" && response.data) {
        // Set available categories and subcategories
        if (response.data.filters?.available_categories) {
          setAvailableCategories(response.data.filters.available_categories)
        }

        // Set available subcategories
        if (response.data.filters?.available_subcategories) {
          setAvailableSubcategories(response.data.filters.available_subcategories)
        }

        // Get price range from API response
        if (response.data.filters?.price_range && isInitialLoad.current) {
          const { min_price, max_price } = response.data.filters.price_range
          const newMinPrice = Number(min_price)
          const newMaxPrice = Number(max_price)

          // Update our fixed price range with the values from the API
          const apiPriceRange = { min: newMinPrice, max: newMaxPrice }

          // Update the store's overall price range
          setOverallPriceRange(apiPriceRange)
          setFIXED_PRICE_RANGE(apiPriceRange)

          // Only update price range if it hasn't been set yet
          if (!isPriceRangeInitialized.current) {
            setPriceRange(apiPriceRange)
            setLocalPriceRange(apiPriceRange)
            isPriceRangeInitialized.current = true
          }
        }
      }
    } catch (error) {
      console.error("Error fetching filter data:", error)
    } finally {
      setIsLoadingFilters(false)
    }
  }

  // Create a debounced version of fetchFilters with a longer delay
  const debouncedFetchFilters = useDebounce(fetchFilters, 800)

  // Fetch filter data when component mounts - only once
  useEffect(() => {
    // Only fetch on initial mount
    if (isInitialLoad.current) {
      // Prepare filter parameters for initial load
      const filterParams = {
        sort_by: "popular",
        page: 1,
      }

      // Call the fetch function directly (not debounced) for initial load
      fetchFilters(filterParams)

      // Mark initial load as complete to prevent further automatic calls
      isInitialLoad.current = false
    }
  }, []) // Empty dependency array ensures this only runs once on mount

  // Fetch filter data when category or subcategories change (but not on initial load or price range init)
  useEffect(() => {
    // Skip if this is still considered the initial load phase
    if (isInitialLoad.current) {
      return
    }

    // Skip automatic API calls during price range initialization
    if (!isPriceRangeInitialized.current) {
      return
    }

    // Skip API calls if user is currently dragging the price slider
    if (isDragging) {
      return
    }

    // Check if filters have actually changed to avoid unnecessary API calls
    const categoryChanged = selectedCategory !== prevFiltersRef.current.category

    // Check if subcategories have changed
    const subcategoriesChanged =
      selectedSubcategories.length !== prevFiltersRef.current.subcategories.length ||
      selectedSubcategories.some((id) => !prevFiltersRef.current.subcategories.includes(id)) ||
      prevFiltersRef.current.subcategories.some((id) => !selectedSubcategories.includes(id))

    // Only fetch if category or subcategory has changed (not price)
    if (categoryChanged || subcategoriesChanged) {
      // Update the previous filters ref
      prevFiltersRef.current = {
        category: selectedCategory,
        subcategories: [...selectedSubcategories],
        priceRange: { ...priceRange },
      }

      // Clear any pending filter fetch
      if (filterFetchTimeoutRef.current) {
        clearTimeout(filterFetchTimeoutRef.current)
      }

      // Use a timeout to batch multiple filter changes together
      filterFetchTimeoutRef.current = setTimeout(() => {
        // Prepare filter parameters based on current selections
        const filterParams = {
          category_id: selectedCategory,
          subcategory_id: selectedSubcategories.length > 0 ? selectedSubcategories : null,
          min_price: priceRange.min,
          max_price: priceRange.max,
          sort_by: "popular",
          page: 1,
        }

        // Call the debounced fetch function with all parameters at once
        debouncedFetchFilters(filterParams)

        filterFetchTimeoutRef.current = null
      }, 300)
    }
  }, [selectedCategory, selectedSubcategories, debouncedFetchFilters, isDragging])

  // Handle reset filters
  const handleResetFilters = () => {
    resetFilters()

    // Don't set isInitialLoad to true here, as we don't want to trigger the initial load logic again
    // Instead, we'll just update the previous filters ref
    prevFiltersRef.current = {
      category: null,
      subcategories: [],
      priceRange: { ...FIXED_PRICE_RANGE }, // Use our fixed price range
    }

    // Update local price range to the fixed initial values
    setLocalPriceRange(FIXED_PRICE_RANGE)
    setPendingPriceChange(false)

    // Clear the product cache
    clearProductCache()

    // Use a short timeout to prevent this from happening during render
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
        exact: false,
        refetchType: "active", // Only refetch active queries
      })
    }, 50)
  }

  // Calculate percentage position for slider thumbs
  const calculateThumbPosition = (value, min, max) => {
    if (min === null || max === null || value === null) return 0
    return ((value - min) / (max - min)) * 100
  }

  // Handle slider thumb drag
  const handleThumbDrag = (e, thumbType) => {
    if (!sliderTrackRef.current) return

    // Always use our fixed price range for the bounds
    const fixedMin = FIXED_PRICE_RANGE.min
    const fixedMax = FIXED_PRICE_RANGE.max

    // Get slider track dimensions
    const trackRect = sliderTrackRef.current.getBoundingClientRect()
    const trackWidth = trackRect.width
    const trackLeft = trackRect.left

    // Calculate position as percentage of track width
    const position = Math.max(0, Math.min(100, ((e.clientX - trackLeft) / trackWidth) * 100))

    // Calculate new value based on position percentage
    const range = fixedMax - fixedMin
    let newValue = Math.round(fixedMin + (range * position) / 100)

    // Use a fixed minimum gap of 1 instead of a percentage
    const minGap = 1

    // Ensure values stay within bounds and min < max with a small fixed gap
    if (thumbType === "min") {
      // For min thumb, ensure it doesn't exceed max - minGap
      newValue = Math.min(newValue, localPriceRange.max - minGap)
      setLocalPriceRange((prev) => ({ ...prev, min: newValue }))
    } else {
      // For max thumb, ensure it doesn't go below min + minGap
      newValue = Math.max(newValue, localPriceRange.min + minGap)
      setLocalPriceRange((prev) => ({ ...prev, max: newValue }))
    }

    // Mark that we have a pending price change that needs to be applied
    setPendingPriceChange(true)
  }

  // Handle mouse down on thumb
  const handleThumbMouseDown = (e, thumbType) => {
    e.preventDefault()
    setIsDragging(true)

    const handleMouseMove = (moveEvent) => {
      handleThumbDrag(moveEvent, thumbType)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      setIsDragging(false)
      // Don't automatically apply the price range here
      // Just keep the pendingPriceChange flag true so user can click "Go"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle touch events for mobile
  const handleThumbTouchStart = (e, thumbType) => {
    e.preventDefault()
    setIsDragging(true)

    const touch = e.touches[0]

    const handleTouchMove = (moveEvent) => {
      const touchMove = moveEvent.touches[0]
      const touchX = touchMove.clientX

      // Create a synthetic mouse event-like object
      const syntheticEvent = {
        clientX: touchX,
        preventDefault: () => {},
      }

      handleThumbDrag(syntheticEvent, thumbType)
    }

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      setIsDragging(false)
      // Don't automatically apply the price range here
      // Just keep the pendingPriceChange flag true so user can click "Go"
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
  }

  // Apply price range changes and trigger API call
  const applyPriceRange = () => {
    if (!pendingPriceChange) return

    setIsApplyingPrice(true)

    // Only update if values have actually changed
    if (localPriceRange.min !== priceRange.min || localPriceRange.max !== priceRange.max) {
      // Scroll to top when price range changes
      window.scrollTo({ top: 0, behavior: "auto" })

      // Update the store with the new price range
      setPriceRange({
        min: localPriceRange.min,
        max: localPriceRange.max,
      })

      setCurrentPage(1) // Reset to first page

      // Update the previous filters ref
      prevFiltersRef.current = {
        ...prevFiltersRef.current,
        priceRange: { ...localPriceRange },
      }

      // Clear the product cache when price range changes
      clearProductCache()

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["products"],
        exact: false,
        refetchType: "active",
      })
    }

    // Reset the pending flag after applying
    setPendingPriceChange(false)

    setTimeout(() => {
      setIsApplyingPrice(false)
    }, 500)
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Determine which subcategories to show based on category selection
  const subcategoriesToShow = selectedCategory
    ? availableSubcategories.filter((s) => s.category_id === selectedCategory)
    : availableSubcategories

  // Show only 4 subcategories initially as requested
  const displayedSubcategories = showAllSubcategories ? subcategoriesToShow : subcategoriesToShow.slice(0, 4)

  // Limit displayed categories unless "show all" is toggled
  const displayedCategories = showAllCategories ? availableCategories : availableCategories.slice(0, 5)

  // Format price for display
  const formatPrice = (price) => {
    // Handle null or undefined price values
    if (price === null || price === undefined) {
      return "₹0"
    }
    return `₹${price.toLocaleString()}`
  }

  // Handle category selection/deselection
  const handleCategoryChange = (categoryId) => {
    if (selectedCategory === categoryId) {
      // If the same category is clicked again (unchecked), set to null
      setSelectedCategory(null)
      setCurrentPage(1) // Reset to first page
    } else {
      // If a new category is selected
      setSelectedCategory(categoryId)

      // Clear all selected subcategories when selecting a new category
      clearSelectedSubcategories()

      setCurrentPage(1) // Reset to first page
    }

    // Scroll to top when category changes
    window.scrollTo({ top: 0, behavior: "auto" })

    // Clear the product cache when category changes
    clearProductCache()

    // Invalidate queries to refresh the data - but only once after state updates
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
        exact: false,
        refetchType: "active",
      })
    }, 50)
  }

  // Handle subcategory selection/deselection
  const handleSubcategoryChange = (subcategoryId) => {
    // Find the subcategory to get its parent category
    const subcategory = availableSubcategories.find((s) => s.id === subcategoryId)

    if (!subcategory) return

    // If a category is already selected, only allow toggling subcategories from that category
    if (selectedCategory !== null && subcategory.category_id !== selectedCategory) {
      return
    }

    // Toggle the subcategory selection
    toggleSubcategory(subcategoryId)
    setCurrentPage(1) // Reset to first page

    // Scroll to top when subcategory changes
    window.scrollTo({ top: 0, behavior: "auto" })

    // Clear the product cache when subcategory changes
    clearProductCache()

    // Invalidate queries to refresh the data - but only once after state updates
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
        exact: false,
        refetchType: "active",
      })
    }, 50)
  }

  return (
    <div className="bg-white rounded-lg shadow-md relative max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100 shadow-sm flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <button
          onClick={handleResetFilters}
          className="text-sm text-[#d3ae6e] hover:text-[#b08c4d] flex items-center transition-colors"
        >
          <X size={14} className="mr-1" />
          Clear All
        </button>
      </div>

      {/* Filter content with padding */}
      <div className="p-4 pt-2">
        {/* Categories */}
        <div className="mb-5 border-b border-gray-200 pb-5">
          <button
            onClick={() => toggleSection("categories")}
            className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
          >
            <span className="text-base">Categories</span>
            {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2.5 mt-2"
            >
              {isLoadingFilters ? (
                // Loading skeleton
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex items-center animate-pulse">
                      <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))
              ) : availableCategories.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No categories available</p>
              ) : (
                <>
                  {displayedCategories.map((category) => (
                    <div key={category.id} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={selectedCategory === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#d3ae6e] focus:ring-[#d3ae6e]"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 text-sm text-gray-700 flex-1 cursor-pointer group-hover:text-[#d3ae6e] transition-colors"
                      >
                        {category.name}
                      </label>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {category.product_count || ""}
                      </span>
                    </div>
                  ))}

                  {/* Show more/less button */}
                  {availableCategories.length > 5 && (
                    <button
                      onClick={toggleShowAllCategories}
                      className="text-sm text-[#d3ae6e] hover:text-[#b08c4d] mt-3 flex items-center transition-colors"
                    >
                      {showAllCategories ? (
                        <>
                          Show Less <ChevronUp size={14} className="ml-1" />
                        </>
                      ) : (
                        <>
                          Show More <ChevronDown size={14} className="ml-1" />
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Subcategories */}
        <div className="mb-5 border-b border-gray-200 pb-5">
          <button
            onClick={() => toggleSection("subcategories")}
            className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
          >
            <span className="text-base">Subcategories</span>
            {expandedSections.subcategories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {expandedSections.subcategories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2.5 mt-2"
            >
              {isLoadingFilters ? (
                // Loading skeleton
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex items-center animate-pulse">
                      <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))
              ) : subcategoriesToShow.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  {selectedCategory ? "No subcategories found for this category" : "No subcategories available"}
                </p>
              ) : (
                <>
                  {displayedSubcategories.map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center group">
                      <input
                        type="checkbox"
                        id={`subcategory-${subcategory.id}`}
                        checked={selectedSubcategories.includes(subcategory.id)}
                        onChange={() => handleSubcategoryChange(subcategory.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#d3ae6e] focus:ring-[#d3ae6e]"
                      />
                      <label
                        htmlFor={`subcategory-${subcategory.id}`}
                        className="ml-2 text-sm text-gray-700 flex-1 cursor-pointer group-hover:text-[#d3ae6e] transition-colors"
                      >
                        {subcategory.name}
                        {!selectedCategory && subcategory.category_name && (
                          <span className="ml-1 text-xs text-gray-500">({subcategory.category_name})</span>
                        )}
                      </label>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {subcategory.product_count || ""}
                      </span>
                    </div>
                  ))}

                  {/* Show more/less button */}
                  {subcategoriesToShow.length > 4 && (
                    <button
                      onClick={toggleShowAllSubcategories}
                      className="text-sm text-[#d3ae6e] hover:text-[#b08c4d] mt-3 flex items-center transition-colors"
                    >
                      {showAllSubcategories ? (
                        <>
                          Show Less <ChevronUp size={14} className="ml-1" />
                        </>
                      ) : (
                        <>
                          Show More <ChevronDown size={14} className="ml-1" />
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-5">
          <button
            onClick={() => toggleSection("price")}
            className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
          >
            <span className="text-base">Price</span>
            {expandedSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 mt-4"
            >
              {/* Price display */}
              <div className="text-sm font-medium text-gray-700 mb-2">
                <span>
                  {formatPrice(localPriceRange.min)} – {formatPrice(localPriceRange.max)}
                  {localPriceRange.max === FIXED_PRICE_RANGE.max ? "+" : ""}
                </span>
              </div>

              {/* Custom slider implementation */}
              <div className="relative py-4">
                {/* Slider track */}
                <div
                  ref={sliderTrackRef}
                  className="absolute h-1 bg-gray-200 rounded-full w-full top-1/2 transform -translate-y-1/2"
                >
                  {/* Active track */}
                  <div
                    className="absolute h-1 bg-[#d3ae6e] rounded-full"
                    style={{
                      left: `${calculateThumbPosition(
                        localPriceRange.min,
                        FIXED_PRICE_RANGE.min,
                        FIXED_PRICE_RANGE.max,
                      )}%`,
                      width: `${
                        calculateThumbPosition(localPriceRange.max, FIXED_PRICE_RANGE.min, FIXED_PRICE_RANGE.max) -
                        calculateThumbPosition(localPriceRange.min, FIXED_PRICE_RANGE.min, FIXED_PRICE_RANGE.max)
                      }%`,
                    }}
                  ></div>
                </div>

                {/* Min thumb */}
                <div
                  ref={minThumbRef}
                  className="absolute w-5 h-5 bg-[#d3ae6e] border-2 border-white rounded-full shadow cursor-pointer top-1/2 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  style={{
                    left: `${calculateThumbPosition(
                      localPriceRange.min,
                      FIXED_PRICE_RANGE.min,
                      FIXED_PRICE_RANGE.max,
                    )}%`,
                    zIndex: isDragging ? 30 : 20,
                  }}
                  onMouseDown={(e) => handleThumbMouseDown(e, "min")}
                  onTouchStart={(e) => handleThumbTouchStart(e, "min")}
                  tabIndex={0}
                  role="slider"
                  aria-valuemin={FIXED_PRICE_RANGE.min}
                  aria-valuemax={FIXED_PRICE_RANGE.max}
                  aria-valuenow={localPriceRange.min}
                ></div>

                {/* Max thumb */}
                <div
                  ref={maxThumbRef}
                  className="absolute w-5 h-5 bg-[#d3ae6e] border-2 border-white rounded-full shadow cursor-pointer top-1/2 transform -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  style={{
                    left: `${calculateThumbPosition(
                      localPriceRange.max,
                      FIXED_PRICE_RANGE.min,
                      FIXED_PRICE_RANGE.max,
                    )}%`,
                    zIndex: isDragging ? 30 : 20,
                  }}
                  onMouseDown={(e) => handleThumbMouseDown(e, "max")}
                  onTouchStart={(e) => handleThumbTouchStart(e, "max")}
                  tabIndex={0}
                  role="slider"
                  aria-valuemin={FIXED_PRICE_RANGE.min}
                  aria-valuemax={FIXED_PRICE_RANGE.max}
                  aria-valuenow={localPriceRange.max}
                ></div>
              </div>

              {/* Go button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={applyPriceRange}
                  disabled={isApplyingPrice || isLoadingFilters || !pendingPriceChange}
                  className={`px-4 py-1 rounded-full text-sm font-medium border ${
                    isApplyingPrice || !pendingPriceChange
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                  } transition-colors`}
                >
                  {isApplyingPrice ? "Applying..." : "Go"}
                </button>
              </div>

              {pendingPriceChange && (
                <p className="text-xs text-[#d3ae6e] text-center">Click "Go" to apply price filter</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Active Filters Summary */}
        {(selectedCategory ||
          selectedSubcategories.length > 0 ||
          (priceRange.min !== null && FIXED_PRICE_RANGE.min !== null && priceRange.min > FIXED_PRICE_RANGE.min) ||
          (priceRange.max !== null && FIXED_PRICE_RANGE.max !== null && priceRange.max < FIXED_PRICE_RANGE.max)) && (
          <div className="mt-6 pt-5 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedCategory && availableCategories.find((c) => c.id === selectedCategory) && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#d3ae6e]/10 text-[#d3ae6e]">
                  {availableCategories.find((c) => c.id === selectedCategory).name}
                  <button
                    onClick={() => handleCategoryChange(selectedCategory)}
                    className="ml-1.5 hover:text-[#b08c4d]"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {selectedSubcategories.length > 0 && (
                <>
                  {selectedSubcategories.map((subcategoryId) => {
                    const subcategory = availableSubcategories.find((s) => s.id === subcategoryId)
                    if (!subcategory) return null

                    return (
                      <span
                        key={subcategoryId}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#d3ae6e]/10 text-[#d3ae6e] mr-2 mb-2"
                      >
                        {subcategory.name}
                        <button
                          onClick={() => handleSubcategoryChange(subcategoryId)}
                          className="ml-1.5 hover:text-[#b08c4d]"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  })}
                </>
              )}

              {/* Price range filter tag */}
              {(priceRange.min !== null && FIXED_PRICE_RANGE.min !== null && priceRange.min > FIXED_PRICE_RANGE.min) ||
              (priceRange.max !== null && FIXED_PRICE_RANGE.max !== null && priceRange.max < FIXED_PRICE_RANGE.max) ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#d3ae6e]/10 text-[#d3ae6e]">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  <button
                    onClick={() => {
                      // Only update if values have actually changed and are not null
                      if (
                        FIXED_PRICE_RANGE.min !== null &&
                        FIXED_PRICE_RANGE.max !== null &&
                        (priceRange.min !== FIXED_PRICE_RANGE.min || priceRange.max !== FIXED_PRICE_RANGE.max)
                      ) {
                        setLocalPriceRange(FIXED_PRICE_RANGE)
                        setPriceRange(FIXED_PRICE_RANGE)
                        setCurrentPage(1) // Reset to first page
                        setPendingPriceChange(false)

                        // Clear the product cache when price range resets
                        clearProductCache()

                        // Invalidate queries to refresh the data
                        setTimeout(() => {
                          queryClient.invalidateQueries({
                            queryKey: ["products"],
                            exact: false,
                            refetchType: "active",
                          })
                        }, 50)
                      }
                    }}
                    className="ml-1.5 hover:text-[#b08c4d]"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductFilter
