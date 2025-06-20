"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowLeft, Package, AlertCircle, Tag, Edit, Eye, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import productService from "../../services/productService"
import { buildImageUrl } from "../../config/api.config"

const SKUSearch = () => {
  const navigate = useNavigate()
  const [skuQuery, setSkuQuery] = useState("")
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Format price
  const formatPrice = (price) => {
    if (!price || isNaN(Number.parseFloat(price))) {
      return "Price not set"
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number.parseFloat(price))
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  // Debounce function
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [value, delay])

    return debouncedValue
  }

  // Debounce the search query
  const debouncedSkuQuery = useDebounce(skuQuery, 500)

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!debouncedSkuQuery.trim()) {
      setProducts([])
      setSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)
    setSelectedProduct(null)
    setShowModal(false)

    try {
      const response = await productService.searchProductsBySku(debouncedSkuQuery.trim())

      if (response.status === "success") {
        setProducts(response.data || [])
        // Add to search history only on successful search
        if (response.data && response.data.length > 0) {
          addToSearchHistory(debouncedSkuQuery.trim())
        }
      } else {
        setError(response.message || "Failed to search products")
        setProducts([])
      }
    } catch (err) {
      setError(err.message || "An error occurred while searching")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSkuQuery])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSkuQuery) {
      handleSearch()
    }
  }, [debouncedSkuQuery, handleSearch])

  // Navigate to product details
  const viewProduct = (id) => {
    navigate(`/products/${id}`)
  }

  // Navigate to edit product
  const editProduct = (id, e) => {
    e.stopPropagation()
    navigate(`/products/${id}/edit`)
  }

  // Show product details
  const showProductDetails = (product, e) => {
    e?.stopPropagation()
    setSelectedProduct(product)
    setShowModal(true)
  }

  // Close product details
  const closeProductDetails = () => {
    setShowModal(false)
    setTimeout(() => setSelectedProduct(null), 300) // Clear after animation
  }

  // Highlight SKU in text
  const highlightSku = (text) => {
    if (!skuQuery || !text) return text

    const regex = new RegExp(`(${skuQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<span class="bg-yellow-200 text-yellow-800">$1</span>')
  }

  // Load search history
  const [searchHistory, setSearchHistory] = useState([])

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("sku_search_history") || "[]")
    setSearchHistory(history)
  }, [])

  const addToSearchHistory = (sku) => {
    const history = JSON.parse(localStorage.getItem("sku_search_history") || "[]")

    // Remove if already exists (to avoid duplicates)
    const filteredHistory = history.filter((item) => item !== sku)

    // Add to the beginning of the array
    filteredHistory.unshift(sku)

    // Limit history size to 10 items
    const newHistory = filteredHistory.slice(0, 10)

    // Save to localStorage
    localStorage.setItem("sku_search_history", JSON.stringify(newHistory))

    // Update state
    setSearchHistory(newHistory)
  }

  const handleHistoryItemClick = (sku) => {
    setSkuQuery(sku)
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "inactive":
        return "bg-amber-100 text-amber-800 border-amber-300"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeProductDetails()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showModal])

  // Format weight with proper decimal handling
  const formatWeight = (weight, unit) => {
    if (!weight || isNaN(Number.parseFloat(weight))) {
      return "N/A"
    }

    const numWeight = Number.parseFloat(weight)

    // Remove unnecessary decimal places
    const formattedWeight = numWeight % 1 === 0 ? numWeight.toString() : numWeight.toFixed(3).replace(/\.?0+$/, "")

    return `${formattedWeight}${unit || "g"}`
  }

  // Check if current user can see system information (only super admin)
  const canViewSystemInfo = () => {
    // Get user from auth context or localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    // Only show system info to super admin or specific roles
    return user.role === "super_admin" || user.id === 1 // Adjust based on your role system
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/products")}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-ramesh-gold"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
          <Package className="h-6 w-6 mr-2 text-ramesh-gold" />
          Search Products by SKU
        </h1>
        <p className="text-gray-600 text-sm">Find products using their unique SKU identifier</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter product SKU..."
                className="block w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent text-sm"
                value={skuQuery}
                onChange={(e) => setSkuQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center text-xs">
                <label htmlFor="limitSelect" className="text-gray-600 mr-1">
                  Results limit:
                </label>
                <select
                  id="limitSelect"
                  className="text-xs border border-gray-300 rounded px-1 py-0.5"
                  defaultValue="50"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-200 shadow-sm text-sm">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex">
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-5 w-3/4 bg-gray-200" />
                      <Skeleton className="h-3 w-1/2 bg-gray-100" />
                      <Skeleton className="h-3 w-1/3 bg-gray-100" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-20 bg-gray-200" />
                      <Skeleton className="h-7 w-20 rounded-md bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searched && products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-200">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 text-sm">
                No products match the SKU "{skuQuery}". Try a different SKU or check for typos.
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-1">Found {products.length} product(s) with matching SKUs</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => {
                  // Get the first variant or the one that matches the search
                  const matchingVariant =
                    product.variants?.find((v) => v.sku?.toLowerCase().includes(skuQuery.toLowerCase())) ||
                    product.variants?.[0]

                  // Get the primary image
                  const primaryImage = product.images?.find((img) => img.is_primary === 1) || product.images?.[0]

                  // Get the best price to display
                  const displayPrice = matchingVariant?.sale_price || matchingVariant?.price || product.price

                  return (
                    <div
                      key={product.id}
                      className="border rounded-lg overflow-hidden transition-all hover:shadow-md bg-white border-gray-200 cursor-pointer"
                      onClick={(e) => showProductDetails(product, e)}
                    >
                      <div className="p-4">
                        <div className="flex items-start space-x-3 mb-3">
                          {primaryImage ? (
                            <img
                              src={buildImageUrl(primaryImage.image_path) || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.style.display = "none"
                                e.target.nextElementSibling.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <div
                            className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200 flex-shrink-0"
                            style={{
                              display: primaryImage ? "none" : "flex",
                            }}
                          >
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="text-base font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                              <Badge
                                variant="outline"
                                className={`${getStatusBadge(product.status)} text-xs py-0 px-1.5 ml-2 flex-shrink-0`}
                              >
                                {product.status?.charAt(0).toUpperCase() + product.status?.slice(1) || "Active"}
                              </Badge>
                            </div>

                            <div className="mt-1">
                              <span className="text-xs font-semibold text-gray-700">SKU: </span>
                              <span
                                className="text-xs text-gray-700"
                                dangerouslySetInnerHTML={{
                                  __html: highlightSku(matchingVariant?.sku || "No SKU"),
                                }}
                              ></span>
                              {matchingVariant && (
                                <span className="text-xs text-gray-500 ml-2">({matchingVariant.variant_name})</span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <Tag className="h-3 w-3 mr-1 text-ramesh-gold" />
                                <span className="font-medium text-gray-600">
                                  {product.category?.name || "Uncategorized"}
                                </span>
                                {product.subcategory?.name && (
                                  <span className="ml-1 flex items-center">
                                    <span className="mx-1 text-gray-400">•</span>
                                    {product.subcategory.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                              <div className="flex flex-col">
                                {matchingVariant?.sale_price && matchingVariant.sale_price !== matchingVariant.price ? (
                                  <>
                                    <div className="text-sm font-medium text-ramesh-gold">
                                      {formatPrice(matchingVariant.sale_price)}
                                    </div>
                                    <div className="text-xs text-gray-500 line-through">
                                      {formatPrice(matchingVariant.price)}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm font-medium text-ramesh-gold">
                                    {displayPrice ? formatPrice(displayPrice) : "Price not set"}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    viewProduct(product.id)
                                  }}
                                  className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded text-xs transition-colors"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </button>
                                <button
                                  onClick={(e) => editProduct(product.id, e)}
                                  className="inline-flex items-center px-2 py-1 bg-ramesh-gold hover:bg-ramesh-gold/90 text-white font-medium rounded text-xs transition-colors"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Search History Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">Search History</h3>
            </div>
            <div className="p-0">
              {searchHistory.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">No search history</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {searchHistory.map((sku, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => handleHistoryItemClick(sku)}
                    >
                      {sku}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0">
              <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h3>
              <button
                onClick={closeProductDetails}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Product Header with Image */}
              <div className="flex items-start space-x-4 mb-6">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={
                      buildImageUrl(
                        selectedProduct.images.find((img) => img.is_primary)?.image_path ||
                          selectedProduct.images[0]?.image_path,
                      ) || "/placeholder.svg"
                    }
                    alt={selectedProduct.name}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = "none"
                      e.target.nextElementSibling.style.display = "flex"
                    }}
                  />
                ) : null}
                <div
                  className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200 flex-shrink-0"
                  style={{
                    display: selectedProduct.images && selectedProduct.images.length > 0 ? "none" : "flex",
                  }}
                >
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{selectedProduct.short_description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`${getStatusBadge(selectedProduct.status)} text-xs py-1 px-2`}>
                      {selectedProduct.status?.charAt(0).toUpperCase() + selectedProduct.status?.slice(1) || "Active"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`${selectedProduct.is_vegetarian === 1 ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"} text-xs py-1 px-2`}
                    >
                      {selectedProduct.is_vegetarian === 1 ? "Vegetarian" : "Non-Vegetarian"}
                    </Badge>
                    {selectedProduct.category && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs py-1 px-2">
                        {selectedProduct.category.name}
                      </Badge>
                    )}
                    {selectedProduct.subcategory && (
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-800 border-purple-300 text-xs py-1 px-2"
                      >
                        {selectedProduct.subcategory.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Product ID:</span>
                        <span className="text-xs text-gray-700">{selectedProduct.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Slug:</span>
                        <span className="text-xs text-gray-700">{selectedProduct.slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">HSN Code:</span>
                        <span className="text-xs text-gray-700">{selectedProduct.hsn_code || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Tax Rate:</span>
                        <span className="text-xs text-gray-700">
                          {selectedProduct.tax_rate ? `${selectedProduct.tax_rate}%` : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Shelf Life:</span>
                        <span className="text-xs text-gray-700">{selectedProduct.shelf_life || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">Display Order:</span>
                        <span className="text-xs text-gray-700">{selectedProduct.display_order}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  {selectedProduct.ingredients_array && selectedProduct.ingredients_array.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Ingredients</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedProduct.ingredients_array.map((ingredient, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 text-xs py-1 px-2"
                          >
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedProduct.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="bg-gray-50 text-gray-700 border-gray-200 text-xs py-1 px-2"
                          >
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* System Information - Only for super admin */}
                  {canViewSystemInfo() && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">System Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-gray-500">Created:</span>
                          <span className="text-xs text-gray-700">{formatDate(selectedProduct.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-gray-500">Created By:</span>
                          <span className="text-xs text-gray-700">{selectedProduct.created_by_name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-gray-500">Updated:</span>
                          <span className="text-xs text-gray-700">{formatDate(selectedProduct.updated_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-gray-500">Updated By:</span>
                          <span className="text-xs text-gray-700">{selectedProduct.updated_by_name || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Middle Column - Variants */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Product Variants ({selectedProduct.variants?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                        selectedProduct.variants.map((variant) => (
                          <div key={variant.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-sm font-medium text-gray-900">{variant.variant_name}</h5>
                              <Badge
                                variant="outline"
                                className={`${getStatusBadge(variant.status)} text-xs py-0 px-1.5`}
                              >
                                {variant.status?.charAt(0).toUpperCase() + variant.status?.slice(1)}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs font-medium text-gray-500">SKU:</span>
                                <span className="text-xs text-gray-700 font-mono">{variant.sku}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs font-medium text-gray-500">Price:</span>
                                <span className="text-xs text-gray-700">{formatPrice(variant.price)}</span>
                              </div>
                              {variant.sale_price && (
                                <div className="flex justify-between">
                                  <span className="text-xs font-medium text-gray-500">Sale Price:</span>
                                  <span className="text-xs text-ramesh-gold font-medium">
                                    {formatPrice(variant.sale_price)}
                                  </span>
                                </div>
                              )}
                              {variant.discount_percentage && (
                                <div className="flex justify-between">
                                  <span className="text-xs font-medium text-gray-500">Discount:</span>
                                  <span className="text-xs text-green-600">
                                    {Number.parseFloat(variant.discount_percentage).toFixed(1)}% off
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-xs font-medium text-gray-500">Weight:</span>
                                <span className="text-xs text-gray-700">
                                  {formatWeight(variant.weight, variant.weight_unit)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs font-medium text-gray-500">Order Qty:</span>
                                <span className="text-xs text-gray-700">
                                  {variant.min_order_quantity} - {variant.max_order_quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic">No variants available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Nutritional Info & Images */}
                <div className="space-y-6">
                  {/* Nutritional Information */}
                  {selectedProduct.nutritional_info_object &&
                    Object.keys(selectedProduct.nutritional_info_object).length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Nutritional Information (per 100g)</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedProduct.nutritional_info_object).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-xs font-medium text-gray-500 capitalize">{key}:</span>
                              <span className="text-xs text-gray-700">
                                {value}
                                {key === "calories" ? " kcal" : key === "sodium" ? "mg" : "g"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Storage Instructions */}
                  {selectedProduct.storage_instructions && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Storage Instructions</h4>
                      <p className="text-xs text-gray-700">{selectedProduct.storage_instructions}</p>
                    </div>
                  )}

                  {/* Product Images */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Product Images ({selectedProduct.images.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.images.map((image, index) => (
                          <div key={image.id} className="relative">
                            <img
                              src={buildImageUrl(image.image_path) || "/placeholder.svg"}
                              alt={`${selectedProduct.name} - Image ${index + 1}`}
                              className="w-full h-20 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = "none"
                              }}
                            />
                            {image.is_primary === 1 && (
                              <Badge className="absolute top-1 left-1 bg-ramesh-gold text-white text-xs py-0 px-1">
                                Primary
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tax Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Tax Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">CGST:</span>
                        <span className="text-xs text-gray-700">
                          {selectedProduct.cgst_rate ? `${selectedProduct.cgst_rate}%` : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">SGST:</span>
                        <span className="text-xs text-gray-700">
                          {selectedProduct.sgst_rate ? `${selectedProduct.sgst_rate}%` : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-500">IGST:</span>
                        <span className="text-xs text-gray-700">
                          {selectedProduct.igst_rate ? `${selectedProduct.igst_rate}%` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              {selectedProduct.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Full Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end sticky bottom-0">
              <button
                onClick={closeProductDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 mr-3"
              >
                Close
              </button>
              <button
                onClick={() => viewProduct(selectedProduct.id)}
                className="px-4 py-2 bg-ramesh-gold text-white rounded text-sm font-medium hover:bg-ramesh-gold/90"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SKUSearch
