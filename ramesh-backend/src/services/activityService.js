import api from "./api"

// Helper to check if we're on the activity logs page
const isActivityLogsPage = () => {
  return window.location.pathname.includes("/activities") || window.location.pathname.includes("/activity-logs")
}

// Add a local cache for activity data
const ACTIVITY_CACHE = {
  filters: null,
  allActivities: null,
  filteredActivities: {},
  timestamp: 0,
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
}

// Check if cache is valid
const isCacheValid = () => {
  return ACTIVITY_CACHE.timestamp && Date.now() - ACTIVITY_CACHE.timestamp < ACTIVITY_CACHE.CACHE_DURATION
}

// Clear cache
const clearCache = () => {
  ACTIVITY_CACHE.filters = null
  ACTIVITY_CACHE.allActivities = null
  ACTIVITY_CACHE.filteredActivities = {}
  ACTIVITY_CACHE.timestamp = 0
}

const activityService = {
  getFilters: async () => {
    // Skip API call if not on activity logs page
    if (!isActivityLogsPage()) {
      return {
        status: "success",
        data: { modules: [], actions: [], users: [], roles: [] },
        fromCache: true,
      }
    }

    // Check if we have cached filters and they're still valid
    if (isCacheValid() && ACTIVITY_CACHE.filters) {
      return {
        status: "success",
        data: ACTIVITY_CACHE.filters,
        fromCache: true,
      }
    }

    try {
      const response = await api.get("/activities/filters", { skipCache: true })

      // Update cache
      if (response.data.status === "success") {
        ACTIVITY_CACHE.filters = response.data.data || {}
        ACTIVITY_CACHE.timestamp = Date.now()
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
      }
    }
  },

  // Get all activities without any filtering
  getAllActivities: async () => {
    // Skip API call if not on activity logs page
    if (!isActivityLogsPage()) {
      return {
        status: "success",
        data: [],
        fromCache: true,
      }
    }

    // Check if we have cached activities and they're still valid
    if (isCacheValid() && ACTIVITY_CACHE.allActivities) {
      return {
        status: "success",
        data: ACTIVITY_CACHE.allActivities,
        fromCache: true,
      }
    }

    try {
      const response = await api.get("/activities", { skipCache: true })

      // Update cache
      if (response.data.status === "success") {
        ACTIVITY_CACHE.allActivities = response.data.data || []
        ACTIVITY_CACHE.timestamp = Date.now()
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
      }
    }
  },

  // Get activities with server-side filtering (as a backup)
  getActivities: async (params = {}) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams()

      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
          queryParams.append(key, params[key])
        }
      })

      const queryString = queryParams.toString()
      const url = queryString ? `/activities?${queryString}` : "/activities"

      const response = await api.get(url)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
      }
    }
  },

  deleteAllActivities: async () => {
    try {
      const response = await api.delete("/activities")

      // Clear cache on successful delete
      if (response.data.status === "success") {
        clearCache()
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
      }
    }
  },

  // Get filtered activities from the server (without pagination)
  getFilteredActivities: async (filters = {}) => {
    // Skip API call if not on activity logs page
    if (!isActivityLogsPage()) {
      return {
        status: "success",
        data: [],
        fromCache: true,
      }
    }

    // Generate a cache key based on the filters
    const cacheKey = JSON.stringify(filters)

    // Check if we have this specific filter result cached
    if (isCacheValid() && ACTIVITY_CACHE.filteredActivities[cacheKey]) {
      return {
        status: "success",
        data: ACTIVITY_CACHE.filteredActivities[cacheKey],
        fromCache: true,
      }
    }

    // If we have all activities cached, we can filter them client-side
    if (isCacheValid() && ACTIVITY_CACHE.allActivities && ACTIVITY_CACHE.allActivities.length > 0) {
      // Filter the activities client-side
      let filteredData = [...ACTIVITY_CACHE.allActivities]

      // Apply module filter
      if (filters.modules && filters.modules.length > 0) {
        filteredData = filteredData.filter((activity) => filters.modules.includes(activity.module))
      }

      // Apply action filter
      if (filters.actions && filters.actions.length > 0) {
        filteredData = filteredData.filter((activity) => filters.actions.includes(activity.action))
      }

      // Apply user filter
      if (filters.users && filters.users.length > 0) {
        filteredData = filteredData.filter((activity) => filters.users.includes(activity.user_id?.toString()))
      }

      // Apply role filter
      if (filters.roles && filters.roles.length > 0) {
        filteredData = filteredData.filter((activity) => filters.roles.includes(activity.user_role))
      }

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredData = filteredData.filter(
          (activity) =>
            (activity.description && activity.description.toLowerCase().includes(searchLower)) ||
            (activity.module && activity.module.toLowerCase().includes(searchLower)) ||
            (activity.action && activity.action.toLowerCase().includes(searchLower)) ||
            (activity.user_name && activity.user_name.toLowerCase().includes(searchLower)) ||
            (activity.route && activity.route.toLowerCase().includes(searchLower)),
        )
      }

      // Apply date range filter
      if (filters.dateRange?.start) {
        const startDate = new Date(filters.dateRange.start)
        startDate.setHours(0, 0, 0, 0)
        filteredData = filteredData.filter((activity) => {
          const activityDate = new Date(activity.created_at)
          return activityDate >= startDate
        })
      }

      if (filters.dateRange?.end) {
        const endDate = new Date(filters.dateRange.end)
        endDate.setHours(23, 59, 59, 999)
        filteredData = filteredData.filter((activity) => {
          const activityDate = new Date(activity.created_at)
          return activityDate <= endDate
        })
      }

      // Apply ActivityTracking filter
      if (filters.excludeActivityTracking) {
        filteredData = filteredData.filter((activity) => activity.module !== "ActivityTracking")
      }

      // Apply token activities filter
      if (filters.excludeTokenActivities) {
        filteredData = filteredData.filter((activity) => {
          const action = activity.action?.toLowerCase() || ""
          const module = activity.module?.toLowerCase() || ""
          const description = activity.description?.toLowerCase() || ""

          // Check if the activity is related to token refresh or validation
          const isTokenActivity =
            action.includes("token") ||
            action.includes("refresh") ||
            action.includes("validate") ||
            module.includes("token") ||
            (module.includes("auth") &&
              (description.includes("token") || description.includes("refresh") || description.includes("validate")))

          return !isTokenActivity
        })
      }

      // Apply log type filter
      if (filters.logType && filters.logType !== "all") {
        if (filters.logType === "admin") {
          filteredData = filteredData.filter((activity) => activity.is_admin === 1)
        } else if (filters.logType === "customer") {
          filteredData = filteredData.filter((activity) => activity.is_admin === 0)
        }
      }

      // Cache the filtered results
      ACTIVITY_CACHE.filteredActivities[cacheKey] = filteredData

      return {
        status: "success",
        data: filteredData,
      }
    }

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()

      // Handle modules filter
      if (filters.modules && filters.modules.length > 0) {
        queryParams.append("modules", filters.modules.join(","))
      }

      // Handle actions filter
      if (filters.actions && filters.actions.length > 0) {
        queryParams.append("actions", filters.actions.join(","))
      }

      // Handle users filter
      if (filters.users && filters.users.length > 0) {
        queryParams.append("users", filters.users.join(","))
      }

      // Handle roles filter
      if (filters.roles && filters.roles.length > 0) {
        queryParams.append("roles", filters.roles.join(","))
      }

      // Handle search
      if (filters.search) {
        queryParams.append("search", filters.search)
      }

      // Handle date range
      if (filters.dateRange?.start) {
        queryParams.append("start_date", filters.dateRange.start)
      }

      if (filters.dateRange?.end) {
        queryParams.append("end_date", filters.dateRange.end)
      }

      // Handle ActivityTracking exclusion
      if (filters.excludeActivityTracking) {
        queryParams.append("exclude_activity_tracking", "true")
      }

      // Handle token activities exclusion
      if (filters.excludeTokenActivities) {
        queryParams.append("exclude_token_activities", "true")
      }

      // Handle log type filter
      if (filters.logType && filters.logType !== "all") {
        queryParams.append("log_type", filters.logType)
      }

      const response = await api.get(`/activities/filtered?${queryParams.toString()}`, { skipCache: true })

      // If server-side filtering for token activities is not implemented,
      // we'll handle it client-side as a fallback
      let filteredData = response.data?.data || []

      if (filters.excludeTokenActivities && Array.isArray(filteredData)) {
        // Filter out token-related activities client-side
        filteredData = filteredData.filter((activity) => {
          const action = activity.action?.toLowerCase() || ""
          const module = activity.module?.toLowerCase() || ""
          const description = activity.description?.toLowerCase() || ""

          // Check if the activity is related to token refresh or validation
          const isTokenActivity =
            action.includes("token") ||
            action.includes("refresh") ||
            action.includes("validate") ||
            module.includes("token") ||
            (module.includes("auth") &&
              (description.includes("token") || description.includes("refresh") || description.includes("validate")))

          return !isTokenActivity
        })

        // Update the response data with our filtered data
        response.data.data = filteredData
      }

      // Cache the filtered results
      if (response.data.status === "success") {
        ACTIVITY_CACHE.filteredActivities[cacheKey] = response.data.data || []
      }

      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Network error occurred"

      return {
        status: "error",
        message: errorMessage,
      }
    }
  },
}

export default activityService
