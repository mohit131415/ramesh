import api from "./api"
import { API_BASE_URL } from "../config/api.config"

export const featuredItemService = {
  // Get all featured items
  getAllFeaturedItems: async () => {
    try {
      const response = await api.get("/featured-items")
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get featured items by display type
  getFeaturedItemsByType: async (displayType) => {
    try {
      // Map the component display type to the API display type
      let apiDisplayType
      switch (displayType) {
        case "product":
          apiDisplayType = "featured_product"
          break
        case "category":
          apiDisplayType = "featured_category"
          break
        case "quick_pick":
          apiDisplayType = "quick_pick"
          break
        default:
          apiDisplayType = displayType
      }

      const response = await api.get(`/featured-items?display_type=${apiDisplayType}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get a specific featured item
  getFeaturedItem: async (id) => {
    try {
      const response = await api.get(`/featured-items/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create a new featured item
  createFeaturedItem: async (entityId, displayType, title = "", description = "") => {
    try {
      // Map the component display type to the API display type
      let apiDisplayType
      switch (displayType) {
        case "product":
          apiDisplayType = "featured_product"
          break
        case "category":
          apiDisplayType = "featured_category"
          break
        case "quick_pick":
          apiDisplayType = "quick_pick"
          break
        default:
          apiDisplayType = displayType
      }

      const response = await api.post("/featured-items", {
        entity_id: entityId,
        display_type: apiDisplayType,
        title,
        description,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update a featured item
  updateFeaturedItem: async (id, data) => {
    try {
      const response = await api.put(`/featured-items/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete a featured item
  deleteFeaturedItem: async (item) => {
    try {
      // Check if we have the required fields
      if (!item.entity_id || !item.display_type) {
        throw new Error("Invalid item data for deletion. Required fields: entity_id and display_type.")
      }

      // Map the component display type to the API display type if needed
      let apiDisplayType = item.display_type
      if (!apiDisplayType.includes("featured_") && !apiDisplayType.includes("quick_pick")) {
        switch (item.display_type) {
          case "product":
            apiDisplayType = "featured_product"
            break
          case "category":
            apiDisplayType = "featured_category"
            break
          case "quick_pick":
            apiDisplayType = "quick_pick"
            break
        }
      }

      // Use the request body approach with entity_id and display_type
      const response = await api.delete("/featured-items", {
        data: {
          entity_id: item.entity_id,
          display_type: apiDisplayType,
        },
      })

      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update display order for multiple items
  updateDisplayOrder: async (displayType, items) => {
    try {
      // Map the component display type to the API display type
      let apiDisplayType
      switch (displayType) {
        case "product":
          apiDisplayType = "featured_product"
          break
        case "category":
          apiDisplayType = "featured_category"
          break
        case "quick_pick":
          apiDisplayType = "quick_pick"
          break
        default:
          apiDisplayType = displayType
      }

      // The API expects { display_type: "...", items: [...] }
      const response = await api.post("/featured-items/update-display-order", {
        display_type: apiDisplayType,
        items,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Search for entities to feature
  searchEntities: async (entityType, searchTerm, page = 1, limit = 10) => {
    try {
      let response

      // Use the comprehensive product API for product search
      if (entityType === "product") {
        // Use the specified endpoint with a 2000 item limit
        response = await api.get("/comprehensive-products", {
          params: {
            search: searchTerm,
            page,
            limit: 2000,
            search_fields: "name,tag",
            status: "active", // Only search for active products
          },
        })

        // Transform the response to match the expected format
        if (response.data.status === "success") {
          // Check if products are in data.products or directly in data
          const products = response.data.data.products || response.data.data || []

          return {
            status: "success",
            message: "Products retrieved successfully",
            data: {
              items: products.map((product) => ({
                id: product.id,
                name: product.name,
                sku: product.sku || (product.variants && product.variants.length > 0 ? product.variants[0].sku : ""),
                price: product.price,
                image_url:
                  product.image_url ||
                  (product.images && product.images.length > 0 ? product.images[0].image_url : null),
                primary_image: product.primary_image,
                images: product.images,
                short_description: product.short_description,
                stock_status: product.stock_status,
                variants_count: product.variants ? product.variants.length : 0,
                variants: product.variants,
              })),
              pagination: response.data.meta || response.data.data.pagination || { current_page: 1, total_pages: 1 },
            },
          }
        }
      }
      // Use the comprehensive category API for category search
      else if (entityType === "category") {
        response = await api.get("/categories", {
          params: {
            search: searchTerm,
            page,
            limit,
            status: "active", // Only search for active categories
          },
        })

        // Transform the response to match the expected format
        if (response.data.status === "success") {
          return {
            status: "success",
            message: "Categories retrieved successfully",
            data: {
              items: response.data.data.map((category) => ({
                id: category.id,
                name: category.name,
                image_url: category.image_url,
                short_description: category.description,
                product_count: 0, // This field might not be available in the API
              })),
              pagination: response.data.meta,
            },
          }
        }
      }

      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get all products (for preloading) with pagination support
  getAllProducts: async () => {
    try {
      let allProducts = []
      let currentPage = 1
      let totalPages = 1
      let hasMorePages = true

      // Fetch all pages of products
      while (hasMorePages) {
        const response = await api.get("/comprehensive-products", {
          params: {
            page: currentPage,
            limit: 100, // Use a reasonable page size
            status: "active",
          },
        })

        if (response.data.status === "success") {
          // Extract products from the current page
          const products = response.data.data.map((product) => {
            // Extract price and ensure it's a number
            let price = null
            if (product.variants && product.variants.length > 0) {
              price = Number.parseFloat(product.variants[0].price) || null
            } else if (product.price) {
              price = Number.parseFloat(product.price) || null
            }

            let image_url = null
            if (product.images && product.images.length > 0) {
              image_url = `${API_BASE_URL}/${product.images[0].image_path}`
            }

            return {
              id: product.id,
              name: product.name,
              sku: product.variants && product.variants.length > 0 ? product.variants[0].sku : "",
              price: price,
              image_url: image_url,
              short_description: product.short_description,
              stock_status: product.status === "active" ? "in_stock" : "out_of_stock",
              variants_count: product.variants ? product.variants.length : 0,
            }
          })

          // Add products to our collection
          allProducts = [...allProducts, ...products]

          // Update pagination info
          if (response.data.meta) {
            totalPages = response.data.meta.total_pages || 1
            currentPage++
            hasMorePages = currentPage <= totalPages
          } else {
            hasMorePages = false
          }
        } else {
          throw new Error(response.data.message || "Failed to load products")
        }
      }

      return {
        status: "success",
        message: "Products retrieved successfully",
        data: {
          items: allProducts,
          pagination: {
            total: allProducts.length,
            total_pages: totalPages,
          },
        },
      }
    } catch (error) {
      throw error
    }
  },

  // Get all categories (for preloading) with pagination support
  getAllCategories: async () => {
    try {
      let allCategories = []
      let currentPage = 1
      let totalPages = 1
      let hasMorePages = true

      // Fetch all pages of categories
      while (hasMorePages) {
        const response = await api.get("/categories", {
          params: {
            page: currentPage,
            limit: 100, // Use a reasonable page size
            status: "active",
          },
        })

        if (response.data.status === "success") {
          // Extract categories from the current page
          const categories = response.data.data.map((category) => ({
            id: category.id,
            name: category.name,
            image_url: category.image_url,
            short_description: category.description,
            product_count: 0, // This field might not be available in the API
          }))

          // Add categories to our collection
          allCategories = [...allCategories, ...categories]

          // Update pagination info
          if (response.data.meta) {
            totalPages = response.data.meta.total_pages || 1
            currentPage++
            hasMorePages = currentPage <= totalPages
          } else {
            hasMorePages = false
          }
        } else {
          throw new Error(response.data.message || "Failed to load categories")
        }
      }

      return {
        status: "success",
        message: "Categories retrieved successfully",
        data: {
          items: allCategories,
          pagination: {
            total: allCategories.length,
            total_pages: totalPages,
          },
        },
      }
    } catch (error) {
      throw error
    }
  },

  // Get featured item limits
  getLimits: async () => {
    try {
      const response = await api.get("/featured-items/settings/limits")
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update featured item limits (super_admin only)
  updateLimits: async (limits) => {
    try {
      const response = await api.put("/featured-items/settings/limits", limits)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Check if an item is already featured in a specific section
  checkItemIsFeatured: async (entityId, displayType) => {
    try {
      const response = await api.get(`/featured-items/check?entity_id=${entityId}&display_type=${displayType}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Add featured item
  addFeaturedItem: async (entityId, displayType, title = "", description = "") => {
    try {
      const response = await api.post("/featured-items", {
        entity_id: entityId,
        display_type: displayType,
        title,
        description,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Move item up
  moveItemUp: async (id) => {
    try {
      const response = await api.put(`/featured-items/${id}/move-up`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Move item down
  moveItemDown: async (id) => {
    try {
      const response = await api.put(`/featured-items/${id}/move-down`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get products for selection (new API)
  getProductsForSelection: async (displayType = "featured_product", search = "") => {
    try {
      const params = new URLSearchParams()
      params.append("display_type", displayType)
      if (search.trim()) {
        params.append("search", search.trim())
      }

      const response = await api.get(`/featured-items/selection/products?${params.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get categories for selection (new API)
  getCategoriesForSelection: async (search = "") => {
    try {
      const params = new URLSearchParams()
      if (search.trim()) {
        params.append("search", search.trim())
      }

      const response = await api.get(`/featured-items/selection/categories?${params.toString()}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Replace featured item (new API)
  replaceFeaturedItem: async (featuredItemId, newEntityId) => {
    try {
      const response = await api.put(`/featured-items/${featuredItemId}/replace`, {
        entity_id: newEntityId,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default featuredItemService
