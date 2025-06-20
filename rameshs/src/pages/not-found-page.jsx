"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Home, ArrowRight, Search } from "lucide-react"
import { UniversalButton } from "../components/ui/universal-button"
import { motion } from "framer-motion"
import { HeritageCornerDecoration, HeritageHeaderDecorationFull } from "../components/ui/heritage-decorations"

// Sweet images from existing project
const sweetImages = [
  "/sweets_images/kajukatli.webp",
  "/sweets_images/rasmalai.jpg",
  "/sweets_images/gulab_jamun.jpg",
  "/sweets_images/JILEBI.webp",
]

const NotFoundPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [randomSweets, setRandomSweets] = useState([])

  useEffect(() => {
    // Randomly select 2 sweet images
    const shuffled = [...sweetImages].sort(() => 0.5 - Math.random())
    setRandomSweets(shuffled.slice(0, 2))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    // In a real app, this would redirect to search results
    window.location.href = `/products?search=${searchQuery}`
  }

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern opacity-5 pointer-events-none"></div>

      {/* Gold gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-gold/5 pointer-events-none"></div>

      {/* Pink subtle overlay */}
      <div className="absolute inset-0 bg-pink-lighter/10 pointer-events-none"></div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-gold/30 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-gold/30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-gold/30 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-gold/30 pointer-events-none"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main content container with decorative border */}
          <div className="relative bg-white/80 backdrop-blur-sm border border-gold/30 rounded-lg p-8 md:p-12 shadow-xl">
            <HeritageCornerDecoration className="absolute inset-0" />

            <div className="text-center mb-8">
              <HeritageHeaderDecorationFull className="mb-6" />

              <motion.h1
                className="text-6xl md:text-8xl font-cinzel font-bold text-gold-dark mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                404
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-cinzel font-medium text-maroon mb-4">Sweet Not Found</h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto font-cinzel">
                  The delicacy you're looking for seems to have vanished from our collection.
                </p>
              </motion.div>
            </div>

            {/* Sweet images */}
            <motion.div
              className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {randomSweets.map((sweet, index) => (
                <div key={index} className="relative w-64 h-64 overflow-hidden rounded-lg border-2 border-gold/30">
                  <img src={sweet || "/placeholder.svg"} alt="Delicious Sweet" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white font-cinzel text-lg">Try Our Delicacies</span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Search form */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="max-w-md mx-auto">
                <h3 className="text-center text-lg font-cinzel font-medium mb-4 text-gold-dark">
                  Find Something Sweet
                </h3>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search for sweets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gold/30 rounded-lg focus:outline-none focus:border-gold/60 font-cinzel text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gold to-gold-dark text-white p-2 rounded-full"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link to="/">
                <UniversalButton variant="primary" icon={<Home />} iconPosition="left">
                  Return Home
                </UniversalButton>
              </Link>

              <Link to="/products">
                <UniversalButton variant="secondary" icon={<ArrowRight />} iconPosition="right">
                  Browse Collection
                </UniversalButton>
              </Link>
            </motion.div>
          </div>

          {/* Decorative bottom element */}
          <div className="mt-8 text-center">
            <div className="inline-block">
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-gold/60 to-transparent"></div>
              <div className="text-gold mt-2">✦</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
