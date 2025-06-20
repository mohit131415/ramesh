"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useUser } from "../../contexts/UserContext"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Activity,
  UserCheck,
  UserX,
  Clock,
  Home,
  Building,
  Heart,
  ShoppingBag,
  CreditCard,
  TrendingUp,
} from "lucide-react"

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, loading, error, fetchUserById, updateUserStatus, clearError } = useUser()
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchUserById(Number.parseInt(id))
    }
  }, [id, fetchUserById])

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await updateUserStatus(Number.parseInt(id), newStatus)
      // Refresh user data
      await fetchUserById(Number.parseInt(id))
    } finally {
      setUpdating(false)
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => fetchUserById(Number.parseInt(id))}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/users")}
                  className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-200"
                >
                  Back to Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">User not found</p>
          <button
            onClick={() => navigate("/users")}
            className="mt-4 px-4 py-2 bg-ramesh-gold text-white rounded-md hover:bg-ramesh-gold/90"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return Home
      case "work":
        return Building
      default:
        return MapPin
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate("/users")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600">View and manage user information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleStatusUpdate(currentUser.status === "active" ? "inactive" : "active")}
            disabled={updating}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
              currentUser.status === "active"
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            ) : currentUser.status === "active" ? (
              <UserX className="h-4 w-4 mr-2" />
            ) : (
              <UserCheck className="h-4 w-4 mr-2" />
            )}
            {currentUser.status === "active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              {currentUser.profile?.profile_picture ? (
                <img
                  src={`/imageapi/api/${currentUser.profile.profile_picture}`}
                  alt={currentUser.profile?.full_name || "User"}
                  className="h-20 w-20 rounded-full mx-auto mb-4 object-cover border-2 border-ramesh-gold"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "flex"
                  }}
                />
              ) : null}
              <div
                className={`h-20 w-20 rounded-full bg-ramesh-gold flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 ${
                  currentUser.profile?.profile_picture ? "hidden" : "flex"
                }`}
              >
                {currentUser.profile?.first_name?.[0] || currentUser.phone_number?.[0] || "U"}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{currentUser.profile?.full_name || "No Name"}</h2>
              <p className="text-gray-600 flex items-center justify-center mt-1">
                <Phone className="h-4 w-4 mr-1" />
                {currentUser.phone_number}
              </p>
              <div className="mt-4">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    currentUser.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {currentUser.status}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">User ID</span>
                <span className="font-medium">#{currentUser.id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Profile Status</span>
                <span className={`font-medium ${currentUser.has_complete_profile ? "text-green-600" : "text-red-600"}`}>
                  {currentUser.has_complete_profile ? "Complete" : "Incomplete"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Addresses</span>
                <span className="font-medium">{currentUser.address_count}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium">{currentUser.order_statistics?.total_orders || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Joined</span>
                <span className="font-medium">{new Date(currentUser.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          {currentUser.order_statistics && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <ShoppingBag className="h-5 w-5 mr-2 text-amber-600" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-medium">{currentUser.order_statistics.total_orders}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Pending Orders</span>
                  <span className="font-medium">{currentUser.order_statistics.pending_orders}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Delivered Orders</span>
                  <span className="font-medium">{currentUser.order_statistics.delivered_orders}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Cancelled Orders</span>
                  <span className="font-medium">{currentUser.order_statistics.cancelled_orders}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Highest Order</span>
                  <span className="font-medium">
                    {formatCurrency(currentUser.order_statistics.highest_order_value || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Lowest Order</span>
                  <span className="font-medium">
                    {formatCurrency(currentUser.order_statistics.lowest_order_value || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">First Order</span>
                  <span className="font-medium">
                    {currentUser.order_statistics.first_order_date
                      ? new Date(currentUser.order_statistics.first_order_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Last Order</span>
                  <span className="font-medium">
                    {currentUser.order_statistics.last_order_date
                      ? new Date(currentUser.order_statistics.last_order_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Statistics */}
          {currentUser.payment_statistics && currentUser.payment_statistics.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Payment Methods
              </h3>
              <div className="space-y-4">
                {currentUser.payment_statistics.map((payment, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">{payment.payment_method}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {payment.payment_count} payments
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between mb-1">
                        <span>Total Amount:</span>
                        <span className="font-medium">{formatCurrency(payment.total_amount)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Successful:</span>
                        <span>{payment.successful_payments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span>{payment.pending_payments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </h3>
            </div>
            <div className="p-6">
              {currentUser.profile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <p className="text-gray-900">{currentUser.profile.first_name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <p className="text-gray-900">{currentUser.profile.last_name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900 flex items-center">
                      {currentUser.profile.email ? (
                        <>
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {currentUser.profile.email}
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <p className="text-gray-900 capitalize">{currentUser.profile.gender || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <p className="text-gray-900 flex items-center">
                      {currentUser.profile.date_of_birth ? (
                        <>
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(currentUser.profile.date_of_birth).toLocaleDateString()}
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Updated</label>
                    <p className="text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(currentUser.profile.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No profile information available</p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Addresses ({currentUser.address_count})
              </h3>
            </div>
            <div className="p-6">
              {currentUser.addresses && currentUser.addresses.length > 0 ? (
                <div className="space-y-4">
                  {currentUser.addresses.map((address) => {
                    const IconComponent = getAddressIcon(address.address_type)
                    return (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-gray-100 rounded-lg p-2">
                              <IconComponent className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  {address.label ||
                                    address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1)}
                                </h4>
                                {address.is_default && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    <Heart className="h-3 w-3 mr-1" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{address.full_address}</p>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>{address.contact_name}</p>
                                <p className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {address.contact_phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No addresses available</p>
                </div>
              )}
            </div>
          </div>

          {/* Order History Summary */}
          {currentUser.order_history_summary && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Order History
                </h3>
              </div>
              <div className="p-6">
                {currentUser.order_history_summary.monthly_summary &&
                currentUser.order_history_summary.monthly_summary.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-3">Monthly Summary</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Month
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Orders
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Total Amount
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Avg. Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentUser.order_history_summary.monthly_summary.map((month, index) => {
                              const date = new Date(month.month + "-01")
                              const monthName = date.toLocaleString("default", { month: "long", year: "numeric" })

                              return (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {monthName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {month.order_count}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatCurrency(month.total_amount)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatCurrency(month.avg_amount)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {currentUser.order_history_summary.status_summary &&
                      currentUser.order_history_summary.status_summary.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-3">Status Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentUser.order_history_summary.status_summary.map((status, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900 capitalize">
                                    {status.status || "No Status"}
                                  </span>
                                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {status.count} orders
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Total Amount:</span>
                                    <span className="font-medium">{formatCurrency(status.total_amount)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No order history available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Activity Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                  <p className="text-gray-900 flex items-center">
                    {currentUser.last_login_at ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(currentUser.last_login_at).toLocaleString()}
                      </>
                    ) : (
                      "Never logged in"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(currentUser.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetail
