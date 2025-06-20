/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    return emailRegex.test(email)
  }
  
  /**
   * Validates a phone number (Indian format)
   * @param {string} phone - The phone number to validate
   * @returns {boolean} - Whether the phone number is valid
   */
  export function isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone)
  }
  
  /**
   * Validates a PIN code (Indian format)
   * @param {string} pincode - The PIN code to validate
   * @returns {boolean} - Whether the PIN code is valid
   */
  export function isValidPincode(pincode) {
    const pincodeRegex = /^[1-9][0-9]{5}$/
    return pincodeRegex.test(pincode)
  }
  
  /**
   * Validates a password
   * @param {string} password - The password to validate
   * @returns {Object} - The validation result
   */
  export function validatePassword(password) {
    const result = {
      isValid: false,
      errors: [],
    }
  
    if (!password) {
      result.errors.push("Password is required")
      return result
    }
  
    if (password.length < 8) {
      result.errors.push("Password must be at least 8 characters long")
    }
  
    if (!/[A-Z]/.test(password)) {
      result.errors.push("Password must contain at least one uppercase letter")
    }
  
    if (!/[a-z]/.test(password)) {
      result.errors.push("Password must contain at least one lowercase letter")
    }
  
    if (!/[0-9]/.test(password)) {
      result.errors.push("Password must contain at least one number")
    }
  
    if (!/[^A-Za-z0-9]/.test(password)) {
      result.errors.push("Password must contain at least one special character")
    }
  
    result.isValid = result.errors.length === 0
    return result
  }
  
  /**
   * Validates a name
   * @param {string} name - The name to validate
   * @returns {boolean} - Whether the name is valid
   */
  export function isValidName(name) {
    return name && name.trim().length >= 2
  }
  
  /**
   * Validates a credit card number
   * @param {string} cardNumber - The card number to validate
   * @returns {boolean} - Whether the card number is valid
   */
  export function isValidCreditCard(cardNumber) {
    // Remove spaces and dashes
    const sanitized = cardNumber.replace(/[\s-]/g, "")
  
    // Check if the number contains only digits
    if (!/^\d+$/.test(sanitized)) return false
  
    // Check length (most cards are 13-19 digits)
    if (sanitized.length < 13 || sanitized.length > 19) return false
  
    // Luhn algorithm (checksum)
    let sum = 0
    let double = false
  
    // Loop from right to left
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(sanitized.charAt(i))
  
      if (double) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
  
      sum += digit
      double = !double
    }
  
    return sum % 10 === 0
  }
  
  /**
   * Validates a form field
   * @param {string} name - The field name
   * @param {any} value - The field value
   * @returns {string|null} - The error message or null if valid
   */
  export function validateField(name, value) {
    switch (name) {
      case "email":
        return isValidEmail(value) ? null : "Please enter a valid email address"
  
      case "phone":
        return isValidPhone(value) ? null : "Please enter a valid 10-digit phone number"
  
      case "pincode":
        return isValidPincode(value) ? null : "Please enter a valid 6-digit PIN code"
  
      case "name":
      case "firstName":
      case "lastName":
        return isValidName(value) ? null : "Please enter a valid name (at least 2 characters)"
  
      case "password":
        const { isValid, errors } = validatePassword(value)
        return isValid ? null : errors[0]
  
      case "creditCard":
        return isValidCreditCard(value) ? null : "Please enter a valid credit card number"
  
      default:
        return value ? null : `${name} is required`
    }
  }
  
  