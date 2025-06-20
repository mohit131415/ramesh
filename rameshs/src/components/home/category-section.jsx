"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import HeritageSectionHeader from "../ui/heritage-section-header"
import { UniversalButton } from "../ui/universal-button"
import { useFeaturedCategories } from "../../hooks/useFeaturedItems"
import useFeaturedStore from "../../store/featuredStore"
import apiClient from "../../services/api-client"

// Luxury Corner SVG
const LuxuryCorner = ({ className, rotate = 0 }) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    className={className}
    style={{ transform: `rotate(${rotate}deg)` }}
  >
    <path
      d="M1 1V16C1 25.9411 9.05887 34 19 34H34V39"
      stroke="url(#gold-gradient)"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="34" cy="34" r="3" fill="url(#gold-circle)" />
    <circle cx="1" cy="1" r="1" fill="#D4AF37" />
    <defs>
      <linearGradient id="gold-gradient" x1="1" y1="1" x2="34" y2="39" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--color-gold-light)" />
        <stop offset="0.5" stopColor="var(--color-gold)" />
        <stop offset="1" stopColor="var(--color-gold-dark)" />
      </linearGradient>
      <radialGradient id="gold-circle" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--color-gold-light)" />
        <stop offset="1" stopColor="var(--color-gold)" />
      </radialGradient>
    </defs>
  </svg>
)

// Luxury Category Card Component
const LuxuryCategoryCard = ({ category, index }) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.15,
      },
    },
  }

  // Get category image
  const getCategoryImage = (category) => {
    if (!category || !category.image) {
      return "/placeholder.svg"
    }
    return apiClient.getImageUrl(category.image)
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="relative group"
    >
      {/* Make the entire card clickable */}
      <Link to={`/products?category=${category.id}`} className="block h-full">
        <div className="relative overflow-hidden h-full z-0 p-3 bg-white transition-transform duration-300 hover:scale-[1.02]">
          {/* Luxury Border */}
          <div className="absolute inset-0 border border-gold/30"></div>
          <div className="absolute inset-[3px] border border-gold/10"></div>

          {/* Luxury Corners */}
          <LuxuryCorner className="absolute -top-2 -left-2 scale-100" rotate={0} />
          <LuxuryCorner className="absolute -top-2 -right-2 scale-100" rotate={90} />
          <LuxuryCorner className="absolute -bottom-2 -left-2 scale-100" rotate={270} />
          <LuxuryCorner className="absolute -bottom-2 -right-2 scale-100" rotate={180} />

          {/* Category Image with Frame */}
          <div className="relative aspect-[4/3] overflow-hidden mb-4 shadow-lg">
            {/* Border */}
            <div className="absolute inset-0 border-2 border-gold"></div>

            {/* Image with highest z-index */}
            <img
              src={getCategoryImage(category) || "/placeholder.svg"}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          </div>

          {/* Category Content */}
          <div className="relative px-2 py-4 text-center">
            {/* Decorative Element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold/80 to-transparent"></div>
            </div>

            {/* Category Name */}
            <h3 className="font-cinzel text-xl font-bold text-black mb-2 tracking-wide">{category.name}</h3>

            <p className="text-black/70 text-sm mb-5 font-eb-garamond italic line-clamp-2">{category.description}</p>

            {/* Explore Button */}
            <div className="inline-flex items-center justify-center text-sm font-medium text-gold group/link">
              <span className="mr-1 border-b border-gold/30 group-hover/link:border-gold-dark pb-0.5 uppercase">
                Explore Collection
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>

            {/* Bottom Decorative Element */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
              <div className="w-8 h-8 rotate-45 border border-gold/30 bg-white"></div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function CategorySection() {
  // Get featured categories from the store
  const { featuredCategories, featuredCategoriesLoading } = useFeaturedStore()

  // Fetch featured categories using TanStack Query
  const { isError } = useFeaturedCategories()

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  // Render loading state
  if (featuredCategoriesLoading) {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <HeritageSectionHeader
            title="Exquisite Collections"
            subtitle="Discover our handcrafted premium sweet collections"
            preTitle="LUXURY CATEGORIES"
            topSymbol="❖"
            bottomSymbol="✦"
            className="mb-12"
          />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        </div>
      </section>
    )
  }

  // Render error state
  if (isError) {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <HeritageSectionHeader
            title="Exquisite Collections"
            subtitle="Discover our handcrafted premium sweet collections"
            preTitle="LUXURY CATEGORIES"
            topSymbol="❖"
            bottomSymbol="✦"
            className="mb-12"
          />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load categories</p>
              <UniversalButton variant="secondary" size="sm" onClick={() => window.location.reload()}>
                Retry
              </UniversalButton>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Luxury Background */}
      <div className="absolute inset-0 bg-pink-lighter/30"></div>
      <div className="absolute inset-0 bg-[url('/patterns/subtle-pattern.png')] opacity-5"></div>

      {/* Large Decorative Corners */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gold/30 rounded-tl-sm"></div>
      <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-gold/30 rounded-tr-sm"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gold/30 rounded-bl-sm"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gold/30 rounded-br-sm"></div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <HeritageSectionHeader
          title="Exquisite Collections"
          subtitle="Discover our handcrafted premium sweet collections"
          preTitle="LUXURY CATEGORIES"
          topSymbol="❖"
          bottomSymbol="✦"
          className="mb-12"
        />

        {/* Categories Grid */}
        <div className="relative p-8 border border-gold/20 bg-white/80 backdrop-blur-sm">
          {/* Luxury Corners for Grid Container */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/40"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-gold/40"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold/40"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/40"></div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {featuredCategories.map((category, index) => (
              <LuxuryCategoryCard key={category.id} category={category} index={index} />
            ))}
          </motion.div>
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <UniversalButton
            as={Link}
            to="/products"
            variant="primary"
            className="bg-gold border-gold/50 hover:bg-gold-dark px-8 py-3 text-base"
          >
            BROWSE ALL COLLECTIONS
          </UniversalButton>
        </div>
      </div>
    </section>
  )
}
