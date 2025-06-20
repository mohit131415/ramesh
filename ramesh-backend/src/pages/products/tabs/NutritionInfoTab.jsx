"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

const NutritionInfoTab = ({ formData, onNestedChange, errors }) => {
  const nutrition = formData.nutrition_info || {}
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Check if all required fields are filled
    const requiredFields = ["calories", "fat", "carbohydrates", "protein", "sugar", "sodium"]
    const allFilled = requiredFields.every((field) => nutrition[field] !== undefined && nutrition[field] !== "")

    // Check if all fields are valid numbers
    const allValidNumbers = requiredFields.every((field) => !isNaN(Number(nutrition[field])))

    setIsComplete(allFilled && allValidNumbers)
  }, [nutrition])

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Nutritional Information (per 100g)</h3>
              <p className="text-sm text-gray-700">
                Enter the nutritional information for this product. All values should be provided per 100g of product.
              </p>
            </div>
            {isComplete && <CheckCircle className="h-6 w-6 text-green-500" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="calories" className="text-base font-semibold text-gray-800">
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                value={nutrition.calories || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (!isNaN(Number(value)) || value === "") {
                    onNestedChange("nutrition_info", "calories", value)
                  }
                }}
                placeholder="Enter calories"
                className="w-full px-4 py-2.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="fat" className="text-base font-semibold text-gray-800">
                Total Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={nutrition.fat || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (!isNaN(Number(value)) || value === "") {
                    onNestedChange("nutrition_info", "fat", value)
                  }
                }}
                placeholder="Enter total fat"
                className="w-full px-4 py-2.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="carbohydrates" className="text-base font-semibold text-gray-800">
                Carbohydrates (g)
              </Label>
              <Input
                id="carbohydrates"
                type="number"
                step="0.1"
                value={nutrition.carbohydrates || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (!isNaN(Number(value)) || value === "") {
                    onNestedChange("nutrition_info", "carbohydrates", value)
                  }
                }}
                placeholder="Enter carbohydrates"
                className="w-full px-4 py-2.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="protein" className="text-base font-semibold text-gray-800">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={nutrition.protein || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (!isNaN(Number(value)) || value === "") {
                    onNestedChange("nutrition_info", "protein", value)
                  }
                }}
                placeholder="Enter protein"
                className="w-full px-4 py-2.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="sugar" className="text-base font-semibold text-gray-800">
                Sugar (g)
              </Label>
              <Input
                id="sugar"
                type="number"
                step="0.1"
                value={nutrition.sugar || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (!isNaN(Number(value)) || value === "") {
                    onNestedChange("nutrition_info", "sugar", value)
                  }
                }}
                placeholder="Enter sugar content"
                className="w-full px-4 py-2.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="sodium" className="text-base font-semibold text-gray-800">
                Sodium (mg)
              </Label>
              <Input
                id="sodium"
                type="number"
                step="1"
                value={nutrition.sodium || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (!isNaN(Number(value)) || value === "") {
                    onNestedChange("nutrition_info", "sodium", value)
                  }
                }}
                placeholder="Enter sodium content"
                className="w-full px-4 py-2.5 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm transition-all"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NutritionInfoTab
