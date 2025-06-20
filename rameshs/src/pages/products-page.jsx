"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import { Filter, Search, AlertTriangle, PackageOpen, RefreshCw, ChevronUp, X } from "lucide-react"
import useProductStore from "../store/productStore"
import { useInfiniteProducts } from "../hooks/useProducts"
import ProductFilter from "../components/products/product-filter"
import ProductCard from "../components/products/product-card"
import AddToCartPopup from "../components/cart/add-to-cart-popup"
import useCartStore from "../store/cartStore"
import { motion, AnimatePresence } from "framer-motion"
import ProductSort from "../components/products/product-sort"
import { getComprehensiveProducts } from "../services/product-service"

const ProductsPage = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const productsRef = useRef(null)
  const refetchTimeout = useRef(null)
  const prevSelectedCategoryRef = useRef(null)
  const loadMoreRef = useRef(null)

  const searchTimeout = useRef(null)

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategories,
    setSelectedSubcategories,
    priceRange,
    resetFilters,
    totalItems,
    setProductsBySubcategory,
    itemsPerPage,
    setTotalItems,
  } = useProductStore()

  const { addItem } = useCartStore()

  // State for popup
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  // This will fetch products for each selected subcategory
  const { productsBySubcategory, getAllProducts } = useProductStore()

  // Update the useEffect that fetches products for each subcategory
  useEffect(() => {
    // Skip if no subcategories are selected
    if (selectedSubcategories.length === 0) return

    // Set loading state
    setIsLoadingSubcategories(true)

    // Create a single function to fetch all subcategory products at once
    const fetchAllSubcategoryProducts = async () => {
      try {
        // Use the comprehensive API to fetch products for all subcategories at once
        const response = await getComprehensiveProducts({
          subcategory_id: selectedSubcategories,
          page: 1,
          limit: 50 * selectedSubcategories.length, // Get enough products for all subcategories
          // Don't include price range parameters if they're null
          min_price: priceRange.min !== null ? priceRange.min : null,
          max_price: priceRange.max !== null ? priceRange.max : null,
        })

        // Extract products from response
        let products = []
        if (response.data?.products?.items) {
          products = response.data.products.items
        }

        // Group products by subcategory
        const productsBySubcategoryMap = {}

        // Initialize with empty arrays for each subcategory
        selectedSubcategories.forEach((subcatId) => {
          productsBySubcategoryMap[subcatId] = []
        })

        // Distribute products to their respective subcategories
        products.forEach((product) => {
          if (product.subcategory_id && selectedSubcategories.includes(product.subcategory_id)) {
            productsBySubcategoryMap[product.subcategory_id].push(product)
          }
        })

        // Store products for each subcategory
        let totalProductCount = 0
        Object.entries(productsBySubcategoryMap).forEach(([subcategoryId, subcatProducts]) => {
          setProductsBySubcategory(Number(subcategoryId), subcatProducts)
          totalProductCount += subcatProducts.length
        })

        // Update total items count
        setTotalItems(totalProductCount)

        // Finish loading
        setIsLoadingSubcategories(false)
      } catch (error) {
        console.error(`Error fetching products for subcategories:`, error)
        setIsLoadingSubcategories(false)
      }
    }

    // Reset total items when starting a new fetch
    setTotalItems(0)

    // Make a single API call for all subcategories
    fetchAllSubcategoryProducts()

    // Cleanup function
    return () => {
      // Any cleanup needed
    }
  }, [selectedSubcategories, setProductsBySubcategory, setTotalItems, priceRange])

  // Sync URL with store state on initial load
  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(location.search)
    const queryFromUrl = params.get("q") || ""
    const categoryFromUrl = params.get("category") || null
    const subcategoryParam = params.get("subcategory")

    // If subcategory parameter exists, set it in the store
    if (subcategoryParam) {
      // Handle comma-separated subcategory IDs
      const subcategoryIds = subcategoryParam.split(",").map((id) => Number(id))
      setSelectedSubcategories(subcategoryIds)
    }

    if (queryFromUrl) setSearchQuery(queryFromUrl)
    if (categoryFromUrl) setSelectedCategory(Number.parseInt(categoryFromUrl, 10))

    setSearchTerm(queryFromUrl)
  }, [location.search, setSearchQuery, setSelectedCategory, setSelectedSubcategories])

  // Update URL when store state changes
  useEffect(() => {
    const params = new URLSearchParams()

    // Only add search query if it's not empty and not "0"
    if (searchQuery && searchQuery.trim() && searchQuery.trim() !== "0") {
      params.set("q", searchQuery)
    }

    if (selectedCategory) params.set("category", selectedCategory.toString())

    // Add subcategory to URL if it exists
    if (selectedSubcategories && selectedSubcategories.length > 0) {
      params.set("subcategory", selectedSubcategories.join(","))
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: true },
    )
  }, [searchQuery, selectedCategory, selectedSubcategories, navigate, location.pathname])

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch products using the comprehensive API
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchProducts,
  } = useInfiniteProducts(selectedSubcategories.length === 0) // Only enable when not using subcategories

  // Use the appropriate data source based on which API was called
  const isLoading = isProductsLoading || isLoadingSubcategories

  // Modify the handleRefetchProducts function to use a single API call
  const handleRefetchProducts = () => {
    // Add a debounce to prevent multiple rapid refetches
    if (refetchTimeout.current) {
      clearTimeout(refetchTimeout.current)
    }

    refetchTimeout.current = setTimeout(async () => {
      if (selectedSubcategories.length > 0) {
        // For subcategories, make a single API call for all subcategories
        setIsLoadingSubcategories(true)

        const fetchAllSubcategoryProducts = async () => {
          try {
            const response = await getComprehensiveProducts({
              subcategory_id: selectedSubcategories,
              page: 1,
              limit: 50 * selectedSubcategories.length,
            })

            // Extract products from response
            let products = []
            if (response.data?.products?.items) {
              products = response.data.products.items
            }

            // Group products by subcategory
            const productsBySubcategoryMap = {}

            // Initialize with empty arrays for each subcategory
            selectedSubcategories.forEach((subcatId) => {
              productsBySubcategoryMap[subcatId] = []
            })

            // Distribute products to their respective subcategories
            products.forEach((product) => {
              if (product.subcategory_id && selectedSubcategories.includes(product.subcategory_id)) {
                productsBySubcategoryMap[product.subcategory_id].push(product)
              }
            })

            // Store products for each subcategory
            let totalProductCount = 0
            Object.entries(productsBySubcategoryMap).forEach(([subcategoryId, subcatProducts]) => {
              setProductsBySubcategory(Number(subcategoryId), subcatProducts)
              totalProductCount += subcatProducts.length
            })

            // Update total items count
            setTotalItems(totalProductCount)

            // Finish loading
            setIsLoadingSubcategories(false)
          } catch (error) {
            console.error(`Error refetching products for subcategories:`, error)
            setIsLoadingSubcategories(false)
          }
        }

        fetchAllSubcategoryProducts()
      } else if (searchQuery) {
        // If there's a search query, use the comprehensive API endpoint
        try {
          const searchResults = await getComprehensiveProducts({
            q: searchQuery,
            page: 1,
            limit: itemsPerPage,
          })

          if (searchResults.status === "success" && searchResults.data) {
            // Update the total items count
            if (searchResults.data.products) {
              setTotalItems(searchResults.data.products.total || 0)
            }
          }
        } catch (error) {
          console.error("Search error during refetch:", error)
          // Show toast error instead of unmounting products
          window.showToast({
            title: "Search Error",
            description: "Could not find products matching your search. Showing existing products instead.",
            type: "error",
            duration: 5000,
          })
        }

        // Still call the regular refetch to update the UI
        refetchProducts()
      } else {
        refetchProducts()
      }
    }, 300)
  }

  // Force refetch when selectedCategory changes to null (unchecked)
  useEffect(() => {
    // Only refetch when selectedCategory changes from a value to null
    // and only if we're not already loading
    if (selectedCategory === null && !isLoading && prevSelectedCategoryRef.current !== null) {
      handleRefetchProducts()
    }
    prevSelectedCategoryRef.current = selectedCategory
  }, [selectedCategory, isLoading])

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchQuery("")
    // Force refetch after clearing search
    setTimeout(() => {
      handleRefetchProducts()
    }, 100)
  }

  // Intersection Observer to detect when the user scrolls to the bottom
  // Only use this for regular product loading, not for subcategories
  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries
      // Only trigger infinite scroll if no subcategories are selected
      if (
        entry.isIntersecting &&
        !isLoading &&
        !isFetchingNextPage &&
        hasNextPage &&
        selectedSubcategories.length === 0
      ) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, selectedSubcategories.length],
  )

  // Set up Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "0px 0px 300px 0px",
    })

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [handleObserver])

  // Update the allProducts variable to use the combined products when subcategories are selected
  const allProducts =
    selectedSubcategories.length > 0
      ? (() => {
          const products = getAllProducts()
          return Array.isArray(products) ? products : []
        })()
      : productsData?.pages?.flatMap((page) => page.products || []) || []

  // Handle showing the popup
  const handleShowPopup = (product) => {
    setSelectedProduct(product)
    setShowPopup(true)
  }

  // Handle adding to cart from popup
  const handlePopupAddToCart = async () => {
    setIsAddingToCart(true)

    try {
      // Get the product and variant details
      const product = selectedProduct
      const variant = product.variants?.find((v) => v.id === selectedProduct.variants[0]?.id) || product.variants?.[0]

      const cartItem = {
        name: product.name,
        image: product.images?.[0] || "",
        price: variant?.price || product.price,
        tax_rate: product.tax_rate || 5,
        variant: variant
          ? {
              id: variant.id,
              name: variant.variant_name || variant.weight,
              price: variant.price,
            }
          : null,
      }

      // Add the item to the cart using the store method
      const result = await addItem({
        id: product.id,
        quantity: 1,
        selectedVariant: { id: variant?.id || 0 },
        ...cartItem,
      })

      if (result.success) {
        setIsAddingToCart(false)
        setIsAddedToCart(true)

        // Reset after a short delay
        setTimeout(() => {
          setIsAddedToCart(false)
          setShowPopup(false)
          setSelectedProduct(null)
        }, 1500)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      setIsAddingToCart(false)
    }
  }

  // Get total items count from appropriate source
  const getTotalItems = () => {
    if (productsData?.pages?.[0]?.pagination?.total) {
      return productsData.pages[0].pagination.total
    }
    if (totalItems) {
      return totalItems
    }
    return allProducts.length
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // New function to scroll to top with immediate behavior
  const scrollToTopImmediate = () => {
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f3] to-white">
      <Helmet>
        <title>Our Collection | Ramesh Sweets</title>
        <meta
          name="description"
          content="Discover our exquisite collection of traditional Indian sweets and delicacies."
        />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filters Toggle */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h1 className="text-2xl font-medium text-gray-900">Our Collection</h1>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm"
          >
            <Filter size={18} className="text-[#d3ae6e]" />
            <span>{mobileFiltersOpen ? "Hide Filters" : "Show Filters"}</span>
          </button>
        </div>

        {/* Desktop Title (Hidden on Mobile) */}
        <div className="hidden md:flex justify-between items-center mb-1">
          <div className="flex items-center gap-4">
            {searchQuery && (
              <div className="flex items-center gap-2 bg-[#d3ae6e]/10 px-4 py-2 rounded-full">
                <span className="text-gray-700 font-serif">
                  Search results for: <span className="font-medium">{searchQuery}</span>
                </span>
                <button onClick={resetFilters} className="text-[#d3ae6e] hover:text-[#b08c4d]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Left Side */}
          <div
            className={`${mobileFiltersOpen ? "block" : "hidden"} md:block md:w-1/4 lg:w-1/5 sticky top-[70px] self-start`}
          >
            <ProductFilter />
          </div>

          {/* Products - Right Side */}
          <div ref={productsRef} className="w-full md:w-3/4 lg:w-4/5">
            {/* Error state */}
            {isProductsError && !isLoadingSubcategories && selectedSubcategories.length === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Products</h3>
                <p className="text-red-600 mb-4">
                  {isProductsError.message || "There was a problem loading the products. Please try again later."}
                </p>
                <button
                  onClick={() => handleRefetchProducts()}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
              </div>
            )}

            {/* Empty state - now shown within the product grid area only */}
            {!isLoading && !isProductsError && allProducts.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center mt-4">
                <div className="flex justify-center mb-4">
                  <PackageOpen className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? `We couldn't find any products matching "${searchQuery}".`
                    : "We couldn't find any products matching your criteria."}
                </p>
                <button
                  onClick={() => {
                    resetFilters()
                    // Add a small delay to ensure state updates have completed
                    setTimeout(() => {
                      handleRefetchProducts()
                    }, 300)
                  }}
                  className="bg-[#d3ae6e] hover:bg-[#c19c5d] text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Loading state for subcategories */}
            {isLoadingSubcategories && selectedSubcategories.length > 0 && (
              <div className="mb-6 flex flex-col items-center py-8">
                <div className="w-12 h-12 border-4 border-[#d3ae6e] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-center">
                  Loading products from {selectedSubcategories.length} subcategories...
                </p>
              </div>
            )}

            {/* Search and controls section */}
            <div className="mb-6">
              <div className="relative w-full md:max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchTerm(value)

                    // Clear search if input is empty
                    if (value === "") {
                      handleClearSearch()
                      return
                    }

                    // Debounce search as user types
                    clearTimeout(searchTimeout.current)
                    searchTimeout.current = setTimeout(async () => {
                      // Validate search term before setting
                      const trimmedValue = value.trim()

                      // Special case for "0" - silently do nothing
                      if (trimmedValue === "0") {
                        return
                      }

                      if (trimmedValue) {
                        // Scroll to top when search is performed
                        scrollToTopImmediate()

                        setSearchQuery(trimmedValue)

                        try {
                          // Use the comprehensive API endpoint
                          const searchResults = await getComprehensiveProducts({
                            q: trimmedValue,
                            page: 1,
                            limit: itemsPerPage,
                          })

                          if (searchResults.status === "success" && searchResults.data) {
                            // Update the total items count
                            if (searchResults.data.products) {
                              setTotalItems(searchResults.data.products.total || 0)
                            }

                            // Force a refetch to update the UI with search results
                            handleRefetchProducts()
                          }
                        } catch (error) {
                          console.error("Search error:", error)
                          // Show toast error but keep current products visible
                          window.showToast({
                            title: "Search Error",
                            description:
                              "Could not find products matching your search. Showing existing products instead.",
                            type: "error",
                            duration: 5000,
                          })
                        }
                      }
                    }, 500)
                  }}
                  placeholder="Search for sweets, gift boxes, etc."
                  className="w-full py-2 pl-10 pr-10 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Product count and controls */}
            <div className="flex justify-between items-center mb-6">
              {/* Product count on the left */}
              <div className="text-sm text-gray-500">
                {!isLoading && (
                  <>
                    Showing <span className="font-medium text-gray-900">{allProducts.length}</span> of{" "}
                    <span className="font-medium text-gray-900">{getTotalItems()}</span> products
                    {selectedSubcategories.length > 0 && (
                      <span className="ml-2 text-[#d3ae6e]">from {selectedSubcategories.length} subcategories</span>
                    )}
                    {searchQuery && (
                      <span className="ml-2 text-[#d3ae6e]">
                        (Search results for "<span className="font-medium">{searchQuery}</span>")
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Refresh button and sort on the right */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefetchProducts}
                  className="text-[#d3ae6e] hover:text-[#b08c4d] p-1 rounded-full hover:bg-[#d3ae6e]/10 transition-colors"
                  title="Refresh products"
                >
                  <RefreshCw size={18} />
                </button>

                {/* Product Sort positioned on the right */}
                <ProductSort />
              </div>
            </div>

            {/* Initial loading state */}
            {isLoading && !isLoadingSubcategories && !allProducts.length && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 h-80">
                    <div className="animate-pulse flex flex-col h-full">
                      <div className="rounded-md bg-gray-200 h-40 w-full mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-full mt-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid of products */}
            {allProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {allProducts.map((product, index) => (
                    <motion.div
                      key={`${product.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 1) }}
                    >
                      <ProductCard product={product} onShowPopup={handleShowPopup} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Loading more indicator - only show for infinite scroll (not subcategories) */}
            {selectedSubcategories.length === 0 && (
              <div ref={loadMoreRef} className="w-full flex justify-center py-8 mt-4">
                {isFetchingNextPage && (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-2 border-[#d3ae6e] border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">Loading more products...</p>
                  </div>
                )}

                {!hasNextPage && allProducts.length > 0 && !isFetchingNextPage && (
                  <p className="text-sm text-gray-500 italic border-t border-gray-200 pt-4 w-full text-center">
                    You've reached the end of our collection
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-[#d3ae6e] text-white p-3 rounded-full shadow-lg hover:bg-[#c19c5d] transition-colors z-50"
            aria-label="Scroll to top"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Add to Cart Popup */}
      {showPopup && selectedProduct && (
        <AddToCartPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          product={selectedProduct}
          onAddToCart={handlePopupAddToCart}
          isAddingToCart={isAddingToCart}
          isAddedToCart={isAddedToCart}
        />
      )}
    </div>
  )
}

export default ProductsPage
