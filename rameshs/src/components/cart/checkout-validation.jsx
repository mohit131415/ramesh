import { AlertTriangle, ShoppingCart } from "lucide-react"
import useCartStore from "../../store/cartStore"

const CheckoutValidation = ({ children }) => {
  const { canProceedToCheckout, getCheckoutBlockingReason, items, inactive_items, invalid_items } = useCartStore()

  const canCheckout = canProceedToCheckout()
  const blockingReason = getCheckoutBlockingReason()

  if (canCheckout) {
    return children
  }

  return (
    <div className="space-y-4">
      {/* Checkout blocked message */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">Cannot Proceed to Checkout</h3>
            <p className="text-sm text-red-700">{blockingReason}</p>
          </div>
        </div>
      </div>

      {/* Disabled checkout button */}
      <div className="relative">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="text-center">
            <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">Checkout Unavailable</p>
            <p className="text-xs text-gray-500">Please resolve cart issues above</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutValidation
