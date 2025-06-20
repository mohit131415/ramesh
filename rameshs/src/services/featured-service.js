// Featured items service to fetch data from the API using proxy
import { BASE_URL } from "./api-client"

// Base URL for featured API endpoints
const API_BASE_URL = `${BASE_URL}/api/api/public/featured`

// Cache for featured data
const cache = {
  products: { data: null, timestamp: 0 },
  categories: { data: null, timestamp: 0 },
  quickPicks: { data: null, timestamp: 0 },
  all: { data: null, timestamp: 0 },
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

/**
 * Get featured products with caching
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Array>} - Featured products
 */
export const getFeaturedProducts = async (forceRefresh = false) => {
  try {
    // Check cache if not forcing refresh
    if (!forceRefresh && cache.products.data && Date.now() - cache.products.timestamp < CACHE_EXPIRATION) {
      console.log("Using cached featured products")
      return cache.products.data
    }

    const url = `${API_BASE_URL}/products`
    console.log(`Fetching featured products from: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch featured products: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Update cache
    cache.products = {
      data,
      timestamp: Date.now(),
    }

    return data
  } catch (error) {
    console.error("Error fetching featured products:", error)
    throw error
  }
}

/**
 * Get featured categories with caching
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Array>} - Featured categories
 */
export const getFeaturedCategories = async (forceRefresh = false) => {
  try {
    // Check cache if not forcing refresh
    if (!forceRefresh && cache.categories.data && Date.now() - cache.categories.timestamp < CACHE_EXPIRATION) {
      console.log("Using cached featured categories")
      return cache.categories.data
    }

    const url = `${API_BASE_URL}/categories`
    console.log(`Fetching featured categories from: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch featured categories: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Update cache
    cache.categories = {
      data,
      timestamp: Date.now(),
    }

    return data
  } catch (error) {
    console.error("Error fetching featured categories:", error)
    throw error
  }
}

/**
 * Get quick picks with caching
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Array>} - Quick picks
 */
export const getQuickPicks = async (forceRefresh = false) => {
  try {
    // Check cache if not forcing refresh
    if (!forceRefresh && cache.quickPicks.data && Date.now() - cache.quickPicks.timestamp < CACHE_EXPIRATION) {
      console.log("Using cached quick picks")
      return cache.quickPicks.data
    }

    const url = `${API_BASE_URL}/quick-picks`
    console.log(`Fetching quick picks from: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch quick picks: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Update cache
    cache.quickPicks = {
      data,
      timestamp: Date.now(),
    }

    return data
  } catch (error) {
    console.error("Error fetching quick picks:", error)
    throw error
  }
}

/**
 * Get all featured items with caching
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Object>} - All featured items
 */
export const getAllFeaturedItems = async (forceRefresh = false) => {
  try {
    // Check cache if not forcing refresh
    if (!forceRefresh && cache.all.data && Date.now() - cache.all.timestamp < CACHE_EXPIRATION) {
      console.log("Using cached all featured items")
      return cache.all.data
    }

    const url = `${API_BASE_URL}/all`
    console.log(`Fetching all featured items from: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch all featured items: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Update cache
    cache.all = {
      data,
      timestamp: Date.now(),
    }

    return data
  } catch (error) {
    console.error("Error fetching all featured items:", error)
    throw error
  }
}

/**
 * Clear the featured service cache
 */
export const clearFeaturedCache = () => {
  cache.products = { data: null, timestamp: 0 }
  cache.categories = { data: null, timestamp: 0 }
  cache.quickPicks = { data: null, timestamp: 0 }
  cache.all = { data: null, timestamp: 0 }
  console.log("Featured service cache cleared")
}
