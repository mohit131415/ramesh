"use client"

import { useEffect, useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card"
import { Plus, Trash2, AlertCircle, ImageOff, Save, X, ArrowUp, ArrowDown, RefreshCw } from "lucide-react"
import AddFeaturedItemModal from "../AddFeaturedItemModal"
import ReplaceItemModal from "../ReplaceItemModal"
import DeleteConfirmDialog from "../DeleteConfirmDialog"
import { useFeaturedItems } from "../../../contexts/FeaturedItemContext"
import { useAuth } from "../../../contexts/AuthContext"
import { toast } from "react-toastify"
import { buildImageUrl } from "../../../config/api.config"

const LOGO_PATH = "/ramesh-logo.svg"

const FeaturedProductsTab = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false)
  const [replaceItem, setReplaceItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [localProducts, setLocalProducts] = useState([])
  const [hasLocalChanges, setHasLocalChanges] = useState(false)

  const { user } = useAuth()
  const {
    featuredProducts,
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

  // Initialize data
  useEffect(() => {
    if (!hasInitialized) {
      fetchFeaturedItemsByType("product")
      setHasInitialized(true)
    }
  }, [fetchFeaturedItemsByType, hasInitialized])

  // Update local state when data changes
  useEffect(() => {
    if (featuredProducts && featuredProducts.length > 0) {
      setLocalProducts([...featuredProducts])
      setHasLocalChanges(false)
    }
  }, [featuredProducts])

  const handleAddProduct = () => {
    if (!limits) {
      toast.success("Please wait, loading...")
      return
    }
    if (featuredProducts.length >= limits.featured_product) {
      toast.error(`You can only add up to ${limits.featured_product} featured products`)
      return
    }
    setIsAddModalOpen(true)
  }

  const handleReplaceClick = (product) => {
    setReplaceItem(product)
    setIsReplaceModalOpen(true)
  }

  const handleDeleteClick = (product) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete featured items")
      return
    }
    setDeleteItem(product)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteItem) {
      await removeFeaturedItem(deleteItem.featured_item_id, "product")
      setIsDeleteDialogOpen(false)
      setDeleteItem(null)
    }
  }

  const handleItemReplaced = () => {
    // The page will refresh automatically after successful replacement
    // Just close the modal immediately
    setIsReplaceModalOpen(false)
    setReplaceItem(null)
  }

  // Move item up
  const moveUp = (index) => {
    if (index === 0) return // Already at top

    const newProducts = [...localProducts]
    // Swap with previous item
    const temp = newProducts[index]
    newProducts[index] = newProducts[index - 1]
    newProducts[index - 1] = temp

    setLocalProducts(newProducts)
    setHasLocalChanges(true)
    toast.success("Moved up! Don't forget to save.")
  }

  // Move item down
  const moveDown = (index) => {
    if (index === localProducts.length - 1) return // Already at bottom

    const newProducts = [...localProducts]
    // Swap with next item
    const temp = newProducts[index]
    newProducts[index] = newProducts[index + 1]
    newProducts[index + 1] = temp

    setLocalProducts(newProducts)
    setHasLocalChanges(true)
    toast.success("Moved down! Don't forget to save.")
  }

  const handleSaveChanges = async () => {
    const updatedItems = localProducts.map((product, index) => ({
      id: product.featured_item_id,
      display_order: index + 1,
      position: index + 1,
    }))

    const success = await saveDisplayOrder(updatedItems, "product")
    if (success) {
      setHasLocalChanges(false)
      toast.success("Order saved successfully!")
    }
  }

  const handleDiscardChanges = () => {
    setLocalProducts([...featuredProducts])
    setHasLocalChanges(false)
    toast.info("Changes cancelled")
  }

  const getImageUrl = (product) => {
    if (product.image && typeof product.image === "string" && product.image.trim() !== "") {
      const cleanPath = product.image.replace(/\\\//g, "/")
      return buildImageUrl(cleanPath)
    }
    if (
      product.image_url &&
      typeof product.image_url === "string" &&
      product.image_url.trim() !== "" &&
      product.image_url.startsWith("http")
    ) {
      return product.image_url
    }
    if (product.primary_image && typeof product.primary_image === "string" && product.primary_image.trim() !== "") {
      return buildImageUrl(product.primary_image)
    }
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img) => img.is_primary === 1)
      if (primaryImage && primaryImage.image_path) {
        return buildImageUrl(primaryImage.image_path)
      }
      if (product.images[0].image_path) {
        return buildImageUrl(product.images[0].image_path)
      }
    }
    return null
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm border-muted">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card className="shadow-sm border-muted">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-destructive font-medium">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={() => fetchFeaturedItemsByType("product")}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="bg-muted/10 pb-4">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Featured Products</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              These products will appear first on your website homepage
            </p>
          </div>
          <Button
            onClick={handleAddProduct}
            size="lg"
            className="bg-primary hover:bg-primary/90 px-6"
            disabled={!limits || featuredProducts.length >= limits.featured_product}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {localProducts.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/5">
            <ImageOff className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No featured products yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add products here to showcase them prominently on your website's homepage. Customers will see these first!
            </p>
            <Button onClick={handleAddProduct} size="lg" variant="outline" className="px-8">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {localProducts.map((product, index) => (
              <div
                key={product.featured_item_id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/5 transition-colors"
              >
                {/* Position Number */}
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  {index + 1}
                </div>

                {/* Product Image */}
                <div className="h-12 w-12 rounded-md overflow-hidden bg-muted/10 flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const imageUrl = getImageUrl(product)
                    return imageUrl ? (
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = LOGO_PATH
                        }}
                      />
                    ) : (
                      <ImageOff className="h-6 w-6 text-muted-foreground/50" />
                    )
                  })()}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  {product.sku && <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>}
                </div>

                {/* Arrow Controls */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={`h-8 w-8 ${index === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted/20"}`}
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveDown(index)}
                    disabled={index === localProducts.length - 1}
                    className={`h-8 w-8 ${
                      index === localProducts.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted/20"
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
                  onClick={() => handleReplaceClick(product)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                  title="Replace"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                {/* Delete Button - Only show for super_admin */}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(product)}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Save/Cancel Footer */}
      {hasLocalChanges && (
        <CardFooter className="bg-yellow-50 border-t-2 border-yellow-200 p-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="font-medium text-yellow-800">You have unsaved changes</p>
              <p className="text-sm text-yellow-700">Don't forget to save your new order!</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDiscardChanges} className="px-6">
                <X className="mr-2 h-4 w-4" />
                Cancel Changes
              </Button>
              <Button onClick={handleSaveChanges} className="px-6 bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                Save New Order
              </Button>
            </div>
          </div>
        </CardFooter>
      )}

      {/* Modals */}
      <AddFeaturedItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        type="product"
        onItemAdded={() => setIsAddModalOpen(false)}
      />

      <ReplaceItemModal
        isOpen={isReplaceModalOpen}
        onClose={() => {
          setIsReplaceModalOpen(false)
          setReplaceItem(null)
        }}
        type="product"
        currentItem={replaceItem}
        onItemReplaced={handleItemReplaced}
      />

      {canDelete && (
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Remove Featured Product"
          description={`Are you sure you want to remove "${deleteItem?.name}" from featured products? It will no longer appear on your website homepage.`}
        />
      )}
    </Card>
  )
}

export default FeaturedProductsTab
