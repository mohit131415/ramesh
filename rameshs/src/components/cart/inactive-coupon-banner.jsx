"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import useCartStore from "../../store/cartStore"
import { useToast } from "../ui/use-toast"

const InactiveCouponBanner = () => {
  const { inactiveCoupon, removeInactiveCoupon } = useCartStore()
  const [isRemoving, setIsRemoving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  if (!inactiveCoupon) return null

  const handleRemoveCoupon = async () => {
    setIsRemoving(true)
    try {
      const result = await removeInactiveCoupon()
      if (result.success) {
        toast({
          title: "Coupon Removed",
          description: "The inactive coupon has been removed from your cart.",
          variant: "default",
        })
        setShowConfirmDialog(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove coupon",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove coupon",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-amber-800 mb-1">Inactive Coupon: {inactiveCoupon.code}</h4>
            <p className="text-sm text-amber-700 mb-2">
              {inactiveCoupon.inactive_reason || "This coupon is no longer active and cannot be applied to your order."}
            </p>
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isRemoving}
              className="text-sm text-amber-800 hover:text-amber-900 font-medium underline disabled:opacity-50"
            >
              {isRemoving ? "Removing..." : "Remove Coupon"}
            </button>
          </div>
          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isRemoving}
            className="text-amber-600 hover:text-amber-800 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Remove Inactive Coupon</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to remove the coupon "{inactiveCoupon.code}" from your cart? This coupon is inactive
              and cannot be applied to your order.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isRemoving}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveCoupon}
                disabled={isRemoving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isRemoving ? "Removing..." : "Remove Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InactiveCouponBanner
