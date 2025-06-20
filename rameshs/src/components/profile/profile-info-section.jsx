"use client"

import { useState, useEffect, useRef } from "react"
import { Edit3, User, Mail, Calendar, Users, Camera, Save, X, Phone, Upload } from "lucide-react"
import { useProfileData, useCreateProfile, useUpdateProfile } from "../../hooks/useProfile"
import useProfileStore from "../../store/profileStore"
import LoadingSpinner from "../common/loading-spinner"

const ProfileInfoSection = () => {
  const { data: profile, exists, completenessData, isLoading } = useProfileData()
  const createProfileMutation = useCreateProfile()
  const updateProfileMutation = useUpdateProfile()
  const fileInputRef = useRef(null)

  // Zustand store
  const { validateProfileForCreate, validateProfileForUpdate } = useProfileStore()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    profile_picture: "",
  })

  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicturePath) => {
    if (!profilePicturePath) return null

    // Construct correct API URL with /public/ prefix
    const cleanPath = profilePicturePath.replace(/^public\//, "")
    return `${window.location.origin}/api/public/${cleanPath}`
  }

  // Auto-enable editing mode when no profile exists
  useEffect(() => {
    if (!isLoading) {
      if (!exists || !profile) {
        setIsEditing(true)
        initializeForm()
      } else {
        setIsEditing(false)
      }
    }
  }, [profile, exists, isLoading])

  // Initialize form data when profile loads or editing starts
  const initializeForm = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        gender: profile.gender || "",
        date_of_birth: profile.date_of_birth || "",
        profile_picture: profile.profile_picture || "",
      })
      // Set image preview with correct API URL
      setImagePreview(getProfilePictureUrl(profile.profile_picture))
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        gender: "",
        date_of_birth: "",
        profile_picture: "",
      })
      setImagePreview(null)
    }
    setErrors({})
    setSelectedFile(null)
  }

  const handleEdit = () => {
    setIsEditing(true)
    initializeForm()
  }

  const handleCancel = () => {
    // Only allow cancel if profile exists
    if (profile) {
      setIsEditing(false)
      setErrors({})
      setImagePreview(getProfilePictureUrl(profile.profile_picture))
      setSelectedFile(null)
    }
  }

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Convert image to WebP format (silently)
  const convertToWebP = (file, quality = 0.8, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and convert to WebP
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object with WebP format
              const webpFile = new File([blob], `profile_${Date.now()}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
              })
              resolve(webpFile)
            } else {
              reject(new Error("Failed to convert image"))
            }
          },
          "image/webp",
          quality,
        )
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      // Create object URL for the image
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        profile_picture: "Please select a valid image file (JPEG, PNG, WebP, or GIF)",
      }))
      return
    }

    // Validate file size (max 5MB as per API spec)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        profile_picture: "Image size must be less than 5MB",
      }))
      return
    }

    // Clear any previous errors
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.profile_picture
      return newErrors
    })

    setIsProcessingImage(true)

    try {
      // Convert to WebP silently
      const webpFile = await convertToWebP(file, 0.85, 800, 800)

      // Store the converted file for later upload
      setSelectedFile(webpFile)

      // Create preview from the converted file
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(webpFile)
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        profile_picture: "Failed to process image. Please try again with a different image.",
      }))
    } finally {
      setIsProcessingImage(false)
    }
  }

  const validateForm = () => {
    const isCreate = !exists || !profile

    // Use appropriate validation based on operation type
    const validationErrors = isCreate ? validateProfileForCreate(formData) : validateProfileForUpdate(formData)

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const prepareFormData = () => {
    const profileData = new FormData()
    const isCreate = !exists || !profile

    if (isCreate) {
      // CREATE: Add required fields and optional fields if provided
      if (formData.first_name.trim()) {
        profileData.append("first_name", formData.first_name.trim())
      }
      if (formData.last_name.trim()) {
        profileData.append("last_name", formData.last_name.trim())
      }
      if (formData.email.trim()) {
        profileData.append("email", formData.email.trim())
      }
      if (formData.gender) {
        profileData.append("gender", formData.gender)
      }
      if (formData.date_of_birth) {
        profileData.append("date_of_birth", formData.date_of_birth)
      }
    } else {
      // UPDATE: Only add fields that have values
      if (formData.first_name.trim()) {
        profileData.append("first_name", formData.first_name.trim())
      }
      if (formData.last_name.trim()) {
        profileData.append("last_name", formData.last_name.trim())
      }
      if (formData.email.trim()) {
        profileData.append("email", formData.email.trim())
      }
      if (formData.gender) {
        profileData.append("gender", formData.gender)
      }
      if (formData.date_of_birth) {
        profileData.append("date_of_birth", formData.date_of_birth)
      }
    }

    // Add file if selected
    if (selectedFile) {
      profileData.append("profile_picture", selectedFile)
    }

    return profileData
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const profileData = prepareFormData()
      const isCreate = !exists || !profile

      // Use appropriate mutation based on whether profile exists
      if (isCreate) {
        await createProfileMutation.mutateAsync(profileData)
      } else {
        await updateProfileMutation.mutateAsync(profileData)
      }

      // Success - exit editing mode
      setIsEditing(false)
      setSelectedFile(null)
      setErrors({})
    } catch (error) {
      // Handle email already in use error specifically
      if (error.message?.includes("Email is already in use")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email address is already in use. Please use a different email.",
        }))
        return
      }

      // Error handling for validation errors
      if (error.status === 400 && error.errors) {
        setErrors(error.errors)
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Not provided"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    if (formData.first_name && formData.last_name) {
      return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase()
    }
    return "U"
  }

  // Check if any mutation is loading
  const isSaving = createProfileMutation.isPending || updateProfileMutation.isPending
  const isCreate = !exists || !profile

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-6 w-6 text-white mr-3" />
            <h2 className="text-xl font-semibold text-white">
              {isCreate ? "Create Your Profile" : "Profile Information"}
            </h2>
          </div>
          {!isEditing && profile && (
            <button
              onClick={handleEdit}
              className="flex items-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {isEditing ? (
          /* Create/Edit Form */
          <div className="space-y-6">
            {/* Required Fields Notice for Create */}
            {isCreate && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-amber-400 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-800">
                      <strong>Required fields:</strong> First name, last name, and email are required to create your
                      profile. Other fields are optional but help us provide better service.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = "none"
                      e.target.nextSibling.style.display = "flex"
                    }}
                  />
                ) : null}

                {/* Fallback initials div - shown when no image or image fails */}
                <div
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200"
                  style={{ display: imagePreview ? "none" : "flex" }}
                >
                  {getInitials()}
                </div>

                {/* Camera/Upload Button */}
                <button
                  type="button"
                  onClick={handleImageClick}
                  disabled={isSaving || isProcessingImage}
                  className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-300 rounded-full p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving || isProcessingImage ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Camera className="h-4 w-4 text-gray-600" />
                  )}
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Profile Picture</h3>
                <p className="text-sm text-gray-500 mb-2">Upload a photo to personalize your account (optional)</p>

                {/* Upload Button Alternative */}
                <button
                  type="button"
                  onClick={handleImageClick}
                  disabled={isSaving || isProcessingImage}
                  className="flex items-center text-sm text-[#d3ae6e] hover:text-[#c3a05e] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {isProcessingImage ? "Processing..." : selectedFile ? "Change Image" : "Choose Image"}
                </button>

                <p className="text-xs text-gray-400 mt-1">Supported: JPEG, PNG, WebP, GIF (max 5MB)</p>

                {errors.profile_picture && <p className="text-xs text-red-600 mt-1">{errors.profile_picture}</p>}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name {isCreate && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent transition-colors ${
                    errors.first_name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={isCreate ? "Enter your first name" : "Enter your first name (optional)"}
                  maxLength={100}
                />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name {isCreate && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent transition-colors ${
                    errors.last_name ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={isCreate ? "Enter your last name" : "Enter your last name (optional)"}
                  maxLength={100}
                />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address {isCreate && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent transition-colors ${
                    errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={isCreate ? "Enter your email address" : "Enter your email address (optional)"}
                  maxLength={255}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent transition-colors ${
                    errors.gender ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">Select gender (optional)</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
              </div>

              {/* Date of Birth */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  min="1900-01-01"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent transition-colors ${
                    errors.date_of_birth ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">Optional - helps us provide better recommendations</p>
                {errors.date_of_birth && <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>}
              </div>
            </div>

            {/* Mobile Number Info (Non-editable) */}
            {profile?.phone_number && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Mobile Number</p>
                    <p className="text-gray-900">{profile.phone_number}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mobile number cannot be changed here. Contact support if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              {profile && (
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || isProcessingImage}
                className="flex items-center bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] hover:from-[#c3a05e] hover:to-[#b8955e] text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isProcessingImage
                  ? "Processing..."
                  : isSaving
                    ? "Saving..."
                    : isCreate
                      ? "Create Profile"
                      : "Update Profile"}
              </button>
            </div>
          </div>
        ) : (
          /* Display Mode */
          <div className="space-y-8">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-center space-x-6">
              {profile?.profile_picture ? (
                <img
                  src={getProfilePictureUrl(profile.profile_picture) || "/placeholder.svg"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "flex"
                  }}
                />
              ) : null}

              {/* Fallback initials div */}
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200"
                style={{ display: profile?.profile_picture ? "none" : "flex" }}
              >
                {getInitials()}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {profile?.first_name || profile?.last_name
                    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                    : "Welcome!"}
                </h3>
                <p className="text-gray-600">{profile?.email || "Profile created successfully"}</p>
              </div>
            </div>

            {/* Profile Details Grid - 2x2 Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-gray-400 mt-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
                  <p className="text-gray-900 text-lg">{profile?.email || "Not provided"}</p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400 mt-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Date of Birth</p>
                  <p className="text-gray-900 text-lg">{formatDisplayDate(profile?.date_of_birth)}</p>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-gray-400 mt-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Mobile Number</p>
                  <p className="text-gray-900 text-lg">{profile?.phone_number || "Not provided"}</p>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400 mt-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Gender</p>
                  <p className="text-gray-900 text-lg capitalize">
                    {profile?.gender?.replace("_", " ") || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileInfoSection
