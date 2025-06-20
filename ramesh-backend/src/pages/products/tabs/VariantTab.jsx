"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  Plus,
  Trash2,
  Edit,
  Percent,
  Info,
  Package,
  Tag,
  Scale,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  IndianRupee,
  AlertCircle,
  Search,
  Shield,
  Loader2,
  Weight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import productService from "../../../services/productService"
import { debounce } from "lodash"

const VariantTab = ({ variants, onChange, ...props }) => {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "super_admin"

  const [editingVariant, setEditingVariant] = useState(null)
  const [newVariant, setNewVariant] = useState({
    variant_name: "",
    sku: "",
    price: "",
    sale_price: "",
    weight: "",
    weight_unit: "g",
    length: "",
    width: "",
    height: "",
    status: "active",
    min_order_quantity: 1,
    max_order_quantity: 10,
  })
  const [allProductSKUs, setAllProductSKUs] = useState([])
  const [isLoadingSKUs, setIsLoadingSKUs] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const [quickViewVariant, setQuickViewVariant] = useState(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState(null)
  const [errors, setErrors] = useState({})
  const [variantErrors, setVariantErrors] = useState({})

  // New state for weight-based variant creation
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false)
  const [weightVariantData, setWeightVariantData] = useState({
    weight: "",
    weight_unit: "g",
    baseVariant: null,
  })

  const [skuValidationResults, setSkuValidationResults] = useState({})
  const [isValidatingSKU, setIsValidatingSKU] = useState({})

  // Ref to track if we should auto-open the edit dialog for a variant with error
  const shouldOpenEditDialog = useRef(false)
  const variantToEdit = useRef(null)

  // Check for variants with duplicate SKUs on initial load
  useEffect(() => {
    if (allProductSKUs.length > 0 && variants.length > 0) {
      checkAllVariantsSKUs()
    }
  }, [allProductSKUs, variants])

  // Function to check all variants' SKUs for duplicates
  const checkAllVariantsSKUs = () => {
    const newVariantErrors = { ...variantErrors }

    variants.forEach((variant) => {
      const isDuplicate = checkDuplicateSKUAcrossProducts(variant.sku, variant.id)
      if (isDuplicate && isDuplicate.product) {
        newVariantErrors[variant.id] = {
          ...newVariantErrors[variant.id],
          sku: `SKU "${variant.sku}" already exists in product "${isDuplicate.product.name}" (${isDuplicate.variant.name})`,
        }
      }
    })

    if (Object.keys(newVariantErrors).length > 0) {
      setVariantErrors(newVariantErrors)
    }
  }

  // Function to check if a SKU exists in other products
  const checkDuplicateSKUAcrossProducts = (sku, variantId) => {
    if (!sku || !allProductSKUs.length) return null

    const currentProductId = props.productId

    for (const product of allProductSKUs) {
      // Skip current product
      if (currentProductId && product.id === Number.parseInt(currentProductId)) {
        continue
      }

      const duplicateVariant = product.variants.find((v) => v.sku.toLowerCase() === sku.toLowerCase())

      if (duplicateVariant) {
        return {
          product,
          variant: duplicateVariant,
        }
      }
    }

    return null
  }

  const debouncedValidateSKU = useCallback(
    debounce(async (sku, variantId, productId) => {
      if (!sku) {
        setSkuValidationResults((prev) => ({
          ...prev,
          [variantId]: null,
        }))
        setIsValidatingSKU((prev) => ({
          ...prev,
          [variantId]: false,
        }))
        return
      }

      try {
        const result = await productService.validateSKU(sku, productId)
        setSkuValidationResults((prev) => ({
          ...prev,
          [variantId]: result,
        }))
      } catch (error) {
        console.error("SKU validation error:", error)
        setSkuValidationResults((prev) => ({
          ...prev,
          [variantId]: {
            status: "error",
            message: "Failed to validate SKU",
            isValid: false,
          },
        }))
      } finally {
        setIsValidatingSKU((prev) => ({
          ...prev,
          [variantId]: false,
        }))
      }
    }, 500),
    [setSkuValidationResults, setIsValidatingSKU],
  )

  const handleSKUChange = (sku, variantId) => {
    // Set validating state
    setIsValidatingSKU((prev) => ({
      ...prev,
      [variantId]: true,
    }))

    // Clear previous validation result
    setSkuValidationResults((prev) => ({
      ...prev,
      [variantId]: null,
    }))

    // Check immediately if this SKU exists in other products
    const isDuplicate = checkDuplicateSKUAcrossProducts(sku, variantId)
    if (isDuplicate) {
      setSkuValidationResults((prev) => ({
        ...prev,
        [variantId]: {
          status: "error",
          message: `SKU "${sku}" already exists in product "${isDuplicate.product.name}" (${isDuplicate.variant.name})`,
          isValid: false,
        },
      }))
    }

    // Still trigger API validation
    debouncedValidateSKU(sku, variantId, props.productId)
  }

  useEffect(() => {
    const fetchAllSKUs = async () => {
      setIsLoadingSKUs(true)
      try {
        const response = await productService.getAllProductSKUs()
        if (response.status === "success") {
          setAllProductSKUs(response.data)
        } else {
          console.error("Failed to fetch SKUs:", response.message)
          toast.error("Failed to load SKU validation data")
        }
      } catch (error) {
        console.error("Error fetching SKUs:", error)
      } finally {
        setIsLoadingSKUs(false)
      }
    }

    fetchAllSKUs()
  }, [])

  // Effect to open edit dialog for variant with error
  useEffect(() => {
    if (shouldOpenEditDialog.current && variantToEdit.current) {
      startEditing(variantToEdit.current)
      shouldOpenEditDialog.current = false
      variantToEdit.current = null
    }
  }, [variantErrors])

  // Validate form
  const validateForm = (variant, externalErrors = {}) => {
    const newErrors = { ...externalErrors }
    let isValid = true
    const variantId = variant.id || "new-variant"
    const newVariantErrors = { ...variantErrors }

    // Clear previous errors for this variant
    newVariantErrors[variantId] = {}

    // Check for variant_name error
    if (!variant.variant_name) {
      newErrors.variant_name = "Variant name is required"
      newVariantErrors[variantId].variant_name = "Variant name is required"
      toast.error("Please enter the variant name")
      isValid = false
    }

    // Check for duplicate variant name
    const isDuplicateName = variants.some(
      (v) => v.variant_name.toLowerCase() === variant.variant_name.toLowerCase() && v.id !== variant.id,
    )

    if (isDuplicateName) {
      newErrors.variant_name = `A variant with name "${variant.variant_name}" already exists`
      newVariantErrors[variantId].variant_name = `A variant with name "${variant.variant_name}" already exists`
      toast.error(`A variant with name "${variant.variant_name}" already exists`)
      isValid = false
    }

    // Check for variant_sku error
    if (!variant.sku) {
      newErrors.sku = "SKU is required"
      newVariantErrors[variantId].sku = "SKU is required"
      toast.error("Please enter a SKU code")
      isValid = false
    }

    // Check for duplicate SKU within current variants
    const isDuplicateSku = variants.some(
      (v) => v.sku.toLowerCase() === variant.sku.toLowerCase() && v.id !== variant.id,
    )

    if (isDuplicateSku) {
      newErrors.sku = `This SKU "${variant.sku}" is already used in this product`
      newVariantErrors[variantId].sku = `This SKU "${variant.sku}" is already used in this product`
      toast.error(`This SKU "${variant.sku}" is already used in this product`)
      isValid = false
    }

    // Check real-time validation results
    if (skuValidationResults[variantId] && !skuValidationResults[variantId].isValid) {
      newErrors.sku = skuValidationResults[variantId].message
      newVariantErrors[variantId].sku = skuValidationResults[variantId].message
      toast.error(skuValidationResults[variantId].message)
      isValid = false
    }

    // Check for duplicate SKU across all products in the system
    const duplicateSKU = checkDuplicateSKUAcrossProducts(variant.sku, variant.id)
    if (duplicateSKU) {
      const message = `SKU "${variant.sku}" already exists in product "${duplicateSKU.product.name}" (${duplicateSKU.variant.name})`
      newErrors.sku = message
      newVariantErrors[variantId].sku = message
      toast.error(message)
      isValid = false
    }

    // Check for variant_price error
    if (!variant.price) {
      newErrors.price = "Price is required"
      newVariantErrors[variantId].price = "Price is required"
      toast.error("Please enter the price")
      isValid = false
    }
    if (variant.price && isNaN(Number(variant.price))) {
      newErrors.price = "Price must be a number"
      newVariantErrors[variantId].price = "Price must be a number"
      toast.error("Price must be a number")
      isValid = false
    }

    // Check for other errors
    if (variant.sale_price && isNaN(Number(variant.sale_price))) {
      newErrors.sale_price = "Sale price must be a number"
      newVariantErrors[variantId].sale_price = "Sale price must be a number"
      toast.error("Sale price must be a number")
      isValid = false
    }
    if (variant.sale_price && Number(variant.sale_price) > Number(variant.price)) {
      newErrors.sale_price = "Sale price cannot be more than regular price"
      newVariantErrors[variantId].sale_price = "Sale price cannot be more than regular price"
      toast.error("Sale price cannot be more than regular price")
      isValid = false
    }
    if (variant.sale_price && Number(variant.sale_price) === 0) {
      newErrors.sale_price = "Sale price cannot be zero"
      newVariantErrors[variantId].sale_price = "Sale price cannot be zero"
      toast.error("Sale price cannot be zero")
      isValid = false
    }
    if (!variant.weight) {
      newErrors.weight = "Weight is required"
      newVariantErrors[variantId].weight = "Weight is required"
      toast.error("Please enter the weight")
      isValid = false
    }
    if (variant.weight && isNaN(Number(variant.weight))) {
      newErrors.weight = "Weight must be a number"
      newVariantErrors[variantId].weight = "Weight must be a number"
      toast.error("Weight must be a number")
      isValid = false
    }

    // Validate min order quantity only for super admin
    if (isSuperAdmin) {
      if (!variant.min_order_quantity) {
        newErrors.min_order_quantity = "Minimum order quantity is required"
        newVariantErrors[variantId].min_order_quantity = "Minimum order quantity is required"
        toast.error("Please enter minimum order quantity")
        isValid = false
      }

      // Add this new validation check for minimum order cannot be 0
      if (variant.min_order_quantity && Number(variant.min_order_quantity) <= 0) {
        newErrors.min_order_quantity = "Minimum order quantity cannot be 0 or negative"
        newVariantErrors[variantId].min_order_quantity = "Minimum order quantity cannot be 0 or negative"
        toast.error("Minimum order quantity must be at least 1")
        isValid = false
      }
    }

    // Validate max order quantity for all users
    if (!variant.max_order_quantity) {
      newErrors.max_order_quantity = "Maximum order quantity is required"
      newVariantErrors[variantId].max_order_quantity = "Maximum order quantity is required"
      toast.error("Please enter maximum order quantity")
      isValid = false
    }

    // Check if min is greater than max (only if both exist)
    if (
      variant.min_order_quantity &&
      variant.max_order_quantity &&
      Number(variant.min_order_quantity) > Number(variant.max_order_quantity)
    ) {
      newErrors.min_order_quantity = "Minimum order cannot be more than maximum"
      newVariantErrors[variantId].min_order_quantity = "Minimum order cannot be more than maximum"
      toast.error("Minimum order cannot be more than maximum")
      isValid = false
    }

    setErrors(newErrors)
    setVariantErrors(newVariantErrors)
    return isValid
  }

  // Add a function to handle specific variant SKU errors
  const handleVariantSkuError = (errorMessage) => {
    // Check if it's a variant_sku error with a specific SKU
    if (errorMessage.startsWith("variant_sku:")) {
      // Extract the SKU and error message
      const match = errorMessage.match(/variant_sku:(.+?):(.+)/)
      if (match && match.length === 3) {
        const sku = match[1]
        const message = match[2]

        // Find the variant with this SKU
        const variantWithError = variants.find((v) => v.sku === sku)
        if (variantWithError) {
          // Set error for this specific variant
          setVariantErrors((prev) => ({
            ...prev,
            [variantWithError.id]: {
              ...prev[variantWithError.id],
              sku: `${message} (SKU: ${sku})`,
            },
          }))

          toast.error(`${message} (SKU: ${sku})`)

          // Set flag to open edit dialog for this variant
          shouldOpenEditDialog.current = true
          variantToEdit.current = variantWithError

          return true
        }
      }
    } else if (errorMessage.includes("variant") || errorMessage.includes("SKU")) {
      // Try to handle other variant-related errors
      // This is a more generic approach for errors that don't follow the specific format

      // Try to extract SKU from error message if possible
      const skuMatch = errorMessage.match(/SKU[:\s]+([A-Za-z0-9-]+)/i)
      if (skuMatch && skuMatch.length > 1) {
        const sku = skuMatch[1]
        const variantWithError = variants.find((v) => v.sku.includes(sku))

        if (variantWithError) {
          // Set error for this specific variant
          setVariantErrors((prev) => ({
            ...prev,
            [variantWithError.id]: {
              ...prev[variantWithError.id],
              sku: errorMessage,
            },
          }))

          toast.error(errorMessage)

          // Set flag to open edit dialog for this variant
          shouldOpenEditDialog.current = true
          variantToEdit.current = variantWithError

          return true
        }
      }

      // If we couldn't extract a SKU, set error on all variants as a fallback
      if (variants.length > 0) {
        const newVariantErrors = {}
        variants.forEach((v) => {
          newVariantErrors[v.id] = {
            ...newVariantErrors[v.id],
            general: errorMessage,
          }
        })

        setVariantErrors(newVariantErrors)
        toast.error(errorMessage)
        return true
      }
    }
    return false
  }

  // Expose this function to parent component
  useEffect(() => {
    if (props.onVariantErrorHandler) {
      props.onVariantErrorHandler(handleVariantSkuError)
    }
  }, [props.onVariantErrorHandler, variants])

  // Check for duplicate variants
  const isDuplicateVariant = (newVariant) => {
    // Check if there's already a variant with the same weight and weight_unit
    return variants.some(
      (v) => v.weight === Number.parseFloat(newVariant.weight) && v.weight_unit === newVariant.weight_unit,
    )
  }

  // Handle adding a new variant
  const handleAddVariant = () => {
    // Check if we're currently validating the SKU
    if (isValidatingSKU["new-variant"]) {
      toast.info("Please wait while checking if SKU is available...")
      return
    }

    // Check if the SKU is invalid based on real-time validation
    if (skuValidationResults["new-variant"] && !skuValidationResults["new-variant"].isValid) {
      setErrors((prev) => ({
        ...prev,
        sku: skuValidationResults["new-variant"].message,
      }))
      setVariantErrors((prev) => ({
        ...prev,
        "new-variant": {
          ...prev["new-variant"],
          sku: skuValidationResults["new-variant"].message,
        },
      }))
      toast.error(skuValidationResults["new-variant"].message)
      return
    }

    // Check for duplicate variant
    if (isDuplicateVariant(newVariant)) {
      toast.error(`A variant with ${newVariant.weight}${newVariant.weight_unit} already exists`)
      setErrors((prev) => ({
        ...prev,
        weight: `A variant with ${newVariant.weight}${newVariant.weight_unit} already exists`,
      }))
      return
    }

    if (!validateForm(newVariant)) return

    const updatedVariants = [
      ...variants,
      {
        ...newVariant,
        id: Date.now().toString(), // Temporary ID for frontend
        price: Number.parseFloat(newVariant.price),
        sale_price: newVariant.sale_price ? Number.parseFloat(newVariant.sale_price) : null,
        weight: Number.parseFloat(newVariant.weight),
        min_order_quantity: Number.parseInt(newVariant.min_order_quantity),
        max_order_quantity: Number.parseInt(newVariant.max_order_quantity),
      },
    ]

    onChange(updatedVariants)
    setNewVariant({
      variant_name: "",
      sku: "",
      price: "",
      sale_price: "",
      weight: "",
      weight_unit: "g",
      length: "",
      width: "",
      height: "",
      status: "active",
      min_order_quantity: 1,
      max_order_quantity: 10,
    })
    setIsAddDialogOpen(false)
    setErrors({})
    setVariantErrors({})
    toast.success("Variant added successfully!")
  }

  // Handle editing a variant
  const startEditing = (variant) => {
    setEditingVariant({
      ...variant,
      price: variant.price.toString(),
      sale_price: variant.sale_price ? variant.sale_price.toString() : "",
      weight: variant.weight ? variant.weight.toString() : "",
      min_order_quantity: variant.min_order_quantity ? variant.min_order_quantity.toString() : "1",
      max_order_quantity: variant.max_order_quantity ? variant.max_order_quantity.toString() : "10",
    })
    setErrors({})
    setIsEditDialogOpen(true)
  }

  // Save edited variant
  const saveEditedVariant = () => {
    // Check if we're currently validating the SKU
    if (isValidatingSKU[editingVariant.id]) {
      toast.info("Please wait while checking if SKU is available...")
      return
    }

    // Check if the SKU is invalid based on real-time validation
    if (skuValidationResults[editingVariant.id] && !skuValidationResults[editingVariant.id].isValid) {
      setErrors((prev) => ({
        ...prev,
        sku: skuValidationResults[editingVariant.id].message,
      }))
      setVariantErrors((prev) => ({
        ...prev,
        [editingVariant.id]: {
          ...prev[editingVariant.id],
          sku: skuValidationResults[editingVariant.id].message,
        },
      }))
      toast.error(skuValidationResults[editingVariant.id].message)
      return
    }

    // Check for duplicate variant when editing
    const otherVariants = variants.filter((v) => v.id !== editingVariant.id)
    const isDuplicate = otherVariants.some(
      (v) => v.weight === Number.parseFloat(editingVariant.weight) && v.weight_unit === editingVariant.weight_unit,
    )

    if (isDuplicate) {
      toast.error(`A variant with ${editingVariant.weight}${editingVariant.weight_unit} already exists`)
      setErrors((prev) => ({
        ...prev,
        weight: `A variant with ${editingVariant.weight}${editingVariant.weight_unit} already exists`,
      }))
      return
    }

    if (!validateForm(editingVariant)) return

    const updatedVariants = variants.map((variant) =>
      variant.id === editingVariant.id
        ? {
            ...editingVariant,
            price: Number.parseFloat(editingVariant.price),
            sale_price: editingVariant.sale_price ? Number.parseFloat(editingVariant.sale_price) : null,
            weight: Number.parseFloat(editingVariant.weight),
            min_order_quantity: Number.parseInt(editingVariant.min_order_quantity),
            max_order_quantity: Number.parseInt(editingVariant.max_order_quantity),
          }
        : variant,
    )

    onChange(updatedVariants)
    setEditingVariant(null)
    setIsEditDialogOpen(false)
    setErrors({})

    // Clear errors for this variant
    setVariantErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[editingVariant.id]
      return newErrors
    })

    toast.success("Variant updated successfully!")
  }

  // Prepare for deletion
  const confirmDelete = (variant) => {
    setVariantToDelete(variant)
    setIsDeleteConfirmOpen(true)
  }

  // Handle deleting a variant
  const handleDeleteVariant = () => {
    if (!variantToDelete) return

    const updatedVariants = variants.filter((variant) => variant.id !== variantToDelete.id)
    onChange(updatedVariants)

    // Clear errors for the deleted variant
    setVariantErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[variantToDelete.id]
      return newErrors
    })

    setIsDeleteConfirmOpen(false)
    setVariantToDelete(null)
    toast.success("Variant deleted successfully!")
  }

  // Open quick view for a variant
  const openQuickView = (variant) => {
    setQuickViewVariant(variant)
    setIsQuickViewOpen(true)
  }

  // Calculate discount percentage
  const calculateDiscountPercentage = (price, salePrice) => {
    const p = Number.parseFloat(price) || 0
    const sp = Number.parseFloat(salePrice) || 0
    if (p === 0 || sp === 0 || sp >= p) return "0"
    const discount = ((p - sp) / p) * 100
    return discount.toFixed(0)
  }

  // Helper function to safely format price with toFixed
  const formatPrice = (price) => {
    // Ensure price is a number before calling toFixed
    if (typeof price === "number") {
      return price.toFixed(2)
    } else if (typeof price === "string") {
      const num = Number.parseFloat(price)
      return isNaN(num) ? "0.00" : num.toFixed(2)
    }
    return "0.00"
  }

  // Render error summary for a variant
  const renderErrorSummary = (variantId) => {
    if (!variantErrors[variantId] || Object.keys(variantErrors[variantId]).length === 0) {
      return null
    }

    return (
      <div className="px-4 py-3 bg-red-100 border-b border-red-300 shadow-inner">
        <div className="flex items-center mb-1">
          <AlertCircle className="h-4 w-4 text-red-600 mr-1.5" />
          <span className="text-sm font-semibold text-red-700">Please fix these errors:</span>
        </div>
        <ul className="text-xs text-red-700 space-y-1.5 font-medium pl-1.5">
          {Object.entries(variantErrors[variantId]).map(([field, message]) => (
            <li key={`error-${variantId}-${field}`} className="flex items-start">
              <span className="h-3 w-3 rounded-full bg-red-500 mr-1.5 mt-1 flex-shrink-0"></span>
              <span>{message}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const countVariantsWithErrors = () => {
    return Object.keys(variantErrors).length
  }

  // New function to open the weight-based variant dialog
  const openWeightVariantDialog = () => {
    if (variants.length === 0) {
      toast.error("You need at least one existing variant to use this feature")
      return
    }

    // Default to the first variant as the base
    setWeightVariantData({
      weight: "",
      weight_unit: "g",
      baseVariant: variants[0],
    })

    setIsWeightDialogOpen(true)
  }

  // Function to generate a new variant based on weight
  const generateWeightBasedVariant = () => {
    const { weight, weight_unit, baseVariant } = weightVariantData

    if (!weight || !baseVariant) {
      toast.error("Please enter a weight and select a base variant")
      return
    }

    if (isNaN(Number(weight)) || Number(weight) <= 0) {
      toast.error("Please enter a valid weight")
      return
    }

    // Check if this weight already exists
    const weightExists = variants.some((v) => v.weight === Number(weight) && v.weight_unit === weight_unit)

    if (weightExists) {
      toast.error(`A variant with ${weight}${weight_unit} already exists`)
      return
    }

    // Generate a new variant based on the selected one
    const newWeightVariant = {
      variant_name: `${weight}${weight_unit}`,
      sku: generateSkuForWeight(baseVariant.sku, weight, weight_unit),
      price: calculatePriceForWeight(
        baseVariant.price,
        baseVariant.weight,
        weight,
        baseVariant.weight_unit,
        weight_unit,
      ),
      sale_price: baseVariant.sale_price
        ? calculatePriceForWeight(
            baseVariant.sale_price,
            baseVariant.weight,
            weight,
            baseVariant.weight_unit,
            weight_unit,
          )
        : "",
      weight: weight,
      weight_unit: weight_unit,
      status: baseVariant.status,
      min_order_quantity: baseVariant.min_order_quantity,
      max_order_quantity: baseVariant.max_order_quantity,
      length: baseVariant.length || "",
      width: baseVariant.width || "",
      height: baseVariant.height || "",
    }

    // Close the weight dialog
    setIsWeightDialogOpen(false)

    // Open the add variant dialog with pre-filled data
    setNewVariant(newWeightVariant)
    setIsAddDialogOpen(true)

    toast.success("New variant created based on weight. Please review and save.")
  }

  // Helper function to generate a new SKU based on weight
  const generateSkuForWeight = (baseSku, newWeight, newUnit) => {
    // Try to find weight patterns like "kk-500", "kk-1000g", etc.
    const weightRegex = /(-|\s)(\d+)(g|kg|mg|lb|oz)?$/i
    const match = baseSku.match(weightRegex)

    if (match) {
      // Replace just the numeric part, keeping the separator and any unit in the SKU
      const separator = match[1] // "-" or space
      const unitInSku = match[3] || "" // "g", "kg", etc. or empty

      // If there's a unit in the SKU, keep it, otherwise use the new unit
      const finalUnit = unitInSku || (newUnit === "g" ? "" : newUnit.toLowerCase())

      return baseSku.replace(weightRegex, `${separator}${newWeight}${finalUnit}`)
    } else {
      // If no pattern found, append with a hyphen
      return `${baseSku}-${newWeight}${newUnit === "g" ? "" : newUnit.toLowerCase()}`
    }
  }

  // Helper function to calculate price based on weight
  const calculatePriceForWeight = (basePrice, baseWeight, newWeight, baseUnit, newUnit) => {
    // Convert all weights to grams for calculation
    const baseWeightInGrams = convertToGrams(baseWeight, baseUnit)
    const newWeightInGrams = convertToGrams(newWeight, newUnit)

    // Calculate price proportionally
    const ratio = newWeightInGrams / baseWeightInGrams
    const newPrice = Number(basePrice) * ratio

    // Round to 2 decimal places
    return newPrice.toFixed(2)
  }

  // Helper function to convert weight to grams
  const convertToGrams = (weight, unit) => {
    const weightNum = Number(weight)
    switch (unit.toLowerCase()) {
      case "kg":
        return weightNum * 1000
      case "mg":
        return weightNum / 1000
      case "lb":
        return weightNum * 453.592
      case "oz":
        return weightNum * 28.3495
      default: // grams
        return weightNum
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-medium">Product Variants</h3>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              Required
            </Badge>

            {countVariantsWithErrors() > 0 && (
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {countVariantsWithErrors()} {countVariantsWithErrors() === 1 ? "error" : "errors"} found
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Add different variants of your product with unique SKUs</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {variants.length > 0 && (
            <Button
              onClick={openWeightVariantDialog}
              size="lg"
              className="gap-2 bg-white border-2 border-[#d3ae6e] text-[#d3ae6e] hover:bg-[#d3ae6e]/10 shadow-md transition-all duration-200 hover:shadow-lg text-sm sm:text-base font-medium px-4 sm:px-6 py-3 sm:py-5 w-full sm:w-auto"
            >
              <Weight className="h-5 w-5" />
              Add by Weight
            </Button>
          )}

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="gap-2 bg-[#d3ae6e] hover:bg-[#c09c5c] text-white shadow-md transition-all duration-200 hover:shadow-lg text-sm sm:text-base font-medium px-4 sm:px-6 py-3 sm:py-5 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Add New Variant
          </Button>
        </div>
      </div>

      {variants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-10 border-2 border-dashed border-[#d3ae6e] rounded-xl bg-amber-50 shadow-sm"
        >
          <div className="bg-[#d3ae6e]/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-[#d3ae6e]" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-3">No variants added yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-base">
            Add different variants of your product like 250g, 500g, or 1kg. Each variant needs its own SKU and price.
          </p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="gap-2 bg-[#d3ae6e] hover:bg-[#c09c5c] text-white shadow-md transition-all duration-200 hover:shadow-lg text-sm sm:text-base font-medium px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Add Your First Variant
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <AnimatePresence>
            {variants.map((variant, index) => {
              const hasErrors = variantErrors[variant.id] && Object.keys(variantErrors[variant.id]).length > 0
              const hasSKUError = hasErrors && variantErrors[variant.id]?.sku

              return (
                <motion.div
                  key={`variant-${variant.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  className="transition-all duration-200"
                >
                  <Card
                    className={cn(
                      "overflow-hidden border-2 shadow-sm hover:shadow-md transition-all duration-200 w-full max-w-none",
                      hasErrors
                        ? "border-red-500 bg-red-50 ring-2 ring-red-300 ring-opacity-50"
                        : "border-[#d3ae6e] hover:border-[#c09c5c]",
                    )}
                  >
                    <CardHeader
                      className={cn(
                        "p-3 sm:p-4 pb-2 border-b",
                        hasErrors
                          ? "bg-red-100 border-red-200 border-b-red-300"
                          : "bg-gradient-to-r from-[#d3ae6e]/20 to-[#d3ae6e]/10",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle
                            className={cn("text-lg font-medium flex items-center", hasErrors ? "text-red-600" : "")}
                          >
                            {variant.variant_name}
                            {variant.status === "active" && !hasErrors && (
                              <CheckCircle2 className="h-4 w-4 text-green-500 ml-1.5" />
                            )}
                            {hasErrors && (
                              <div className="flex items-center ml-1.5">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <span className="ml-1 text-xs bg-red-100 px-1.5 py-0.5 rounded text-red-700 font-medium">
                                  Fix Required
                                </span>
                              </div>
                            )}
                          </CardTitle>
                          <CardDescription
                            className={cn(
                              "text-sm flex items-center mt-1",
                              hasSKUError ? "text-red-600 font-medium" : "",
                            )}
                          >
                            <Tag className={cn("h-4 w-4 mr-1", hasSKUError ? "text-red-500" : "text-gray-400")} />
                            <span className="flex items-center">
                              SKU: <span className="font-medium ml-1">{variant.sku}</span>
                              {hasSKUError && <AlertCircle className="h-4 w-4 text-red-500 ml-1.5" />}
                            </span>
                          </CardDescription>
                        </div>

                        <div className="flex flex-col items-end">
                          {variant.status === "active" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-1">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mb-1">
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Inactive
                            </Badge>
                          )}

                          {hasErrors && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(variant)}
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 mt-1"
                            >
                              <AlertCircle className="h-3.5 w-3.5 mr-1" />
                              Fix Issues
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {/* Error message section */}
                    {renderErrorSummary(variant.id)}

                    <CardContent className="p-3 sm:p-4 pt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          className={cn(
                            "bg-[#d3ae6e]/10 p-3 rounded-md",
                            hasErrors && variantErrors[variant.id]?.price ? "bg-red-50 border border-red-200" : "",
                          )}
                        >
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            Regular Price
                          </div>
                          <p
                            className={cn(
                              "font-medium text-gray-900 text-lg",
                              hasErrors && variantErrors[variant.id]?.price ? "text-red-600" : "",
                            )}
                          >
                            ₹{formatPrice(variant.price)}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "bg-[#d3ae6e]/10 p-3 rounded-md",
                            hasErrors && variantErrors[variant.id]?.sale_price ? "bg-red-50 border border-red-200" : "",
                          )}
                        >
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Percent className="h-4 w-4 mr-1" />
                            Sale Price
                          </div>
                          <div className="flex items-center">
                            <p
                              className={cn(
                                "font-medium text-gray-900 text-lg",
                                hasErrors && variantErrors[variant.id]?.sale_price ? "text-red-600" : "",
                              )}
                            >
                              {variant.sale_price ? `₹${formatPrice(variant.sale_price)}` : "-"}
                            </p>
                            <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs px-1.5 py-0.5 h-5 flex items-center whitespace-nowrap">
                              {calculateDiscountPercentage(variant.price, variant.sale_price)}% off
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div
                          className={cn(
                            "bg-[#d3ae6e]/10 p-3 rounded-md",
                            hasErrors && variantErrors[variant.id]?.weight ? "bg-red-50 border border-red-200" : "",
                          )}
                        >
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Scale className="h-4 w-4 mr-1" />
                            Weight
                          </div>
                          <p
                            className={cn(
                              "font-medium text-gray-900 text-lg",
                              hasErrors && variantErrors[variant.id]?.weight ? "text-red-600" : "",
                            )}
                          >
                            {variant.weight} {variant.weight_unit}
                          </p>
                        </div>

                        <div
                          className={cn(
                            "mt-0 text-sm text-gray-600 bg-[#d3ae6e]/10 p-3 rounded-md",
                            hasErrors &&
                              (variantErrors[variant.id]?.min_order_quantity ||
                                variantErrors[variant.id]?.max_order_quantity)
                              ? "bg-red-50 border border-red-200"
                              : "",
                          )}
                        >
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Package className="h-4 w-4 mr-1" />
                            Order Limits
                          </div>
                          <div className="flex justify-between">
                            <span>
                              Min:{" "}
                              <span
                                className={cn(
                                  "font-medium",
                                  hasErrors && variantErrors[variant.id]?.min_order_quantity ? "text-red-600" : "",
                                )}
                              >
                                {variant.min_order_quantity}
                              </span>
                            </span>
                            <span>
                              Max:{" "}
                              <span
                                className={cn(
                                  "font-medium",
                                  hasErrors && variantErrors[variant.id]?.max_order_quantity ? "text-red-600" : "",
                                )}
                              >
                                {variant.max_order_quantity}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-2 sm:p-3 pt-2 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 border-t border-[#d3ae6e]/20">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 w-full sm:w-auto"
                        onClick={() => confirmDelete(variant)}
                      >
                        <Trash2 className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                        Delete
                      </Button>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200 flex-1 sm:flex-none"
                          onClick={() => openQuickView(variant)}
                        >
                          <Eye className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm text-[#d3ae6e] hover:bg-[#d3ae6e]/10 hover:text-[#c09c5c] border-[#d3ae6e]/30 flex-1 sm:flex-none"
                          onClick={() => startEditing(variant)}
                        >
                          <Edit className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#d3ae6e]/10 to-[#d3ae6e]/5 p-5 rounded-xl border border-[#d3ae6e]/30 shadow-sm">
        <div className="flex">
          <Info className="h-6 w-6 text-[#d3ae6e] mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-medium text-gray-800 mb-1">What are product variants?</h3>
            <p className="text-base text-gray-600">
              Product variants let you sell the same product in different weights or packages. Each variant must have
              its own unique SKU code.
            </p>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-white bg-opacity-70 p-3 rounded-md border border-[#d3ae6e]/30">
                <span className="font-medium text-gray-700 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1.5 text-[#d3ae6e]" />
                  Different Prices
                </span>
                <span className="text-gray-600">
                  Set different prices for each variant (e.g., higher price for larger variants)
                </span>
              </div>
              <div className="bg-white bg-opacity-70 p-3 rounded-md border border-[#d3ae6e]/30">
                <span className="font-medium text-gray-700 flex items-center">
                  <Tag className="h-4 w-4 mr-1.5 text-[#d3ae6e]" />
                  Unique SKU Codes
                </span>
                <span className="text-gray-600">
                  Each variant needs its own SKU code that is not used anywhere else
                </span>
              </div>
              <div className="bg-white bg-opacity-70 p-3 rounded-md border border-[#d3ae6e]/30">
                <span className="font-medium text-gray-700 flex items-center">
                  <Shield className="h-4 w-4 mr-1.5 text-[#d3ae6e]" />
                  Order Limits
                </span>
                <span className="text-gray-600">Control how many of each variant a customer can order at once</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Variant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl flex items-center">
              <Plus className="h-6 w-6 mr-2 text-[#d3ae6e]" />
              Add New Variant
            </DialogTitle>
            <DialogDescription className="text-base">Create a new variant for this product</DialogDescription>
          </DialogHeader>
          {isLoadingSKUs && (
            <div className="flex items-center justify-center py-3 text-base text-[#d3ae6e] bg-[#d3ae6e]/10 rounded-md border border-[#d3ae6e]/30">
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Loading product data...
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 py-2 overflow-y-auto pr-2 flex-grow">
            <div className="space-y-2">
              <Label htmlFor="variant-name" className="text-base font-medium flex items-center">
                Variant Name <span className="text-red-500 ml-1">*</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-sm">For example: Small (250g), Medium (500g), Large (1kg)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="variant-name"
                value={newVariant.variant_name}
                onChange={(e) => setNewVariant({ ...newVariant, variant_name: e.target.value })}
                className={`text-base p-4 ${errors.variant_name ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                placeholder="e.g. 500g, 1kg, Family Pack"
              />
              {errors.variant_name && <p className="text-sm text-red-600 mt-1">{errors.variant_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-sku" className="text-base font-medium flex items-center">
                SKU Code <span className="text-red-500 ml-1">*</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[250px] text-sm">
                        A unique code for this product variant. It must not be used by any other product in the system.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  id="variant-sku"
                  value={newVariant.sku}
                  onChange={(e) => {
                    const newSku = e.target.value
                    setNewVariant({ ...newVariant, sku: newSku })
                    handleSKUChange(newSku, "new-variant")
                  }}
                  className={`text-base p-4 pl-10 pr-12 ${
                    errors.sku || (skuValidationResults["new-variant"] && !skuValidationResults["new-variant"].isValid)
                      ? "border-red-500 focus-visible:ring-red-500"
                      : skuValidationResults["new-variant"] && skuValidationResults["new-variant"].isValid
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "focus-visible:ring-[#d3ae6e]"
                  }`}
                  placeholder="e.g. KK-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidatingSKU["new-variant"] && <Loader2 className="animate-spin h-5 w-5 text-[#d3ae6e]" />}
                  {!isValidatingSKU["new-variant"] &&
                    skuValidationResults["new-variant"] &&
                    skuValidationResults["new-variant"].isValid && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {!isValidatingSKU["new-variant"] &&
                    skuValidationResults["new-variant"] &&
                    !skuValidationResults["new-variant"].isValid && <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
              {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
              {skuValidationResults["new-variant"] &&
                !skuValidationResults["new-variant"].isValid &&
                !isValidatingSKU["new-variant"] && (
                  <div className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>{skuValidationResults["new-variant"].message}</span>
                  </div>
                )}
              {skuValidationResults["new-variant"] &&
                skuValidationResults["new-variant"].isValid &&
                !isValidatingSKU["new-variant"] && (
                  <div className="text-sm text-green-600 mt-1 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    This SKU is available and can be used
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
              <div className="space-y-2">
                <Label htmlFor="variant-price" className="text-base font-medium flex items-center">
                  Price (₹) <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="flex">
                  <div className="flex items-center justify-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3">
                    <span className="text-gray-600 font-medium text-lg">₹</span>
                  </div>
                  <Input
                    id="variant-price"
                    type="number"
                    step="0.01"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                    className={`rounded-l-none text-base p-4 ${errors.price ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-sale-price" className="text-base font-medium">
                  Sale Price (₹) <span className="text-gray-400 ml-1 font-normal">(Optional)</span>
                </Label>
                <div className="flex">
                  <div className="flex items-center justify-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3">
                    <span className="text-gray-600 font-medium text-lg">₹</span>
                  </div>
                  <Input
                    id="variant-sale-price"
                    type="number"
                    step="0.01"
                    value={newVariant.sale_price}
                    onChange={(e) => setNewVariant({ ...newVariant, sale_price: e.target.value })}
                    className={`rounded-l-none text-base p-4 ${errors.sale_price ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.sale_price && <p className="text-sm text-red-600 mt-1">{errors.sale_price}</p>}
                {newVariant.price &&
                  newVariant.sale_price &&
                  Number(newVariant.sale_price) < Number(newVariant.price) && (
                    <p className="text-green-600 text-sm flex items-center mt-1">
                      <Sparkles className="h-4 w-4 mr-1" />
                      {calculateDiscountPercentage(newVariant.price, newVariant.sale_price)}% discount
                    </p>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="variant-weight" className="text-base font-medium flex items-center">
                  Weight <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="variant-weight"
                  type="number"
                  step="0.001"
                  value={newVariant.weight}
                  onChange={(e) => setNewVariant({ ...newVariant, weight: e.target.value })}
                  className={`text-base p-4 ${errors.weight ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                  placeholder="0.000"
                />
                {errors.weight && <p className="text-sm text-red-600 mt-1">{errors.weight}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-weight-unit" className="text-base font-medium flex items-center">
                  Unit <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={newVariant.weight_unit}
                  onValueChange={(value) => setNewVariant({ ...newVariant, weight_unit: value })}
                >
                  <SelectTrigger id="variant-weight-unit" className="text-base p-4 focus:ring-[#d3ae6e]">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">grams (g)</SelectItem>
                    <SelectItem value="kg">kilograms (kg)</SelectItem>
                    <SelectItem value="mg">milligrams (mg)</SelectItem>
                    <SelectItem value="lb">pounds (lb)</SelectItem>
                    <SelectItem value="oz">ounces (oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Order quantity fields - Min only for super admin, Max for all */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
              {isSuperAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="variant-min-order" className="text-base font-medium flex items-center">
                    Minimum Order <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="variant-min-order"
                    type="number"
                    min="1"
                    value={newVariant.min_order_quantity}
                    onChange={(e) => setNewVariant({ ...newVariant, min_order_quantity: e.target.value })}
                    className={`text-base p-4 ${errors.min_order_quantity ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                    placeholder="1"
                  />
                  {errors.min_order_quantity && (
                    <p className="text-sm text-red-600 mt-1">{errors.min_order_quantity}</p>
                  )}
                </div>
              )}

              <div className={`space-y-2 ${!isSuperAdmin ? "md:col-span-1" : ""}`}>
                <Label htmlFor="variant-max-order" className="text-base font-medium flex items-center">
                  Maximum Order <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="variant-max-order"
                  type="number"
                  min="1"
                  value={newVariant.max_order_quantity}
                  onChange={(e) => setNewVariant({ ...newVariant, max_order_quantity: e.target.value })}
                  className={`text-base p-4 ${errors.max_order_quantity ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                  placeholder="10"
                />
                {errors.max_order_quantity && <p className="text-sm text-red-600 mt-1">{errors.max_order_quantity}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-status" className="text-base font-medium">
                  Status
                </Label>
                <Select
                  value={newVariant.status}
                  onValueChange={(value) => setNewVariant({ ...newVariant, status: value })}
                >
                  <SelectTrigger id="variant-status" className="text-base p-4 focus:ring-[#d3ae6e]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isSuperAdmin && (
              <>
                <div className="space-y-2 pt-2 border-t border-gray-200 mt-2">
                  <div className="flex items-center">
                    <Label className="text-base font-medium">Dimensions (Super Admin Only)</Label>
                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-500 border-blue-200 text-xs">
                      Optional
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="variant-length" className="text-sm text-gray-500 flex items-center">
                        Length (cm)
                      </Label>
                      <div className="relative">
                        <Input
                          id="variant-length"
                          type="number"
                          step="0.1"
                          value={newVariant.length}
                          onChange={(e) => setNewVariant({ ...newVariant, length: e.target.value })}
                          className="focus-visible:ring-[#d3ae6e]"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="variant-width" className="text-sm text-gray-500 flex items-center">
                        Width (cm)
                      </Label>
                      <div className="relative">
                        <Input
                          id="variant-width"
                          type="number"
                          step="0.1"
                          value={newVariant.width}
                          onChange={(e) => setNewVariant({ ...newVariant, width: e.target.value })}
                          className="focus-visible:ring-[#d3ae6e]"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="variant-height" className="text-sm text-gray-500 flex items-center">
                        Height (cm)
                      </Label>
                      <div className="relative">
                        <Input
                          id="variant-height"
                          type="number"
                          step="0.1"
                          value={newVariant.height}
                          onChange={(e) => setNewVariant({ ...newVariant, height: e.target.value })}
                          className="focus-visible:ring-[#d3ae6e]"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-gray-200 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setErrors({})
              }}
              className="mr-2 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddVariant}
              className="bg-[#d3ae6e] hover:bg-[#c09c5c] text-white"
              disabled={isValidatingSKU["new-variant"]}
            >
              {isValidatingSKU["new-variant"] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Variant Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95vh] flex flex-col overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl flex items-center">
              <Edit className="h-6 w-6 mr-2 text-[#d3ae6e]" />
              Edit Variant
            </DialogTitle>
            <DialogDescription className="text-base">Update this variant</DialogDescription>
          </DialogHeader>

          {editingVariant && (
            <div className="grid grid-cols-1 gap-4 py-2 overflow-y-auto pr-2 flex-grow">
              <div className="space-y-2">
                <Label htmlFor="edit-variant-name" className="text-base font-medium flex items-center">
                  Variant Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="edit-variant-name"
                  value={editingVariant.variant_name}
                  onChange={(e) => setEditingVariant({ ...editingVariant, variant_name: e.target.value })}
                  className={`text-base p-4 ${errors.variant_name ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                  placeholder="e.g. 500g, 1kg, Family Pack"
                />
                {errors.variant_name && <p className="text-sm text-red-600 mt-1">{errors.variant_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-variant-sku" className="text-base font-medium flex items-center">
                  SKU Code <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Input
                    id="edit-variant-sku"
                    value={editingVariant.sku}
                    onChange={(e) => {
                      const newSku = e.target.value
                      setEditingVariant({ ...editingVariant, sku: newSku })
                      handleSKUChange(newSku, editingVariant.id)
                    }}
                    className={`text-base p-4 pl-10 pr-12 ${
                      errors.sku ||
                      (skuValidationResults[editingVariant.id] && !skuValidationResults[editingVariant.id].isValid)
                        ? "border-red-500 focus-visible:ring-red-500"
                        : skuValidationResults[editingVariant.id] && skuValidationResults[editingVariant.id].isValid
                          ? "border-green-500 focus-visible:ring-green-500"
                          : "focus-visible:ring-[#d3ae6e]"
                    }`}
                    placeholder="e.g. RS-PROD-001-500G"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidatingSKU[editingVariant.id] && <Loader2 className="animate-spin h-5 w-5 text-[#d3ae6e]" />}
                    {!isValidatingSKU[editingVariant.id] &&
                      skuValidationResults[editingVariant.id] &&
                      skuValidationResults[editingVariant.id].isValid && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    {!isValidatingSKU[editingVariant.id] &&
                      skuValidationResults[editingVariant.id] &&
                      !skuValidationResults[editingVariant.id].isValid && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                  </div>
                </div>
                {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
                {skuValidationResults[editingVariant.id] &&
                  !skuValidationResults[editingVariant.id].isValid &&
                  !isValidatingSKU[editingVariant.id] && (
                    <div className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span>{skuValidationResults[editingVariant.id].message}</span>
                    </div>
                  )}
                {skuValidationResults[editingVariant.id] &&
                  skuValidationResults[editingVariant.id].isValid &&
                  !isValidatingSKU[editingVariant.id] && (
                    <div className="text-sm text-green-600 mt-1 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      This SKU is available and can be used
                    </div>
                  )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="edit-variant-price" className="text-base font-medium flex items-center">
                    Price (₹) <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex">
                    <div className="flex items-center justify-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3">
                      <span className="text-gray-600 font-medium text-lg">₹</span>
                    </div>
                    <Input
                      id="edit-variant-price"
                      type="number"
                      step="0.01"
                      value={editingVariant.price}
                      onChange={(e) => setEditingVariant({ ...editingVariant, price: e.target.value })}
                      className={`rounded-l-none text-base p-4 ${errors.price ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-variant-sale-price" className="text-base font-medium">
                    Sale Price (₹) <span className="text-gray-400 ml-1 font-normal">(Optional)</span>
                  </Label>
                  <div className="flex">
                    <div className="flex items-center justify-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3">
                      <span className="text-gray-600 font-medium text-lg">₹</span>
                    </div>
                    <Input
                      id="edit-variant-sale-price"
                      type="number"
                      step="0.01"
                      value={editingVariant.sale_price}
                      onChange={(e) => setEditingVariant({ ...editingVariant, sale_price: e.target.value })}
                      className={`rounded-l-none text-base p-4 ${errors.sale_price ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.sale_price && <p className="text-sm text-red-600 mt-1">{errors.sale_price}</p>}
                  {editingVariant.price &&
                    editingVariant.sale_price &&
                    Number(editingVariant.sale_price) < Number(editingVariant.price) && (
                      <p className="text-green-600 text-sm flex items-center mt-1">
                        <Sparkles className="h-4 w-4 mr-1" />
                        {calculateDiscountPercentage(editingVariant.price, editingVariant.sale_price)}% discount
                      </p>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-variant-weight" className="text-base font-medium flex items-center">
                    Weight <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="edit-variant-weight"
                    type="number"
                    step="0.001"
                    value={editingVariant.weight}
                    onChange={(e) => setEditingVariant({ ...editingVariant, weight: e.target.value })}
                    className={`text-base p-4 ${errors.weight ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                    placeholder="0.000"
                  />
                  {errors.weight && <p className="text-sm text-red-600 mt-1">{errors.weight}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-variant-weight-unit" className="text-base font-medium flex items-center">
                    Unit <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={editingVariant.weight_unit}
                    onChange={(value) => setEditingVariant({ ...editingVariant, weight_unit: value })}
                  >
                    <SelectTrigger id="edit-variant-weight-unit" className="text-base p-4 focus:ring-[#d3ae6e]">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">grams (g)</SelectItem>
                      <SelectItem value="kg">kilograms (kg)</SelectItem>
                      <SelectItem value="mg">milligrams (mg)</SelectItem>
                      <SelectItem value="lb">pounds (lb)</SelectItem>
                      <SelectItem value="oz">ounces (oz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order quantity fields - Min only for super admin, Max for all */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
                {isSuperAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-variant-min-order" className="text-base font-medium flex items-center">
                      Minimum Order <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-variant-min-order"
                      type="number"
                      min="1"
                      value={editingVariant.min_order_quantity}
                      onChange={(e) => setEditingVariant({ ...editingVariant, min_order_quantity: e.target.value })}
                      className={`text-base p-4 ${errors.min_order_quantity ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                      placeholder="1"
                    />
                    {errors.min_order_quantity && (
                      <p className="text-sm text-red-600 mt-1">{errors.min_order_quantity}</p>
                    )}
                  </div>
                )}

                <div className={`space-y-2 ${!isSuperAdmin ? "md:col-span-1" : ""}`}>
                  <Label htmlFor="edit-variant-max-order" className="text-base font-medium flex items-center">
                    Maximum Order <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="edit-variant-max-order"
                    type="number"
                    min="1"
                    value={editingVariant.max_order_quantity}
                    onChange={(e) => setEditingVariant({ ...editingVariant, max_order_quantity: e.target.value })}
                    className={`text-base p-4 ${errors.max_order_quantity ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-[#d3ae6e]"}`}
                    placeholder="10"
                  />
                  {errors.max_order_quantity && (
                    <p className="text-sm text-red-600 mt-1">{errors.max_order_quantity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-variant-status" className="text-base font-medium">
                    Status
                  </Label>
                  <Select
                    value={editingVariant.status}
                    onChange={(value) => setEditingVariant({ ...editingVariant, status: value })}
                  >
                    <SelectTrigger id="edit-variant-status" className="text-base p-4 focus:ring-[#d3ae6e]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isSuperAdmin && (
                <>
                  <div className="space-y-2 pt-2 border-t border-gray-200 mt-2">
                    <div className="flex items-center">
                      <Label className="text-base font-medium">Dimensions (Super Admin Only)</Label>
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-500 border-blue-200 text-xs">
                        Optional
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="edit-variant-length" className="text-sm text-gray-500 flex items-center">
                          Length (cm)
                        </Label>
                        <div className="relative">
                          <Input
                            id="edit-variant-length"
                            type="number"
                            step="0.1"
                            value={editingVariant.length}
                            onChange={(e) => setEditingVariant({ ...editingVariant, length: e.target.value })}
                            className="focus-visible:ring-[#d3ae6e]"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-variant-width" className="text-sm text-gray-500 flex items-center">
                          Width (cm)
                        </Label>
                        <div className="relative">
                          <Input
                            id="edit-variant-width"
                            type="number"
                            step="0.1"
                            value={editingVariant.width}
                            onChange={(e) => setEditingVariant({ ...editingVariant, width: e.target.value })}
                            className="focus-visible:ring-[#d3ae6e]"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-variant-height" className="text-sm text-gray-500 flex items-center">
                          Height (cm)
                        </Label>
                        <div className="relative">
                          <Input
                            id="edit-variant-height"
                            type="number"
                            step="0.1"
                            value={editingVariant.height}
                            onChange={(e) => setEditingVariant({ ...editingVariant, height: e.target.value })}
                            className="focus-visible:ring-[#d3ae6e]"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-gray-200 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingVariant(null)
                setErrors({})
              }}
              className="mr-2 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={saveEditedVariant}
              className="bg-[#d3ae6e] hover:bg-[#c09c5c] text-white"
              disabled={editingVariant && isValidatingSKU[editingVariant.id]}
            >
              {editingVariant && isValidatingSKU[editingVariant.id] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick View Dialog */}
      <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Eye className="h-6 w-6 mr-2 text-[#d3ae6e]" />
              Variant Details
            </DialogTitle>
          </DialogHeader>

          {quickViewVariant && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div>
                  <h3 className="text-lg font-medium">{quickViewVariant.variant_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    SKU: {quickViewVariant.sku}
                  </p>
                </div>
                {quickViewVariant.status === "active" ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#d3ae6e]/10 p-3 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">Regular Price</div>
                  <p className="font-medium text-gray-900 text-lg">₹{formatPrice(quickViewVariant.price)}</p>
                </div>

                <div className="bg-[#d3ae6e]/10 p-3 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">Sale Price</div>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-900 text-lg">
                      {quickViewVariant.sale_price ? `₹${formatPrice(quickViewVariant.sale_price)}` : "-"}
                    </p>
                    {quickViewVariant.sale_price && quickViewVariant.sale_price < quickViewVariant.price && (
                      <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">
                        {calculateDiscountPercentage(quickViewVariant.price, quickViewVariant.sale_price)}% off
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#d3ae6e]/10 p-3 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">Weight</div>
                  <p className="font-medium text-gray-900 text-lg">
                    {quickViewVariant.weight} {quickViewVariant.weight_unit}
                  </p>
                </div>

                <div className="bg-[#d3ae6e]/10 p-3 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">Order Limits</div>
                  <div className="flex justify-between">
                    <span>
                      Min: <span className="font-medium">{quickViewVariant.min_order_quantity}</span>
                    </span>
                    <span>
                      Max: <span className="font-medium">{quickViewVariant.max_order_quantity}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                  onClick={() => {
                    setIsQuickViewOpen(false)
                    confirmDelete(quickViewVariant)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#d3ae6e] hover:bg-[#d3ae6e]/10 hover:text-[#c09c5c] border-[#d3ae6e]/30"
                  onClick={() => {
                    setIsQuickViewOpen(false)
                    startEditing(quickViewVariant)
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickViewOpen(false)}
                  className="border-gray-300"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center text-red-600">
              <Trash2 className="h-6 w-6 mr-2" />
              Delete Variant
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete this variant? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {variantToDelete && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <h4 className="font-medium text-gray-900">{variantToDelete.variant_name}</h4>
                <p className="text-sm text-gray-600 mt-1">SKU: {variantToDelete.sku}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Price: ₹{formatPrice(variantToDelete.price)}
                  {variantToDelete.sale_price && (
                    <span className="ml-2">Sale: ₹{formatPrice(variantToDelete.sale_price)}</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Weight: {variantToDelete.weight} {variantToDelete.weight_unit}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="mr-2 border-gray-300">
              Cancel
            </Button>
            <Button onClick={handleDeleteVariant} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weight-based Variant Dialog */}
      <Dialog open={isWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Weight className="h-6 w-6 mr-2 text-[#d3ae6e]" />
              Add Variant by Weight
            </DialogTitle>
            <DialogDescription className="text-base">
              Create a new variant based on an existing one with proportional pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="base-variant" className="text-base font-medium">
                Base Variant <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={weightVariantData.baseVariant?.id}
                onValueChange={(value) => {
                  const selectedVariant = variants.find((v) => v.id === value)
                  setWeightVariantData({
                    ...weightVariantData,
                    baseVariant: selectedVariant,
                  })
                }}
              >
                <SelectTrigger id="base-variant" className="text-base p-4 focus:ring-[#d3ae6e]">
                  <SelectValue placeholder="Select a base variant" />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="font-medium truncate">{variant.variant_name}</span>
                        <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                          {variant.weight}
                          {variant.weight_unit} - ₹{formatPrice(variant.price)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-weight" className="text-base font-medium">
                  New Weight <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="new-weight"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={weightVariantData.weight}
                  onChange={(e) =>
                    setWeightVariantData({
                      ...weightVariantData,
                      weight: e.target.value,
                    })
                  }
                  className="text-base p-4 focus-visible:ring-[#d3ae6e]"
                  placeholder="0.000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-weight-unit" className="text-base font-medium">
                  Unit <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={weightVariantData.weight_unit}
                  onChange={(value) =>
                    setWeightVariantData({
                      ...weightVariantData,
                      weight_unit: value,
                    })
                  }
                >
                  <SelectTrigger id="new-weight-unit" className="text-base p-4 focus:ring-[#d3ae6e]">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">grams (g)</SelectItem>
                    <SelectItem value="kg">kilograms (kg)</SelectItem>
                    <SelectItem value="mg">milligrams (mg)</SelectItem>
                    <SelectItem value="lb">pounds (lb)</SelectItem>
                    <SelectItem value="oz">ounces (oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {weightVariantData.baseVariant &&
              weightVariantData.weight &&
              !isNaN(Number(weightVariantData.weight)) &&
              Number(weightVariantData.weight) > 0 && (
                <div className="bg-[#d3ae6e]/10 p-4 rounded-md border border-[#d3ae6e]/30">
                  <h4 className="font-medium text-gray-800 mb-2">Preview of New Variant</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium ml-1">
                        {weightVariantData.weight}
                        {weightVariantData.weight_unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium ml-1">
                        {generateSkuForWeight(
                          weightVariantData.baseVariant.sku,
                          weightVariantData.weight,
                          weightVariantData.weight_unit,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium ml-1">
                        ₹
                        {calculatePriceForWeight(
                          weightVariantData.baseVariant.price,
                          weightVariantData.baseVariant.weight,
                          weightVariantData.weight,
                          weightVariantData.baseVariant.weight_unit,
                          weightVariantData.weight_unit,
                        )}
                      </span>
                    </div>
                    {weightVariantData.baseVariant.sale_price && (
                      <div>
                        <span className="text-gray-600">Sale Price:</span>
                        <span className="font-medium ml-1">
                          ₹
                          {calculatePriceForWeight(
                            weightVariantData.baseVariant.sale_price,
                            weightVariantData.baseVariant.weight,
                            weightVariantData.weight,
                            weightVariantData.baseVariant.weight_unit,
                            weightVariantData.weight_unit,
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          <DialogFooter className="pt-4 border-t border-gray-200 mt-4">
            <Button variant="outline" onClick={() => setIsWeightDialogOpen(false)} className="mr-2 border-gray-300">
              Cancel
            </Button>
            <Button
              onClick={generateWeightBasedVariant}
              className="bg-[#d3ae6e] hover:bg-[#c09c5c] text-white"
              disabled={
                !weightVariantData.baseVariant ||
                !weightVariantData.weight ||
                isNaN(Number(weightVariantData.weight)) ||
                Number(weightVariantData.weight) <= 0
              }
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VariantTab
