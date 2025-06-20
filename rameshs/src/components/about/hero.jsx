export default function WireframeHeroSection() {
  return (
    <section className="relative h-[50vh] bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 overflow-hidden">
      {/* Floating Heritage Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-10 left-10 w-32 h-32 border border-current rounded-full"
          style={{ color: "#d0b271" }}
        ></div>
        <div
          className="absolute top-20 right-20 w-24 h-24 border border-current"
          style={{ color: "#d0b271", transform: "rotate(45deg)" }}
        ></div>
        <div
          className="absolute bottom-16 left-1/4 w-20 h-20 border border-current rounded-full"
          style={{ color: "#d0b271" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 h-full">
        <div className="grid lg:grid-cols-2 h-full items-center gap-8">
          {/* Left Content - Unique Typography Layout */}
          <div className="relative z-10">
            {/* Premium Badge */}
            <div
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm mb-6 border"
              style={{ borderColor: "#d0b271" }}
            >
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: "#d0b271" }}></div>
              <span className="text-sm font-cinzel tracking-wider" style={{ color: "#d0b271" }}>
                EST. 1985
              </span>
            </div>

            {/* Unique Stacked Typography */}
            <div className="relative">
              <h1
                className="font-cinzel text-5xl md:text-6xl lg:text-7xl font-bold leading-none mb-2"
                style={{ color: "#d0b271" }}
              >
                RAMESH
              </h1>
              <div className="relative">
                <h2
                  className="font-display text-3xl md:text-4xl lg:text-5xl italic opacity-80 -mt-2 ml-8"
                  style={{ color: "#d0b271" }}
                >
                  Sweets
                </h2>
                {/* Decorative Line */}
                <div className="absolute -bottom-2 left-0 w-24 h-0.5" style={{ backgroundColor: "#d0b271" }}></div>
              </div>
            </div>

            {/* Elegant Tagline */}
            <p
              className="font-eb-garamond text-lg md:text-xl mt-6 mb-8 max-w-md leading-relaxed"
              style={{ color: "#d0b271" }}
            >
              Where tradition meets perfection in every bite of our handcrafted delicacies
            </p>

            {/* Premium CTA */}
            <div className="flex items-center space-x-6">
              <button
                className="group relative px-8 py-4 bg-white/20 backdrop-blur-sm border-2 rounded-lg font-cinzel font-semibold tracking-wide hover:bg-white/30 transition-all duration-300"
                style={{ borderColor: "#d0b271", color: "#d0b271" }}
              >
                <span className="relative z-10">EXPLORE COLLECTION</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
              </button>

              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                  <span className="text-xl" style={{ color: "#d0b271" }}>
                    ▶
                  </span>
                </div>
                <span className="font-eb-garamond text-sm" style={{ color: "#d0b271" }}>
                  Watch Story
                </span>
              </div>
            </div>
          </div>

          {/* Right Visual - Unique Floating Elements */}
          <div className="relative h-full flex items-center justify-center">
            {/* Main Product Showcase */}
            <div className="relative">
              {/* Central Image */}
              <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-300 rounded-full shadow-2xl relative overflow-hidden">
                <div className="absolute inset-4 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="font-cinzel text-white text-lg">Premium Sweets</span>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -left-8 w-20 h-20 bg-gray-200 rounded-lg shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-cinzel text-gray-600">Gulab</span>
                </div>
              </div>

              <div className="absolute -top-4 -right-12 w-16 h-16 bg-gray-200 rounded-full shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-cinzel text-gray-600">Kaju</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-12 w-24 h-16 bg-gray-200 rounded-lg shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-cinzel text-gray-600">Barfi</span>
                </div>
              </div>

              <div className="absolute -bottom-8 -right-8 w-18 h-18 bg-gray-200 rounded-full shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-cinzel text-gray-600">Laddu</span>
                </div>
              </div>

              {/* Decorative Rings */}
              <div
                className="absolute inset-0 border-2 border-dashed rounded-full animate-spin"
                style={{ borderColor: "#d0b271", animationDuration: "20s" }}
              ></div>
              <div
                className="absolute -inset-8 border border-dashed rounded-full animate-spin"
                style={{ borderColor: "#d0b271", animationDuration: "30s", animationDirection: "reverse" }}
              ></div>
            </div>

            {/* Heritage Seal */}
            <div
              className="absolute top-4 right-4 w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full border-2 flex flex-col items-center justify-center"
              style={{ borderColor: "#d0b271" }}
            >
              <span className="font-cinzel text-xs font-bold" style={{ color: "#d0b271" }}>
                SINCE
              </span>
              <span className="font-cinzel text-sm font-bold" style={{ color: "#d0b271" }}>
                1985
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="font-eb-garamond text-xs mb-2" style={{ color: "#d0b271" }}>
          Scroll to explore
        </span>
        <div className="w-6 h-10 border-2 rounded-full flex justify-center" style={{ borderColor: "#d0b271" }}>
          <div className="w-1 h-3 rounded-full mt-2 animate-bounce" style={{ backgroundColor: "#d0b271" }}></div>
        </div>
      </div>
    </section>
  )
}
