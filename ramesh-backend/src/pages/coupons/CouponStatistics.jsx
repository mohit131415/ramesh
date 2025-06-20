"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCouponsOverviewStatistics } from "../../services/couponService"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Tag,
  Percent,
  IndianRupee,
  Calendar,
  BarChart3,
  PieChartIcon as PieIcon,
  Activity,
  Target,
  Award,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Clock,
  Edit,
} from "lucide-react"
import { toast } from "react-toastify"
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Area,
  AreaChart,
  Pie, // Declared Pie variable here
} from "recharts"

const CouponStatistics = () => {
  const navigate = useNavigate()
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showCustomDateModal, setShowCustomDateModal] = useState(false)
  const [tempStartDate, setTempStartDate] = useState("")
  const [tempEndDate, setTempEndDate] = useState("")

  // Chart colors
  const COLORS = {
    primary: "#D4AF37", // ramesh-gold
    secondary: "#10B981", // green
    tertiary: "#3B82F6", // blue
    quaternary: "#8B5CF6", // purple
    danger: "#EF4444", // red
    warning: "#F59E0B", // yellow
  }

  const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary]

  // Fetch statistics
  const fetchStatistics = async () => {
    setLoading(true)
    setError(null)

    const params = {
      period,
      include_deleted: includeDeleted,
    }

    if (period === "custom" && startDate && endDate) {
      params.start_date = startDate
      params.end_date = endDate
    }

    const response = await getCouponsOverviewStatistics(params)

    if (response.status === "success") {
      setStatistics(response.data)
    } else {
      setError(response.message || "Failed to fetch statistics")
      toast.error(response.message || "Failed to fetch statistics")
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchStatistics()
  }, [period, includeDeleted])

  const handlePeriodChange = (newPeriod) => {
    if (newPeriod === "custom") {
      setShowCustomDateModal(true)
    } else {
      setPeriod(newPeriod)
      setStartDate("")
      setEndDate("")
    }
  }

  const handleCustomDateSubmit = () => {
    if (!tempStartDate || !tempEndDate) {
      toast.error("Both start date and end date are required")
      return
    }

    if (new Date(tempStartDate) > new Date(tempEndDate)) {
      toast.error("Start date cannot be after end date")
      return
    }

    setStartDate(tempStartDate)
    setEndDate(tempEndDate)
    setPeriod("custom")
    setShowCustomDateModal(false)

    // Make API call with custom dates
    const params = {
      period: "custom",
      start_date: tempStartDate,
      end_date: tempEndDate,
      include_deleted: includeDeleted,
    }

    setLoading(true)
    setError(null)

    getCouponsOverviewStatistics(params).then((response) => {
      if (response.status === "success") {
        setStatistics(response.data)
      } else {
        setError(response.message || "Failed to fetch statistics")
        toast.error(response.message || "Failed to fetch statistics")
      }
      setLoading(false)
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

  // Get trend icon and color
  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  // Prepare pie chart data for coupon types
  const getCouponTypeData = () => {
    if (!statistics?.overview) return []
    return [
      {
        name: "Percentage",
        value: statistics.overview.percentage_coupons || 0,
        color: COLORS.primary,
      },
      {
        name: "Fixed Amount",
        value: statistics.overview.fixed_amount_coupons || 0,
        color: COLORS.secondary,
      },
    ]
  }

  // Prepare pie chart data for coupon status
  const getCouponStatusData = () => {
    if (!statistics?.overview) return []
    return [
      {
        name: "Active",
        value: statistics.overview.active_coupons || 0,
        color: COLORS.secondary,
      },
      {
        name: "Inactive",
        value: statistics.overview.inactive_coupons || 0,
        color: COLORS.warning,
      },
      {
        name: "Expired",
        value: statistics.overview.expired_coupons || 0,
        color: COLORS.danger,
      },
      {
        name: "Scheduled",
        value: statistics.overview.scheduled_coupons || 0,
        color: COLORS.tertiary,
      },
    ].filter((item) => item.value > 0)
  }

  // Prepare bar chart data for discount type performance
  const getDiscountTypePerformanceData = () => {
    if (!statistics?.discount_type_performance) return []
    return statistics.discount_type_performance.map((type) => ({
      type: type.discount_type === "fixed_amount" ? "Fixed Amount" : "Percentage",
      usage_count: type.usage_count,
      total_discount: Number.parseFloat(type.total_discount_given),
      coupon_count: type.coupon_count,
      avg_discount: Number.parseFloat(type.average_discount),
    }))
  }

  // Prepare line chart data for monthly trends
  const getMonthlyTrendsData = () => {
    if (!statistics?.trends?.monthly_usage) return []
    return statistics.trends.monthly_usage.map((month) => ({
      month: new Date(month.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      usage_count: month.usage_count,
      total_discount: Number.parseFloat(month.total_discount),
      coupons_used: month.coupons_used,
      unique_users: month.unique_users,
    }))
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {typeof entry.value === "number" && entry.name.includes("discount")
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading && !statistics) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/coupons")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Coupon Statistics</h1>
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
          <h1 className="text-2xl font-bold text-gray-800">Coupon Statistics</h1>
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-ramesh-gold" />
              Coupon Statistics Help
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What am I looking at?</h4>
                <p>This page shows comprehensive statistics about all your coupons and their performance.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Metrics:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Usage Statistics:</strong> How often coupons are being used
                  </li>
                  <li>
                    <strong>Discount Performance:</strong> Total savings provided to customers
                  </li>
                  <li>
                    <strong>Top Performers:</strong> Best performing coupons by usage and value
                  </li>
                  <li>
                    <strong>Trends:</strong> Usage patterns over time
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-opacity-90"
                onClick={() => setShowHelp(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Range Modal */}
      {showCustomDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-ramesh-gold" />
              Select Custom Date Range
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30"
                  max={tempEndDate || undefined}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30"
                  min={tempStartDate || undefined}
                />
              </div>

              {tempStartDate && tempEndDate && new Date(tempStartDate) > new Date(tempEndDate) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  Start date cannot be after end date
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                onClick={() => {
                  setShowCustomDateModal(false)
                  setTempStartDate("")
                  setTempEndDate("")
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
                onClick={handleCustomDateSubmit}
                disabled={!tempStartDate || !tempEndDate || new Date(tempStartDate) > new Date(tempEndDate)}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/coupons")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Coupon Statistics</h1>
            <p className="text-sm text-gray-500 mt-1">Comprehensive analytics for all your coupons</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowHelp(true)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <HelpCircle className="h-5 w-5 text-gray-400 hover:text-ramesh-gold" />
          </button>
          <button
            onClick={fetchStatistics}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
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

          {period === "custom" && startDate && endDate && (
            <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm text-blue-800">
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </span>
              <button onClick={() => setShowCustomDateModal(true)} className="ml-2 text-blue-600 hover:text-blue-800">
                <Edit className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeDeleted"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeDeleted" className="text-sm text-gray-700">
              Include deleted coupons
            </label>
          </div>
        </div>
      </div>

      {statistics && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.overview?.total_coupons || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-green-600 font-medium">{statistics.overview?.active_coupons || 0}</span>
                  <span className="text-gray-500 ml-1">Active</span>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <span className="text-yellow-600 font-medium">{statistics.overview?.inactive_coupons || 0}</span>
                  <span className="text-gray-500 ml-1">Inactive</span>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <span className="text-red-600 font-medium">{statistics.overview?.expired_coupons || 0}</span>
                  <span className="text-gray-500 ml-1">Expired</span>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <span className="text-purple-600 font-medium">{statistics.overview?.scheduled_coupons || 0}</span>
                  <span className="text-gray-500 ml-1">Scheduled</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.usage_statistics?.total_uses || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500">{statistics.usage_statistics?.coupons_used || 0} coupons used</p>
                <p className="text-xs text-gray-500">{statistics.usage_statistics?.unique_users || 0} unique users</p>
              </div>
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
              <div className="mt-3">
                <p className="text-xs text-gray-500">
                  Avg: {formatCurrency(statistics.usage_statistics?.average_discount)}
                </p>
                {statistics.usage_statistics?.first_usage && (
                  <p className="text-xs text-gray-500 mt-1">
                    First used: {new Date(statistics.usage_statistics.first_usage).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(statistics.performance_metrics?.coupon_utilization_rate)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500">
                  Avg uses per coupon: {statistics.performance_metrics?.average_uses_per_coupon || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(statistics.performance_metrics?.average_savings_per_user)} per user
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coupon Status Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PieIcon className="h-5 w-5 mr-2 text-ramesh-gold" />
                Coupon Status Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={getCouponStatusData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getCouponStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coupon Type Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Percent className="h-5 w-5 mr-2 text-ramesh-gold" />
                Coupon Type Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={getCouponTypeData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getCouponTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Discount Type Performance Bar Chart */}
          {statistics.discount_type_performance && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-ramesh-gold" />
                Discount Type Performance
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getDiscountTypePerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="usage_count" fill={COLORS.primary} name="Usage Count" />
                    <Bar yAxisId="right" dataKey="total_discount" fill={COLORS.secondary} name="Total Discount (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Monthly Trends Line Chart */}
          {statistics.trends?.monthly_usage && statistics.trends.monthly_usage.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-ramesh-gold" />
                Monthly Usage Trends
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getMonthlyTrendsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="usage_count"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                      name="Usage Count"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="total_discount"
                      stroke={COLORS.secondary}
                      strokeWidth={3}
                      name="Total Discount (₹)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top Performers */}
          {statistics.top_performers && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top by Usage */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-ramesh-gold" />
                  Top Coupons by Usage
                </h3>
                <div className="space-y-3">
                  {statistics.top_performers.by_usage?.slice(0, 8).map((coupon, index) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center mr-3 ${
                            index < 3 ? "bg-ramesh-gold" : "bg-gray-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{coupon.code}</p>
                          <p className="text-xs text-gray-500">{coupon.name}</p>
                          <div className="flex items-center mt-1">
                            {coupon.discount_type === "percentage" ? (
                              <Percent className="h-3 w-3 mr-1 text-ramesh-gold" />
                            ) : (
                              <IndianRupee className="h-3 w-3 mr-1 text-green-600" />
                            )}
                            <span className="text-xs text-gray-600">
                              {coupon.discount_type === "percentage"
                                ? `${coupon.discount_value}%`
                                : `₹${coupon.discount_value}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{coupon.usage_count} uses</p>
                        <p className="text-sm text-gray-600">{formatCurrency(coupon.total_discount_given)}</p>
                        <p className="text-xs text-gray-500">Avg: {formatCurrency(coupon.average_discount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top by Discount Amount */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-2 text-green-600" />
                  Top Coupons by Total Savings
                </h3>
                <div className="space-y-3">
                  {statistics.top_performers.by_discount_amount?.slice(0, 8).map((coupon, index) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center mr-3 ${
                            index < 3 ? "bg-green-500" : "bg-gray-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{coupon.code}</p>
                          <p className="text-xs text-gray-500">{coupon.name}</p>
                          <div className="flex items-center mt-1">
                            {coupon.discount_type === "percentage" ? (
                              <Percent className="h-3 w-3 mr-1 text-ramesh-gold" />
                            ) : (
                              <IndianRupee className="h-3 w-3 mr-1 text-green-600" />
                            )}
                            <span className="text-xs text-gray-600">
                              {coupon.discount_type === "percentage"
                                ? `${coupon.discount_value}%`
                                : `₹${coupon.discount_value}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(coupon.total_discount_given)}</p>
                        <p className="text-sm text-gray-600">{coupon.usage_count} uses</p>
                        <p className="text-xs text-gray-500">Avg: {formatCurrency(coupon.average_discount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics Summary */}
          {statistics.performance_metrics && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-ramesh-gold" />
                Performance Metrics Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="p-3 bg-blue-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Coupon Utilization Rate</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPercentage(statistics.performance_metrics.coupon_utilization_rate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {statistics.usage_statistics?.coupons_used || 0} of {statistics.overview?.total_coupons || 0}{" "}
                    coupons used
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="p-3 bg-green-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Average Savings per User</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(statistics.performance_metrics.average_savings_per_user)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Across {statistics.usage_statistics?.unique_users || 0} unique users
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="p-3 bg-purple-500 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Average Uses per Coupon</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {statistics.performance_metrics.average_uses_per_coupon || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total {statistics.usage_statistics?.total_uses || 0} uses
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Timeline */}
          {statistics.usage_statistics?.first_usage && statistics.usage_statistics?.last_usage && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-ramesh-gold" />
                Usage Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">First Usage</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(statistics.usage_statistics.first_usage).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-700">Latest Usage</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(statistics.usage_statistics.last_usage).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Coupon Type Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <PieIcon className="h-5 w-5 mr-2 text-ramesh-gold" />
              Coupon Type Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Percent className="h-4 w-4 mr-2 text-ramesh-gold" />
                    Percentage Coupons
                  </h4>
                  <span className="text-2xl font-bold text-ramesh-gold">
                    {statistics.overview?.percentage_coupons || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-ramesh-gold h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${statistics.overview?.total_coupons > 0 ? ((statistics.overview?.percentage_coupons || 0) / statistics.overview.total_coupons) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {statistics.overview?.total_coupons > 0
                      ? (
                          ((statistics.overview?.percentage_coupons || 0) / statistics.overview.total_coupons) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total
                  </span>
                  <span className="font-medium text-ramesh-gold">
                    {statistics.overview?.percentage_coupons || 0}/{statistics.overview?.total_coupons || 0}
                  </span>
                </div>

                {/* Usage Performance for Percentage Coupons */}
                {statistics.discount_type_performance && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {statistics.discount_type_performance.map((type) =>
                      type.discount_type === "percentage" ? (
                        <div key="percentage" className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Usage Count:</span>
                            <span className="font-medium">{type.usage_count}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Total Discount:</span>
                            <span className="font-medium">{formatCurrency(type.total_discount_given)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Avg per Use:</span>
                            <span className="font-medium">{formatCurrency(type.average_discount)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Utilization Rate:</span>
                            <span className="font-medium">
                              {type.coupon_count > 0 ? ((type.usage_count / type.coupon_count) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <IndianRupee className="h-4 w-4 mr-2 text-green-600" />
                    Fixed Amount Coupons
                  </h4>
                  <span className="text-2xl font-bold text-green-600">
                    {statistics.overview?.fixed_amount_coupons || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${statistics.overview?.total_coupons > 0 ? ((statistics.overview?.fixed_amount_coupons || 0) / statistics.overview.total_coupons) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {statistics.overview?.total_coupons > 0
                      ? (
                          ((statistics.overview?.fixed_amount_coupons || 0) / statistics.overview.total_coupons) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total
                  </span>
                  <span className="font-medium text-green-600">
                    {statistics.overview?.fixed_amount_coupons || 0}/{statistics.overview?.total_coupons || 0}
                  </span>
                </div>

                {/* Usage Performance for Fixed Amount Coupons */}
                {statistics.discount_type_performance && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {statistics.discount_type_performance.map((type) =>
                      type.discount_type === "fixed_amount" ? (
                        <div key="fixed_amount" className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Usage Count:</span>
                            <span className="font-medium">{type.usage_count}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Total Discount:</span>
                            <span className="font-medium">{formatCurrency(type.total_discount_given)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Avg per Use:</span>
                            <span className="font-medium">{formatCurrency(type.average_discount)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Utilization Rate:</span>
                            <span className="font-medium">
                              {type.coupon_count > 0 ? ((type.usage_count / type.coupon_count) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Type Performance Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Most Popular Type</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(statistics.overview?.percentage_coupons || 0) >= (statistics.overview?.fixed_amount_coupons || 0)
                      ? "Percentage"
                      : "Fixed Amount"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.max(
                      statistics.overview?.percentage_coupons || 0,
                      statistics.overview?.fixed_amount_coupons || 0,
                    )}{" "}
                    coupons
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Most Used Type</p>
                  <p className="text-lg font-bold text-gray-900">
                    {statistics.discount_type_performance && statistics.discount_type_performance.length > 0
                      ? statistics.discount_type_performance.reduce((prev, current) =>
                          current.usage_count > prev.usage_count ? current : prev,
                        ).discount_type === "percentage"
                        ? "Percentage"
                        : "Fixed Amount"
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.discount_type_performance && statistics.discount_type_performance.length > 0
                      ? Math.max(...statistics.discount_type_performance.map((type) => type.usage_count))
                      : 0}{" "}
                    uses
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">Higher Avg Discount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {statistics.discount_type_performance && statistics.discount_type_performance.length > 0
                      ? statistics.discount_type_performance.reduce((prev, current) =>
                          Number.parseFloat(current.average_discount) > Number.parseFloat(prev.average_discount)
                            ? current
                            : prev,
                        ).discount_type === "percentage"
                        ? "Percentage"
                        : "Fixed Amount"
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.discount_type_performance && statistics.discount_type_performance.length > 0
                      ? formatCurrency(
                          Math.max(
                            ...statistics.discount_type_performance.map((type) =>
                              Number.parseFloat(type.average_discount),
                            ),
                          ),
                        )
                      : "₹0"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CouponStatistics
