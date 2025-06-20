"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  ImageIcon,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  Zap,
  Edit,
  Sparkles,
} from "lucide-react"
import { toast } from "react-toastify"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import ImageEditModal from "../components/ImageEditModal"
import { useProduct } from "../../../contexts/ProductContext"

const ImagesTab = ({ images = [], onChange, productId = null, formData, setFormData }) => {
  const { uploadProductImages, loading: contextLoading } = useProduct()

  const [uploading, setUploading] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const fileInputRef = useRef(null)
  const [localImages, setLocalImages] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingUploads, setPendingUploads] = useState([])
  const [hoveredImage, setHoveredImage] = useState(null)

  // Image Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [imagesToEdit, setImagesToEdit] = useState([])
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [editingImageId, setEditingImageId] = useState(null)

  // Helper function to construct proper image URL
  const getImageUrl = useCallback((image) => {
    if (!image) return "/placeholder.svg"

    // If it's a blob URL (for new/edited images), return as is
    if (image.url && image.url.startsWith("blob:")) {
      return image.url
    }

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
  }, [])

  // Memoized handleImagesChange to prevent excessive re-renders
  const handleImagesChange = useCallback(
    (images, imageOperations = {}) => {
      const currentImageOps = formData?.imageOperations || {
        keep_existing_images: true,
        delete_image_ids: [],
        image_ids: [],
        image_order: [],
        primary_image_id: null,
      }

      const deletedImageIds = [...(currentImageOps.delete_image_ids || [])]
      const imageIds = []
      const imageOrder = []
      let primaryImageId = currentImageOps.primary_image_id

      // Find images that were removed
      if (localImages && localImages.length > 0) {
        const currentImageIds = images.map((img) => img.id)
        const removedImages = localImages.filter((img) => !img.isNew && !currentImageIds.includes(img.id))

        removedImages.forEach((img) => {
          if (img.id && !isNaN(Number(img.id)) && !deletedImageIds.includes(img.id)) {
            deletedImageIds.push(img.id)
          }
        })
      }

      // Create imageIds and imageOrder arrays
      const existingImages = images.filter((img) => !img.isNew && img.id && !isNaN(Number(img.id)))

      existingImages.forEach((img, index) => {
        imageIds.push(img.id)
        imageOrder.push(img.id)

        if (img.is_primary) {
          primaryImageId = img.id
        }
      })

      if (!primaryImageId && existingImages.length > 0) {
        primaryImageId = existingImages[0].id
      }

      const comprehensiveImageOperations = {
        keep_existing_images: true,
        delete_image_ids: deletedImageIds.length > 0 ? deletedImageIds : [],
        image_ids: imageIds.length > 0 ? imageIds : [],
        image_order: imageOrder.length > 0 ? imageOrder : [],
        primary_image_id: primaryImageId || null,
      }

      onChange(
        images.map((img, index) => ({
          ...img,
          display_order: index,
        })),
        comprehensiveImageOperations,
      )
    },
    [formData?.imageOperations, localImages, onChange],
  )

  // Initialize local images from props
  useEffect(() => {
    if (images && images.length > 0) {
      const currentIds = localImages
        .map((img) => img.id)
        .sort()
        .join(",")
      const newIds = images
        .map((img) => img.id || `temp-${Date.now()}-${images.indexOf(img)}`)
        .sort()
        .join(",")

      if (currentIds === newIds && localImages.length === images.length) {
        return
      }

      const processedImages = images.map((img, index) => ({
        ...img,
        id: img.id || `temp-${Date.now()}-${index}`,
        is_primary: img.is_primary === 1 || img.is_primary === true,
        display_order: img.display_order !== undefined ? img.display_order : index,
        url: img.url || img.image_url || null,
        isNew: img.isNew || false,
      }))

      const normalizedImages = processedImages.map((img, index) => {
        return { ...img, is_primary: index === 0 }
      })

      const sortedImages = [...normalizedImages].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

      setLocalImages(sortedImages)
    } else if (images && images.length === 0 && localImages.length > 0) {
      setLocalImages([])
    }
  }, [images])

  // Effect to handle pending uploads when productId becomes available
  useEffect(() => {
    const processPendingUploads = async () => {
      if (productId && pendingUploads.length > 0) {
        setUploading(true)
        try {
          const tempImages = []

          for (const fileData of pendingUploads) {
            for (const file of fileData.files) {
              const localUrl = URL.createObjectURL(file)
              tempImages.push({
                id: `temp-${Date.now()}-${Math.random()}`,
                file: file,
                url: localUrl,
                filename: file.name,
                is_primary: localImages.length === 0 && tempImages.length === 0,
                display_order: localImages.length + tempImages.length,
                isNew: true,
              })
            }
          }

          if (tempImages.length > 0) {
            const updatedImages = [...localImages, ...tempImages]
            setLocalImages(updatedImages)
            handleImagesChange(updatedImages)
            toast.success(`${tempImages.length} image(s) prepared for upload`)
          }

          setPendingUploads([])
        } catch (error) {
          console.error("Error processing pending uploads:", error)
          toast.error("Error processing pending uploads")
        } finally {
          setUploading(false)
        }
      }
    }

    processPendingUploads()
  }, [productId, pendingUploads, localImages, handleImagesChange])

  // Simplified file processing
  const processFiles = async (files) => {
    return files
  }

  // Handle file selection
  const handleFileChange = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesToProcess = Array.from(files)
    const validFiles = validateFiles(filesToProcess)

    if (validFiles.length > 0) {
      prepareImagesForEditing(validFiles)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Prepare images for editing
  const prepareImagesForEditing = (files) => {
    const imagesToEditArray = files.map((file) => {
      return {
        file: file,
        url: URL.createObjectURL(file),
        id: `temp-${Date.now()}-${Math.random()}`,
        filename: file.name,
        isNew: true,
      }
    })

    setImagesToEdit(imagesToEditArray)
    setIsEditingExisting(false)
    setEditingImageId(null)
    setEditModalOpen(true)
  }

  // Handle edit existing image
  const handleEditImage = async (imageId) => {
    try {
      const imageToEdit = localImages.find((img) => img.id === imageId)
      if (!imageToEdit) return

      const imageUrl = getImageUrl(imageToEdit)

      if (imageUrl === "/placeholder.svg") {
        toast.error("Cannot edit placeholder image")
        return
      }

      const blob = await createBlobFromImageUrl(imageUrl)
      const filename = imageToEdit.filename || `image-${Date.now()}.jpg`
      const file = new File([blob], filename, {
        type: blob.type || "image/jpeg",
        lastModified: Date.now(),
      })

      const objectUrl = URL.createObjectURL(blob)

      const imagesToEditArray = [
        {
          file: file,
          url: objectUrl,
          id: imageToEdit.id,
          filename: filename,
          originalUrl: imageUrl,
          isNew: imageToEdit.isNew,
        },
      ]

      setImagesToEdit(imagesToEditArray)
      setIsEditingExisting(true)
      setEditingImageId(imageId)
      setEditModalOpen(true)
    } catch (error) {
      console.error("Error preparing image for editing:", error)
      toast.error("Failed to prepare image for editing")
    }
  }

  // Create a blob from an image URL
  const createBlobFromImageUrl = async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob from image"))
          }
        })
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = url
    })
  }

  // Handle finish editing from modal
  const handleFinishEditing = async (editedImages) => {
    try {
      if (isEditingExisting) {
        const editedImage = editedImages[0]
        const imageToEdit = localImages.find((img) => img.id === editingImageId)

        if (!imageToEdit) {
          toast.error("Could not find the image to edit")
          return
        }

        // Get the position and primary status of the original image
        const originalIndex = localImages.findIndex((img) => img.id === editingImageId)
        const isPrimary = imageToEdit.is_primary
        const displayOrder = imageToEdit.display_order || originalIndex

        // Add the old image ID to delete_image_ids if it's not a new image
        if (!imageToEdit.isNew && !isNaN(Number(editingImageId))) {
          const currentOps = formData?.imageOperations || {}
          const deleteIds = [...(currentOps.delete_image_ids || []), editingImageId]

          if (setFormData) {
            setFormData((prev) => ({
              ...prev,
              imageOperations: {
                ...prev.imageOperations,
                keep_existing_images: true,
                delete_image_ids: deleteIds,
              },
            }))
          }
        }

        // Upload the edited image using the same API as adding new images
        if (productId) {
          try {
            setUploading(true)

            // Use the same upload function as for new images
            const uploadResult = await uploadProductImages(productId, [editedImage.file])

            if (!uploadResult || !uploadResult.uploaded_images || uploadResult.uploaded_images.length === 0) {
              throw new Error("Failed to upload edited image")
            }

            // Get the newly uploaded image from the response
            const uploadedImage = uploadResult.uploaded_images[0]

            // Create a new array without the old image
            let updatedImages = localImages.filter((img) => img.id !== editingImageId)

            // Create the new image with the data from the API response
            const newImage = {
              ...uploadedImage,
              id: uploadedImage.id.toString(),
              is_primary: isPrimary,
              display_order: displayOrder,
              isNew: false,
              isEdited: true,
              url: uploadedImage.image_url || uploadedImage.image_path,
              image_url: uploadedImage.image_url,
              image_path: uploadedImage.image_path,
              filename: uploadedImage.original_name || editedImage.filename,
            }

            // Insert the new image at the correct position
            updatedImages.splice(originalIndex, 0, newImage)

            // Reindex display orders
            updatedImages = updatedImages.map((img, idx) => ({
              ...img,
              display_order: idx,
            }))

            setLocalImages(updatedImages)
            handleImagesChange(updatedImages)
            toast.success("Image updated and uploaded successfully")
          } catch (error) {
            console.error("Error uploading edited image:", error)
            toast.error(`Failed to upload edited image: ${error.message}`)

            // Fall back to temporary image if upload fails
            const tempImage = {
              id: `temp-${Date.now()}-edited`,
              url: editedImage.url,
              file: editedImage.file,
              filename: editedImage.filename || imageToEdit.filename,
              is_primary: isPrimary,
              display_order: displayOrder,
              isNew: true,
              isEdited: true,
              originalId: imageToEdit.isNew ? imageToEdit.originalId : imageToEdit.id,
            }

            // Create a new array without the old image
            let updatedImages = localImages.filter((img) => img.id !== editingImageId)

            // Insert the temporary image at the correct position
            updatedImages.splice(originalIndex, 0, tempImage)

            // Reindex display orders
            updatedImages = updatedImages.map((img, idx) => ({
              ...img,
              display_order: idx,
            }))

            setLocalImages(updatedImages)
            handleImagesChange(updatedImages)
            toast.info("Image prepared for upload during form submission")
          } finally {
            setUploading(false)
          }
        } else {
          // If no productId yet, create a temporary image
          const tempImage = {
            id: `temp-${Date.now()}-edited`,
            url: editedImage.url,
            file: editedImage.file,
            filename: editedImage.filename || imageToEdit.filename,
            is_primary: isPrimary,
            display_order: displayOrder,
            isNew: true,
            isEdited: true,
            originalId: imageToEdit.isNew ? imageToEdit.originalId : imageToEdit.id,
          }

          // Create a new array without the old image
          let updatedImages = localImages.filter((img) => img.id !== editingImageId)

          // Insert the temporary image at the correct position
          updatedImages.splice(originalIndex, 0, tempImage)

          // Reindex display orders
          updatedImages = updatedImages.map((img, idx) => ({
            ...img,
            display_order: idx,
          }))

          setLocalImages(updatedImages)
          handleImagesChange(updatedImages)
          toast.info("Edited image will be uploaded when the product is saved")
        }
      } else {
        // Handle new image uploads (existing code)
        const processedFiles = await processFiles(editedImages.map((img) => img.file))
        if (processedFiles.length === 0) return

        if (!productId) {
          setPendingUploads((prev) => [...prev, { files: processedFiles }])

          const tempImages = await Promise.all(
            processedFiles.map(async (file, index) => {
              const localUrl = URL.createObjectURL(file)
              return {
                id: `temp-${Date.now()}-${index}`,
                file: file,
                url: localUrl,
                filename: file.name,
                is_primary: localImages.length === 0 && index === 0,
                display_order: localImages.length + index,
                isNew: true,
                willBePrimary: localImages.length === 0 && index === 0,
              }
            }),
          )

          const updatedImages = [...localImages, ...tempImages]

          let hasPrimary = false
          const normalizedImages = updatedImages.map((img) => {
            if (img.is_primary) {
              if (hasPrimary) {
                return { ...img, is_primary: false }
              }
              hasPrimary = true
              return img
            }
            return img
          })

          if (!hasPrimary && normalizedImages.length > 0) {
            normalizedImages[0].is_primary = true
            normalizedImages[0].willBePrimary = true
          }

          setLocalImages(normalizedImages)
          handleImagesChange(normalizedImages)

          toast.info("Images will be uploaded when the product is saved")
          return
        }

        try {
          setUploading(true)

          const uploadResult = await uploadProductImages(productId, processedFiles)

          if (!uploadResult || !uploadResult.uploaded_images) {
            throw new Error("No images were uploaded")
          }

          const uploadedImages = uploadResult.uploaded_images.map((img, index) => ({
            ...img,
            id: img.id.toString(),
            is_primary: img.is_primary === 1 || img.is_primary === true,
            display_order: Number.parseInt(img.display_order) || localImages.length + index,
            isNew: false,
            url: img.image_url || img.image_path,
            image_url: img.image_url,
            image_path: img.image_path,
            original_name: img.original_name,
          }))

          const allImages = [...localImages, ...uploadedImages]

          let hasPrimary = false
          const normalizedImages = allImages.map((img, index) => {
            if (img.is_primary && !hasPrimary) {
              hasPrimary = true
              return img
            } else if (img.is_primary && hasPrimary) {
              return { ...img, is_primary: false }
            }
            return img
          })

          if (!hasPrimary && normalizedImages.length > 0) {
            normalizedImages[0].is_primary = true
          }

          const sortedImages = normalizedImages.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          const finalImages = sortedImages.map((img, index) => ({
            ...img,
            display_order: index,
          }))

          setLocalImages(finalImages)
          handleImagesChange(finalImages)

          toast.success(`${processedFiles.length} image(s) uploaded successfully!`)
        } catch (error) {
          console.error("Error in upload process:", error)
          toast.error(`Failed to upload images: ${error.message}`)

          const tempImages = await Promise.all(
            processedFiles.map(async (file, index) => {
              const localUrl = URL.createObjectURL(file)
              return {
                id: `temp-${Date.now()}-${index}`,
                file: file,
                url: localUrl,
                filename: file.name,
                is_primary: localImages.length === 0 && index === 0,
                display_order: localImages.length + index,
                isNew: true,
              }
            }),
          )

          const updatedImages = [...localImages, ...tempImages]
          setLocalImages(updatedImages)
          handleImagesChange(updatedImages)
          toast.info("Images prepared for upload during form submission")
        } finally {
          setUploading(false)
        }
      }
    } catch (error) {
      console.error("Error processing edited images:", error)
      toast.error("Error processing edited images")
      setUploading(false)
    }
  }

  // Remove an image
  const removeImage = async (imageId) => {
    try {
      const imageToRemove = localImages.find((img) => img.id === imageId)

      if (!imageToRemove) return

      const updatedImages = localImages.filter((img) => img.id !== imageId)

      if (!imageToRemove.isNew && !isNaN(Number(imageId))) {
        const currentOps = formData?.imageOperations || {}
        const deleteIds = [...(currentOps.delete_image_ids || []), imageId]

        if (setFormData) {
          setFormData((prev) => ({
            ...prev,
            imageOperations: {
              keep_existing_images: true,
              delete_image_ids: deleteIds,
              image_ids: currentOps.image_ids || [],
              image_order: currentOps.image_order || [],
              primary_image_id: currentOps.primary_image_id || null,
            },
          }))
        }
      }

      if (updatedImages.length > 0) {
        updatedImages.forEach((img, i) => {
          img.is_primary = i === 0
        })
      }

      const reIndexedImages = updatedImages.map((img, i) => ({
        ...img,
        display_order: i,
      }))

      setLocalImages(reIndexedImages)
      handleImagesChange(reIndexedImages)

      if (imageToRemove.url && imageToRemove.url.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.url)
      }

      toast.success("Image removed")
    } catch (error) {
      console.error("Error removing image:", error)
      toast.error("Error removing image")
    }
  }

  // Move image up
  const moveImageUp = async (index) => {
    if (index <= 0) return

    try {
      const newImages = [...localImages]
      const temp = newImages[index]
      newImages[index] = newImages[index - 1]
      newImages[index - 1] = temp

      const updatedImages = newImages.map((img, i) => ({
        ...img,
        display_order: i,
      }))

      if (index === 1) {
        updatedImages.forEach((img, i) => {
          img.is_primary = i === 0
        })
      }

      setLocalImages(updatedImages)
      handleImagesChange(updatedImages)

      toast.success("Image moved up successfully")
    } catch (error) {
      console.error("Error moving image up:", error)
      toast.error("Failed to move image up")
    }
  }

  // Move image down
  const moveImageDown = async (index) => {
    if (index >= localImages.length - 1) return

    try {
      const newImages = [...localImages]
      const temp = newImages[index]
      newImages[index] = newImages[index + 1]
      newImages[index + 1] = temp

      const updatedImages = newImages.map((img, i) => ({
        ...img,
        display_order: i,
      }))

      if (index === 0) {
        updatedImages.forEach((img, i) => {
          img.is_primary = i === 0
        })
      }

      setLocalImages(updatedImages)
      handleImagesChange(updatedImages)

      toast.success("Image moved down successfully")
    } catch (error) {
      console.error("Error moving image down:", error)
      toast.error("Failed to move image down")
    }
  }

  // Handle display order change
  const handleDisplayOrderChange = async (imageId, newDisplayOrder) => {
    try {
      const adjustedOrder = Number.parseInt(newDisplayOrder) - 1
      if (isNaN(adjustedOrder)) return

      const imageToUpdate = localImages.find((img) => img.id === imageId)
      if (!imageToUpdate) return

      const updatedImages = [...localImages]
      const filteredImages = updatedImages.filter((img) => img.id !== imageId)
      const newPosition = Math.max(0, Math.min(adjustedOrder, filteredImages.length))
      filteredImages.splice(newPosition, 0, imageToUpdate)

      const reIndexedImages = filteredImages.map((img, index) => ({
        ...img,
        display_order: index,
      }))

      reIndexedImages.forEach((img, i) => {
        img.is_primary = i === 0
      })

      setLocalImages(reIndexedImages)
      handleImagesChange(reIndexedImages)

      toast.success("Image order updated successfully")
    } catch (error) {
      console.error("Error updating image order:", error)
      toast.error("Failed to update image order")
    }
  }

  // Open image preview
  const openImagePreview = (index) => {
    setCurrentImageIndex(index)
    setPreviewOpen(true)
  }

  // Navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : localImages.length - 1))
  }

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev < localImages.length - 1 ? prev + 1 : 0))
  }

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      const validFiles = validateFiles(droppedFiles)
      if (validFiles.length > 0) {
        prepareImagesForEditing(validFiles)
      }
    }
  }

  // Validate files
  const validateFiles = (files) => {
    const validFiles = []
    const maxSizeInBytes = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

    for (const file of files) {
      if (file.size > maxSizeInBytes) {
        toast.error(`${file.name}: File size exceeds the limit of 5 MB`)
        continue
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: File type not allowed. Allowed types: jpg, jpeg, png, webp`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      toast.error("No valid files to upload")
    }

    return validFiles
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f3] via-[#fdf9f0] to-[#fcf6ed] p-3 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Upload Zone */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div
                className={`transition-all duration-300 ease-out ${
                  isDragging
                    ? "bg-gradient-to-br from-[#d3ae6e]/20 via-[#e6c285]/15 to-[#f0d4a3]/20 scale-[1.01]"
                    : "bg-transparent"
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="p-4 sm:p-8 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#d3ae6e] via-[#e6c285] to-[#f0d4a3] flex items-center justify-center shadow-lg transition-all duration-300 ${
                        isDragging ? "scale-110 rotate-3" : "scale-100"
                      }`}
                    >
                      <Upload className={`h-6 w-6 sm:h-8 sm:w-8 text-white ${isDragging ? "animate-bounce" : ""}`} />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Upload Your Images</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">
                        Add multiple images and arrange them in custom order with our professional tools
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                      />

                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || contextLoading}
                        className="bg-gradient-to-r from-[#d3ae6e] via-[#e6c285] to-[#f0d4a3] hover:from-[#b8965a] hover:via-[#d3ae6e] hover:to-[#e6c285] text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-xl font-semibold"
                      >
                        {uploading || contextLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Choose Images
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {conversionProgress > 0 && (
                    <div className="mt-4 max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">Converting to WebP</span>
                        <span className="text-xs font-bold text-[#d3ae6e]">{Math.round(conversionProgress)}%</span>
                      </div>
                      <Progress value={conversionProgress} className="h-2 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Gallery */}
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50">
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#d3ae6e] to-[#e6c285] flex items-center justify-center shadow-lg">
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-gray-900">Image Gallery</span>
                    <div className="text-xs sm:text-sm font-normal text-gray-600 mt-1">
                      {localImages.length} {localImages.length === 1 ? "image" : "images"} uploaded
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {localImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                  {localImages.map((image, index) => {
                    const imageUrl = getImageUrl(image)

                    return (
                      <div
                        key={`${image.id}-${image.retryCount || 0}`}
                        className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border border-gray-200/50"
                        onMouseEnter={() => setHoveredImage(image.id)}
                        onMouseLeave={() => setHoveredImage(null)}
                      >
                        <div className="relative">
                          <div
                            className="relative w-full aspect-square cursor-pointer overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
                            onClick={() => openImagePreview(index)}
                            style={{ minHeight: "180px" }}
                          >
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt={`Product image ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              crossOrigin="anonymous"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                              <div className="flex gap-2">
                                <button
                                  className="bg-white/95 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm rounded-lg p-2 cursor-pointer transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openImagePreview(index)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-white/95 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm rounded-lg p-2 cursor-pointer transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditImage(image.id)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="bg-red-500/95 hover:bg-red-600 text-white shadow-lg backdrop-blur-sm rounded-lg p-2 cursor-pointer transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeImage(image.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {image.is_primary && (
                              <Badge className="bg-gradient-to-r from-[#d3ae6e] to-[#e6c285] text-white text-xs font-semibold shadow-lg">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                            {image.isNew && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-lg">
                                <Zap className="h-3 w-3 mr-1" />
                                New
                              </Badge>
                            )}
                            {image.isExisting && (
                              <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs font-semibold">
                                Existing
                              </Badge>
                            )}
                            {image.isEdited && (
                              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold shadow-lg">
                                <Edit className="h-3 w-3 mr-1" />
                                Edited
                              </Badge>
                            )}
                          </div>

                          <div className="absolute top-2 right-2">
                            <Badge className="bg-black/80 text-white text-sm font-bold shadow-lg backdrop-blur-sm">
                              #{index + 1}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={index + 1}
                                onChange={(e) => handleDisplayOrderChange(image.id, e.target.value)}
                                className="w-12 h-7 text-xs text-center border-gray-300 focus:border-[#d3ae6e] focus:ring-[#d3ae6e] rounded-md font-medium"
                                min="1"
                                max={localImages.length}
                              />
                              <div className="flex flex-col gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveImageUp(index)}
                                  className="h-5 w-5 p-0 text-gray-500 hover:text-[#d3ae6e] hover:bg-[#d3ae6e]/10 rounded-md"
                                  disabled={index === 0}
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveImageDown(index)}
                                  className="h-5 w-5 p-0 text-gray-500 hover:text-[#d3ae6e] hover:bg-[#d3ae6e]/10 rounded-md"
                                  disabled={index === localImages.length - 1}
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditImage(image.id)}
                                    className="h-7 w-7 p-0 text-gray-500 hover:text-[#d3ae6e] hover:bg-[#d3ae6e]/10 rounded-md"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Image</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(image.id)}
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove Image</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-20">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                    <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No images yet</h3>
                  <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto px-4">
                    Upload your first image to get started with our professional editing tools
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-[#d3ae6e] to-[#e6c285] hover:from-[#b8965a] hover:to-[#d3ae6e] text-white shadow-lg px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Add Your First Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl w-[95vw] sm:w-[90vw] p-0 overflow-hidden bg-white border-0 rounded-2xl shadow-2xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Image Preview</DialogTitle>
                <DialogDescription>Preview of product image</DialogDescription>
              </DialogHeader>

              <DialogClose className="absolute top-4 right-4 z-10 rounded-full p-2 bg-black/10 backdrop-blur-sm text-gray-800 hover:bg-black/20 transition-all duration-200">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </DialogClose>

              <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-gray-50 to-gray-100">
                {localImages.length > 0 && (
                  <div className="relative w-full max-w-2xl">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
                      <img
                        src={getImageUrl(localImages[currentImageIndex]) || "/placeholder.svg"}
                        alt={`Product image ${currentImageIndex + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 bg-white backdrop-blur-sm flex items-center justify-between border-t border-gray-200">
                <div className="text-gray-900 text-lg sm:text-xl font-semibold">
                  {localImages.length > 0 && (
                    <>
                      Image {currentImageIndex + 1} of {localImages.length}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevImage}
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-9 sm:h-10 px-3 sm:px-4 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 h-9 sm:h-10 px-3 sm:px-4 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <ImageEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            images={imagesToEdit}
            onFinish={handleFinishEditing}
            isEditing={isEditingExisting}
            editingImageId={editingImageId}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}

export default ImagesTab
