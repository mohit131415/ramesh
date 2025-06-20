"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ChevronRight, ArrowLeft, Leaf, Clock, Package, Star, Shield, Truck, Award } from "lucide-react"
import { Helmet } from "react-helmet"

// Services and hooks
import { getProductBySlug } from "../services/product-service"
import apiClient from "../services/api-client"
import useProductStore from "../store/productStore"

// Components
import ProductGallery from "../components/product-detail/product-gallery"
import ProductInfo from "../components/product-detail/product-info"
import ProductTabs from "../components/product-detail/product-tabs"
import RelatedProducts from "../components/product-detail/related-products"
import LoadingSpinner from "../components/common/loading-spinner"
import { Button } from "../components/ui/button"

// Helper function to format weight
const formatWeight = (weight, unit) => {
  if (unit === "g") {
    return `${Number.parseFloat(weight).toFixed(0)}g`
  } else if (unit === "kg") {
    return `${Number.parseFloat(weight).toFixed(2)}kg`
  }
  return `${weight} ${unit}`
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [selectedVariant, setSelectedVariant] = useState(null)
  const addToRecentlyViewed = useProductStore((state) => state.addToRecentlyViewed)

  // Fetch product data
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", "slug", slug],
    queryFn: () => getProductBySlug(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })

  const product = productData?.data

  // Sort variants by price (lowest first) if available
  if (product && product.variants && product.variants.length > 0) {
    // Create a sorted copy of the variants array
    product.variants = [...product.variants].sort((a, b) => {
      // Use sale_price if available, otherwise use regular price
      const priceA = a.sale_price || a.price
      const priceB = b.sale_price || b.price
      return priceA - priceB
    })
  }

  // Set the selected variant when product data is loaded
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Find the variant with the lowest price
      const lowestPriceVariant = product.variants.reduce((lowest, current) => {
        // Use sale_price if available, otherwise use regular price
        const lowestPrice = lowest.sale_price || lowest.price
        const currentPrice = current.sale_price || current.price

        return currentPrice < lowestPrice ? current : lowest
      }, product.variants[0])

      setSelectedVariant(lowestPriceVariant)
    }
  }, [product])

  // Add to recently viewed when component mounts
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product)
    }
  }, [product, addToRecentlyViewed])

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const contentVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
        ease: "easeOut",
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading premium product...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
            <Package className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-3xl font-cinzel text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We couldn't find the product you're looking for. It may have been removed or the link might be incorrect.
          </p>
          <Button
            onClick={() => navigate("/products")}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Browse Our Collection
          </Button>
        </div>
      </div>
    )
  }

  // Get primary image for meta tags
  const primaryImage =
    product.images && product.images.length > 0 ? apiClient.getImageUrl(product.images[0].image_path) : null

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image:
      product.images && product.images.length > 0
        ? product.images.map((img) => apiClient.getImageUrl(img.image_path))
        : [],
    description: product.description || product.short_description,
    sku: selectedVariant?.sku || `RAMESH-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Ramesh Sweets",
    },
    offers: {
      "@type": "Offer",
      url: window.location.href,
      priceCurrency: "INR",
      price: selectedVariant ? selectedVariant.sale_price || selectedVariant.price : product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Ramesh Sweets",
      },
    },
  }

  // If we have reviews, add aggregateRating to structured data
  if (product.reviews && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / product.reviews.length

    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount: product.reviews.length,
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* SEO Metadata */}
      <Helmet>
        <title>{product.name} | Ramesh Sweets - Premium Indian Confectionery</title>
        <meta
          name="description"
          content={
            product.short_description ||
            `Buy ${product.name} from Ramesh Sweets. Premium quality Indian sweets made with authentic recipes and finest ingredients.`
          }
        />
        <meta property="og:title" content={`${product.name} | Ramesh Sweets`} />
        <meta
          property="og:description"
          content={
            product.short_description ||
            `Buy ${product.name} from Ramesh Sweets. Premium quality Indian sweets made with authentic recipes.`
          }
        />
        {primaryImage && <meta property="og:image" content={primaryImage} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        {primaryImage && <meta name="twitter:image" content={primaryImage} />}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Premium Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          {/* Breadcrumb navigation */}
          <motion.nav className="flex items-center text-sm" variants={itemVariants}>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-amber-700 hover:bg-amber-50 flex items-center gap-2 mr-3 rounded-full px-4 py-2 transition-all duration-300"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <a href="/" className="text-gray-600 hover:text-amber-700 transition-colors font-medium">
                Home
              </a>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <a href="/products" className="text-gray-600 hover:text-amber-700 transition-colors font-medium">
                Products
              </a>
              {product.category && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <a
                    href={`/category/${product.category.id}`}
                    className="text-gray-600 hover:text-amber-700 transition-colors font-medium"
                  >
                    {product.category.name}
                  </a>
                </>
              )}
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <span className="text-amber-700 font-semibold truncate max-w-[200px]">{product.name}</span>
            </div>
          </motion.nav>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Main product section */}
        <motion.div
          className="grid grid-cols-12 gap-12 mb-16"
          variants={contentVariants}
          initial="initial"
          animate="animate"
        >
          {/* Product gallery */}
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-5">
            <div className="sticky top-32">
              <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/50 p-8 border border-amber-100/50">
                <ProductGallery product={product} />
              </div>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-amber-100/50">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700">100% Pure</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-amber-100/50">
                  <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700">Premium Quality</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Product information */}
          <motion.div className="col-span-12 lg:col-span-7" variants={itemVariants}>
            <div className="space-y-8">
              {/* Product header */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-amber-100/50 shadow-xl shadow-amber-100/30">
                {/* Product title */}
                <div className="mb-6">
                  <h1 className="font-cinzel text-4xl lg:text-5xl xl:text-6xl text-gray-900 tracking-wide mb-4 leading-tight">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-gray-600 font-medium">(4.8) • 127 reviews</span>
                  </div>

                  {/* Product Tags */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {product.category && (
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full border border-amber-200">
                        <span className="text-sm font-semibold">{product.category.name}</span>
                      </div>
                    )}

                    {product.subcategory && (
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full border border-amber-200">
                        <span className="text-sm font-semibold">{product.subcategory.name}</span>
                      </div>
                    )}

                    {product.is_vegetarian === 1 && (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full border border-green-200 flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        <span className="text-sm font-semibold">Pure Vegetarian</span>
                      </div>
                    )}

                    {product.shelf_life && (
                      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full border border-blue-200 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-semibold">{product.shelf_life}</span>
                      </div>
                    )}

                    {selectedVariant && selectedVariant.weight && (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full border border-purple-200 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          {formatWeight(selectedVariant.weight, selectedVariant.weight_unit)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product description */}
                {product.short_description && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                    <p className="text-gray-700 leading-relaxed font-medium">{product.short_description}</p>
                  </div>
                )}
              </div>

              {/* Product info component */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-amber-100/50 shadow-xl shadow-amber-100/30">
                <ProductInfo
                  product={product}
                  selectedVariant={selectedVariant}
                  setSelectedVariant={setSelectedVariant}
                  hideHeader={true}
                  hideCartMessage={true} // Add this prop to hide cart messages
                />
              </div>

              {/* Delivery & Service Info */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-amber-100/50 shadow-xl shadow-amber-100/30">
                <h3 className="text-xl font-cinzel text-gray-900 mb-6">Delivery & Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Free Delivery</h4>
                      <p className="text-sm text-gray-600">On orders above ₹500</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Quality Guarantee</h4>
                      <p className="text-sm text-gray-600">100% satisfaction assured</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Product tabs */}
        <motion.section className="mb-16" variants={itemVariants}>
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-amber-100/50 shadow-xl shadow-amber-100/30 overflow-hidden">
            <ProductTabs product={product} />
          </div>
        </motion.section>

        {/* Related products */}
        <motion.section variants={itemVariants}>
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-amber-100/50 shadow-xl shadow-amber-100/30">
            <RelatedProducts categoryId={product.category?.id} currentProductId={product.id} />
          </div>
        </motion.section>

        {/* Back to top button */}
        <motion.div className="flex justify-center mt-16" variants={itemVariants}>
          <Button
            variant="outline"
            className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 backdrop-blur-sm bg-white/60 rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to Top
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
