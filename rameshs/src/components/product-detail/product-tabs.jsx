"use client"

import { useState, useEffect } from "react"
import { HeritageHeaderDecoration } from "../ui/heritage-decorations"
import { Info, Leaf, BarChart3, Package2 } from "lucide-react"
import "./product-tabs.css"

// Helper function to parse JSON fields
const parseJsonField = (jsonString, defaultValue = {}) => {
  if (!jsonString) return defaultValue
  try {
    return typeof jsonString === "string" ? JSON.parse(jsonString) : jsonString
  } catch (error) {
    console.error("Error parsing JSON string:", error)
    return defaultValue
  }
}

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description")
  const [animateTab, setAnimateTab] = useState(false)

  // Handle tab change with animation
  const handleTabChange = (tab) => {
    if (tab === activeTab) return

    setAnimateTab(false)
    setTimeout(() => {
      setActiveTab(tab)
      setAnimateTab(true)
    }, 200)
  }

  // Set initial animation
  useEffect(() => {
    setAnimateTab(true)
  }, [])

  if (!product) return null

  // Parse product data
  const ingredients = parseJsonField(product.ingredients, [])
  const nutritionalInfo = parseJsonField(product.nutritional_info, {})

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gold/10">
      <div className="border-b border-gold/20">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => handleTabChange("description")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 tab-button ${
              activeTab === "description"
                ? "border-gold text-gold-dark active"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Info className="h-4 w-4" />
            Description
          </button>
          <button
            onClick={() => handleTabChange("ingredients")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 tab-button ${
              activeTab === "ingredients"
                ? "border-gold text-gold-dark active"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Leaf className="h-4 w-4" />
            Ingredients
          </button>
          <button
            onClick={() => handleTabChange("nutrition")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 tab-button ${
              activeTab === "nutrition"
                ? "border-gold text-gold-dark active"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Nutrition
          </button>
          <button
            onClick={() => handleTabChange("storage")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 tab-button ${
              activeTab === "storage"
                ? "border-gold text-gold-dark active"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Package2 className="h-4 w-4" />
            Storage
          </button>
        </nav>
      </div>

      <div className={`py-6 tab-content ${animateTab ? "opacity-100" : "opacity-0"}`}>
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <div className="text-center mb-6">
              <h3 className="text-xl font-cinzel text-gold-dark">About This Product</h3>
              <HeritageHeaderDecoration className="mt-2" />
            </div>
            <div className="product-description">
              <p className="text-gray-700 font-eb-garamond text-lg leading-relaxed">
                {product.description ||
                  "Experience the authentic taste of tradition with our premium handcrafted sweets. Made with the finest ingredients and following time-honored recipes passed down through generations, each piece is a celebration of our rich culinary heritage."}
              </p>

              {!product.description && (
                <>
                  <p className="text-gray-700 font-eb-garamond text-lg leading-relaxed mt-4">
                    Our master confectioners carefully prepare each batch using traditional methods, ensuring the
                    perfect balance of flavors and textures. We take pride in preserving the authenticity of these
                    beloved delicacies while maintaining the highest standards of quality and freshness.
                  </p>
                  <p className="text-gray-700 font-eb-garamond text-lg leading-relaxed mt-4">
                    Whether you're celebrating a special occasion or simply treating yourself to a moment of indulgence,
                    our sweets promise to deliver an unforgettable experience that honors our cultural legacy.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "ingredients" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-cinzel text-gold-dark">Premium Ingredients</h3>
              <HeritageHeaderDecoration className="mt-2" />
            </div>

            {Array.isArray(ingredients) && ingredients.length > 0 ? (
              <div className="space-y-6">
                <p className="text-gray-700 font-eb-garamond text-lg">
                  Our products are crafted using only the finest quality ingredients, carefully selected to ensure
                  authentic flavor and premium quality.
                </p>

                <div className="ingredient-list">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-item">
                      <div className="w-3 h-3 rounded-full bg-gold/30"></div>
                      <span className="font-eb-garamond text-gray-700">{ingredient}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-cream-light p-4 rounded-lg border border-gold/10">
                  <p className="text-sm text-gray-600 italic">
                    * All ingredients are sourced from trusted suppliers and meet our strict quality standards.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 italic font-eb-garamond text-lg">Ingredients information not available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "nutrition" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-cinzel text-gold-dark">Nutritional Information</h3>
              <HeritageHeaderDecoration className="mt-2" />
            </div>

            {nutritionalInfo && Object.keys(nutritionalInfo).length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-700 font-eb-garamond text-lg">Nutritional values per 100g serving:</p>

                <div className="overflow-hidden rounded-lg shadow-sm">
                  <table className="nutrition-table">
                    <thead>
                      <tr>
                        <th className="text-left">Nutrient</th>
                        <th className="text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(nutritionalInfo).map(([key, value]) => {
                        if (!value) return null
                        return (
                          <tr key={key}>
                            <td className="font-medium text-gray-800 capitalize">{key.replace(/_/g, " ")}</td>
                            <td className="text-gray-600">{key === "calories" ? `${value} kcal` : `${value} g`}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm text-gray-500 mt-4 italic">
                  *Values are approximate and may vary slightly based on preparation. Recommended daily values are based
                  on a 2,000 calorie diet.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 italic font-eb-garamond text-lg">Nutritional information not available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "storage" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-cinzel text-gold-dark">Storage & Handling</h3>
              <HeritageHeaderDecoration className="mt-2" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="storage-card">
                <h4 className="font-cinzel text-lg text-gold-dark mb-3 pl-4">Storage Instructions</h4>
                <p className="font-eb-garamond text-gray-700 pl-4">
                  {product.storage_instructions ||
                    "Store in a cool, dry place away from direct sunlight. Keep in an airtight container after opening to maintain freshness and flavor."}
                </p>
              </div>

              <div className="storage-card">
                <h4 className="font-cinzel text-lg text-gold-dark mb-3 pl-4">Shelf Life</h4>
                <p className="font-eb-garamond text-gray-700 pl-4">
                  {product.shelf_life || "Best consumed within 15-30 days of purchase for optimal taste and quality."}
                </p>
              </div>
            </div>

            <div className="bg-cream-light rounded-lg p-5 border border-gold/10 mt-6">
              <h4 className="font-cinzel text-lg text-gold-dark mb-3">For Best Results</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="mt-1 min-w-[8px] h-2 rounded-full bg-gold/60"></div>
                  <p className="font-eb-garamond text-gray-700">
                    Consume at room temperature for the best flavor experience.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 min-w-[8px] h-2 rounded-full bg-gold/60"></div>
                  <p className="font-eb-garamond text-gray-700">
                    If refrigerated, allow to come to room temperature before serving.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 min-w-[8px] h-2 rounded-full bg-gold/60"></div>
                  <p className="font-eb-garamond text-gray-700">
                    Keep away from strong-smelling foods as sweets can absorb odors.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs
