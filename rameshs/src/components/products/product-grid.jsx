"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useProducts } from "../../hooks/useProducts"
import useProductStore from "../../store/productStore"
import ProductCard from "./product-card"
import ProductPagination from "./product-pagination"
import AddToCartPopup from "../cart/add-to-cart-popup"
import useCartStore from "../../store/cartStore"
import { AlertTriangle, PackageOpen } from "lucide-react"

const ProductGrid = () => {
  const {
    searchQuery,
    currentPage,
    itemsPerPage,
    selectedCategory,
    selectedSubcategories,
    productsBySubcategory,
    getAllProducts,
    setTotalItems,
    setTotalPages,
    resetFilters,
  } = useProductStore()

  const { addItem } = useCartStore()

  // State for popup
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  // Call the API hook with current filters
  const { data, isLoading, isError } = useProducts(true)

  useEffect(() => {
    // Update store with pagination data when available
    if (data?.totalItems) {
      setTotalItems(data.totalItems)
      setTotalPages(Math.ceil(data.totalItems / itemsPerPage))
    } else if (data?.data?.pagination?.total) {
      // Handle search response pagination
      setTotalItems(data.data.pagination.total)
      setTotalPages(data.data.pagination.last_page)
    }
  }, [data, itemsPerPage, setTotalItems, setTotalPages])

  // Extract products from the API response or from multiple subcategories
  const extractProducts = () => {
    // If we have selected subcategories, combine their products
    if (selectedSubcategories.length > 0) {
      const combinedProducts = getAllProducts()
      console.log(
        `ProductGrid: Combined ${combinedProducts.length} products from ${selectedSubcategories.length} subcategories`,
      )
      return combinedProducts
    }

    if (!data) return []

    // Handle search response structure (data.data.products is an array)
    if (data.data?.products && Array.isArray(data.data.products)) {
      return data.data.products
    }

    // Handle comprehensive API response structure (data.data.products.items)
    if (data.data?.products?.items) {
      return data.data.products.items
    }

    // Handle other possible structures
    if (Array.isArray(data)) return data
    if (data.products && Array.isArray(data.products)) return data.products
    if (data.data && Array.isArray(data.data)) return data.data
    if (data.items) return data.items
    if (data.results) return data.results

    // If we can't determine the structure, log it and return empty array
    console.error("Unknown API response structure:", data)
    return []
  }

  const products = extractProducts()

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

  // Loading state
  if (isLoading && selectedSubcategories.length === 0) {
    return (
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
    )
  }

  // Error state
  if (isError && selectedSubcategories.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Products</h3>
        <p className="text-red-600 mb-4">
          {isError.message || "There was a problem loading the products. Please try again later."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
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
          onClick={() => resetFilters()}
          className="bg-[#d3ae6e] hover:bg-[#c19c5d] text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Clear Filters
        </button>
      </div>
    )
  }

  // Get total items count from appropriate source
  const getTotalItems = () => {
    if (data?.data?.pagination?.total) {
      return data.data.pagination.total
    }
    if (data?.totalItems) {
      return data.totalItems
    }
    return products.length
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div>
      {/* Product grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {products.map((product, index) => (
          <motion.div key={`${product.id}-${index}`} variants={item} transition={{ duration: 0.3 }}>
            <ProductCard
              product={product}
              onShowPopup={handleShowPopup}
              isSearchResult={
                searchQuery &&
                (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (product.category && product.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (product.tags &&
                    product.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))))
              }
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination - only show if not using subcategory filters */}
      {(data?.data?.pagination?.last_page > 1 || data?.totalPages > 1) && selectedSubcategories.length === 0 && (
        <ProductPagination
          currentPage={currentPage}
          totalPages={data?.data?.pagination?.last_page || data?.totalPages || 1}
        />
      )}

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

export default ProductGrid
