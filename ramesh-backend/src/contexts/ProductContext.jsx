"use client"

import { createContext, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import productService from "../services/productService"
import { useAuth } from "./AuthContext"

const ProductContext = createContext(null)

export const ProductProvider = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [currentProduct, setCurrentProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    subcategory_id: "",
    status: "",
    product_type: "", // NEW FILTER
    page: 1,
    limit: 25,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })

  // Upload images using the dedicated upload API
  const uploadProductImages = async (productId, imageFiles) => {
    setLoading(true)
    setError(null)

    try {
      const response = await productService.uploadProductImages(productId, imageFiles)

      if (response.status === "success") {
        toast.success(response.message || "Images uploaded successfully")

        // Refresh the current product data to get updated images
        if (currentProduct && currentProduct.id === Number.parseInt(productId)) {
          await getProduct(productId)
        }

        return response.data
      } else {
        setError(response.message || "Failed to upload images")
        toast.error(response.message || "Failed to upload images")
        throw new Error(response.message || "Failed to upload images")
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while uploading images"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get all products with filters
  const getProducts = async (filterParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Merge current filters with new filter params
      const mergedFilters = { ...filters, ...filterParams }
      setFilters(mergedFilters)

      // If search query exists, we'll search in both name and tags
      if (mergedFilters.search) {
        mergedFilters.search_fields = "name,tags"
      }

      // Include product_type in filters if provided
      if (mergedFilters.product_type) {
        // product_type filter is already included in mergedFilters
      }

      const response = await productService.getAllProducts(mergedFilters)

      if (response.status === "success") {
        // Ensure data is properly processed
        const processedProducts = Array.isArray(response.data)
          ? response.data.map((product) => {
              // Make sure price is a valid number
              if (product.price && isNaN(Number.parseFloat(product.price))) {
                product.price = "0"
              }
              return product
            })
          : []

        setProducts(processedProducts)

        // Update pagination if available
        if (response.meta) {
          setPagination({
            currentPage: response.meta.current_page || 1,
            totalPages: response.meta.total_pages || response.meta.last_page || 1,
            totalItems: response.meta.total || 0,
            perPage: response.meta.per_page || filters.limit,
          })
        }

        return true
      } else {
        setError(response.message || "Failed to fetch products")
        toast.error(response.message || "Failed to fetch products")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching products"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Get a specific product
  const getProduct = async (id) => {
    setLoading(true)
    setError(null)

    try {
      const response = await productService.getProduct(id)

      if (response.status === "success") {
        setCurrentProduct(response.data || null)
        return true
      } else {
        setError(response.message || "Failed to fetch product details")
        toast.error(response.message || "Failed to fetch product details")
        return false
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching product details"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Create a new product
  const createProduct = async (productData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await productService.createProduct(productData)

      if (response.status === "error") {
        setError(response.message)
        throw new Error(response.message)
      }

      setCurrentProduct(response.data)
      return true
    } catch (err) {
      console.error("Error creating product:", err)
      setError(err.message || "Failed to create product")
      throw err // Re-throw to allow component-level handling
    } finally {
      setLoading(false)
    }
  }

  // Update a product
  const updateProduct = async (id, productData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await productService.updateProduct(id, productData)

      if (response.status === "error") {
        setError(response.message)
        throw new Error(response.message)
      }

      setCurrentProduct(response.data)
      return true
    } catch (err) {
      console.error("Error updating product:", err)
      setError(err.message || "Failed to update product")
      throw err // Re-throw to allow component-level handling
    } finally {
      setLoading(false)
    }
  }

  // Delete a product
  const deleteProduct = async (id, permanent = false) => {
    setLoading(true)
    setError(null)

    try {
      const response = await productService.deleteProduct(id, permanent)

      if (response.status === "success") {
        // Update products list by removing the deleted product
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== Number.parseInt(id)))

        // Show success message
        toast.success(permanent ? "Product permanently deleted" : "Product moved to trash")

        return true
      } else {
        setError(response.message || "Failed to delete product")
        toast.error(response.message || "Failed to delete product")
        return false
      }
    } catch (error) {
      const errorMessage = error.message || "An error occurred while deleting the product"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Change page
  const changePage = (page) => {
    getProducts({ page })
  }

  // Clear current product
  const clearCurrentProduct = () => {
    setCurrentProduct(null)
  }

  const value = {
    products,
    currentProduct,
    loading,
    error,
    filters,
    pagination,
    uploadProductImages, // Add this new method
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    changePage,
    clearCurrentProduct,
    setFilters,
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export const useProduct = () => {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider")
  }
  return context
}
