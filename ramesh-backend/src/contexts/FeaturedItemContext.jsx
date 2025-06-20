"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import featuredItemService from "../services/featuredItemService"
import { toast } from "react-toastify"

// Create the context
const FeaturedItemContext = createContext()

// Create a provider component
export const FeaturedItemProvider = ({ children }) => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [featuredCategories, setFeaturedCategories] = useState([])
  const [quickPicks, setQuickPicks] = useState([])
  const [originalFeaturedProducts, setOriginalFeaturedProducts] = useState([])
  const [originalFeaturedCategories, setOriginalFeaturedCategories] = useState([])
  const [originalQuickPicks, setOriginalQuickPicks] = useState([])
  const [hasProductChanges, setHasProductChanges] = useState(false)
  const [hasCategoryChanges, setHasCategoryChanges] = useState(false)
  const [hasQuickPickChanges, setHasQuickPickChanges] = useState(false)
  const [limits, setLimits] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Map API display types to component display types
  const mapDisplayType = (apiDisplayType) => {
    switch (apiDisplayType) {
      case "featured_product":
        return "product"
      case "featured_category":
        return "category"
      case "quick_pick":
        return "quick_pick"
      default:
        return apiDisplayType
    }
  }

  // Map component display types to API display types
  const mapToApiDisplayType = (displayType) => {
    switch (displayType) {
      case "product":
        return "featured_product"
      case "category":
        return "featured_category"
      case "quick_pick":
        return "quick_pick"
      default:
        return displayType
    }
  }

  // Fetch all featured items at once
  const fetchAllFeaturedItems = useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const response = await featuredItemService.getAllFeaturedItems()

      if (response.status === "success" && response.data) {
        // Update all state variables at once
        const products = response.data.featured_products || []
        const categories = response.data.featured_categories || []
        const picks = response.data.quick_picks || []

        // Sort all arrays by position
        products.sort((a, b) => a.position - b.position)
        categories.sort((a, b) => a.position - b.position)
        picks.sort((a, b) => a.position - b.position)

        setFeaturedProducts(products)
        setFeaturedCategories(categories)
        setQuickPicks(picks)

        // Store original data for comparison
        setOriginalFeaturedProducts(JSON.parse(JSON.stringify(products)))
        setOriginalFeaturedCategories(JSON.parse(JSON.stringify(categories)))
        setOriginalQuickPicks(JSON.parse(JSON.stringify(picks)))

        // Reset change flags
        setHasProductChanges(false)
        setHasCategoryChanges(false)
        setHasQuickPickChanges(false)

        // Cache the featured items
        localStorage.setItem(
          "featured_items",
          JSON.stringify({
            featured_products: products,
            featured_categories: categories,
            quick_picks: picks,
          }),
        )
        localStorage.setItem("featured_cache_timestamp", new Date().getTime().toString())

        return true
      } else {
        throw new Error(response.message || "Failed to fetch featured items")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to fetch featured items")
      toast.error(error.message || "Failed to fetch featured items")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch limits - only called once on initial load
  const fetchLimits = useCallback(async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const response = await featuredItemService.getLimits()

      if (response.status === "success" && response.data) {
        setLimits(response.data)

        // Cache the limits
        localStorage.setItem("featured_limits", JSON.stringify(response.data))
        localStorage.setItem("featured_cache_timestamp", new Date().getTime().toString())
      } else {
        throw new Error(response.message || "Failed to fetch limits")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to fetch featured item limits")
      toast.error(error.message || "Failed to fetch featured item limits")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update limits
  const updateLimits = async (newLimits) => {
    if (!newLimits) {
      toast.error("Cannot update with empty limits")
      return false
    }

    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const response = await featuredItemService.updateLimits(newLimits)

      if (response && response.status === "success") {
        setLimits(newLimits)

        // Show success toast with message from response
        toast.success(response.message || "Featured item limits updated successfully")
        return true
      } else {
        throw new Error(response?.message || "Failed to update limits")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to update limits")
      toast.error(error.message || "Failed to update limits")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch featured items by type - now uses the cached data or fetches all if needed
  const fetchFeaturedItemsByType = useCallback(
    async (displayType) => {
      try {
        setIsLoading(true)
        setHasError(false)
        setErrorMessage("")

        // Fetch all featured items at once
        const success = await fetchAllFeaturedItems()
        return success
      } catch (error) {
        setHasError(true)
        setErrorMessage(error.message || `Failed to fetch ${displayType} items`)
        toast.error(error.message || `Failed to fetch ${displayType} items`)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [fetchAllFeaturedItems],
  )

  // Add featured item
  const addFeaturedItem = async (entityId, displayType, title = "", description = "") => {
    try {
      setIsLoading(true)
      setHasError(false)

      const response = await featuredItemService.createFeaturedItem(entityId, displayType, title, description)

      if (response.status === "success") {
        // Refresh all featured items after adding
        await fetchAllFeaturedItems()

        // Show success toast with message from response
        toast.success(response.message || "Item added to featured items successfully")

        return true
      } else {
        // Handle specific error cases
        if (response.status === "error") {
          // Check if it's a limit reached error
          if (response.message && response.message.includes("Maximum limit") && response.message.includes("reached")) {
            // Show error toast for limit reached
            toast.error(response.message)

            // Refresh the page after a short delay to sync the UI
            setTimeout(() => {
              window.location.reload()
            }, 2000)

            return false
          }

          // Handle other error cases
          throw new Error(response.message || "Failed to add featured item")
        }

        throw new Error(response.message || "Failed to add featured item")
      }
    } catch (error) {
      // Handle network errors or other exceptions
      setHasError(true)
      setErrorMessage(error.message || "Failed to add featured item")

      // Check if the error message indicates a limit reached scenario
      if (error.message && error.message.includes("Maximum limit") && error.message.includes("reached")) {
        toast.error(error.message)

        // Refresh the page after a short delay to sync the UI
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error(error.message || "Failed to add featured item")
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Remove featured item
  const removeFeaturedItem = async (id, type, fullItem = null) => {
    try {
      setIsLoading(true)
      setHasError(false)

      // Use the provided fullItem if available, otherwise find the item in the list
      let itemToRemove = fullItem
      if (!itemToRemove) {
        if (type === "product") {
          itemToRemove = featuredProducts.find((item) => item.featured_item_id === id || item.id === id)
        } else if (type === "category") {
          itemToRemove = featuredCategories.find((item) => item.featured_item_id === id || item.id === id)
        } else if (type === "quick_pick") {
          itemToRemove = quickPicks.find((item) => item.featured_item_id === id || item.id === id)
        }
      }

      if (!itemToRemove) {
        toast.error(`Failed to remove item: Item not found`)
        setIsLoading(false)
        return false
      }

      // Extract entity_id based on the item type
      let entityId
      if (type === "product") {
        // For products, use the product's ID as the entity_id
        entityId = itemToRemove.product_id || itemToRemove.entity_id || itemToRemove.id
      } else if (type === "category") {
        // For categories, try all possible properties where the entity_id might be stored
        entityId =
          itemToRemove.category_id ||
          itemToRemove.entity_id ||
          itemToRemove.id ||
          (itemToRemove.category && itemToRemove.category.id)
      } else if (type === "quick_pick") {
        // For quick picks, use the product_id as the entity_id
        entityId = itemToRemove.product_id || itemToRemove.entity_id || itemToRemove.id
      } else {
        // For other types, use the entity_id property if available
        entityId = itemToRemove.entity_id
      }

      if (!entityId) {
        toast.error("Failed to remove item: Missing entity ID")
        setIsLoading(false)
        return false
      }

      // Map the display type to the API format
      const apiDisplayType = mapToApiDisplayType(type)

      // Create the item object with the required fields for deletion
      const deleteItem = {
        entity_id: entityId,
        display_type: apiDisplayType,
      }

      // Call the service with the properly formatted item
      const response = await featuredItemService.deleteFeaturedItem(deleteItem)

      if (response.status === "success") {
        // Refresh all featured items after removing
        await fetchAllFeaturedItems()

        // Show success toast with message from response
        toast.success(response.message || "Item removed from featured items successfully")

        return true
      } else {
        throw new Error(response.message || "Failed to remove featured item")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to remove featured item")
      toast.error(`Failed to remove item: ${error.message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Replace featured item using the new dedicated endpoint
  const replaceFeaturedItem = async (oldItem, newItem, displayType) => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      // Use the new replace endpoint
      const response = await featuredItemService.replaceFeaturedItem(oldItem.featured_item_id, newItem.id)

      if (response.status === "success") {
        // Show success toast with message from response
        toast.success(response.message || `Successfully replaced "${oldItem.name}" with "${newItem.name}"`)

        // Refresh the page after successful replacement
        setTimeout(() => {
          window.location.reload()
        }, 1000) // Small delay to show the success toast

        return true
      } else {
        throw new Error(response.message || "Failed to replace featured item")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to replace item")
      toast.error(error.message || "Failed to replace item")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update display order in the API
  const saveDisplayOrder = async (items, displayType) => {
    if (!items || items.length === 0) {
      toast.error("No items to update")
      return false
    }

    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      // Prepare items for API with id and position
      const itemsForApi = items.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
        position: index + 1, // Add position field
      }))

      // Call the API with the display_type and items array
      const response = await featuredItemService.updateDisplayOrder(displayType, itemsForApi)

      if (response.status === "success") {
        // Refresh all featured items after updating order
        await fetchAllFeaturedItems()

        // Show success toast with message from response
        toast.success(response.message || "Display order updated successfully")

        return true
      } else {
        // Handle specific error cases
        if (response.data && response.data.missing_item_ids) {
          const missingIds = response.data.missing_item_ids.join(", ")
          throw new Error(`One or more featured items not found: ${missingIds}`)
        }

        throw new Error(response.message || "Failed to update display order")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to update display order")
      toast.error(error.message || "Failed to update display order")

      // Revert to original data on error
      switch (displayType) {
        case "product":
          setFeaturedProducts([...originalFeaturedProducts])
          break
        case "category":
          setFeaturedCategories([...originalFeaturedCategories])
          break
        case "quick_pick":
          setQuickPicks([...originalQuickPicks])
          break
      }

      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Move item up in local state
  const moveItemUp = (id, displayType) => {
    let items = []
    let setItems = null
    let setHasChanges = null

    switch (displayType) {
      case "product":
        items = [...featuredProducts]
        setItems = setFeaturedProducts
        setHasChanges = setHasProductChanges
        break
      case "category":
        items = [...featuredCategories]
        setItems = setFeaturedCategories
        setHasChanges = setHasCategoryChanges
        break
      case "quick_pick":
        items = [...quickPicks]
        setItems = setQuickPicks
        setHasChanges = setHasQuickPickChanges
        break
      default:
        return false
    }

    if (!items || items.length === 0) {
      toast.error("No items to reorder")
      return false
    }

    const index = items.findIndex((item) => item.id === id)
    if (index <= 0) return false // Already at the top

    // Swap items in the array
    const temp = items[index]
    items[index] = items[index - 1]
    items[index - 1] = temp

    // Update display order and position for visual purposes
    items.forEach((item, i) => {
      item.display_order = i + 1
      item.position = i + 1
    })

    // Update state
    setItems(items)
    setHasChanges(true)
    return true
  }

  // Move item down in local state
  const moveItemDown = (id, displayType) => {
    let items = []
    let setItems = null
    let setHasChanges = null

    switch (displayType) {
      case "product":
        items = [...featuredProducts]
        setItems = setFeaturedProducts
        setHasChanges = setHasProductChanges
        break
      case "category":
        items = [...featuredCategories]
        setItems = setFeaturedCategories
        setHasChanges = setHasCategoryChanges
        break
      case "quick_pick":
        items = [...quickPicks]
        setItems = setQuickPicks
        setHasChanges = setHasQuickPickChanges
        break
      default:
        return false
    }

    if (!items || items.length === 0) {
      toast.error("No items to reorder")
      return false
    }

    const index = items.findIndex((item) => item.id === id)
    if (index === -1 || index >= items.length - 1) return false // Already at the bottom

    // Swap items in the array
    const temp = items[index]
    items[index] = items[index + 1]
    items[index + 1] = temp

    // Update display order and position for visual purposes
    items.forEach((item, i) => {
      item.display_order = i + 1
      item.position = i + 1
    })

    // Update state
    setItems(items)
    setHasChanges(true)
    return true
  }

  // Discard changes and revert to original data
  const discardChanges = (displayType) => {
    switch (displayType) {
      case "product":
        setFeaturedProducts([...originalFeaturedProducts])
        setHasProductChanges(false)
        break
      case "category":
        setFeaturedCategories([...originalFeaturedCategories])
        setHasCategoryChanges(false)
        break
      case "quick_pick":
        setQuickPicks([...originalQuickPicks])
        setHasQuickPickChanges(false)
        break
    }

    toast.info("Changes discarded")
    return true
  }

  // Fetch products for selection (new method for modal)
  const fetchProductsForSelection = async (displayType = "featured_product", searchTerm = "") => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const response = await featuredItemService.getProductsForSelection(displayType, searchTerm)

      if (response.status === "success" && response.data) {
        return response.data.products || []
      } else {
        throw new Error(response.message || "Failed to fetch products for selection")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to fetch products for selection")
      toast.error(error.message || "Failed to fetch products for selection")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch categories for selection (new method for modal)
  const fetchCategoriesForSelection = async (searchTerm = "") => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const response = await featuredItemService.getCategoriesForSelection(searchTerm)

      if (response.status === "success" && response.data) {
        return response.data.categories || []
      } else {
        throw new Error(response.message || "Failed to fetch categories for selection")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to fetch categories for selection")
      toast.error(error.message || "Failed to fetch categories for selection")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize by fetching limits and all featured items
  useEffect(() => {
    // Force fetch limits directly without checking cache
    fetchLimits()

    // Check if we have cached items
    const cachedItems = localStorage.getItem("featured_items")
    const cacheTimestamp = localStorage.getItem("featured_cache_timestamp")
    const currentTime = new Date().getTime()

    // Cache is valid for 30 minutes (1800000 ms)
    const cacheExpired = !cacheTimestamp || currentTime - Number.parseInt(cacheTimestamp) > 1800000

    if (cachedItems && !cacheExpired) {
      try {
        const parsedItems = JSON.parse(cachedItems)
        setFeaturedProducts(parsedItems.featured_products || [])
        setFeaturedCategories(parsedItems.featured_categories || [])
        setQuickPicks(parsedItems.quick_picks || [])

        // Store original data for comparison
        setOriginalFeaturedProducts(JSON.parse(JSON.stringify(parsedItems.featured_products || [])))
        setOriginalFeaturedCategories(JSON.parse(JSON.stringify(parsedItems.featured_categories || [])))
        setOriginalQuickPicks(JSON.parse(JSON.stringify(parsedItems.quick_picks || [])))

        // Reset change flags
        setHasProductChanges(false)
        setHasCategoryChanges(false)
        setHasQuickPickChanges(false)
      } catch (e) {
        console.error("Error parsing cached featured items:", e)
        fetchAllFeaturedItems()
      }
    } else {
      fetchAllFeaturedItems()
    }
  }, [])

  // Context value
  const value = {
    featuredProducts,
    featuredCategories,
    quickPicks,
    hasProductChanges,
    hasCategoryChanges,
    hasQuickPickChanges,
    limits,
    isLoading,
    hasError,
    errorMessage,
    fetchFeaturedItemsByType,
    addFeaturedItem,
    removeFeaturedItem,
    replaceFeaturedItem,
    saveDisplayOrder,
    moveItemUp,
    moveItemDown,
    discardChanges,
    updateLimits,
    retryFetch: fetchLimits,
    fetchProductsForSelection,
    fetchCategoriesForSelection,
  }

  return <FeaturedItemContext.Provider value={value}>{children}</FeaturedItemContext.Provider>
}

// Custom hook to use the context
export const useFeaturedItems = () => {
  const context = useContext(FeaturedItemContext)
  if (context === undefined) {
    throw new Error("useFeaturedItems must be used within a FeaturedItemProvider")
  }
  return context
}

export default FeaturedItemContext
