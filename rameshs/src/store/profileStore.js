import { create } from "zustand"
import { persist } from "zustand/middleware"

const useProfileStore = create(
  persist(
    (set, get) => ({
      // Profile state
      profile: null,
      completeness: null,
      addresses: [],
      defaultAddress: null,
      addressLimits: null,
      orders: [],
      isLoading: false,
      error: null,

      // Profile completion tracking - Don't persist these for fresh checks
      hasShownCompletionModal: false,
      hasSkippedCompletion: false,

      // Actions
      setProfile: (profile) => set({ profile, error: null }),

      setCompleteness: (completeness) => set({ completeness, error: null }),

      setAddresses: (addresses) => set({ addresses, error: null }),

      setDefaultAddress: (defaultAddress) => set({ defaultAddress, error: null }),

      setAddressLimits: (addressLimits) => set({ addressLimits, error: null }),

      setOrders: (orders) => set({ orders, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      // Profile completion modal tracking
      setHasShownCompletionModal: (shown) => set({ hasShownCompletionModal: shown }),

      setHasSkippedCompletion: (skipped) => set({ hasSkippedCompletion: skipped }),

      // Address management
      addAddress: (address) =>
        set((state) => ({
          addresses: [...state.addresses, address],
          // If this is the first address or marked as default, update default
          defaultAddress: address.is_default || state.addresses.length === 0 ? address : state.defaultAddress,
          error: null,
        })),

      updateAddress: (addressId, updatedAddress) =>
        set((state) => ({
          addresses: state.addresses.map((addr) =>
            addr.id === addressId
              ? { ...addr, ...updatedAddress }
              : // If the updated address is now default, unset others
                updatedAddress.is_default
                ? { ...addr, is_default: false }
                : addr,
          ),
          // Update default address if this one is now default
          defaultAddress: updatedAddress.is_default
            ? { ...state.addresses.find((a) => a.id === addressId), ...updatedAddress }
            : state.defaultAddress?.id === addressId
              ? { ...state.defaultAddress, ...updatedAddress }
              : state.defaultAddress,
          error: null,
        })),

      removeAddress: (addressId) =>
        set((state) => ({
          addresses: state.addresses.filter((addr) => addr.id !== addressId),
          // Clear default if it was the deleted address
          defaultAddress: state.defaultAddress?.id === addressId ? null : state.defaultAddress,
          error: null,
        })),

      // Clear all data (on logout)
      clearProfileData: () =>
        set({
          profile: null,
          completeness: null,
          addresses: [],
          defaultAddress: null,
          addressLimits: null,
          orders: [],
          error: null,
          hasShownCompletionModal: false,
          hasSkippedCompletion: false,
        }),

      // Utility functions
      getProfileCompletionPercentage: () => {
        const { completeness } = get()
        return completeness?.completion_percentage || 0
      },

      isProfileComplete: () => {
        const { completeness } = get()
        return completeness?.is_complete || false
      },

      getMissingFields: () => {
        const { completeness } = get()
        return completeness?.missing_fields || []
      },

      getCompletedFields: () => {
        const { completeness } = get()
        return completeness?.completed_fields || []
      },

      profileExists: () => {
        const { completeness } = get()
        return completeness?.exists || false
      },

      shouldShowCompletionModal: () => {
        const { completeness, hasShownCompletionModal, hasSkippedCompletion } = get()

        if (!completeness || hasShownCompletionModal || hasSkippedCompletion) {
          return false
        }

        const { completion_percentage } = completeness

        // Show modal if profile completion is less than 80%
        return completion_percentage < 80
      },

      // Profile field validation helpers
      validateProfileField: (field, value) => {
        const errors = []

        switch (field) {
          case "first_name":
          case "last_name":
            if (value && value.length > 100) {
              errors.push(`${field.replace("_", " ")} must be less than 100 characters`)
            }
            if (value && !/^[a-zA-Z\s]+$/.test(value)) {
              errors.push(`${field.replace("_", " ")} can only contain letters and spaces`)
            }
            break

          case "email":
            if (value && value.length > 255) {
              errors.push("Email must be less than 255 characters")
            }
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push("Please enter a valid email address")
            }
            break

          case "gender":
            if (value && !["male", "female", "other", "prefer_not_to_say"].includes(value)) {
              errors.push("Please select a valid gender option")
            }
            break

          case "date_of_birth":
            if (value) {
              const birthDate = new Date(value)
              const today = new Date()
              const minDate = new Date("1900-01-01")
              const minAge = new Date()
              minAge.setFullYear(minAge.getFullYear() - 13)

              if (birthDate > today) {
                errors.push("Date of birth cannot be in the future")
              } else if (birthDate < minDate) {
                errors.push("Please enter a valid date of birth")
              } else if (birthDate > minAge) {
                errors.push("You must be at least 13 years old")
              }
            }
            break

          default:
            break
        }

        return errors
      },

      // Validate profile for CREATE operation (required fields)
      validateProfileForCreate: (profileData) => {
        const allErrors = {}

        // Required fields for CREATE according to API docs
        const requiredFields = ["first_name", "last_name", "email"]

        requiredFields.forEach((field) => {
          if (!profileData[field] || !profileData[field].trim()) {
            allErrors[field] = `${field.replace("_", " ")} is required`
          }
        })

        // Validate all fields (including optional ones if provided)
        Object.keys(profileData).forEach((field) => {
          if (profileData[field] && profileData[field].trim) {
            const fieldErrors = get().validateProfileField(field, profileData[field])
            if (fieldErrors.length > 0) {
              allErrors[field] = fieldErrors[0] // Take first error
            }
          }
        })

        return allErrors
      },

      // Validate profile for UPDATE operation (all fields optional, but at least one required)
      validateProfileForUpdate: (profileData) => {
        const allErrors = {}

        // Check if at least one valid field is provided
        const validFields = ["first_name", "last_name", "email", "gender", "date_of_birth"]
        const hasValidField = validFields.some(
          (field) => profileData[field] && profileData[field].trim && profileData[field].trim(),
        )

        if (!hasValidField && !profileData.profile_picture) {
          allErrors.general = "At least one field must be provided for update"
          return allErrors
        }

        // Validate provided fields
        Object.keys(profileData).forEach((field) => {
          if (profileData[field] && profileData[field].trim && profileData[field].trim()) {
            const fieldErrors = get().validateProfileField(field, profileData[field])
            if (fieldErrors.length > 0) {
              allErrors[field] = fieldErrors[0] // Take first error
            }
          }
        })

        return allErrors
      },

      // Validate profile for SAVE operation (upsert)
      validateProfileForSave: (profileData, isNewProfile = false) => {
        if (isNewProfile) {
          return get().validateProfileForCreate(profileData)
        } else {
          return get().validateProfileForUpdate(profileData)
        }
      },

      // Generic validation (for backward compatibility)
      validateProfile: (profileData, isCreate = false) => {
        if (isCreate) {
          return get().validateProfileForCreate(profileData)
        } else {
          return get().validateProfileForUpdate(profileData)
        }
      },

      // Address utility functions
      getAddressById: (addressId) => {
        const { addresses } = get()
        return addresses.find((addr) => addr.id === addressId)
      },

      getDefaultAddress: () => {
        const { addresses, defaultAddress } = get()
        return defaultAddress || addresses.find((addr) => addr.is_default)
      },

      canAddMoreAddresses: () => {
        const { addresses, addressLimits } = get()
        if (!addressLimits) return true
        return addressLimits.can_add_more || addresses.length < addressLimits.max_addresses
      },

      getAddressCount: () => {
        const { addresses, addressLimits } = get()
        return addressLimits?.current_count || addresses.length
      },

      getMaxAddressLimit: () => {
        const { addressLimits } = get()
        return addressLimits?.max_addresses || 5
      },

      getRemainingSlots: () => {
        const { addressLimits } = get()
        return addressLimits?.remaining_slots || 0
      },
    }),
    {
      name: "ramesh-sweets-profile-store",
      partialize: (state) => ({
        // Only persist profile data, NOT the modal flags
        profile: state.profile,
        addresses: state.addresses,
        // Removed hasShownCompletionModal and hasSkippedCompletion from persistence
      }),
    },
  ),
)

export default useProfileStore
