"use client"

import { useState, useEffect } from "react"
import { MapPin, Home, Building, X, Phone } from "lucide-react"

// List of Indian states for dropdown
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]

const AddressModal = ({ isOpen, onClose, editingAddress = null, onSave, isLoading = false, title = null }) => {
  const [formData, setFormData] = useState({
    address_type: "home",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    contact_name: "",
    contact_phone: "",
    is_default: false,
  })
  const [errors, setErrors] = useState({})
  const [stateSearch, setStateSearch] = useState("")
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false)

  // Filter states based on search
  const filteredStates = INDIAN_STATES.filter((state) => state.toLowerCase().includes(stateSearch.toLowerCase()))

  // Determine modal title
  const modalTitle = title || (editingAddress ? "Edit Address" : "Add New Address")

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        address_type: editingAddress.address_type || "home",
        address_line1: editingAddress.address_line1 || "",
        address_line2: editingAddress.address_line2 || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        postal_code: editingAddress.postal_code || "",
        contact_name: editingAddress.contact_name || "",
        contact_phone: editingAddress.contact_phone || "",
        is_default: editingAddress.is_default || false,
      })
      setStateSearch(editingAddress.state || "")
    } else {
      setFormData({
        address_type: "home",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        contact_name: "",
        contact_phone: "",
        is_default: false,
      })
      setStateSearch("")
    }
    setErrors({})
    setIsStateDropdownOpen(false)
  }, [editingAddress, isOpen])

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isStateDropdownOpen && !event.target.closest(".state-dropdown-container")) {
        setIsStateDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isStateDropdownOpen])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleStateSelect = (state) => {
    setFormData((prev) => ({ ...prev, state }))
    setStateSearch(state)
    setIsStateDropdownOpen(false)
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: "" }))
    }
  }

  const handleStateSearchChange = (value) => {
    setStateSearch(value)
    setFormData((prev) => ({ ...prev, state: value }))
    setIsStateDropdownOpen(true)
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.address_line1.trim()) newErrors.address_line1 = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.postal_code.trim()) newErrors.postal_code = "Postal code is required"

    // Contact name is now required
    if (!formData.contact_name.trim()) newErrors.contact_name = "Contact name is required"

    // Contact phone is now required
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = "Contact phone is required"
    } else if (!/^[6-9]\d{9}$/.test(formData.contact_phone.replace(/\D/g, ""))) {
      newErrors.contact_phone = "Please enter a valid 10-digit phone number"
    }

    // Postal code validation
    if (formData.postal_code && !/^\d{6}$/.test(formData.postal_code)) {
      newErrors.postal_code = "Please enter a valid 6-digit postal code"
    }

    // State validation - must be from the list
    if (formData.state && !INDIAN_STATES.includes(formData.state)) {
      newErrors.state = "Please select a valid state from the list"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return
    onSave(formData)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">{modalTitle}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={isLoading}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Address Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "home", icon: Home, label: "Home" },
                { value: "work", icon: Building, label: "Work" },
                { value: "other", icon: MapPin, label: "Other" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleInputChange("address_type", value)}
                  disabled={isLoading}
                  className={`flex items-center justify-center p-3 border rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.address_type === value
                      ? "border-[#d3ae6e] bg-[#d3ae6e]/10 text-[#d3ae6e]"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address_line1}
              onChange={(e) => handleInputChange("address_line1", e.target.value)}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.address_line1 ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="House/Flat number, Building name, Street"
            />
            {errors.address_line1 && <p className="mt-1 text-sm text-red-600">{errors.address_line1}</p>}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={formData.address_line2}
              onChange={(e) => handleInputChange("address_line2", e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Landmark, Area, Neighborhood"
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.city ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="City"
              />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            <div className="relative state-dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={stateSearch}
                onChange={(e) => handleStateSearchChange(e.target.value)}
                onFocus={() => !isLoading && setIsStateDropdownOpen(true)}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.state ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Search and select state"
                autoComplete="off"
              />
              {isStateDropdownOpen && !isLoading && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredStates.length > 0 ? (
                    filteredStates.map((state) => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => handleStateSelect(state)}
                        className="w-full text-left px-3 py-2 hover:bg-[#d3ae6e]/10 hover:text-[#d3ae6e] transition-colors"
                      >
                        {state}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500 text-sm">No states found</div>
                  )}
                </div>
              )}
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleInputChange("postal_code", e.target.value)}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.postal_code ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="6-digit PIN"
                maxLength={6}
              />
              {errors.postal_code && <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => handleInputChange("contact_name", e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.contact_phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="10-digit mobile"
                  maxLength={10}
                />
                {formData.contact_phone && (
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
              </div>
              {errors.contact_phone && <p className="mt-1 text-sm text-red-600">{errors.contact_phone}</p>}
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => handleInputChange("is_default", e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-[#d3ae6e] focus:ring-[#d3ae6e] border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
              Set as default delivery address
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#d3ae6e] border border-transparent rounded-lg hover:bg-[#d3ae6e]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
            {editingAddress ? "Update Address" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddressModal
