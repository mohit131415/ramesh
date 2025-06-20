"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useUser } from "../../contexts/UserContext"
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Check,
  X,
  BarChart2,
  Download,
  HelpCircle,
} from "lucide-react"

const UserList = () => {
  const navigate = useNavigate()
  const { users, loading, error, meta, fetchUsers, updateUserStatus, exportUsers } = useUser()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    has_profile: "",
  })

  // UI state
  const [showFilters, setShowFilters] = useState(false)
  const [updating, setUpdating] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportDates, setExportDates] = useState({
    start_date: "",
    end_date: "",
  })

  // Load users on initial render and when filters/pagination change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    }

    // Only add non-empty filters
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    if (filters.status) {
      params.status = filters.status
    }
    if (filters.has_profile) {
      params.has_profile = filters.has_profile
    }

    fetchUsers(params)
  }, [currentPage, itemsPerPage, filters, fetchUsers])

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1) // Reset to first page when applying filters
    const params = {
      page: 1,
      limit: itemsPerPage,
    }

    // Only add non-empty filters
    if (filters.search.trim()) {
      params.search = filters.search.trim()
    }
    if (filters.status) {
      params.status = filters.status
    }
    if (filters.has_profile) {
      params.has_profile = filters.has_profile
    }

    fetchUsers(params)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      has_profile: "",
    })
    setCurrentPage(1)
    fetchUsers({ page: 1, limit: itemsPerPage })
  }

  // Handle status update
  const handleStatusUpdate = async (userId, newStatus) => {
    setUpdating(userId)
    try {
      await updateUserStatus(userId, newStatus)
      // Refresh the current page
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      }

      // Only add non-empty filters
      if (filters.search.trim()) {
        params.search = filters.search.trim()
      }
      if (filters.status) {
        params.status = filters.status
      }
      if (filters.has_profile) {
        params.has_profile = filters.has_profile
      }

      fetchUsers(params)
    } finally {
      setUpdating(null)
    }
  }

  // Handle export date change
  const handleExportDateChange = (e) => {
    const { name, value } = e.target
    setExportDates((prev) => ({ ...prev, [name]: value }))
  }

  // Handle export
  const handleExport = async () => {
    setExporting(true)
    try {
      const exportParams = {
        format: "csv",
      }

      // Add date filters if they exist
      if (exportDates.start_date) {
        exportParams.registration_date_from = exportDates.start_date
      }
      if (exportDates.end_date) {
        exportParams.registration_date_to = exportDates.end_date
      }

      await exportUsers(exportParams)
      setShowExportModal(false)
      setExportDates({ start_date: "", end_date: "" })
    } finally {
      setExporting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return ""
    return phone
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">View and manage app users</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {}} // Help functionality
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            Show Filters
            {(filters.status || filters.has_profile) && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-ramesh-gold text-white">
                {[filters.status, filters.has_profile].filter(Boolean).length}
              </span>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </button>
          <Link
            to="/users/statistics"
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            User Statistics
          </Link>
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 bg-ramesh-gold text-white rounded-md hover:bg-ramesh-gold/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Users</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={exportDates.start_date}
                  onChange={handleExportDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ramesh-gold focus:border-ramesh-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={exportDates.end_date}
                  onChange={handleExportDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ramesh-gold focus:border-ramesh-gold"
                />
              </div>
              <p className="text-sm text-gray-500">
                Leave dates empty to export all users. Date range filters by registration date.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowExportModal(false)
                  setExportDates({ start_date: "", end_date: "" })
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={exporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Exporting...
                  </>
                ) : (
                  "Export CSV"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters()
                }
              }}
              placeholder="Search users by phone, name or email"
              className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-ramesh-gold focus:border-ramesh-gold transition-all duration-300"
            />
            {filters.search && (
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: "" }))
                  setCurrentPage(1)
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ramesh-gold focus:border-ramesh-gold"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Has Profile</label>
                <select
                  name="has_profile"
                  value={filters.has_profile}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ramesh-gold focus:border-ramesh-gold"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-ramesh-gold text-white rounded-md hover:bg-ramesh-gold/90"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Showing count */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
          Showing {users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, meta?.total || 0)} of {meta?.total || 0} users
        </div>

        {/* Users table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                Please try adjusting your search criteria or check your connection.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Profile Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Activity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-yellow-50 hover:border-l-4 hover:border-ramesh-gold transition-all duration-300"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profile?.profile_picture ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`/imageapi/api/${user.profile.profile_picture}`}
                              alt={user.profile.full_name}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.profile.full_name || "User",
                                )}&background=FFB800&color=fff`
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-ramesh-gold flex items-center justify-center text-white font-medium">
                              {user.profile?.first_name?.[0] || user.phone_number?.[0] || "U"}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile?.full_name || "No Name Set"}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {formatPhoneNumber(user.phone_number)}
                          </div>
                          <div className="text-xs text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        {user.profile?.email ? (
                          <>
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="truncate max-w-[150px]">{user.profile.email}</span>
                          </>
                        ) : (
                          <span className="text-gray-500">No email</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {user.address_count} {user.address_count === 1 ? "address" : "addresses"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.profile?.gender ? (
                          <span className="capitalize">{user.profile.gender}</span>
                        ) : (
                          <span className="text-gray-500">Gender not set</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        {user.profile?.date_of_birth ? (
                          <>
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {new Date(user.profile.date_of_birth).toLocaleDateString()}
                          </>
                        ) : (
                          <span className="text-gray-500">DOB not set</span>
                        )}
                      </div>
                      <div className="text-sm mt-1">
                        {user.has_complete_profile ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Incomplete
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status === "active" ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Last login:</span>{" "}
                        {user.last_login_at ? formatDate(user.last_login_at) : "Never"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Joined:</span> {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-all duration-300 hover:shadow-md"
                        >
                          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(user.id, user.status === "active" ? "inactive" : "active")}
                          disabled={updating === user.id}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          {updating === user.id ? "Updating..." : user.status === "active" ? "Deactivate" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => (prev < meta.total_pages ? prev + 1 : prev))}
                disabled={currentPage >= meta.total_pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, meta.total || 0)}</span> of{" "}
                  <span className="font-medium">{meta.total || 0}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, meta.total_pages || 1) }, (_, i) => {
                    let pageNum
                    if (meta.total_pages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= meta.total_pages - 2) {
                      pageNum = meta.total_pages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-ramesh-gold border-ramesh-gold text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setCurrentPage((prev) => (prev < meta.total_pages ? prev + 1 : prev))}
                    disabled={currentPage >= meta.total_pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
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

export default UserList
