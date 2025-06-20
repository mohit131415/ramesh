"use client"

import { useState } from "react"
import { X, AlertCircle, IndianRupee } from "lucide-react"

const RefundModal = ({ isOpen, onClose, order, onRefund }) => {
  const [refundAmount, setRefundAmount] = useState("")
  const [reason, setReason] = useState("")
  const [refundMethod, setRefundMethod] = useState("original")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen || !order) return null

  const refundReasons = [
    "Customer requested refund",
    "Product defective/damaged",
    "Wrong product delivered",
    "Delivery failed",
    "Order cancelled by admin",
    "Payment dispute",
    "Other",
  ]

  const refundMethods = [
    { value: "original", label: "Original Payment Method" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "wallet", label: "Wallet Credit" },
  ]

  const maxRefundAmount = order.pricing.final_total - (order.payment.refund_amount || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const amount = Number.parseFloat(refundAmount)
    if (!amount || amount <= 0) {
      setError("Please enter a valid refund amount")
      return
    }

    if (amount > maxRefundAmount) {
      setError(`Refund amount cannot exceed ₹${maxRefundAmount}/-`)
      return
    }

    if (!reason) {
      setError("Please select a refund reason")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onRefund(order.basic.id, {
        refund_amount: amount,
        reason,
        refund_method: refundMethod,
        notes: notes.trim() || undefined,
      })
      onClose()
      setRefundAmount("")
      setReason("")
      setRefundMethod("original")
      setNotes("")
    } catch (err) {
      setError(err.message || "Failed to process refund")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4" style={{ height: "70vh" }}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Process Refund</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 h-[calc(70vh-120px)]">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <div className="ml-2">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-3 bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Order</p>
              <p className="text-sm font-medium">{order.basic.number}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Customer</p>
              <p className="text-sm font-medium">{order.customer?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Payment Method</p>
              <p className="text-sm font-medium">{order.payment.method_label}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Amount</p>
              <p className="text-sm font-medium">₹{order.pricing.final_total}/-</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Already Refunded</p>
              <p className="text-sm font-medium text-red-600">
                {order.payment.refund_amount > 0 ? `₹${order.payment.refund_amount}/-` : "₹0/-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Available for Refund</p>
              <p className="text-sm font-medium text-green-600">₹{maxRefundAmount}/-</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount *</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                  placeholder="0.00"
                  min="0.01"
                  max={maxRefundAmount}
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method *</label>
              <select
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                required
              >
                {refundMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refund Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                required
              >
                <option value="">Select a reason</option>
                {refundReasons.map((reasonOption) => (
                  <option key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
              placeholder="Add any additional notes about the refund..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
          </div>

          <div className="flex justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !refundAmount || !reason}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Process Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RefundModal
