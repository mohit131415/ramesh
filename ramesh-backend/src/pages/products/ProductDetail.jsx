"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useProduct } from "../../contexts/ProductContext"
import { useAuth } from "../../contexts/AuthContext"
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Package,
  Clock,
  Info,
  Leaf,
  FileText,
  Percent,
  Hash,
  Calendar,
  Layers,
  CheckCircle,
  XCircle,
  User,
  Tag,
  ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentProduct, loading, error, getProduct, deleteProduct } = useProduct()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [deleteType, setDeleteType] = useState("soft")
  const [submitting, setSubmitting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Preview modal states
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImageIndex, setPreviewImageIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Check if user is super admin
  const isSuperAdmin = user && user.role === "super_admin"

  // Load product details on mount
  useEffect(() => {
    getProduct(id)
  }, [id])

  // Handle delete product
  const handleDeleteProduct = async () => {
    setSubmitting(true)

    try {
      // For already deleted products, always use permanent deletion
      // Otherwise, only super admins can perform permanent deletion
      const isPermanent = currentProduct.deleted_at || (isSuperAdmin && deleteType === "permanent")

      if (await deleteProduct(id, isPermanent)) {
        // If permanently deleting, navigate back to products list
        // For soft delete, stay on the page to show the deleted state
        if (isPermanent) {
          navigate("/products")
          toast.success("Product permanently deleted")
        } else {
          // Refresh the product to show deleted state
          getProduct(id)
          toast.success("Product moved to trash")
        }
      }
    } catch (err) {
      console.error("Delete error:", err)
      toast.error("An error occurred while deleting the product.")
    } finally {
      setSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Navigate to edit page
  const editProduct = () => {
    navigate(`/products/${id}/edit`)
  }

  // Go back to product list
  const goBack = () => {
    navigate("/products")
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleString()
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format price
  const formatPrice = (price) => {
    if (!price || isNaN(Number.parseFloat(price))) {
      return "Price not set"
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number.parseFloat(price))
  }

  // Add this function to handle image click
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl)
  }

  // Add this function to close the image modal
  const closeImageModal = () => {
    setSelectedImage(null)
  }

  // Get primary image
  const getPrimaryImage = () => {
    if (!currentProduct?.images || !Array.isArray(currentProduct.images)) {
      return null
    }

    // Find the image with is_primary explicitly set to 1
    const primaryImage = currentProduct.images.find((img) => img.is_primary === 1)

    // If no primary image is found, fall back to the first image
    return primaryImage || currentProduct.images[0]
  }

  // Get sorted images
  const getSortedImages = () => {
    if (!currentProduct?.images || !Array.isArray(currentProduct.images)) {
      return []
    }

    // Sort images by display_order
    return [...currentProduct.images].sort((a, b) => {
      // Primary image always first (explicitly check for is_primary === 1)
      if (a.is_primary === 1 && b.is_primary !== 1) return -1
      if (a.is_primary !== 1 && b.is_primary === 1) return 1

      // Then sort by display_order
      return (a.display_order || 0) - (b.display_order || 0)
    })
  }

  // Get non-primary images
  const getNonPrimaryImages = () => {
    if (!currentProduct?.images || !Array.isArray(currentProduct.images)) {
      return []
    }

    // Get the primary image
    const primaryImage = getPrimaryImage()

    // Filter out the primary image and sort the rest by display_order
    return [...currentProduct.images]
      .filter((img) => primaryImage && img.id !== primaryImage.id)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
  }

  const getImageUrl = (image) => {
    if (!image) return "/placeholder.svg"

    // Handle image_url field from API response
    if (image.image_url) {
      // Transform any URL with uploads/product_images pattern
      if (image.image_url.includes("/uploads/product_images/")) {
        const filename = image.image_url.split("/uploads/product_images/").pop()
        return `/imageapi/api/public/uploads/product_images/${filename}`
      }

      // If it's just a path starting with uploads/, add the full proxy URL
      if (image.image_url.startsWith("uploads/")) {
        return `/imageapi/api/public/${image.image_url}`
      }

      return image.image_url
    }

    // Handle url field
    if (image.url) {
      // Transform any URL with uploads/product_images pattern
      if (image.url.includes("/uploads/product_images/")) {
        const filename = image.url.split("/uploads/product_images/").pop()
        return `/imageapi/api/public/uploads/product_images/${filename}`
      }

      // If it's just a path starting with uploads/, add the full proxy URL
      if (image.url.startsWith("uploads/")) {
        return `/imageapi/api/public/${image.url}`
      }

      return image.url
    }

    // Handle image_path field from API response
    if (image.image_path) {
      // Transform any URL with uploads/product_images pattern
      if (image.image_path.includes("/uploads/product_images/")) {
        const filename = image.image_path.split("/uploads/product_images/").pop()
        return `/imageapi/api/public/uploads/product_images/${filename}`
      }

      // If it's just a path starting with uploads/, add the full proxy URL
      if (image.image_path.startsWith("uploads/")) {
        return `/imageapi/api/public/${image.image_path}`
      }

      // If it doesn't start with uploads/, assume it needs the full path
      return `/imageapi/api/public/${image.image_path}`
    }

    return "/placeholder.svg"
  }

  // Preview modal functions
  const openImagePreview = (index) => {
    setPreviewImageIndex(index)
    setPreviewOpen(true)
    setZoomLevel(1)
    setRotation(0)
  }

  const prevImage = () => {
    const sortedImages = getSortedImages()
    setPreviewImageIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1))
    setZoomLevel(1)
    setRotation(0)
  }

  const nextImage = () => {
    const sortedImages = getSortedImages()
    setPreviewImageIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0))
    setZoomLevel(1)
    setRotation(0)
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const downloadImage = () => {
    const sortedImages = getSortedImages()
    if (sortedImages.length === 0 || !sortedImages[previewImageIndex]) return

    const imageUrl = getImageUrl(sortedImages[previewImageIndex])
    if (!imageUrl || imageUrl === "/placeholder.svg") {
      toast.error("Cannot download placeholder image")
      return
    }

    const link = document.createElement("a")
    link.href = imageUrl
    link.download =
      sortedImages[previewImageIndex].original_name ||
      sortedImages[previewImageIndex].filename ||
      `image-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <button onClick={goBack} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d3ae6e]"></div>
        </div>
      ) : currentProduct ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-[#d3ae6e]/10 p-2 rounded-lg mr-3">
                <Package className="h-6 w-6 text-[#d3ae6e]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentProduct.name}</h1>
                <p className="text-gray-600 text-sm">{currentProduct.description || ""}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                  currentProduct.status,
                )}`}
              >
                {currentProduct.status === "active" ? (
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1.5" />
                )}
                {currentProduct.status.charAt(0).toUpperCase() + currentProduct.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="md:flex">
            {/* Left column - Product images */}
            <div className="md:w-1/3 p-6 bg-gray-50 md:border-r border-gray-200">
              <div className="flex flex-col items-center">
                {currentProduct.deleted_at ? (
                  <div className="w-full rounded-lg p-6 bg-gray-100 text-center mb-6">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Images not available for deleted products</p>
                  </div>
                ) : (
                  <>
                    {/* Product Images */}
                    <div className="mb-6 w-full">
                      <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                        <ImageIcon className="h-5 w-5 mr-2 text-[#d3ae6e]" />
                        Product Images ({currentProduct.images?.length || 0})
                      </h2>

                      {currentProduct.images && currentProduct.images.length > 0 ? (
                        <div className="space-y-4">
                          {/* Main Image Display */}
                          <div className="relative">
                            <div className="relative w-full pt-[100%] rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200">
                              <img
                                src={
                                  getImageUrl(getSortedImages()[currentImageIndex] || getSortedImages()[0]) ||
                                  "/placeholder.svg"
                                }
                                alt="Product image"
                                className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                                onClick={() => openImagePreview(currentImageIndex)}
                              />

                              {/* Navigation arrows for main image */}
                              {getSortedImages().length > 1 && (
                                <>
                                  <button
                                    onClick={() =>
                                      setCurrentImageIndex((prev) =>
                                        prev > 0 ? prev - 1 : getSortedImages().length - 1,
                                      )
                                    }
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all duration-200"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setCurrentImageIndex((prev) =>
                                        prev < getSortedImages().length - 1 ? prev + 1 : 0,
                                      )
                                    }
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-lg transition-all duration-200"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </>
                              )}

                              {/* Image counter */}
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                                {currentImageIndex + 1} / {getSortedImages().length}
                              </div>

                              {/* Primary badge */}
                              {getSortedImages()[currentImageIndex]?.is_primary === 1 && (
                                <div className="absolute top-2 left-2 bg-[#d3ae6e] text-white text-xs px-2 py-1 rounded-md flex items-center">
                                  <Star className="h-3 w-3 mr-1" />
                                  Primary
                                </div>
                              )}

                              {/* View Full button overlay */}
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                                <button
                                  onClick={() => openImagePreview(currentImageIndex)}
                                  className="bg-white/90 hover:bg-white text-gray-700 rounded-lg px-3 py-2 shadow-lg transition-all duration-200 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Full
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Thumbnail Strip */}
                          {getSortedImages().length > 1 && (
                            <div className="relative">
                              <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#d3ae6e] scrollbar-track-gray-100 pb-2">
                                {getSortedImages().map((image, index) => (
                                  <div
                                    key={image.id || index}
                                    className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                                      index === currentImageIndex
                                        ? "border-[#d3ae6e] shadow-md"
                                        : "border-gray-200 hover:border-[#d3ae6e]/50"
                                    }`}
                                    onClick={() => setCurrentImageIndex(index)}
                                  >
                                    <img
                                      src={getImageUrl(image) || "/placeholder.svg"}
                                      alt={`Thumbnail ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    {image.is_primary === 1 && (
                                      <div className="absolute top-0 right-0 bg-[#d3ae6e] text-white rounded-bl-md">
                                        <Star className="h-2 w-2 m-0.5" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Image Info */}
                          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span>
                                Current:{" "}
                                {getSortedImages()[currentImageIndex]?.original_name ||
                                  getSortedImages()[currentImageIndex]?.filename ||
                                  `Image ${currentImageIndex + 1}`}
                              </span>
                              <button
                                onClick={() => openImagePreview(currentImageIndex)}
                                className="text-[#d3ae6e] hover:text-[#b8965a] flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                View Full
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
                          <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No images available for this product</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons - only show for non-deleted products */}
                    {currentProduct.deleted_at ? (
                      <div className="mt-6 w-full">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center mb-4">
                          <p className="text-red-600 text-sm font-medium flex items-center justify-center">
                            <Trash2 className="h-4 w-4 mr-2" />
                            This product has been deleted on {formatDate(currentProduct.deleted_at)}
                          </p>
                        </div>

                        {/* Only show permanent delete button for super admins */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setDeleteType("permanent")
                              setShowDeleteConfirm(true)
                            }}
                            className="w-full flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Permanently Delete
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-6 flex space-x-3 w-full">
                        <button
                          onClick={editProduct}
                          className="flex-1 flex justify-center items-center px-4 py-2 bg-[#d3ae6e] text-white rounded-lg text-sm font-medium hover:bg-[#d3ae6e]/90"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </button>

                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex-1 flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Product
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right column - Detailed information */}
            <div className="md:w-2/3 p-6">
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-[#d3ae6e]" />
                  Category Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-[#d3ae6e]/30 transition-colors">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                    <p className="text-gray-900 font-medium">{currentProduct.category_name || ""}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-[#d3ae6e]/30 transition-colors">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Subcategory</h3>
                    <p className="text-gray-900 font-medium">{currentProduct.subcategory_name || ""}</p>
                  </div>

                  {/* NEW: Product Type */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-[#d3ae6e]/30 transition-colors">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Product Type</h3>
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={`text-sm py-1 px-2 ${
                          currentProduct.product_type === "global"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : currentProduct.product_type === "local"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : currentProduct.product_type === "takeaway"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {currentProduct.product_type === "global"
                          ? "Global (Available Everywhere)"
                          : currentProduct.product_type === "local"
                            ? "Local (Location Specific)"
                            : currentProduct.product_type === "takeaway"
                              ? "Takeaway Only"
                              : currentProduct.product_type || "Global (Available Everywhere)"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 mb-6 border border-gray-100 hover:border-[#d3ae6e]/30 transition-colors">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-900">{currentProduct.description || ""}</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <span className="h-5 w-5 mr-2 text-[#d3ae6e]">₹</span>
                  GST Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">HSN Code</h3>
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-1 text-gray-400" />
                      <p className="text-gray-900 font-medium">{currentProduct.hsn_code || ""}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">GST Rate</h3>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-1 text-gray-400" />
                      <p className="text-gray-900 font-medium">{currentProduct.tax_rate || ""} %</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">CGST Rate</h3>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-1 text-gray-400" />
                      <p className="text-gray-900 font-medium">{currentProduct.cgst_rate || ""} %</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">SGST Rate</h3>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-1 text-gray-400" />
                      <p className="text-gray-900 font-medium">{currentProduct.sgst_rate || ""} %</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">IGST Rate</h3>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-1 text-gray-400" />
                      <p className="text-gray-900 font-medium">{currentProduct.igst_rate || ""} %</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-[#d3ae6e]" />
                  Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Shelf Life</h3>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <p className="text-gray-900 font-medium">{currentProduct.shelf_life || ""}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Vegetarian</h3>
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 mr-1 text-gray-400" />
                      <p className="text-gray-900 font-medium">{currentProduct.is_vegetarian ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Ingredients</h3>
                  {currentProduct.ingredients_array && currentProduct.ingredients_array.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {currentProduct.ingredients_array.map((ingredient, index) => (
                        <li key={index} className="text-gray-900">
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No ingredients listed</p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-[#d3ae6e]" />
                  Nutritional Information
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Per serving (100g)</h3>
                  {currentProduct.nutritional_info_object ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Calories:</span>
                        <span className="text-gray-900 font-medium">
                          {currentProduct.nutritional_info_object.calories || "~"}{" "}
                          {currentProduct.nutritional_info_object.calories ? "kcal" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Fat:</span>
                        <span className="text-gray-900 font-medium">
                          {currentProduct.nutritional_info_object.fat || "~"}{" "}
                          {currentProduct.nutritional_info_object.fat ? "g" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Carbohydrates:</span>
                        <span className="text-gray-900 font-medium">
                          {currentProduct.nutritional_info_object.carbohydrates || "~"}{" "}
                          {currentProduct.nutritional_info_object.carbohydrates ? "g" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Protein:</span>
                        <span className="text-gray-900 font-medium">
                          {currentProduct.nutritional_info_object.protein || "~"}{" "}
                          {currentProduct.nutritional_info_object.protein ? "g" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Sugar:</span>
                        <span className="text-gray-900 font-medium">
                          {currentProduct.nutritional_info_object.sugar || "~"}{" "}
                          {currentProduct.nutritional_info_object.sugar ? "g" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Sodium:</span>
                        <span className="text-gray-900 font-medium">
                          {currentProduct.nutritional_info_object.sodium || "~"}{" "}
                          {currentProduct.nutritional_info_object.sodium ? "mg" : ""}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No nutritional information available</p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-[#d3ae6e]" />
                  Extra Details
                </h2>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Storage Instructions</h3>
                    <p className="text-gray-900">{currentProduct.storage_instructions || ""}</p>
                  </div>

                  {user?.role === "super_admin" && (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Meta Title</h3>
                        <p className="text-gray-900">{currentProduct.meta_title || ""}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Meta Keywords</h3>
                        <p className="text-gray-900">{currentProduct.meta_keywords || ""}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Meta Description</h3>
                        <p className="text-gray-900">{currentProduct.meta_description || ""}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-[#d3ae6e]" />
                  Variants
                </h2>

                {currentProduct.variants && currentProduct.variants.length > 0 ? (
                  <div className="space-y-4">
                    {currentProduct.variants.map((variant) => (
                      <div key={variant.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h4 className="text-lg font-medium text-gray-900">{variant.variant_name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">SKU</p>
                            <p className="text-gray-900">{variant.sku || ""}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Price</p>
                            <p className="text-gray-900">{formatPrice(variant.price)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Sale Price</p>
                            <p className="text-gray-900">{formatPrice(variant.sale_price) || ""}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Weight</p>
                            <p className="text-gray-900">
                              {variant.weight || ""} {variant.weight_unit || ""}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Min Order Quantity</p>
                            <p className="text-gray-900">{variant.min_order_quantity || ""}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Max Order Quantity</p>
                            <p className="text-gray-900">{variant.max_order_quantity || ""}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className="text-gray-900">{variant.status || ""}</p>
                          </div>
                          {user?.role === "super_admin" && (
                            <>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Dimensions</p>
                                <p className="text-gray-900">{variant.dimensions || ""}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Created At</p>
                                <p className="text-gray-900">{formatDate(variant.created_at)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Updated At</p>
                                <p className="text-gray-900">{formatDate(variant.updated_at)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Product Name</p>
                                <p className="text-gray-900">{variant.product_name || ""}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Creator ID</p>
                                <p className="text-gray-900">{variant.creator_id || ""}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Created By</p>
                                <p className="text-gray-900">{variant.created_by_name || ""}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Updater ID</p>
                                <p className="text-gray-900">{variant.updater_id || ""}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Updated By</p>
                                <p className="text-gray-900">{variant.updated_by_name || ""}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No variants available</p>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-[#d3ae6e]" />
                  Tags
                </h2>

                {currentProduct.tags && currentProduct.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No tags added</p>
                )}
              </div>

              {user?.role === "super_admin" && (
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-[#d3ae6e]" />
                    History
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 rounded-full p-2 mt-1">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Created</h3>
                        <p className="text-sm text-gray-500">
                          By {currentProduct.created_by_name || ""} on {formatDate(currentProduct.created_at)}
                        </p>
                      </div>
                    </div>

                    {currentProduct.updated_at && (
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 rounded-full p-2 mt-1">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Updated</h3>
                          <p className="text-sm text-gray-500">
                            By {currentProduct.updated_by_name || ""} on {formatDate(currentProduct.updated_at)}
                          </p>
                        </div>
                      </div>
                    )}
                    {currentProduct.deleted_at && (
                      <div className="flex items-start space-x-4">
                        <div className="bg-red-100 rounded-full p-2 mt-1">
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Deleted</h3>
                          <p className="text-sm text-gray-500">
                            By {currentProduct.deleted_by_name || ""} on {formatDate(currentProduct.deleted_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-6">We couldn't find the product you're looking for.</p>
          <button
            onClick={goBack}
            className="px-6 py-2 bg-[#d3ae6e] text-white rounded-lg font-medium hover:bg-[#d3ae6e]/90 inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back to Products
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">
                {currentProduct.deleted_at ? "Permanently Delete Product" : "Delete Product"}
              </h3>
            </div>

            {currentProduct.deleted_at ? (
              <p className="text-gray-700 mb-4">
                Are you sure you want to <span className="font-bold text-red-600">permanently delete</span>{" "}
                <span className="font-medium">{currentProduct?.name}</span>? This action cannot be undone.
              </p>
            ) : (
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <span className="font-medium">{currentProduct?.name}</span>?
              </p>
            )}

            {/* Deletion options - Different UI based on user role and product status */}
            <div className="mb-6 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {currentProduct.deleted_at ? (
                // For already deleted products, show permanent delete warning
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-600">Warning: Permanent Deletion</p>
                    <p className="text-sm text-gray-600">
                      This will permanently remove the product from the database. All associated data including images,
                      variants, and history will be lost forever.
                    </p>
                  </div>
                </div>
              ) : isSuperAdmin ? (
                // Super admin sees both options with radio buttons for non-deleted products
                <>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="deleteType"
                      className="mt-1 mr-2"
                      checked={deleteType === "soft"}
                      onChange={() => setDeleteType("soft")}
                    />
                    <div>
                      <p className="font-medium text-gray-800">Move to trash</p>
                      <p className="text-sm text-gray-600">Product will be archived and can be restored later</p>
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
                      <p className="font-medium text-red-600">Permanently delete</p>
                      <p className="text-sm text-gray-600">
                        This action cannot be undone. All product data will be permanently removed.
                      </p>
                    </div>
                  </label>
                </>
              ) : (
                // Normal admin sees only a warning message about soft deletion
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-orange-600">This product will be moved to trash</p>
                    <p className="text-sm text-gray-600">The product can be restored by an administrator later.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center"
                onClick={handleDeleteProduct}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {currentProduct.deleted_at || (isSuperAdmin && deleteType === "permanent")
                      ? "Permanently Delete"
                      : "Delete Product"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Image Preview Modal - Same as ImagesTab */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
            style={{
              width: "min(90vw, 90vh)",
              height: "min(90vw, 90vh)",
              aspectRatio: "1/1",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
              style={{ zIndex: 20 }}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-white/95 to-transparent">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#d3ae6e] to-[#e6c285] flex items-center justify-center shadow-md mr-3">
                  <ImageIcon className="h-3 w-3 text-white" />
                </div>
                <div>
                  {getSortedImages().length > 0 && (
                    <div className="text-gray-900 font-bold text-sm">
                      Image {previewImageIndex + 1} of {getSortedImages().length}
                    </div>
                  )}
                  <div className="text-gray-600 text-xs truncate max-w-[200px]">
                    {getSortedImages().length > 0 && getSortedImages()[previewImageIndex]
                      ? getSortedImages()[previewImageIndex].original_name ||
                        getSortedImages()[previewImageIndex].filename ||
                        `Image ${previewImageIndex + 1}`
                      : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Image container - Perfect square with 1:1 ratio */}
            <div className="absolute inset-0 flex items-center justify-center p-16 bg-gradient-to-br from-gray-50 to-white">
              {getSortedImages().length > 0 && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="bg-[#f8f8f8] bg-opacity-80 rounded-xl p-2 shadow-inner w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageUrl(getSortedImages()[previewImageIndex]) || "/placeholder.svg"}
                      alt={`Product image ${previewImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain transition-all duration-300 rounded-lg"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-white/95 to-transparent">
              <div className="flex flex-col gap-2">
                {/* Controls row 1 */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomOut}
                    className="bg-white/90 border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomIn}
                    className="bg-white/90 border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rotateImage}
                    className="bg-white/90 border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs"
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadImage}
                    className="bg-white/90 border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>

                {/* Controls row 2 */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevImage}
                    className="bg-white/90 border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    className="bg-white/90 border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs"
                  >
                    <ChevronRight className="h-3 w-3 mr-1" />
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Image modal (keeping the old one for backward compatibility) */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40"
          onClick={closeImageModal}
        >
          <div className="relative w-[600px] h-[600px] p-2">
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
              onClick={(e) => {
                e.stopPropagation()
                closeImageModal()
              }}
            >
              <XCircle className="h-6 w-6 text-gray-800" />
            </button>
            <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Product image"
                className="max-h-full max-w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
