// Add or update the formatWeight function to ensure consistent weight formatting
export const formatWeight = (weight, unit = "g") => {
  if (!weight) return ""

  // Convert to number if it's a string
  const numWeight = typeof weight === "string" ? Number.parseFloat(weight) : weight

  // Format based on value
  if (numWeight >= 1000) {
    // Convert to kg if >= 1000g
    const kgWeight = numWeight / 1000
    // Remove trailing zeros after decimal
    return `${kgWeight % 1 === 0 ? kgWeight.toFixed(0) : kgWeight.toFixed(2).replace(/\.?0+$/, "")}kg`
  } else {
    // For grams, no decimals
    return `${Math.round(numWeight)}${unit}`
  }
}

// Add the formatCurrency function
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₹0"

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
