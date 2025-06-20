"use client"
import { Star, Clock, Award, Leaf, Users } from "lucide-react"
import { motion } from "framer-motion"

const ProductMeta = ({ product }) => {
  if (!product) return null

  // Calculate average rating if reviews exist
  const hasReviews = product.reviews && product.reviews.length > 0
  const averageRating = hasReviews
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0

  const isVegetarian = product?.is_vegetarian === 1

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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  }

  return (
    <motion.div
      className="flex flex-wrap gap-3 items-center text-sm"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Category */}
      {product.category && (
        <motion.div className="flex items-center bg-gold/5 px-3 py-1.5 rounded-full" variants={itemVariants}>
          <Award className="mr-1.5 h-3.5 w-3.5 text-gold" />
          <span className="text-gold-dark font-medium">{product.category.name}</span>
        </motion.div>
      )}

      {/* Subcategory */}
      {product.subcategory && (
        <motion.div className="flex items-center bg-gold/5 px-3 py-1.5 rounded-full" variants={itemVariants}>
          <Award className="mr-1.5 h-3.5 w-3.5 text-gold" />
          <span className="text-gold-dark font-medium">{product.subcategory.name}</span>
        </motion.div>
      )}

      {/* Rating */}
      {hasReviews && (
        <motion.div className="flex items-center bg-gold/5 px-3 py-1.5 rounded-full" variants={itemVariants}>
          <div className="flex items-center mr-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(averageRating)
                    ? "text-gold fill-gold"
                    : i < averageRating
                      ? "text-gold fill-gold/50"
                      : "text-gold/30"
                }`}
              />
            ))}
          </div>
          <span className="text-gold-dark font-medium">
            {averageRating.toFixed(1)}{" "}
            <span className="text-gray-500 font-normal">({product.reviews.length} reviews)</span>
          </span>
        </motion.div>
      )}

      {/* Vegetarian indicator */}
      {isVegetarian !== undefined && (
        <motion.div
          className={`flex items-center ${
            isVegetarian ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          } px-3 py-1.5 rounded-full`}
          variants={itemVariants}
        >
          <Leaf className={`mr-1.5 h-3.5 w-3.5 ${isVegetarian ? "text-green-600" : "text-red-600"}`} />
          <span className="font-medium">{isVegetarian ? "Pure Vegetarian" : "Non-Vegetarian"}</span>
        </motion.div>
      )}

      {/* Shelf life */}
      {product?.shelf_life && (
        <motion.div className="flex items-center bg-gold/5 px-3 py-1.5 rounded-full" variants={itemVariants}>
          <Clock className="mr-1.5 h-3.5 w-3.5 text-gold" />
          <span className="text-gold-dark">{product.shelf_life}</span>
        </motion.div>
      )}

      {/* Weight */}
      {product.variants && product.variants.length > 0 && (
        <motion.div className="flex items-center bg-gold/5 px-3 py-1.5 rounded-full" variants={itemVariants}>
          <Users className="mr-1.5 h-3.5 w-3.5 text-gold" />
          <span className="text-gold-dark">
            {product.variants[0].weight} {product.variants[0].weight_unit}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ProductMeta
