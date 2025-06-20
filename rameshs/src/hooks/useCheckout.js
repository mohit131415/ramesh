import { useMutation, useQuery } from "@tanstack/react-query"
import checkoutService from "../services/checkout-service"
import useCheckoutStore from "../store/checkoutStore"

/**
 * Hook for preparing checkout data
 */
export const usePrepareCheckout = () => {
  const { setCheckoutData, setLoading, setError } = useCheckoutStore()

  return useMutation({
    mutationFn: (params) => checkoutService.prepareCheckout(params),
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: (response) => {
      console.log("Prepare checkout response:", response)

      // Handle direct API response (not wrapped in Axios response)
      if (response && response.status === "success" && response.data) {
        console.log("Setting checkout data:", response.data)
        setCheckoutData(response.data)
        setError(null)
        return response.data
      } else {
        const errorMessage = response.message || "API returned an error"
        console.error("API error:", response)
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      setLoading(false)
    },
    onError: (error) => {
      // console.error("Prepare checkout error:", error)

      // Handle different error types
      let errorMessage = "Failed to prepare checkout"

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      setLoading(false)
    },
  })
}

/**
 * Hook for completing checkout
 */
export const useCompleteCheckout = () => {
  const { setOrderData, setLoading, setError, clearCheckoutData } = useCheckoutStore()

  return useMutation({
    mutationFn: (orderData) => checkoutService.completeCheckout(orderData),
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: (response) => {
      console.log("Complete checkout response:", response)

      // Handle direct API response (not wrapped in Axios response)
      if (response && response.status === "success" && response.data) {
        console.log("Setting order data:", response.data)
        setOrderData(response.data)
        clearCheckoutData()
        setError(null)
      } else {
        const errorMessage = response.message || "API returned an error"
        console.error("API error:", response)
        setError(errorMessage)
      }

      setLoading(false)
    },
    onError: (error) => {
      // console.error("Complete checkout error:", error)

      let errorMessage = "Failed to complete checkout"

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      setLoading(false)
    },
  })
}

/**
 * Hook for validating checkout data
 */
export const useValidateCheckout = () => {
  const { checkoutData } = useCheckoutStore()

  return useQuery({
    queryKey: ["validateCheckout", checkoutData],
    queryFn: () => checkoutService.validateCheckoutData(checkoutData),
    enabled: !!checkoutData,
    staleTime: 0,
  })
}
