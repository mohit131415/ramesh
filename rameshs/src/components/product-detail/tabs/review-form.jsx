"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Send, CheckCircle } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { HeritageCornerDecoration } from "../../ui/heritage-decorations"

export default function ReviewForm({ productId }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    review: "",
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }))
  }

  const handleRatingHover = (rating) => {
    setHoveredRating(rating)
  }

  const handleRatingLeave = () => {
    setHoveredRating(0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setFormData({
          name: "",
          email: "",
          rating: 0,
          review: "",
        })
      }, 3000)
    }, 1500)
  }

  return (
    <div className="relative bg-cream/30 backdrop-blur-sm p-6 rounded-lg border border-gold/20 overflow-hidden">
      {/* Decorative corner elements */}
      <HeritageCornerDecoration className="absolute inset-0 pointer-events-none" variant="inner" />

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-cinzel text-gold-dark mb-2">Thank You for Your Review!</h3>
              <p className="text-gray-700 font-eb-garamond max-w-md">
                Your feedback is valuable to us and helps other customers make informed decisions.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <h3 className="text-xl font-cinzel text-gold-dark mb-4">Write a Review</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-gold/30 focus:border-gold focus:ring-gold/30"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-gold/30 focus:border-gold focus:ring-gold/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div
                    className="flex items-center gap-1"
                    onMouseLeave={handleRatingLeave}
                    aria-label={`Rating: ${formData.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        onMouseEnter={() => handleRatingHover(rating)}
                        className="p-1 focus:outline-none focus:ring-2 focus:ring-gold/30 rounded-full transition-transform hover:scale-110"
                        aria-label={`Rate ${rating} out of 5 stars`}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            rating <= (hoveredRating || formData.rating) ? "text-gold fill-gold" : "text-gray-300"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {formData.rating > 0 ? `${formData.rating} out of 5` : "Select a rating"}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <Textarea
                    id="review"
                    name="review"
                    value={formData.review}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="border-gold/30 focus:border-gold focus:ring-gold/30 font-eb-garamond"
                    placeholder="Share your experience with this product..."
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || formData.rating === 0}
                  className={`bg-gold hover:bg-gold-dark text-white w-full sm:w-auto px-6 py-2 rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSubmitting ? "opacity-80" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
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
    </div>
  )
}
