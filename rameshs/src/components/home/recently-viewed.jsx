"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { HeritageCorner } from "../product-detail/heritage-elements"
import { HeritageHeaderDecoration } from "../ui/heritage-decorations"
import { useLocalStorage } from "../../hooks/use-local-storage"

// Mock products data for recently viewed
const mockProducts = [
  {
    id: 1,
    name: "Premium Gulab Jamun Box",
    price: 450,
    image: "/placeholder.svg?height=200&width=200&text=Gulab+Jamun",
  },
  {
    id: 2,
    name: "Special Kaju Katli",
    price: 650,
    image: "/placeholder.svg?height=200&width=200&text=Kaju+Katli",
  },
  {
    id: 3,
    name: "Mixed Dry Fruits Box",
    price: 850,
    image: "/placeholder.svg?height=200&width=200&text=Dry+Fruits",
  },
  {
    id: 4,
    name: "Rasgulla Special",
    price: 350,
    image: "/placeholder.svg?height=200&width=200&text=Rasgulla",
  },
]

export default function RecentlyViewed() {
  const [recentlyViewed] = useLocalStorage("recentlyViewed", [])
  const [viewedProducts, setViewedProducts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Only show products that have actually been viewed
    if (recentlyViewed && recentlyViewed.length > 0) {
      // Filter products based on recently viewed IDs
      const productsToShow = recentlyViewed
        .map((id) => mockProducts.find((p) => p.id === id || p.id === Number(id)))
        .filter(Boolean)
        .slice(0, 4)

      setViewedProducts(productsToShow)
    } else {
      // Show some default products if no recently viewed items
      setViewedProducts(mockProducts.slice(0, 4))
    }
  }, [recentlyViewed])

  // Don't render if no products to show
  if (!viewedProducts || viewedProducts.length === 0) return null

  return (
    <section className="py-16 relative bg-white">
      {/* Heritage decorative elements */}
      <HeritageHeaderDecoration className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/20" />
      <HeritageHeaderDecoration className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-gold/20" />

      <div className="container mx-auto px-4">
        <div className="relative mb-12">
          {/* Heritage corners */}
          <HeritageCorner className="absolute -top-3 -left-3" rotate={0} />
          <HeritageCorner className="absolute -top-3 -right-3" rotate={90} />
          <HeritageCorner className="absolute -bottom-3 -right-3" rotate={180} />
          <HeritageCorner className="absolute -bottom-3 -left-3" rotate={270} />

          <div className="text-center border-2 border-gold/20 py-6 px-4 rounded-lg bg-white/80">
            <h2 className="font-cinzel text-3xl font-bold text-amber-900 mb-2">Recently Viewed</h2>
            <div className="w-24 h-0.5 bg-gold mx-auto mb-4"></div>
            <p className="text-amber-800/80 font-eb-garamond text-lg max-w-2xl mx-auto">
              Continue exploring your favorite selections or discover new delights from our collection.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {viewedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link to={`/products/${product.id}`} className="group block">
                <div className="relative overflow-hidden rounded-lg border border-amber-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        product.image ||
                        `/placeholder.svg?height=160&width=160&text=${encodeURIComponent(product.name)}`
                      }
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm font-bold text-amber-800 mt-1">₹{product.price}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-gold/90 hover:bg-gold text-white rounded-md font-medium transition-colors duration-300 flex items-center gap-2 shadow-md"
          >
            View All Products
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
