"use client"

import { motion } from "framer-motion"
import { HeritageCornerDecoration } from "../../ui/heritage-decorations"

export default function DescriptionTab({ product }) {
  const description = product?.description || "Product description not available."

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

  // Split description into paragraphs
  const paragraphs = description.split("\n").filter((p) => p.trim() !== "")

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
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              className="mb-4 last:mb-0 text-gray-700 font-eb-garamond leading-relaxed"
              variants={itemVariants}
            >
              {paragraph}
            </motion.p>
          ))
        ) : (
          <motion.p className="text-gray-700 font-eb-garamond leading-relaxed" variants={itemVariants}>
            {description}
          </motion.p>
        )}
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
          <path
            d="M20,50 C20,33.4 33.4,20 50,20 C66.6,20 80,33.4 80,50 C80,66.6 66.6,80 50,80 C33.4,80 20,66.6 20,50 Z"
            stroke="#D4AF37"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M30,50 C30,38.9 38.9,30 50,30 C61.1,30 70,38.9 70,50 C70,61.1 61.1,70 50,70 C38.9,70 30,61.1 30,50 Z"
            stroke="#D4AF37"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M40,50 C40,44.5 44.5,40 50,40 C55.5,40 60,44.5 60,50 C60,55.5 55.5,60 50,60 C44.5,60 40,55.5 40,50 Z"
            stroke="#D4AF37"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>
    </motion.div>
  )
}
