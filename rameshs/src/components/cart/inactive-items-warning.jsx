"use client"
import { AlertTriangle, Trash2 } from "lucide-react"
import useCartStore from "../../store/cartStore"

const InactiveItemsWarning = () => {
  const { inactive_items, invalid_items, removeCartItem } = useCartStore()

  const allInactiveItems = [...(inactive_items || []), ...(invalid_items || [])]

  if (allInactiveItems.length === 0) return null

  const handleRemoveItem = async (item) => {
    const itemId = item.id || `${item.product_id}_${item.variant_id}`
    await removeCartItem(itemId)
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 mb-1">Items Requiring Attention</h4>
          <p className="text-sm text-red-700 mb-3">
            The following items cannot be included in your order and must be removed before checkout:
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {allInactiveItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-200">
            <img
              src={item.image || "/placeholder.svg?height=50&width=50"}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
              <p className="text-xs text-gray-600">
                Quantity: {item.quantity} • {item.variant_name || "Default"}
              </p>
              <p className="text-xs text-red-600 mt-1">{item.reason || "Item is no longer available"}</p>
            </div>
            <button
              onClick={() => handleRemoveItem(item)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InactiveItemsWarning
