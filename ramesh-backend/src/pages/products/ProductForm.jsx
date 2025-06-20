"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useProduct } from "../../contexts/ProductContext"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  Info,
  Loader2,
  FileText,
  Receipt,
  ClipboardList,
  Apple,
  Star,
  Layers,
  Tag,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import GeneralTab from "./tabs/GeneralTab"
import TaxDetailsTab from "./tabs/TaxDetailsTab"
import DetailsTab from "./tabs/DetailsTab"
import NutritionInfoTab from "./tabs/NutritionInfoTab"
import ExtraDetailsTab from "./tabs/ExtraDetailsTab"
import VariantTab from "./tabs/VariantTab"
import TagsTab from "./tabs/TagsTab"
import ImagesTab from "./tabs/ImagesTab"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "react-toastify"
import { Progress } from "@/components/ui/progress"
import productService from "../../services/productService"

// Initial form state - moved outside component to use as reset value
const initialFormState = {
  name: "",
  description: "",
  category_id: "",
  subcategory_id: "",
  product_type: "global", // NEW FIELD with default value
  status: "active",
  price: "",
  sale_price: "",
  tax_class: "standard",
  tax_status: "taxable",
  tax_rate: "",
  hsn_code: "",
  sku: "",
  stock_quantity: "",
  weight: "",
  shelf_life: "",
  is_vegetarian: true,
  ingredients: "",
  dimensions: {
    length: "",
    width: "",
    height: "",
  },
  nutrition_info: {
    calories: "",
    fat: "",
    carbohydrates: "",
    protein: "",
    sugar: "",
    sodium: "",
  },
  is_featured: false,
  is_new: false,
  is_popular: false,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  variants: [],
  tags: [],
  images: [],
  storage_instructions: "",
  imageOperations: {
    keep_existing_images: true,
    delete_image_ids: [],
    image_ids: [],
    image_order: [],
    primary_image_id: null,
  },
}

