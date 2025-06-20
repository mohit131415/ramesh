// Replace the entire file with this updated implementation that uses only the comprehensive API endpoints

import api from "./api"
import { toast } from "react-toastify"
import { buildImageUrl } from "../config/api.config" // Import the buildImageUrl function

// Helper function to format image URL using the centralized function from api.config.js
const formatImageUrl = (imagePath) => {
  if (!imagePath) return null
  return buildImageUrl(imagePath)
}

// Helper function to debug FormData contents
const logFormData = (formData, label = "FormData contents") => {
  console.log(`--- ${label} ---`)
  for (const [key, value] of formData.entries()) {
    if (key === "variants") {
      console.log(`${key}: ${value.substring(0, 100)}...`) // Log just the beginning for large JSON
    } else if (value instanceof File) {
      console.log(`${key}: [File] ${value.name} (${value.size} bytes)`)
    } else {
      console.log(`${key}: ${value}`)
    }
  }
  console.log("-------------------")
}

// Helper function to extract filename from path
const getFilenameFromPath = (path) => {
  if (!path) return ""
  const parts = path.split("/")
  return parts[parts.length - 1]
}

// Helper function to handle API errors
const handleApiError = (error) => {
  // Check for token expiration
  if (
    error.response?.status === 401 ||
    error.response?.data?.message?.includes("Invalid or expired token") ||
    error.response?.data?.message?.includes("Token has expired")
  ) {
    // Clear local storage
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")

    // Show toast notification
    toast.error("Your session has expired. Please log in again.")

    // Redirect to login page
    window.location.href = "/login"
  }
}

// Helper function to get error message
const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || "Network error occurred"
}

// Upload images using the dedicated image upload API
const uploadProductImages = async (productId, imageFiles) => {
  try {
    if (!productId) {
      return {
        status: "error",
        message: "Product ID is required",
        data: null,
      }
    }

    if (!imageFiles || imageFiles.length === 0) {
      return {
        status: "error",
        message: "Please select at least one image to upload",
        data: null,
      }
    }

    // Get authentication token
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken")

    if (!token) {
      return {
        status: "error",
        message: "Authentication token not found. Please login again.",
        data: null,
      }
    }

    // Create FormData for the upload
    const formData = new FormData()

    // Add each image file with the exact field name expected by the API
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append("images[]", imageFiles[i])
    }

    console.log(`Uploading ${imageFiles.length} images for product ${productId}`)

    // Use the api service to make the call instead of direct fetch
    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    const result = response.data

    if (result.status === "success") {
      // Process the uploaded images to match our expected format
      const processedImages =
        result.data?.uploaded_images?.map((image) => ({
          ...image,
          url: formatImageUrl(image.image_path),
          path: image.image_path,
          filename: getFilenameFromPath(image.image_path),
        })) || []

      return {
        status: "success",
        message: result.message || "Images uploaded successfully",
        data: {
          uploaded_images: processedImages,
          total_images: result.data?.total_images || processedImages.length,
        },
      }
    } else {
      return {
        status: "error",
        message: result.message || "Failed to upload images",
        data: null,
      }
    }
  } catch (error) {
    handleApiError(error)
    return {
      status: "error",
      message: getErrorMessage(error),
      data: null,
    }
  }
}

// Add this new function to fetch all SKUs for validation
const getAllProductSKUs = async () => {
  try {
    const response = await api.get("/comprehensive-products/skus/all")

    if (response.data?.status === "success") {
      return {
        status: "success",
        message: "Product SKUs retrieved successfully",
        data: response.data.data || [],
      }
    }

    return {
      status: "error",
      message: "Failed to retrieve product SKUs",
      data: [],
    }
  } catch (error) {
    handleApiError(error)
    return {
      status: "error",
      message: getErrorMessage(error),
      data: [],
    }
  }
}

