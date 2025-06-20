"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useSubcategory } from "../../contexts/SubcategoryContext"
import { useCategory } from "../../contexts/CategoryContext"
import { useAuth } from "../../contexts/AuthContext"
import {
  ArrowLeft,
  HelpCircle,
  ImageIcon,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  Upload,
  Tag,
  Search,
  Plus,
  AlertTriangle,
} from "lucide-react"
// Import toast if it's not already imported at the top
import { toast } from "react-toastify"

const SubcategoryForm = ({ isEdit = false }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const {
    currentSubcategory,
    loading: subcategoryLoading,
    error: subcategoryError,
    getSubcategory,
    createSubcategory,
    updateSubcategory,
    isSuperAdmin,
    clearCurrentSubcategory,
  } = useSubcategory()
  const {
    categories,
    loading: categoriesLoading,
    getCategories,
    setCategories,
    setLoading,
    getAllCategoriesAtOnce,
  } = useCategory()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    status: "active",
    display_order: 0,
    image: null,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  })

  // Track original category for change detection
  const [originalCategoryId, setOriginalCategoryId] = useState("")

  // UI state
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [formError, setFormError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState("")

  // Category change confirmation modal state
  const [showCategoryChangeModal, setShowCategoryChangeModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState(null)

  // Validation state
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [nameError, setNameError] = useState(null)
  const [allSubcategoryNames, setAllSubcategoryNames] = useState([])
  const [isNameValid, setIsNameValid] = useState(true)

  // Category validation state
  const [categoryDeleted, setCategoryDeleted] = useState(false)
  const [deletedCategoryName, setDeletedCategoryName] = useState("")

  // Progress state
  const [progress, setProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)

  // Load categories on mount
  useEffect(() => {
    // Use the new method to fetch all categories at once
    getAllCategoriesAtOnce({ status: "active", limit: 1000 })
  }, [])

  // Load subcategory data if editing
  useEffect(() => {
    if (isEdit && id) {
      getSubcategory(id)
    } else {
      clearCurrentSubcategory()
    }

    return () => {
      clearCurrentSubcategory()
    }
  }, [isEdit, id])

  // Handle preselected category from navigation state
  useEffect(() => {
    if (location.state?.preselectedCategory && !isEdit) {
      setFormData((prev) => ({
        ...prev,
        category_id: location.state.preselectedCategory.toString(),
      }))

      // Also set the category search query to show the selected category name
      if (location.state?.preselectedCategoryName) {
        setCategorySearchQuery("")
      }
    }
  }, [location.state, isEdit, categories])

  // Populate form when currentSubcategory changes
  useEffect(() => {
    if (isEdit && currentSubcategory) {
      const categoryId = currentSubcategory.category_id || ""

      setFormData({
        name: currentSubcategory.name || "",
        description: currentSubcategory.description || "",
        category_id: categoryId,
        status: currentSubcategory.status || "active",
        display_order: currentSubcategory.display_order || 0,
        image: null, // Don't populate file input
        meta_title: currentSubcategory.meta_title || "",
        meta_description: currentSubcategory.meta_description || "",
        meta_keywords: currentSubcategory.meta_keywords || "",
      })

      // Store the original category ID for change detection
      setOriginalCategoryId(categoryId)

      // Set image preview if exists
      if (currentSubcategory.image_url) {
        setImagePreview(currentSubcategory.image_url)
      }

      // Check if the subcategory's category still exists
      if (currentSubcategory.category_id && categories.length > 0) {
        const categoryExists = categories.find((cat) => cat.id.toString() === currentSubcategory.category_id.toString())

        if (!categoryExists) {
          setCategoryDeleted(true)
          setDeletedCategoryName(currentSubcategory.category_name || "Unknown Category")
          // Clear the category_id so user must select a new one
          setFormData((prev) => ({
            ...prev,
            category_id: "",
          }))
          toast.error(
            `The original category "${currentSubcategory.category_name || "Unknown"}" has been deleted. Please select a new category.`,
          )
        } else {
          setCategoryDeleted(false)
          setDeletedCategoryName("")
        }
      }
    }
  }, [isEdit, currentSubcategory, categories])

  // Fetch all subcategory names for validation
  const fetchAllSubcategoryNames = useCallback(async () => {
    setIsCheckingName(true)
    try {
      // Import the service dynamically to avoid import errors
      const subcategoryServiceModule = await import("../../services/subcategoryService")
      const subcategoryService = subcategoryServiceModule.default

      // Get the first page to determine total pages
      const response = await subcategoryService.getAllSubcategories({ limit: 1000, page: 1 })

      if (response.status !== "success") {
        throw new Error(response.message || "Failed to fetch subcategories")
      }

      const { total_pages = 1 } = response.meta || {}

      // Prepare requests for all pages (up to 5 pages, 500 subcategories)
      const maxPages = Math.min(total_pages, 5)
      const pageRequests = []

      for (let page = 1; page <= maxPages; page++) {
        pageRequests.push(subcategoryService.getAllSubcategories({ limit: 1000, page }))
      }

      // Fetch all pages in parallel
      const results = await Promise.all(pageRequests)

      // Extract subcategory names and their category IDs
      const subcategoryData = results.flatMap((result) =>
        result.status === "success"
          ? (result.data || []).map((subcategory) => ({
              name: subcategory.name,
              category_id: subcategory.category_id,
              id: subcategory.id,
            }))
          : [],
      )

      setAllSubcategoryNames(subcategoryData)
      return subcategoryData
    } catch (error) {
      console.error("Error fetching subcategory names:", error)
      return []
    } finally {
      setIsCheckingName(false)
    }
  }, [])

  // Check if subcategory name is unique within the category
  const checkNameUniqueness = useCallback(
    async (name, categoryId) => {
      if (!name || !categoryId) return true

      setIsCheckingName(true)
      setNameError(null)

      try {
        // If we don't have subcategory names yet, fetch them
        let subcategoryData = allSubcategoryNames
        if (subcategoryData.length === 0) {
          subcategoryData = await fetchAllSubcategoryNames()
        }

        // Check if name exists in the same category
        const isDuplicate = subcategoryData.some(
          (subcategory) =>
            subcategory.name.toLowerCase() === name.toLowerCase() &&
            subcategory.category_id.toString() === categoryId.toString() &&
            (!isEdit || subcategory.id.toString() !== id),
        )

        setIsNameValid(!isDuplicate)

        if (isDuplicate) {
          setNameError(`A subcategory with the name "${name}" already exists in this category.`)
          return false
        }

        return true
      } catch (error) {
        console.error("Error checking subcategory name uniqueness:", error)
        return true
      } finally {
        setIsCheckingName(false)
      }
    },
    [allSubcategoryNames, fetchAllSubcategoryNames, isEdit, id],
  )

  // Fetch all subcategory names on mount
  useEffect(() => {
    fetchAllSubcategoryNames()
  }, [fetchAllSubcategoryNames])

  // Validate name when it changes
  useEffect(() => {
    if (formData.name && formData.category_id) {
      const timeoutId = setTimeout(() => {
        checkNameUniqueness(formData.name, formData.category_id)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [formData.name, formData.category_id, checkNameUniqueness])

  // Convert image to WebP format
  const convertToWebP = (file, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Set canvas dimensions to image dimensions
        canvas.width = img.width
        canvas.height = img.height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0)

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object with WebP extension
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              })
              resolve(webpFile)
            } else {
              reject(new Error("Failed to convert image to WebP"))
            }
          },
          "image/webp",
          quality,
        )
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for conversion"))
      }

      // Load the image
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target.result
      }
      reader.onerror = () => {
        reject(new Error("Failed to read image file"))
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === "file") {
      handleFileChange(files[0])
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Handle file change with WebP conversion
  const handleFileChange = async (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      const fileType = file.type

      if (!allowedTypes.includes(fileType)) {
        toast.error("File type not allowed. Allowed types: jpg, jpeg, png, gif, webp")

        // Reset file input
        const fileInput = document.getElementById("image")
        if (fileInput) {
          fileInput.value = ""
        }
        return
      }

      // Validate file size (5MB = 5 * 1024 * 1024 bytes) - increased limit for original file
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit. Please choose a smaller image.")

        // Reset file input
        const fileInput = document.getElementById("image")
        if (fileInput) {
          fileInput.value = ""
        }
        return
      }

      // Clear any previous errors
      setFormError(null)

      try {
        // Show conversion progress
        toast.info("Converting image to WebP format...")

        // Convert to WebP if not already WebP
        let processedFile = file
        if (file.type !== "image/webp") {
          processedFile = await convertToWebP(file, 0.85) // 85% quality for good balance
          toast.success("Image converted to WebP format successfully!")
        }

        // Preview image
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target.result)
        }
        reader.readAsDataURL(processedFile)

        setFormData((prev) => ({
          ...prev,
          image: processedFile,
        }))

        console.log(`Original file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
        console.log(`Processed file: ${processedFile.name} (${(processedFile.size / 1024 / 1024).toFixed(2)}MB)`)
      } catch (error) {
        console.error("Error converting image:", error)
        toast.error("Failed to process image. Please try again.")

        // Reset file input
        const fileInput = document.getElementById("image")
        if (fileInput) {
          fileInput.value = ""
        }
      }
    }
  }

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  // Proceed with form submission after category change confirmation
  const proceedWithSubmission = async (dataToSubmit) => {
    try {
      setProgress(60)

      let success

      if (isEdit) {
        success = await updateSubcategory(id, dataToSubmit)
      } else {
        success = await createSubcategory(dataToSubmit)
      }

      setProgress(90)

      if (success) {
        toast.success(isEdit ? "Subcategory updated successfully!" : "Subcategory created successfully!")
        setProgress(100)

        // Navigate after a short delay
        setTimeout(() => {
          navigate(isEdit ? `/subcategories/${id}` : "/subcategories")
        }, 1500)
      }
    } catch (err) {
      console.error("Form submission error:", err)
      toast.error("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
      // Keep progress visible for a moment before hiding
      setTimeout(() => {
        setShowProgress(false)
      }, 1500)
    }
  }

  // Handle category change confirmation
  const handleCategoryChangeConfirm = () => {
    setShowCategoryChangeModal(false)
    if (pendingFormData) {
      proceedWithSubmission(pendingFormData)
      setPendingFormData(null)
    }
  }

  // Handle category change cancellation
  const handleCategoryChangeCancel = () => {
    setShowCategoryChangeModal(false)
    setPendingFormData(null)
    setSubmitting(false)
    setShowProgress(false)
  }

  // Replace the handleSubmit function with this updated version that checks for category changes
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    setSuccess(null)
    setShowProgress(true)
    setProgress(5)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Subcategory name is required")
        setShowProgress(false)
        setSubmitting(false)
        return
      }

      if (!formData.category_id) {
        if (categoryDeleted) {
          toast.error(`Please select a new category. The original category "${deletedCategoryName}" has been deleted.`)
        } else {
          toast.error("Please select a category")
        }
        setShowProgress(false)
        setSubmitting(false)
        return
      }

      // Verify the selected category still exists
      const selectedCategory = categories.find((cat) => cat.id.toString() === formData.category_id.toString())
      if (!selectedCategory) {
        toast.error("The selected category is no longer available. Please select a different category.")
        setFormData((prev) => ({ ...prev, category_id: "" }))
        setShowProgress(false)
        setSubmitting(false)
        return
      }

      // Add this new validation for image
      if (!isEdit && !formData.image) {
        toast.error("Subcategory image is required")
        setShowProgress(false)
        setSubmitting(false)
        return
      }

      if (isEdit && !imagePreview && !formData.image) {
        toast.error("Subcategory image is required")
        setShowProgress(false)
        setSubmitting(false)
        return
      }

      // Explicitly validate name uniqueness when button is clicked
      setProgress(15)
      const isNameUnique = await checkNameUniqueness(formData.name, formData.category_id)

      if (!isNameUnique) {
        toast.error("A subcategory with this name already exists in the selected category.")
        setShowProgress(false)
        setSubmitting(false)
        return
      }

      // Check if category has changed during edit
      if (isEdit && originalCategoryId && formData.category_id !== originalCategoryId) {
        // Category has changed, show confirmation modal
        const dataToSubmit = { ...formData }

        // If we're editing and the image was removed, make sure to include the flag
        if (isEdit && dataToSubmit.remove_image) {
          dataToSubmit.remove_image = true
        }

        setPendingFormData(dataToSubmit)
        setShowCategoryChangeModal(true)
        return // Don't proceed with submission yet
      }

      // Continue with form submission...
      // Create a copy of form data to submit
      const dataToSubmit = { ...formData }
      setProgress(40)

      // If we're editing and the image was removed, make sure to include the flag
      if (isEdit && dataToSubmit.remove_image) {
        // Ensure the remove_image flag is included
        dataToSubmit.remove_image = true
      }

      console.log("Form data being submitted:", dataToSubmit)

      // Proceed with submission
      await proceedWithSubmission(dataToSubmit)
    } catch (err) {
      console.error("Form submission error:", err)
      toast.error("An error occurred. Please try again.")
      setSubmitting(false)
      setTimeout(() => {
        setShowProgress(false)
      }, 1500)
    }
  }

  // Remove image preview
  const removeImage = () => {
    setImagePreview(null)
    setFormData((prev) => ({
      ...prev,
      image: null,
      remove_image: true, // Add this flag to explicitly tell backend to remove the image
    }))

    // Reset file input
    const fileInput = document.getElementById("image")
    if (fileInput) {
      fileInput.value = ""
    }
  }

  // Go back
  const goBack = () => {
    navigate(isEdit ? `/subcategories/${id}` : "/subcategories")
  }

  // Navigate to create category page
  const navigateToCreateCategory = () => {
    navigate("/categories/create")
  }

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()),
  )

  // Get category names for display
  const getOriginalCategoryName = () => {
    if (!originalCategoryId) return ""
    const originalCategory = categories.find((cat) => cat.id.toString() === originalCategoryId.toString())
    return originalCategory ? originalCategory.name : "Unknown Category"
  }

  const getNewCategoryName = () => {
    if (!formData.category_id) return ""
    const newCategory = categories.find((cat) => cat.id.toString() === formData.category_id.toString())
    return newCategory ? newCategory.name : "Unknown Category"
  }

  // Get selected category name for display
  const getSelectedCategoryName = () => {
    if (!formData.category_id) return ""
    const selectedCategory = categories.find((cat) => cat.id.toString() === formData.category_id.toString())
    return selectedCategory ? selectedCategory.name : ""
  }

  const loading = subcategoryLoading || categoriesLoading

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Category Change Confirmation Modal */}
      {showCategoryChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6" style={{ color: "#d3ae6e" }} />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Category Change Warning</h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You are changing the category of this subcategory from <strong>"{getOriginalCategoryName()}"</strong> to{" "}
                <strong>"{getNewCategoryName()}"</strong>.
              </p>

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: "#d3ae6e20", borderColor: "#d3ae6e40", borderWidth: "1px" }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5" style={{ color: "#d3ae6e" }} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium" style={{ color: "#8b7355" }}>
                      Important Notice
                    </h4>
                    <div className="mt-2 text-sm" style={{ color: "#6b5d4f" }}>
                      <p>
                        <strong>All products</strong> that belong to this subcategory will be automatically moved to the
                        new category <strong>"{getNewCategoryName()}"</strong>. This change will affect:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Product categorization and organization</li>
                        <li>Product search and filtering</li>
                        <li>Category-based reports and analytics</li>
                        <li>Customer browsing experience</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCategoryChangeCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCategoryChangeConfirm}
                className="px-4 py-2 text-white rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "#d3ae6e",
                  ":hover": { backgroundColor: "#c19d5e" },
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#c19d5e")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#d3ae6e")}
              >
                Continue with Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help tooltip */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-ramesh-gold" />
              {isEdit ? "Edit Subcategory Help" : "Create Subcategory Help"}
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What am I doing here?</h4>
                <p>
                  {isEdit
                    ? "You're updating an existing subcategory."
                    : "You're creating a new subcategory for your products."}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Required fields:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Category</span> - The parent category this subcategory belongs to
                  </li>
                  <li>
                    <span className="font-medium">Name</span> - What customers will see
                  </li>
                  <li>
                    <span className="font-medium">Status</span> - Active subcategories are visible to customers
                  </li>
                  <li>
                    <span className="font-medium">Image</span> - A picture for the subcategory
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Optional fields:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Description</span> - Details about the subcategory
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use clear, descriptive names</li>
                  <li>Add an image to make subcategories more appealing</li>
                  <li>Keep descriptions short and helpful</li>
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

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <div className="bg-ramesh-gold/10 p-2 rounded-lg mr-3">
              <Tag className="h-6 w-6 text-ramesh-gold" />
            </div>
            {isEdit ? "Edit Subcategory" : "Create New Subcategory"}
          </h1>
          <p className="text-gray-600 ml-12">
            {isEdit ? "Update the information for this subcategory" : "Fill in the details to create a new subcategory"}
            {location.state?.preselectedCategoryName && !isEdit && (
              <span className="text-ramesh-gold font-medium"> for {location.state.preselectedCategoryName}</span>
            )}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || isCheckingName || !isNameValid}
            className="px-6 py-3 bg-ramesh-gold text-white rounded-lg font-medium hover:bg-ramesh-gold/90 shadow-sm disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? "Updating..." : "Creating..."}
              </span>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Subcategory"
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {showProgress && (
          <div className="p-4 border-b border-gray-200 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-ramesh-gold h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{progress}% complete</p>
          </div>
        )}

        {categoryDeleted && (
          <div className="p-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Category Deleted</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    The original category "{deletedCategoryName}" has been deleted. You must select a new category
                    before you can update this subcategory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && !isEdit ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold mb-4"></div>
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Category selection and basic info */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {/* Category selection - First field */}
                  <div>
                    <label htmlFor="category_id" className="block text-base font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div
                        className={`w-full px-4 py-3 border ${
                          categoryDeleted ? "border-red-500 bg-red-50" : "border-gray-300"
                        } rounded-lg flex items-center justify-between cursor-pointer bg-white`}
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      >
                        <span
                          className={`${
                            formData.category_id ? "text-gray-900" : categoryDeleted ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          {formData.category_id
                            ? getSelectedCategoryName() || "Select a category"
                            : categoriesLoading
                              ? "Loading categories..."
                              : categoryDeleted
                                ? `Select a new category (${deletedCategoryName} was deleted)`
                                : "Select a category"}
                        </span>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>

                      {showCategoryDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                          <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search categories..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent text-sm"
                                value={categorySearchQuery}
                                onChange={(e) => setCategorySearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          <div className="max-h-60 overflow-y-auto">
                            {categoriesLoading ? (
                              <div className="px-4 py-3 text-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ramesh-gold mx-auto"></div>
                                <p className="text-sm text-gray-500 mt-2">Loading all categories...</p>
                              </div>
                            ) : filteredCategories.length > 0 ? (
                              filteredCategories.map((category) => (
                                <div
                                  key={category.id}
                                  className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                                    formData.category_id === category.id.toString()
                                      ? "bg-ramesh-gold/10 text-ramesh-gold"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      category_id: category.id.toString(),
                                    }))
                                    setShowCategoryDropdown(false)
                                    setCategorySearchQuery("")
                                  }}
                                >
                                  {category.name}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 text-center">No categories found</div>
                            )}
                          </div>

                          <div className="p-2 border-t border-gray-100">
                            <button
                              type="button"
                              className="w-full flex items-center justify-center px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigateToCreateCategory()
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Category
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${categoryDeleted ? "text-red-600" : "text-gray-500"}`}>
                      {categoryDeleted
                        ? `The original category "${deletedCategoryName}" was deleted. Please select a new category.`
                        : location.state?.preselectedCategoryName && !isEdit
                          ? `Pre-selected category: ${location.state.preselectedCategoryName}`
                          : "Select the parent category this subcategory belongs to."}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
                      Subcategory Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${
                          nameError ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base`}
                        required
                        placeholder="Enter subcategory name"
                      />
                      {isCheckingName && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ramesh-gold"></div>
                        </div>
                      )}
                    </div>
                    {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      This is what customers will see when browsing your products.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                      placeholder="Describe this subcategory..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional description to help customers understand this subcategory.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="status" className="block text-base font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Only active subcategories are visible to customers.</p>
                    </div>

                    <div>
                      <label htmlFor="display_order" className="block text-base font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        id="display_order"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Lower numbers appear first in listings.</p>
                    </div>
                  </div>

                  {/* Advanced fields toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center text-ramesh-gold hover:text-ramesh-gold/80 font-medium"
                    >
                      {showAdvanced ? (
                        <ChevronDown className="h-5 w-5 mr-2" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-2" />
                      )}
                      Advanced SEO Settings
                    </button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
                      <div>
                        <label htmlFor="meta_title" className="block text-base font-medium text-gray-700 mb-1">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          id="meta_title"
                          name="meta_title"
                          value={formData.meta_title}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                          placeholder="SEO title for search engines"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Title that appears in search engine results (recommended: 50-60 characters).
                        </p>
                      </div>

                      <div>
                        <label htmlFor="meta_description" className="block text-base font-medium text-gray-700 mb-1">
                          Meta Description
                        </label>
                        <textarea
                          id="meta_description"
                          name="meta_description"
                          value={formData.meta_description}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                          placeholder="Brief description for search engines"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Description that appears in search engine results (recommended: 150-160 characters).
                        </p>
                      </div>

                      <div>
                        <label htmlFor="meta_keywords" className="block text-base font-medium text-gray-700 mb-1">
                          Meta Keywords
                        </label>
                        <input
                          type="text"
                          id="meta_keywords"
                          name="meta_keywords"
                          value={formData.meta_keywords}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Comma-separated keywords related to this subcategory.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - Image upload */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <ImageIcon className="h-5 w-5 mr-2 text-ramesh-gold" />
                      Subcategory Image <span className="text-red-500 ml-1">*</span>
                    </h3>

                    {imagePreview ? (
                      <div className="relative">
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-white border border-gray-200">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`aspect-square w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          dragActive
                            ? "border-ramesh-gold bg-ramesh-gold/5"
                            : "border-gray-300 hover:border-ramesh-gold hover:bg-ramesh-gold/5"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("image").click()}
                      >
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 text-center mb-2">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 text-center">PNG, JPG, GIF up to 5MB</p>
                        <p className="text-xs text-gray-400 text-center mt-1">
                          Recommended: 800x800 pixels (1:1 ratio)
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Image Guidelines:</p>
                          <ul className="text-xs space-y-1">
                            <li>• Use square images (1:1 ratio) for best results</li>
                            <li>• Minimum size: 400x400 pixels</li>
                            <li>• Images will be automatically converted to WebP format</li>
                            <li>• Clear, high-quality images work best</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showCategoryDropdown && <div className="fixed inset-0 z-5" onClick={() => setShowCategoryDropdown(false)}></div>}
    </div>
  )
}

export default SubcategoryForm
