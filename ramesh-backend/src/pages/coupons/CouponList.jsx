"use client"

import { useEffect, useState, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCoupon } from "../../contexts/CouponContext"
import {
  PlusCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  Percent,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
  Filter,
  X,
  Edit,
  IndianRupee,
  AlertCircle,
  HelpCircle,
  User,
  BarChart3,
} from "lucide-react"
import { toast } from "react-toastify"
import { useDebounce } from "../../hooks/usedebounce"

const CouponList = () => {
  const navigate = useNavigate()
  const { coupons, loading, error, pagination, fetchCoupons, deleteCoupon, restoreCoupon, clearError, meta } =
    useCoupon()

  const [isProcessing, setIsProcessing] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Check if user is superadmin from the meta data returned by the API
  const isSuperAdmin = meta?.is_super_admin || false

  // Server-side filtering state
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [discountType, setDiscountType] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500)

  // Fetch coupons when filters change
  const fetchCouponsWithFilters = useCallback(() => {
    const params = {
      page: currentPage,
      per_page: 10,
    }

    // Add search parameter
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim()
    }

    // Add status filter
    if (status && status !== "all") {
      params.status = status
    }

    // Add discount type filter
    if (discountType) {
      params.discount_type = discountType
    }

    fetchCoupons(params)
  }, [currentPage, debouncedSearch, status, discountType, fetchCoupons])

  // Fetch coupons on initial load and when filters change
  useEffect(() => {
    fetchCouponsWithFilters()
  }, [fetchCouponsWithFilters])

  // Reset to first page when search or filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearch, status, discountType])

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    switch (filter) {
      case "status":
        setStatus(value)
        break
      case "discountType":
        setDiscountType(value)
        break
      default:
        break
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setSearch("")
    setStatus("all")
    setDiscountType("")
    setCurrentPage(1)
  }

  // Handle restore coupon
  const handleRestoreCoupon = async (id) => {
    if (isProcessing) return

    setIsProcessing(true)
    clearError()

    try {
      const response = await restoreCoupon(id)

      if (response && response.status === "success") {
        toast.success(response.message || "Coupon restored successfully")
        // Refresh the list to get updated data
        fetchCouponsWithFilters()
      } else if (response && response.status === "error") {
        toast.error(response.message || "Failed to restore coupon")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle delete coupon
  const handleDeleteCoupon = async (id, code) => {
    if (isProcessing) return

    if (window.confirm(`Are you sure you want to delete the coupon "${code}"?`)) {
      setIsProcessing(true)
      clearError()

      try {
        const response = await deleteCoupon(id)

        if (response && response.status === "success") {
          toast.success(response.message || "Coupon deleted successfully")
          // Refresh the list to get updated data
          fetchCouponsWithFilters()
        } else if (response && response.status === "error") {
          toast.error(response.message || "Failed to delete coupon")
        }
      } finally {
        setIsProcessing(false)
      }
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Render discount value based on type
  const renderDiscountValue = (coupon) => {
    if (coupon.discount_type === "percentage") {
      return (
        <span className="flex items-center">
          <Percent className="h-4 w-4 mr-1 text-ramesh-gold" />
          {coupon.discount_value}%
        </span>
      )
    } else {
      return (
        <span className="flex items-center">
          <IndianRupee className="h-4 w-4 mr-1 text-ramesh-gold" />
          {coupon.discount_value}
        </span>
      )
    }
  }

  // Helper function to render per user limit
  const renderPerUserLimit = (coupon) => {
    if (!coupon.per_user_limit || coupon.per_user_limit <= 0) {
      return null
    }

    return (
      <div className="text-xs text-gray-500 mt-1">
        <span className="inline-flex items-center">
          <User className="h-3 w-3 mr-1 text-gray-400" />
          {coupon.per_user_limit} per user
        </span>
      </div>
    )
  }

  // Function to highlight search terms in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  // Handle row click
  const handleRowClick = (couponId) => {
    navigate(`/coupons/${couponId}`)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Help tooltip */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-ramesh-gold" />
              Coupon Management Help
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What am I looking at?</h4>
                <p>This page shows all the discount coupons available in your system.</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">On this page you can:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>View all coupons with their codes, discount values, and validity periods</li>
                  <li>Filter coupons by status (active, inactive{isSuperAdmin ? ", deleted" : ""})</li>
                  <li>Search for specific coupons by code or name</li>
                  <li>Create new coupons using the "Create Coupon" button</li>
                  <li>Edit or delete existing coupons using the action buttons</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Active coupons can be used by customers</li>
                  <li>Inactive coupons exist in the system but cannot be used</li>
                  {isSuperAdmin && <li>Deleted coupons can be restored if needed</li>}
                  <li>Click on any coupon row to view its full details</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90"
                onClick={() => setShowHelp(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage discount coupons for your customers</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/coupons/statistics"
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            title="Statistics"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </Link>

          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            title="Help"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <Link
            to="/coupons/create"
            className="flex items-center px-4 py-2.5 bg-ramesh-gold text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Coupon
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
          <button onClick={clearError} className="text-red-700 hover:text-red-900">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700 flex items-center">
              <Filter className="h-4 w-4 mr-2 text-ramesh-gold" />
              Filters
            </h3>
            <button onClick={resetFilters} className="text-sm text-ramesh-gold hover:underline flex items-center">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30"
                value={status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="all">All Coupons</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                {isSuperAdmin && <option value="deleted">Deleted</option>}
              </select>
            </div>

            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                id="typeFilter"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30"
                value={discountType}
                onChange={(e) => handleFilterChange("discountType", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search coupons by code, name or description..."
            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30"
            value={search}
            onChange={handleSearchChange}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <div className="text-sm text-gray-500">
          {pagination.total > 0 ? (
            <span>
              Showing {pagination.from} to {pagination.to} of {pagination.total} coupons
            </span>
          ) : (
            <span>No coupons found</span>
          )}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && coupons.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ramesh-gold"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center p-8">
            <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No coupons found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {status === "deleted"
                ? "No deleted coupons found."
                : "Try adjusting your search or filter to find what you're looking for."}
            </p>
            {status !== "deleted" && (
              <button
                onClick={() => navigate("/coupons/create")}
                className="mt-4 inline-flex items-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ramesh-gold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ramesh-gold"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create New Coupon
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className={`hover:bg-gray-50 ${coupon.is_deleted || coupon.deleted_at ? "bg-gray-50" : ""} cursor-pointer`}
                    onClick={() => handleRowClick(coupon.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-ramesh-gold mr-2" />
                        <span
                          className={`font-medium ${coupon.is_deleted || coupon.deleted_at ? "text-gray-500 line-through" : "text-gray-900"}`}
                        >
                          {highlightText(coupon.code, debouncedSearch)}
                        </span>
                        {(coupon.is_deleted || coupon.deleted_at) && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Deleted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${coupon.is_deleted || coupon.deleted_at ? "text-gray-500" : "text-gray-900"}`}
                      >
                        {highlightText(coupon.name, debouncedSearch)}
                      </div>
                      {coupon.description && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {highlightText(coupon.description, debouncedSearch)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${coupon.is_deleted || coupon.deleted_at ? "text-gray-500" : "text-gray-900"}`}
                      >
                        {renderDiscountValue(coupon)}
                      </div>
                      {coupon.minimum_order_value > 0 && (
                        <div className="text-xs text-gray-500">Min. Order: ₹{coupon.minimum_order_value}</div>
                      )}
                      {coupon.maximum_discount_amount > 0 && (
                        <div className="text-xs text-gray-500">Max. Discount: ₹{coupon.maximum_discount_amount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(coupon.start_date)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        {coupon.end_date ? formatDate(coupon.end_date) : "No Expiry"}
                      </div>
                      {coupon.usage_limit > 0 && (
                        <div className="text-xs text-gray-500 mt-1">Limit: {coupon.usage_limit} uses</div>
                      )}
                      {renderPerUserLimit(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.is_deleted || coupon.deleted_at ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <Trash2 className="h-4 w-4 mr-1" /> Deleted
                        </span>
                      ) : coupon.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <XCircle className="h-4 w-4 mr-1" /> Inactive
                        </span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end space-x-3">
                        {!coupon.is_deleted && !coupon.deleted_at && (
                          <Link
                            to={`/coupons/${coupon.id}/edit`}
                            className="text-ramesh-gold hover:text-opacity-70 bg-yellow-50 p-2 rounded-lg hover:bg-yellow-100 transition-colors flex items-center"
                            title="Edit Coupon"
                          >
                            <Edit className="h-5 w-5 mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Link>
                        )}

                        {coupon.is_deleted || coupon.deleted_at ? (
                          isSuperAdmin &&
                          coupon.can_restore && (
                            <button
                              onClick={() => handleRestoreCoupon(coupon.id)}
                              className="text-green-600 hover:text-green-800 bg-green-50 p-2 rounded-lg hover:bg-green-100 transition-colors flex items-center"
                              title="Restore Coupon"
                              disabled={isProcessing}
                            >
                              <RotateCcw className={`h-5 w-5 mr-1 ${isProcessing ? "animate-spin" : ""}`} />
                              <span className="hidden sm:inline">Restore</span>
                            </button>
                          )
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCoupon(coupon.id, coupon.code)
                            }}
                            className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                            title="Delete Coupon"
                            disabled={isProcessing}
                          >
                            <Trash2 className="h-5 w-5 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{pagination.from}</span> to{" "}
                  <span className="font-medium">{pagination.to}</span> of{" "}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  {[...Array(pagination.last_page).keys()].map((page) => {
                    const pageNumber = page + 1
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.last_page ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? "z-10 bg-ramesh-gold border-ramesh-gold text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    } else if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === pagination.last_page - 1 && currentPage < pagination.last_page - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      )
                    }
                    return null
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === pagination.last_page
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
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

export default CouponList
