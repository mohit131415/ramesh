"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../../contexts/UserContext"
import {
  Users,
  UserCheck,
  FileText,
  MapPin,
  Activity,
  ShoppingBag,
  CreditCard,
  IndianRupee,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  User,
} from "lucide-react"

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js"
import { Bar, Doughnut } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

const UserStatistics = () => {
  const { statistics, loading, error, fetchUserStatistics } = useUser()
  const [chartData, setChartData] = useState(null)
  const [genderChartData, setGenderChartData] = useState(null)
  const [activityChartData, setActivityChartData] = useState(null)
  const [orderStatusChartData, setOrderStatusChartData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch statistics on component mount
  useEffect(() => {
    const loadStatistics = async () => {
      setIsLoading(true)
      await fetchUserStatistics()
      setIsLoading(false)
    }
    loadStatistics()
  }, [fetchUserStatistics])

  // Prepare chart data when statistics change
  useEffect(() => {
    if (statistics && statistics.registration_trends) {
      // Registration trends chart
      const dailyData = statistics.registration_trends.daily_last_30_days || []
      setChartData({
        labels: dailyData.map((item) => {
          const date = new Date(item.date)
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }),
        datasets: [
          {
            label: "New Registrations",
            data: dailyData.map((item) => item.registrations),
            backgroundColor: "rgba(255, 184, 0, 0.7)",
            borderColor: "rgba(255, 184, 0, 1)",
            borderWidth: 1,
          },
        ],
      })

      // Gender distribution chart
      if (statistics.gender_distribution) {
        const genderData = statistics.gender_distribution
        setGenderChartData({
          labels: Object.keys(genderData).map((key) =>
            key === "not_specified" ? "Not Specified" : key.charAt(0).toUpperCase() + key.slice(1),
          ),
          datasets: [
            {
              data: Object.values(genderData),
              backgroundColor: ["rgba(54, 162, 235, 0.7)", "rgba(255, 99, 132, 0.7)", "rgba(255, 206, 86, 0.7)"],
              borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)", "rgba(255, 206, 86, 1)"],
              borderWidth: 1,
            },
          ],
        })
      }

      // Activity patterns chart
      if (statistics.activity_patterns) {
        const activityData = statistics.activity_patterns
        setActivityChartData({
          labels: ["Active (Last 7 Days)", "Active (Last 30 Days)", "Active (Last 90 Days)", "Never Logged In"],
          datasets: [
            {
              label: "User Activity",
              data: [
                activityData.active_last_7_days,
                activityData.active_last_30_days,
                activityData.active_last_90_days,
                activityData.never_logged_in,
              ],
              backgroundColor: [
                "rgba(75, 192, 192, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(201, 203, 207, 0.7)",
              ],
              borderColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(201, 203, 207, 1)",
              ],
              borderWidth: 1,
            },
          ],
        })
      }

      // Order status distribution chart
      if (statistics.order_status_distribution) {
        const orderData = statistics.order_status_distribution
        setOrderStatusChartData({
          labels: Object.keys(orderData).map((key) =>
            key === "" ? "No Status" : key.charAt(0).toUpperCase() + key.slice(1),
          ),
          datasets: [
            {
              data: Object.values(orderData),
              backgroundColor: [
                "rgba(255, 206, 86, 0.7)",
                "rgba(75, 192, 192, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(255, 159, 64, 0.7)",
              ],
              borderColor: [
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        })
      }
    }
  }, [statistics])

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Progress circle component
  const ProgressCircle = ({ percentage, size = 100, strokeWidth = 8, color = "#FFB800" }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg height={size} width={size} className="transform -rotate-90">
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-ramesh-gold"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <span className="absolute text-xl font-bold text-gray-700">{Math.round(percentage)}%</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/users" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Statistics</h1>
            <p className="text-gray-600">Comprehensive analytics and insights about your users</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchUserStatistics}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading statistics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchUserStatistics}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900">{statistics.total_users || 0}</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {statistics.active_users || 0} active, {statistics.inactive_users || 0} inactive
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Profile Completion</p>
                  <p className="text-3xl font-bold text-green-900">{statistics.profile_completion_rate || 0}%</p>
                  <p className="text-sm text-green-700 mt-1">
                    {statistics.users_with_complete_profiles || 0} complete profiles
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Order Conversion</p>
                  <p className="text-3xl font-bold text-purple-900">{statistics.order_conversion_rate || 0}%</p>
                  <p className="text-sm text-purple-700 mt-1">{statistics.users_with_orders || 0} users have orders</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-amber-900">{formatCurrency(statistics.total_revenue || 0)}</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Avg: {formatCurrency(statistics.average_order_value || 0)}
                  </p>
                </div>
                <div className="p-3 bg-amber-200 rounded-full">
                  <IndianRupee className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registration Trends */}
            {chartData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Registration Trends (Last 30 Days)
                </h3>
                <div className="h-64">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Gender Distribution */}
            {genderChartData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-purple-600" />
                  Gender Distribution
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={genderChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Activity Patterns */}
            {activityChartData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  User Activity Patterns
                </h3>
                <div className="h-64">
                  <Bar
                    data={activityChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Order Status Distribution */}
            {orderStatusChartData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-amber-600" />
                  Order Status Distribution
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={orderStatusChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Geographic Distribution */}
          {statistics.geographic_distribution && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Top States
                </h3>
                <div className="space-y-3">
                  {statistics.geographic_distribution.top_states?.map((state, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{state.state}</span>
                      <span className="text-sm text-gray-600">{state.user_count} users</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Top Cities
                </h3>
                <div className="space-y-3">
                  {statistics.geographic_distribution.top_cities?.slice(0, 5).map((city, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{city.city}</span>
                        <span className="text-sm text-gray-500 ml-2">({city.state})</span>
                      </div>
                      <span className="text-sm text-gray-600">{city.user_count} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Customers */}
          {statistics.top_customers && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                Top Customers
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">By Order Count</h4>
                  <div className="space-y-3">
                    {statistics.top_customers.top_by_order_count?.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-medium text-sm">
                            {customer.first_name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{customer.phone_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{customer.total_orders} orders</p>
                          <p className="text-sm text-gray-600">{formatCurrency(customer.total_spent)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">By Total Spending</h4>
                  <div className="space-y-3">
                    {statistics.top_customers.top_by_spending?.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-medium text-sm">
                            {customer.first_name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.first_name} {customer.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{customer.phone_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(customer.total_spent)}</p>
                          <p className="text-sm text-gray-600">{customer.total_orders} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Statistics */}
          {statistics.payment_statistics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Payment Method Distribution
              </h3>
              <div className="space-y-3">
                {statistics.payment_statistics.payment_method_distribution?.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-900 capitalize">{method.payment_method}</span>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{method.order_count} orders</p>
                      <p className="text-sm text-gray-600">{formatCurrency(method.total_amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion Rate</h3>
              <ProgressCircle percentage={statistics.profile_completion_rate || 0} color="#10B981" />
              <p className="text-sm text-gray-600 mt-3">
                {statistics.users_with_complete_profiles || 0} of {statistics.total_users || 0} users
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Completion Rate</h3>
              <ProgressCircle percentage={statistics.address_completion_rate || 0} color="#3B82F6" />
              <p className="text-sm text-gray-600 mt-3">
                {statistics.users_with_addresses || 0} of {statistics.total_users || 0} users
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Conversion Rate</h3>
              <ProgressCircle percentage={statistics.order_conversion_rate || 0} color="#F59E0B" />
              <p className="text-sm text-gray-600 mt-3">
                {statistics.users_with_orders || 0} of {statistics.total_users || 0} users
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserStatistics
