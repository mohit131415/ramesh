"use client"

import { useState } from "react"
import { X, AlertCircle, AlertTriangle } from "lucide-react"

const ReturnModal = ({ isOpen, onClose, order, onMarkReturn }) => {
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen || !order) return null

  const returnReasons = [
    "Product defective/damaged",
    "Wrong product delivered",
    "Product not as described",
    "Customer not satisfied",
    "Quality issues",
    "Size/fit issues",
    "Customer changed mind",
    "Other",
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) {
      setError("Please select a return reason")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onMarkReturn(order.basic.id, {
        reason,
        notes: notes.trim() || undefined,
      })
      onClose()
      setReason("")
      setNotes("")
    } catch (err) {
      setError(err.message || "Failed to mark order as returned")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mark Order as Returned</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  This will mark the order as returned. The customer may be eligible for a refund based on your return
                  policy.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Details</label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-900">Order: {order.basic.number}</p>
              <p className="text-sm text-gray-600">Customer: {order.customer.name}</p>
              <p className="text-sm text-gray-600">Amount: ₹{order.pricing.final_total}/-</p>
              <p className="text-sm text-gray-600">Payment: {order.payment.method_label}</p>
              <p className="text-sm text-gray-600">Delivered: {order.shipping.delivery.actual_date || "Recently"}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
              required
            >
              <option value="">Select a reason</option>
              {returnReasons.map((reasonOption) => (
                <option key={reasonOption} value={reasonOption}>
                  {reasonOption}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
              placeholder="Add any additional notes about the return..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Mark as Returned"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReturnModal
