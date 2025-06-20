"use client"

import { useEffect, useState } from "react"
import { useOrders } from "../../contexts/OrderContext"
import {
  TrendingUp,
  TrendingDown,
  Package,
  CreditCard,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart,
  Users,
  MapPin,
  Info,
} from "lucide-react"

const OrderStatistics = () => {
  const { statistics, loading, error, fetchStatistics, clearError } = useOrders()

  const [period, setPeriod] = useState("today")
  const [customDateRange, setCustomDateRange] = useState({
    date_from: "",
    date_to: "",
  })
  const [showCustomRange, setShowCustomRange] = useState(false)

  useEffect(() => {
    loadStatistics()
  }, [])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const loadStatistics = (customParams = {}) => {
    const params = {
      period: showCustomRange ? undefined : period,
      ...customParams,
    }

    if (showCustomRange && customDateRange.date_from && customDateRange.date_to) {
      params.date_from = customDateRange.date_from
      params.date_to = customDateRange.date_to
    }

    fetchStatistics(params)
  }

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    setShowCustomRange(false)
    loadStatistics({ period: newPeriod })
  }

  const handleCustomRangeToggle = () => {
    setShowCustomRange(!showCustomRange)
    if (!showCustomRange) {
      setPeriod("")
    }
  }

  const applyCustomRange = () => {
    if (customDateRange.date_from && customDateRange.date_to) {
      loadStatistics(customDateRange)
    }
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₹0"
    return `₹${Number.parseFloat(value).toLocaleString()}`
  }

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0"
    return Number.parseFloat(value).toLocaleString()
  }

  const formatGrowth = (value) => {
    if (value === null || value === undefined) return "0%"
    return `${value > 0 ? "+" : ""}${value}%`
  }

  const getGrowthColor = (value) => {
    if (value === null || value === undefined || value === 0) return "text-gray-500"
    return value > 0 ? "text-green-600" : "text-red-600"
  }

  const getGrowthIcon = (value) => {
    if (value === null || value === undefined || value === 0) return null
    return value > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
  }

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold"></div>
      </div>
    )
  }

  // Handle case when statistics is not available yet
  const summary = statistics?.summary || {
    period: "",
    date_range: { label: "" },
    overall: {},
    comparison: {},
    growth: {},
  }

  const overall = summary.overall || {}
  const comparison = summary.comparison || {}
  const growth = summary.growth || {}
  const breakdowns = statistics?.breakdowns || {}
  const customers = statistics?.customers || { metrics: {}, top_customers: [] }
  const refunds = statistics?.refunds || { overall: {}, by_reason: [] }
  const products = statistics?.products || []

  const hasCurrentData = overall.total_orders > 0
  const hasComparisonData = comparison.total_orders > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Statistics</h1>
          <p className="text-gray-600">
            {summary.date_range?.label || "Current Period"}
            {summary.date_range?.start &&
              ` (${new Date(summary.date_range.start).toLocaleDateString()} - ${new Date(summary.date_range.end).toLocaleDateString()})`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadStatistics()}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900">Time Period:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["today", "yesterday", "week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  period === p && !showCustomRange
                    ? "bg-ramesh-gold text-white"
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}

            <button
              onClick={handleCustomRangeToggle}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showCustomRange ? "bg-ramesh-gold text-white" : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {showCustomRange && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={customDateRange.date_from}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, date_from: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ramesh-gold/20 focus:border-ramesh-gold"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={customDateRange.date_to}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, date_to: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-ramesh-gold/20 focus:border-ramesh-gold"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={applyCustomRange}
                  disabled={!customDateRange.date_from || !customDateRange.date_to}
                  className="px-4 py-2 bg-ramesh-gold text-white rounded-lg hover:bg-ramesh-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {statistics && (
        <>
          {/* No Data Message */}
          {!hasCurrentData && !hasComparisonData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <Info className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-blue-800">No Order Data Available</h3>
              <p className="text-blue-700 mt-1">
                There are no orders in the selected time period. Try selecting a different time range.
              </p>
            </div>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(overall.total_orders)}</p>
                    {growth.orders !== null && (
                      <span className={`text-sm font-medium flex items-center gap-1 ${getGrowthColor(growth.orders)}`}>
                        {getGrowthIcon(growth.orders)}
                        {formatGrowth(growth.orders)}
                      </span>
                    )}
                  </div>
                  {!hasCurrentData && hasComparisonData && (
                    <p className="text-xs text-gray-500 mt-1">Previous: {formatNumber(comparison.total_orders)}</p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(overall.total_revenue)}</p>
                    {growth.revenue !== null && (
                      <span className={`text-sm font-medium flex items-center gap-1 ${getGrowthColor(growth.revenue)}`}>
                        {getGrowthIcon(growth.revenue)}
                        {formatGrowth(growth.revenue)}
                      </span>
                    )}
                  </div>
                  {!hasCurrentData && hasComparisonData && (
                    <p className="text-xs text-gray-500 mt-1">Previous: {formatCurrency(comparison.total_revenue)}</p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(overall.average_order_value)}</p>
                    {growth.aov !== null && (
                      <span className={`text-sm font-medium flex items-center gap-1 ${getGrowthColor(growth.aov)}`}>
                        {getGrowthIcon(growth.aov)}
                        {formatGrowth(growth.aov)}
                      </span>
                    )}
                  </div>
                  {!hasCurrentData && hasComparisonData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Previous: {formatCurrency(comparison.average_order_value)}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Customers</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(overall.unique_customers)}</p>
                    {growth.customers !== null && (
                      <span
                        className={`text-sm font-medium flex items-center gap-1 ${getGrowthColor(growth.customers)}`}
                      >
                        {getGrowthIcon(growth.customers)}
                        {formatGrowth(growth.customers)}
                      </span>
                    )}
                  </div>
                  {!hasCurrentData && hasComparisonData && (
                    <p className="text-xs text-gray-500 mt-1">Previous: {formatNumber(comparison.unique_customers)}</p>
                  )}
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Section */}
          {!hasCurrentData && hasComparisonData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Period Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Total Items Sold</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatNumber(comparison.total_items)}</p>
                  <p className="text-sm text-gray-600 mt-1">Quantity: {formatNumber(comparison.total_quantity)}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Revenue Status</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(comparison.collected_revenue)}</p>
                  <p className="text-sm text-gray-600 mt-1">Collected of {formatCurrency(comparison.total_revenue)}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatNumber(comparison.delivered_orders)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {comparison.total_orders > 0
                      ? `${((comparison.delivered_orders / comparison.total_orders) * 100).toFixed(1)}% of total orders`
                      : "0% of total orders"}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Discounts Applied</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(comparison.total_discounts)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {comparison.discount_rate
                      ? `${comparison.discount_rate.toFixed(1)}% discount rate`
                      : "0% discount rate"}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Shipping Revenue</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(comparison.shipping_revenue)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {comparison.total_orders > 0
                      ? `Avg ${formatCurrency(comparison.shipping_revenue / comparison.total_orders)} per order`
                      : "Avg ₹0 per order"}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Order Value Range</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(comparison.min_order_value)} - {formatCurrency(comparison.max_order_value)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Min - Max order value</p>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders by Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Orders by Status
                </h2>
              </div>
              <div className="p-6">
                {breakdowns.by_status && breakdowns.by_status.length > 0 ? (
                  <div className="space-y-4">
                    {breakdowns.by_status.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full bg-${
                              item.status === "delivered"
                                ? "green"
                                : item.status === "cancelled"
                                  ? "red"
                                  : item.status === "processing"
                                    ? "blue"
                                    : item.status === "pending"
                                      ? "yellow"
                                      : "gray"
                            }-500`}
                          ></div>
                          <span className="font-medium text-gray-900 capitalize">{item.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{item.count}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(item.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>No status data available for this period</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Payment Methods
                </h2>
              </div>
              <div className="p-6">
                {breakdowns.by_payment_method && breakdowns.by_payment_method.length > 0 ? (
                  <div className="space-y-4">
                    {breakdowns.by_payment_method.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${item.payment_method === "cod" ? "bg-yellow-500" : "bg-blue-500"}`}
                          ></div>
                          <span className="font-medium text-gray-900">
                            {item.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{item.count}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(item.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>No payment method data available for this period</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Geography Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Orders by Geography
              </h2>
            </div>
            <div className="p-6">
              {breakdowns.by_geography && breakdowns.by_geography.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {breakdowns.by_geography.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {item.city}, {item.state}
                        </span>
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {item.order_count} orders
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Revenue: {formatCurrency(item.revenue)}</div>
                        <div>Customers: {item.customer_count}</div>
                        <div>Avg Order: {formatCurrency(item.average_order_value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>No geographical data available for this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Top Products
              </h2>
            </div>
            <div className="p-6">
              {products && products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity Sold
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                              <div className="text-sm text-gray-500">SKU: {product.product_sku}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(product.quantity_sold)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(product.order_count)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.revenue)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(product.average_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>No product data available for this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customer Metrics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(customers.metrics.total_customers || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(customers.metrics.orders_per_customer || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Orders per Customer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(customers.metrics.revenue_per_customer || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Revenue per Customer</div>
                </div>
              </div>

              {/* Top Customers */}
              {customers.top_customers && customers.top_customers.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Top Customers</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orders
                          </th>
                          <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customers.top_customers.map((customer, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                  <div className="text-sm text-gray-500">{customer.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.orders}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(customer.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Refund Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Refund Metrics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(refunds.overall.total_refunds || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Refunds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(refunds.overall.total_refund_amount || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Refund Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {refunds.overall.refund_rate ? `${refunds.overall.refund_rate.toFixed(1)}%` : "0%"}
                  </div>
                  <div className="text-sm text-gray-600">Refund Rate</div>
                </div>
              </div>

              {/* Refund Reasons */}
              {refunds.by_reason && refunds.by_reason.length > 0 ? (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Refund Reasons</h3>
                  <div className="space-y-4">
                    {refunds.by_reason.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{item.reason}</span>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{item.count}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(item.amount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center py-4 text-gray-500">
                  <p>No refund reason data available for this period</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderStatistics
