"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCategory } from "../../contexts/CategoryContext"
import { useAuth } from "../../contexts/AuthContext"
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ImageIcon,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  Upload,
  Tag,
} from "lucide-react"
import { toast } from "react-toastify"

const CategoryForm = ({ isEdit = false }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    currentCategory,
    loading,
    error,
    getCategory,
    createCategory,
    updateCategory,
    isSuperAdmin,
    clearCurrentCategory,
    getCategories,
    categories,
    pagination,
  } = useCategory()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    display_order: 0,
    image: null,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    is_takeaway: false, // Add this new field
  })

  // UI state
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [formError, setFormError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // First, let's add a new state for tracking existing category names and submission progress
  // Add these to the existing state declarations (around line 30-40)

  const [existingCategoryNames, setExistingCategoryNames] = useState([])
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [nameError, setNameError] = useState(null)
  const [submitProgress, setSubmitProgress] = useState(0)
  const [isLoadingAllCategories, setIsLoadingAllCategories] = useState(false)

  // Load category data if editing
  useEffect(() => {
    if (isEdit && id) {
      getCategory(id)
    } else {
      clearCurrentCategory()
    }

    return () => {
      clearCurrentCategory()
    }
  }, [isEdit, id])

  // Populate form when currentCategory changes
  useEffect(() => {
    if (isEdit && currentCategory) {
      setFormData({
        name: currentCategory.name || "",
        description: currentCategory.description || "",
        status: currentCategory.status || "active",
        display_order: currentCategory.display_order || 0,
        image: null, // Don't populate file input
        meta_title: currentCategory.meta_title || "",
        meta_description: currentCategory.meta_description || "",
        meta_keywords: currentCategory.meta_keywords || "",
        is_takeaway: currentCategory.is_takeaway === 1 || currentCategory.is_takeaway === true, // Add this field
      })

      // Set image preview if exists
      if (currentCategory.image_url) {
        setImagePreview(currentCategory.image_url)
      }
    }
  }, [isEdit, currentCategory])

  // Add a function to fetch all category names from all pages
  // Add this after the useEffect blocks

  // Fetch all category names from all pages for validation
  const fetchAllCategoryNames = async () => {
    setIsLoadingAllCategories(true)
    setExistingCategoryNames([])

    try {
      // Use the context to get all categories
      // We'll need to import the actual service since the context doesn't expose a method to get all categories at once
      const categoryService = await import("../../services/categoryService").then((module) => module.default)

      // First, get the first page to determine total pages
      const response = await categoryService.getAllCategories({ limit: 100, page: 1 })

      if (response.status !== "success") {
        throw new Error(response.message || "Failed to fetch categories")
      }

      // Extract names from the first page
      let allNames = response.data.map((category) => ({
        id: category.id,
        name: category.name.toLowerCase().trim(),
      }))

      // If there are more pages, fetch them
      const totalPages = response.meta?.total_pages || 1

      if (totalPages > 1) {
        // Create an array of promises for all remaining pages
        const pagePromises = []

        for (let page = 2; page <= totalPages; page++) {
          pagePromises.push(categoryService.getAllCategories({ limit: 100, page }))
        }

        // Wait for all promises to resolve
        const pageResults = await Promise.all(pagePromises)

        // Process each page result
        pageResults.forEach((pageResponse) => {
          if (pageResponse.status === "success" && Array.isArray(pageResponse.data)) {
            const pageNames = pageResponse.data.map((category) => ({
              id: category.id,
              name: category.name.toLowerCase().trim(),
            }))
            allNames = [...allNames, ...pageNames]
          }
        })
      }

      setExistingCategoryNames(allNames)
      return allNames
    } catch (error) {
      console.error("Error fetching category names:", error)
      toast.error("Failed to fetch existing categories for validation")
      return []
    } finally {
      setIsLoadingAllCategories(false)
    }
  }

  // Add the following image conversion function after the existing utility functions (around line 150, after the fetchAllCategoryNames function):

  // Convert image to WebP format
  const convertToWebP = (file, quality = 0.8) => {
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

  // Add a function to check if the category name is unique
  // Add this after the fetchAllCategoryNames function

  // Check if category name is unique
  const checkNameUniqueness = async (name) => {
    if (!name.trim()) return true

    setIsCheckingName(true)
    setNameError(null)

    try {
      // If we haven't loaded category names yet, load them
      let names = existingCategoryNames
      if (names.length === 0) {
        names = await fetchAllCategoryNames()
      }

      // For edit mode, exclude the current category
      const normalizedName = name.toLowerCase().trim()
      const isDuplicate = names.some(
        (category) => category.name === normalizedName && (!isEdit || (isEdit && category.id !== Number.parseInt(id))),
      )

      if (isDuplicate) {
        setNameError("This category name already exists. Please choose a different name.")
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking name uniqueness:", error)
      return true // Allow submission if check fails
    } finally {
      setIsCheckingName(false)
    }
  }

  // Now, let's modify the handleChange function to check name uniqueness
  // Replace the existing handleChange function with this one

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

      // Check name uniqueness when name field changes
      if (name === "name") {
        // Debounce the check to avoid too many API calls
        if (window.nameCheckTimeout) {
          clearTimeout(window.nameCheckTimeout)
        }

        window.nameCheckTimeout = setTimeout(() => {
          checkNameUniqueness(value)
        }, 500)
      }
    }
  }

  // Now, let's modify the handleSubmit function to include name uniqueness check and progress bar
  // Replace the existing handleSubmit function with this one

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset states
    setSubmitting(true)
    setFormError(null)
    setSuccess(null)
    setSubmitProgress(0)

    try {
      // First check if the name is unique - do this explicitly when button is clicked
      setSubmitProgress(10)

      // Validate required fields
      if (!formData.name.trim()) {
        toast.error("Category name is required")
        setSubmitProgress(0)
        setSubmitting(false)
        return
      }

      // Add this new validation for image
      if (!isEdit && !formData.image) {
        toast.error("Category image is required")
        setSubmitProgress(0)
        setSubmitting(false)
        return
      }

      if (isEdit && !imagePreview && !formData.image) {
        toast.error("Category image is required")
        setSubmitProgress(0)
        setSubmitting(false)
        return
      }

      // Explicitly check name uniqueness when button is clicked
      const isNameUnique = await checkNameUniqueness(formData.name)

      if (!isNameUnique) {
        toast.error("Category name must be unique. Please choose a different name.")
        setSubmitProgress(0)
        setSubmitting(false)
        return
      }

      // Continue with form submission...

      // Create a copy of form data to submit
      const dataToSubmit = {
        ...formData,
        is_takeaway: formData.is_takeaway ? 1 : 0, // Convert boolean to integer for API
      }
      setSubmitProgress(30)

      // If we're editing and the image was removed, make sure to include the flag
      if (isEdit && dataToSubmit.remove_image) {
        // Ensure the remove_image flag is included
        dataToSubmit.remove_image = true
      }

      console.log("Form data being submitted:", dataToSubmit)
      setSubmitProgress(50)

      let success

      if (isEdit) {
        success = await updateCategory(id, dataToSubmit)
      } else {
        success = await createCategory(dataToSubmit)
      }

      setSubmitProgress(90)

      if (success) {
        toast.success(isEdit ? "Category updated successfully!" : "Category created successfully!")
        setSubmitProgress(100)

        // Navigate after a short delay
        setTimeout(() => {
          navigate(isEdit ? `/categories/${id}` : "/categories")
        }, 1500)
      } else {
        toast.error("Failed to save category. Please try again.")
        setSubmitProgress(0)
      }
    } catch (err) {
      console.error("Form submission error:", err)
      toast.error("An error occurred. Please try again.")
      setSubmitProgress(0)
    } finally {
      setSubmitting(false)
    }
  }

  // Add a useEffect to load all category names when the component mounts
  // Add this after the existing useEffect blocks

  // Load all category names for validation when component mounts
  useEffect(() => {
    fetchAllCategoryNames()
  }, [])

  // Replace the existing handleFileChange function with this updated version that includes WebP conversion:
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
    navigate(isEdit ? `/categories/${id}` : "/categories")
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Help tooltip */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-ramesh-gold" />
              {isEdit ? "Edit Category Help" : "Create Category Help"}
            </h3>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What am I doing here?</h4>
                <p>
                  {isEdit
                    ? "You're updating an existing category."
                    : "You're creating a new category for your products."}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Required fields:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Name</span> - What customers will see
                  </li>
                  <li>
                    <span className="font-medium">Status</span> - Active categories are visible to customers
                  </li>
                  <li>
                    <span className="font-medium">Image</span> - A picture for the category
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Optional fields:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Description</span> - Details about the category
                  </li>
                  <li>
                    <span className="font-medium">Total Orders Placed</span> - Shows total orders for this category
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Tips:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use clear, descriptive names</li>
                  <li>Add an image to make categories more appealing</li>
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

      {/* Replace the header section div (around line 430) with this updated version that includes both buttons: */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <div className="bg-ramesh-gold/10 p-2 rounded-lg mr-3">
                <Tag className="h-6 w-6 text-ramesh-gold" />
              </div>
              {isEdit ? "Edit Category" : "Create New Category"}
            </h1>
            <p className="text-gray-600 ml-12">
              {isEdit
                ? "Update the information for this category"
                : "Fill in the details to create a new product category"}
            </p>
          </div>
        </div>

        {/* Takeaway and Action buttons on same line */}
        <div className="flex items-center justify-between">
          {/* Takeaway Availability - Left side */}
          <label className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              id="is_takeaway"
              name="is_takeaway"
              checked={formData.is_takeaway}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_takeaway: e.target.checked }))}
              className="h-4 w-4 text-ramesh-gold focus:ring-ramesh-gold border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Enable Takeaway</span>
            {formData.is_takeaway && (
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </label>

          {/* Action buttons - Right side */}
          <div className="flex space-x-3">
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
              disabled={submitting || isCheckingName || nameError !== null || isLoadingAllCategories}
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
                "Create Category"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && !isEdit ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold mb-4"></div>
            <p className="text-gray-500">Loading category data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Add this right after the opening <form> tag (inside the form element) */}
            {submitProgress > 0 && (
              <div className="mb-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-ramesh-gold h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${submitProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{submitProgress}% complete</p>
              </div>
            )}

            {/* Add a loading indicator when fetching all categories */}
            {isLoadingAllCategories && (
              <div className="p-4 bg-blue-50 border-b border-blue-100 mb-4">
                <div className="flex items-start text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2 mt-0.5"></div>
                  <div>Loading all categories for validation...</div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Category image */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-ramesh-gold" />
                    Category Image <span className="text-red-500 ml-1">*</span>
                  </h2>

                  <div className="mb-4">
                    <div
                      className={`relative w-full aspect-square bg-white rounded-lg border-2 ${dragActive ? "border-ramesh-gold border-dashed bg-ramesh-gold/5" : "border-dashed border-gray-300"} flex flex-col items-center justify-center overflow-hidden`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Category Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload className="h-16 w-16 text-ramesh-gold mb-4" />
                          <p className="text-sm text-gray-500 mb-2">Drag and drop an image here, or</p>
                          <label className="px-4 py-2 bg-ramesh-gold text-white rounded-lg text-sm font-medium hover:bg-ramesh-gold/90 cursor-pointer transition-colors">
                            <span>Choose Image</span>
                            <input
                              type="file"
                              id="image"
                              name="image"
                              onChange={handleChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </label>
                        </>
                      )}
                    </div>
                    {/* Update the file size validation message in the image upload section: */}
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended size: 800x800 pixels (1:1 ratio). Max file size: 5MB. Images will be automatically
                      converted to WebP format for optimization.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right column - Category information */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                      required
                      placeholder="Enter category name"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This is what customers will see when browsing your products.
                    </p>
                    {/* Add this right after the <p className="text-xs text-gray-500 mt-1"> element for the name field */}
                    {nameError && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {nameError}
                      </p>
                    )}

                    {/* Add a loading indicator when checking name uniqueness */}
                    {isCheckingName && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-ramesh-gold mr-1"></div>
                        Checking name availability...
                      </div>
                    )}
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
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                      placeholder="Enter category description (optional)"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a short description of what this category contains.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="status" className="block text-base font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={formData.status === "active"}
                            onChange={handleChange}
                            className="h-4 w-4 text-ramesh-gold focus:ring-ramesh-gold border-gray-300"
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Active</span>
                            <span className="block text-xs text-gray-500">Visible to customers</span>
                          </div>
                          <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                        </label>

                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="status"
                            value="inactive"
                            checked={formData.status === "inactive"}
                            onChange={handleChange}
                            className="h-4 w-4 text-ramesh-gold focus:ring-ramesh-gold border-gray-300"
                          />
                          <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Inactive</span>
                            <span className="block text-xs text-gray-500">Hidden from customers</span>
                          </div>
                          <X className="ml-auto h-5 w-5 text-red-500" />
                        </label>
                      </div>
                    </div>
                    {isSuperAdmin && (
                      <div>
                        <label htmlFor="display_order" className="block text-base font-medium text-gray-700 mb-1">
                          Total Orders Placed
                        </label>
                        <input
                          type="number"
                          id="display_order"
                          name="display_order"
                          value={formData.display_order}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm text-base"
                          placeholder="Enter total orders placed till date"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the total number of orders placed for this category till date.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Advanced settings (SEO) - Only for super admin */}
                  {isSuperAdmin && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        className="flex items-center text-gray-700 hover:text-ramesh-gold mb-4 transition-colors"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                      >
                        <Info className="h-5 w-5 mr-2" />
                        <span className="font-medium">Advanced Settings (SEO)</span>
                        {showAdvanced ? (
                          <ChevronDown className="ml-2 h-5 w-5" />
                        ) : (
                          <ChevronRight className="ml-2 h-5 w-5" />
                        )}
                      </button>

                      {showAdvanced && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div>
                            <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                              Meta Title
                            </label>
                            <input
                              type="text"
                              id="meta_title"
                              name="meta_title"
                              value={formData.meta_title}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                              placeholder="SEO title (optional)"
                            />
                          </div>

                          <div>
                            <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                              Meta Description
                            </label>
                            <textarea
                              id="meta_description"
                              name="meta_description"
                              value={formData.meta_description}
                              onChange={handleChange}
                              rows="2"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                              placeholder="SEO description (optional)"
                            ></textarea>
                          </div>

                          <div>
                            <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                              Meta Keywords
                            </label>
                            <input
                              type="text"
                              id="meta_keywords"
                              name="meta_keywords"
                              value={formData.meta_keywords}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm"
                              placeholder="SEO keywords, comma-separated (optional)"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CategoryForm
