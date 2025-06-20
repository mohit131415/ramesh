"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  LogOut,
  ChevronDown,
  Trash2,
  Eye,
} from "lucide-react"
import activityService from "../../services/activityService"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"

const ActivityLogs = () => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "super_admin"

  // State for activities and filters
  const [allActivities, setAllActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [filterOptions, setFilterOptions] = useState({
    modules: [],
    actions: [],
    users: [],
    roles: [],
  })

  // State for active filters
  const [activeFilters, setActiveFilters] = useState({
    modules: [],
    actions: [],
    users: [],
    roles: [],
    search: "",
    dateRange: {
      start: "",
      end: "",
    },
    excludeActivityTracking: true, // Default to exclude ActivityTracking
    excludeTokenActivities: true, // Add this new filter to exclude token activities
    logType: "all", // Add this line
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [moduleSearchQuery, setModuleSearchQuery] = useState("")
  const [actionSearchQuery, setActionSearchQuery] = useState("")
  const [userSearchQuery, setUserSearchQuery] = useState("")

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 50,
  })

  // Complete filtered data for export
  const [completeFilteredData, setCompleteFilteredData] = useState([])

  // Add this after the existing state declarations
  const [logType, setLogType] = useState("all") // 'all', 'admin', 'customer'

  // Load filters and activities on mount - but only once
  useEffect(() => {
    if (!initialLoadComplete) {
      loadFilterOptions()
      loadActivities()
      setInitialLoadComplete(true)
    }
  }, [initialLoadComplete])

  // Update search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setActiveFilters((prev) => ({
        ...prev,
        search: searchQuery,
      }))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Apply filters whenever activeFilters change
  useEffect(() => {
    if (initialLoadComplete) {
      applyFilters()
    }
  }, [activeFilters, initialLoadComplete])

  // Add this useEffect after the existing useEffect hooks
  useEffect(() => {
    setActiveFilters((prev) => ({
      ...prev,
      logType: logType,
    }))
  }, [logType])

  // Load available filter options
  const loadFilterOptions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await activityService.getFilters()

      if (response.status === "success") {
        setFilterOptions(
          response.data || {
            modules: [],
            actions: [],
            users: [],
            roles: [],
          },
        )
      } else {
        setError(response.message || "Failed to load filters")
      }
    } catch (err) {
      setError("Failed to load filters. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Load all activities
  const loadActivities = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await activityService.getAllActivities()

      if (response.status === "success") {
        setAllActivities(response.data || [])

        // Apply initial filters
        applyFilters()
      } else {
        setError(response.message || "Failed to load activities")
        setAllActivities([])
      }
    } catch (err) {
      setError("Failed to load activities. Please try again.")
      console.error("Error loading activities:", err)
      setAllActivities([])
    } finally {
      setLoading(false)
    }
  }

  // Apply filters to the activities using server-side filtering
  const applyFilters = async () => {
    setLoading(true)
    setError(null)

    try {
      // Call the server-side filtering API
      const response = await activityService.getFilteredActivities(activeFilters)

      if (response.status === "success") {
        // Store the complete filtered dataset for export
        setCompleteFilteredData(response.data || [])

        // Calculate pagination
        const totalItems = response.data.length
        const totalPages = Math.ceil(totalItems / pagination.perPage)

        // Update pagination
        setPagination((prev) => ({
          ...prev,
          totalItems,
          totalPages,
          currentPage: Math.min(prev.currentPage, totalPages || 1),
        }))

        // Apply pagination for display
        const startIndex = (pagination.currentPage - 1) * pagination.perPage
        const paginatedResult = response.data.slice(startIndex, startIndex + pagination.perPage)

        setFilteredActivities(paginatedResult)
      } else {
        setError(response.message || "Failed to apply filters")
        setFilteredActivities([])
        setCompleteFilteredData([])
      }
    } catch (err) {
      setError("Failed to apply filters. Please try again.")
      console.error("Error applying filters:", err)
      setFilteredActivities([])
      setCompleteFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setActiveFilters({
      modules: [],
      actions: [],
      users: [],
      roles: [],
      search: "",
      dateRange: {
        start: "",
        end: "",
      },
      excludeActivityTracking: true, // Keep this default
      excludeTokenActivities: true,
      logType: "all",
    })
    setSearchQuery("")
    setModuleSearchQuery("")
    setActionSearchQuery("")
    setUserSearchQuery("")

    // Reset pagination to first page
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
  }

  // Toggle ActivityTracking filter
  const toggleActivityTrackingFilter = () => {
    setActiveFilters((prev) => ({
      ...prev,
      excludeActivityTracking: !prev.excludeActivityTracking,
    }))
  }

  // Toggle token activities filter
  const toggleTokenActivitiesFilter = () => {
    setActiveFilters((prev) => ({
      ...prev,
      excludeTokenActivities: !prev.excludeTokenActivities,
    }))
  }

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => {
      const currentValues = prev[filterType]

      // If it's already selected, remove it
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [filterType]: currentValues.filter((item) => item !== value),
        }
      }
      // Otherwise add it
      else {
        return {
          ...prev,
          [filterType]: [...currentValues, value],
        }
      }
    })

    // Reset to first page when filters change
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
  }

  // Handle date range changes
  const handleDateChange = (field, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }))

    // Reset to first page when date changes
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
  }

  // Set page
  const setPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return

    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }))

    // Apply pagination to the complete filtered data
    const startIndex = (page - 1) * pagination.perPage
    const paginatedResult = completeFilteredData.slice(startIndex, startIndex + pagination.perPage)
    setFilteredActivities(paginatedResult)
  }

  // Delete all activities
  const deleteAllActivities = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await activityService.deleteAllActivities()

      if (response.status === "success") {
        setSuccess("All activity logs deleted successfully")
        toast.success("All activity logs deleted successfully")
        setAllActivities([])
        setFilteredActivities([])
        setCompleteFilteredData([])
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          perPage: 50,
        })

        // Clear the cache
        localStorage.removeItem("activity_logs")
        localStorage.removeItem("activity_cache_timestamp")
      } else {
        setError(response.message || "Failed to delete activity logs")
        toast.error(response.message || "Failed to delete activity logs")
      }
    } catch (err) {
      setError("Failed to delete activity logs. Please try again.")
      toast.error("Failed to delete activity logs. Please try again.")
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  // Export all filtered activities as CSV
  const exportActivities = () => {
    if (completeFilteredData.length === 0) return

    // Create CSV content from the complete filtered dataset
    const headers = ["ID", "User", "Role", "Module", "Action", "Description", "IP Address", "Date & Time"]
    const rows = completeFilteredData.map((activity) => [
      activity.id,
      activity.user_name || `User #${activity.user_id}`,
      activity.user_role || "User",
      activity.module,
      activity.action,
      activity.description || activity.route,
      activity.ip_address,
      new Date(activity.created_at).toLocaleString(),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `activity-logs-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Parse JSON data from activity
  const parseActivityData = (activity) => {
    try {
      if (!activity.data) return null
      return JSON.parse(activity.data)
    } catch (e) {
      console.error("Error parsing activity data:", e)
      return null
    }
  }

  // Get formatted description based on activity type
  const getFormattedDescription = (activity) => {
    try {
      if (!activity.data) return activity.description || activity.route

      // Try to parse the data
      let data
      try {
        data = typeof activity.data === "string" ? JSON.parse(activity.data) : activity.data
      } catch (e) {
        return activity.description || activity.route
      }

      const actionLower = activity.action?.toLowerCase() || ""
      const moduleLower = activity.module?.toLowerCase() || ""

      // Authentication activities
      if (moduleLower === "authentication") {
        if (actionLower === "login") {
          const userName = data.user ? `${data.user.first_name} ${data.user.last_name}` : "User"
          const role = data.user?.role ? ` as ${data.user.role.replace("_", " ")}` : ""
          return `${userName} logged in${role}`
        }
        if (actionLower === "logout") {
          return "User logged out successfully"
        }
        if (actionLower === "refreshtoken") {
          return "Authentication token refreshed"
        }
        if (actionLower === "validatetoken") {
          return "Authentication token validated"
        }
      }

      // Admin Management
      if (moduleLower === "adminmanagement") {
        if (actionLower.includes("create")) {
          if (data.data) {
            return `Created new admin account: ${data.data.first_name} ${data.data.last_name} (${data.data.email}) with ${data.data.role || "admin"} role`
          }
          return "Created new admin account"
        }

        if (actionLower.includes("update")) {
          if (data.data) {
            const statusChange = data.data.status ? ` - Status changed to ${data.data.status}` : ""
            return `Updated admin account: ${data.data.first_name} ${data.data.last_name} (${data.data.email})${statusChange}`
          }
          return "Updated admin account"
        }

        if (actionLower.includes("delete")) {
          if (data.data && data.data.id) {
            return `Deleted admin account with ID: ${data.data.id}`
          }
          return "Deleted admin account"
        }

        if (actionLower.includes("view")) {
          const id = activity.route.split("/").pop()
          return isNaN(id) ? "Viewed admin accounts list" : `Viewed admin account details (ID: ${id})`
        }
      }

      // Product Catalog - Categories
      if (
        moduleLower === "productcatalog" &&
        actionLower.includes("category") &&
        !actionLower.includes("subcategory")
      ) {
        if (actionLower.includes("create")) {
          if (data.data) {
            return `Created new category: "${data.data.name}" with ${data.data.status} status`
          }
          return "Created new product category"
        }

        if (actionLower.includes("update")) {
          if (data.data) {
            return `Updated category: "${data.data.name}" (ID: ${data.data.id})`
          }
          return "Updated product category"
        }

        if (actionLower.includes("delete")) {
          if (data.data && data.data.id) {
            return `Deleted category with ID: ${data.data.id}`
          }
          return "Deleted product category"
        }

        if (actionLower.includes("view")) {
          const id = activity.route.split("/").pop()
          return isNaN(id) ? "Viewed categories list" : `Viewed category details (ID: ${id})`
        }
      }

      // Product Catalog - Subcategories
      if (moduleLower === "productcatalog" && actionLower.includes("subcategory")) {
        if (actionLower.includes("create")) {
          if (data.data) {
            return `Created new subcategory: "${data.data.name}" under category "${data.data.category_name || "Unknown"}"`
          }
          return "Created new product subcategory"
        }

        if (actionLower.includes("update")) {
          if (data.data) {
            return `Updated subcategory: "${data.data.name}" (ID: ${data.data.id})`
          }
          return "Updated product subcategory"
        }

        if (actionLower.includes("delete")) {
          if (data.data && data.data.id) {
            return `Deleted subcategory with ID: ${data.data.id}`
          }
          return "Deleted product subcategory"
        }

        if (actionLower.includes("view")) {
          const id = activity.route.split("/").pop()
          return isNaN(id) ? "Viewed subcategories list" : `Viewed subcategory details (ID: ${id})`
        }
      }

      // Product Catalog - Products
      if (
        moduleLower === "productcatalog" &&
        actionLower.includes("product") &&
        !actionLower.includes("productvariant") &&
        !actionLower.includes("productimage")
      ) {
        if (actionLower === "createproduct") {
          if (data.data) {
            return `Created new product: "${data.data.name}" in ${data.data.category_name || "Unknown"} category`
          }
          return "Created new product"
        }

        if (actionLower === "updateproduct") {
          if (data.data) {
            return `Updated product: "${data.data.name}" (ID: ${data.data.id})`
          }
          return "Updated product details"
        }

        if (actionLower === "deleteproduct") {
          if (data.data && data.data.id) {
            return `Deleted product with ID: ${data.data.id}`
          }
          return "Deleted product"
        }

        if (actionLower.includes("view")) {
          const id = activity.route.split("/").pop()
          return isNaN(id) ? "Viewed products list" : `Viewed product details (ID: ${id})`
        }
      }

      // Product Catalog - Product Variants
      if (moduleLower === "productcatalog" && actionLower.includes("productvariant")) {
        if (actionLower.includes("create")) {
          if (data.data) {
            return `Created new variant "${data.data.variant_name}" (SKU: ${data.data.sku}) for product "${data.data.product_name || "Unknown"}"`
          }
          return "Created new product variant"
        }

        if (actionLower.includes("update")) {
          if (data.data) {
            return `Updated variant "${data.data.variant_name}" (SKU: ${data.data.sku}) for product "${data.data.product_name || "Unknown"}"`
          }
          return "Updated product variant"
        }

        if (actionLower.includes("delete")) {
          if (data.data && data.data.id) {
            return `Deleted product variant with ID: ${data.data.id}`
          }
          return "Deleted product variant"
        }
      }

      // Product Catalog - Product Images
      if (moduleLower === "productcatalog" && actionLower.includes("productimage")) {
        if (actionLower.includes("create")) {
          if (data.data) {
            return `Added new image for product ID: ${data.data.product_id} (${data.data.is_primary ? "Primary" : "Secondary"} image)`
          }
          return "Added new product image"
        }

        if (actionLower.includes("update")) {
          if (data.data) {
            return `Updated image for product ID: ${data.data.product_id}`
          }
          return "Updated product image"
        }

        if (actionLower.includes("delete")) {
          return "Deleted product image"
        }

        if (actionLower.includes("batchupdate") || actionLower.includes("imageorder")) {
          if (data.data && data.data.updated_count) {
            return `Reordered ${data.data.updated_count} product images`
          }
          return "Updated product image order"
        }
      }

      // Product Catalog - Tags
      if (moduleLower === "productcatalog" && actionLower.includes("tag")) {
        if (actionLower.includes("create")) {
          if (data.data) {
            return `Created new tag: "${data.data.name}"`
          }
          return "Created new product tag"
        }

        if (actionLower.includes("update")) {
          if (data.data) {
            return `Updated tag: "${data.data.name}"`
          }
          return "Updated product tag"
        }

        if (actionLower.includes("delete")) {
          if (data.data && data.data.id) {
            return `Deleted tag with ID: ${data.data.id}`
          }
          return "Deleted product tag"
        }
      }

      // Coupons
      if (moduleLower === "couponmanagement" || (moduleLower === "productcatalog" && actionLower.includes("coupon"))) {
        if (actionLower.includes("create")) {
          if (data.data) {
            return `Created new coupon: "${data.data.code}" with ${data.data.discount_type || "standard"} discount`
          }
          return "Created new coupon"
        }

        if (actionLower.includes("update")) {
          if (data.data) {
            return `Updated coupon: "${data.data.code}"`
          }
          return "Updated coupon"
        }

        if (actionLower.includes("delete")) {
          if (data.data && data.data.id) {
            return `Deleted coupon with ID: ${data.data.id}`
          }
          return "Deleted coupon"
        }

        if (actionLower.includes("view")) {
          const id = activity.route.split("/").pop()
          return isNaN(id) ? "Viewed coupons list" : `Viewed coupon details (ID: ${id})`
        }
      }

      // Orders
      if (moduleLower === "ordermanagement") {
        if (actionLower.includes("create")) {
          if (data.data) {
            return `Created new order #${data.data.order_number || data.data.id} for ${data.data.customer_name || "customer"}`
          }
          return "Created new order"
        }

        if (actionLower.includes("update")) {
          if (data.data) {
            const statusInfo = data.data.status ? ` - Status changed to ${data.data.status}` : ""
            return `Updated order #${data.data.order_number || data.data.id}${statusInfo}`
          }
          return "Updated order"
        }

        if (actionLower.includes("cancel")) {
          if (data.data) {
            return `Cancelled order #${data.data.order_number || data.data.id}`
          }
          return "Cancelled order"
        }

        if (actionLower.includes("ship") || actionLower.includes("delivery")) {
          if (data.data) {
            return `Updated shipping for order #${data.data.order_number || data.data.id} - Status: ${data.data.status || "shipped"}`
          }
          return "Updated order shipping status"
        }

        if (actionLower.includes("view")) {
          const id = activity.route.split("/").pop()
          return isNaN(id) ? "Viewed orders list" : `Viewed order details (ID: ${id})`
        }
      }

      // Activity Logs
      if (moduleLower === "activitytracking") {
        if (actionLower === "deletealllogs") {
          if (data.data && data.data.count) {
            return `Deleted ${data.data.count} activity logs`
          }
          return "Deleted all activity logs"
        }

        if (actionLower.includes("view") || actionLower.includes("get")) {
          if (actionLower === "getfilters") {
            return "Retrieved activity log filters"
          }
          return "Viewed activity logs"
        }
      }

      // Settings
      if (moduleLower === "settings") {
        if (actionLower.includes("update")) {
          if (data.data && data.data.setting_name) {
            return `Updated system setting: ${data.data.setting_name}`
          }
          return "Updated system settings"
        }

        if (actionLower.includes("view")) {
          return "Viewed system settings"
        }
      }

      // Default fallback for other actions
      if (actionLower.includes("create")) {
        return `Created new ${moduleLower.replace("management", "")}`
      }

      if (actionLower.includes("update")) {
        return `Updated ${moduleLower.replace("management", "")}`
      }

      if (actionLower.includes("delete")) {
        return `Deleted ${moduleLower.replace("management", "")}`
      }

      if (actionLower.includes("view") || actionLower.includes("get") || actionLower.includes("list")) {
        return `Viewed ${moduleLower.replace("management", "")}`
      }

      // If we can't determine a specific format, return the original description or route
      return activity.description || activity.route
    } catch (e) {
      console.error("Error formatting activity description:", e)
      return activity.description || activity.route
    }
  }

  // View activity details
  const viewActivityDetails = (activity) => {
    setSelectedActivity(activity)
    setShowDetailModal(true)
  }

  // Get action color and icon
  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case "create":
      case "createadmin":
      case "createcategory":
      case "createsubcategory":
      case "createproduct":
      case "createproductvariant":
      case "createproductimage":
      case "createtag":
      case "createcoupon":
        return "bg-green-100 text-green-800"
      case "update":
      case "updateadmin":
      case "updatecategory":
      case "updatesubcategory":
      case "updateproduct":
      case "updateproductvariant":
      case "updateproductimage":
      case "batchupdateproductimageorder":
        return "bg-blue-100 text-blue-800"
      case "delete":
      case "deleteadmin":
      case "deletecategory":
      case "deletesubcategory":
      case "deleteproduct":
      case "deleteproductvariant":
      case "deleteproductimage":
      case "deletetag":
      case "deletecoupon":
      case "deletealllogs":
        return "bg-red-100 text-red-800"
      case "login":
        return "bg-purple-100 text-purple-800"
      case "logout":
        return "bg-gray-100 text-gray-800"
      case "viewadmin":
      case "viewcategory":
      case "viewsubcategory":
      case "viewproduct":
      case "viewall":
      case "getfilters":
      case "listadmins":
      case "listcategories":
      case "listsubcategories":
      case "listproducts":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || ""

    if (actionLower.includes("create")) return <CheckCircle className="h-4 w-4" />
    if (actionLower.includes("update")) return <RefreshCw className="h-4 w-4" />
    if (actionLower.includes("delete")) return <XCircle className="h-4 w-4" />
    if (actionLower.includes("login")) return <User className="h-4 w-4" />
    if (actionLower.includes("logout")) return <LogOut className="h-4 w-4" />
    if (actionLower.includes("view") || actionLower.includes("get") || actionLower.includes("list"))
      return <FileText className="h-4 w-4" />

    return <Info className="h-4 w-4" />
  }

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count =
      activeFilters.modules.length +
      activeFilters.actions.length +
      activeFilters.users.length +
      activeFilters.roles.length +
      (activeFilters.dateRange.start ? 1 : 0) +
      (activeFilters.dateRange.end ? 1 : 0)

    // Count the ActivityTracking exclusion if it's active
    if (activeFilters.excludeActivityTracking) {
      count += 1
    }

    // Count the token activities exclusion if it's active
    if (activeFilters.excludeTokenActivities) {
      count += 1
    }

    return count
  }, [activeFilters])

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    return (
      filterOptions.modules?.filter((module) => module.toLowerCase().includes(moduleSearchQuery.toLowerCase())) || []
    )
  }, [filterOptions.modules, moduleSearchQuery])

  // Filter actions based on search query
  const filteredActions = useMemo(() => {
    return (
      filterOptions.actions?.filter((action) => action.toLowerCase().includes(actionSearchQuery.toLowerCase())) || []
    )
  }, [filterOptions.actions, actionSearchQuery])

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return (
      filterOptions.users?.filter(
        (user) => user && user.name && user.name.toLowerCase().includes(userSearchQuery.toLowerCase()),
      ) || []
    )
  }, [filterOptions.users, userSearchQuery])

  // Force refresh data
  const handleRefresh = () => {
    // Clear the initialLoadComplete flag to force a reload
    setInitialLoadComplete(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
          <p className="text-gray-600">Monitor all system activities and user actions</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-200"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2 text-gray-500" />
            Refresh
          </button>
          <button
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-200"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-ramesh-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-200"
            onClick={exportActivities}
            disabled={completeFilteredData.length === 0}
          >
            <Download className="h-4 w-4 mr-2 text-gray-500" />
            Export
          </button>
          {isSuperAdmin && (
            <button
              className="flex items-center px-4 py-2.5 bg-white border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 shadow-sm transition-all duration-200"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Success and error messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-200 shadow-sm">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start border border-green-200 shadow-sm">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{success}</div>
        </div>
      )}

      {/* Log Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setLogType("all")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                logType === "all"
                  ? "border-ramesh-gold text-ramesh-gold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Logs
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {pagination.totalItems}
              </span>
            </button>
            <button
              onClick={() => setLogType("admin")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                logType === "admin"
                  ? "border-ramesh-gold text-ramesh-gold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Admin Logs
              <span className="ml-2 bg-blue-100 text-blue-900 py-0.5 px-2.5 rounded-full text-xs">
                {completeFilteredData.filter((activity) => activity.is_admin === 1).length}
              </span>
            </button>
            <button
              onClick={() => setLogType("customer")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                logType === "customer"
                  ? "border-ramesh-gold text-ramesh-gold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Customer Logs
              <span className="ml-2 bg-green-100 text-green-900 py-0.5 px-2.5 rounded-full text-xs">
                {completeFilteredData.filter((activity) => activity.is_admin === 0).length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Search and quick filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent appearance-none shadow-sm"
                value={activeFilters.modules[0] || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    setActiveFilters((prev) => ({
                      ...prev,
                      modules: [value],
                    }))
                  } else {
                    setActiveFilters((prev) => ({
                      ...prev,
                      modules: [],
                    }))
                  }
                }}
              >
                <option value="">All Modules</option>
                {filterOptions.modules?.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="relative">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent appearance-none shadow-sm"
                value={activeFilters.actions[0] || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    setActiveFilters((prev) => ({
                      ...prev,
                      actions: [value],
                    }))
                  } else {
                    setActiveFilters((prev) => ({
                      ...prev,
                      actions: [],
                    }))
                  }
                }}
              >
                <option value="">All Actions</option>
                {filterOptions.actions?.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            <div className="flex space-x-3">
              <button
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors"
                onClick={resetFilters}
              >
                Reset
              </button>
              <button
                className="px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90 shadow-sm transition-all duration-200"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* ActivityTracking filter toggle */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-ramesh-gold focus:ring-ramesh-gold"
                checked={activeFilters.excludeActivityTracking}
                onChange={toggleActivityTrackingFilter}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Exclude ActivityTracking module</span>
            </label>
          </div>

          {/* Token activities filter toggle */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-ramesh-gold focus:ring-ramesh-gold"
                checked={activeFilters.excludeTokenActivities}
                onChange={toggleTokenActivitiesFilter}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Exclude token refresh and validation activities
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Modules</h4>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent text-sm"
                  value={moduleSearchQuery}
                  onChange={(e) => setModuleSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {filteredModules.map((module) => (
                  <label key={`module-${module}`} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-ramesh-gold focus:ring-ramesh-gold"
                      checked={activeFilters.modules.includes(module)}
                      onChange={() => handleFilterChange("modules", module)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{module}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent text-sm"
                  value={actionSearchQuery}
                  onChange={(e) => setActionSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {filteredActions.map((action) => (
                  <label key={`action-${action}`} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-ramesh-gold focus:ring-ramesh-gold"
                      checked={activeFilters.actions.includes(action)}
                      onChange={() => handleFilterChange("actions", action)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{action}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Users</h4>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent text-sm"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {filteredUsers.map((user) => {
                  const userId = user?.id || user?.user_id || null
                  if (!userId) return null

                  const userName =
                    user?.name ||
                    (user?.first_name && `${user.first_name} ${user.last_name || ""}`.trim()) ||
                    `Unknown User (ID: ${userId})`

                  return (
                    <label key={`user-${userId}`} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-ramesh-gold focus:ring-ramesh-gold"
                        checked={activeFilters.users.includes(userId.toString())}
                        onChange={() => handleFilterChange("users", userId.toString())}
                      />
                      <span className="ml-2 text-sm text-gray-700">{userName}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Date Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                      value={activeFilters.dateRange.start}
                      onChange={(e) => handleDateChange("start", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                      value={activeFilters.dateRange.end}
                      onChange={(e) => handleDateChange("end", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-bold">Delete All Activity Logs</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete all activity logs? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                onClick={deleteAllActivities}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </span>
                ) : (
                  "Delete All"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity detail modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Activity Details</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowDetailModal(false)}>
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="text-sm font-medium">{selectedActivity.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="text-sm font-medium">{new Date(selectedActivity.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="text-sm font-medium">
                  {selectedActivity.user_name || `User #${selectedActivity.user_id}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IP Address</p>
                <p className="text-sm font-medium">{selectedActivity.ip_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Module</p>
                <p className="text-sm font-medium">{selectedActivity.module}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Action</p>
                <p className="text-sm font-medium">{selectedActivity.action}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Route</p>
                <p className="text-sm font-medium">{selectedActivity.route}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Execution Time</p>
                <p className="text-sm font-medium">{selectedActivity.execution_time} seconds</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Request Data</p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-x-auto">
                <pre className="text-xs whitespace-pre-wrap">{selectedActivity.request_data}</pre>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Response Data</p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-x-auto">
                <pre className="text-xs whitespace-pre-wrap">{selectedActivity.data}</pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity logs table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading && !filteredActivities.length ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ramesh-gold"></div>
          </div>
        ) : error && !filteredActivities.length ? (
          <div className="p-6 text-red-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No activity logs found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your filters or search criteria to view activity logs
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="px-6 py-5 whitespace-nowrap align-top">
                      <div className="flex items-start">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center text-white mr-3 shadow-sm ${
                            activity.is_admin === 1
                              ? "bg-gradient-to-r from-blue-500 to-blue-600"
                              : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                        >
                          {activity.user_name?.[0] || <User className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.user_name || `Unknown User (ID: ${activity.user_id})`}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-500">{activity.user_role || "User"}</div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                activity.is_admin === 1 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {activity.user_type || (activity.is_admin === 1 ? "Admin" : "Customer")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}
                      >
                        {getActionIcon(activity.action)}
                        <span className="ml-1">{activity.action}</span>
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap align-top">
                      <div className="text-sm text-gray-900">{activity.module}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-900 max-w-xs whitespace-normal">
                        {getFormattedDescription(activity)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap align-top">
                      <div className="text-sm text-gray-500">{activity.ip_address}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap align-top">
                      <div className="text-sm text-gray-900">{new Date(activity.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap align-top">
                      <button
                        onClick={() => viewActivityDetails(activity)}
                        className="text-ramesh-gold hover:text-ramesh-gold/80 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredActivities.length > 0 && (
          <div className="px-6 py-4-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {filteredActivities.length > 0 ? (pagination.currentPage - 1) * pagination.perPage + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">First</span>
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-1" />
                  </button>
                  <button
                    onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
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

                    if (pageNumber <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.currentPage === pageNumber
                              ? "z-10 bg-ramesh-gold border-ramesh-gold text-white"
                              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    }
                    return null
                  })}

                  <button
                    onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Last</span>
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-1" />
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

export default ActivityLogs
