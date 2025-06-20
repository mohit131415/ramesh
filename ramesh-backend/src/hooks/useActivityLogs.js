"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import activityService from "../services/activityService"

export const useActivityLogs = () => {
  // All activities from the API
  const [allActivities, setAllActivities] = useState([])

  // Filtered activities to display
  const [filteredActivities, setFilteredActivities] = useState([])

  const [filters, setFilters] = useState({
    modules: [],
    actions: [],
    users: [],
    roles: [],
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Active filters
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
  })

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 50,
  })

  // Load filters
  const loadFilters = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await activityService.getFilters()

      if (response.status === "success") {
        setFilters(response.data || {})
      } else {
        setError(response.message || "Failed to load filters")
      }
    } catch (err) {
      console.error("Error loading filters:", err)
      setError("API is not responding. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Load all activities
  const loadAllActivities = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await activityService.getAllActivities()

      if (response.status === "success") {
        setAllActivities(response.data || [])
      } else {
        setError(response.message || "Failed to load activities")
        setAllActivities([])
      }
    } catch (err) {
      console.error("Error fetching activities:", err)
      setError("API is not responding. Please try again later.")
      setAllActivities([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Apply filters to activities
  const applyFilters = useCallback(() => {
    if (allActivities.length === 0) return

    let result = [...allActivities]

    // Apply module filter
    if (activeFilters.modules.length > 0) {
      result = result.filter((activity) => activeFilters.modules.includes(activity.module))
    }

    // Apply action filter
    if (activeFilters.actions.length > 0) {
      result = result.filter((activity) => activeFilters.actions.includes(activity.action))
    }

    // Apply user filter
    if (activeFilters.users.length > 0) {
      result = result.filter((activity) => activeFilters.users.includes(activity.user_id?.toString()))
    }

    // Apply role filter
    if (activeFilters.roles.length > 0) {
      result = result.filter((activity) => activeFilters.roles.includes(activity.user_role))
    }

    // Apply search filter
    if (activeFilters.search) {
      const searchLower = activeFilters.search.toLowerCase()
      result = result.filter(
        (activity) =>
          (activity.description && activity.description.toLowerCase().includes(searchLower)) ||
          (activity.module && activity.module.toLowerCase().includes(searchLower)) ||
          (activity.action && activity.action.toLowerCase().includes(searchLower)) ||
          (activity.user_name && activity.user_name.toLowerCase().includes(searchLower)) ||
          (activity.route && activity.route.toLowerCase().includes(searchLower)),
      )
    }

    // Apply date range filter
    if (activeFilters.dateRange.start) {
      const startDate = new Date(activeFilters.dateRange.start)
      startDate.setHours(0, 0, 0, 0)
      result = result.filter((activity) => {
        const activityDate = new Date(activity.created_at)
        return activityDate >= startDate
      })
    }

    if (activeFilters.dateRange.end) {
      const endDate = new Date(activeFilters.dateRange.end)
      endDate.setHours(23, 59, 59, 999)
      result = result.filter((activity) => {
        const activityDate = new Date(activity.created_at)
        return activityDate <= endDate
      })
    }

    // Apply ActivityTracking filter
    if (activeFilters.excludeActivityTracking) {
      result = result.filter((activity) => activity.module !== "ActivityTracking")
    }

    // Apply token activities filter
    if (activeFilters.excludeTokenActivities) {
      result = result.filter((activity) => {
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

    // Calculate pagination
    const totalItems = result.length
    const totalPages = Math.ceil(totalItems / pagination.limit)

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: Math.min(prev.currentPage, totalPages || 1),
    }))

    // Apply pagination
    const startIndex = (pagination.currentPage - 1) * pagination.limit
    const paginatedResult = result.slice(startIndex, startIndex + pagination.limit)

    setFilteredActivities(paginatedResult)
  }, [allActivities, activeFilters, pagination.currentPage, pagination.limit])

  // Set active filters
  const setFilter = useCallback((filterType, value) => {
    setActiveFilters((prev) => {
      if (filterType === "search" || filterType === "dateRange") {
        return {
          ...prev,
          [filterType]: value,
        }
      }

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
  }, [])

  // Set date range
  const setDateRange = useCallback((field, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }))
  }, [])

  // Set search query
  const setSearchQuery = useCallback((query) => {
    setActiveFilters((prev) => ({
      ...prev,
      search: query,
    }))
  }, [])

  // Reset all filters
  const resetFilters = useCallback(() => {
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
    })
  }, [])

  // Set page
  const setPage = useCallback((page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }))
  }, [])

  // Set limit
  const setLimit = useCallback((limit) => {
    setPagination((prev) => ({
      ...prev,
      limit,
      currentPage: 1, // Reset to first page when changing limit
    }))
  }, [])

  // Load activities on mount
  useEffect(() => {
    loadFilters()
    loadAllActivities()
  }, [loadFilters, loadAllActivities])

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters()
  }, [applyFilters, activeFilters, pagination.currentPage, pagination.limit])

  // Get activities for current page
  const activities = useMemo(() => filteredActivities, [filteredActivities])

  return {
    filters,
    activities,
    loading,
    error,
    pagination,
    activeFilters,
    loadFilters,
    loadAllActivities,
    setFilter,
    setDateRange,
    setSearchQuery,
    resetFilters,
    setPage,
    setLimit,
  }
}