const ProductForm = ({ isEdit = false }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const {
    currentProduct,
    loading,
    error,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    clearCurrentProduct,
  } = useProduct()

  const [activeTab, setActiveTab] = useState("general")
  const [formData, setFormData] = useState({ ...initialFormState })
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [allProducts, setAllProducts] = useState([])
  const [allVariants, setAllVariants] = useState([])

  // Add a ref for the variant tab component to handle specific variant errors
  const variantTabRef = useRef(null)

  // Track if this is the first render
  const [isFirstRender, setIsFirstRender] = useState(true)

  // Progress tracking
  const [showProgress, setShowProgress] = useState(false)
  const [progressStatus, setProgressStatus] = useState("")
  const [progressValue, setProgressValue] = useState(0)
  const [progressSteps, setProgressSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)

  // Delete type state
  const [deleteType, setDeleteType] = useState("soft")

  // Reset form data when component mounts in create mode
  useEffect(() => {
    // Clear form data and reset state on first render
    if (!isEdit) {
      // Reset form to initial state
      setFormData({ ...initialFormState })
      // Clear any existing product data
      clearCurrentProduct()
      // Reset form errors
      setFormErrors({})
      // Reset active tab
      setActiveTab("general")
      // Reset progress tracking
      setShowProgress(false)
      setProgressValue(0)
      setCurrentStep(0)
    }

    // Mark that first render is complete
    setIsFirstRender(false)
  }, [location.pathname])

  // Load product data if editing
  useEffect(() => {
    if (isEdit && id) {
      getProduct(id)

      // Pre-fetch all SKUs for validation when editing a product
      const fetchAllSKUs = async () => {
        try {
          await productService.getAllProductSKUs()
          console.log("Pre-fetched all SKUs for validation")
        } catch (error) {
          console.error("Failed to pre-fetch SKUs:", error)
        }
      }

      fetchAllSKUs()
    } else {
      clearCurrentProduct()

      // Also pre-fetch all SKUs for validation when creating a new product
      const fetchAllSKUs = async () => {
        try {
          await productService.getAllProductSKUs()
          console.log("Pre-fetched all SKUs for validation")
        } catch (error) {
          console.error("Failed to pre-fetch SKUs:", error)
        }
      }

      fetchAllSKUs()
    }

    return () => {
      clearCurrentProduct()
    }
  }, [isEdit, id])

  // Check for copied product data in localStorage
  useEffect(() => {
    if (!isEdit && !id) {
      // Small delay to ensure form is properly reset first
      const timeoutId = setTimeout(() => {
        const copyProductData = localStorage.getItem("copyProductData")
        if (copyProductData) {
          try {
            const productData = JSON.parse(copyProductData)

            // Pre-fill the form with copied data
            setFormData((prevData) => {
              // Create a new object with copied data but remove the id and other unique fields
              const newData = {
                ...prevData,
                name: "", // Leave name empty for user to fill
                category_id: productData.category_id ? productData.category_id.toString() : "",
                subcategory_id: productData.subcategory_id ? productData.subcategory_id.toString() : "",
                product_type: productData.product_type || "global", // Include product_type
                description: productData.description || "",
                hsn_code: productData.hsn_code || "",
                tax_rate: productData.tax_rate || "",
                shelf_life: productData.shelf_life || "",
                status: productData.status || "active",
                is_vegetarian: productData.is_vegetarian !== undefined ? productData.is_vegetarian : true,
                storage_instructions: productData.storage_instructions || "",
                meta_title: productData.meta_title || "",
                meta_description: productData.meta_description || "",
                meta_keywords: productData.meta_keywords || "",
              }

              // Handle ingredients
              if (productData.ingredients) {
                if (typeof productData.ingredients === "string") {
                  newData.ingredients = productData.ingredients
                } else if (Array.isArray(productData.ingredients_array)) {
                  newData.ingredients = productData.ingredients_array.join(", ")
                }
              }

              // Handle nutritional info
              if (productData.nutritional_info_object || productData.nutrition_info) {
                const nutritionData = productData.nutritional_info_object || productData.nutrition_info || {}
                newData.nutrition_info = {
                  calories: nutritionData.calories || "",
                  fat: nutritionData.fat || "",
                  carbohydrates: nutritionData.carbohydrates || "",
                  protein: nutritionData.protein || "",
                  sugar: nutritionData.sugar || "",
                  sodium: nutritionData.sodium || "",
                }
              }

              // Handle dimensions/attributes
              if (productData.attributes_object || productData.attributes) {
                const attributesData = productData.attributes_object || productData.attributes || {}
                newData.dimensions = {
                  length: attributesData.length || "",
                  width: attributesData.width || "",
                  height: attributesData.height || "",
                }
              }

              return newData
            })

            // Handle variants
            if (productData.variants && productData.variants.length > 0) {
              // Create new variants with new IDs but keep original structure
              const newVariants = productData.variants.map((variant, index) => {
                return {
                  ...variant,
                  id: `temp-${Date.now()}-${index}`, // Generate unique temporary ID
                  product_id: undefined, // Remove product_id
                  sku: "", // Clear SKU so user can set new ones
                  variant_name: variant.variant_name || `${variant.weight}${variant.weight_unit}`,
                  price: Number.parseFloat(variant.price) || 0,
                  sale_price: variant.sale_price ? Number.parseFloat(variant.sale_price) : null,
                  weight: Number.parseFloat(variant.weight) || 0,
                  weight_unit: variant.weight_unit || "g",
                  min_order_quantity: Number.parseInt(variant.min_order_quantity) || 1,
                  max_order_quantity: Number.parseInt(variant.max_order_quantity) || 10,
                  status: variant.status || "active",
                  length: variant.length || "",
                  width: variant.width || "",
                  height: variant.height || "",
                  isNew: true, // Mark as new
                }
              })

              setFormData((prev) => ({
                ...prev,
                variants: newVariants,
              }))
            }

            // Handle tags
            if (productData.tags && productData.tags.length > 0) {
              setFormData((prev) => ({
                ...prev,
                tags: productData.tags,
              }))
            }

            // Clear the localStorage after using it
            localStorage.removeItem("copyProductData")

            // Show success message
            toast.success("Product data copied successfully. Please update the product name and SKUs.")
          } catch (error) {
            console.error("Error parsing copied product data:", error)
            toast.error("Failed to load copied product data.")
            localStorage.removeItem("copyProductData")
          }
        }
      }, 100) // Small delay to ensure form is reset first

      return () => clearTimeout(timeoutId)
    }
  }, [isEdit, id, location.pathname]) // Added location.pathname to dependencies

  // Fetch all products and variants for validation
  useEffect(() => {
    // Skip API calls for validation data
    console.log("Skipping API calls for validation data")

    // Initialize with empty arrays instead of fetching
    setAllProducts([])
    setAllVariants([])

    // If we need to fetch data in the future, uncomment this:
    /*
    const fetchValidationData = async () => {
      try {
        // Fetch all products for name validation
        const productsResponse = await productService.getAllProducts({ limit: 1000 })
        if (productsResponse.status === "success") {
          setAllProducts(productsResponse.data || [])
        }

        // Only fetch variants if we're not in edit mode
        if (!isEdit) {
          const variantsResponse = await productService.getAllVariants()
          if (variantsResponse.status === "success") {
            setAllVariants(variantsResponse.data || [])
          }
        }
      } catch (error) {
        console.error("Error fetching validation data:", error)
      }
    }

    fetchValidationData()
    */
  }, [isEdit])

  // Populate form when currentProduct changes
  useEffect(() => {
    if (isEdit && currentProduct) {
      // Extract ingredients from the array and convert to comma-separated string
      let ingredientsString = ""
      if (currentProduct.ingredients_array && Array.isArray(currentProduct.ingredients_array)) {
        ingredientsString = currentProduct.ingredients_array.join(", ")
      }

      // Ensure we have the nutritional info object
      const nutritionalInfo = currentProduct.nutritional_info_object || {}

      // Ensure we have the attributes object
      const attributesObj = currentProduct.attributes_object || {}

      // Set form data with all available fields from the API response
      setFormData({
        name: currentProduct.name || "",
        description: currentProduct.description || "",
        category_id: currentProduct.category_id ? currentProduct.category_id.toString() : "",
        subcategory_id: currentProduct.subcategory_id ? currentProduct.subcategory_id.toString() : "",
        product_type: currentProduct.product_type || "global", // NEW FIELD
        status: currentProduct.status || "active",
        price: currentProduct.price || "",
        sale_price: currentProduct.sale_price || "",
        tax_class: currentProduct.tax_class || "standard",
        tax_status: currentProduct.tax_status || "taxable",
        tax_rate: currentProduct.tax_rate || "",
        hsn_code: currentProduct.hsn_code || "",
        sku: currentProduct.sku || "",
        stock_quantity: currentProduct.stock_quantity || "",
        weight: currentProduct.weight || "",
        shelf_life: currentProduct.shelf_life || "",
        is_vegetarian: currentProduct.is_vegetarian === 1 || currentProduct.is_vegetarian === true,
        storage_instructions: currentProduct.storage_instructions || "",
        ingredients: ingredientsString,
        dimensions: {
          length: attributesObj.length || "",
          width: attributesObj.width || "",
          height: attributesObj.height || "",
        },
        nutrition_info: {
          calories: nutritionalInfo.calories || "",
          fat: nutritionalInfo.fat || "",
          carbohydrates: nutritionalInfo.carbohydrates || "",
          protein: nutritionalInfo.protein || "",
          sugar: nutritionalInfo.sugar || "",
          sodium: nutritionalInfo.sodium || "",
        },
        is_featured: currentProduct.is_featured === 1 || currentProduct.is_featured === true,
        is_new: currentProduct.is_new === 1 || currentProduct.is_new === true,
        is_popular: currentProduct.is_popular === 1 || currentProduct.is_popular === true,
        meta_title: currentProduct.meta_title || "",
        meta_description: currentProduct.meta_description || "",
        meta_keywords: currentProduct.meta_keywords || "",
        variants: Array.isArray(currentProduct.variants)
          ? currentProduct.variants.map((variant) => ({
              ...variant,
              id: variant.id.toString(),
              variant_name: variant.variant_name || "",
              price: Number.parseFloat(variant.price) || 0,
              sale_price: variant.sale_price ? Number.parseFloat(variant.sale_price) : null,
              weight: Number.parseFloat(variant.weight) || 0,
              min_order_quantity: Number.parseInt(variant.min_order_quantity) || 1,
              max_order_quantity: Number.parseInt(variant.max_order_quantity) || 10,
              status: variant.status || "active",
            }))
          : [],
        tags: Array.isArray(currentProduct.tags) ? currentProduct.tags : [],
        images: Array.isArray(currentProduct.images)
          ? currentProduct.images.map((image) => ({
              ...image,
              id: image.id ? image.id.toString() : undefined,
              is_primary: image.is_primary === 1 || image.is_primary === true,
              display_order: Number.parseInt(image.display_order) || 0,
            }))
          : [],
        imageOperations: {
          keep_existing_images: true,
          delete_image_ids: [],
          image_ids: Array.isArray(currentProduct.images) ? currentProduct.images.map((img) => img.id) : [],
          image_order: Array.isArray(currentProduct.images) ? currentProduct.images.map((img) => img.id) : [],
          primary_image_id:
            Array.isArray(currentProduct.images) && currentProduct.images.length > 0
              ? currentProduct.images.find((img) => img.is_primary === 1 || img.is_primary === true)?.id
              : null,
        },
      })
    }
  }, [isEdit, currentProduct])

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle nested object changes (dimensions, nutrition_info)
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }))
  }

  // Handle variants changes
  const handleVariantsChange = (variants) => {
    // Mark variants with changed SKUs for validation
    const variantsWithTracking = variants.map((variant) => {
      if (isEdit && !variant.isNew && variant.id) {
        // Find the original variant
        const originalVariant = currentProduct?.variants?.find((v) => v.id === variant.id)
        if (originalVariant && originalVariant.sku !== variant.sku) {
          return { ...variant, skuChanged: true }
        }
      }
      return variant
    })

    setFormData((prev) => ({
      ...prev,
      variants: variantsWithTracking,
    }))
  }

  // Handle tags changes
  const handleTagsChange = (tags) => {
    setFormData((prev) => ({
      ...prev,
      tags,
    }))
  }

  // Handle images changes - COMPREHENSIVE IMPLEMENTATION with all flags
  const handleImagesChange = (images, imageOperations = {}) => {
    console.log("handleImagesChange called with:", { images, imageOperations })

    // CRITICAL FIX: Sanitize image operations to NEVER include delete_all_images
    const sanitizedImageOperations = {
      keep_existing_images: true, // Always keep existing images
      delete_image_ids: imageOperations.delete_image_ids || [],
      image_ids: imageOperations.image_ids || [],
      image_order: imageOperations.image_order || [],
      primary_image_id: imageOperations.primary_image_id || null,
    }

    // EXPLICITLY remove delete_all_images if it exists
    delete sanitizedImageOperations.delete_all_images

    console.log("SANITIZED image operations (NO delete_all_images):", sanitizedImageOperations)

    // Update form data with images and sanitized operations
    setFormData((prev) => ({
      ...prev,
      images: images.map((img, index) => ({
        ...img,
        display_order: index,
      })),
      imageOperations: sanitizedImageOperations,
    }))
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData({ ...initialFormState })
    setFormErrors({})
    setActiveTab("general")
    clearCurrentProduct()
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    // Required fields validation
    if (!formData.name) errors.name = "Product name is required"
    if (!formData.category_id) errors.category_id = "Category is required"
    if (!formData.subcategory_id) errors.subcategory_id = "Subcategory is required"
    if (!formData.product_type) errors.product_type = "Product type is required" // NEW VALIDATION
    if (!formData.hsn_code) errors.hsn_code = "HSN Code is required"
    if (!formData.tax_rate) errors.tax_rate = "Tax Rate is required"
    if (!formData.shelf_life) errors.shelf_life = "Shelf Life is required"
    if (formData.is_vegetarian === undefined) errors.is_vegetarian = "Vegetarian status is required"

    // Skip duplicate name check since we're not fetching products
    if (formData.name && !isEdit && false) {
      // Added 'false' to skip this check
      const duplicateName = allProducts.find((product) => product.name.toLowerCase() === formData.name.toLowerCase())
      if (duplicateName) {
        errors.name = "A product with this name already exists"
        toast.error("A product with this name already exists")
      }
    }

    // Numeric field validation
    if (formData.tax_rate && isNaN(Number.parseFloat(formData.tax_rate))) errors.tax_rate = "Tax rate must be a number"

    // Variants validation
    if (!formData.variants || formData.variants.length === 0) {
      errors.variants = "At least one variant is required"
      // Highlight the variants tab if there's an error
      if (activeTab !== "variants") {
        toast.error("Please add at least one variant")
      }
    } else {
      // Check for duplicate SKUs across all variants
      const skus = formData.variants.map((v) => v.sku).filter(Boolean)
      const uniqueSkus = new Set(skus)

      if (skus.length !== uniqueSkus.size) {
        errors.variants = "Duplicate SKUs found in variants"
        toast.error("Duplicate SKUs found in variants")
      }

      // Skip duplicate SKU check since we're not fetching variants
      if (!isEdit && false) {
        // Added 'false' to skip this check
        for (const variant of formData.variants) {
          if (variant.sku) {
            const duplicateSku = allVariants.find((v) => v.sku && v.sku.toLowerCase() === variant.sku.toLowerCase())
            if (duplicateSku) {
              errors.variants = `SKU "${variant.sku}" already exists in another product`
              toast.error(`SKU "${variant.sku}" already exists in another product`)
              break
            }
          }
        }
      } else {
        // Skip duplicate SKU check for edit mode
        if (false) {
          // Added condition to skip this check
          for (const variant of formData.variants) {
            // Skip variants that already exist in this product
            if (!variant.isNew && !variant.skuChanged) continue

            if (variant.sku) {
              const duplicateSku = allVariants.find(
                (v) =>
                  v.sku && v.sku.toLowerCase() === variant.sku.toLowerCase() && v.product_id !== Number.parseInt(id),
              )
              if (duplicateSku) {
                errors.variants = `SKU "${variant.sku}" already exists in another product`
                toast.error(`SKU "${variant.sku}" already exists in another product`)
                break
              }
            }
          }
        }
      }
    }

    // Images validation
    if (!formData.images || formData.images.length === 0) {
      errors.images = "At least one image is required"
      // Highlight the images tab if there's an error
      if (activeTab !== "images") {
        toast.error("Please add at least one image")
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Add a handler function to pass to the VariantTab component
  const handleVariantError = (errorHandler) => {
    variantTabRef.current = { handleError: errorHandler }
  }

  // Parse and handle API error messages
  const handleApiError = (errorMessage) => {
    // Initialize a new errors object
    const newErrors = {}

    // If errorMessage is an object with a message property, use that message directly
    if (typeof errorMessage === "object" && errorMessage.message) {
      // Display the exact error message from the API
      toast.error(errorMessage.message)

      // Try to determine which tab to show based on the error message
      const lowerMessage = errorMessage.message.toLowerCase()

      if (lowerMessage.includes("name") || lowerMessage.includes("category")) {
        setActiveTab("general")
        if (lowerMessage.includes("name")) newErrors.name = errorMessage.message
        if (lowerMessage.includes("category")) newErrors.category_id = errorMessage.message
        if (lowerMessage.includes("subcategory")) newErrors.subcategory_id = errorMessage.message
      } else if (lowerMessage.includes("sku") || lowerMessage.includes("variant")) {
        setActiveTab("variants")
        newErrors.variants = errorMessage.message
      } else if (lowerMessage.includes("image")) {
        setActiveTab("images")
        newErrors.images = errorMessage.message
      } else if (lowerMessage.includes("hsn") || lowerMessage.includes("tax")) {
        setActiveTab("tax")
        newErrors.tax_rate = errorMessage.message
      } else if (lowerMessage.includes("shelf") || lowerMessage.includes("vegetarian")) {
        setActiveTab("details")
        newErrors.shelf_life = errorMessage.message
      }

      // Update form errors
      setFormErrors((prevErrors) => ({ ...prevErrors, ...newErrors }))
      return newErrors
    }

    // If errorMessage is a string, display it directly
    if (typeof errorMessage === "string") {
      toast.error(errorMessage)

      // Try to determine which tab to show based on the error message
      const lowerMessage = errorMessage.toLowerCase()

      if (lowerMessage.includes("name") || lowerMessage.includes("category")) {
        setActiveTab("general")
        if (lowerMessage.includes("name")) newErrors.name = errorMessage
        if (lowerMessage.includes("category")) newErrors.category_id = errorMessage
        if (lowerMessage.includes("subcategory")) newErrors.subcategory_id = errorMessage
      } else if (lowerMessage.includes("sku") || lowerMessage.includes("variant")) {
        setActiveTab("variants")
        newErrors.variants = errorMessage
      } else if (lowerMessage.includes("image")) {
        setActiveTab("images")
        newErrors.images = errorMessage
      } else if (lowerMessage.includes("hsn") || lowerMessage.includes("tax")) {
        setActiveTab("tax")
        newErrors.tax_rate = errorMessage
      } else if (lowerMessage.includes("shelf") || lowerMessage.includes("vegetarian")) {
        setActiveTab("details")
        newErrors.shelf_life = errorMessage
      }

      // Update form errors
      setFormErrors((prevErrors) => ({ ...prevErrors, ...newErrors }))
      return newErrors
    }

    // If we get here, we have an unexpected error format
    const genericErrorMessage = "An unexpected error occurred. Please try again."
    toast.error(genericErrorMessage)

    // Update form errors with a generic message
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      general: genericErrorMessage,
    }))

    return { general: genericErrorMessage }
  }

  // Initialize progress tracking
  const initializeProgress = () => {
    // Calculate total steps
    const totalSteps = 2 + formData.variants.length + formData.tags.length + formData.images.length

    // Create progress steps
    const steps = [
      { name: "Creating product", completed: false },
      ...formData.variants.map((_, index) => ({
        name: `Adding variant ${index + 1}/${formData.variants.length}`,
        completed: false,
      })),
      ...formData.tags.map((_, index) => ({
        name: `Processing tag ${index + 1}/${formData.tags.length}`,
        completed: false,
      })),
      ...formData.images.map((_, index) => ({
        name: `Uploading image ${index + 1}/${formData.images.length}`,
        completed: false,
      })),
      { name: "Finalizing product", completed: false },
    ]

    setProgressSteps(steps)
    setCurrentStep(0)
    setProgressValue(0)
    setProgressStatus("Creating product...")
    setShowProgress(true)
  }

  // Update progress
  const updateProgress = (step, status) => {
    setCurrentStep(step)

    // Mark the current step as completed
    const updatedSteps = [...progressSteps]
    if (updatedSteps[step - 1]) {
      updatedSteps[step - 1].completed = true
    }
    setProgressSteps(updatedSteps)

    // Calculate progress percentage
    const progressPercentage = Math.min(Math.round((step / progressSteps.length) * 100), 100)
    setProgressValue(progressPercentage)
    setProgressStatus(status)
  }

  // Add a new function to validate all SKUs before form submission
  const validateAllSKUs = async () => {
    if (!formData.variants || formData.variants.length === 0) {
      return { isValid: false, message: "At least one variant is required" }
    }

    setSubmitting(true)

    try {
      // Create an array of promises for each SKU validation
      const validationPromises = formData.variants.map((variant) => {
        return productService.validateSKU(variant.sku, isEdit ? id : null)
      })

      // Wait for all validations to complete
      const validationResults = await Promise.all(validationPromises)

      // Check if any validation failed
      const invalidResults = validationResults.filter((result) => !result.isValid)

      if (invalidResults.length > 0) {
        // Find the first invalid SKU for error message
        const firstInvalidResult = invalidResults[0]
        const invalidVariantIndex = validationResults.findIndex((result) => !result.isValid)
        const invalidVariant = formData.variants[invalidVariantIndex]

        // Set the active tab to variants
        setActiveTab("variants")

        // Set form error
        setFormErrors((prev) => ({
          ...prev,
          variants: `SKU "${invalidVariant.sku}" is invalid: ${firstInvalidResult.message}`,
        }))

        // Show toast error
        toast.error(`SKU validation failed: ${firstInvalidResult.message}`)

        return { isValid: false, message: firstInvalidResult.message }
      }

      // All SKUs are valid
      return { isValid: true }
    } catch (error) {
      console.error("SKU validation error:", error)
      toast.error("Failed to validate SKUs. Please try again.")
      return { isValid: false, message: "Failed to validate SKUs" }
    } finally {
      setSubmitting(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      // Find the first tab with errors and switch to it
      if (formErrors.name || formErrors.category_id || formErrors.subcategory_id) {
        setActiveTab("general")
      } else if (formErrors.hsn_code || formErrors.tax_rate) {
        setActiveTab("tax")
      } else if (formErrors.shelf_life || formErrors.is_vegetarian) {
        setActiveTab("details")
      } else if (formErrors.variants) {
        setActiveTab("variants")
      } else if (formErrors.images) {
        setActiveTab("images")
      }

      toast.error("Please fix the form errors before submitting")
      return
    }

    // First validate all SKUs with the API
    const skuValidation = await validateAllSKUs()
    if (!skuValidation.isValid) {
      return
    }

    setSubmitting(true)

    try {
      if (isEdit) {
        // Handle edit flow
        try {
          // Process ingredients - convert from comma-separated string to array and remove duplicates
          let ingredientsArray = []
          if (formData.ingredients) {
            // Split by comma, trim whitespace, and filter out empty strings
            ingredientsArray = [
              ...new Set(
                formData.ingredients
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              ),
            ]
          }

          // Prepare comprehensive data for submission
          const productData = {
            name: formData.name,
            category_id: formData.category_id,
            subcategory_id: formData.subcategory_id || "",
            product_type: formData.product_type, // NEW FIELD
            description: formData.description || "",
            hsn_code: formData.hsn_code,
            tax_rate: formData.tax_rate,
            shelf_life: formData.shelf_life,
            status: formData.status || "active",
            is_vegetarian: formData.is_vegetarian ? "1" : "0",
            storage_instructions: formData.storage_instructions || "",
            meta_title: formData.meta_title || "",
            meta_description: formData.meta_description || "",
            meta_keywords: formData.meta_keywords || "",
            // Use ingredients from the top level formData
            ingredients: JSON.stringify(ingredientsArray),
            // Fix for nutritional_info - use the correct structure with carbohydrates
            nutritional_info: JSON.stringify({
              calories: formData.nutrition_info?.calories || "",
              fat: formData.nutrition_info?.fat || "",
              carbohydrates: formData.nutrition_info?.carbohydrates || "",
              protein: formData.nutrition_info?.protein || "",
              sugar: formData.nutrition_info?.sugar || "",
              sodium: formData.nutrition_info?.sodium || "",
            }),
            // Include dimensions
            attributes: JSON.stringify({
              length: formData.dimensions?.length || "",
              width: formData.dimensions?.width || "",
              height: formData.dimensions?.height || "",
            }),
          }

          // Ensure variants are properly included and formatted
          if (formData.variants && formData.variants.length > 0) {
            // Log variants for debugging
            console.log("Variants in form submission:", formData.variants)

            // Store the variants directly in productData
            productData.variants = formData.variants

            // Double-check that variants are not empty
            if (productData.variants.length === 0) {
              toast.error("At least one product variant is required")
              setActiveTab("variants")
              setSubmitting(false)
              return
            }
          } else {
            // If no variants, show an error
            toast.error("At least one product variant is required")
            setActiveTab("variants")
            setSubmitting(false)
            return
          }

          // Include tags
          productData.tags = formData.tags

          // Include images
          productData.images = formData.images

          // CRITICAL FIX: Include ONLY the sanitized image operation flags
          if (formData.imageOperations) {
            // Always include keep_existing_images flag
            productData.keep_existing_images = "true" // Always keep existing images

            // NEVER include delete_all_images flag
            // productData.delete_all_images = "false" // REMOVED COMPLETELY

            // Include deleted image IDs if any
            if (formData.imageOperations.delete_image_ids && formData.imageOperations.delete_image_ids.length > 0) {
              productData.delete_image_ids = JSON.stringify(formData.imageOperations.delete_image_ids)
            }

            // Include image IDs to keep if any
            if (formData.imageOperations.image_ids && formData.imageOperations.image_ids.length > 0) {
              productData.image_ids = JSON.stringify(formData.imageOperations.image_ids)
            }

            // Include image order if any
            if (formData.imageOperations.image_order && formData.imageOperations.image_order.length > 0) {
              productData.image_order = JSON.stringify(formData.imageOperations.image_order)
            }

            // Include primary image ID if any
            if (formData.imageOperations.primary_image_id) {
              productData.primary_image_id = formData.imageOperations.primary_image_id.toString()
            }
          } else {
            // Fallback values if imageOperations is not set
            productData.keep_existing_images = "true"
            // NEVER set delete_all_images
          }

          // Log the productData to verify NO delete_all_images flag is included
          console.log("Product data being sent to API (NO delete_all_images):", {
            keep_existing_images: productData.keep_existing_images,
            delete_image_ids: productData.delete_image_ids,
            image_ids: productData.image_ids,
            image_order: productData.image_order,
            primary_image_id: productData.primary_image_id,
          })

          // Store original variants for comparison to determine deleted variants
          productData.originalVariants = currentProduct?.variants || []

          // Update product using the comprehensive API
          try {
            const updateResponse = await productService.updateProduct(id, productData)

            if (updateResponse.status !== "success") {
              throw updateResponse
            }

            toast.success("Product updated successfully!")

            // Reset form and navigate back to product list
            resetForm()
            navigate("/products")
          } catch (error) {
            console.error("Update product error:", error)

            // Handle different error formats
            if (error.status === "error" && error.message) {
              handleApiError(error)
            } else if (error.response && error.response.data) {
              handleApiError(error.response.data)
            } else {
              handleApiError(error.message || "Failed to update product")
            }
          }
        } catch (err) {
          console.error("Form submission error:", err)
          handleApiError(err)
        }
      } else {
        // Initialize progress tracking for create flow
        initializeProgress()

        // Step 1: Create the product
        updateProgress(1, "Creating product...")

        // Process ingredients - convert from comma-separated string to array and remove duplicates
        let ingredientsArray = []
        if (formData.ingredients) {
          // Split by comma, trim whitespace, and filter out empty strings
          ingredientsArray = [
            ...new Set(
              formData.ingredients
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          ]
        }

        // Prepare comprehensive data for submission
        const productData = {
          name: formData.name,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id || "",
          product_type: formData.product_type, // NEW FIELD
          description: formData.description || "",
          hsn_code: formData.hsn_code,
          tax_rate: formData.tax_rate,
          shelf_life: formData.shelf_life,
          status: formData.status || "active",
          is_vegetarian: formData.is_vegetarian ? "1" : "0",
          storage_instructions: formData.storage_instructions || "",
          meta_title: formData.meta_title || "",
          meta_description: formData.meta_description || "",
          meta_keywords: formData.meta_keywords || "",
          // Use ingredients from the top level formData
          ingredients: JSON.stringify(ingredientsArray),
          // Fix for nutritional_info - use the correct structure with carbohydrates
          nutritional_info: JSON.stringify({
            calories: formData.nutrition_info?.calories || "",
            carbohydrates: formData.nutrition_info?.carbohydrates || "",
            protein: formData.nutrition_info?.protein || "",
            sugar: formData.nutrition_info?.sugar || "",
            sodium: formData.nutrition_info?.sodium || "",
          }),
          // Include variants
          variants: formData.variants,
          // Include tags
          tags: formData.tags,
          // Include images
          images: formData.images,
        }

        // Create the product using the comprehensive API
        try {
          const productResponse = await productService.createProduct(productData)

          if (productResponse.status !== "success" || !productResponse.data?.id) {
            // Pass the entire response object to handleApiError
            handleApiError(productResponse)
            setShowProgress(false)
            return
          }

          // Update progress to show completion
          updateProgress(2, "Product created successfully!")

          // Success!
          setTimeout(() => {
            setShowProgress(false)
            toast.success("Product created successfully!")
            // Reset form and navigate back to product list
            resetForm()
            navigate("/products")
          }, 1000)
        } catch (error) {
          console.error("Create product error:", error)
          setShowProgress(false)

          // Pass the error directly to handleApiError
          if (error.response && error.response.data) {
            handleApiError(error.response.data)
          } else {
            handleApiError(error)
          }
        }
      }
    } catch (err) {
      console.error("Form submission error:", err)
      handleApiError(err.message || "An unexpected error occurred")
      setShowProgress(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle product deletion
  const handleDelete = async () => {
    setSubmitting(true)

    try {
      // Pass the deleteType to the deleteProduct function
      const isPermanent = deleteType === "permanent"
      const success = await deleteProduct(id, isPermanent)

      if (success) {
        toast.success(isPermanent ? "Product permanently deleted!" : "Product moved to trash!")
        resetForm()
        navigate("/products")
      }
    } catch (err) {
      console.error("Delete error:", err)

      // Extract error message from the error object
      let errorMessage = "An error occurred while deleting the product."

      // If the error comes from the API response, it might be in err.response.data.message
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      toast.error(errorMessage)
      setSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Go back
  const goBack = () => {
    resetForm()
    navigate("/products")
  }

  // Get tab status (complete, error, or normal)
  const getTabStatus = (tabName) => {
    if (tabName === "general" && (formErrors.name || formErrors.category_id || formErrors.subcategory_id)) {
      return "error"
    } else if (tabName === "tax" && (formErrors.hsn_code || formErrors.tax_rate)) {
      return "error"
    } else if (tabName === "details" && (formErrors.shelf_life || formErrors.is_vegetarian)) {
      return "error"
    } else if (tabName === "variants" && formErrors.variants) {
      return "error"
    } else if (tabName === "images" && formErrors.images) {
      return "error"
    }

    // Check if tab is complete
    if (tabName === "general" && formData.name && formData.category_id && formData.subcategory_id) {
      return "complete"
    } else if (tabName === "tax" && formData.hsn_code && formData.tax_rate) {
      return "complete"
    } else if (tabName === "details" && formData.shelf_life && formData.is_vegetarian !== undefined) {
      return "complete"
    } else if (tabName === "variants" && formData.variants && formData.variants.length > 0) {
      return "complete"
    } else if (tabName === "images" && formData.images && formData.images.length > 0) {
      return "complete"
    }

    return "normal"
  }

  // Define tab items with icons
  const tabItems = [
    { id: "general", label: "General Information", icon: <FileText className="h-5 w-5" />, required: true },
    { id: "tax", label: "GST Details", icon: <Receipt className="h-5 w-5" /> },
    { id: "details", label: "Product Details", icon: <ClipboardList className="h-5 w-5" />, required: true },
    { id: "nutrition", label: "Nutrition Information", icon: <Apple className="h-5 w-5" /> },
    { id: "extra", label: "Extra Details", icon: <Star className="h-5 w-5" /> },
    { id: "variants", label: "Variants", icon: <Layers className="h-5 w-5" /> },
    { id: "tags", label: "Tags", icon: <Tag className="h-5 w-5" /> },
    { id: "images", label: "Media", icon: <ImageIcon className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar - Responsive */}
      <div className="w-full lg:w-72 bg-white border-b lg:border-r lg:border-b-0 border-gray-200 lg:sticky lg:top-0 lg:self-start overflow-y-auto max-h-screen shadow-lg order-2 lg:order-1">
        <div className="p-2 border-b border-gray-100 bg-gradient-to-r from-ramesh-gold/10 to-ramesh-gold/5">
          <h2 className="text-lg sm:text-[22px] font-semibold text-gray-800 uppercase tracking-wider flex items-center">
            <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
            {isEdit ? "EDIT PRODUCT" : "NEW PRODUCT"}
          </h2>
        </div>

        <nav className="py-2 sm:py-4">
          <ul className="space-y-1">
            {tabItems.map((tab) => {
              const status = getTabStatus(tab.id)
              return (
                <li key={tab.id} className="relative">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-ramesh-gold/15 text-ramesh-gold border-l-2 border-ramesh-gold shadow-sm"
                        : status === "error"
                          ? "text-red-700 hover:bg-gray-50"
                          : status === "complete"
                            ? "text-gray-700 hover:bg-gray-50 border-l-2 border-green-500"
                            : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2 sm:mr-3 text-base sm:text-lg">{tab.icon}</span>
                    <span className="flex-1 text-left text-sm sm:text-base">{tab.label}</span>
                    {status === "error" && <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 ml-2" />}
                    {tab.id === "nutrition" || tab.id === "extra" || tab.id === "tags" ? (
                      <span className="ml-2 text-gray-400 text-xs px-1.5 py-0.5 bg-gray-100 rounded">Optional</span>
                    ) : null}
                    {status === "complete" && <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 ml-2" />}
                    {status === "normal" && null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-3 sm:p-5 border-t border-gray-100 mt-2 space-y-3 bg-gradient-to-r from-ramesh-gold/5 to-ramesh-gold/10">
          {!isEdit && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-ramesh-gold hover:bg-ramesh-gold/90 text-white font-medium py-2.5 shadow-md text-sm sm:text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          )}

          {isEdit && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-ramesh-gold hover:bg-ramesh-gold/90 text-white font-medium py-2.5 shadow-md text-sm sm:text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          )}

          <button
            onClick={goBack}
            className="flex items-center justify-center w-full px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Back to Products
          </button>
        </div>
      </div>

      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col order-1 lg:order-2">
        {/* Main Content Area */}
        <div className="flex-1 p-3 sm:p-6 overflow-auto relative">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-200">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm sm:text-base">{error}</div>
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md p-4 sm:p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900 flex items-center justify-center text-sm sm:text-base">
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin text-ramesh-gold" />
                      {progressStatus}
                    </h3>
                    <span className="text-xs sm:text-sm font-medium text-ramesh-gold">{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2 sm:h-3 w-full bg-gray-100" />
                  <div className="mt-4 space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pr-2">
                    {progressSteps.map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-2 flex items-center justify-center
                          ${
                            index < currentStep
                              ? "bg-green-500"
                              : index === currentStep
                                ? "bg-ramesh-gold"
                                : "bg-gray-200"
                          }`}
                        >
                          {index < currentStep && (
                            <svg
                              className="w-2 h-2 sm:w-3 sm:h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-xs sm:text-sm ${
                            index < currentStep
                              ? "text-green-600"
                              : index === currentStep
                                ? "text-ramesh-gold font-medium"
                                : "text-gray-500"
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              {activeTab === "general" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
                    General Information
                  </div>
                  <GeneralTab formData={formData} onChange={handleChange} errors={formErrors} isEdit={isEdit} />
                </div>
              )}

              {activeTab === "tax" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
                    GST Details
                  </div>
                  <TaxDetailsTab formData={formData} onChange={handleChange} errors={formErrors} />
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
                    Product Details
                  </div>
                  <DetailsTab
                    formData={formData}
                    onChange={handleChange}
                    onNestedChange={handleNestedChange}
                    errors={formErrors}
                  />
                </div>
              )}

              {activeTab === "nutrition" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
                    Nutrition Information
                  </div>
                  <NutritionInfoTab formData={formData} onNestedChange={handleNestedChange} errors={formErrors} />
                </div>
              )}

              {activeTab === "extra" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
                    Extra Details
                  </div>
                  <ExtraDetailsTab formData={formData} onChange={handleChange} errors={formErrors} />
                </div>
              )}

              {activeTab === "variants" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
                    Product Variants
                  </div>
                  <VariantTab
                    variants={formData.variants}
                    onChange={handleVariantsChange}
                    onVariantErrorHandler={handleVariantError}
                    productId={id} // Pass the current product ID for SKU validation
                  />
                </div>
              )}

              {activeTab === "tags" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
                    Product Tags
                  </div>
                  <TagsTab tags={formData.tags} onChange={handleTagsChange} />
                </div>
              )}

              {activeTab === "images" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center text-base sm:text-lg font-medium text-gray-900 mb-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-ramesh-gold" />
                    Product Images
                  </div>
                  <ImagesTab
                    images={formData.images}
                    onChange={handleImagesChange}
                    productId={id}
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              Are you sure you want to delete this product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Choose how you want to delete this product:
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Deletion options */}
          <div className="space-y-3 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 my-2">
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="deleteType"
                className="mt-1 mr-2"
                checked={deleteType === "soft"}
                onChange={() => setDeleteType("soft")}
              />
              <div>
                <p className="font-medium text-gray-800 text-sm sm:text-base">Move to trash</p>
                <p className="text-xs sm:text-sm text-gray-600">Product will be archived and can be restored later</p>
              </div>
            </label>

            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="deleteType"
                className="mt-1 mr-2"
                checked={deleteType === "permanent"}
                onChange={() => setDeleteType("permanent")}
              />
              <div>
                <p className="font-medium text-red-600 text-sm sm:text-base">Permanently delete</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  This action cannot be undone. All product data will be permanently removed.
                </p>
              </div>
            </label>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="text-sm sm:text-base">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-sm sm:text-base">
              {submitting ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  {deleteType === "permanent" ? "Permanently Delete" : "Move to Trash"}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProductForm
