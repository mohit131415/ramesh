"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAdmin } from "../../contexts/AdminContext"
import { useAuth } from "../../contexts/AuthContext"
import { Search, Filter, Plus, ChevronLeft, ChevronRight, AlertCircle, User } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const AdminList = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    admins,
    loading: contextLoading,
    error,
    filters,
    pagination,
    isSuperAdmin,
    getAdmins,
    changePage,
    setFilters,
    updateAdminStatus,
  } = useAdmin()

  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [setAdmins] = useState([]) // Declare setAdmins

  // Check if user has permission to access this page
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/profile")
    }
  }, [isSuperAdmin, navigate])

  // Load admins on mount
  useEffect(() => {
    getAdmins()
  }, [])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        getAdmins({ search: searchQuery, page: 1 })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Apply filters
  const applyFilters = () => {
    getAdmins({
      role: roleFilter,
      status: statusFilter,
      page: 1,
    })
    setShowFilters(false)
  }

  // Reset filters
  const resetFilters = () => {
    setRoleFilter("")
    setStatusFilter("")
    getAdmins({
      role: "",
      status: "",
      page: 1,
    })
    setShowFilters(false)
  }

  // Navigate to admin details
  const viewAdmin = (id) => {
    // Only navigate to view details, not edit
    navigate(`/admins/${id}`)
  }

  // Navigate to create admin page
  const createAdmin = () => {
    navigate("/admins/create")
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get role badge class
  const getRoleBadge = (role) => {
    return role === "super_admin" ? "bg-ramesh-gold/20 text-ramesh-gold" : "bg-blue-100 text-blue-800"
  }

  // Add a new function to update admin status using the dedicated API
  const updateAdminStatusOld = async (adminId, newStatus) => {
    setLoading(true)
    try {
      // Call the dedicated status update API endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/admins/${adminId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.status === "success") {
        toast.success(data.message || "Admin status updated successfully")

        // Update the admin in the list
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) => (admin.id === adminId ? { ...admin, status: newStatus } : admin)),
        )
        return true
      } else {
        toast.error(data.message || "Failed to update admin status")
        return false
      }
    } catch (err) {
      console.error("Error updating admin status:", err)
      toast.error("An error occurred while updating admin status")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Add a new function to handle status change
  const handleStatusChange = (adminId, currentStatus) => {
    // Create a modal or dialog for status selection
    const newStatus = window.prompt(
      `Change admin status from "${currentStatus.toUpperCase()}" to another status.\nEnter one of: active, inactive, suspended`,
    )

    if (!newStatus) return // User cancelled

    if (!["active", "inactive", "suspended"].includes(newStatus)) {
      toast.error("Invalid status. Must be one of: active, inactive, suspended")
      return
    }

    if (newStatus === currentStatus) {
      toast.info("Status unchanged")
      return
    }

    // Call the context method to update status
    updateAdminStatus(adminId, newStatus)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">Manage all admin users in the system</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            className="flex items-center px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90"
            onClick={createAdmin}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <div className="flex space-x-2">
              <button className="text-sm text-gray-600 hover:text-gray-900" onClick={resetFilters}>
                Reset
              </button>
              <button
                className="px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90"
                onClick={applyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="roleFilter"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Admin list */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {contextLoading || loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ramesh-gold"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No admins found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => viewAdmin(admin.id)}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {admin.profile_image_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={admin.profile_image_url || "/placeholder.svg"}
                              alt={`${admin.first_name} ${admin.last_name}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-ramesh-gold/20 flex items-center justify-center text-ramesh-gold font-medium">
                              {admin.first_name?.[0]}
                              {admin.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.first_name} {admin.last_name}
                          </div>
                          <div className="text-sm text-gray-500">ID: {admin.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">@{admin.username}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(admin.role)}`}
                      >
                        {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(admin.status)} ${isSuperAdmin ? "cursor-pointer hover:opacity-80" : ""}`}
                        onClick={(e) => {
                          if (isSuperAdmin) {
                            e.stopPropagation() // Prevent row click
                            handleStatusChange(admin.id, admin.status)
                          }
                        }}
                        title={isSuperAdmin ? "Click to change status" : ""}
                      >
                        {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!contextLoading && !loading && admins.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => changePage(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => changePage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * filters.limit + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * filters.limit, pagination.totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => changePage(1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">First</span>
                    <ChevronLeft className="h-5 w-5" />
                    <ChevronLeft className="h-5 w-5 -ml-1" />
                  </button>
                  <button
                    onClick={() => changePage(Math.max(1, pagination.currentPage - 1))}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.currentPage === pageNumber
                            ? "z-10 bg-ramesh-gold border-ramesh-gold text-white"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => changePage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => changePage(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Last</span>
                    <ChevronRight className="h-5 w-5" />
                    <ChevronRight className="h-5 w-5 -ml-1" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminList
