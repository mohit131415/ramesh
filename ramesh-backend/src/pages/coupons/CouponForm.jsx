"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCoupon } from "../../contexts/CouponContext"
import {
  ArrowLeft,
  Save,
  Tag,
  Percent,
  IndianRupee,
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
  HelpCircle,
  CheckCircle,
  Copy,
  ShoppingBag,
  Users,
  Sparkles,
  FileText,
  Info,
} from "lucide-react"

const CouponForm = ({ isEdit = false }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { coupon, loading, error, fetchCouponById, createCoupon, updateCoupon, deleteCoupon, clearCoupon, clearError } =
    useCoupon()

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    minimum_order_value: "0",
    maximum_discount_amount: "0",
    start_date: getTodayDate(), // Default to today
    end_date: "",
    usage_limit: "0",
    per_user_limit: "0",
    is_active: true,
  })

  // Form validation errors
  const [errors, setErrors] = useState({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showCodeCopied, setShowCodeCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [formError, setFormError] = useState(null)

  // Load coupon data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      fetchCouponById(id)
    }

    // Clear coupon data when component unmounts
    return () => {
      clearCoupon()
      clearError()
    }
  }, [isEdit, id, fetchCouponById, clearCoupon, clearError])

  // Populate form with coupon data when available
  useEffect(() => {
    if (isEdit && coupon) {
      // Format dates for input
      const formatDateForInput = (dateString) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toISOString().split("T")[0] // Format: YYYY-MM-DD
      }

      setFormData({
        code: coupon.code || "",
        name: coupon.name || "",
        description: coupon.description || "",
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value?.toString() || "",
        minimum_order_value: coupon.minimum_order_value?.toString() || "0",
        maximum_discount_amount: coupon.maximum_discount_amount?.toString() || "0",
        start_date: formatDateForInput(coupon.start_date),
        end_date: formatDateForInput(coupon.end_date),
        usage_limit: coupon.usage_limit?.toString() || "0",
        per_user_limit: coupon.per_user_limit?.toString() || "0",
        is_active: coupon.is_active !== undefined ? Boolean(coupon.is_active) : true,
      })
    }
  }, [isEdit, coupon])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Generate random coupon code
  const generateRandomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    setFormData((prev) => ({
      ...prev,
      code: result,
    }))

    // Clear any error on the code field
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: undefined }))
    }
  }

  // Copy coupon code to clipboard
  const copyCodeToClipboard = () => {
    if (formData.code) {
      navigator.clipboard.writeText(formData.code)
      setShowCodeCopied(true)
      setTimeout(() => setShowCodeCopied(false), 2000)
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required"
    } else if (formData.code.length < 3 || formData.code.length > 50) {
      newErrors.code = "Code must be between 3 and 50 characters"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Coupon name is required"
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters"
    }

    if (formData.description && formData.description.length > 255) {
      newErrors.description = "Description must be less than 255 characters"
    }

    // Discount value
    if (!formData.discount_value) {
      newErrors.discount_value = "Discount value is required"
    } else {
      const discountValue = Number.parseFloat(formData.discount_value)
      if (isNaN(discountValue) || discountValue <= 0) {
        newErrors.discount_value = "Discount value must be greater than 0"
      } else if (formData.discount_type === "percentage" && discountValue > 100) {
        newErrors.discount_value = "Percentage discount cannot exceed 100%"
      }
    }

    // Start date is required
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required"
    }

    // End date must be after start date
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    clearError()
    setFormError(null)
    setSuccess(null)

    if (!validateForm()) {
      return
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        discount_value: Number.parseFloat(formData.discount_value),
        minimum_order_value: Number.parseFloat(formData.minimum_order_value) || 0,
        maximum_discount_amount: Number.parseFloat(formData.maximum_discount_amount) || 0,
        usage_limit: Number.parseInt(formData.usage_limit, 10) || 0,
        per_user_limit: Number.parseInt(formData.per_user_limit, 10) || 0,
      }

      // Ensure start_date is in the correct format (YYYY-MM-DD)
      if (apiData.start_date) {
        apiData.start_date = apiData.start_date.split("T")[0]
      }

      // Ensure end_date is in the correct format (YYYY-MM-DD)
      if (apiData.end_date) {
        apiData.end_date = apiData.end_date.split("T")[0]
      }

      let response

      if (isEdit) {
        response = await updateCoupon(id, apiData)
      } else {
        response = await createCoupon(apiData)
      }

      // Check if the response has a status property
      if (response && response.status) {
        if (response.status === "success") {
          // Set success message from API response
          setSuccess(response.message || "")

          // Navigate after a short delay
          setTimeout(() => {
            navigate(isEdit ? `/coupons/${id}` : `/coupons/${response.data.id}`)
          }, 1500)
        } else if (response.status === "error") {
          // Set error message from API response
          setFormError(response.message || "")
        }
      } else {
        // Fallback error message if response structure is unexpected
        setFormError("Unexpected response format. Please try again.")
      }
    } catch (err) {
      console.error("Form submission error:", err)
      setFormError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete coupon
  const handleDelete = async () => {
    const response = await deleteCoupon(id)

    if (response && response.status === "success") {
      // Immediately navigate to the coupons list page on success
      navigate("/coupons")
    } else {
      // Show error message from API
      setFormError(response?.message || "")
    }
  }

  // Format currency display
  const formatCurrency = (value) => {
    return `₹${Number.parseFloat(value).toFixed(2)}`
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Help tooltip */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" style={{ color: "#d3ae6e" }} />
              Coupon Form Help
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What am I looking at?</h4>
                <p>This form allows you to {isEdit ? "edit an existing" : "create a new"} coupon for your customers.</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Key Fields:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Coupon Code:</span> A unique identifier customers will enter at
                    checkout
                  </li>
                  <li>
                    <span className="font-medium">Discount Type:</span> Percentage (%) or Fixed Amount (₹)
                  </li>
                  <li>
                    <span className="font-medium">Discount Value:</span> How much discount to apply
                  </li>
                  <li>
                    <span className="font-medium">Minimum Order Value:</span> The minimum cart value required
                  </li>
                  <li>
                    <span className="font-medium">Maximum Discount:</span> The maximum discount amount (for percentage
                    discounts)
                  </li>
                  <li>
                    <span className="font-medium">Start/End Dates:</span> When the coupon is valid
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use clear, memorable coupon codes</li>
                  <li>Set appropriate minimum order values to ensure profitability</li>
                  <li>For percentage discounts, consider setting a maximum discount amount</li>
                  <li>Limited-time coupons create urgency</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 text-white rounded-lg font-medium transition-colors"
                style={{ backgroundColor: "#d3ae6e", ":hover": { backgroundColor: "#c09c5c" } }}
                onClick={() => setShowHelp(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/coupons")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Coupon" : "Create New Coupon"}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? "Update the details of an existing coupon" : "Create a new discount coupon for your customers"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1"
          style={{ ":hover": { color: "#d3ae6e" } }}
          title="Help"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Help</span>
        </button>
      </div>

      {/* Error Message from Context */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm animate-fadeIn">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
        {/* Coupon Preview Card - Always visible at the top */}
        <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <Tag className="h-5 w-5 mr-2" style={{ color: "#d3ae6e" }} />
              Coupon Preview
            </h3>
            <div className="flex items-center">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${formData.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
              >
                {formData.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-yellow-100"></div>
            <div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-yellow-100"></div>

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-900">{formData.name || "Coupon Name"}</div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {formData.description || "Coupon description will appear here"}
                  </div>
                </div>
                <div className="mt-3 sm:mt-0">
                  <div
                    className="inline-block px-4 py-2 rounded-lg font-bold text-lg tracking-wider"
                    style={{ backgroundColor: "rgba(211, 174, 110, 0.2)", color: "#d3ae6e" }}
                  >
                    {formData.code || "CODE"}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-dashed border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Discount</div>
                    <div className="font-medium text-lg flex items-center">
                      {formData.discount_type === "percentage" ? (
                        <>
                          <Percent className="h-4 w-4 mr-1" style={{ color: "#d3ae6e" }} />
                          {formData.discount_value || "0"}%
                        </>
                      ) : (
                        <>
                          <IndianRupee className="h-4 w-4 mr-1" style={{ color: "#d3ae6e" }} />
                          {formData.discount_value || "0"}
                        </>
                      )}
                    </div>
                  </div>

                  {formData.minimum_order_value !== "0" && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Min. Order</div>
                      <div className="font-medium text-lg flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-1" style={{ color: "#d3ae6e" }} />₹
                        {Number.parseFloat(formData.minimum_order_value).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {formData.discount_type === "percentage" && formData.maximum_discount_amount !== "0" && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Max. Discount</div>
                      <div className="font-medium text-lg flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1" style={{ color: "#d3ae6e" }} />
                        {Number.parseFloat(formData.maximum_discount_amount).toFixed(2)}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Valid Period</div>
                    <div className="font-medium text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1" style={{ color: "#d3ae6e" }} />
                      <span className="truncate">
                        {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Start date"}
                        {formData.end_date ? ` → ${new Date(formData.end_date).toLocaleDateString()}` : " → No expiry"}
                      </span>
                    </div>
                  </div>

                  {formData.usage_limit !== "0" && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Usage Limit</div>
                      <div className="font-medium text-lg flex items-center">
                        <Users className="h-4 w-4 mr-1" style={{ color: "#d3ae6e" }} />
                        {formData.usage_limit}
                      </div>
                    </div>
                  )}

                  {formData.per_user_limit !== "0" && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Per User</div>
                      <div className="font-medium text-lg flex items-center">
                        <Users className="h-4 w-4 mr-1" style={{ color: "#d3ae6e" }} />
                        {formData.per_user_limit}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column - Basic Info */}
              <div className="flex-1">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center border-b pb-2">
                    <Tag className="h-5 w-5 mr-2" style={{ color: "#d3ae6e" }} />
                    Basic Information
                  </h3>

                  {/* Coupon Code */}
                  <div className="mb-5">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                        </div>
                        <input
                          type="text"
                          id="code"
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          className={`pl-10 block w-full rounded-lg border ${
                            errors.code ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-gray-300"
                          } focus:outline-none focus:ring-2 py-3 text-base shadow-sm transition-all duration-200`}
                          style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                          placeholder="e.g., SUMMER2023"
                        />
                        {formData.code && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={copyCodeToClipboard}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              style={{ ":hover": { color: "#d3ae6e" } }}
                              title="Copy code"
                            >
                              {showCodeCopied ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Copy className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="px-4 py-3 rounded-lg font-medium transition-colors flex items-center whitespace-nowrap"
                        style={{
                          backgroundColor: "rgba(211, 174, 110, 0.2)",
                          color: "#d3ae6e",
                          ":hover": { backgroundColor: "rgba(211, 174, 110, 0.3)" },
                        }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate
                      </button>
                    </div>
                    {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code}</p>}
                    <p className="mt-1 text-xs text-gray-500">Unique code for this coupon (3-50 characters)</p>
                  </div>

                  {/* Coupon Name */}
                  <div className="mb-5">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`pl-10 block w-full rounded-lg border ${
                          errors.name ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-gray-300"
                        } focus:outline-none focus:ring-2 py-2.5 text-base shadow-sm transition-all duration-200`}
                        style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                        placeholder="e.g., Summer Sale"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    <p className="mt-1 text-xs text-gray-500">Descriptive name for the coupon (max 100 characters)</p>
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <Info className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className={`pl-10 block w-full rounded-lg border ${
                          errors.description
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-gray-300"
                        } focus:outline-none focus:ring-2 py-2.5 px-3 text-base shadow-sm transition-all duration-200`}
                        style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                        placeholder="e.g., 20% off for summer season"
                      />
                    </div>
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    <p className="mt-1 text-xs text-gray-500">Optional description (max 255 characters)</p>
                  </div>

                  {/* Is Active - Premium Radio Buttons */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Status</label>
                    <div className="flex space-x-4">
                      <div
                        className={`relative flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          formData.is_active
                            ? "bg-yellow-50 border-2 border-ramesh-gold shadow-sm"
                            : "bg-white border-2 border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, is_active: true }))}
                      >
                        <div
                          className="flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0"
                          style={{ borderColor: formData.is_active ? "#d3ae6e" : "#d1d5db" }}
                        >
                          {formData.is_active && (
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#d3ae6e" }}></div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Active</span>
                          <p className="text-xs text-gray-500 mt-1">Coupon can be used by customers</p>
                        </div>
                      </div>

                      <div
                        className={`relative flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          !formData.is_active
                            ? "bg-gray-50 border-2 border-gray-400 shadow-sm"
                            : "bg-white border-2 border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, is_active: false }))}
                      >
                        <div
                          className="flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0"
                          style={{ borderColor: !formData.is_active ? "#9ca3af" : "#d1d5db" }}
                        >
                          {!formData.is_active && <div className="w-3 h-3 rounded-full bg-gray-400"></div>}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Inactive</span>
                          <p className="text-xs text-gray-500 mt-1">Coupon cannot be used</p>
                        </div>
                      </div>
                    </div>

                    {/* Hidden input to maintain form state */}
                    <input type="hidden" name="is_active" value={formData.is_active.toString()} />
                  </div>
                </div>

                {/* Discount Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center border-b pb-2">
                    <Percent className="h-5 w-5 mr-2" style={{ color: "#d3ae6e" }} />
                    Discount Details
                  </h3>

                  <div className="space-y-5">
                    {/* Discount Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`cursor-pointer rounded-lg border p-3 flex items-center ${
                            formData.discount_type === "percentage"
                              ? "border-gray-300 ring-2 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={
                            formData.discount_type === "percentage"
                              ? {
                                  borderColor: "#d3ae6e",
                                  backgroundColor: "rgba(211, 174, 110, 0.1)",
                                  ringColor: "rgba(211, 174, 110, 0.3)",
                                }
                              : {}
                          }
                          onClick={() => setFormData({ ...formData, discount_type: "percentage" })}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                              formData.discount_type === "percentage" ? "border-gray-400" : "border-gray-400"
                            }`}
                            style={{ borderColor: formData.discount_type === "percentage" ? "#d3ae6e" : "" }}
                          >
                            {formData.discount_type === "percentage" && (
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#d3ae6e" }}></div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Percent className="h-5 w-5 mr-2" style={{ color: "#d3ae6e" }} />
                            <span>Percentage</span>
                          </div>
                        </div>
                        <div
                          className={`cursor-pointer rounded-lg border p-3 flex items-center ${
                            formData.discount_type === "fixed_amount"
                              ? "border-gray-300 ring-2 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={
                            formData.discount_type === "fixed_amount"
                              ? {
                                  borderColor: "#d3ae6e",
                                  backgroundColor: "rgba(211, 174, 110, 0.1)",
                                  ringColor: "rgba(211, 174, 110, 0.3)",
                                }
                              : {}
                          }
                          onClick={() => setFormData({ ...formData, discount_type: "fixed_amount" })}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                              formData.discount_type === "fixed_amount" ? "border-gray-400" : "border-gray-400"
                            }`}
                            style={{ borderColor: formData.discount_type === "fixed_amount" ? "#d3ae6e" : "" }}
                          >
                            {formData.discount_type === "fixed_amount" && (
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#d3ae6e" }}></div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <IndianRupee className="h-5 w-5 mr-2" style={{ color: "#d3ae6e" }} />
                            <span>Fixed Amount</span>
                          </div>
                        </div>
                      </div>
                      <input type="hidden" name="discount_type" value={formData.discount_type} />
                    </div>

                    {/* Discount Value */}
                    <div>
                      <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {formData.discount_type === "percentage" ? (
                            <Percent className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                          ) : (
                            <IndianRupee className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                          )}
                        </div>
                        <input
                          type="number"
                          id="discount_value"
                          name="discount_value"
                          value={formData.discount_value}
                          onChange={handleChange}
                          min="0"
                          step={formData.discount_type === "percentage" ? "1" : "0.01"}
                          className={`pl-10 block w-full rounded-lg border ${
                            errors.discount_value
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-gray-300"
                          } focus:outline-none focus:ring-2 py-2.5 text-base shadow-sm transition-all duration-200`}
                          style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                          placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 10.00"}
                        />
                      </div>
                      {errors.discount_value && <p className="mt-1 text-sm text-red-600">{errors.discount_value}</p>}
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.discount_type === "percentage"
                          ? "Percentage discount (1-100)"
                          : "Fixed amount discount"}
                      </p>
                    </div>

                    {/* Minimum Order Value */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="minimum_order_value" className="block text-sm font-medium text-gray-700">
                          Minimum Order Value
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="has_minimum_order"
                            checked={formData.minimum_order_value === "0"}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                minimum_order_value: prev.minimum_order_value === "0" ? "100" : "0",
                              }))
                            }}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                            style={{ accentColor: "#d3ae6e" }}
                          />
                          <label htmlFor="has_minimum_order" className="ml-2 block text-sm text-gray-700">
                            No limit
                          </label>
                        </div>
                      </div>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                        </div>
                        <input
                          type="number"
                          id="minimum_order_value"
                          name="minimum_order_value"
                          value={formData.minimum_order_value}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="pl-10 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 py-2.5 text-base shadow-sm transition-all duration-200"
                          style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                          placeholder="e.g., 50.00"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.minimum_order_value === "0"
                          ? "No minimum order amount required"
                          : "Minimum order amount required to use this coupon"}
                      </p>
                    </div>

                    {/* Maximum Discount Amount (for percentage discounts) */}
                    {formData.discount_type === "percentage" && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="maximum_discount_amount" className="block text-sm font-medium text-gray-700">
                            Maximum Discount Amount
                          </label>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="has_max_discount"
                              checked={formData.maximum_discount_amount === "0"}
                              onChange={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  maximum_discount_amount: prev.maximum_discount_amount === "0" ? "500" : "0",
                                }))
                              }}
                              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                              style={{ accentColor: "#d3ae6e" }}
                            />
                            <label htmlFor="has_max_discount" className="ml-2 block text-sm text-gray-700">
                              No limit
                            </label>
                          </div>
                        </div>
                        <div className="relative rounded-lg shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IndianRupee className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                          </div>
                          <input
                            type="number"
                            id="maximum_discount_amount"
                            name="maximum_discount_amount"
                            value={formData.maximum_discount_amount}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="pl-10 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 py-2.5 text-base shadow-sm transition-all duration-200"
                            style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                            placeholder="e.g., 20.00"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.maximum_discount_amount === "0"
                            ? "No maximum discount limit"
                            : "Maximum discount amount that can be applied with this coupon"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column - Validity & Usage */}
              <div className="flex-1">
                {/* Validity Period */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center border-b pb-2">
                    <Calendar className="h-5 w-5 mr-2" style={{ color: "#d3ae6e" }} />
                    Validity Period
                  </h3>

                  <div className="space-y-5">
                    {/* Start Date */}
                    <div>
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                        </div>
                        <input
                          type="date"
                          id="start_date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          className={`pl-10 block w-full rounded-lg border ${
                            errors.start_date
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-gray-300"
                          } focus:outline-none focus:ring-2 py-2.5 text-base shadow-sm transition-all duration-200`}
                          style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                        />
                      </div>
                      {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                      <p className="mt-1 text-xs text-gray-500">
                        When the coupon becomes valid. If today, it will be active immediately. If a future date, it
                        will be active at 12:00 AM on that day.
                      </p>
                    </div>

                    {/* End Date */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                          End Date
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="no_expiration"
                            checked={!formData.end_date}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                end_date: prev.end_date ? "" : getTodayDate(), // Set to empty for no expiration, or today's date if enabling
                              }))
                              if (errors.end_date) {
                                setErrors((prev) => ({ ...prev, end_date: undefined }))
                              }
                            }}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                            style={{ accentColor: "#d3ae6e" }}
                          />
                          <label htmlFor="no_expiration" className="ml-2 block text-sm text-gray-700">
                            No expiration
                          </label>
                        </div>
                      </div>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                        </div>
                        <input
                          type="date"
                          id="end_date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className={`pl-10 block w-full rounded-lg border ${
                            errors.end_date
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-gray-300"
                          } focus:outline-none focus:ring-2 py-2.5 text-base shadow-sm transition-all duration-200`}
                          style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                        />
                      </div>
                      {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                      <p className="mt-1 text-xs text-gray-500">
                        When the coupon expires. Check "No expiration" for coupons that don't expire.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage Restrictions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center border-b pb-2">
                    <Users className="h-5 w-5 mr-2" style={{ color: "#d3ae6e" }} />
                    Usage Restrictions
                  </h3>

                  <div>
                    {/* Usage Limit */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700">
                          Usage Limit
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="unlimited_usage"
                            checked={formData.usage_limit === "0"}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                usage_limit: prev.usage_limit === "0" ? "100" : "0",
                              }))
                            }}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                            style={{ accentColor: "#d3ae6e" }}
                          />
                          <label htmlFor="unlimited_usage" className="ml-2 block text-sm text-gray-700">
                            Unlimited
                          </label>
                        </div>
                      </div>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                        </div>
                        <input
                          type="number"
                          id="usage_limit"
                          name="usage_limit"
                          value={formData.usage_limit}
                          onChange={handleChange}
                          min="0"
                          className="pl-10 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 py-2.5 text-base shadow-sm transition-all duration-200"
                          style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                          placeholder="e.g., 1000"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.usage_limit === "0"
                          ? "This coupon can be used an unlimited number of times"
                          : "Maximum number of times this coupon can be used"}
                      </p>
                    </div>

                    {/* Per User Usage Limit */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="per_user_limit" className="block text-sm font-medium text-gray-700">
                          Per User Limit
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="unlimited_per_user"
                            checked={formData.per_user_limit === "0"}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                per_user_limit: prev.per_user_limit === "0" ? "1" : "0",
                              }))
                            }}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                            style={{ accentColor: "#d3ae6e" }}
                          />
                          <label htmlFor="unlimited_per_user" className="ml-2 block text-sm text-gray-700">
                            Unlimited
                          </label>
                        </div>
                      </div>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                        </div>
                        <input
                          type="number"
                          id="per_user_limit"
                          name="per_user_limit"
                          value={formData.per_user_limit}
                          onChange={handleChange}
                          min="0"
                          className="pl-10 block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 py-2.5 text-base shadow-sm transition-all duration-200"
                          style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
                          placeholder="e.g., 1"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.per_user_limit === "0"
                          ? "Each user can use this coupon an unlimited number of times"
                          : "Maximum number of times a single user can use this coupon"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            {isEdit && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Coupon
              </button>
            )}

            <div className="flex ml-auto">
              <button
                type="button"
                onClick={() => navigate("/coupons")}
                className="mr-3 px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors"
                style={{ ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" } }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="inline-flex justify-center items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{
                  backgroundColor: "#d3ae6e",
                  ":hover": { backgroundColor: "#c09c5c" },
                  ":focus": { ringColor: "rgba(211, 174, 110, 0.3)" },
                }}
              >
                {loading || isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? "Update Coupon" : "Create Coupon"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl animate-fadeIn">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Delete Coupon</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this coupon? This action can be undone by a Super Admin.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex justify-center items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl animate-fadeIn">
            <div className="flex items-center mb-4 text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Success!</h3>
            </div>
            <p className="text-gray-700 mb-6">{success}</p>
          </div>
        </div>
      )}

      {/* Form Error Message */}
      {formError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm animate-fadeIn fixed bottom-4 right-4 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{formError}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CouponForm
