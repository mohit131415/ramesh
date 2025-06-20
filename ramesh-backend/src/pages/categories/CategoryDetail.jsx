"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCategory } from "../../contexts/CategoryContext"
import { useAuth } from "../../contexts/AuthContext"
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  User,
  HelpCircle,
  Tag,
  Info,
  Eye,
} from "lucide-react"

const CategoryDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentCategory, loading, error, getCategory, deleteCategory, restoreCategory, isSuperAdmin } = useCategory()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Load category details on mount
  useEffect(() => {
    getCategory(id)
  }, [id])

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (await deleteCategory(id)) {
      navigate("/categories")
    }
  }

  // Handle restore category
  const handleRestoreCategory = async () => {
    if (await restoreCategory(id)) {
      getCategory(id) // Refresh the category data
    }
  }

  // Navigate to edit page
  const editCategory = () => {
    navigate(`/categories/${id}/edit`)
  }

  // Go back to category list
  const goBack = () => {
    navigate("/categories")
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Help tooltip */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-ramesh-gold" />
              Category Details Help
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What am I looking at?</h4>
                <p>This page shows all the details about a specific category.</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">On this page you can:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>See the category image, name, and description</li>
                  <li>Check if the category is active or inactive</li>
                  <li>Edit the category using the "Edit" button</li>
                  <li>Delete the category using the "Delete" button</li>
                  <li>Go back to the category list with the "Back" button</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Active categories are shown to customers</li>
                  <li>Inactive categories are hidden from customers</li>
                  <li>You can change the status in the Edit page</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90"
                onClick={() => setShowHelp(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Categories
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className="text-gray-400 hover:text-ramesh-gold p-2 rounded-full hover:bg-gray-100"
          title="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-200 shadow-sm">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold mb-4"></div>
          <p className="text-gray-500">Loading category details...</p>
        </div>
      ) : currentCategory ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-ramesh-gold/10 p-2 rounded-lg mr-3">
                <Tag className="h-6 w-6 text-ramesh-gold" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{currentCategory.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                  currentCategory.status,
                )}`}
              >
                {currentCategory.status === "active" ? (
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1.5" />
                )}
                {currentCategory.status.charAt(0).toUpperCase() + currentCategory.status.slice(1)}
              </span>
              {currentCategory.deleted_at && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Deleted
                </span>
              )}
            </div>
          </div>

          <div className="md:flex">
            {/* Left column - Category image */}
            <div className="md:w-1/3 p-6 bg-gray-50 md:border-r border-gray-200">
              <div className="flex flex-col items-center">
                <div
                  className="w-full aspect-square rounded-lg overflow-hidden shadow-md mb-6 bg-white cursor-pointer"
                  onClick={() => {
                    if (currentCategory.image_url) {
                      setShowImageModal(true)
                      setZoomLevel(1)
                      setRotation(0)
                    }
                  }}
                >
                  {currentCategory.image_url ? (
                    <img
                      src={currentCategory.image_url || "/placeholder.svg"}
                      alt={currentCategory.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-ramesh-gold/10">
                      <Package className="h-20 w-20 text-ramesh-gold/40" />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="w-full space-y-3">
                  <button
                    onClick={editCategory}
                    className="w-full flex justify-center items-center px-4 py-3 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90 shadow-sm transition-colors"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Category
                  </button>

                  {!currentCategory.deleted_at ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex justify-center items-center px-4 py-3 bg-white border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 shadow-sm transition-colors"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete Category
                    </button>
                  ) : (
                    isSuperAdmin && (
                      <button
                        onClick={handleRestoreCategory}
                        className="w-full flex justify-center items-center px-4 py-3 bg-white border border-green-500 text-green-600 rounded-lg font-medium hover:bg-green-50 shadow-sm transition-colors"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Restore Category
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Detailed information */}
            <div className="md:w-2/3 p-6">
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-ramesh-gold" />
                  Category Information
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-900">{currentCategory.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Category ID</h3>
                    <p className="text-gray-900 font-medium">{currentCategory.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders Placed</h3>
                    <p className="text-gray-900 font-medium">{currentCategory.display_order || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Takeaway Available</h3>
                    <div className="flex items-center">
                      {currentCategory.is_takeaway === 1 || currentCategory.is_takeaway === true ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isSuperAdmin && (
                <>
                  <div className="mb-8">
                    <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-ramesh-gold" />
                      SEO Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Meta Title</h3>
                        <p className="text-gray-900">{currentCategory.meta_title || "Not set"}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Meta Keywords</h3>
                        <p className="text-gray-900">{currentCategory.meta_keywords || "Not set"}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 md:col-span-2 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Meta Description</h3>
                        <p className="text-gray-900">{currentCategory.meta_description || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-ramesh-gold" />
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
                            By {currentCategory.created_by_name || "System"} on {formatDate(currentCategory.created_at)}
                          </p>
                        </div>
                      </div>

                      {currentCategory.updated_at && (
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 rounded-full p-2 mt-1">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Updated</h3>
                            <p className="text-sm text-gray-500">
                              By {currentCategory.updated_by_name || "Unknown"} on{" "}
                              {formatDate(currentCategory.updated_at)}
                            </p>
                          </div>
                        </div>
                      )}

                      {currentCategory.deleted_at && (
                        <div className="flex items-start space-x-4">
                          <div className="bg-red-100 rounded-full p-2 mt-1">
                            <User className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Deleted</h3>
                            <p className="text-sm text-gray-500">
                              By {currentCategory.deleted_by_name || "Unknown"} on{" "}
                              {formatDate(currentCategory.deleted_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Category not found</h3>
          <p className="text-gray-500 mb-6">We couldn't find the category you're looking for.</p>
          <button
            onClick={goBack}
            className="px-6 py-2 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90 inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back to Categories
          </button>
        </div>
      )}

      {/* Advanced Image Preview Modal */}
      {showImageModal && currentCategory.image_url && (
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
              onClick={() => {
                setShowImageModal(false)
                setZoomLevel(1)
                setRotation(0)
              }}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
              style={{ zIndex: 20 }}
            >
              <XCircle className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-white/95 to-transparent">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-ramesh-gold to-ramesh-gold/80 flex items-center justify-center shadow-md mr-3">
                  <Tag className="h-3 w-3 text-white" />
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-sm">Category Image</div>
                  <div className="text-gray-600 text-xs truncate max-w-[200px]">{currentCategory.name}</div>
                </div>
              </div>
            </div>

            {/* Image container - Perfect square with 1:1 ratio */}
            <div className="absolute inset-0 flex items-center justify-center p-16 bg-gradient-to-br from-gray-50 to-white">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="bg-[#f8f8f8] bg-opacity-80 rounded-xl p-2 shadow-inner w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={currentCategory.image_url || "/placeholder.svg"}
                    alt={currentCategory.name}
                    className="max-w-full max-h-full object-contain transition-all duration-300 rounded-lg"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                    }}
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </div>

            {/* Footer controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-white/95 to-transparent">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                  className="bg-white/90 border border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs transition-colors flex items-center"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Zoom Out
                </button>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
                  className="bg-white/90 border border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs transition-colors flex items-center"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Zoom In
                </button>
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="bg-white/90 border border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 h-8 px-3 rounded-lg shadow-sm text-xs transition-colors flex items-center"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Rotate
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = currentCategory.image_url || "/placeholder.svg"
                    link.download = `${currentCategory.name}-image.jpg`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="bg-ramesh-gold hover:bg-ramesh-gold/90 text-white h-8 px-4 rounded-lg shadow-md text-xs transition-colors flex items-center"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">Delete Category</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-medium">{currentCategory?.name}</span>?
              {isSuperAdmin ? " You can restore it later if needed." : " This action cannot be undone by you."}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                onClick={handleDeleteCategory}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryDetail
