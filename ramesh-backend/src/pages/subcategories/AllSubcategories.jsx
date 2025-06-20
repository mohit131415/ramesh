"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useSubcategory } from "../../contexts/SubcategoryContext"
import { useAuth } from "../../contexts/AuthContext"
import { useCategory } from "../../contexts/CategoryContext"
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Edit,
  Trash2,
  Tag,
  ArrowUpDown,
  RefreshCw,
  Layers,
  XCircle,
} from "lucide-react"
import CategoryDropdown from "../../components/filters/CategoryDropdown"

const AllSubcategories = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    subcategories,
    loading,
    error,
    filters,
    pagination,
    getSubcategories,
    changePage,
    setFilters,
    deleteSubcategory,
    restoreSubcategory,
  } = useSubcategory()

  // UI State
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortBy, setSortBy] = useState("name") // name, date, order
  const [sortDirection, setSortDirection] = useState("asc") // asc or desc
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null)
  const [categoriesWithSubcategories, setCategoriesWithSubcategories] = useState([])
  const { categories, getCategories, getCategoryTree, loading: categoriesLoading } = useCategory()

  // Load subcategories and categories with subcategories on mount
  useEffect(() => {
    getSubcategories()
    loadCategoriesWithSubcategories()
  }, [])

  // Load categories that have subcategories using the tree API
  const loadCategoriesWithSubcategories = async () => {
    try {
      const response = await getCategoryTree({
        include_subcategories: true,
        status: "active",
      })

      if (response.status === "success" && response.data) {
        // Filter categories that have at least one subcategory
        const filteredCategories = response.data.filter(
          (category) => category.subcategories && category.subcategories.length > 0,
        )
        setCategoriesWithSubcategories(filteredCategories)
      }
    } catch (error) {
      console.error("Error loading categories with subcategories:", error)
    }
  }

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        getSubcategories({ search: searchQuery, page: 1 })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Reset filters
  const resetFilters = () => {
    setStatusFilter("")
    setCategoryFilter("")
    setSearchQuery("")
    getSubcategories({
      status: "",
      category_id: "",
      search: "",
      page: 1,
    })
    setShowFilters(false)
  }

  // Navigate to edit subcategory
  const editSubcategory = (e, id) => {
    e.stopPropagation()
    navigate(`/subcategories/${id}/edit`)
  }

  // Navigate to create subcategory page
  const createSubcategory = () => {
    navigate("/subcategories/create")
  }

  // Confirm delete subcategory
  const confirmDeleteSubcategory = (e, subcategory) => {
    e.stopPropagation()
    setSubcategoryToDelete(subcategory)
    setShowDeleteConfirm(true)
  }

  // Handle delete subcategory
  const handleDeleteSubcategory = async () => {
    if (subcategoryToDelete) {
      if (await deleteSubcategory(subcategoryToDelete.id)) {
        setShowDeleteConfirm(false)
        setSubcategoryToDelete(null)

        // Refresh the list after successful deletion
        await getSubcategories()
        await loadCategoriesWithSubcategories()
      }
    }
  }

  // Handle restore subcategory
  const handleRestoreSubcategory = async (e, subcategoryId) => {
    e.stopPropagation()
    try {
      const success = await restoreSubcategory(subcategoryId)
      if (success) {
        // Refresh the list after successful restoration
        await getSubcategories()
      }
    } catch (error) {
      console.error("Error restoring subcategory:", error)
    }
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "deleted":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
  }

  // Sort subcategories
  const sortedSubcategories = useMemo(() => {
    if (!subcategories.length) return []

    return [...subcategories].sort((a, b) => {
      let valueA, valueB

      switch (sortBy) {
        case "name":
          valueA = a.name?.toLowerCase() || ""
          valueB = b.name?.toLowerCase() || ""
          break
        case "date":
          valueA = new Date(a.created_at || 0).getTime()
          valueB = new Date(b.created_at || 0).getTime()
          break
        case "order":
          valueA = a.display_order || 0
          valueB = b.display_order || 0
          break
        case "category":
          valueA = a.category_name?.toLowerCase() || ""
          valueB = b.category_name?.toLowerCase() || ""
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
  }, [subcategories, sortBy, sortDirection])

  // Highlight search text in a string
  const highlightText = (text, search) => {
    if (!search || !text) return text

    const parts = text.split(new RegExp(`(${search})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 font-medium">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  // Add a handleCategorySelect function to apply filters immediately
  const handleCategorySelect = (categoryId) => {
    setCategoryFilter(categoryId)

    // Apply filters immediately
    getSubcategories({
      status: statusFilter,
      category_id: categoryId,
      page: 1,
    })
  }

  // Add a handleStatusChange function to apply filters immediately
  const handleStatusChange = (status) => {
    setStatusFilter(status)

    // Apply filters immediately
    getSubcategories({
      status: status,
      category_id: categoryFilter,
      page: 1,
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">All Subcategories</h1>
            <p className="text-gray-600 mt-1">View and manage all subcategories across categories</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              to="/subcategories/by-category"
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Layers className="h-4 w-4 mr-2" />
              View By Category
            </Link>
            <button
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(statusFilter || categoryFilter || searchQuery) && (
                <span className="ml-2 bg-ramesh-gold text-white text-xs px-2 py-1 rounded-full">
                  {[statusFilter, categoryFilter, searchQuery].filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              className="flex items-center px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90 shadow-sm transition-colors"
              onClick={createSubcategory}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Subcategory
            </button>
          </div>
        </div>

        {/* Search and sort controls */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search subcategories by name..."
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
              onClick={() => document.getElementById("sortDropdown").classList.toggle("hidden")}
            >
              <ArrowUpDown className="h-5 w-5 mr-2" />
              Sort By
            </button>
            <div
              id="sortDropdown"
              className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200"
            >
              <div className="p-2">
                <button
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${sortBy === "name" ? "bg-ramesh-gold/10 text-ramesh-gold" : "hover:bg-gray-100"}`}
                  onClick={() => toggleSort("name")}
                >
                  Name {sortBy === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
                <button
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${sortBy === "category" ? "bg-ramesh-gold/10 text-ramesh-gold" : "hover:bg-gray-100"}`}
                  onClick={() => toggleSort("category")}
                >
                  Category {sortBy === "category" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
                <button
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${sortBy === "date" ? "bg-ramesh-gold/10 text-ramesh-gold" : "hover:bg-gray-100"}`}
                  onClick={() => toggleSort("date")}
                >
                  Date Created {sortBy === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
                <button
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${sortBy === "order" ? "bg-ramesh-gold/10 text-ramesh-gold" : "hover:bg-gray-100"}`}
                  onClick={() => toggleSort("order")}
                >
                  Display Order {sortBy === "order" && (sortDirection === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-200 shadow-sm">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900">Filter Subcategories</h3>
            <button
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded-md transition-colors"
              onClick={resetFilters}
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent transition-all"
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <CategoryDropdown
                categories={categoriesWithSubcategories}
                selectedCategory={categoryFilter}
                onSelectCategory={handleCategorySelect}
                loading={categoriesLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Subcategory list */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold mb-4"></div>
          <p className="text-gray-500">Loading subcategories...</p>
        </div>
      ) : sortedSubcategories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-ramesh-gold/10 flex items-center justify-center mb-6">
            <Tag className="h-12 w-12 text-ramesh-gold" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No subcategories found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchQuery || statusFilter || categoryFilter
              ? "No subcategories match your current filters. Try adjusting your search or filters."
              : "Subcategories help organize your products within categories. Start by creating your first subcategory."}
          </p>
          {!searchQuery && !statusFilter && !categoryFilter && (
            <button
              onClick={createSubcategory}
              className="px-6 py-3 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90 inline-flex items-center shadow-sm transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Subcategory
            </button>
          )}
        </div>
      ) : (
        // List View with enhanced styling
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subcategory
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Display Order
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSubcategories.map((subcategory) => {
                  const isDeleted = subcategory.status === "deleted"

                  return (
                    <tr
                      key={subcategory.id}
                      className={`hover:bg-yellow-50 hover:border-l-4 hover:border-l-yellow-400 hover:shadow-lg cursor-pointer transition-all duration-300 ${isDeleted ? "bg-red-50" : ""}`}
                      onClick={() => navigate(`/subcategories/${subcategory.id}`)}
                    >
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 mr-5">
                            {subcategory.image_url ? (
                              <img
                                className="h-16 w-16 rounded-md object-cover border border-gray-200"
                                src={subcategory.image_url || "/placeholder.svg"}
                                alt={subcategory.name}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-ramesh-gold/10 flex items-center justify-center border border-gray-200">
                                <Tag className="h-7 w-7 text-ramesh-gold" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-lg font-medium text-gray-900">
                              {highlightText(subcategory.name, searchQuery)}
                            </div>
                            <div className="text-base text-gray-500 truncate max-w-xs">
                              {highlightText(subcategory.description || "No description", searchQuery)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className="text-base text-gray-700">{subcategory.category_name || "None"}</span>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3.5 py-2 rounded-full text-base font-medium ${
                            isDeleted ? "bg-red-100 text-red-800" : getStatusBadge(subcategory.status)
                          }`}
                        >
                          {isDeleted
                            ? "Deleted"
                            : subcategory.status.charAt(0).toUpperCase() + subcategory.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                        {subcategory.display_order || 0}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                        {new Date(subcategory.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-3">
                          {isDeleted ? (
                            <button
                              onClick={(e) => handleRestoreSubcategory(e, subcategory.id)}
                              className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-base transition-colors"
                            >
                              <RefreshCw className="h-6 w-6 mr-2" />
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => editSubcategory(e, subcategory.id)}
                                className="inline-flex items-center px-5 py-2.5 bg-ramesh-gold hover:bg-ramesh-gold/90 text-white font-medium rounded-md text-base transition-colors"
                              >
                                <Edit className="h-6 w-6 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => confirmDeleteSubcategory(e, subcategory)}
                                className="inline-flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-base transition-colors"
                              >
                                <Trash2 className="h-6 w-6 mr-2" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && sortedSubcategories.length > 0 && pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center">
          <div className="text-sm text-gray-700 mb-4">
            Showing <span className="font-medium">{(pagination.currentPage - 1) * (pagination.perPage || 10) + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.currentPage * (pagination.perPage || 10), pagination.totalItems)}
            </span>{" "}
            of <span className="font-medium">{pagination.totalItems}</span> subcategories
          </div>

          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* First page button */}
            <button
              onClick={() => changePage(1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">First</span>
              <ChevronLeft className="h-5 w-5" />
              <ChevronLeft className="h-5 w-5 -ml-1" />
            </button>

            {/* Previous page button */}
            <button
              onClick={() => changePage(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
              let pageNumber

              if (pagination.totalPages <= 5) {
                pageNumber = i + 1
              } else if (pagination.currentPage <= 3) {
                pageNumber = i + 1
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNumber = pagination.totalPages - 4 + i
              } else {
                pageNumber = pagination.currentPage - 2 + i
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => changePage(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                    pagination.currentPage === pageNumber
                      ? "z-10 bg-ramesh-gold border-ramesh-gold text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}

            {/* Next page button */}
            <button
              onClick={() => changePage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Last page button */}
            <button
              onClick={() => changePage(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="sr-only">Last</span>
              <ChevronRight className="h-5 w-5" />
              <ChevronRight className="h-5 w-5 -ml-1" />
            </button>
          </nav>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Delete Subcategory</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-medium">{subcategoryToDelete?.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                onClick={handleDeleteSubcategory}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllSubcategories
