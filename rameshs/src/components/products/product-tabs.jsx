"use client"

import { motion } from "framer-motion"

const ProductTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "all", label: "ALL PRODUCTS" },
    { id: "bestsellers", label: "BESTSELLERS" },
    { id: "new", label: "NEW ARRIVALS" },
    { id: "featured", label: "FEATURED" },
  ]

  return (
    <div className="relative mb-12">
      {/* Heritage decorative top border */}
      <div className="absolute left-0 right-0 top-0 -translate-y-6 flex justify-center">
        <svg
          width="280"
          height="12"
          viewBox="0 0 280 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-70"
        >
          <path d="M140 12C140 12 120 0 70 0H0V1H70C119.5 1 140 12 140 12Z" fill="#d3ae6e" fillOpacity="0.3" />
          <path d="M140 12C140 12 160 0 210 0H280V1H210C160.5 1 140 12 140 12Z" fill="#d3ae6e" fillOpacity="0.3" />
          <circle cx="140" cy="3" r="2" fill="#d3ae6e" fillOpacity="0.4" />
          <circle cx="130" cy="2" r="1" fill="#d3ae6e" fillOpacity="0.3" />
          <circle cx="150" cy="2" r="1" fill="#d3ae6e" fillOpacity="0.3" />
        </svg>
      </div>

      {/* Main decorative border */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-[#d3ae6e]/30 z-0"></div>

      {/* Heritage corner elements */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0L16 8L8 16L0 8L8 0Z" fill="#FFFBEB" />
          <path d="M8 1L15 8L8 15L1 8L8 1Z" stroke="#d3ae6e" strokeOpacity="0.4" />
          <circle cx="8" cy="8" r="2" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.3" />
        </svg>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0L16 8L8 16L0 8L8 0Z" fill="#FFFBEB" />
          <path d="M8 1L15 8L8 15L1 8L8 1Z" stroke="#d3ae6e" strokeOpacity="0.4" />
          <circle cx="8" cy="8" r="2" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Main tabs container */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-white p-1.5 shadow-lg border border-[#d3ae6e]/30 relative z-10">
          {/* Heritage left decoration */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2">
            <svg width="20" height="40" viewBox="0 0 20 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 20C0 20 10 15 10 0M0 20C0 20 10 25 10 40" stroke="#d3ae6e" strokeOpacity="0.3" />
              <circle cx="14" cy="20" r="2" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.3" />
            </svg>
          </div>

          {/* Heritage right decoration */}
          <div className="absolute -right-6 top-1/2 -translate-y-1/2">
            <svg width="20" height="40" viewBox="0 0 20 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 20C20 20 10 15 10 0M20 20C20 20 10 25 10 40" stroke="#d3ae6e" strokeOpacity="0.3" />
              <circle cx="6" cy="20" r="2" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.3" />
            </svg>
          </div>

          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-2.5 text-sm tracking-wider transition-all duration-300 rounded-full ${
                activeTab === tab.id ? "text-[#d3ae6e] font-medium" : "text-gray-600 hover:text-[#d3ae6e]"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white rounded-full border border-[#d3ae6e]/30 shadow-inner"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 font-serif">
                {activeTab === tab.id ? (
                  <span className="relative">
                    {tab.label}
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-px bg-[#d3ae6e]"
                      layoutId="underline"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </span>
                ) : (
                  tab.label
                )}
              </span>

              {/* Decorative dot under active tab */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-1 h-1 rounded-full bg-[#d3ae6e]/60"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d3ae6e]/80"></div>
                  <div className="w-1 h-1 rounded-full bg-[#d3ae6e]/60"></div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Heritage decorative bottom flourish */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 flex justify-center">
        <svg width="160" height="20" viewBox="0 0 160 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 0V10M80 20V10M80 10H40M80 10H120" stroke="#d3ae6e" strokeOpacity="0.3" />
          <path
            d="M40 10C40 10 50 15 60 10C70 5 80 15 90 10C100 5 110 15 120 10"
            stroke="#d3ae6e"
            strokeOpacity="0.3"
            strokeDasharray="2 2"
          />
          <circle cx="80" cy="10" r="3" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.4" />
          <circle cx="40" cy="10" r="2" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.3" />
          <circle cx="120" cy="10" r="2" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Side decorative elements */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 hidden md:block">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.3" />
          <path d="M8 3V13M3 8H13" stroke="#d3ae6e" strokeOpacity="0.3" />
        </svg>
      </div>
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 hidden md:block">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" fill="#FFFBEB" stroke="#d3ae6e" strokeOpacity="0.3" />
          <path d="M8 3V13M3 8H13" stroke="#d3ae6e" strokeOpacity="0.3" />
        </svg>
      </div>
    </div>
  )
}

export default ProductTabs
