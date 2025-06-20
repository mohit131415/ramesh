"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useSubcategory } from "../../contexts/SubcategoryContext"
import { useAuth } from "../../contexts/AuthContext"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Tag,
  Edit,
  Trash2,
  List,
  Info,
  Search,
  ChevronUp,
  ArrowRight,
} from "lucide-react"
import { toast } from "react-toastify"
import api from "../../services/api"

const SubcategoriesByCategory = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { deleteSubcategory } = useSubcategory()

  // UI State
  const [expandedCategories, setExpandedCategories] = useState({})
  const [categoriesData, setCategoriesData] = useState({ categories: [], pagination: {} })
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [subcategoryToDelete, setSubcategoryToDelete] = useState(null)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Pagination for categories
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Load categories on mount
  useEffect(() => {
    loadCategoriesTree(1)
  }, [])

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout)

    const timeout = setTimeout(() => {
      loadCategoriesTree(1, searchQuery)
    }, 500)

    setSearchTimeout(timeout)

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout)
    }
  }, [searchQuery])

  const loadCategoriesTree = async (page = 1, search = searchQuery) => {
    setLoading(true)
    setError(null)
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit: 10,
        status: "active",
        include_subcategories: true,
        expand_all: search ? "true" : "false",
      })

      if (search) params.append("search", search)

      const response = await api.get(`/categories/tree?${params.toString()}`)

      if (response.data?.status === "success") {
        setCategoriesData({
          categories: response.data.data || [],
          pagination: response.data.meta || {},
        })

        // Auto-expand categories with search results
        if (search) {
          const newExpandedState = {}
          response.data.data.forEach((category) => {
            newExpandedState[category.id] = true
          })
          setExpandedCategories(newExpandedState)
        }
        // Don't auto-expand first category anymore

        setCurrentPage(page)
      } else {
        setError(response.data?.message || "Failed to load categories")
        toast.error(response.data?.message || "Failed to load categories")
      }
    } catch (err) {
      console.error("Error loading categories tree:", err)
      setError("Failed to load categories. Please try again.")
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Handle delete subcategory
  const handleDeleteSubcategory = async () => {
    if (subcategoryToDelete) {
      if (await deleteSubcategory(subcategoryToDelete.id)) {
        setShowDeleteConfirm(false)
        setSubcategoryToDelete(null)

        // Refresh the categories tree to update the UI
        loadCategoriesTree(currentPage)
      }
    }
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Navigate to edit subcategory
  const editSubcategory = (e, id) => {
    e.stopPropagation()
    navigate(`/subcategories/${id}/edit`)
  }

  // Navigate to view subcategory
  const viewSubcategory = (e, id) => {
    e.stopPropagation()
    navigate(`/subcategories/${id}`)
  }

  // Create new subcategory for a specific category
  const createSubcategoryForCategory = (e, categoryId, categoryName) => {
    e.stopPropagation()
    navigate("/subcategories/create", {
      state: {
        preselectedCategory: categoryId,
        preselectedCategoryName: categoryName,
      },
    })
  }

  // Add this function after the existing functions but before the return statement
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"))
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span key={index} className="bg-yellow-200 font-medium">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </>
    )
  }

  const confirmDeleteSubcategory = (e, subcategory) => {
    e.stopPropagation()
    setSubcategoryToDelete(subcategory)
    setShowDeleteConfirm(true)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">Subcategories By Category</h1>
            <p className="text-gray-600">View and manage subcategories organized by their parent categories</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link
              to="/subcategories"
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              <List className="h-4 w-4 mr-2" />
              View All Subcategories
            </Link>
            <button
              className="flex items-center px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90 shadow-sm"
              onClick={() => navigate("/subcategories/create")}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Subcategory
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories and subcategories..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-200 shadow-sm">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {loading && categoriesData.categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold mb-4"></div>
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : categoriesData.categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-ramesh-gold/10 flex items-center justify-center mb-6">
            <Tag className="h-12 w-12 text-ramesh-gold" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No categories found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchQuery
              ? "No categories match your search criteria."
              : "You need to create categories before adding subcategories."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate("/categories/create")}
              className="px-6 py-3 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90 inline-flex items-center shadow-sm transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Category
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Categories and Subcategories</h3>

            <div className="space-y-4">
              {categoriesData.categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleCategoryExpansion(category.id)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-md bg-ramesh-gold/10 flex items-center justify-center mr-3">
                        <Tag className="h-5 w-5 text-ramesh-gold" />
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">
                          {searchQuery ? highlightText(category.name, searchQuery) : category.name}
                        </h4>
                        <p className="text-sm text-gray-500">{category.subcategories_count || 0} subcategories</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="p-2 rounded-full hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/categories/${category.id}`)
                        }}
                        title="View Category Details"
                      >
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                      </button>
                      {expandedCategories[category.id] ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedCategories[category.id] && (
                    <div className="p-4 border-t border-gray-200">
                      {category.subcategories?.length > 0 ? (
                        <div>
                          <div className="space-y-3">
                            {category.subcategories.map((subcategory) => (
                              <div
                                key={subcategory.id}
                                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                              >
                                <div
                                  className="flex items-center flex-1 cursor-pointer"
                                  onClick={(e) => viewSubcategory(e, subcategory.id)}
                                >
                                  <div className="h-12 w-12 flex-shrink-0 mr-3">
                                    {subcategory.image_url ? (
                                      <img
                                        className="h-12 w-12 rounded-md object-cover"
                                        src={subcategory.image_url || "/placeholder.svg"}
                                        alt={subcategory.name}
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-md bg-ramesh-gold/5 flex items-center justify-center">
                                        <Tag className="h-5 w-5 text-ramesh-gold" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-base font-medium text-gray-900">
                                      {searchQuery ? highlightText(subcategory.name, searchQuery) : subcategory.name}
                                    </h5>
                                    <p className="text-sm text-gray-500 truncate">
                                      {searchQuery && subcategory.description
                                        ? highlightText(subcategory.description, searchQuery)
                                        : subcategory.description || "No description"}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                      subcategory.status,
                                    )}`}
                                  >
                                    {subcategory.status.charAt(0).toUpperCase() + subcategory.status.slice(1)}
                                  </span>
                                </div>
                                <div className="flex ml-4 space-x-2">
                                  <button
                                    onClick={(e) => editSubcategory(e, subcategory.id)}
                                    className="p-2 bg-ramesh-gold text-white rounded-md hover:bg-ramesh-gold/90"
                                    title="Edit"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={(e) => confirmDeleteSubcategory(e, subcategory)}
                                    className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add subcategory button */}
                          <div className="mt-4 flex justify-center">
                            <button
                              onClick={(e) => createSubcategoryForCategory(e, category.id, category.name)}
                              className="px-4 py-2 bg-ramesh-gold/90 text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold inline-flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Subcategory to {category.name}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Info className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 mb-4">No subcategories found for this category</p>
                          <button
                            onClick={(e) => createSubcategoryForCategory(e, category.id, category.name)}
                            className="px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90 inline-flex items-center"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subcategory
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagination for categories */}
      {!loading && categoriesData.categories.length > 0 && categoriesData.pagination.total_pages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => loadCategoriesTree(1)}
              disabled={currentPage === 1}
              className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              aria-label="First page"
            >
              <div className="flex">
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </div>
            </button>
            <button
              onClick={() => loadCategoriesTree(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, categoriesData.pagination.total_pages || 1) }).map((_, i) => {
                let pageNumber

                if (categoriesData.pagination.total_pages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= categoriesData.pagination.total_pages - 2) {
                  pageNumber = categoriesData.pagination.total_pages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => loadCategoriesTree(pageNumber)}
                    className={`w-8 h-8 flex items-center justify-center rounded ${
                      currentPage === pageNumber
                        ? "bg-ramesh-gold text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={currentPage === pageNumber ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => loadCategoriesTree(Math.min(categoriesData.pagination.total_pages || 1, currentPage + 1))}
              disabled={currentPage === (categoriesData.pagination.total_pages || 1)}
              className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => loadCategoriesTree(categoriesData.pagination.total_pages || 1)}
              disabled={currentPage === (categoriesData.pagination.total_pages || 1)}
              className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Last page"
            >
              <div className="flex">
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </div>
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
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
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

export default SubcategoriesByCategory
