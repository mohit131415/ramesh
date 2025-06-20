"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAdmin } from "../../contexts/AdminContext"
import { useAuth } from "../../contexts/AuthContext"
import { ArrowLeft, Edit, Trash2, AlertCircle, User, Phone, Mail, Shield, Clock, X, Check } from "lucide-react"

const AdminDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentAdmin, loading, error, getAdmin, deleteAdmin, updateAdminStatus, isSuperAdmin } = useAdmin()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  // Check if user has permission to access this admin
  useEffect(() => {
    if (!isSuperAdmin && user?.id !== Number.parseInt(id)) {
      navigate("/profile")
    }
  }, [isSuperAdmin, user, id, navigate])

  // Load admin details on mount
  useEffect(() => {
    getAdmin(id)
  }, [id])

  // Set initial selected status when admin data loads
  useEffect(() => {
    if (currentAdmin) {
      setSelectedStatus(currentAdmin.status)
    }
  }, [currentAdmin])

  // Handle delete admin
  const handleDeleteAdmin = async () => {
    if (await deleteAdmin(id)) {
      navigate("/admins")
    }
  }

  // Open status update modal
  const openStatusModal = () => {
    setSelectedStatus(currentAdmin?.status || "active")
    setShowStatusModal(true)
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    setStatusUpdateLoading(true)
    try {
      const success = await updateAdminStatus(id, selectedStatus)
      if (success) {
        setShowStatusModal(false)
      }
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Go back to admin list
  const goBack = () => {
    navigate("/admins")
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get role badge class
  const getRoleBadge = (role) => {
    return role === "super_admin" ? "bg-ramesh-gold/20 text-ramesh-gold" : "bg-blue-100 text-blue-800"
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button onClick={goBack} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Admins
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ramesh-gold"></div>
        </div>
      ) : currentAdmin ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="md:flex">
            {/* Left column - Profile image and basic info */}
            <div className="md:w-1/3 p-6 bg-gray-50 border-r border-gray-200">
              <div className="flex flex-col items-center">
                {currentAdmin.profile_image_url ? (
                  <img
                    src={currentAdmin.profile_image_url || "/placeholder.svg"}
                    alt={`${currentAdmin.first_name} ${currentAdmin.last_name}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-ramesh-gold/20 flex items-center justify-center text-ramesh-gold text-3xl font-medium border-4 border-white shadow-md">
                    {currentAdmin.first_name?.[0]}
                    {currentAdmin.last_name?.[0]}
                  </div>
                )}

                <h1 className="mt-4 text-xl font-bold text-gray-900">
                  {currentAdmin.first_name} {currentAdmin.last_name}
                </h1>

                <p className="text-gray-600">@{currentAdmin.username}</p>

                <div className="mt-3 flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(currentAdmin.role)}`}>
                    {currentAdmin.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(currentAdmin.status)}`}>
                    {currentAdmin.status.charAt(0).toUpperCase() + currentAdmin.status.slice(1)}
                  </span>
                </div>

                <div className="mt-6 w-full">
                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm mb-3">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{currentAdmin.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm mb-3">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{currentAdmin.phone || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-xs text-gray-500">ID</p>
                      <p className="text-sm font-medium">{currentAdmin.id}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex space-x-3 w-full">
                  {isSuperAdmin && (
                    <button
                      onClick={openStatusModal}
                      className="flex-1 flex justify-center items-center px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Status
                    </button>
                  )}

                  {isSuperAdmin && currentAdmin.id !== user?.id && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex-1 flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Detailed information */}
            <div className="md:w-2/3 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-ramesh-gold" />
                    Account Details
                  </h3>

                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="text-base font-medium">{currentAdmin.created_by_name || "System"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-base font-medium">{formatDate(currentAdmin.created_at)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Updated At</p>
                    <p className="text-base font-medium">{formatDate(currentAdmin.updated_at)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-ramesh-gold" />
                    Activity
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Account Activity</p>
                      <p className="text-base font-medium mt-1">
                        {currentAdmin.status === "active" ? "Currently Active" : "Currently Inactive"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Admin not found</h3>
          <p className="text-gray-500 mb-4">
            The admin you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90"
          >
            Go Back to Admin List
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Admin</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this admin? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                onClick={handleDeleteAdmin}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status update modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Update Admin Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-gray-700 mb-4">
              Select a new status for {currentAdmin?.first_name} {currentAdmin?.last_name}:
            </p>

            <div className="space-y-3 mb-6">
              <div
                className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                  selectedStatus === "active" ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedStatus("active")}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                    selectedStatus === "active" ? "bg-green-500" : "border border-gray-300"
                  }`}
                >
                  {selectedStatus === "active" && <Check className="h-4 w-4 text-white" />}
                </div>
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-sm text-gray-500">Admin can log in and perform actions</p>
                </div>
              </div>

              <div
                className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                  selectedStatus === "inactive" ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedStatus("inactive")}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                    selectedStatus === "inactive" ? "bg-yellow-500" : "border border-gray-300"
                  }`}
                >
                  {selectedStatus === "inactive" && <Check className="h-4 w-4 text-white" />}
                </div>
                <div>
                  <p className="font-medium">Inactive</p>
                  <p className="text-sm text-gray-500">Admin cannot log in but account is preserved</p>
                </div>
              </div>

              <div
                className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                  selectedStatus === "suspended" ? "border-red-500 bg-red-50" : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedStatus("suspended")}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                    selectedStatus === "suspended" ? "bg-red-500" : "border border-gray-300"
                  }`}
                >
                  {selectedStatus === "suspended" && <Check className="h-4 w-4 text-white" />}
                </div>
                <div>
                  <p className="font-medium">Suspended</p>
                  <p className="text-sm text-gray-500">Admin account is suspended due to policy violation</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90 flex items-center ${
                  statusUpdateLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
                onClick={handleStatusUpdate}
                disabled={statusUpdateLoading}
              >
                {statusUpdateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDetail
