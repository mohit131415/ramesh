"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, X, Info, Clock, Leaf, Utensils, AlertCircle } from "lucide-react"

const DetailsTab = ({ formData, onChange, onNestedChange, errors }) => {
  const [newIngredient, setNewIngredient] = useState("")
  const [ingredientError, setIngredientError] = useState("")

  // Parse ingredients from comma-separated string to array
  const ingredientsList = formData.ingredients
    ? formData.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  const addIngredient = () => {
    if (!newIngredient.trim()) return

    // Check if ingredient already exists (case insensitive)
    const normalizedNewIngredient = newIngredient.trim().toLowerCase()
    const isDuplicate = ingredientsList.some((ingredient) => ingredient.toLowerCase() === normalizedNewIngredient)

    if (isDuplicate) {
      setIngredientError(`"${newIngredient.trim()}" is already in the ingredients list`)
      return
    }

    const updatedIngredients = [...ingredientsList, newIngredient.trim()]
    onChange("ingredients", updatedIngredients.join(", "))
    setNewIngredient("")
    setIngredientError("")
  }

  const removeIngredient = (index) => {
    const updatedIngredients = [...ingredientsList]
    updatedIngredients.splice(index, 1)
    onChange("ingredients", updatedIngredients.join(", "))
    setIngredientError("")
  }

  return (
    <div className="space-y-6">
      {/* Shelf Life Section */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-ramesh-gold mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Product Shelf Life</h3>
        </div>
        <div className="space-y-3">
          <Label htmlFor="shelf_life" className="text-sm font-medium flex items-center">
            Shelf Life <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="shelf_life"
            value={formData.shelf_life || ""}
            onChange={(e) => onChange("shelf_life", e.target.value)}
            placeholder="Enter shelf life (e.g., 30 days)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold/50 focus:border-ramesh-gold transition-all"
            required
          />
          {errors?.shelf_life && (
            <p className="text-sm text-red-500 mt-1 bg-red-50 p-2 rounded-md">{errors.shelf_life}</p>
          )}
          <p className="text-xs text-gray-500 mt-1 flex items-start">
            <Info className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>Specify how long the product can be stored before consumption</span>
          </p>
        </div>
      </div>

      {/* Vegetarian Status Section */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center mb-4">
          <Leaf className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Dietary Information</h3>
        </div>
        <div className="space-y-3">
          <Label htmlFor="is_vegetarian" className="text-sm font-medium flex items-center">
            Is Vegetarian <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="flex space-x-4 mt-2">
            <label className="flex items-center space-x-2 cursor-pointer p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="is_vegetarian"
                checked={formData.is_vegetarian === true || formData.is_vegetarian === 1}
                onChange={(e) => {
                  // Convert the string value to a boolean/number for API consistency
                  const isVeg = e.target.value === "true"
                  onChange("is_vegetarian", isVeg ? 1 : 0)
                }}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="is_vegetarian"
                checked={formData.is_vegetarian === false || formData.is_vegetarian === 0}
                onChange={(e) => {
                  // Convert the string value to a boolean/number for API consistency
                  const isVeg = e.target.value === "true"
                  onChange("is_vegetarian", isVeg ? 1 : 0)
                }}
                className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
          {errors?.is_vegetarian && (
            <p className="text-sm text-red-500 mt-1 bg-red-50 p-2 rounded-md">{errors.is_vegetarian}</p>
          )}
          <p className="text-xs text-gray-500 mt-1 flex items-start">
            <Info className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>Indicate whether this product is suitable for vegetarians</span>
          </p>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center mb-4">
          <Utensils className="h-5 w-5 text-ramesh-gold mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Ingredients</h3>
        </div>

        <div className="space-y-4">
          {/* Add ingredient input and button */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={newIngredient}
                onChange={(e) => {
                  setNewIngredient(e.target.value)
                  setIngredientError("")
                }}
                placeholder="Enter an ingredient"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold/50 focus:border-ramesh-gold transition-all"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addIngredient()
                  }
                }}
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2.5 bg-ramesh-gold text-white rounded-lg hover:bg-ramesh-gold/90 flex items-center transition-colors shadow-sm hover:shadow"
                disabled={!newIngredient.trim()}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add
              </button>
            </div>

            {/* Ingredient error message */}
            {ingredientError && (
              <div className="flex items-center text-red-500 text-sm mt-1 bg-red-50 p-2 rounded-md">
                <AlertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{ingredientError}</span>
              </div>
            )}
          </div>

          {/* Ingredients list */}
          {ingredientsList.length > 0 ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Added Ingredients:</p>
                <p className="text-xs text-gray-500">{ingredientsList.length} items</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredientsList.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${ingredient}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
              <div className="text-center">
                <Info className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No ingredients added yet</p>
                <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">
                  Add ingredients to help customers make informed choices about allergens and dietary preferences
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-xs text-blue-700 flex items-start">
              <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                List all ingredients in your product. This helps customers with allergies or dietary restrictions make
                informed purchasing decisions. Each ingredient must be unique.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailsTab
