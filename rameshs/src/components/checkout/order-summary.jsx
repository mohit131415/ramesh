"use client"
import { Tag, MapPin, Phone } from "lucide-react"
import useCartStore from "../../store/cartStore"

export default function OrderSummary({ checkoutData = null, className = "", showTitle = true }) {
  const { totals: cartTotals } = useCartStore()

  // Format price helper
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0.00"
    const numPrice = typeof price === "number" ? price : Number.parseFloat(price) || 0
    return numPrice.toFixed(2)
  }

  // If no checkout data is available, show cart summary
  if (!checkoutData) {
    const subtotal = cartTotals?.subtotal || 0
    const totalItems = cartTotals?.item_count || 0
    const totalQuantity = cartTotals?.total_quantity || 0

    return (
      <div className={`bg-white rounded-lg border border-gold/20 shadow-sm overflow-hidden ${className}`}>
        <div className="h-1 w-full bg-gradient-to-r from-gold/30 via-pink/30 to-gold/30"></div>
        <div className="p-4 border-b border-gold/10">
          <h2 className="text-xl font-medium text-amber-900">Cart Summary</h2>
          <p className="text-sm text-gray-600 mt-1">
            {totalItems} {totalItems === 1 ? "item" : "items"} • {totalQuantity} total quantity
          </p>
        </div>
        <div className="p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-800">₹{formatPrice(subtotal)}</span>
          </div>
          <div className="pt-3 border-t border-dashed border-gold/20 mt-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-800">Estimated Total</span>
              <span className="font-bold text-amber-900 text-lg">₹{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Final price will be calculated at checkout</p>
          </div>
        </div>
      </div>
    )
  }

  // Extract data from the new response format
  const {
    final_amount_to_pay,
    bill_breakdown,
    items = [],
    address,
    shipping,
    payment,
    coupon,
    tax_details,
    store,
  } = checkoutData

  const hasCouponApplied = !!bill_breakdown?.coupon_discount?.applied

  return (
    <div className={`bg-white rounded-lg border border-gold/20 shadow-sm overflow-hidden ${className}`}>
      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-gold/30 via-pink/30 to-gold/30"></div>

      {showTitle && (
        <div className="p-4 border-b border-gold/10">
          <h2 className="text-xl font-medium text-amber-900">Order Summary</h2>
          <p className="text-sm text-gray-600 mt-1">
            {bill_breakdown?.summary?.item_count || 0} {bill_breakdown?.summary?.item_count === 1 ? "item" : "items"} •{" "}
            {bill_breakdown?.summary?.total_quantity || 0} total quantity
          </p>
        </div>
      )}

      {/* Order summary content */}
      <div className="p-4 space-y-4">
        {/* Decorative divider */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-px bg-gold/20 flex-grow"></div>
          <div className="w-2 h-2 rounded-full bg-gold/30"></div>
          <div className="h-px bg-gold/20 flex-grow"></div>
        </div>

        {/* Bill breakdown */}
        <div className="space-y-3">
          {/* Cart Value (Original Amount) */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {bill_breakdown?.cart_value?.description?.replace(" (MRP)", "") || "Cart Total"}
            </span>
            <span className="font-medium text-gray-800">
              ₹{formatPrice(bill_breakdown?.cart_value?.original_amount || 0)}
            </span>
          </div>

          {/* Product Discounts */}
          {bill_breakdown?.product_discounts?.amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">{bill_breakdown.product_discounts.description}</span>
              <span className="font-medium text-green-600">
                -₹{formatPrice(bill_breakdown.product_discounts.amount)}
              </span>
            </div>
          )}

          {/* Amount After Product Discounts */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {bill_breakdown?.amount_after_product_discounts?.description || "Subtotal"}
            </span>
            <span className="font-medium text-gray-800">
              ₹{formatPrice(bill_breakdown?.amount_after_product_discounts?.amount || 0)}
            </span>
          </div>

          {/* Tax breakdown - Only show CGST/SGST breakdown without total */}
          {bill_breakdown?.tax?.breakdown && bill_breakdown.tax.amount > 0 && (
            <div className="space-y-1">
              {bill_breakdown.tax.breakdown.tax_type === "cgst_sgst" && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST (2.5%)</span>
                    <span className="font-medium text-gray-800">₹{formatPrice(bill_breakdown.tax.breakdown.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST (2.5%)</span>
                    <span className="font-medium text-gray-800">₹{formatPrice(bill_breakdown.tax.breakdown.sgst)}</span>
                  </div>
                </>
              )}
              {bill_breakdown.tax.breakdown.tax_type === "igst" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IGST (5%)</span>
                  <span className="font-medium text-gray-800">₹{formatPrice(bill_breakdown.tax.breakdown.igst)}</span>
                </div>
              )}
            </div>
          )}

          {/* Coupon discount */}
          {hasCouponApplied && bill_breakdown?.coupon_discount?.amount > 0 && (
            <div className="flex justify-between text-sm bg-green-50 -mx-4 px-4 py-2 rounded-lg">
              <span className="text-green-700 flex items-center font-medium">
                <Tag className="h-4 w-4 mr-2" />
                Coupon ({bill_breakdown.coupon_discount.code})
              </span>
              <span className="font-bold text-green-700">-₹{formatPrice(bill_breakdown.coupon_discount.amount)}</span>
            </div>
          )}

          {/* Amount After All Discounts */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {bill_breakdown?.amount_after_discounts?.description || "Amount After Discounts"}
            </span>
            <span className="font-medium text-gray-800">
              ₹{formatPrice(bill_breakdown?.amount_after_discounts?.amount || 0)}
            </span>
          </div>

          {/* Shipping charges */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{bill_breakdown?.shipping?.description || "Shipping"}</span>
            <div className="text-right">
              {bill_breakdown?.shipping?.is_free ? (
                <div className="flex items-center justify-end space-x-2">
                  {bill_breakdown?.shipping?.original_amount > 0 && (
                    <span className="text-gray-400 line-through text-xs">
                      ₹{formatPrice(bill_breakdown.shipping.original_amount)}
                    </span>
                  )}
                  <span className="font-medium text-green-600">Free</span>
                </div>
              ) : (
                <span className="font-medium text-gray-800">₹{formatPrice(bill_breakdown?.shipping?.amount || 0)}</span>
              )}
            </div>
          </div>

          {/* Payment charges */}
          {bill_breakdown?.payment_charges?.applied && bill_breakdown?.payment_charges?.amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{bill_breakdown.payment_charges.description}</span>
              <span className="font-medium text-gray-800">₹{formatPrice(bill_breakdown.payment_charges.amount)}</span>
            </div>
          )}

          {/* Amount Before Roundoff - only show if roundoff exists */}
          {bill_breakdown?.roundoff?.amount !== 0 && Math.abs(bill_breakdown?.roundoff?.amount || 0) > 0 && (
            <div className="flex justify-between text-sm border-t border-dashed border-gray-200 pt-2 mt-2">
              <span className="text-gray-600">
                {bill_breakdown?.amount_before_roundoff?.description || "Amount Before Roundoff"}
              </span>
              <span className="font-medium text-gray-800">
                ₹{formatPrice(bill_breakdown?.amount_before_roundoff?.amount || 0)}
              </span>
            </div>
          )}

          {/* Roundoff amount - only show when not zero */}
          {bill_breakdown?.roundoff?.amount !== 0 && Math.abs(bill_breakdown?.roundoff?.amount || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                {bill_breakdown?.roundoff?.description || "Roundoff Amount"}
                {bill_breakdown?.roundoff?.note && (
                  <span className="ml-1 text-xs text-gray-500">({bill_breakdown.roundoff.note})</span>
                )}
              </span>
              <span
                className={`font-medium text-sm ${(bill_breakdown?.roundoff?.amount || 0) > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {(bill_breakdown?.roundoff?.amount || 0) > 0 ? "+" : ""}₹
                {formatPrice(Math.abs(bill_breakdown?.roundoff?.amount || 0))}
              </span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-dashed border-gold/30">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800 text-lg">Amount to Pay</span>
              <span className="font-bold text-amber-900 text-2xl">₹{formatPrice(final_amount_to_pay)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">Inclusive of all taxes and charges</p>
          </div>
        </div>
      </div>

      {/* Store Info - Show if available */}
      {store && (
        <div className="p-4 border-t border-gold/10 bg-amber-50">
          <h3 className="font-medium text-amber-900 mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {store.name}
          </h3>
          <div className="space-y-1 text-sm text-amber-800">
            <p>
              {store.city}, {store.state}
            </p>
            <div className="flex items-center space-x-1 mt-2">
              <Phone className="h-4 w-4" />
              <span>{store.phone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
