"use client"

import { Instagram } from "lucide-react"
import { motion } from "framer-motion"

// SVG Components defined inline
const DecorativeCorner = ({ className = "", style = {} }) => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path d="M1 1L1 20M1 1H20M1 1L20 20" stroke="#D4AF37" strokeWidth="2" />
    <circle cx="10" cy="10" r="2" fill="#D4AF37" opacity="0.6" />
    <circle cx="30" cy="30" r="1.5" stroke="#D4AF37" strokeWidth="0.5" />
  </svg>
)

const DecorativeDivider = () => (
  <svg
    width="300"
    height="20"
    viewBox="0 0 300 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto my-4"
  >
    <path d="M20 10H130" stroke="#D4AF37" strokeWidth="1" />
    <path d="M170 10H280" stroke="#D4AF37" strokeWidth="1" />
    <circle cx="150" cy="10" r="6" stroke="#D4AF37" strokeWidth="1" fill="none" />
    <circle cx="150" cy="10" r="3" stroke="#D4AF37" strokeWidth="1" fill="none" />
    <path d="M145 5L155 15" stroke="#D4AF37" strokeWidth="0.5" />
    <path d="M145 15L155 5" stroke="#D4AF37" strokeWidth="0.5" />
  </svg>
)

// Heritage pattern SVG
const HeritagePattern = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 5L55 30L30 55L5 30L30 5Z" stroke="#D4AF37" strokeWidth="0.5" fill="none" />
    <path d="M30 15L45 30L30 45L15 30L30 15Z" stroke="#D4AF37" strokeWidth="0.5" fill="none" />
    <circle cx="30" cy="30" r="3" stroke="#D4AF37" strokeWidth="0.5" fill="none" />
    <path d="M5 5H55V55H5V5Z" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="1 2" fill="none" />
  </svg>
)

// Updated with real posts from @rameshsweetsandcakes
const instagramPosts = [
  {
    id: 1,
    image: "/sweets_images/kajukatli.webp",
    alt: "Silver-wrapped Kaju Katli in decorative bowl",
    link: "https://instagram.com/rameshsweetsandcakes",
  },
  {
    id: 2,
    image: "/sweets_images/gulab_jamun.jpg",
    alt: "Gulab Jamun in traditional brass bowl",
    link: "https://instagram.com/rameshsweetsandcakes",
  },
  {
    id: 3,
    image: "/sweets_images/rasgulla.jpg",
    alt: "White Rasgulla sweets in golden bowl",
    link: "https://instagram.com/rameshsweetsandcakes",
  },
  {
    id: 4,
    image: "/sweets_images/rasmalai.jpg",
    alt: "Saffron-infused Rasmalai in brass serving dish",
    link: "https://instagram.com/rameshsweetsandcakes",
  },
  {
    id: 5,
    image: "/sweets_images/Shrikhand.webp",
    alt: "Creamy Shrikhand with pistachio garnish",
    link: "https://instagram.com/rameshsweetsandcakes",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function InstagramSection() {
  return (
    <section
      className="py-12 md:py-16 relative overflow-hidden"
      style={{
        backgroundColor: "#fff9fb",
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5L35 20L20 35L5 20L20 5Z" stroke="#D4AF37" strokeOpacity="0.1" strokeWidth="0.5" fill="none"/>
      <circle cx="20" cy="20" r="1" stroke="#D4AF37" strokeOpacity="0.1" strokeWidth="0.5" fill="none"/>
    </svg>
  `)})`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff9fb]/80 via-transparent to-[#fff9fb]/80"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-1">
            <Instagram className="text-gold h-5 w-5 mr-2" />
            <span className="text-base font-medium text-gold font-cinzel">Follow Our Journey</span>
          </div>

          <a
            href="https://instagram.com/rameshsweetsandcakes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:text-gold transition-colors duration-300"
          >
            <h2 className="text-2xl md:text-4xl font-cinzel font-bold mb-3">@RAMESHSWEETSANDCAKES</h2>
          </a>

          {/* Custom SVG divider */}
          <DecorativeDivider />

          <p className="text-muted-foreground max-w-2xl mx-auto font-eb-garamond mb-6">
            Discover our artisanal creations and share your sweet moments with us
          </p>
        </div>

        {/* Instagram Grid with decorative frame */}
        <div className="relative max-w-7xl mx-auto">
          {/* Outer decorative corners */}
          <DecorativeCorner className="absolute -top-2 -left-2 z-20" />
          <DecorativeCorner className="absolute -top-2 -right-2 z-20" style={{ transform: "scaleX(-1)" }} />
          <DecorativeCorner className="absolute -bottom-2 -left-2 z-20" style={{ transform: "scaleY(-1)" }} />
          <DecorativeCorner className="absolute -bottom-2 -right-2 z-20" style={{ transform: "scale(-1)" }} />

          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 p-4 bg-white/80 backdrop-blur-sm border border-gold/20 relative"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Inner border */}
            <div className="absolute inset-2 border border-dashed border-gold/20 pointer-events-none"></div>

            {instagramPosts.map((post) => (
              <motion.a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden group relative"
                variants={itemVariants}
              >
                <div className="absolute inset-0 border-2 border-gold/60 rounded-sm pointer-events-none z-10 shadow-[0_0_5px_rgba(212,175,55,0.3)]"></div>
                <div className="aspect-square overflow-hidden rounded-sm">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-all duration-300 flex items-center justify-center z-0">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-3">
                    <Instagram className="text-white h-5 w-5 mb-1" />
                    <p className="text-white text-xs text-center font-eb-garamond line-clamp-2">{post.alt}</p>
                  </div>
                </div>

                {/* Corner accents for each image */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gold/80 z-20"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-gold/80 z-20"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-gold/80 z-20"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gold/80 z-20"></div>
              </motion.a>
            ))}
          </motion.div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://instagram.com/rameshsweetsandcakes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-2 border-2 border-gold text-gold hover:bg-gold hover:text-white transition-colors duration-300 rounded-sm font-cinzel font-medium relative overflow-hidden group"
          >
            <span className="absolute inset-0 w-full h-full bg-gold/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
            <Instagram className="mr-2 h-4 w-4" />
            <span className="relative z-10 text-sm">Follow on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  )
}
