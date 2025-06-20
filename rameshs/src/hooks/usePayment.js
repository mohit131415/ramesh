import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import paymentService from "../services/payment-service"
import usePaymentStore from "../store/paymentStore"
import useCartStore from "../store/cartStore"
import { toast } from "../components/ui/use-toast"

/**
 * Hook for getting available payment methods
 */
export const usePaymentMethods = (amount) => {
  const { setPaymentMethods, setError } = usePaymentStore()

  return useQuery({
    queryKey: ["paymentMethods", amount],
    queryFn: () => paymentService.getPaymentMethods(amount),
    onSuccess: (response) => {
      if (response?.data?.methods) {
        setPaymentMethods(response.data.methods)
      }
    },
    onError: (error) => {
      setError("Failed to load payment methods")
    },
    enabled: !!amount,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for processing payment (dummy for online payments)
 */
export const useProcessPayment = () => {
  const { setCurrentPayment, setPaymentStatus, setLoading, setError } = usePaymentStore()

  return useMutation({
    mutationFn: ({ paymentId, paymentDetails }) => paymentService.processPayment(paymentId, paymentDetails),
    onMutate: () => {
      setLoading(true)
      setPaymentStatus("processing")
      setError(null)
    },
    onSuccess: (response) => {
      if (response?.status === "success" && response?.data) {
        setCurrentPayment(response.data)
        setPaymentStatus("completed")
      } else {
        throw new Error(response?.message || "Payment processing failed")
      }

      setLoading(false)
    },
    onError: (error) => {
      setError(error.message || "Payment processing failed")
      setPaymentStatus("failed")
      setLoading(false)
    },
  })
}

/**
 * Hook for creating order
 */
export const useCreateOrder = () => {
  const { setCurrentOrder, setOrderStatus, setLoading, setError, clearPayment } = usePaymentStore()
  const { clearCart } = useCartStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (orderData) => paymentService.createOrder(orderData),
    onMutate: () => {
      setLoading(true)
      setOrderStatus("creating")
      setError(null)
    },
    onSuccess: (response) => {
      if (response?.status === "success" && response?.data) {
        const orderData = response.data
        setCurrentOrder(orderData)
        setOrderStatus("completed")

        // Store order access token in sessionStorage for security
        const orderToken = btoa(`${orderData.order_number}_${Date.now()}_${Math.random()}`)
        sessionStorage.setItem("order_access_token", orderToken)
        sessionStorage.setItem("order_data", JSON.stringify(orderData))

        // Clear cart and payment data
        clearCart()
        clearPayment()

        // Navigate to order success page with token
        navigate(`/order-success?token=${orderToken}`)
      } else {
        throw new Error(response?.message || "Failed to create order")
      }

      setLoading(false)
    },
    onError: (error) => {
      let errorMessage = "Failed to create order"
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      setOrderStatus("failed")
      setLoading(false)
    },
  })
}

/**
 * Hook for downloading invoice as PDF
 */
export const useDownloadInvoice = () => {
  const { setLoading, setError } = usePaymentStore()

  return useMutation({
    mutationFn: async (orderNumber) => {
      try {
        setLoading(true)

        // Get HTML content from API
        const htmlContent = await paymentService.downloadInvoice(orderNumber)

        // Create a new window to display the invoice
        const invoiceWindow = window.open("", "_blank", "width=800,height=600")
        if (!invoiceWindow) {
          throw new Error("Please allow popups to download the invoice")
        }

        // Enhanced HTML template with better styling for PDF
        const enhancedHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Invoice - ${orderNumber}</title>
            <style>
              @media print {
                .no-print { display: none !important; }
                body { margin: 0; }
                .invoice-container { box-shadow: none; }
              }
              
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
              }
              
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border-radius: 8px;
              }
              
              .action-buttons {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                display: flex;
                gap: 10px;
              }
              
              .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
                transition: all 0.3s ease;
              }
              
              .btn-primary {
                background-color: #d3ae6e;
                color: white;
              }
              
              .btn-primary:hover {
                background-color: #c19d5e;
              }
              
              .btn-secondary {
                background-color: #6c757d;
                color: white;
              }
              
              .btn-secondary:hover {
                background-color: #5a6268;
              }
            </style>
          </head>
          <body>
            <div class="action-buttons no-print">
              <button class="btn btn-primary" onclick="window.print()">Print / Save as PDF</button>
              <button class="btn btn-secondary" onclick="window.close()">Close</button>
            </div>
            
            <div class="invoice-container">
              ${htmlContent}
            </div>
            
            <script>
              // Auto-focus for better user experience
              window.focus();
              
              // Add keyboard shortcuts
              document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'p') {
                  e.preventDefault();
                  window.print();
                }
                if (e.key === 'Escape') {
                  window.close();
                }
              });
              
              // Show instructions after page loads
              window.addEventListener('load', function() {
                console.log('Invoice loaded. Press Ctrl+P to print or use the Print button.');
              });
            </script>
          </body>
          </html>
        `

        // Write the enhanced HTML content to the new window
        invoiceWindow.document.write(enhancedHtml)
        invoiceWindow.document.close()

        setLoading(false)
        return { success: true }
      } catch (error) {
        setLoading(false)
        throw error
      }
    },
    onSuccess: () => {
      toast({
        title: "Invoice Opened",
        description: "Your invoice has been opened in a new window. Use the Print button or Ctrl+P to save as PDF.",
        variant: "default",
      })
    },
    onError: (error) => {
      setError("Failed to download invoice")

      toast({
        title: "Download Failed",
        description: error.message || "Failed to download invoice. Please try again.",
        variant: "destructive",
      })
    },
  })
}

/**
 * Hook for completing payment flow (COD or Online)
 */
export const useCompletePayment = () => {
  const createOrderMutation = useCreateOrder()
  const navigate = useNavigate()
  const { setCurrentPayment, setPaymentStatus } = usePaymentStore()

  return useMutation({
    mutationFn: async ({ paymentMethod, paymentDetails = {}, addressId, checkoutData }) => {
      const orderData = {
        address_id: addressId || checkoutData?.address?.id,
        payment_method: paymentMethod,
        additional_data: {
          delivery_notes: paymentDetails.deliveryNotes || "",
          special_instructions: paymentDetails.specialInstructions || "",
        },
      }

      if (paymentMethod === "cod") {
        // Direct order creation for COD - no payment processing needed
        return createOrderMutation.mutateAsync(orderData)
      } else {
        // For online payments, generate a dummy payment ID and redirect to payment page
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

        // Store checkout data for payment page
        sessionStorage.setItem(
          "checkout_data",
          JSON.stringify({
            orderData,
            checkoutData,
            paymentMethod,
          }),
        )

        // Set payment data in store
        setCurrentPayment({
          payment_id: paymentId,
          amount: checkoutData?.final_amount_to_pay,
          currency: "INR",
          status: "initialized",
          created_at: new Date().toISOString(),
        })

        setPaymentStatus("initialized")

        // Navigate to payment page
        navigate(`/payment?id=${paymentId}`)

        return { redirected: true, payment_id: paymentId }
      }
    },
    onError: (error) => {
      if (typeof window !== "undefined" && window.showToast) {
        window.showToast({
          title: "Payment Failed",
          description: error.message || "Failed to complete payment. Please try again.",
          type: "error",
        })
      }
    },
  })
}

/**
 * Hook for completing online payment after payment page
 */
export const useCompleteOnlinePayment = () => {
  const createOrderMutation = useCreateOrder()
  const processPaymentMutation = useProcessPayment()

  return useMutation({
    mutationFn: async ({ paymentId, paymentDetails }) => {
      // Get stored checkout data
      const storedData = sessionStorage.getItem("checkout_data")
      if (!storedData) {
        throw new Error("Checkout session expired. Please try again.")
      }

      const { orderData, checkoutData } = JSON.parse(storedData)

      // First process the dummy payment
      const paymentResult = await processPaymentMutation.mutateAsync({
        paymentId,
        paymentDetails: {
          amount: checkoutData?.final_amount_to_pay,
          method: paymentDetails.method || "card",
          ...paymentDetails,
        },
      })

      // Then create the order with payment ID
      const finalOrderData = {
        ...orderData,
        payment_method: "online",
        payment_id: paymentResult.data.payment_id,
        additional_data: {
          ...orderData.additional_data,
          payment_gateway: "dummy",
          transaction_id: paymentResult.data.transaction_id,
        },
      }

      // Clear checkout data after successful payment
      sessionStorage.removeItem("checkout_data")

      return createOrderMutation.mutateAsync(finalOrderData)
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to complete payment. Please try again.",
        variant: "destructive",
      })
    },
  })
}

/**
 * Hook for verifying payment
 */
export const useVerifyPayment = () => {
  const { setPaymentStatus, setLoading, setError } = usePaymentStore()

  return useMutation({
    mutationFn: paymentService.verifyPayment,
    onMutate: () => {
      setLoading(true)
      setPaymentStatus("verifying")
      setError(null)
    },
    onSuccess: (response) => {
      if (response?.status === "success") {
        setPaymentStatus("verified")
        toast({
          title: "Payment Verified",
          description: "Payment has been verified successfully.",
          variant: "default",
        })
      } else {
        throw new Error(response?.message || "Failed to verify payment")
      }

      setLoading(false)
    },
    onError: (error) => {
      setError(error.message || "Failed to verify payment")
      setPaymentStatus("failed")
      setLoading(false)
    },
  })
}
