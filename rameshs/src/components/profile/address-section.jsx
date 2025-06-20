"use client"

import { useState } from "react"
import { MapPin, Plus, Edit3, Trash2, Home, Building, Shield, Phone, Star } from "lucide-react"
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useAddressLimits,
  useDefaultAddress,
  useSetDefaultAddress,
} from "../../hooks/useProfile"
import LoadingSpinner from "../common/loading-spinner"
import AddressModal from "../common/address-modal"

const AddressSection = () => {
  const { data: addressesData, isLoading } = useAddresses()
  const { data: addressLimits } = useAddressLimits()
  const { data: defaultAddress } = useDefaultAddress()
  const createAddressMutation = useCreateAddress()
  const updateAddressMutation = useUpdateAddress()
  const deleteAddressMutation = useDeleteAddress()
  const setDefaultAddressMutation = useSetDefaultAddress()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  // Extract addresses and meta information properly from API response
  const addresses = Array.isArray(addressesData?.data)
    ? addressesData.data
    : Array.isArray(addressesData)
      ? addressesData
      : []
  const addressMeta = addressesData?.meta || {
    total_addresses: addresses.length,
    max_addresses: 6,
    can_add_more: addresses.length < 6,
  }

  const canAddMore = !addressLimits || addressLimits.can_add_more
  const isNearLimit = addressLimits && addressLimits.remaining_slots <= 1 && addressLimits.remaining_slots > 0
  const hasReachedLimit = addressLimits && !addressLimits.can_add_more

  const handleAddNew = () => {
    if (!canAddMore) {
      if (window.showToast) {
        window.showToast({
          title: "Address Limit Reached",
          description: `You can only have ${addressLimits?.max_addresses || 5} addresses. Please delete an existing address first.`,
          type: "error",
        })
      }
      return
    }
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAddress(null)
  }

  const handleSaveAddress = async (formData) => {
    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          addressId: editingAddress.id,
          updates: formData,
        })
      } else {
        await createAddressMutation.mutateAsync(formData)
      }
      handleCloseModal()
    } catch (error) {
      console.error("Error saving address:", error)
    }
  }

  const handleDelete = async (addressId) => {
    // Find the address to check if it's default
    const addressToDelete = addresses.find((addr) => addr.id === addressId)

    if (addressToDelete?.is_default) {
      if (window.showToast) {
        window.showToast({
          title: "Cannot Delete Default Address",
          description: "You cannot delete your default address. Please set another address as default first.",
          type: "error",
        })
      }
      return
    }

    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddressMutation.mutateAsync(addressId)
      } catch (error) {
        console.error("Error deleting address:", error)
      }
    }
  }

  const handleSetDefault = async (addressId) => {
    try {
      await updateAddressMutation.mutateAsync({
        addressId: addressId,
        updates: { is_default: true },
      })
    } catch (error) {
      console.error("Error setting default address:", error)
    }
  }

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return <Home className="h-5 w-5" />
      case "work":
        return <Building className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  const formatAddress = (address) => {
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
    ].filter(Boolean)
    return parts.join(", ")
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-gray-600 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delivery Addresses</h2>
                <p className="text-sm text-gray-600">Manage your saved delivery locations</p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              disabled={!canAddMore}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#d3ae6e] border border-transparent rounded-lg hover:bg-[#d3ae6e]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d3ae6e] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Addresses Added</h3>
              <p className="text-gray-600 mb-6">Add your delivery addresses for faster checkout</p>
              {!isModalOpen && canAddMore && (
                <button
                  onClick={handleAddNew}
                  className="px-6 py-3 text-sm font-medium text-white bg-[#d3ae6e] border border-transparent rounded-lg hover:bg-[#d3ae6e]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d3ae6e]"
                >
                  Add Your First Address
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 ${
                    address.is_default ? "border-[#d3ae6e] bg-[#d3ae6e]/5" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg mr-3 ${
                          address.is_default ? "bg-[#d3ae6e]/10 text-[#d3ae6e]" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getAddressIcon(address.address_type)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900 capitalize">{address.address_type}</h4>
                          {address.is_default && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#d3ae6e]/10 text-[#d3ae6e]">
                              <Shield className="h-3 w-3 mr-1" />
                              Default
                            </span>
                          )}
                        </div>
                        {address.contact_name && <p className="text-sm text-gray-600">{address.contact_name}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 text-sm">{formatAddress(address)}</p>
                    {address.contact_phone && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {address.contact_phone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        disabled={updateAddressMutation.isLoading}
                        className="flex items-center px-3 py-1 text-xs font-medium text-[#d3ae6e] bg-[#d3ae6e]/10 border border-[#d3ae6e]/20 rounded hover:bg-[#d3ae6e]/20 focus:outline-none focus:ring-2 focus:ring-[#d3ae6e] disabled:opacity-50"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      disabled={deleteAddressMutation.isLoading || address.is_default}
                      className={`flex items-center px-3 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        address.is_default
                          ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                          : "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 focus:ring-red-500"
                      }`}
                      title={address.is_default ? "Cannot delete default address" : "Delete address"}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingAddress={editingAddress}
        onSave={handleSaveAddress}
        isLoading={createAddressMutation.isLoading || updateAddressMutation.isLoading}
      />
    </>
  )
}

export default AddressSection
