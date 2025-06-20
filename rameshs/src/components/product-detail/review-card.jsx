import { Star, ThumbsUp, Flag } from "lucide-react"

const ReviewCard = ({ review }) => {
  // Format date if available
  const formattedDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date"

  return (
    <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{review.name || "Anonymous"}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= review.rating ? "text-gold-dark fill-gold-dark" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
        </div>

        {review.verified_purchase && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Verified Purchase</span>
        )}
      </div>

      {review.title && <h5 className="font-medium text-gray-900 mt-3 mb-1">{review.title}</h5>}

      <p className="text-gray-700 mb-3">{review.content || review.comment}</p>

      <div className="flex items-center gap-4 text-sm">
        <button className="flex items-center gap-1 text-gray-500 hover:text-gold-dark">
          <ThumbsUp className="h-4 w-4" />
          Helpful ({review.helpful_count || 0})
        </button>

        <button className="flex items-center gap-1 text-gray-500 hover:text-red-500">
          <Flag className="h-4 w-4" />
          Report
        </button>
      </div>
    </div>
  )
}

export default ReviewCard