// Add this new function to validate a single SKU
const validateSKU = async (sku, productId = null) => {
  try {
    if (!sku) {
      return {
        status: "error",
        message: "SKU is required",
        isValid: false,
      }
    }

    // Get all product SKUs
    const response = await getAllProductSKUs()

    if (response.status !== "success") {
      return {
        status: "error",
        message: "Failed to validate SKU",
        isValid: false,
      }
    }

    // Check if this SKU exists in any other product
    const duplicateSKU = response.data.find((product) => {
      // Skip current product if we're editing
      if (productId && product.id === Number.parseInt(productId)) {
        return false
      }

      // Check if any variant in this product has the same SKU
      return product.variants.some((v) => v.sku.toLowerCase() === sku.toLowerCase())
    })

    if (duplicateSKU) {
      const duplicateVariant = duplicateSKU.variants.find((v) => v.sku.toLowerCase() === sku.toLowerCase())

      return {
        status: "error",
        message: `SKU "${sku}" already exists in product "${duplicateSKU.name}" (${duplicateVariant.name})`,
        isValid: false,
        duplicateProduct: duplicateSKU.name,
        duplicateVariant: duplicateVariant.name,
      }
    }

    return {
      status: "success",
      message: "SKU is valid",
      isValid: true,
    }
  } catch (error) {
    handleApiError(error)
    return {
      status: "error",
      message: getErrorMessage(error),
      isValid: false,
    }
  }
}

