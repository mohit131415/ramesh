"use client"

import { useState } from "react"
import { X, AlertCircle, Calendar } from "lucide-react"

const ShippingModal = ({ isOpen, onClose, order, onUpdateShipping }) => {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingUrl, setTrackingUrl] = useState("")
  const [courierPartner, setCourierPartner] = useState("")
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen || !order) return null

  const courierPartners = [
    "Blue Dart",
    "DTDC",
    "FedEx",
    "Delhivery",
    "Ecom Express",
    "India Post",
    "Professional Couriers",
    "Gati",
    "Other",
  ]

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number")
      return
    }

    if (!courierPartner) {
      setError("Please select a courier partner")
      return
    }

    if (!estimatedDeliveryDate) {
      setError("Please select an estimated delivery date")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onUpdateShipping(order.basic.id, {
        tracking_number: trackingNumber.trim(),
        tracking_url: trackingUrl.trim() || undefined,
        courier_partner: courierPartner,
        estimated_delivery_date: estimatedDeliveryDate,
        notes: notes.trim() || undefined,
      })
      onClose()
      setTrackingNumber("")
      setTrackingUrl("")
      setCourierPartner("")
      setEstimatedDeliveryDate("")
      setNotes("")
    } catch (err) {
      setError(err.message || "Failed to update shipping details")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" style={{ height: "70vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Add Shipping Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex flex-col" style={{ height: "calc(70vh - 140px)" }}>
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                  <div className="ml-2">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Information - Compact */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Order Information</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order:</span>
                  <span className="ml-1 font-medium text-gray-900">{order.basic.number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <span className="ml-1 font-medium text-gray-900">{order.customer.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {order.shipping.address.city}, {order.shipping.address.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields - Optimized Layout */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {/* Row 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                  placeholder="Enter tracking number"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courier Partner <span className="text-red-500">*</span>
                </label>
                <select
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                  required
                >
                  <option value="">Select courier partner</option>
                  {courierPartners.map((partner) => (
                    <option key={partner} value={partner}>
                      {partner}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                    min={getTomorrowDate()}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking URL <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                  placeholder="https://track.courier.com/..."
                />
              </div>

              {/* Row 3 - Full Width */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Notes <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent resize-none"
                  placeholder="Add any shipping notes or special instructions..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !trackingNumber || !courierPartner || !estimatedDeliveryDate}
              className="px-5 py-2 text-sm font-medium text-white bg-ramesh-gold rounded-lg hover:bg-ramesh-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Updating..." : "Ship Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingModal
