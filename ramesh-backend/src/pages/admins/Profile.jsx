"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useAdmin } from "../../contexts/AdminContext"
import { User, Phone, Mail, Shield, Clock, Eye, EyeOff, AlertCircle, Camera, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"

const Profile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentAdmin, loading, error, getAdmin, updateAdmin } = useAdmin()
  const [setError, setErrors] = useState(null)

  // UI states
  const [isEditing, setIsEditing] = useState(false) // Edit mode disabled for all users
  const [showPassword, setShowPassword] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    profile_image: null,
  })

  // Load admin data on mount
  useEffect(() => {
    if (user?.id) {
      getAdmin(user.id)
    }
  }, [user])

  // Populate form when currentAdmin changes
  useEffect(() => {
    if (currentAdmin) {
      setFormData({
        username: currentAdmin.username || "",
        email: currentAdmin.email || "",
        password: "", // Don't populate password
        first_name: currentAdmin.first_name || "",
        last_name: currentAdmin.last_name || "",
        phone: currentAdmin.phone || "",
        profile_image: null, // Don't populate file input
      })

      // Set image preview if exists
      if (currentAdmin.profile_image_url) {
        setImagePreview(currentAdmin.profile_image_url)
      }
    }
  }, [currentAdmin])

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === "file") {
      const file = files[0]

      if (file) {
        // Preview image
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target.result)
        }
        reader.readAsDataURL(file)

        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors(null)
    setSuccess(null)

    try {
      // Create a copy of form data to submit
      const dataToSubmit = { ...formData }

      // Remove empty password
      if (!dataToSubmit.password) {
        delete dataToSubmit.password
      }

      // Submit form
      if (await updateAdmin(user.id, dataToSubmit)) {
        setIsEditing(false)
        setSuccess("Profile updated successfully")
        toast.success("Profile updated successfully")
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">View and manage your account information</p>
      </div>

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

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold"></div>
        </div>
      ) : currentAdmin ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isEditing ? (
            // Edit mode
            <form onSubmit={handleSubmit} className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column - Profile image */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Profile Preview"
                        className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-ramesh-gold/20 flex items-center justify-center text-ramesh-gold text-4xl font-medium border-4 border-white shadow-lg">
                        {formData.first_name?.[0]}
                        {formData.last_name?.[0]}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-ramesh-gold text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-ramesh-gold/90 transition-colors">
                      <Camera className="h-5 w-5" />
                      <input
                        type="file"
                        id="profile_image"
                        name="profile_image"
                        onChange={handleChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Click the camera icon to change your profile picture</p>
                </div>

                {/* Right column - Form fields */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent pr-10 shadow-sm"
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-ramesh-gold text-white rounded-lg hover:bg-ramesh-gold/90 disabled:opacity-50 shadow-sm transition-all duration-200 flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            // View mode
            <div className="md:flex">
              {/* Left column - Profile image and basic info */}
              <div className="md:w-1/3 p-8 bg-gray-50 border-r border-gray-200">
                <div className="flex flex-col items-center">
                  {currentAdmin.profile_image_url ? (
                    <img
                      src={currentAdmin.profile_image_url || "/placeholder.svg"}
                      alt={`${currentAdmin.first_name} ${currentAdmin.last_name}`}
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-ramesh-gold/20 flex items-center justify-center text-ramesh-gold text-4xl font-medium border-4 border-white shadow-lg">
                      {currentAdmin.first_name?.[0]}
                      {currentAdmin.last_name?.[0]}
                    </div>
                  )}

                  <h1 className="mt-6 text-2xl font-bold text-gray-900">
                    {currentAdmin.first_name} {currentAdmin.last_name}
                  </h1>

                  <p className="text-gray-600 mb-2">@{currentAdmin.username}</p>

                  <div className="mt-2 mb-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        currentAdmin.role === "super_admin"
                          ? "bg-ramesh-gold/20 text-ramesh-gold"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {currentAdmin.role === "super_admin" ? "Super Admin" : "Admin"}
                    </span>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                      <Mail className="h-5 w-5 text-ramesh-gold mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium">{currentAdmin.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                      <Phone className="h-5 w-5 text-ramesh-gold mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{currentAdmin.phone || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                      <User className="h-5 w-5 text-ramesh-gold mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">ID</p>
                        <p className="text-sm font-medium">{currentAdmin.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Edit button */}
                  {/* <button
                    onClick={() => setIsEditing(true)}
                    className="mt-8 w-full flex justify-center items-center px-4 py-2.5 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90 shadow-sm transition-all duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button> */}
                </div>
              </div>

              {/* Right column - Detailed information */}
              <div className="md:w-2/3 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                        <Shield className="h-5 w-5 mr-2 text-ramesh-gold" />
                        Account Details
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="text-base font-medium mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                currentAdmin.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : currentAdmin.status === "inactive"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {currentAdmin.status.charAt(0).toUpperCase() + currentAdmin.status.slice(1)}
                            </span>
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Created At</p>
                          <p className="text-base font-medium mt-1">{formatDate(currentAdmin.created_at)}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Updated At</p>
                          <p className="text-base font-medium mt-1">{formatDate(currentAdmin.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                        <Clock className="h-5 w-5 mr-2 text-ramesh-gold" />
                        Activity
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Account Status</p>
                          <p className="text-base font-medium mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                currentAdmin.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : currentAdmin.status === "inactive"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {currentAdmin.status?.charAt(0).toUpperCase() + currentAdmin.status?.slice(1) ||
                                "Unknown"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                        <Shield className="h-5 w-5 mr-2 text-ramesh-gold" />
                        Security
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Password</p>
                          <p className="text-base font-medium mt-1">••••••••</p>
                        </div>
                        <button
                          onClick={() => navigate("/settings/password")}
                          className="text-sm text-ramesh-gold hover:text-ramesh-gold/80 font-medium"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Profile not found</h3>
          <p className="text-gray-500 mb-4">Unable to load your profile information.</p>
        </div>
      )}
    </div>
  )
}

export default Profile