const productService = {
  // Get all products with filters
  getAllProducts: async (filters = {}) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()

      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
          queryParams.append(key, filters[key])
        }
      })

      // Handle include_deleted properly
      if (filters.include_deleted === true) {
        queryParams.append("include_deleted", "1")
      }

      // Add product_type filter
      if (filters.product_type !== undefined && filters.product_type !== null && filters.product_type !== "") {
        queryParams.append("product_type", filters.product_type)
      }

      const queryString = queryParams.toString()
      // Use the comprehensive products endpoint
      const url = queryString ? `/comprehensive-products?${queryString}` : "/comprehensive-products"

      const response = await api.get(url)

      // Process the response data
      if (response.data?.status === "success" && response.data?.data) {
        // Format image URLs and process data
        if (Array.isArray(response.data.data)) {
          response.data.data = response.data.data.map((product) => {
            // Format image URLs
            if (product.images && Array.isArray(product.images)) {
              product.images = product.images.map((image) => ({
                ...image,
                url: formatImageUrl(image.image_url || image.image_path),
                path: image.image_path,
                filename: getFilenameFromPath(image.image_path),
              }))
            }

            // Ensure boolean fields are properly converted
            product.is_vegetarian = product.is_vegetarian === 1 || product.is_vegetarian === true
            product.is_featured = product.is_featured === 1 || product.is_featured === true
            product.is_new = product.is_new === 1 || product.is_new === true
            product.is_popular = product.is_popular === 1 || product.is_popular === true

            // Add category and subcategory names for easier access
            if (product.category) {
              product.category_name = product.category.name
            }

            if (product.subcategory) {
              product.subcategory_name = product.subcategory.name
            }

            return product
          })
        }

        // Update pagination metadata if available
        if (response.data.meta) {
          response.data.pagination = {
            currentPage: response.data.meta.current_page,
            perPage: response.data.meta.per_page,
            totalItems: response.data.meta.total,
            totalPages: response.data.meta.total_pages || response.data.meta.last_page || 1,
          }
        }
      }

      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Get a specific product by ID
  getProduct: async (id) => {
    try {
      // Use the comprehensive endpoint for retrieving a single product
      const response = await api.get(`/comprehensive-products/${id}`)

      // Process the response data
      if (response.data?.status === "success" && response.data?.data) {
        const product = response.data.data

        // Format image URLs
        if (product.images && Array.isArray(product.images)) {
          product.images = product.images.map((image) => ({
            ...image,
            url: formatImageUrl(image.image_url || image.image_path),
            path: image.image_path,
            filename: getFilenameFromPath(image.image_path),
          }))
        }

        // Ensure boolean fields are properly converted
        product.is_vegetarian = product.is_vegetarian === 1 || product.is_vegetarian === true
        product.is_featured = product.is_featured === 1 || product.is_featured === true
        product.is_new = product.is_new === 1 || product.is_new === true
        product.is_popular = product.is_popular === 1 || product.is_popular === true

        // Add category and subcategory names for easier access
        if (product.category) {
          product.category_name = product.category.name
        }

        if (product.subcategory) {
          product.subcategory_name = product.subcategory.name
        }

        // Process ingredients
        if (product.ingredients && typeof product.ingredients === "string") {
          try {
            product.ingredients_array = JSON.parse(product.ingredients)
          } catch (e) {
            product.ingredients_array = product.ingredients.split(",").map((item) => item.trim())
          }
        } else if (Array.isArray(product.ingredients)) {
          product.ingredients_array = product.ingredients
        } else {
          product.ingredients_array = []
        }

        // Process nutritional info
        if (product.nutritional_info && typeof product.nutritional_info === "string") {
          try {
            product.nutritional_info_object = JSON.parse(product.nutritional_info)
          } catch (e) {
            product.nutritional_info_object = {}
          }
        } else if (typeof product.nutritional_info === "object" && product.nutritional_info !== null) {
          product.nutritional_info_object = product.nutritional_info
        } else {
          product.nutritional_info_object = {}
        }

        // Process attributes
        if (product.attributes && typeof product.attributes === "string") {
          try {
            product.attributes_object = JSON.parse(product.attributes)
          } catch (e) {
            product.attributes_object = {}
          }
        } else if (typeof product.attributes === "object" && product.attributes !== null) {
          product.attributes_object = product.attributes
        } else {
          product.attributes_object = {}
        }
      }

      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      // Create FormData object for multipart/form-data
      const formData = new FormData()

      // Add basic product fields
      const basicFields = [
        "name",
        "category_id",
        "subcategory_id",
        "product_type", // NEW FIELD
        "description",
        "short_description",
        "hsn_code",
        "tax_rate",
        "cgst_rate",
        "sgst_rate",
        "igst_rate",
        "status",
        "display_order",
        "shelf_life",
        "storage_instructions",
        "meta_title",
        "meta_description",
        "meta_keywords",
      ]

      basicFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== null && productData[field] !== "") {
          formData.append(field, productData[field])
        }
      })

      // Handle boolean fields
      if (productData.is_vegetarian !== undefined) {
        formData.append("is_vegetarian", productData.is_vegetarian ? "1" : "0")
      }

      // Handle JSON fields
      if (productData.ingredients) {
        formData.append("ingredients", productData.ingredients)
      }

      if (productData.nutritional_info) {
        formData.append("nutritional_info", productData.nutritional_info)
      }

      if (productData.attributes) {
        formData.append("attributes", productData.attributes)
      }

      // Handle variants
      if (productData.variants && productData.variants.length > 0) {
        // Format variants properly for the API
        const formattedVariants = productData.variants.map((variant) => {
          // Clean up any temporary properties
          const { skuChanged, isNew, ...cleanVariant } = variant

          // Ensure numeric fields are properly formatted
          return {
            ...cleanVariant,
            price: Number.parseFloat(cleanVariant.price) || 0,
            sale_price: cleanVariant.sale_price ? Number.parseFloat(cleanVariant.sale_price) : null,
            weight: Number.parseFloat(cleanVariant.weight) || 0,
            min_order_quantity: Number.parseInt(cleanVariant.min_order_quantity) || 1,
            max_order_quantity: Number.parseInt(cleanVariant.max_order_quantity) || 10,
          }
        })

        // Add variants as a JSON string
        formData.append("variants", JSON.stringify(formattedVariants))
      }

      // Handle tags
      if (productData.tags && productData.tags.length > 0) {
        const tagNames = productData.tags.map((tag) => tag.name || tag)
        formData.append("tags", JSON.stringify(tagNames))
      }

      // Handle image uploads
      if (productData.images) {
        const newImages = productData.images.filter((img) => img.file)
        for (const image of newImages) {
          formData.append("images[]", image.file)
        }
      }

      // Log the FormData contents for debugging
      logFormData(formData, "Create Product FormData")

      // Send the create request to the comprehensive API endpoint
      const response = await api.post("/comprehensive-products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      handleApiError(error)

      // Improved error handling to pass through the API error message
      if (error.response && error.response.data) {
        return error.response.data
      }

      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Update an existing product
  updateProduct: async (id, productData) => {
    try {
      // Create FormData for the update
      const formData = new FormData()

      // Add method override for PUT
      formData.append("_method", "PUT")

      // Add basic product fields
      const basicFields = [
        "name",
        "category_id",
        "subcategory_id",
        "product_type", // NEW FIELD
        "description",
        "short_description",
        "hsn_code",
        "tax_rate",
        "cgst_rate",
        "sgst_rate",
        "igst_rate",
        "status",
        "display_order",
        "shelf_life",
        "storage_instructions",
        "meta_title",
        "meta_description",
        "meta_keywords",
      ]

      basicFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== null && productData[field] !== "") {
          formData.append(field, productData[field])
        }
      })

      // Handle boolean fields
      if (productData.is_vegetarian !== undefined) {
        formData.append("is_vegetarian", productData.is_vegetarian ? "1" : "0")
      }

      // Handle JSON fields
      if (productData.ingredients) {
        formData.append("ingredients", productData.ingredients)
      }

      if (productData.nutritional_info) {
        formData.append("nutritional_info", productData.nutritional_info)
      }

      if (productData.attributes) {
        formData.append("attributes", productData.attributes)
      }

      // Handle variants
      if (productData.variants && productData.variants.length > 0) {
        // Format variants properly for the API
        const formattedVariants = productData.variants.map((variant) => {
          // Clean up any temporary properties
          const { skuChanged, isNew, ...cleanVariant } = variant

          // Ensure numeric fields are properly formatted
          return {
            ...cleanVariant,
            price: Number.parseFloat(cleanVariant.price) || 0,
            sale_price: cleanVariant.sale_price ? Number.parseFloat(cleanVariant.sale_price) : null,
            weight: Number.parseFloat(cleanVariant.weight) || 0,
            min_order_quantity: Number.parseInt(cleanVariant.min_order_quantity) || 1,
            max_order_quantity: Number.parseInt(cleanVariant.max_order_quantity) || 10,
          }
        })

        // Add variants as a JSON string
        formData.append("variants", JSON.stringify(formattedVariants))
      } else {
        // Add an empty array as JSON string to ensure the API receives something
        formData.append("variants", JSON.stringify([]))
      }

      // Handle tags
      if (productData.tags && productData.tags.length > 0) {
        const tagNames = productData.tags.map((tag) => tag.name || tag)
        formData.append("tags", JSON.stringify(tagNames))
      }

      // Handle image operations according to the API specifications
      if (productData.images) {
        // Handle keep_existing_images flag
        if (productData.keep_existing_images) {
          formData.append("keep_existing_images", "true")
        }

        // Handle image_ids (specific images to keep)
        if (productData.image_ids) {
          formData.append("image_ids", productData.image_ids)
        }

        // Handle delete_image_ids (specific images to delete)
        if (productData.delete_image_ids) {
          formData.append("delete_image_ids", productData.delete_image_ids)
        }

        // Handle delete_all_images flag
        if (productData.delete_all_images) {
          formData.append("delete_all_images", "true")
        }

        // Set primary image if available
        if (productData.primary_image_id) {
          formData.append("primary_image_id", productData.primary_image_id)
        }

        // Handle image order
        if (productData.image_order) {
          formData.append("image_order", productData.image_order)
        }

        // Upload new images
        const newImages = Array.isArray(productData.images) ? productData.images.filter((img) => img.file) : []

        for (const image of newImages) {
          formData.append("images[]", image.file)
        }
      }

      // Log the FormData contents for debugging
      logFormData(formData, "Update Product FormData")

      // Send the update request to the comprehensive API endpoint
      const response = await api.post(`/comprehensive-products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      handleApiError(error)

      // Improved error handling to pass through the API error message
      if (error.response && error.response.data) {
        return error.response.data
      }

      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Delete a product
  deleteProduct: async (id, permanent = false) => {
    try {
      // Determine the correct endpoint based on the deletion type
      let url

      if (permanent) {
        // Use the permanent delete endpoint
        url = `/comprehensive-products/${id}/permanent`
      } else {
        // Use the soft delete endpoint
        url = `/comprehensive-products/${id}`
      }

      const response = await api.delete(url)

      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Search products by SKU
  searchProductsBySku: async (sku) => {
    try {
      const response = await api.get(`/comprehensive-products/search/sku?sku=${encodeURIComponent(sku)}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Set primary image
  setPrimaryImage: async (productId, imageId) => {
    try {
      if (!productId || !imageId) {
        return {
          status: "error",
          message: "Product ID and Image ID are required",
          data: null,
        }
      }

      // Update the product with the primary image ID
      const formData = new FormData()
      formData.append("_method", "PUT")
      formData.append("primary_image_id", imageId)

      const response = await api.post(`/comprehensive-products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Batch update image orders
  batchUpdateImageOrders: async (images) => {
    try {
      const imageOrderData = images
        .filter((img) => !img.isNew) // Only include non-temporary images
        .map((img) => ({
          id: img.id,
          display_order: img.display_order || 0,
        }))

      if (imageOrderData.length === 0) {
        return {
          status: "success",
          message: "No images to update",
          data: null,
        }
      }

      // Use the comprehensive endpoint to update the product with the new image orders
      const productId = images[0]?.product_id
      if (!productId) {
        return {
          status: "error",
          message: "Product ID is required",
          data: null,
        }
      }

      const formData = new FormData()
      formData.append("_method", "PUT")
      formData.append("image_orders", JSON.stringify(imageOrderData))

      const response = await api.post(`/comprehensive-products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Get all variants (for validation)
  getAllVariants: async (skipFetch = false) => {
    // If skipFetch is true, return an empty successful response
    if (skipFetch) {
      return {
        status: "success",
        message: "Skipped fetching variants as requested",
        data: [],
      }
    }

    try {
      const response = await api.get("/product-variants")
      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Get tag suggestions
  getTagSuggestions: async (query = "", limit = 1000) => {
    try {
      const queryParams = new URLSearchParams()

      if (query) {
        queryParams.append("query", query)
      }

      if (limit) {
        queryParams.append("limit", limit)
      }

      const queryString = queryParams.toString()
      const url = queryString
        ? `/comprehensive-products/tags/suggestions?${queryString}`
        : "/comprehensive-products/tags/suggestions"

      const response = await api.get(url)

      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: [],
      }
    }
  },

  // Update image order
  updateImageOrder: async (productId, imageOrder) => {
    try {
      if (!productId || !imageOrder || imageOrder.length === 0) {
        return {
          status: "error",
          message: "Product ID and image order are required",
          data: null,
        }
      }

      // Update the product with the image order
      const formData = new FormData()
      formData.append("_method", "PUT")
      formData.append("image_order", JSON.stringify(imageOrder))

      const response = await api.post(`/comprehensive-products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      handleApiError(error)
      return {
        status: "error",
        message: getErrorMessage(error),
        data: null,
      }
    }
  },

  // Add this to the productService object
  uploadProductImages: uploadProductImages,
  // Add this to the productService object
  getAllProductSKUs: getAllProductSKUs,
  // Add this to the productService object
  validateSKU: validateSKU,
}

export default productService
