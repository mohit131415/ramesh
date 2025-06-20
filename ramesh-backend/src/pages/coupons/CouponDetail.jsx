"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCoupon } from "../../contexts/CouponContext"
import { getCouponStatistics } from "../../services/couponService"
import {
  ArrowLeft,
  Edit,
  Trash2,
  RotateCcw,
  Tag,
  Percent,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Copy,
  Shield,
  Gift,
  Info,
  HelpCircle,
  IndianRupee,
  BarChart3,
  Users,
  Activity,
  Target,
  Award,
} from "lucide-react"
import { toast } from "react-toastify"

const CouponDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { coupon, loading, error, fetchCouponById, deleteCoupon, restoreCoupon, meta } = useCoupon()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Statistics state
  const [statistics, setStatistics] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(null)
  const [statsPeriod, setStatsPeriod] = useState("month")
  const [statsStartDate, setStatsStartDate] = useState("")
  const [statsEndDate, setStatsEndDate] = useState("")

  // Check if user is super admin from meta
  const isSuperAdmin = meta?.is_super_admin || false

  // Fetch coupon data
  useEffect(() => {
    if (id) {
      fetchCouponById(id)
    }
  }, [id, fetchCouponById])

  // Fetch statistics when tab changes to statistics
  useEffect(() => {
    if (activeTab === "statistics" && id) {
      fetchStatistics()
    }
  }, [activeTab, id, statsPeriod, statsStartDate, statsEndDate])

  // Fetch coupon statistics
  const fetchStatistics = async () => {
    setStatsLoading(true)
    setStatsError(null)
    setStatistics(null) // Clear previous data

    const params = {
      period: statsPeriod,
    }

    if (statsPeriod === "custom" && statsStartDate && statsEndDate) {
      params.start_date = statsStartDate
      params.end_date = statsEndDate
    }

    try {
      const response = await getCouponStatistics(id, params)

      if (response.status === "success") {
        setStatistics(response.data)
      } else {
        setStatsError(response.message || "Failed to fetch statistics")
      }
    } catch (error) {
      setStatsError("An error occurred while fetching statistics")
    } finally {
      setStatsLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`
  }

  // Copy coupon code to clipboard
  const copyToClipboard = () => {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Handle delete coupon
  const handleDelete = async () => {
    const response = await deleteCoupon(id)

    if (response && response.status === "success") {
      navigate("/coupons")
    } else if (response && response.status === "error") {
      toast.error(response.message || "Failed to delete coupon")
    }

    setShowDeleteConfirm(false)
  }

  // Handle restore coupon
  const handleRestore = async () => {
    const response = await restoreCoupon(id)

    if (response && response.status === "success") {
      fetchCouponById(id)
    } else if (response && response.status === "error") {
      toast.error(response.message || "Failed to restore coupon")
    }
  }

  if (loading && !coupon) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/coupons")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Coupon Details</h1>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ramesh-gold"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/coupons")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Coupon Details</h1>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!coupon) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/coupons")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Coupon Details</h1>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Coupon not found</h3>
          <p className="mt-1 text-sm text-gray-500">The coupon you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/coupons")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ramesh-gold hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ramesh-gold transition-all"
          >
            Back to Coupons
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Help tooltip */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-ramesh-gold" />
              Coupon Details Help
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What am I looking at?</h4>
                <p>This page shows all the details about a specific coupon and its performance statistics.</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Available tabs:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Details:</strong> Basic coupon information and settings
                  </li>
                  <li>
                    <strong>Statistics:</strong> Usage analytics and performance metrics
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Click on the coupon code to copy it to clipboard</li>
                  <li>Use the Statistics tab to analyze coupon performance</li>
                  <li>Filter statistics by different time periods</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-opacity-90 transition-all"
                onClick={() => setShowHelp(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center mb-6 justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/coupons")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to coupons"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Coupon Details</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage coupon information</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5 text-gray-400 hover:text-ramesh-gold" />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-ramesh-gold text-ramesh-gold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Info className="h-4 w-4 inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "statistics"
                  ? "border-ramesh-gold text-ramesh-gold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Statistics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "details" && (
            <div>
              {/* Coupon Header */}
              <div className="p-6 border-b border-gray-200 bg-ramesh-gold/10 rounded-t-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center">
                    <div className="bg-ramesh-gold p-3 rounded-lg mr-4 shadow-md">
                      <Tag className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div
                          className="text-xl font-bold text-gray-900 flex items-center cursor-pointer group"
                          onClick={copyToClipboard}
                          title="Click to copy"
                        >
                          {coupon.code}
                          <Copy
                            className={`h-4 w-4 ml-2 ${copied ? "text-green-500" : "text-gray-400 group-hover:text-amber-600"} transition-colors`}
                          />
                          {copied && <span className="text-xs text-green-500 ml-2">Copied!</span>}
                        </div>
                        {coupon.is_deleted || coupon.deleted_at ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Deleted
                          </span>
                        ) : coupon.is_active ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{coupon.name}</p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex items-center justify-end">
                      <div className="bg-white rounded-lg px-4 py-2 text-center shadow-sm border border-gray-100">
                        <span className="text-sm text-gray-500">Discount</span>
                        <div className="text-lg font-bold text-gray-900 flex items-center justify-center">
                          {coupon.discount_type === "percentage" ? (
                            <>
                              <Percent className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {coupon.discount_value}%
                            </>
                          ) : (
                            <>
                              <IndianRupee className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {coupon.discount_value}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-ramesh-gold" />
                      Coupon Information
                    </h3>

                    {coupon.description && (
                      <div className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p className="text-sm text-gray-600">{coupon.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Discount Type</h4>
                        <p className="text-sm text-gray-900 capitalize flex items-center">
                          {coupon.discount_type === "percentage" ? (
                            <>
                              <Percent className="h-4 w-4 mr-1 text-ramesh-gold" />
                              Percentage
                            </>
                          ) : (
                            <>
                              <IndianRupee className="h-4 w-4 mr-1 text-ramesh-gold" />
                              Fixed Amount
                            </>
                          )}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Discount Value</h4>
                        <p className="text-sm text-gray-900 font-medium flex items-center">
                          {coupon.discount_type === "percentage" ? (
                            <>
                              <Percent className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {coupon.discount_value}%
                            </>
                          ) : (
                            <>
                              <IndianRupee className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {coupon.discount_value}
                            </>
                          )}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Minimum Order Value</h4>
                        <p className="text-sm text-gray-900 font-medium flex items-center">
                          {coupon.minimum_order_value > 0 ? (
                            <>
                              <IndianRupee className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {coupon.minimum_order_value}
                            </>
                          ) : (
                            "No minimum"
                          )}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Maximum Discount</h4>
                        <p className="text-sm text-gray-900 font-medium flex items-center">
                          {coupon.maximum_discount_amount > 0 ? (
                            <>
                              <IndianRupee className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {coupon.maximum_discount_amount}
                            </>
                          ) : (
                            "No maximum"
                          )}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Usage Limit</h4>
                        <p className="text-sm text-gray-900 font-medium flex items-center">
                          <Gift className="h-4 w-4 mr-1 text-ramesh-gold" />
                          {coupon.usage_limit > 0 ? `${coupon.usage_limit} uses` : "Unlimited"}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Per User Limit</h4>
                        <p className="text-sm text-gray-900 font-medium flex items-center">
                          <User className="h-4 w-4 mr-1 text-ramesh-gold" />
                          {coupon.per_user_limit > 0 ? `${coupon.per_user_limit} uses per user` : "Unlimited per user"}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                        <div className="flex items-center">
                          {coupon.is_deleted || coupon.deleted_at ? (
                            <span className="inline-flex items-center text-sm text-red-600 font-medium">
                              <Trash2 className="h-4 w-4 mr-1" /> Deleted
                            </span>
                          ) : coupon.is_active ? (
                            <span className="inline-flex items-center text-sm text-green-600 font-medium">
                              <CheckCircle className="h-4 w-4 mr-1" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-sm text-yellow-600 font-medium">
                              <XCircle className="h-4 w-4 mr-1" /> Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-ramesh-gold" />
                      Validity Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Start Date</h4>
                        <div className="flex items-center text-sm text-gray-900 font-medium">
                          <Calendar className="h-4 w-4 mr-1 text-ramesh-gold" />
                          {formatDate(coupon.start_date)}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">End Date</h4>
                        <div className="flex items-center text-sm text-gray-900 font-medium">
                          <Clock className="h-4 w-4 mr-1 text-ramesh-gold" />
                          {coupon.end_date ? formatDate(coupon.end_date) : "No Expiry"}
                        </div>
                      </div>
                    </div>

                    {/* System Information - Only visible to Super Admins */}
                    {isSuperAdmin && (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-ramesh-gold" />
                          System Information
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Created By</h4>
                            <div className="flex items-center text-sm text-gray-900 font-medium">
                              <User className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {coupon.created_by || "System"}
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Created At</h4>
                            <div className="flex items-center text-sm text-gray-900 font-medium">
                              <Calendar className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {formatDate(coupon.created_at)}
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Last Updated</h4>
                            <div className="flex items-center text-sm text-gray-900 font-medium">
                              <RefreshCw className="h-4 w-4 mr-1 text-ramesh-gold" />
                              {formatDate(coupon.updated_at)}
                            </div>
                          </div>

                          {(coupon.is_deleted || coupon.deleted_at) && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-ramesh-gold/30 transition-colors">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Deleted At</h4>
                              <div className="flex items-center text-sm text-gray-900 font-medium">
                                <Trash2 className="h-4 w-4 mr-1 text-ramesh-gold" />
                                {formatDate(coupon.deleted_at)}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "statistics" && (
            <div>
              {/* Statistics Filters */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <select
                      value={statsPeriod}
                      onChange={(e) => setStatsPeriod(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30"
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="all">All Time</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {statsPeriod === "custom" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={statsStartDate}
                          onChange={(e) => setStatsStartDate(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={statsEndDate}
                          onChange={(e) => setStatsEndDate(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30"
                        />
                      </div>
                    </>
                  )}

                  <button
                    onClick={fetchStatistics}
                    className="flex items-center px-4 py-2 bg-ramesh-gold text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    disabled={statsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Statistics Content */}
              {statsLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ramesh-gold"></div>
                </div>
              ) : statsError ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>{statsError}</p>
                  </div>
                </div>
              ) : statistics ? (
                <div className="space-y-6">
                  {/* Coupon Info Summary */}
                  {statistics.coupon_info && (
                    <div className="bg-gradient-to-r from-ramesh-gold/10 to-yellow-50 rounded-lg p-6 border border-ramesh-gold/20">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-ramesh-gold" />
                        Coupon Overview
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="flex items-center mt-1">
                            {statistics.coupon_info.is_active ? (
                              <span className="inline-flex items-center text-sm text-green-600 font-medium">
                                <CheckCircle className="h-4 w-4 mr-1" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-sm text-red-600 font-medium">
                                <XCircle className="h-4 w-4 mr-1" /> Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600">Usage Limit</p>
                          <p className="text-lg font-bold text-gray-900">
                            {statistics.coupon_info.usage_limit || "Unlimited"}
                          </p>
                          {statistics.coupon_info.remaining_usage !== null && (
                            <p className="text-xs text-gray-500">{statistics.coupon_info.remaining_usage} remaining</p>
                          )}
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-600">Validity Period</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(statistics.coupon_info.start_date).toLocaleDateString()} -
                            {statistics.coupon_info.end_date
                              ? new Date(statistics.coupon_info.end_date).toLocaleDateString()
                              : "No Expiry"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usage Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Uses</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {statistics.usage_statistics?.total_uses || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      {statistics.usage_statistics?.first_used && (
                        <p className="text-xs text-gray-500 mt-2">
                          First used: {new Date(statistics.usage_statistics.first_used).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Unique Users</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {statistics.usage_statistics?.unique_users || 0}
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      {statistics.usage_statistics?.last_used && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last used: {new Date(statistics.usage_statistics.last_used).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Savings</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(statistics.usage_statistics?.total_discount_given)}
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <IndianRupee className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                      {statistics.usage_statistics?.average_discount && (
                        <p className="text-xs text-gray-500 mt-2">
                          Avg: {formatCurrency(statistics.usage_statistics.average_discount)}
                        </p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Days Active</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(statistics.performance_metrics?.days_active || 0)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      {statistics.performance_metrics?.average_savings_per_user && (
                        <p className="text-xs text-gray-500 mt-2">
                          {formatCurrency(statistics.performance_metrics.average_savings_per_user)} per user
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Discount Range */}
                  {statistics.usage_statistics && statistics.usage_statistics.total_uses > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-ramesh-gold" />
                        Discount Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Minimum Discount</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(statistics.usage_statistics.min_discount)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Average Discount</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(statistics.usage_statistics.average_discount)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Maximum Discount</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(statistics.usage_statistics.max_discount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usage Trends */}
                  {statistics.usage_trends && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Daily Usage */}
                      {statistics.usage_trends.daily_usage && statistics.usage_trends.daily_usage.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-ramesh-gold" />
                            Daily Usage Patterns
                          </h3>
                          <div className="space-y-3">
                            {statistics.usage_trends.daily_usage.map((day, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {new Date(day.usage_date).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{day.daily_uses} uses</p>
                                  <p className="text-xs text-gray-500">{formatCurrency(day.daily_discount)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-ramesh-gold" />
                            Daily Usage Patterns
                          </h3>
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">No daily usage data available</p>
                          </div>
                        </div>
                      )}

                      {/* Hourly Patterns */}
                      {statistics.usage_trends.hourly_pattern && statistics.usage_trends.hourly_pattern.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-ramesh-gold" />
                            Hourly Usage Patterns
                          </h3>
                          <div className="space-y-3">
                            {statistics.usage_trends.hourly_pattern
                              .sort((a, b) => a.usage_hour - b.usage_hour)
                              .map((hour, index) => {
                                const totalHourlyUses = statistics.usage_trends.hourly_pattern.reduce(
                                  (sum, h) => sum + h.hourly_uses,
                                  0,
                                )
                                const percentage = ((hour.hourly_uses / totalHourlyUses) * 100).toFixed(1)

                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                      <span className="font-medium text-gray-900">
                                        {hour.usage_hour.toString().padStart(2, "0")}:00
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900">{hour.hourly_uses} uses</p>
                                      <p className="text-xs text-gray-500">{percentage}% of total</p>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-ramesh-gold" />
                            Hourly Usage Patterns
                          </h3>
                          <div className="text-center py-8">
                            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">No hourly usage data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Performance Metrics */}
                  {statistics.performance_metrics && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-ramesh-gold" />
                        Performance Metrics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <div className="flex items-center justify-center mb-2">
                            <Target className="h-6 w-6 text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Usage Rate</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {statistics.performance_metrics.usage_rate
                              ? formatPercentage(statistics.performance_metrics.usage_rate)
                              : "N/A"}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                          <div className="flex items-center justify-center mb-2">
                            <IndianRupee className="h-6 w-6 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Avg Savings per User</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(statistics.performance_metrics.average_savings_per_user)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                          <div className="flex items-center justify-center mb-2">
                            <Activity className="h-6 w-6 text-purple-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Days Active</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.round(statistics.performance_metrics.days_active || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Usage Timeline */}
                  {statistics.usage_statistics &&
                    (statistics.usage_statistics.first_used || statistics.usage_statistics.last_used) && (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-ramesh-gold" />
                          Usage Timeline
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {statistics.usage_statistics.first_used && (
                            <div className="flex items-center p-4 bg-green-50 rounded-lg">
                              <div className="p-2 bg-green-100 rounded-full mr-4">
                                <Calendar className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">First Used</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatDate(statistics.usage_statistics.first_used)}
                                </p>
                              </div>
                            </div>
                          )}
                          {statistics.usage_statistics.last_used && (
                            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                              <div className="p-2 bg-blue-100 rounded-full mr-4">
                                <Clock className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Last Used</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatDate(statistics.usage_statistics.last_used)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Statistics Available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Statistics will appear here once this coupon has been used.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-end">
            {coupon.is_deleted || coupon.deleted_at ? (
              isSuperAdmin &&
              coupon.can_restore && (
                <button
                  onClick={handleRestore}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Coupon
                </button>
              )
            ) : (
              <>
                <button
                  onClick={() => navigate(`/coupons/${id}/edit`)}
                  className="flex items-center px-4 py-2 bg-ramesh-gold text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Delete Coupon</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-medium">{coupon?.code}</span>?
              {isSuperAdmin ? " You can restore it later if needed." : " This action cannot be undone by you."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ramesh-gold/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CouponDetail
