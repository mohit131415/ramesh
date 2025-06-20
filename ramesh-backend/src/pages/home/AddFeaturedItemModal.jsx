"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Search, AlertCircle, ImageOff, Info, Loader2 } from "lucide-react"
import { useFeaturedItems } from "../../contexts/FeaturedItemContext"
import { toast } from "react-toastify"
import { Checkbox } from "../../components/ui/checkbox"
import { Progress } from "../../components/ui/progress"
import { buildImageUrl } from "../../config/api.config"

const LOGO_PATH = "/ramesh-logo.svg"

const AddFeaturedItemModal = ({ isOpen, onClose, type, onItemAdded }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [addingProgress, setAddingProgress] = useState(0)
  const {
    addFeaturedItem,
    featuredProducts,
    featuredCategories,
    quickPicks,
    limits,
    fetchProductsForSelection,
    fetchCategoriesForSelection,
  } = useFeaturedItems()
  const searchInputRef = useRef(null)
  const dialogContentRef = useRef(null)

  // Determine the item type based on the section type
  const itemType = type === "category" ? "category" : "product"

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("")
      setSelectedItems([])
      setError(null)
      setIsAdding(false)
      setAddingProgress(0)
      setLoadingProgress(0)

      // Focus the search input when the modal opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)

      // Load items using the new API
      loadItems()
    }
  }, [isOpen, type])

  // Reload data when search term changes (with debouncing)
  useEffect(() => {
    if (!isOpen) return

    const timeoutId = setTimeout(() => {
      loadItems()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, isOpen, type])

  // Check if an item is already featured using the API response
  const isItemFeatured = (item) => {
    if (!item) return false

    // The new API returns is_featured flag directly
    return item.is_featured === 1
  }

  // Load items using the new selection API
  const loadItems = async () => {
    setIsLoading(true)
    setError(null)
    setLoadingProgress(0)

    try {
      setLoadingProgress(50)
      const fetchedItems = await fetchItems()

      setItems(fetchedItems)
      setFilteredItems(fetchedItems)
      setLoadingProgress(100)
    } catch (err) {
      setError(err.message || `Failed to load ${itemType}s`)
      toast.error(err.message || `Failed to load ${itemType}s`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch items using the new selection APIs through context
  const fetchItems = async () => {
    try {
      let fetchedItems

      if (itemType === "product") {
        // Add display_type parameter for products
        const displayType = type === "quick_pick" ? "quick_pick" : "featured_product"
        fetchedItems = await fetchProductsForSelection(displayType, searchTerm)
      } else {
        fetchedItems = await fetchCategoriesForSelection(searchTerm)
      }

      // The context methods return the items directly, not a response object
      return fetchedItems || []
    } catch (error) {
      throw error
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Get the current limit for this type
  const getCurrentLimit = () => {
    if (!limits) return 0

    switch (type) {
      case "product":
        return limits.featured_product || 0
      case "category":
        return limits.featured_category || 0
      case "quick_pick":
        return limits.quick_pick || 0
      default:
        return 0
    }
  }

  // Get the current count of featured items
  const getCurrentCount = () => {
    switch (type) {
      case "product":
        return featuredProducts.length
      case "category":
        return featuredCategories.length
      case "quick_pick":
        return quickPicks.length
      default:
        return 0
    }
  }

  // Get remaining slots
  const getRemainingSlots = () => {
    const limit = getCurrentLimit()
    const currentCount = getCurrentCount()
    return Math.max(0, limit - currentCount)
  }

  // Check if adding the selected items would exceed the limit
  const wouldExceedLimit = (additionalItems = 0) => {
    const limit = getCurrentLimit()
    const currentCount = getCurrentCount()
    return currentCount + selectedItems.length + additionalItems > limit
  }

  // Check if adding one more item would exceed the limit
  const canSelectMore = () => {
    const remainingSlots = getRemainingSlots()
    return selectedItems.length < remainingSlots
  }

  const handleItemClick = (item) => {
    // Don't allow toggling already featured items
    if (isItemFeatured(item)) return

    setSelectedItems((prevSelected) => {
      // Check if the item is already selected
      const isAlreadySelected = prevSelected.some((selectedItem) => selectedItem.id === item.id)

      if (isAlreadySelected) {
        // If already selected, remove it
        return prevSelected.filter((selectedItem) => selectedItem.id !== item.id)
      } else {
        // If not selected, check if adding would exceed the limit
        if (!canSelectMore()) {
          toast.warning(
            `You can only select up to ${getRemainingSlots()} ${itemType}${getRemainingSlots() !== 1 ? "s" : ""}`,
          )
          return prevSelected
        }

        // If not selected and within limit, add it
        return [...prevSelected, item]
      }
    })
  }

  // Handle adding multiple items
  const handleAddItems = async () => {
    if (selectedItems.length === 0) {
      toast.error(`Please select at least one ${itemType} to add`)
      return
    }

    // Check if adding would exceed the limit
    if (wouldExceedLimit()) {
      toast.error(`Adding ${selectedItems.length} items would exceed the limit of ${getCurrentLimit()}`)
      return
    }

    setIsAdding(true)
    setAddingProgress(0)

    let successCount = 0
    let errorCount = 0
    const totalItems = selectedItems.length

    // Process items one by one
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i]

      try {
        // Update progress
        setAddingProgress(Math.round((i / totalItems) * 100))

        // Double-check if the item is already featured (in case the list was updated)
        if (isItemFeatured(item)) {
          toast.warning(`${item.name} is already featured. Skipping.`)
          errorCount++
          continue
        }

        // Add the item - make sure to use the correct ID
        const success = await addFeaturedItem(item.id, type, "", "")

        if (success) {
          successCount++
        } else {
          errorCount++
        }
      } catch (err) {
        errorCount++
        // Continue with the next item even if this one fails
      }
    }

    // Final progress update
    setAddingProgress(100)

    // Show results
    if (successCount > 0 && errorCount === 0) {
      toast.success(`Successfully added ${successCount} ${itemType}${successCount > 1 ? "s" : ""}`)
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(
        `Added ${successCount} ${itemType}${successCount > 1 ? "s" : ""} with ${errorCount} error${errorCount > 1 ? "s" : ""}`,
      )
    } else {
      toast.error(`Failed to add any ${itemType}s`)
    }

    // Notify parent component
    if (onItemAdded && successCount > 0) {
      onItemAdded()
    }

    // Close the modal after a short delay to show the 100% progress
    setTimeout(() => {
      onClose()
    }, 500)
  }

  // Function to get the correct image URL
  const getImageUrl = (item) => {
    if (item.image && typeof item.image === "string" && item.image.trim() !== "") {
      // Clean up the image path by removing escaped slashes
      const cleanImagePath = item.image.replace(/\\/g, "")

      // Ensure the path starts with a forward slash for the API
      const imagePath = cleanImagePath.startsWith("/") ? cleanImagePath : `/${cleanImagePath}`

      // Use buildImageUrl to construct the correct URL
      return buildImageUrl(imagePath)
    }
    return null
  }

  // Get the title for the dialog based on the type
  const getDialogTitle = () => {
    switch (type) {
      case "product":
        return "Add Featured Products"
      case "category":
        return "Add Featured Categories"
      case "quick_pick":
        return "Add Quick Picks"
      default:
        return "Add Featured Items"
    }
  }

  // Get the search placeholder based on the type
  const getSearchPlaceholder = () => {
    switch (itemType) {
      case "product":
        return "Search products by name or SKU..."
      case "category":
        return "Search categories by name..."
      default:
        return "Search items..."
    }
  }

  // Check if an item is selected
  const isItemSelected = (item) => {
    return selectedItems.some((selectedItem) => selectedItem.id === item.id)
  }

  // Count of newly selected items (not already featured)
  const newlySelectedCount = selectedItems.length

  // Get remaining slots message
  const getRemainingMessage = () => {
    const remainingSlots = getRemainingSlots()
    if (remainingSlots === 0) {
      return `No slots available (limit of ${getCurrentLimit()} reached)`
    } else if (remainingSlots === 1) {
      return `1 slot available of ${getCurrentLimit()}`
    } else {
      return `${remainingSlots} slots available of ${getCurrentLimit()}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col"
        ref={dialogContentRef}
        aria-describedby="dialog-description"
      >
        <span id="dialog-description" className="sr-only">
          Search and select {itemType}s to add to the {type === "quick_pick" ? "quick picks" : `featured ${type}s`}{" "}
          section.
        </span>

        <DialogHeader>
          <DialogTitle className="text-xl">{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            Select {itemType}s to add to the {type === "quick_pick" ? "quick picks" : `featured ${type}s`} section. You
            can add up to {getRemainingSlots()} more {itemType}s.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder={getSearchPlaceholder()}
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Selection summary */}
        {newlySelectedCount > 0 && (
          <div className="mb-4 p-2 bg-muted/20 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Info className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">
                {newlySelectedCount} {itemType}
                {newlySelectedCount > 1 ? "s" : ""} selected
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])} className="h-7 px-2 text-xs">
              Clear
            </Button>
          </div>
        )}

        {/* Limit warning */}
        {getRemainingSlots() === 0 && (
          <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center text-amber-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Limit reached. You cannot add more {itemType}s to this section.
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-8 flex-grow">
            <div className="flex flex-col items-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading {itemType}s...</p>
            </div>
            <Progress value={loadingProgress} className="h-2 w-full max-w-xs" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center flex-grow">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-destructive font-medium">Error loading {itemType}s</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={loadItems}>
              Try Again
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 flex-grow">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground font-medium">No {itemType}s found</p>
              <p className="text-xs text-muted-foreground">
                {searchTerm ? `No ${itemType}s match your search criteria` : `No ${itemType}s available to add`}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-grow pr-1 -mr-1">
            <div className="space-y-2">
              {filteredItems.map((item, index) => {
                const alreadyFeatured = isItemFeatured(item)
                const isSelected = isItemSelected(item)
                const imageUrl = getImageUrl(item)
                const isDisabled = alreadyFeatured || (!isSelected && !canSelectMore())

                return (
                  <div
                    key={`${item.id}-${item.name}-${index}`}
                    className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                      alreadyFeatured
                        ? "border-green-200 bg-green-50"
                        : isSelected
                          ? "border-primary bg-primary/5"
                          : isDisabled
                            ? "border-gray-100 bg-gray-50 opacity-60"
                            : "hover:bg-muted/5 cursor-pointer"
                    }`}
                    onClick={() => !isDisabled && handleItemClick(item)}
                  >
                    <div className="flex items-center space-x-3 flex-grow min-w-0">
                      <div className="flex items-center justify-center h-5 w-5">
                        <Checkbox
                          checked={alreadyFeatured || isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() => !isDisabled && handleItemClick(item)}
                          className={`rounded-sm ${alreadyFeatured ? "bg-green-500 border-green-500" : ""}`}
                          aria-label={`Select ${item.name}`}
                        />
                      </div>
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-muted/10 flex-shrink-0 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null // Prevent infinite loop
                              e.target.src = LOGO_PATH
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-muted/20">
                            <ImageOff className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center">
                          <p className="font-medium truncate">{item.name}</p>
                          {alreadyFeatured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Already Featured
                            </span>
                          )}
                          {!alreadyFeatured && !isSelected && !canSelectMore() && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              Limit Reached
                            </span>
                          )}
                        </div>
                        {itemType === "product" && (
                          <>
                            {item.sku && (
                              <p className="text-xs text-muted-foreground truncate">
                                <span className="font-medium">SKU:</span> {item.sku}
                              </p>
                            )}
                            {item.category_name && (
                              <p className="text-xs text-muted-foreground truncate">
                                <span className="font-medium">Category:</span> {item.category_name}
                              </p>
                            )}
                            {item.variants && item.variants.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                <span className="font-medium">Variants:</span> {item.variants.length}
                              </p>
                            )}
                          </>
                        )}
                        {itemType === "category" && item.product_count !== undefined && (
                          <p className="text-xs text-muted-foreground truncate">
                            <span className="font-medium">Products:</span> {item.product_count}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isAdding && (
          <div className="mt-4 mb-2">
            <p className="text-sm text-muted-foreground mb-2">
              Adding {selectedItems.length} {itemType}
              {selectedItems.length > 1 ? "s" : ""}...
            </p>
            <Progress value={addingProgress} className="h-2" />
          </div>
        )}

        <div className="flex justify-between space-x-2 mt-4 pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {getRemainingMessage()}
            {items.length > 0 && (
              <span className="ml-2 text-xs">
                ({items.length} {itemType}s available)
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isAdding}>
              Cancel
            </Button>
            <Button
              onClick={handleAddItems}
              disabled={selectedItems.length === 0 || isAdding || wouldExceedLimit()}
              className="bg-primary hover:bg-primary/90"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : wouldExceedLimit() ? (
                "Exceeds Limit"
              ) : (
                `Add ${selectedItems.length} ${itemType}${selectedItems.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddFeaturedItemModal
