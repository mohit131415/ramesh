"use client"

import { createContext, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import adminService from "../services/adminService"
import { useAuth } from "./AuthContext"

const AdminContext = createContext(null)

export const AdminProvider = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [admins, setAdmins] = useState([])
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
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

  // Get all admins with filters
  const getAdmins = async (filterParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Merge current filters with new filter params
      const mergedFilters = { ...filters, ...filterParams }
      setFilters(mergedFilters)

      // Only super admins can list all admins
      if (!isSuperAdmin) {
        setError("You don't have permission to access this resource")
        setLoading(false)
        return false
      }

      const response = await adminService.getAllAdmins(mergedFilters)

      if (response.status === "success") {
        setAdmins(response.data || [])

        // Update pagination if available
        if (response.meta) {
          setPagination({
            currentPage: response.meta.current_page || 1,
            totalPages: response.meta.last_page || 1,
            totalItems: response.meta.total || 0,
          })
        }

        return true
      } else {
        setError(response.message || "Failed to fetch admins")
        toast.error(response.message || "Failed to fetch admins")
        return false
      }
    } catch (err) {
      // Check for token expiration
      if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("Invalid or expired token") ||
        err.response?.data?.message?.includes("Token has expired")
      ) {
        handleTokenExpiration()
        return false
      }

      const errorMessage = err.message || "An error occurred while fetching admins"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Get a specific admin
  const getAdmin = async (id) => {
    setLoading(true)
    setError(null)

    try {
      // Regular admins can only view their own profile
      if (!isSuperAdmin && user?.id !== Number.parseInt(id)) {
        setError("You don't have permission to access this resource")
        toast.error("You don't have permission to access this resource")
        setLoading(false)
        return false
      }

      const response = await adminService.getAdmin(id)

      if (response.status === "success") {
        setCurrentAdmin(response.data || null)
        return true
      } else {
        setError(response.message || "Failed to fetch admin details")
        toast.error(response.message || "Failed to fetch admin details")
        return false
      }
    } catch (err) {
      // Check for token expiration
      if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("Invalid or expired token") ||
        err.response?.data?.message?.includes("Token has expired")
      ) {
        handleTokenExpiration()
        return false
      }

      const errorMessage = err.message || "An error occurred while fetching admin details"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Create a new admin
  const createAdmin = async (adminData) => {
    setLoading(true)
    setError(null)

    try {
      // Only super admins can create admins
      if (!isSuperAdmin) {
        setError("You don't have permission to create admins")
        toast.error("You don't have permission to create admins")
        setLoading(false)
        return false
      }

      const response = await adminService.createAdmin(adminData)

      if (response.status === "success") {
        toast.success(response.message || "Admin created successfully")
        return true
      } else {
        setError(response.message || "Failed to create admin")
        toast.error(response.message || "Failed to create admin")
        return false
      }
    } catch (err) {
      // Check for token expiration
      if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("Invalid or expired token") ||
        err.response?.data?.message?.includes("Token has expired")
      ) {
        handleTokenExpiration()
        return false
      }

      const errorMessage = err.message || "An error occurred while creating admin"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update an admin
  const updateAdmin = async (id, adminData) => {
    setLoading(true)
    setError(null)

    try {
      // Regular admins can only update their own profile
      if (!isSuperAdmin && user?.id !== Number.parseInt(id)) {
        setError("You don't have permission to update this admin")
        toast.error("You don't have permission to update this admin")
        setLoading(false)
        return false
      }

      const response = await adminService.updateAdmin(id, adminData)

      if (response.status === "success") {
        // Update current admin if it's the same one
        if (currentAdmin && currentAdmin.id === Number.parseInt(id)) {
          setCurrentAdmin(response.data || currentAdmin)
        }

        toast.success(response.message || "Admin updated successfully")
        return true
      } else {
        setError(response.message || "Failed to update admin")
        toast.error(response.message || "Failed to update admin")
        return false
      }
    } catch (err) {
      // Check for token expiration
      if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("Invalid or expired token") ||
        err.response?.data?.message?.includes("Token has expired")
      ) {
        handleTokenExpiration()
        return false
      }

      const errorMessage = err.message || "An error occurred while updating admin"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Delete an admin
  const deleteAdmin = async (id) => {
    setLoading(true)
    setError(null)

    try {
      // Only super admins can delete admins
      if (!isSuperAdmin) {
        setError("You don't have permission to delete admins")
        toast.error("You don't have permission to delete admins")
        setLoading(false)
        return false
      }

      const response = await adminService.deleteAdmin(id)

      if (response.status === "success") {
        // Remove from admins list if exists
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== Number.parseInt(id)))

        toast.success(response.message || "Admin deleted successfully")
        return true
      } else {
        setError(response.message || "Failed to delete admin")
        toast.error(response.message || "Failed to delete admin")
        return false
      }
    } catch (err) {
      // Check for token expiration
      if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("Invalid or expired token") ||
        err.response?.data?.message?.includes("Token has expired")
      ) {
        handleTokenExpiration()
        return false
      }

      const errorMessage = err.message || "An error occurred while deleting admin"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update admin status only
  const updateAdminStatus = async (id, status) => {
    setLoading(true)
    setError(null)

    try {
      // Only super admins can update admin status
      if (!isSuperAdmin) {
        setError("You don't have permission to update admin status")
        toast.error("You don't have permission to update admin status")
        setLoading(false)
        return false
      }

      const response = await adminService.updateAdminStatus(id, status)

      if (response.status === "success") {
        // Update current admin if it's the same one
        if (currentAdmin && currentAdmin.id === Number.parseInt(id)) {
          setCurrentAdmin({
            ...currentAdmin,
            status: status,
          })
        }

        // Update the admin in the list if it exists
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) => (admin.id === Number.parseInt(id) ? { ...admin, status } : admin)),
        )

        toast.success(response.message || "Admin status updated successfully")
        return true
      } else {
        setError(response.message || "Failed to update admin status")
        toast.error(response.message || "Failed to update admin status")
        return false
      }
    } catch (err) {
      // Check for token expiration
      if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes("Invalid or expired token") ||
        err.response?.data?.message?.includes("Token has expired")
      ) {
        handleTokenExpiration()
        return false
      }

      const errorMessage = err.message || "An error occurred while updating admin status"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Change page
  const changePage = (page) => {
    getAdmins({ page })
  }

  // Clear current admin
  const clearCurrentAdmin = () => {
    setCurrentAdmin(null)
  }

  const handleTokenExpiration = () => {
    // Clear local storage and log out
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")

    // Show notification
    toast.error("Your session has expired. Please log in again.")

    // Redirect to login page
    window.location.href = "/login"
  }

  const value = {
    admins,
    currentAdmin,
    loading,
    error,
    filters,
    pagination,
    isSuperAdmin,
    getAdmins,
    getAdmin,
    createAdmin,
    updateAdmin,
    updateAdminStatus,
    deleteAdmin,
    changePage,
    clearCurrentAdmin,
    setFilters,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
