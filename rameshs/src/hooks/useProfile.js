"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { profileService } from "../services/profile-service"
import useAuthStore from "../store/authStore"
import useProfileStore from "../store/profileStore"

// Profile completeness check - always available
export const useProfileCompleteness = () => {
  const { isAuthenticated, token } = useAuthStore()
  const { setCompleteness, setError } = useProfileStore()

  return useQuery({
    queryKey: ["profile", "completeness"],
    queryFn: async () => {
      try {
        const data = await profileService.checkCompleteness()
        setCompleteness(data)
        setError(null)
        return data
      } catch (error) {
        setError(error.message)
        throw error
      }
    },
    enabled: isAuthenticated && !!token,
    retry: (failureCount, error) => {
      if (error?.message?.includes("401") || error?.message?.includes("Authentication")) {
        return false
      }
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
  })
}

// Get profile data - always try to fetch if authenticated
export const useProfile = () => {
  const { isAuthenticated, token } = useAuthStore()
  const { setProfile, setError } = useProfileStore()

  return useQuery({
    queryKey: ["profile", "data"],
    queryFn: async () => {
      try {
        const data = await profileService.getProfile()
        setProfile(data)
        setError(null)
        return data
      } catch (error) {
        // Don't set error for 404 (profile not found) - this is expected
        if (error.message?.includes("Profile not found")) {
          setProfile(null)
          setError(null)
          return null
        }
        setError(error.message)
        throw error
      }
    },
    enabled: isAuthenticated && !!token,
    retry: (failureCount, error) => {
      if (
        error?.message?.includes("Profile not found") ||
        error?.message?.includes("401") ||
        error?.message?.includes("Authentication")
      ) {
        return false
      }
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })
}

// Combined hook for profile data with completeness info
export const useProfileData = () => {
  const { data: completenessData, isLoading: completenessLoading, error: completenessError } = useProfileCompleteness()
  const { data: profileData, isLoading: profileLoading, error: profileError } = useProfile()

  // Profile exists if we have completion data with fields OR if we successfully fetched profile data
  const exists = !!profileData || completenessData?.completed_fields?.length > 0
  const isLoading = completenessLoading || profileLoading
  const error = completenessError || profileError

  return {
    data: profileData,
    exists,
    completenessData,
    isLoading,
    error,
    isComplete: completenessData?.completion_percentage === 100,
    completionPercentage: completenessData?.completion_percentage || 0,
    missingFields: completenessData?.missing_fields || [],
    completedFields: completenessData?.completed_fields || [],
  }
}

// Create profile mutation
export const useCreateProfile = () => {
  const queryClient = useQueryClient()
  const { setProfile, setError } = useProfileStore()

  return useMutation({
    mutationFn: profileService.createProfile,
    onSuccess: (data) => {
      // Update cache and store
      queryClient.setQueryData(["profile", "data"], data)
      queryClient.invalidateQueries({ queryKey: ["profile", "completeness"] })
      setProfile(data)
      setError(null)

      // Show success toast
      if (window.showToast) {
        window.showToast({
          title: "Profile Created",
          description: "Your profile has been created successfully.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)

      // Specifically handle email already in use error
      if (error.message?.includes("Email is already in use")) {
        if (window.showToast) {
          window.showToast({
            title: "Email Already Registered",
            description: "This email address is already in use. Please use a different email.",
            type: "error",
          })
        }
        return
      }

      // Handle validation errors
      if (error.status === 400 && error.errors) {
        const errorMessages = Object.values(error.errors).flat()
        if (window.showToast) {
          window.showToast({
            title: "Validation Error",
            description: errorMessages.join(", "),
            type: "error",
          })
        }
      } else {
        if (window.showToast) {
          window.showToast({
            title: "Creation Failed",
            description: error.message || "Failed to create profile. Please try again.",
            type: "error",
          })
        }
      }
    },
  })
}

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { setProfile, setError } = useProfileStore()

  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      // Update cache and store
      queryClient.setQueryData(["profile", "data"], data)
      queryClient.invalidateQueries({ queryKey: ["profile", "completeness"] })
      setProfile(data)
      setError(null)

      // Show success toast
      if (window.showToast) {
        window.showToast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)

      // Specifically handle email already in use error
      if (error.message?.includes("Email is already in use")) {
        if (window.showToast) {
          window.showToast({
            title: "Email Already Registered",
            description: "This email address is already in use. Please use a different email.",
            type: "error",
          })
        }
        return
      }

      // Handle validation errors
      if (error.status === 400 && error.errors) {
        const errorMessages = Object.values(error.errors).flat()
        if (window.showToast) {
          window.showToast({
            title: "Validation Error",
            description: errorMessages.join(", "),
            type: "error",
          })
        }
      } else {
        if (window.showToast) {
          window.showToast({
            title: "Update Failed",
            description: error.message || "Failed to update profile. Please try again.",
            type: "error",
          })
        }
      }
    },
  })
}

// Address hooks
export const useAddresses = () => {
  const { isAuthenticated, token } = useAuthStore()
  const { setAddresses, setError } = useProfileStore()

  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      try {
        const response = await profileService.getAddresses()
        // Extract addresses from the response data
        const addresses = response.data || []
        setAddresses(addresses)
        setError(null)
        // Return the full response including meta
        return response
      } catch (error) {
        setError(error.message)
        return { data: [], meta: { total_addresses: 0, max_addresses: 5, can_add_more: true } }
      }
    },
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export const useAddressById = (addressId) => {
  const { isAuthenticated, token } = useAuthStore()

  return useQuery({
    queryKey: ["addresses", addressId],
    queryFn: () => profileService.getAddressById(addressId),
    enabled: isAuthenticated && !!token && !!addressId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export const useDefaultAddress = () => {
  const { isAuthenticated, token } = useAuthStore()
  const { setDefaultAddress, setError } = useProfileStore()

  return useQuery({
    queryKey: ["addresses", "default"],
    queryFn: async () => {
      try {
        const data = await profileService.getDefaultAddress()
        setDefaultAddress(data)
        setError(null)
        return data
      } catch (error) {
        if (error.message.includes("No default address found")) {
          setDefaultAddress(null)
          setError(null)
          return null
        }
        setError(error.message)
        throw error
      }
    },
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.message?.includes("No default address found")) {
        return false
      }
      return failureCount < 2
    },
  })
}

export const useAddressLimits = () => {
  const { isAuthenticated, token } = useAuthStore()
  const { setAddressLimits, setError } = useProfileStore()

  return useQuery({
    queryKey: ["addresses", "limits"],
    queryFn: async () => {
      try {
        const data = await profileService.getAddressLimits()
        setAddressLimits(data)
        setError(null)
        return data
      } catch (error) {
        setError(error.message)
        throw error
      }
    },
    enabled: isAuthenticated && !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes - limits don't change often
    refetchOnWindowFocus: false,
  })
}

// Enhanced create address mutation with profile completion check
export const useCreateAddress = () => {
  const queryClient = useQueryClient()
  const { addAddress, setError } = useProfileStore()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (addressData) => {
      try {
        // Step 1: Check profile completion status first
        const completionData = await profileService.checkCompleteness()

        // Step 2: If completion_percentage is 0, user has no profile - create one
        if (completionData.completion_percentage === 0) {
          // Extract name from contact_name in address data
          const contactName = addressData.contact_name || user?.name || "User"
          const nameParts = contactName.split(" ")
          const firstName = nameParts[0] || "User"
          const lastName = nameParts.slice(1).join(" ") || ""

          // Create a basic profile with contact data from address
          const basicProfileData = {
            first_name: firstName,
            last_name: lastName,
            email: user?.email || "",
            phone: addressData.contact_phone || user?.phone || "",
          }

          try {
            await profileService.createProfile(basicProfileData)

            // Invalidate profile queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["profile"] })

            // Show profile creation notification
            if (window.showToast) {
              window.showToast({
                title: "Profile Created",
                description: `Profile created for ${firstName} using contact information.`,
                type: "success",
              })
            }
          } catch (profileError) {
            throw new Error(`Failed to create profile: ${profileError.message}`)
          }
        } else {
        }

        // Step 3: Now create the address
        const newAddress = await profileService.createAddress(addressData)

        return newAddress
      } catch (error) {
        throw error
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      queryClient.invalidateQueries({ queryKey: ["addresses", "default"] })
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      addAddress(data)
      setError(null)

      if (window.showToast) {
        window.showToast({
          title: "Address Added",
          description: "Your address has been added successfully.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)

      if (error.status === 400 && error.errors) {
        const errorMessages = Object.values(error.errors).flat()
        if (window.showToast) {
          window.showToast({
            title: "Validation Error",
            description: errorMessages.join(", "),
            type: "error",
          })
        }
      } else {
        if (window.showToast) {
          window.showToast({
            title: "Failed to Add Address",
            description: error.message || "Failed to add address. Please try again.",
            type: "error",
          })
        }
      }
    },
  })
}

export const useUpdateAddress = () => {
  const queryClient = useQueryClient()
  const { updateAddress, setError } = useProfileStore()

  return useMutation({
    mutationFn: ({ addressId, updates }) => profileService.updateAddress(addressId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      queryClient.invalidateQueries({ queryKey: ["addresses", "default"] })
      queryClient.invalidateQueries({ queryKey: ["addresses", variables.addressId] })
      updateAddress(variables.addressId, data)
      setError(null)

      if (window.showToast) {
        window.showToast({
          title: "Address Updated",
          description: "Your address has been updated successfully.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)

      if (error.status === 400 && error.errors) {
        const errorMessages = Object.values(error.errors).flat()
        if (window.showToast) {
          window.showToast({
            title: "Validation Error",
            description: errorMessages.join(", "),
            type: "error",
          })
        }
      } else {
        if (window.showToast) {
          window.showToast({
            title: "Update Failed",
            description: error.message || "Failed to update address. Please try again.",
            type: "error",
          })
        }
      }
    },
  })
}

export const useDeleteAddress = () => {
  const queryClient = useQueryClient()
  const { removeAddress, setError } = useProfileStore()

  return useMutation({
    mutationFn: profileService.deleteAddress,
    onSuccess: (_, addressId) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      queryClient.invalidateQueries({ queryKey: ["addresses", "default"] })
      queryClient.removeQueries({ queryKey: ["addresses", addressId] })
      removeAddress(addressId)
      setError(null)

      if (window.showToast) {
        window.showToast({
          title: "Address Deleted",
          description: "Your address has been deleted successfully.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)
      if (window.showToast) {
        window.showToast({
          title: "Delete Failed",
          description: error.message || "Failed to delete address. Please try again.",
          type: "error",
        })
      }
    },
  })
}

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient()
  const { setDefaultAddress, setError } = useProfileStore()

  return useMutation({
    mutationFn: profileService.setDefaultAddress,
    onSuccess: (data, addressId) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      queryClient.invalidateQueries({ queryKey: ["addresses", "default"] })
      setDefaultAddress(data)
      setError(null)

      if (window.showToast) {
        window.showToast({
          title: "Default Address Updated",
          description: "Your default address has been updated successfully.",
          type: "success",
        })
      }
    },
    onError: (error) => {
      setError(error.message)
      if (window.showToast) {
        window.showToast({
          title: "Update Failed",
          description: error.message || "Failed to set default address. Please try again.",
          type: "error",
        })
      }
    },
  })
}

// Order history hooks
export const useOrderHistory = (page = 1, limit = 10) => {
  const { isAuthenticated, token } = useAuthStore()
  const { setOrders, setError } = useProfileStore()

  return useQuery({
    queryKey: ["orders", "history", page, limit],
    queryFn: async () => {
      try {
        const data = await profileService.getOrderHistory(page, limit)
        setOrders(data.orders || [])
        setError(null)
        return data
      } catch (error) {
        setError(error.message)
        return { orders: [], pagination: { total: 0, page, limit, total_pages: 1 } }
      }
    },
    enabled: isAuthenticated && !!token,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
