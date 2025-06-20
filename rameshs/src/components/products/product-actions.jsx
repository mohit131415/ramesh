"use client"

import { useState } from "react"
import { Heart, ShoppingBag, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "../../contexts/cart-context"
import { useFavorites } from "../../contexts/favorites-context"

export default function ProductActions({ product }) {
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [isAdded, setIsAdded] = useState(false)

  const favorite = isFavorite(product.id)

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product.id)
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const cartItem = {
        name: product.name,
        image: product.image,
        price: product.price,
        weight: product.weight,
        variant: null, // No variant for this simple add to cart
      }

      // Use the correct addToCart method from the store
      const result = await addItem({
        id: product.id,
        quantity: 1,
        selectedVariant: { id: 0 }, // Default variant
        ...cartItem,
      })

      if (result) {
        // Show added indicator
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 2000)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`rounded-full p-2.5 shadow-md backdrop-blur-sm transition-colors ${
          favorite ? "bg-red-50 border border-red-200" : "bg-white/90 border border-[#d3ae6e]/20"
        }`}
        onClick={handleToggleFavorite}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`h-4 w-4 ${favorite ? "text-red-500 fill-red-500" : "text-[#d3ae6e]"}`} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`rounded-full p-2.5 shadow-md transition-colors ${
          isAdded ? "bg-green-500 text-white" : "bg-[#d3ae6e] text-white"
        }`}
        onClick={handleAddToCart}
        aria-label="Add to cart"
      >
        {isAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      </motion.button>
    </div>
  )
}
