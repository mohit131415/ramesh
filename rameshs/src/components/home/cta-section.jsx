import { Link } from "react-router-dom"
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { HeritageCornerDecoration, HeritageHeaderDecorationFull } from "../ui/heritage-decorations"
import { UniversalButton } from "../ui/universal-button"

const CTASection = () => {
  // SVG pattern for the background - more subtle and refined
  const patternSvg = `
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <g fill="#e6e1d8" fillOpacity="0.12">
          <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/>
        </g>
      </g>
    </svg>
  `

  // Convert SVG to data URL for background
  const patternUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(patternSvg)}")`

  return (
    <section className="py-16 relative overflow-hidden bg-white">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-15"
        style={{ backgroundImage: patternUrl, backgroundSize: "60px" }}
      ></div>

      {/* Decorative circles - more subtle */}
      <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-cream/20"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cream/20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Premium content container with refined border and shadow */}
          <div className="relative p-8 md:p-12 border border-cream/30 backdrop-blur-sm bg-white/70 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
            {/* Corner decorations */}
            <HeritageCornerDecoration className="absolute inset-0" />

            {/* Inner content with refined dashed border */}
            <div className="relative p-6 md:p-10 border border-dashed border-cream/20">
              <div className="text-center">
                {/* Decorative header element */}
                <HeritageHeaderDecorationFull className="mb-8" />

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-cinzel font-bold mb-4 text-dark-brown tracking-wide">
                  Craving Something Sweet?
                </h2>

                <p className="text-lg md:text-xl font-eb-garamond mb-10 text-dark-brown/80 max-w-3xl mx-auto leading-relaxed">
                  Order now and get your favorite sweets delivered within 60 minutes. We prepare everything fresh, just
                  for you.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  {/* Primary button with fixed icon alignment */}
                  <Link to="/products">
                    <UniversalButton 
                      variant="primary"
                      size="lg"
                      icon={<ShoppingBag />}
                      iconPosition="right"
                      className="min-w-[180px]"
                    >
                      Order Now
                    </UniversalButton>
                  </Link>

                  {/* Secondary button with fixed icon alignment */}
                  <Link to="/products">
                    <UniversalButton 
                      variant="secondary"
                      size="lg"
                      icon={<ArrowRight />}
                      iconPosition="right"
                      className="min-w-[180px]"
                    >
                      View Menu
                    </UniversalButton>
                  </Link>
                </div>

                {/* Delivery info with refined styling */}
                <div className="mt-12 inline-block relative">
                  <div className="px-8 py-3 bg-cream/5 border border-cream/20 rounded-full shadow-sm">
                    <p className="text-sm font-medium text-dark-brown/80">
                      Free delivery on orders above ₹500 • Same day delivery available
                    </p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-cream/30 rounded-full"></div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-cream/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom border - more subtle */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cream/30 to-transparent"></div>
    </section>
  )
}

export default CTASection
