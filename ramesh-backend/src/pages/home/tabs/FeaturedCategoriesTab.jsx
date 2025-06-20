"use client"

import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card"
import { Plus, Trash2, AlertCircle, ArrowUp, ArrowDown, ImageOff, Save, X, RefreshCw } from "lucide-react"
import AddFeaturedItemModal from "../AddFeaturedItemModal"
import DeleteConfirmDialog from "../DeleteConfirmDialog"
import { useFeaturedItems } from "../../../contexts/FeaturedItemContext"
import { useAuth } from "../../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./animations.css"
import ReplaceItemModal from "../ReplaceItemModal"
import { buildImageUrl } from "../../../config/api.config"

const LOGO_PATH = "/ramesh-logo.svg"

const FeaturedCategoriesTab = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [localCategories, setLocalCategories] = useState([])
  const [hasLocalChanges, setHasLocalChanges] = useState(false)
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false)
  const [replaceItem, setReplaceItem] = useState(null)

  const { user } = useAuth()
  const {
    featuredCategories,
    limits,
    isLoading,
    hasError,
    errorMessage,
    fetchFeaturedItemsByType,
    removeFeaturedItem,
    saveDisplayOrder,
  } = useFeaturedItems()
  const [hasInitialized, setHasInitialized] = useState(false)

  // Check if user can delete (only super_admin can delete)
  const canDelete = user?.role === "super_admin"

  // Fetch featured categories on component mount - only once
  useEffect(() => {
    if (!hasInitialized) {
      fetchFeaturedItemsByType("category")
      setHasInitialized(true)
    }
  }, [fetchFeaturedItemsByType, hasInitialized])

  // Update local categories when featured categories change
  useEffect(() => {
    if (featuredCategories && featuredCategories.length > 0) {
      setLocalCategories([...featuredCategories])
      setHasLocalChanges(false)
    }
  }, [featuredCategories])

  const handleAddCategory = () => {
    if (!limits) {
      toast.error("Cannot add category: Limits not loaded")
      return
    }

    if (featuredCategories.length >= limits.featured_category) {
      toast.error(`You can only add up to ${limits.featured_category} featured categories`)
      return
    }

    setIsAddModalOpen(true)
  }

  const handleDeleteClick = (category) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete featured items")
      return
    }
    setDeleteItem(category)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteItem) {
      await removeFeaturedItem(deleteItem.featured_item_id, "category")
      setIsDeleteDialogOpen(false)
      setDeleteItem(null)
    }
  }

  const handleReplaceClick = (category) => {
    setReplaceItem(category)
    setIsReplaceModalOpen(true)
  }

  const handleItemReplaced = () => {
    // The page will refresh automatically after successful replacement
    // Just close the modal immediately
    setIsReplaceModalOpen(false)
    setReplaceItem(null)
  }

  const handleRetry = () => {
    fetchFeaturedItemsByType("category")
  }

  const handleMoveUp = (index) => {
    if (index === 0) return

    const newCategories = [...localCategories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index - 1]
    newCategories[index - 1] = temp

    setLocalCategories(newCategories)
    setHasLocalChanges(true)
  }

  const handleMoveDown = (index) => {
    if (index === localCategories.length - 1) return

    const newCategories = [...localCategories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index + 1]
    newCategories[index + 1] = temp

    setLocalCategories(newCategories)
    setHasLocalChanges(true)
  }

  const handleSaveChanges = async () => {
    const updatedItems = localCategories.map((category, index) => ({
      id: category.featured_item_id,
      display_order: index + 1,
      position: index + 1,
    }))

    const success = await saveDisplayOrder(updatedItems, "category")
    if (success) {
      setHasLocalChanges(false)
      toast.success("Category order saved successfully!")
    }
  }

  const handleDiscardChanges = () => {
    setLocalCategories([...featuredCategories])
    setHasLocalChanges(false)
    toast.info("Changes discarded")
  }

  // Function to get the correct image URL
  const getImageUrl = (category) => {
    if (category.image && typeof category.image === "string" && category.image.trim() !== "") {
      const cleanPath = category.image.replace(/\\\//g, "/")
      return buildImageUrl(cleanPath)
    }

    if (
      category.image_url &&
      typeof category.image_url === "string" &&
      category.image_url.trim() !== "" &&
      category.image_url.startsWith("http")
    ) {
      return category.image_url
    }

    return null
  }

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/10 pb-2">
        <CardTitle className="text-xl font-semibold">Featured Categories</CardTitle>
        <Button
          onClick={handleAddCategory}
          size="sm"
          className="bg-primary hover:bg-primary/90"
          disabled={isLoading || !limits || featuredCategories.length >= limits.featured_category}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-destructive font-medium">Error loading featured categories</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        ) : localCategories && localCategories.length > 0 ? (
          <div className="space-y-3">
            {localCategories.map((category, index) => (
              <div
                key={`${category.featured_item_id}-${index}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/5 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted/10 flex items-center justify-center">
                    {(() => {
                      const imageUrl = getImageUrl(category)
                      return imageUrl ? (
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={category.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = LOGO_PATH
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted/20">
                          <ImageOff className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )
                    })()}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.title && <p className="text-xs text-muted-foreground">{category.title}</p>}
                    {category.product_count !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">{category.product_count}</span> products
                      </p>
                    )}
                    {category.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveUp(index)}
                      disabled={isLoading || index === 0}
                      className={`h-8 w-8 ${index === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted/20"}`}
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveDown(index)}
                      disabled={isLoading || index === localCategories.length - 1}
                      className={`h-8 w-8 ${
                        index === localCategories.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted/20"
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Replace Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleReplaceClick(category)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                    title="Replace"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {/* Delete Button - Only show for super_admin */}
                  {canDelete && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(category)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed rounded-md bg-muted/5">
            <div className="flex flex-col items-center justify-center space-y-2">
              <ImageOff className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground font-medium">No featured categories added yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Click "Add Category" to feature categories on the homepage
              </p>
              <Button onClick={handleAddCategory} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Category
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {hasLocalChanges && (
        <CardFooter className="flex justify-between items-center bg-yellow-50 border-t pt-3">
          <p className="text-sm text-yellow-700 font-medium">You have unsaved changes</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDiscardChanges} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSaveChanges} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Save New Order
            </Button>
          </div>
        </CardFooter>
      )}

      <AddFeaturedItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        type="category"
        onItemAdded={() => {
          setIsAddModalOpen(false)
        }}
      />

      <ReplaceItemModal
        isOpen={isReplaceModalOpen}
        onClose={() => {
          setIsReplaceModalOpen(false)
          setReplaceItem(null)
        }}
        type="category"
        currentItem={replaceItem}
        onItemReplaced={handleItemReplaced}
      />

      {canDelete && (
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Remove Featured Category"
          description={`Are you sure you want to remove "${deleteItem?.name}" from featured categories?`}
        />
      )}
    </Card>
  )
}

export default FeaturedCategoriesTab
