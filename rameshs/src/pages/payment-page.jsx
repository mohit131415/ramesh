"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CreditCard, Lock, ArrowLeft, CheckCircle, AlertCircle, Smartphone, Building2, Shield } from "lucide-react"
import { UniversalButton } from "../components/ui/universal-button"
import { useCompleteOnlinePayment } from "../hooks/usePayment"
import usePaymentStore from "../store/paymentStore"
import LoadingSpinner from "../components/common/loading-spinner"

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentPayment } = usePaymentStore()
  const { mutateAsync: completeOnlinePayment, isLoading } = useCompleteOnlinePayment()

  const [paymentMethod, setPaymentMethod] = useState("card")
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    upiId: "",
    bankAccount: "",
  })
  const [error, setError] = useState(null)
  const [checkoutData, setCheckoutData] = useState(null)

  const paymentId = searchParams.get("id")

  // Load checkout data and verify payment session
  useEffect(() => {
    const storedData = sessionStorage.getItem("checkout_data")
    if (!storedData || !paymentId) {
      navigate("/checkout", { replace: true })
      return
    }

    try {
      const parsedData = JSON.parse(storedData)
      setCheckoutData(parsedData)
    } catch (err) {
      console.error("Error parsing checkout data:", err)
      navigate("/checkout", { replace: true })
    }
  }, [paymentId, navigate])

  const handleInputChange = (field, value) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const validatePaymentDetails = () => {
    switch (paymentMethod) {
      case "card":
        if (
          !paymentDetails.cardNumber ||
          !paymentDetails.expiryDate ||
          !paymentDetails.cvv ||
          !paymentDetails.cardholderName
        ) {
          return "Please fill in all card details"
        }
        break
      case "upi":
        if (!paymentDetails.upiId) {
          return "Please enter your UPI ID"
        }
        break
      case "netbanking":
        if (!paymentDetails.bankAccount) {
          return "Please select your bank"
        }
        break
    }
    return null
  }

  const handlePayment = async () => {
    const validationError = validatePaymentDetails()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setError(null)
      await completeOnlinePayment({
        paymentId,
        paymentDetails: {
          method: paymentMethod,
          ...paymentDetails,
        },
      })
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.")
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-br from-[#d3ae6e]/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-[#d3ae6e] flex items-center justify-center shadow-md">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Secure Payment</h1>
                    <p className="text-sm text-gray-600">Complete your order payment</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Back to Checkout</span>
                </button>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatAmount(checkoutData?.checkoutData?.final_amount_to_pay || currentPayment?.amount || 0)}
                </p>
                <div className="flex items-center justify-center mt-2">
                  <Shield className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">SSL Secured Payment</span>
                </div>

                {/* Add payment status indicator */}
                {currentPayment?.status === "completed" && (
                  <div className="mt-3 p-2 bg-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-700 font-medium">Payment Successful</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Select Payment Method</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "upi", label: "UPI", icon: Smartphone },
                  { id: "netbanking", label: "Net Banking", icon: Building2 },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      paymentMethod === id ? "border-[#d3ae6e] bg-[#d3ae6e]/5" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Icon className={`h-6 w-6 ${paymentMethod === id ? "text-[#d3ae6e]" : "text-gray-600"}`} />
                      <span className={`font-medium ${paymentMethod === id ? "text-[#d3ae6e]" : "text-gray-700"}`}>
                        {label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                {paymentMethod === "card" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        value={paymentDetails.cardholderName}
                        onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent"
                        placeholder="Enter cardholder name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          value={paymentDetails.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === "upi" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                    <input
                      type="text"
                      value={paymentDetails.upiId}
                      onChange={(e) => handleInputChange("upiId", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent"
                      placeholder="yourname@paytm"
                    />
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank</label>
                    <select
                      value={paymentDetails.bankAccount}
                      onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d3ae6e] focus:border-transparent"
                    >
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="mt-6">
                <UniversalButton
                  onClick={handlePayment}
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="w-full h-12 bg-[#d3ae6e] hover:bg-[#c19c5d] text-white font-medium rounded-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>
                        Pay{" "}
                        {formatAmount(checkoutData?.checkoutData?.final_amount_to_pay || currentPayment?.amount || 0)}
                      </span>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </UniversalButton>

                <div className="flex items-center justify-center mt-4">
                  <Lock className="h-3 w-3 text-gray-400 mr-1" />
                  <p className="text-xs text-gray-500">Your payment information is secure and encrypted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Secure Payment Gateway</h3>
                <p className="text-sm text-gray-600">
                  Your payment is processed through our secure SSL-encrypted gateway. We never store your payment
                  information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
