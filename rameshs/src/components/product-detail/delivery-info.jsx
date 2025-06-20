import { Truck, Clock, ShieldCheck } from "lucide-react"

const DeliveryInfo = ({ estimatedDelivery }) => {
  return (
    <div className="bg-white rounded-lg border border-gold/10 p-4 space-y-3">
      <h3 className="font-cinzel text-lg text-gray-900">Delivery Information</h3>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-gold-dark mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Free Shipping</p>
            <p className="text-sm text-gray-600">On orders above ₹999</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-gold-dark mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Estimated Delivery</p>
            <p className="text-sm text-gray-600">By {estimatedDelivery}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-gold-dark mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Quality Guarantee</p>
            <p className="text-sm text-gray-600">100% authentic products</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryInfo
