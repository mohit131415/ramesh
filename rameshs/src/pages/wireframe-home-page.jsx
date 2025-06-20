"use client"

import React, { Suspense } from "react"

const WireframeTopCategories = React.lazy(() => import("../components/wireframe/wireframe-top-categories"))
const WireframeHeroSection = React.lazy(() => import("../components/wireframe/wireframe-hero-section"))
const WireframeQuickPicks = React.lazy(() => import("../components/wireframe/wireframe-quick-picks"))
const WireframeCategorySection = React.lazy(() => import("../components/wireframe/wireframe-category-section"))
const WireframeTestimonialsSection = React.lazy(() => import("../components/wireframe/wireframe-testimonials-section"))
const WireframeInstagramSection = React.lazy(() => import("../components/wireframe/wireframe-instagram-section"))
const WireframeCTASection = React.lazy(() => import("../components/wireframe/wireframe-cta-section"))
const WireframeSweetsSlider = React.lazy(() => import("../components/wireframe/wireframe-sweets-slider"))
const WireframeCakesSlider = React.lazy(() => import("../components/wireframe/wireframe-cakes-slider"))
const WireframeDryFruitsSlider = React.lazy(() => import("../components/wireframe/wireframe-dryfruits-slider"))
const WireframeHampersSlider = React.lazy(() => import("../components/wireframe/wireframe-hampers-slider"))

// Generate product data for each category
const generateProducts = (category, count = 15) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${category.toLowerCase()}-${i + 1}`,
    name: `${category} ${i + 1}`,
    price: Math.floor(Math.random() * 500) + 100,
    originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 700) + 200 : null,
    discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : 0,
    image: `/placeholder.svg?height=300&width=300&text=${category}+${i + 1}`,
  }))
}

// Create product data for each category
const sweetsProducts = generateProducts("Sweet", 15)
const cakesProducts = generateProducts("Cake", 15)
const dryfruitProducts = generateProducts("Dryfruit", 15)
const hampersProducts = generateProducts("Hamper", 15)

export default function WireframeHomePage() {
  return (
    <div className="min-h-screen bg-[#F7F2EE]">
      {/* Hero Section */}
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading Hero...</div>}>
        <WireframeHeroSection />
      </Suspense>

      {/* Top Categories Section */}
      <Suspense fallback={<div className="py-4">Loading Categories...</div>}>
        <WireframeTopCategories />
      </Suspense>

      {/* Quick Picks Section */}
      <Suspense fallback={<div className="py-4">Loading Quick Picks...</div>}>
        <WireframeQuickPicks />
      </Suspense>

      {/* Best Sellers Section */}
      {/* <WireframeBestSellers /> */}

      {/* Categories Section */}
      {/* <WireframeCategorySection /> */}

      {/* Sweets Product Slider - Background #fdf2f1 */}
      <Suspense fallback={<div className="py-4">Loading Sweets...</div>}>
        <WireframeSweetsSlider />
      </Suspense>

      {/* Dryfruit Product Slider - Background #fdf2f1 */}
      <Suspense fallback={<div className="py-4">Loading Dry Fruits...</div>}>
        <WireframeDryFruitsSlider />
      </Suspense>

      {/* Hampers Product Slider - Background #ffeade */}
      <Suspense fallback={<div className="py-4">Loading Hampers...</div>}>
        <WireframeHampersSlider />
      </Suspense>

      {/* Full Screen Video Section */}
      <video
        className="w-full h-screen object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/placeholder.svg?height=1080&width=1920&text=Delicious+Cakes+Video"
        src={window.innerWidth <= 768 ? "/video/reel.mp4" : "/video/video.webm"}
      >
        Your browser does not support the video tag.
      </video>

      {/* Cakes Product Slider - Background #ffeade */}
      <Suspense fallback={<div className="py-4">Loading Cakes...</div>}>
        <WireframeCakesSlider />
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<div className="py-4">Loading Testimonials...</div>}>
        <WireframeTestimonialsSection />
      </Suspense>

      {/* Instagram Section */}
      <Suspense fallback={<div className="py-4">Loading Instagram...</div>}>
        <WireframeInstagramSection />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<div className="py-4">Loading CTA...</div>}>
        <WireframeCTASection />
      </Suspense>
    </div>
  )
}
