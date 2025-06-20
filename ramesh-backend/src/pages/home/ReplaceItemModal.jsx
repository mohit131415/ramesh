"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Search, AlertCircle, ImageOff, Info, Loader2, RefreshCw, X } from "lucide-react"
import { useFeaturedItems } from "../../contexts/FeaturedItemContext"
import { toast } from "react-toastify"
import { Checkbox } from "../../components/ui/checkbox"
import { Progress } from "../../components/ui/progress"
import { buildImageUrl } from "../../config/api.config"

const LOGO_PATH = "/ramesh-logo.svg"

const ReplaceItemModal = ({ isOpen, onClose, type, currentItem, onItemReplaced }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isReplacing, setIsReplacing] = useState(false)
  const {
    featuredProducts,
    featuredCategories,
    quickPicks,
    fetchProductsForSelection,
    fetchCategoriesForSelection,
    replaceFeaturedItem,
  } = useFeaturedItems()
  const searchInputRef = useRef(null)
  const dialogContentRef = useRef(null)

  // Determine the item type based on the section type
  const itemType = type === "category" ? "category" : "product"

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("")
      setSelectedItem(null)
      setError(null)
      setIsReplacing(false)
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

  // Get current featured items based on type
  const getCurrentFeaturedItems = () => {
    switch (type) {
      case "product":
        return featuredProducts || []
      case "category":
        return featuredCategories || []
      case "quick_pick":
        return quickPicks || []
      default:
        return []
    }
  }

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
      // console.error(`Error fetching ${itemType}s:`, error)
      throw error
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleItemClick = (item) => {
    // Don't allow selecting already featured items
    if (isItemFeatured(item)) return

    // Don't allow selecting the current item
    if (currentItem && item.id === currentItem.entity_id) return

    setSelectedItem(item)
  }

  const handleReplace = async () => {
    if (!selectedItem || !currentItem) {
      toast.error("Please select an item to replace with")
      return
    }

    setIsReplacing(true)
    try {
      // Use the context's replaceFeaturedItem method
      const success = await replaceFeaturedItem(currentItem, selectedItem, type)
      if (success) {
        onItemReplaced()
        onClose()
      }
    } catch (error) {
      toast.error("Failed to replace item")
      // console.error("Replace error:", error)
    } finally {
      setIsReplacing(false)
    }
  }

  // Function to get the correct image URL
  const getImageUrl = (item) => {
    if (item.image && typeof item.image === "string" && item.image.trim() !== "") {
      // Clean up the image path by removing escaped slashes
      const cleanImagePath = item.image.replace(/\\/g, "")

      // Use the buildImageUrl utility function
      return buildImageUrl(cleanImagePath)
    }
    return null
  }

  // Get the title for the dialog based on the type
  const getDialogTitle = () => {
    switch (type) {
      case "product":
        return "Replace Featured Product"
      case "category":
        return "Replace Featured Category"
      case "quick_pick":
        return "Replace Quick Pick"
      default:
        return "Replace Featured Item"
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

  // Check if an item is the current item being replaced
  const isCurrentItem = (item) => {
    return currentItem && item.id === currentItem.entity_id
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col"
        ref={dialogContentRef}
        aria-describedby="dialog-description"
      >
        <span id="dialog-description" className="sr-only">
          Search and select a {itemType} to replace {currentItem?.name} in the{" "}
          {type === "quick_pick" ? "quick picks" : `featured ${type}s`} section.
        </span>

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {currentItem ? (
              <>
                Replacing: <span className="font-medium">{currentItem.name}</span>. Select a new {itemType} to take its
                place at the same position.
              </>
            ) : (
              `Select a new ${itemType} to replace the current one. The new ${itemType} will take the same position.`
            )}
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
        {selectedItem && (
          <div className="mb-4 p-2 bg-muted/20 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Info className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">
                Selected: <span className="font-medium">{selectedItem.name}</span>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)} className="h-7 px-2 text-xs">
              Clear
            </Button>
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
                {searchTerm ? `No ${itemType}s match your search criteria` : `No ${itemType}s available to replace`}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-grow pr-1 -mr-1">
            <div className="space-y-2">
              {filteredItems.map((item, index) => {
                const alreadyFeatured = isItemFeatured(item)
                const isCurrentItemBeingReplaced = isCurrentItem(item)
                const isSelected = selectedItem?.id === item.id
                const isDisabled = alreadyFeatured || isCurrentItemBeingReplaced
                const imageUrl = getImageUrl(item)

                return (
                  <div
                    key={`${item.id}-${item.name}-${index}`}
                    className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                      isDisabled
                        ? isCurrentItemBeingReplaced
                          ? "border-orange-200 bg-orange-50"
                          : "border-green-200 bg-green-50"
                        : isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/5 cursor-pointer"
                    }`}
                    onClick={() => !isDisabled && handleItemClick(item)}
                  >
                    <div className="flex items-center space-x-3 flex-grow min-w-0">
                      <div className="flex items-center justify-center h-5 w-5">
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() => !isDisabled && handleItemClick(item)}
                          className={`rounded-sm ${
                            isCurrentItemBeingReplaced
                              ? "bg-orange-500 border-orange-500"
                              : alreadyFeatured
                                ? "bg-green-500 border-green-500"
                                : ""
                          }`}
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
                          {isCurrentItemBeingReplaced && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              Current Item
                            </span>
                          )}
                          {alreadyFeatured && !isCurrentItemBeingReplaced && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Already Featured
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

        <div className="flex justify-between space-x-2 mt-4 pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {items.length > 0 && (
              <span>
                {items.length} {itemType}s available
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isReplacing}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleReplace}
              disabled={!selectedItem || isReplacing}
              className="bg-primary hover:bg-primary/90"
            >
              {isReplacing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Replacing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Replace Item
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReplaceItemModal
