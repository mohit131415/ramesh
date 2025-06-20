"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAdmin } from "../../contexts/AdminContext"
import { useAuth } from "../../contexts/AuthContext"
import { ArrowLeft, AlertCircle, Eye, EyeOff, Camera, CheckCircle, User } from "lucide-react"
import { toast } from "react-toastify"

const AdminForm = ({ isEdit = false }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentAdmin, loading, error, getAdmin, createAdmin, updateAdmin, isSuperAdmin, clearCurrentAdmin } =
    useAdmin()

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "admin",
    status: "active",
    profile_image: null,
  })

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [formError, setFormError] = useState(null)

  // Check if user has permission to access this page
  useEffect(() => {
    if (isEdit) {
      // For edit: super_admin can edit any admin, regular admin can only edit themselves
      if (!isSuperAdmin && user?.id !== Number.parseInt(id)) {
        navigate("/profile")
      }
    } else {
      // For create: only super_admin can create admins
      if (!isSuperAdmin) {
        navigate("/profile")
      }
    }
  }, [isEdit, isSuperAdmin, user, id, navigate])

  // Load admin data if editing
  useEffect(() => {
    if (isEdit && id) {
      getAdmin(id)
    } else {
      clearCurrentAdmin()
    }

    return () => {
      clearCurrentAdmin()
    }
  }, [isEdit, id])

  // Populate form when currentAdmin changes
  useEffect(() => {
    if (isEdit && currentAdmin) {
      setFormData({
        username: currentAdmin.username || "",
        email: currentAdmin.email || "",
        password: "", // Don't populate password
        first_name: currentAdmin.first_name || "",
        last_name: currentAdmin.last_name || "",
        phone: currentAdmin.phone || "",
        role: currentAdmin.role || "admin",
        status: currentAdmin.status || "active",
        profile_image: null, // Don't populate file input
      })

      // Set image preview if exists
      if (currentAdmin.profile_image_url) {
        setImagePreview(currentAdmin.profile_image_url)
      }
    }
  }, [isEdit, currentAdmin])

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
    setFormError(null)
    setSuccess(null)

    try {
      // Create a copy of form data to submit
      const dataToSubmit = { ...formData }

      // Remove empty password for edit
      if (isEdit && !dataToSubmit.password) {
        delete dataToSubmit.password
      }

      // Submit form
      let success

      if (isEdit) {
        success = await updateAdmin(id, dataToSubmit)
      } else {
        success = await createAdmin(dataToSubmit)
      }

      if (success) {
        setSuccess(isEdit ? "Admin updated successfully" : "Admin created successfully")
        toast.success(isEdit ? "Admin updated successfully" : "Admin created successfully")

        // Navigate after a short delay
        setTimeout(() => {
          navigate(isEdit ? `/admins/${id}` : "/admins")
        }, 1500)
      }
    } catch (err) {
      setFormError("An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Go back
  const goBack = () => {
    navigate(isEdit ? `/admins/${id}` : "/admins")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button onClick={goBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{isEdit ? "Edit Admin" : "Create New Admin"}</h1>
        <p className="text-gray-600">
          {isEdit ? "Update the information for this admin user" : "Fill in the details to create a new admin user"}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {formError && (
          <div className="p-6 bg-red-50 border-b border-red-100">
            <div className="flex items-start text-red-700">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>{formError}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="p-6 bg-green-50 border-b border-green-100">
            <div className="flex items-start text-green-700">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>{success}</div>
            </div>
          </div>
        )}

        {loading && !isEdit ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                      <User className="h-16 w-16" />
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
                <p className="text-sm text-gray-500 mb-6">Click the camera icon to upload a profile picture</p>
              </div>

              {/* Middle column - Account Information */}
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-6">Account Information</h2>

                <div className="space-y-5">
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
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password {isEdit ? "" : "*"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm pr-10"
                        required={!isEdit}
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
                    <p className="mt-1 text-xs text-gray-500">
                      {isEdit ? "Leave blank to keep current password" : "Password must be at least 8 characters long"}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right column - Personal Information */}
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-6">Personal Information</h2>

                <div className="space-y-5">
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
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={goBack}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-ramesh-gold text-white rounded-lg hover:bg-ramesh-gold/90 disabled:opacity-50 shadow-sm transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : isEdit ? (
                  "Update Admin"
                ) : (
                  "Create Admin"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default AdminForm
