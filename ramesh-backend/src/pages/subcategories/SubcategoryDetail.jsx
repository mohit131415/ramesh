"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSubcategory } from "../../contexts/SubcategoryContext"
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

const SubcategoryDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentSubcategory, loading, error, getSubcategory, deleteSubcategory, restoreSubcategory, isSuperAdmin } =
    useSubcategory()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Load subcategory details on mount
  useEffect(() => {
    getSubcategory(id)
  }, [id])

  // Handle delete subcategory
  const handleDeleteSubcategory = async () => {
    if (await deleteSubcategory(id)) {
      navigate("/subcategories")
    }
  }

  // Handle restore subcategory
  const handleRestoreSubcategory = async () => {
    if (await restoreSubcategory(id)) {
      getSubcategory(id) // Refresh the subcategory data
    }
  }

  // Navigate to edit page
  const editSubcategory = () => {
    navigate(`/subcategories/${id}/edit`)
  }

  // Go back to subcategory list
  const goBack = () => {
    navigate("/subcategories")
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  // Get status badge class
  const getStatusBadge = (status, deletedAt) => {
    if (deletedAt) {
      return "bg-red-100 text-red-800"
    }

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
              Subcategory Details Help
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What am I looking at?</h4>
                <p>This page shows all the details about a specific subcategory.</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">On this page you can:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>See the subcategory image, name, and description</li>
                  <li>Check if the subcategory is active or inactive</li>
                  <li>See which category this subcategory belongs to</li>
                  <li>Edit the subcategory using the "Edit" button</li>
                  <li>Delete the subcategory using the "Delete" button</li>
                  <li>Go back to the subcategory list with the "Back" button</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Active subcategories are shown to customers</li>
                  <li>Inactive subcategories are hidden from customers</li>
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
          Back to Subcategories
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
          <p className="text-gray-500">Loading subcategory details...</p>
        </div>
      ) : currentSubcategory ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-ramesh-gold/10 p-2 rounded-lg mr-3">
                <Tag className="h-6 w-6 text-ramesh-gold" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{currentSubcategory.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                  currentSubcategory.status,
                  currentSubcategory.deleted_at,
                )}`}
              >
                {currentSubcategory.deleted_at ? (
                  <Trash2 className="h-4 w-4 mr-1.5" />
                ) : currentSubcategory.status === "active" ? (
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1.5" />
                )}
                {currentSubcategory.deleted_at
                  ? "Deleted"
                  : currentSubcategory.status.charAt(0).toUpperCase() + currentSubcategory.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="md:flex">
            {/* Left column - Subcategory image */}
            <div className="md:w-1/3 p-6 bg-gray-50 md:border-r border-gray-200">
              <div className="flex flex-col items-center">
                <div
                  className="w-full aspect-square rounded-lg overflow-hidden shadow-md mb-6 bg-white cursor-pointer"
                  onClick={() => {
                    if (currentSubcategory.image_url) {
                      setShowImageModal(true)
                      setZoomLevel(1)
                      setRotation(0)
                    }
                  }}
                >
                  {currentSubcategory.image_url ? (
                    <img
                      src={currentSubcategory.image_url || "/placeholder.svg"}
                      alt={currentSubcategory.name}
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
                    onClick={editSubcategory}
                    className="w-full flex justify-center items-center px-4 py-3 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90 shadow-sm transition-colors"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Subcategory
                  </button>

                  {!currentSubcategory.deleted_at ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex justify-center items-center px-4 py-3 bg-white border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 shadow-sm transition-colors"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete Subcategory
                    </button>
                  ) : (
                    isSuperAdmin && (
                      <button
                        onClick={handleRestoreSubcategory}
                        className="w-full flex justify-center items-center px-4 py-3 bg-white border border-green-500 text-green-600 rounded-lg font-medium hover:bg-green-50 shadow-sm transition-colors"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Restore Subcategory
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
                  Subcategory Information
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                  <p className="text-gray-900 font-medium">{currentSubcategory.category_name || "None"}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-900">{currentSubcategory.description || "No description provided."}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Category Details</h3>
                  {currentSubcategory.category ? (
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {currentSubcategory.category.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Description:</span>{" "}
                        {currentSubcategory.category.description || "No description"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span> {currentSubcategory.category.status}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Display Order:</span>{" "}
                        {currentSubcategory.category.display_order || 0}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No category details available</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Subcategory ID</h3>
                    <p className="text-gray-900 font-medium">{currentSubcategory.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders Placed</h3>
                    <p className="text-gray-900 font-medium">{currentSubcategory.display_order || 0}</p>
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
                        <p className="text-gray-900">{currentSubcategory.meta_title || "Not set"}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Meta Keywords</h3>
                        <p className="text-gray-900">{currentSubcategory.meta_keywords || "Not set"}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 md:col-span-2 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Meta Description</h3>
                        <p className="text-gray-900">{currentSubcategory.meta_description || "Not set"}</p>
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
                            By {currentSubcategory.created_by_name || "System"} on{" "}
                            {formatDate(currentSubcategory.created_at)}
                          </p>
                        </div>
                      </div>

                      {currentSubcategory.updated_at && (
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 rounded-full p-2 mt-1">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Updated</h3>
                            <p className="text-sm text-gray-500">
                              By {currentSubcategory.updated_by_name || "Unknown"} on{" "}
                              {formatDate(currentSubcategory.updated_at)}
                            </p>
                          </div>
                        </div>
                      )}

                      {currentSubcategory.deleted_at && (
                        <div className="flex items-start space-x-4">
                          <div className="bg-red-100 rounded-full p-2 mt-1">
                            <User className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Deleted</h3>
                            <p className="text-sm text-gray-500">
                              By {currentSubcategory.deleted_by_name || "Unknown"} on{" "}
                              {formatDate(currentSubcategory.deleted_at)}
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
          <h3 className="text-xl font-medium text-gray-900 mb-2">Subcategory not found</h3>
          <p className="text-gray-500 mb-6">We couldn't find the subcategory you're looking for.</p>
          <button
            onClick={goBack}
            className="px-6 py-2 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90 inline-flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back to Subcategories
          </button>
        </div>
      )}

      {/* Advanced Image Preview Modal */}
      {showImageModal && currentSubcategory.image_url && (
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
              className="absolute top-3 right-3 z-20 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            >
              <XCircle className="h-5 w-5 text-gray-600" />
            </button>
            {/* Image */}
            <div
              className="w-full h-full"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transformOrigin: "center",
              }}
            >
              <img
                src={currentSubcategory.image_url || "/placeholder.svg"}
                alt={currentSubcategory.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubcategoryDetail
