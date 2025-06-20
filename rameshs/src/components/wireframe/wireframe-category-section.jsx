"use client"

import { WireframeSectionHeader } from "./wireframe-section-header"

function WireframeCategorySection() {
  // 4 main categories with the exact images provided by user
  const categories = [
    {
      name: "Cakes",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV8HVNlxXVrnyR8oF8colNZeUCBGQaOdrGOA&s",
    },
    {
      name: "Dryfruit",
      image: "https://thumbs.dreamstime.com/b/decorated-dry-fruits-6802511.jpg",
    },
    {
      name: "Hampers",
      image: "http://localhost:5173/api/public/uploads/categories/119f044200025527cb9ad1746bf9c5f7.jpg",
    },
    {
      name: "Sweets",
      image: "http://localhost:5173/api/public/uploads/categories/5fffeb9b19db1b63a63773757bd21792.jpg",
    },
  ]

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-[#F7F2EE] mt-2 md:mt-4">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Using our section header component with reduced margin */}
        <div className="mb-4 md:mb-6 text-center">
          <WireframeSectionHeader title="Categories" />
        </div>

        {/* Grid layout: 2x2 on mobile, horizontal on larger screens */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:flex md:overflow-x-auto md:pb-4 mb-4 md:mb-6 hide-scrollbar">
          <div className="md:flex md:flex-nowrap md:gap-6 md:w-full contents">
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer md:flex-shrink-0 md:w-[calc(25%-18px)]">
                <div className="rounded-2xl overflow-hidden transition-all duration-300">
                  {/* Category Image - 1:1 aspect ratio */}
                  <div className="aspect-square overflow-hidden rounded-2xl mb-2 md:mb-3">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Category Info - only name, no description */}
                  <div className="px-1">
                    <h3 className="text-sm md:text-lg font-bold text-[#78383b] font-['Playfair_Display'] text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* See All Categories Link instead of button */}
        <div className="text-center">
          <a
            href="/categories"
            className="font-['Playfair_Display'] text-[#78383b] hover:text-[#78383b] inline-flex items-center gap-2 group transition-all duration-200 hover:underline"
          >
            <span>See All Categories</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

export default WireframeCategorySection
