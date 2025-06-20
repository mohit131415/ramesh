"use client"

import { useState } from "react"
import { Star, MessageSquare, Plus } from "lucide-react"
import { Button } from "../ui/button"
import ReviewCard from "./review-card"

const ReviewSection = ({ product }) => {
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Check if product has reviews
  const hasReviews = product.reviews && product.reviews.length > 0

  // Calculate average rating if reviews exist
  const averageRating = hasReviews
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0

  // Count reviews by rating
  const ratingCounts = hasReviews
    ? product.reviews.reduce((counts, review) => {
        counts[review.rating] = (counts[review.rating] || 0) + 1
        return counts
      }, {})
    : {}

  return (
    <div className="bg-white rounded-lg border border-gold/10 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="font-cinzel text-2xl text-gray-900 mb-2">Customer Reviews</h2>
          {hasReviews ? (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating) ? "text-gold-dark fill-gold-dark" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">
                {averageRating.toFixed(1)} out of 5 ({product.reviews.length} reviews)
              </span>
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          )}
        </div>

        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="mt-4 md:mt-0 bg-gold hover:bg-gold-dark text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Review form would go here */}
      {showReviewForm && (
        <div className="mb-8 p-4 border border-gold/20 rounded-lg bg-cream-light">
          <h3 className="font-cinzel text-lg mb-4">Write Your Review</h3>
          {/* Review form component would be imported and rendered here */}
          <p className="text-gray-600 italic">Review form component would be rendered here</p>
        </div>
      )}

      {/* Reviews list */}
      {hasReviews ? (
        <div className="space-y-6">
          {product.reviews.map((review, index) => (
            <ReviewCard key={review.id || index} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">No reviews yet for this product</p>
        </div>
      )}
    </div>
  )
}

export default ReviewSection
