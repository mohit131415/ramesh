"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import * as couponService from "../services/couponService"
import { useActivityLogs } from "../hooks/useActivityLogs"

// Create the context
const CouponContext = createContext()

// Custom hook to use the coupon context
export const useCoupon = () => useContext(CouponContext)

// Provider component
export const CouponProvider = ({ children }) => {
  const [coupons, setCoupons] = useState([])
  const [coupon, setCoupon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  })
  const [meta, setMeta] = useState({
    is_super_admin: false,
    show_deleted: false,
    include_deleted: false,
  })

  const navigate = useNavigate()
  const { logActivity } = useActivityLogs()

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Fetch all coupons with optional filtering
  const fetchCoupons = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null) // Clear any previous errors

    const response = await couponService.getCoupons(params)
    setLoading(false)

    // Check if the response indicates an error
    if (response.status === "error") {
      setError(response.message)
      toast.error(response.message)
      return false
    }

    // Process successful response
    if (response.status === "success") {
      setCoupons(response.data || [])
      if (response.pagination) {
        setPagination(response.pagination)
      }
      if (response.meta) {
        setMeta(response.meta)
      }
      return true
    } else {
      const errorMsg = response.message || "Failed to fetch coupons"
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    }
  }, [])

  // Fetch a single coupon by ID
  const fetchCouponById = useCallback(async (id) => {
    setLoading(true)
    setError(null) // Clear any previous errors

    const response = await couponService.getCouponById(id)
    setLoading(false)

    // Check if the response indicates an error
    if (response.status === "error") {
      setError(response.message)
      toast.error(response.message)
      return false
    }

    // Process successful response
    if (response.status === "success") {
      setCoupon(response.data)
      return true
    } else {
      const errorMsg = response.message || "Failed to fetch coupon"
      setError(errorMsg)
      toast.error(errorMsg)
      return false
    }
  }, [])

  // Create a new coupon
  const createCoupon = useCallback(async (couponData) => {
    setLoading(true)
    setError(null) // Clear any previous errors

    try {
      const response = await couponService.createCoupon(couponData)
      setLoading(false)

      // Check if the response indicates an error
      if (response.status === "error") {
        setError(response.message)
        return response
      }

      // Process successful response
      if (response.status === "success") {
        // Update the coupons list with the new coupon
        setCoupons((prevCoupons) => [response.data, ...prevCoupons])
        return response
      } else {
        const errorMsg = response.message || "Failed to create coupon"
        setError(errorMsg)
        return response
      }
    } catch (err) {
      setLoading(false)
      const errorMsg = err.message || "An error occurred while creating the coupon"
      setError(errorMsg)
      return {
        status: "error",
        message: errorMsg,
      }
    }
  }, [])

  // Update an existing coupon
  const updateCoupon = useCallback(async (id, couponData) => {
    setLoading(true)
    setError(null) // Clear any previous errors

    try {
      const response = await couponService.updateCoupon(id, couponData)
      setLoading(false)

      // Check if the response indicates an error
      if (response.status === "error") {
        setError(response.message)
        return response
      }

      // Check if the response is successful
      if (response.status === "success") {
        // Update the coupon in state
        setCoupon(response.data)

        // Update the coupon in the coupons list if it exists there
        setCoupons((prevCoupons) => prevCoupons.map((c) => (c.id === id ? response.data : c)))

        return response
      } else {
        // Handle unsuccessful response
        const errorMsg = response.message || "Failed to update coupon"
        setError(errorMsg)
        return response
      }
    } catch (err) {
      setLoading(false)
      const errorMsg = err.message || "An error occurred while updating the coupon"
      setError(errorMsg)
      return {
        status: "error",
        message: errorMsg,
      }
    }
  }, [])

  // Delete a coupon (soft delete)
  const deleteCoupon = useCallback(async (id) => {
    setLoading(true)
    setError(null) // Clear any previous errors

    const response = await couponService.deleteCoupon(id)
    setLoading(false)

    // Check if the response indicates an error
    if (response.status === "error") {
      setError(response.message)
      return response
    }

    // Only proceed if we have a valid success response
    if (response.status === "success") {
      // Update the coupons list by marking the coupon as deleted
      setCoupons((prevCoupons) =>
        prevCoupons.map((c) =>
          c.id === id ? { ...c, deleted_at: new Date().toISOString(), is_deleted: true, can_restore: true } : c,
        ),
      )
      return response
    } else {
      // Handle unsuccessful response
      const errorMsg = response.message || "Failed to delete coupon"
      setError(errorMsg)
      return response
    }
  }, [])

  // Restore a previously deleted coupon
  const restoreCoupon = useCallback(async (id) => {
    setLoading(true)
    setError(null) // Clear any previous errors

    const response = await couponService.restoreCoupon(id)
    setLoading(false)

    // Check if the response indicates an error
    if (response.status === "error") {
      setError(response.message)
      return response
    }

    // Only proceed if we have a valid success response
    if (response.status === "success") {
      // Update the coupons list by marking the coupon as not deleted
      setCoupons((prevCoupons) =>
        prevCoupons.map((c) => (c.id === id ? { ...c, deleted_at: null, is_deleted: false, can_restore: false } : c)),
      )
      return response
    } else {
      // Handle unsuccessful response
      const errorMsg = response.message || "Failed to restore coupon"
      setError(errorMsg)
      return response
    }
  }, [])

  // Clear the current coupon
  const clearCoupon = useCallback(() => {
    setCoupon(null)
  }, [])

  // Context value
  const value = {
    coupons,
    coupon,
    loading,
    error,
    pagination,
    meta,
    fetchCoupons,
    fetchCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    restoreCoupon,
    clearCoupon,
    clearError,
  }

  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
}
