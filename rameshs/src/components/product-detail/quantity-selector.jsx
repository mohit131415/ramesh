"use client"

import { motion } from "framer-motion"
import { Minus, Plus } from "lucide-react"

export default function QuantitySelector({ value = 1, onChange, min = 1, max = 10 }) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <motion.div
      className="inline-flex items-center border border-gold/40 rounded-lg overflow-hidden bg-white shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.button
        type="button"
        className="w-10 h-10 flex items-center justify-center text-gold-dark hover:bg-gold/10 transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-inset disabled:opacity-50 disabled:hover:bg-transparent"
        onClick={handleDecrement}
        disabled={value <= min}
        whileTap={{ scale: 0.95 }}
      >
        <Minus className="h-4 w-4" />
      </motion.button>

      <div className="w-12 h-10 flex items-center justify-center border-x border-gold/40 bg-white/80 font-medium text-gray-800">
        {value}
      </div>

      <motion.button
        type="button"
        className="w-10 h-10 flex items-center justify-center text-gold-dark hover:bg-gold/10 transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-inset disabled:opacity-50 disabled:hover:bg-transparent"
        onClick={handleIncrement}
        disabled={value >= max}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}
