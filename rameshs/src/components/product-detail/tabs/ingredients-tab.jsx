"use client"

import { motion } from "framer-motion"
import { Leaf, AlertTriangle } from "lucide-react"
import { HeritageCornerDecoration } from "../../ui/heritage-decorations"

export default function IngredientsTab({ product }) {
  const ingredients = product?.ingredients || "Ingredients information not available."
  const allergens = product?.allergens || []

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  // Split ingredients into array if it's a string
  const ingredientsList = typeof ingredients === "string" ? ingredients.split(",").map((i) => i.trim()) : ingredients

  return (
    <motion.div
      className="relative bg-cream/30 backdrop-blur-sm p-6 rounded-lg border border-gold/20 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Decorative corner elements */}
      <HeritageCornerDecoration className="absolute inset-0 pointer-events-none" variant="inner" />

      {/* Content */}
      <div className="relative z-10 space-y-8">
        {/* Ingredients section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-cinzel text-gold-dark">Ingredients</h3>
          </div>

          {Array.isArray(ingredientsList) ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {ingredientsList.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700 font-eb-garamond">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/60 flex-shrink-0"></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 font-eb-garamond">{ingredients}</p>
          )}
        </motion.div>

        {/* Allergens section */}
        {allergens && allergens.length > 0 && (
          <motion.div variants={itemVariants} className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-cinzel text-gold-dark">Allergen Information</h3>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {allergens.map((allergen, index) => (
                  <li key={index} className="flex items-center gap-2 text-amber-800 font-eb-garamond">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    {allergen}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Storage instructions */}
        <motion.div variants={itemVariants} className="mt-6 p-4 border-l-4 border-gold/30 bg-gold/5 rounded-r-lg">
          <h4 className="font-cinzel text-gold-dark mb-2">Storage Instructions</h4>
          <p className="text-gray-700 font-eb-garamond">
            Store in a cool, dry place away from direct sunlight. Once opened, consume within 3-4 days for optimal
            freshness and flavor.
          </p>
        </motion.div>
      </div>

      {/* Decorative gold pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,50 C0,22.4 22.4,0 50,0 C77.6,0 100,22.4 100,50 C100,77.6 77.6,100 50,100 C22.4,100 0,77.6 0,50 Z"
            stroke="#D4AF37"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M10,50 C10,27.9 27.9,10 50,10 C72.1,10 90,27.9 90,50 C90,72.1 72.1,90 50,90 C27.9,90 10,72.1 10,50 Z"
            stroke="#D4AF37"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M20,50 C20,33.4 33.4,20 50,20 C66.6,20 80,33.4 80,50 C80,66.6 66.6,80 50,80 C33.4,80 20,66.6 20,50 Z"
            stroke="#D4AF37"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>
    </motion.div>
  )
}
