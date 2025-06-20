"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useProduct } from "../../contexts/ProductContext"
import { useAuth } from "../../contexts/AuthContext"
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Package,
  Edit,
  Trash2,
  Tag,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  Calendar,
  Loader2,
  AlertTriangle,
  Copy,
} from "lucide-react"
import { useCategory } from "../../contexts/CategoryContext"
import { useSubcategory } from "../../contexts/SubcategoryContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import CategoryDropdown from "@/components/filters/CategoryDropdown"
import SubcategoryDropdown from "@/components/filters/SubcategoryDropdown"
import { Link } from "react-router-dom"

// Product List Item Component
const ListItem = ({ product, onView, onEdit, onDelete, onCopy, searchQuery, isSuperAdmin }) => {
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

  // Get variant price range
  const getVariantPriceRange = (variants) => {
    if (!variants || variants.length === 0) {
      return <span className="font-medium text-ramesh-gold">Price not set</span>
    }

    // Filter out variants with invalid prices
    const validVariants = variants.filter(
      (v) =>
        (v.sale_price && !isNaN(Number.parseFloat(v.sale_price)) && Number.parseFloat(v.sale_price) > 0) ||
        (v.price && !isNaN(Number.parseFloat(v.price)) && Number.parseFloat(v.price) > 0),
    )

    if (validVariants.length === 0) {
      return <span className="font-medium text-ramesh-gold">Price not set</span>
    }

    // Get min and max prices, preferring sale_price when available
    const prices = validVariants.map((v) => {
      if (v.sale_price && Number.parseFloat(v.sale_price) > 0) {
        return Number.parseFloat(v.sale_price)
      }
      return Number.parseFloat(v.price) || 0
    })

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    // If min and max are the same, show single price
    if (minPrice === maxPrice) {
      return <span className="font-medium text-ramesh-gold">{formatPrice(minPrice)}</span>
    }

    // Show price range
    return (
      <span className="font-medium text-ramesh-gold">
        {formatPrice(minPrice)} - {formatPrice(maxPrice)}
      </span>
    )
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-medium"
      case "inactive":
        return "bg-amber-100 text-amber-800 border-amber-300 font-medium"
      case "draft":
        return "bg-slate-100 text-slate-800 border-slate-300 font-medium"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 font-medium"
    }
  }

  // Check if product is deleted
  const isDeleted = product.deleted_at || false

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all hover:shadow-md cursor-pointer ${
        isDeleted ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
      }`}
      onClick={() => onView(product.id)}
    >
      <div className="flex items-center p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3
              className={`text-base font-medium truncate mr-2 ${isDeleted ? "text-gray-600" : "text-gray-900"}`}
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerm(product.name, searchQuery),
              }}
            ></h3>

            {product.is_featured && !isDeleted && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-300 mr-1.5 text-xs py-0 px-1.5"
              >
                Featured
              </Badge>
            )}

            {isDeleted ? (
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs py-0 px-1.5">
                Deleted
              </Badge>
            ) : (
              <Badge variant="outline" className={`${getStatusBadge(product.status)} text-xs py-0 px-1.5`}>
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <div className="flex items-center text-xs text-gray-500">
              <Tag className="h-3 w-3 mr-1 text-ramesh-gold" />
              <span className="font-medium text-gray-600">{product.category_name || "Uncategorized"}</span>
              {product.subcategory_name && (
                <span className="ml-1 flex items-center">
                  <span className="mx-1 text-gray-400">•</span>
                  {product.subcategory_name}
                </span>
              )}
            </div>

            {/* NEW: Product Type Badge */}
            <div className="flex items-center text-xs">
              <Badge
                variant="outline"
                className={`text-xs py-0 px-1.5 ${
                  product.product_type === "global"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : product.product_type === "local"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : product.product_type === "takeaway"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {product.product_type === "global"
                  ? "Global"
                  : product.product_type === "local"
                    ? "Local"
                    : product.product_type === "takeaway"
                      ? "Takeaway"
                      : product.product_type || "Global"}
              </Badge>
            </div>

            {/* NEW: Image Status Indicator */}
            <div className="flex items-center text-xs">
              {!product.images || product.images.length === 0 ? (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 text-xs py-0 px-1.5 flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  No Images
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 text-xs py-0 px-1.5 flex items-center gap-1"
                >
                  <Package className="h-3 w-3" />
                  {product.images.length} Image{product.images.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1 text-blue-500" />
              <span>Created: {formatDate(product.created_at)}</span>
            </div>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={`text-xs ${
                    searchQuery && tagMatchesSearch(tag.name, searchQuery)
                      ? "bg-yellow-200 text-yellow-900 border-yellow-400 font-medium shadow-sm"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  } py-0 px-1.5`}
                  dangerouslySetInnerHTML={{
                    __html:
                      searchQuery && tagMatchesSearch(tag.name, searchQuery)
                        ? highlightSearchTerm(tag.name, searchQuery)
                        : tag.name,
                  }}
                />
              ))}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50 py-0 px-1.5">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 ml-4">
          <div className="text-right min-w-[120px]">
            {product.variants && product.variants.length > 0 ? (
              <div>{getVariantPriceRange(product.variants)}</div>
            ) : (
              <div>
                {product.sale_price && Number(product.sale_price) > 0 ? (
                  <>
                    <span className="font-medium text-base text-ramesh-gold">{formatPrice(product.sale_price)}</span>
                    <div className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</div>
                  </>
                ) : (
                  <span className="font-medium text-base text-ramesh-gold">
                    {product.price ? formatPrice(product.price) : "Price not set"}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {!isDeleted ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(product.id)
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 bg-ramesh-gold hover:bg-ramesh-gold/90 text-white font-medium rounded-md text-xs transition-colors"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopy(product)
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-xs transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(product)
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-xs transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {isSuperAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(product)
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-md text-xs transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Permanently Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Highlight search term in text
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded font-medium">$1</mark>')
}

// Check if tag matches search query
const tagMatchesSearch = (tag, searchQuery) => {
  if (!searchQuery || !tag) return false
  return tag.toLowerCase().includes(searchQuery.toLowerCase())
}

// Empty State Component
const EmptyState = ({ hasFilters, onCreateProduct }) => (
  <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
    <div className="mx-auto w-24 h-24 rounded-full bg-ramesh-gold/10 flex items-center justify-center mb-6">
      <Package className="h-12 w-12 text-ramesh-gold" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-3">No products found</h3>
    <p className="text-gray-500 mb-8 max-w-md mx-auto">
      {hasFilters
        ? "No products match your search criteria. Try adjusting your filters."
        : "Start by adding your first product to your catalog."}
    </p>
    <button
      onClick={onCreateProduct}
      className="px-6 py-3 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90 inline-flex items-center shadow-sm transition-all duration-200"
    >
      <Plus className="h-5 w-5 mr-2" />
      {hasFilters ? "Create New Product" : "Add Your First Product"}
    </button>
  </div>
)

// Main Product List Component
const ProductList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { products, loading, error, filters, pagination, getProducts, changePage, setFilters, deleteProduct } =
    useProduct()
  const { categoryTree, getCategoryTree } = useCategory()
  const { subcategories, getSubcategories } = useSubcategory()

  // UI State
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [subcategoryFilter, setSubcategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [deleteType, setDeleteType] = useState("soft")
  const [submitting, setSubmitting] = useState(false)
  const [productTypeFilter, setProductTypeFilter] = useState("")

  // Check if user is super admin
  const isSuperAdmin = user && user.role === "super_admin"

  // Filtered subcategories based on selected category
  const filteredSubcategories = useMemo(() => {
    if (!categoryFilter || !categoryTree) return []

    // Find the selected category in the category tree
    const selectedCategory = categoryTree.find((cat) => cat.id.toString() === categoryFilter)

    // Return its subcategories if found, otherwise empty array
    return selectedCategory?.subcategories || []
  }, [categoryTree, categoryFilter])

  // Load products and category tree on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Fetch products
      await getProducts()

      // Fetch category tree with subcategories
      setLoadingCategories(true)
      try {
        await getCategoryTree({
          include_subcategories: true,
          status: "active",
          limit: 100, // Fetch more categories at once
        })
      } catch (error) {
        console.error("Error fetching category tree:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadInitialData()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        getProducts({ search: searchQuery, page: 1 })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest("#sortDropdownContainer")) {
        setShowSortDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSortDropdown])

  // Add this useEffect after other useEffect hooks (around line 328)
  useEffect(() => {
    // If the product to delete is already soft deleted, automatically set to permanent delete
    if (productToDelete?.deleted_at) {
      setDeleteType("permanent")
    }
  }, [productToDelete])

  // Apply filters
  const applyFilters = () => {
    const filterParams = {
      category_id: categoryFilter,
      subcategory_id: subcategoryFilter,
      page: 1,
    }

    if (statusFilter === "deleted") {
      filterParams.include_deleted = true
      filterParams.status = ""
    } else {
      filterParams.status = statusFilter
      filterParams.include_deleted = false
    }

    getProducts(filterParams)
    setShowFilters(false)
  }

  // Reset filters
  const resetFilters = () => {
    setCategoryFilter("")
    setSubcategoryFilter("")
    setStatusFilter("")
    setProductTypeFilter("") // NEW RESET
    setSearchQuery("")
    getProducts({
      category_id: "",
      subcategory_id: "",
      status: "",
      product_type: "", // NEW RESET
      search: "",
      page: 1,
    })
    setShowFilters(false)
  }

  // Navigate to product details
  const viewProduct = (id) => {
    navigate(`/products/${id}`)
  }

  // Navigate to edit product
  const editProduct = (id) => {
    navigate(`/products/${id}/edit`)
  }

  // Navigate to create product page
  const createProduct = () => {
    // Check if we're already on a product form page
    const currentPath = window.location.pathname
    if (currentPath.includes("/products/create") || currentPath.match(/\/products\/\d+\/edit/)) {
      // If already on create or edit page, refresh by navigating to create page
      navigate("/products/create", { replace: true })
      // Force a reload to reset all form state
      window.location.reload()
    } else {
      // Normal navigation to create page
      navigate("/products/create")
    }
  }

  // Confirm delete product
  const confirmDeleteProduct = (product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
    setDeleteType("soft") // Reset delete type when opening the dialog
  }

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (productToDelete) {
      setSubmitting(true)
      try {
        // Only super admins can perform permanent deletion
        const isPermanent = isSuperAdmin && deleteType === "permanent"
        if (await deleteProduct(productToDelete.id, isPermanent)) {
          setShowDeleteConfirm(false)
          setProductToDelete(null)
          setDeleteType("soft") // Reset to default
        }
      } catch (error) {
        console.error("Delete error:", error)
      } finally {
        setSubmitting(false)
        await getProducts()
      }
    }
  }

  // Toggle sort direction
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
    setShowSortDropdown(false)
  }

  // Sort products
  const sortedProducts = useMemo(() => {
    // First filter products based on deleted status if needed
    let filteredProducts = [...products]

    // If we're specifically looking for deleted products, only show those
    if (statusFilter === "deleted") {
      filteredProducts = filteredProducts.filter((product) => product.deleted_at)
    }

    // If we have a search query, preserve the API's search relevance order
    if (searchQuery && searchQuery.trim()) {
      return filteredProducts // Return in the order received from API (by search_relevance)
    }

    // Only apply client-side sorting when not searching
    return filteredProducts.sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "name":
          valueA = a.name?.toLowerCase() || ""
          valueB = b.name?.toLowerCase() || ""
          break
        case "price":
          if (a.variants && a.variants.length > 0) {
            const prices = a.variants.map((v) => Number.parseFloat(v.price) || 0)
            valueA = Math.min(...prices)
          } else {
            valueA = Number.parseFloat(a.price) || 0
          }

          if (b.variants && b.variants.length > 0) {
            const prices = b.variants.map((v) => Number.parseFloat(v.price) || 0)
            valueB = Math.min(...prices)
          } else {
            valueB = Number.parseFloat(b.price) || 0
          }
          break
        case "created_at":
          valueA = new Date(a.created_at || 0).getTime()
          valueB = new Date(b.created_at || 0).getTime()
          break
        default:
          valueA = a.name?.toLowerCase() || ""
          valueB = b.name?.toLowerCase() || ""
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })
  }, [products, sortBy, sortDirection, statusFilter, searchQuery])

  // Refresh products
  // const refreshProducts = async () => {
  //   setRefreshing(true)
  //   await getProducts()
  //   setTimeout(() => setRefreshing(false), 500)
  // }

  // Check if any filters are applied
  const hasFilters = searchQuery || categoryFilter || subcategoryFilter || statusFilter || productTypeFilter

  // Count active filters
  const activeFilterCount = [
    categoryFilter ? 1 : 0,
    subcategoryFilter ? 1 : 0,
    statusFilter ? 1 : 0,
    productTypeFilter ? 1 : 0, // NEW FILTER COUNT
  ].reduce((a, b) => a + b, 0)

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setCategoryFilter(categoryId)
    // Clear subcategory selection when category changes
    setSubcategoryFilter("")

    // Apply filters immediately
    const filterParams = {
      category_id: categoryId,
      subcategory_id: "",
      page: 1,
    }

    if (statusFilter === "deleted") {
      filterParams.include_deleted = true
      filterParams.status = ""
    } else {
      filterParams.status = statusFilter
      filterParams.include_deleted = false
    }

    getProducts(filterParams)
  }

  // Add a handleSubcategorySelect function to apply filters immediately
  const handleSubcategorySelect = (subcategoryId) => {
    setSubcategoryFilter(subcategoryId)

    // Apply filters immediately
    const filterParams = {
      category_id: categoryFilter,
      subcategory_id: subcategoryId,
      page: 1,
    }

    if (statusFilter === "deleted") {
      filterParams.include_deleted = true
      filterParams.status = ""
    } else {
      filterParams.status = statusFilter
      filterParams.include_deleted = false
    }

    getProducts(filterParams)
  }

  // Add a handleStatusChange function to apply filters immediately
  const handleStatusChange = (status) => {
    setStatusFilter(status)

    // Apply filters immediately
    const filterParams = {
      category_id: categoryFilter,
      subcategory_id: subcategoryFilter,
      page: 1,
    }

    if (status === "deleted") {
      filterParams.include_deleted = true
      filterParams.status = ""
    } else {
      filterParams.status = status
      filterParams.include_deleted = false
    }

    getProducts(filterParams)
  }

  const handleProductTypeChange = (productType) => {
    setProductTypeFilter(productType)

    // Apply filters immediately
    const filterParams = {
      category_id: categoryFilter,
      subcategory_id: subcategoryFilter,
      product_type: productType, // NEW FILTER
      page: 1,
    }

    if (statusFilter === "deleted") {
      filterParams.include_deleted = true
      filterParams.status = ""
    } else {
      filterParams.status = statusFilter
      filterParams.include_deleted = false
    }

    getProducts(filterParams)
  }

  // Copy product to create a new one
  const copyProduct = (product) => {
    // Store the product data in localStorage to pre-fill the form
    localStorage.setItem("copyProductData", JSON.stringify(product))
    // Navigate to create product page
    navigate("/products/create")
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center">
            <Package className="h-8 w-8 mr-2 text-ramesh-gold" />
            Products
          </h1>
          <p className="text-gray-600">Manage your premium sweet collection</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          {/* <button
            onClick={refreshProducts}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button> */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm ${
              showFilters ? "bg-gray-100" : ""
            }`}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-white bg-ramesh-gold">
                {activeFilterCount}
              </Badge>
            )}
          </button>
          <div className="flex items-center gap-2">
            <Link
              to="/products/sku-search"
              className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Search className="h-4 w-4 mr-1.5" />
              SKU Search
            </Link>
            <Link
              to="/products/create"
              className="inline-flex items-center px-3 py-2 bg-ramesh-gold text-white rounded-md text-sm font-medium hover:bg-ramesh-gold/90"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or tags..."
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative" id="sortDropdownContainer">
          <button
            id="sortButton"
            className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <ArrowUpDown className="h-5 w-5 mr-2" />
            Sort By
          </button>
          {showSortDropdown && (
            <div
              id="sortDropdown"
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200"
            >
              <div className="p-2">
                {[
                  { id: "name", label: "Name" },
                  { id: "price", label: "Price" },
                  { id: "created_at", label: "Date Created" },
                ].map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                      sortBy === option.id ? "bg-ramesh-gold/10 text-ramesh-gold" : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleSort(option.id)}
                  >
                    {option.label} {sortBy === option.id && (sortDirection === "asc" ? "↑" : "↓")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-200 shadow-sm">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {showFilters && (
        <Card className="mb-6 border-gray-200 shadow-md rounded-xl overflow-hidden bg-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <SlidersHorizontal className="h-5 w-5 mr-2 text-ramesh-gold" />
                Filter Products
              </h3>
              <Button variant="ghost" onClick={resetFilters} className="text-gray-500 hover:text-ramesh-gold">
                Reset All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Existing category filter */}
              <div className="space-y-1.5">
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <CategoryDropdown
                  categories={categoryTree}
                  selectedCategory={categoryFilter}
                  loading={loadingCategories}
                  onSelectCategory={handleCategorySelect}
                />
              </div>

              {/* Existing subcategory filter */}
              <div className="space-y-1.5">
                <label htmlFor="subcategoryFilter" className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <SubcategoryDropdown
                  subcategories={filteredSubcategories}
                  selectedSubcategory={subcategoryFilter}
                  loading={loadingCategories}
                  disabled={!categoryFilter}
                  onSelectSubcategory={handleSubcategorySelect}
                />
              </div>

              {/* NEW: Product Type filter */}
              <div className="space-y-1.5">
                <label htmlFor="productTypeFilter" className="block text-sm font-medium text-gray-700">
                  Product Type
                </label>
                <select
                  id="productTypeFilter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                  value={productTypeFilter}
                  onChange={(e) => handleProductTypeChange(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="global">Global</option>
                  <option value="local">Local</option>
                  <option value="takeaway">Takeaway</option>
                </select>
              </div>

              {/* Existing status filter */}
              <div className="space-y-1.5">
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="statusFilter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  {isSuperAdmin && <option value="deleted">Deleted</option>}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-xs font-medium text-gray-600">Active filters:</span>

          {searchQuery && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
            >
              Search: {searchQuery}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setSearchQuery("")
                  getProducts({ search: "", page: 1 })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {categoryFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
            >
              Category: {categoryTree.find((c) => c.id.toString() === categoryFilter)?.name || categoryFilter}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setCategoryFilter("")
                  setSubcategoryFilter("") // Clear subcategory when category is cleared
                  getProducts({ category_id: "", subcategory_id: "", page: 1 })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {subcategoryFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
            >
              Subcategory:{" "}
              {filteredSubcategories.find((s) => s.id.toString() === subcategoryFilter)?.name || subcategoryFilter}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setSubcategoryFilter("")
                  getProducts({ subcategory_id: "", page: 1 })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {statusFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
            >
              Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setStatusFilter("")
                  getProducts({ status: "", page: 1 })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {productTypeFilter && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
            >
              Type: {productTypeFilter.charAt(0).toUpperCase() + productTypeFilter.slice(1)}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setProductTypeFilter("")
                  getProducts({ product_type: "", page: 1 })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs ml-auto text-ramesh-gold">
            Clear all filters
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((item) => (
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
      ) : sortedProducts.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onCreateProduct={createProduct} />
      ) : (
        <>
          <div className="space-y-2">
            {sortedProducts.map((product) => (
              <ListItem
                key={product.id}
                product={product}
                onView={viewProduct}
                onEdit={editProduct}
                onDelete={confirmDeleteProduct}
                onCopy={copyProduct}
                searchQuery={searchQuery}
                isSuperAdmin={isSuperAdmin}
              />
            ))}
          </div>
        </>
      )}

      {!loading && sortedProducts.length > 0 && pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center">
          <div className="text-sm text-gray-700 mb-4">
            Showing <span className="font-medium">{(pagination.currentPage - 1) * (pagination.perPage || 10) + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.currentPage * (pagination.perPage || 10), pagination.totalItems)}
            </span>{" "}
            of <span className="font-medium">{pagination.totalItems}</span> products
          </div>

          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <PaginationButton onClick={() => changePage(1)} disabled={pagination.currentPage === 1} isFirst />
            <PaginationButton
              onClick={() => changePage(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              isPrevious
            />

            {getPageNumbers(pagination.currentPage, pagination.totalPages).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => changePage(pageNumber)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pagination.currentPage === pageNumber
                    ? "z-10 bg-ramesh-gold border-ramesh-gold text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <PaginationButton
              onClick={() => changePage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              isNext
            />
            <PaginationButton
              onClick={() => changePage(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              isLast
            />
          </nav>
        </div>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-xl border-2 border-red-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium">{productToDelete?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 my-2">
            {productToDelete?.deleted_at ? (
              // Product is already soft deleted - show permanent delete warning
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-600">This product is already in the trash</p>
                  <p className="text-sm text-gray-600">
                    Permanently deleting will remove it from the database forever. This action cannot be undone.
                  </p>
                </div>
              </div>
            ) : isSuperAdmin ? (
              // Super admin sees both options with radio buttons for non-deleted products
              <>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="deleteType"
                    className="mt-1 mr-2"
                    checked={deleteType === "soft"}
                    onChange={() => setDeleteType("soft")}
                  />
                  <div>
                    <p className="font-medium text-gray-800">Move to trash</p>
                    <p className="text-sm text-gray-600">Product will be archived and can be restored later</p>
                  </div>
                </label>

                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="deleteType"
                    className="mt-1 mr-2"
                    checked={deleteType === "permanent"}
                    onChange={() => setDeleteType("permanent")}
                  />
                  <div>
                    <p className="font-medium text-red-600">Permanently delete</p>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone. All product data will be permanently removed.
                    </p>
                  </div>
                </label>
              </>
            ) : (
              // Normal admin sees only a warning message about permanent deletion
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-600">This action cannot be undone</p>
                  <p className="text-sm text-gray-600">The product will be permanently deleted from the system.</p>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-100">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700 text-white">
              {submitting ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {productToDelete?.deleted_at
                    ? "Permanently Delete"
                    : isSuperAdmin && deleteType === "permanent"
                      ? "Permanently Delete"
                      : "Delete Product"}
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Pagination Button Component
const PaginationButton = ({ onClick, disabled, isFirst, isLast, isPrevious, isNext }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label={isFirst ? "First" : isLast ? "Last" : isPrevious ? "Previous" : isNext ? "Next" : ""}
  >
    {isFirst && (
      <>
        <span className="sr-only">First</span>
        <ChevronLeft className="h-5 w-5" />
        <ChevronLeft className="h-5 w-5 -ml-1" />
      </>
    )}
    {isPrevious && (
      <>
        <span className="sr-only">Previous</span>
        <ChevronLeft className="h-5 w-5" />
      </>
    )}
    {isNext && (
      <>
        <span className="sr-only">Next</span>
        <ChevronRight className="h-5 w-5" />
      </>
    )}
    {isLast && (
      <>
        <span className="sr-only">Last</span>
        <ChevronRight className="h-5 w-5" />
        <ChevronRight className="h-5 w-5 -ml-1" />
      </>
    )}
  </button>
)

// Get page numbers to display in pagination
const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5]
  }

  if (currentPage >= totalPages - 2) {
    return Array.from({ length: totalPages }, (_, i) => totalPages - 4 + i)
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
}

export default ProductList
