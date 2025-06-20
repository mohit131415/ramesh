"use client"

import { useState } from "react"
import { X, AlertCircle, CheckCircle, IndianRupee } from "lucide-react"

const PaymentReceivedModal = ({ isOpen, onClose, order, onMarkPaymentReceived }) => {
  const [amountReceived, setAmountReceived] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen || !order) return null

  const expectedAmount = order.pricing.final_total

  const handleSubmit = async (e) => {
    e.preventDefault()

    const amount = Number.parseFloat(amountReceived)
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onMarkPaymentReceived(order.basic.id, {
        amount_received: amount,
        notes: notes.trim() || undefined,
      })
      onClose()
      setAmountReceived("")
      setNotes("")
    } catch (err) {
      setError(err.message || "Failed to mark payment as received")
    } finally {
      setLoading(false)
    }
  }

  const handleSetFullAmount = () => {
    setAmountReceived(expectedAmount.toString())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mark Payment Received</h3>
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

          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Confirm that the COD payment has been collected from the customer.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Details</label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-900">Order: {order.basic.number}</p>
              <p className="text-sm text-gray-600">Customer: {order.customer.name}</p>
              <p className="text-sm text-gray-600">Payment Method: {order.payment.method_label}</p>
              <p className="text-sm text-gray-900 font-medium">Expected Amount: ₹{expectedAmount}/-</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received *</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={handleSetFullAmount}
                className="text-sm text-ramesh-gold hover:text-ramesh-gold/80"
              >
                Set full amount (₹{expectedAmount}/-)
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
              placeholder="Add any notes about the payment collection..."
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
              disabled={loading || !amountReceived}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Confirming..." : "Confirm Payment Received"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentReceivedModal
