"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle, ArrowRight } from "lucide-react"

const StatusUpdateModal = ({ isOpen, onClose, order, onUpdate }) => {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [nextStatus, setNextStatus] = useState(null)

  useEffect(() => {
    if (isOpen && order) {
      const next = getNextStatus()
      setNextStatus(next)
      setNotes("")
      setError("")
    }
  }, [isOpen, order])

  if (!isOpen || !order) return null

  const getNextStatus = () => {
    const currentStatus = order.basic.status.code
    const statusFlow = {
      placed: { value: "preparing", label: "Preparing" },
      preparing: { value: "prepared", label: "Prepared" },
      prepared: { value: "shipped", label: "Shipped" },
      shipped: { value: "delivered", label: "Delivered" },
    }
    return statusFlow[currentStatus] || null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nextStatus) {
      setError("No next status available")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onUpdate(order.basic.id, {
        status: nextStatus.value,
        notes: notes.trim() || undefined,
      })
      onClose()
      setNotes("")
    } catch (err) {
      setError(err.message || "Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  if (!nextStatus) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">This order has reached its final status and cannot be updated further.</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-ramesh-gold rounded-lg hover:bg-ramesh-gold/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-900">{order.basic.status.label}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Next Status</label>
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <span className="text-gray-600">{order.basic.status.label}</span>
                <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                <span className="text-blue-700 font-medium">{nextStatus.label}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
              placeholder="Add any notes about this status change..."
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
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-ramesh-gold rounded-lg hover:bg-ramesh-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : `Update to ${nextStatus.label}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StatusUpdateModal
