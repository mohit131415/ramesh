"use client"

import { createContext, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import subcategoryService from "../services/subcategoryService"
import { useAuth } from "./AuthContext"
import activityService from "../services/activityService"

const SubcategoryContext = createContext(null)

export const SubcategoryProvider = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [subcategories, setSubcategories] = useState([])
  const [currentSubcategory, setCurrentSubcategory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category_id: "",
    page: 1,
    limit: 10,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })

  // Check if user is super admin
  const isSuperAdmin = user?.role === "super_admin"

  // Get all subcategories with filters
  const getSubcategories = async (filterParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Merge current filters with new filter params
      const mergedFilters = { ...filters, ...filterParams }
      setFilters(mergedFilters)

      // Check if we need to include category information
      let response
      if (mergedFilters.include_category_info) {
        response = await subcategoryService.getAllSubcategoriesWithCategories(mergedFilters)
      } else {
        response = await subcategoryService.getAllSubcategories(mergedFilters)
      }

      if (response.status === "success") {
        // Process the subcategories to ensure deleted items are properly marked
        const processedSubcategories = (response.data || []).map((subcategory) => {
          // If the subcategory has a deleted_at date, ensure it's recognized as deleted
          // regardless of what the status field says
          const isDeleted =
            subcategory.deleted_at !== null && subcategory.deleted_at !== undefined && subcategory.deleted_at !== ""

          return {
            ...subcategory,
            // Override the status field for deleted items
            status: isDeleted ? "deleted" : subcategory.status,
            isDeleted: isDeleted,
          }
        })

        setSubcategories(processedSubcategories)

        // Update pagination if available
        if (response.meta) {
          setPagination({
            currentPage: response.meta.current_page || 1,
            totalPages: response.meta.total_pages || 1,
            totalItems: response.meta.total || 0,
            perPage: response.meta.per_page || filters.limit,
          })
        }

        return {
          status: "success",
          data: processedSubcategories,
          meta: response.meta,
        }
      } else {
        setError(response.message || "Failed to fetch subcategories")
        toast.error(response.message || "Failed to fetch subcategories")
        return {
          status: "error",
          message: response.message || "Failed to fetch subcategories",
        }
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching subcategories"
      setError(errorMessage)
      toast.error(errorMessage)
      return {
        status: "error",
        message: errorMessage,
      }
    } finally {
      setLoading(false)
    }
  }

  // Get a specific subcategory
  const getSubcategory = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await subcategoryService.getSubcategory(id)

      if (response.status === "success") {
        // Process the subcategory to ensure deleted status is properly marked
        const subcategory = response.data
        if (subcategory) {
          const isDeleted =
            subcategory.deleted_at !== null && subcategory.deleted_at !== undefined && subcategory.deleted_at !== ""

          const processedSubcategory = {
            ...subcategory,
            status: isDeleted ? "deleted" : subcategory.status,
            isDeleted: isDeleted,
          }

          setCurrentSubcategory(processedSubcategory)
        } else {
          setCurrentSubcategory(null)
        }

        return true
      } else {
        setError(response.message || "Failed to fetch subcategory details")
        toast.error(response.message || "Failed to fetch subcategory details")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching subcategory details"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Create a new subcategory
  const createSubcategory = async (subcategoryData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await subcategoryService.createSubcategory(subcategoryData)

      if (response.status === "success") {
        toast.success(response.message || "Subcategory created successfully")
        return true
      } else {
        setError(response.message || "Failed to create subcategory")
        toast.error(response.message || "Failed to create subcategory")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while creating subcategory"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update a subcategory
  const updateSubcategory = async (id, subcategoryData) => {
    setLoading(true)
    setError(null)

    try {
      console.log("SubcategoryContext: Updating subcategory with data:", subcategoryData)

      // If subcategoryData is already a FormData object, use it directly
      let formDataToSubmit
      if (subcategoryData instanceof FormData) {
        formDataToSubmit = subcategoryData
      } else {
        // Create a FormData object for file upload
        formDataToSubmit = new FormData()

        // Add all fields to FormData
        for (const key in subcategoryData) {
          if (subcategoryData[key] !== undefined && subcategoryData[key] !== null) {
            // Handle file upload separately
            if (key === "image" && subcategoryData[key] instanceof File) {
              formDataToSubmit.append(key, subcategoryData[key])
            } else if (key !== "image" || typeof subcategoryData[key] === "string") {
              // Convert numbers to strings for FormData
              if (typeof subcategoryData[key] === "number") {
                formDataToSubmit.append(key, subcategoryData[key].toString())
              } else {
                formDataToSubmit.append(key, subcategoryData[key])
              }
            }
          }
        }
      }

      // Explicitly handle image removal
      if (subcategoryData.remove_image) {
        formDataToSubmit.append("remove_image", "1")
      }

      const response = await subcategoryService.updateSubcategory(id, formDataToSubmit)

      if (response.status === "success") {
        // Update current subcategory if it's the same one
        if (currentSubcategory && currentSubcategory.id === Number.parseInt(id)) {
          setCurrentSubcategory(response.data || currentSubcategory)
        }

        toast.success(response.message || "Subcategory updated successfully")
        return true
      } else {
        setError(response.message || "Failed to update subcategory")
        toast.error(response.message || "Failed to update subcategory")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while updating subcategory"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Delete a subcategory
  const deleteSubcategory = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await subcategoryService.deleteSubcategory(id)

      if (response.status === "success") {
        // Update the subcategory in the list to mark it as deleted
        setSubcategories((prevSubcategories) =>
          prevSubcategories.map((subcategory) => {
            if (subcategory.id === Number.parseInt(id)) {
              return {
                ...subcategory,
                status: "deleted",
                isDeleted: true,
                deleted_at: new Date().toISOString(),
              }
            }
            return subcategory
          }),
        )

        toast.success(response.message || "Subcategory deleted successfully")
        return true
      } else {
        setError(response.message || "Failed to delete subcategory")
        toast.error(response.message || "Failed to delete subcategory")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while deleting subcategory"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Restore a subcategory
  const restoreSubcategory = async (id) => {
    setLoading(true)
    try {
      const result = await subcategoryService.restoreSubcategory(id)

      // Update the subcategories list
      setSubcategories((prevSubcategories) =>
        prevSubcategories.map((subcategory) =>
          subcategory.id === id ? { ...subcategory, status: "active" } : subcategory,
        ),
      )

      // If we have a current subcategory and it's the one being restored, update it
      if (currentSubcategory && currentSubcategory.id === id) {
        setCurrentSubcategory({ ...currentSubcategory, status: "active" })
      }

      // Log the activity
      await activityService.logActivity({
        action: "restore",
        resource_type: "subcategory",
        resource_id: id,
        details: `Restored subcategory ID: ${id}`,
      })

      setLoading(false)
      return true
    } catch (error) {
      console.error("Error restoring subcategory:", error)
      setError(error.message || "Failed to restore subcategory")
      setLoading(false)
      return false
    }
  }

  // Get subcategories by category
  const getSubcategoriesByCategory = async (categoryId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await subcategoryService.getSubcategoriesByCategory(categoryId)

      if (response.status === "success") {
        return response.data || []
      } else {
        setError(response.message || "Failed to fetch subcategories for this category")
        toast.error(response.message || "Failed to fetch subcategories for this category")
        return []
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching subcategories"
      setError(errorMessage)
      toast.error(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Change page
  const changePage = (page) => {
    getSubcategories({ ...filters, page })
  }

  // Clear current subcategory
  const clearCurrentSubcategory = () => {
    setCurrentSubcategory(null)
  }

  const value = {
    subcategories,
    currentSubcategory,
    loading,
    error,
    filters,
    pagination,
    isSuperAdmin,
    getSubcategories,
    getSubcategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    restoreSubcategory,
    getSubcategoriesByCategory,
    changePage,
    clearCurrentSubcategory,
    setFilters,
  }

  return <SubcategoryContext.Provider value={value}>{children}</SubcategoryContext.Provider>
}

export const useSubcategory = () => {
  const context = useContext(SubcategoryContext)
  if (context === undefined) {
    throw new Error("useSubcategory must be used within a SubcategoryProvider")
  }
  return context
}
