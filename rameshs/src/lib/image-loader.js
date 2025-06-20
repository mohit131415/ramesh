/**
 * Preloads an array of images to ensure they're cached for smoother transitions
 * @param {string[]} imageUrls - Array of image URLs to preload
 * @returns {Promise<void>} - Promise that resolves when all images are loaded
 */
export function preloadImages(imageUrls) {
    const promises = imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = () => reject(`Failed to load image: ${url}`)
        img.src = url
      })
    })
  
    return Promise.all(promises)
  }
  
  /**
   * Creates a placeholder URL for development
   * @param {number} width - Width of the placeholder
   * @param {number} height - Height of the placeholder
   * @param {string} text - Text to display on the placeholder
   * @returns {string} - Placeholder URL
   */
  export function createPlaceholder(width, height, text = "Placeholder") {
    return `https://via.placeholder.com/${width}x${height}?text=${text.replace(/\s/g, "+")}`
  }
  
  