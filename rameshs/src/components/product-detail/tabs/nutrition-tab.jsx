"use client"

import { motion } from "framer-motion"
import { HeritageCornerDecoration } from "../../ui/heritage-decorations"

export default function NutritionTab({ product }) {
  const nutritionFacts = product?.nutrition_facts || []
  const servingSize = product?.serving_size || "100g"
  const calories = product?.calories || "N/A"

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  }

  // Sample nutrition facts if none provided
  const defaultNutritionFacts = [
    { name: "Total Fat", value: "10g", daily_value: "15%" },
    { name: "Saturated Fat", value: "6g", daily_value: "30%" },
    { name: "Trans Fat", value: "0g", daily_value: "" },
    { name: "Cholesterol", value: "5mg", daily_value: "2%" },
    { name: "Sodium", value: "160mg", daily_value: "7%" },
    { name: "Total Carbohydrate", value: "42g", daily_value: "15%" },
    { name: "Dietary Fiber", value: "1g", daily_value: "4%" },
    { name: "Total Sugars", value: "27g", daily_value: "" },
    { name: "Includes Added Sugars", value: "25g", daily_value: "50%" },
    { name: "Protein", value: "3g", daily_value: "6%" },
    { name: "Vitamin D", value: "0mcg", daily_value: "0%" },
    { name: "Calcium", value: "20mg", daily_value: "2%" },
    { name: "Iron", value: "0.5mg", daily_value: "2%" },
    { name: "Potassium", value: "85mg", daily_value: "2%" },
  ]

  const facts = nutritionFacts.length > 0 ? nutritionFacts : defaultNutritionFacts

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
      <div className="relative z-10">
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-xl font-cinzel text-gold-dark mb-2">Nutrition Facts</h3>
          <div className="flex flex-col sm:flex-row gap-4 text-gray-700 font-eb-garamond">
            <div className="flex items-center gap-2">
              <span className="font-medium">Serving Size:</span>
              <span>{servingSize}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Calories:</span>
              <span>{calories}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr className="border-b-2 border-gold/30">
                <th className="py-3 px-4 text-left font-cinzel text-gold-dark">Nutrient</th>
                <th className="py-3 px-4 text-right font-cinzel text-gold-dark">Amount</th>
                <th className="py-3 px-4 text-right font-cinzel text-gold-dark">% Daily Value*</th>
              </tr>
            </thead>
            <tbody>
              {facts.map((fact, index) => (
                <motion.tr
                  key={index}
                  className={`border-b border-gold/10 ${
                    fact.name.includes("Total") ? "font-medium" : "font-normal"
                  } ${fact.name.startsWith(" ") ? "pl-4" : ""}`}
                  variants={itemVariants}
                >
                  <td className="py-3 px-4 text-left font-eb-garamond text-gray-700">
                    {fact.name.startsWith(" ") ? (
                      <span className="inline-block ml-4">{fact.name.trim()}</span>
                    ) : (
                      fact.name
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-eb-garamond text-gray-700">{fact.value}</td>
                  <td className="py-3 px-4 text-right font-eb-garamond text-gray-700">{fact.daily_value || "-"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p variants={itemVariants} className="mt-4 text-sm text-gray-500 font-eb-garamond">
          * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending
          on your calorie needs.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-8 p-4 border border-gold/20 rounded-lg bg-gold/5 font-eb-garamond text-gray-700"
        >
          <p>
            <span className="font-medium">Note:</span> Nutrition information is approximate and may vary based on
            preparation method, serving size, and ingredient variations. For specific dietary concerns, please contact
            us directly.
          </p>
        </motion.div>
      </div>

      {/* Decorative gold pattern */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
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
        </svg>
      </div>
    </motion.div>
  )
}
