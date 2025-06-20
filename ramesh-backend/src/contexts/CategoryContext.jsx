"use client"

import { createContext, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import categoryService from "../services/categoryService"
import { useAuth } from "./AuthContext"

const CategoryContext = createContext(null)

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [categoryTree, setCategoryTree] = useState([])
  const [currentCategory, setCurrentCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
    has_subcategories: false,
    is_takeaway: "", // Add takeaway filter
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })

  // Check if user is super admin
  const isSuperAdmin = user?.role === "super_admin"

  // Get all categories with filters
  const getCategories = async (filterParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Merge current filters with new filter params
      const mergedFilters = { ...filters, ...filterParams }
      setFilters(mergedFilters)

      const response = await categoryService.getAllCategories(mergedFilters)

      if (response.status === "success") {
        setCategories(response.data || [])

        // Update pagination if available
        if (response.meta) {
          setPagination({
            currentPage: response.meta.current_page || 1,
            totalPages: response.meta.total_pages || 1,
            totalItems: response.meta.total || 0,
            perPage: response.meta.per_page || filters.limit,
          })
        }

        return true
      } else {
        setError(response.message || "Failed to fetch categories")
        toast.error(response.message || "Failed to fetch categories")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching categories"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Get category tree with filters
  const getCategoryTree = async (filterParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Default filters for tree view
      const defaultTreeFilters = {
        include_subcategories: true,
        status: "active",
        limit: 50,
      }

      // Merge default filters with provided filters
      const mergedFilters = { ...defaultTreeFilters, ...filterParams }

      const response = await categoryService.getCategoryTree(mergedFilters)

      if (response.status === "success") {
        setCategoryTree(response.data || [])

        // Update pagination if available
        if (response.meta) {
          setPagination({
            currentPage: response.meta.current_page || 1,
            totalPages: response.meta.total_pages || 1,
            totalItems: response.meta.total || 0,
            perPage: response.meta.per_page || mergedFilters.limit,
          })
        }

        return response
      } else {
        setError(response.message || "Failed to fetch category tree")
        toast.error(response.message || "Failed to fetch category tree")
        return response
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching category tree"
      setError(errorMessage)
      toast.error(errorMessage)
      return {
        status: "error",
        message: errorMessage,
        data: null,
      }
    } finally {
      setLoading(false)
    }
  }

  // Get a specific category
  const getCategory = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await categoryService.getCategory(id)

      if (response.status === "success") {
        setCurrentCategory(response.data || null)
        return true
      } else {
        setError(response.message || "Failed to fetch category details")
        toast.error(response.message || "Failed to fetch category details")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching category details"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Create a new category
  const createCategory = async (categoryData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await categoryService.createCategory(categoryData)

      if (response.status === "success") {
        toast.success(response.message || "Category created successfully")
        return true
      } else {
        setError(response.message || "Failed to create category")
        toast.error(response.message || "Failed to create category")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while creating category"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update a category
  const updateCategory = async (id, categoryData) => {
    setLoading(true)
    setError(null)

    try {
      console.log("CategoryContext: Updating category with data:", categoryData)

      // If categoryData is already a FormData object, use it directly
      let formDataToSubmit
      if (categoryData instanceof FormData) {
        formDataToSubmit = categoryData
      } else {
        // Create a FormData object for file upload
        formDataToSubmit = new FormData()

        // Add all fields to FormData
        for (const key in categoryData) {
          if (categoryData[key] !== undefined && categoryData[key] !== null) {
            // Handle file upload separately
            if (key === "image" && categoryData[key] instanceof File) {
              formDataToSubmit.append(key, categoryData[key])
            } else if (key !== "image" || typeof categoryData[key] === "string") {
              // Convert numbers to strings for FormData
              if (typeof categoryData[key] === "number") {
                formDataToSubmit.append(key, categoryData[key].toString())
              } else {
                formDataToSubmit.append(key, categoryData[key])
              }
            }
          }
        }
      }

      const success = await categoryService.updateCategory(id, formDataToSubmit)

      if (success) {
        // Update current category if it's the same one
        if (currentCategory && currentCategory.id === Number.parseInt(id)) {
          setCurrentCategory(success.data || currentCategory)
        }

        toast.success(success.message || "Category updated successfully")
        return true
      } else {
        setError(success.message || "Failed to update category")
        toast.error(success.message || "Failed to update category")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while updating category"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Delete a category
  const deleteCategory = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await categoryService.deleteCategory(id)

      if (response.status === "success") {
        // Remove from categories list if exists
        setCategories((prevCategories) => prevCategories.filter((category) => category.id !== Number.parseInt(id)))

        toast.success(response.message || "Category deleted successfully")
        return true
      } else {
        setError(response.message || "Failed to delete category")
        toast.error(response.message || "Failed to delete category")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while deleting category"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Restore a category (super admin only)
  const restoreCategory = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await categoryService.restoreCategory(id)

      if (response.status === "success") {
        // Update the categories list
        getCategories(filters)
        toast.success(response.message || "Category restored successfully")
        return true
      } else {
        const errorMessage = response.message || "Failed to restore category"
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while restoring the category"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Change page
  const changePage = (page) => {
    getCategories({ page })
  }

  // Clear current category
  const clearCurrentCategory = () => {
    setCurrentCategory(null)
  }

  // Get all categories at once (all pages)
  const getAllCategoriesAtOnce = async (filterParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Merge current filters with new filter params
      const mergedFilters = { ...filters, ...filterParams }

      const response = await categoryService.getAllCategoriesAtOnce(mergedFilters)

      if (response.status === "success") {
        setCategories(response.data || [])
        return true
      } else {
        setError(response.message || "Failed to fetch categories")
        toast.error(response.message || "Failed to fetch categories")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching categories"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Get categories filtered by takeaway availability
  const getCategoriesByTakeaway = async (takeawayStatus = null) => {
    const filterParams = {
      ...filters,
      is_takeaway: takeawayStatus !== null ? (takeawayStatus ? "1" : "0") : "",
    }

    return await getCategories(filterParams)
  }

  const value = {
    categories,
    categoryTree,
    currentCategory,
    loading,
    error,
    filters,
    pagination,
    isSuperAdmin,
    getCategories,
    getCategoryTree,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    changePage,
    clearCurrentCategory,
    setFilters,
    getAllCategoriesAtOnce,
    getCategoriesByTakeaway, // Add this new function
  }

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export const useCategory = () => {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider")
  }
  return context
}
