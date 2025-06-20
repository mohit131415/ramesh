import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, merging Tailwind classes properly
 * @param  {...any} inputs - The class names to combine
 * @returns {string} - The combined class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a random ID
 * @param {number} length - The length of the ID
 * @returns {string} - The random ID
 */
export function generateId(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2)
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} - The truncated text
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Formats a price in cents to a currency string
 * @param {number} price - The price in cents
 * @param {Object} options - The formatting options
 * @returns {string} - The formatted price
 */
export function formatPrice(price, options = {}) {
  // Handle NaN, undefined, null
  if (price === undefined || price === null || isNaN(price)) {
    price = 0
  }

  const { currency = "INR", notation = "standard" } = options

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Delays execution for a specified time
 * @param {number} ms - The time to delay in milliseconds
 * @returns {Promise} - A promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Checks if an object is empty
 * @param {Object} obj - The object to check
 * @returns {boolean} - Whether the object is empty
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0
}

/**
 * Checks if a value is defined and not null
 * @param {any} value - The value to check
 * @returns {boolean} - Whether the value is defined and not null
 */
export function isDefined(value) {
  return value !== undefined && value !== null
}

/**
 * Capitalizes the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} - The capitalized string
 */
export function capitalizeFirstLetter(string) {
  if (!string) return string
  return string.charAt(0).toUpperCase() + string.slice(1)
}
