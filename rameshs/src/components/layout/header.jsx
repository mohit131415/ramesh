"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingBag, Search, Menu, ChevronRight, X, AlertCircle, TrendingUp, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"
import MobileBottomNav from "./mobile-bottom-nav"
import MobileMenu from "./mobile-menu"
import Navigation from "./navigation"
import AuthButton from "../auth/auth-button"
import useAuthStore from "../../store/authStore"
import useProductStore from "../../store/productStore"
import useCartStore from "../../store/cartStore"

export default function Header({ className }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const { validateToken, isAuthenticated, openAuthModal } = useAuthStore()
  const searchInputRef = useRef(null)
  const searchTimeout = useRef(null)
  const dropdownRef = useRef(null)
  const searchContainerRef = useRef(null)
  const navigate = useNavigate()

  // Import product store functions
  const { setSearchQuery, setSelectedCategory, setSelectedSubcategories } = useProductStore()

  // Get cart data directly from store
  const { items, summary, totals } = useCartStore()
  const totalItems = summary?.total_items || summary?.item_count || totals?.item_count || items?.length || 0

  // Popular searches - removed Samosa
  const popularSearches = ["Gulab Jamun", "Rasgulla", "Kaju Katli", "Laddu", "Barfi"]

  // Validate token on component mount
  useEffect(() => {
    validateToken()
  }, [validateToken])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle click outside to close search and dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the dropdown
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return
      }

      // Close dropdown if clicking outside dropdown and search input
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false)
      }

      // Close search if clicking outside search container
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false)
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 100)
      }

      // Escape to close search
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false)
        setShowDropdown(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [searchOpen])

  // Search functionality
  const performUnifiedSearch = async (query) => {
    if (!query || query.trim() === "" || /^\d+$/.test(query)) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    try {
      setIsSearching(true)
      setSearchError(null)

      const encodedQuery = encodeURIComponent(query.trim())
      const response = await fetch(`/api/api/public/search?q=${encodedQuery}`)

      const data = await response.json()

      if (data.status === "success") {
        const results = Array.isArray(data.data) ? data.data : []
        setSearchResults(results)
        setShowDropdown(true)
      } else {
        setSearchError(data.message || "Search failed")
        setSearchResults([])
        setShowDropdown(true)
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchError("Failed to perform search")
      setSearchResults([])
      setShowDropdown(true)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInput = (e) => {
    const value = e.target.value

    if (/\d/.test(value) && !searchTerm.includes(value)) {
      return
    }

    setSearchTerm(value)

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(true) // Show popular searches when empty
      return
    }

    searchTimeout.current = setTimeout(() => {
      performUnifiedSearch(value)
    }, 300)
  }

  const handleSearchSelection = (item) => {
    console.log("=== SEARCH SELECTION DEBUG ===")
    console.log("Item clicked:", item)
    console.log("Item type:", item?.type)
    console.log("Item slug:", item?.slug)
    console.log("Item id:", item?.id)

    // Close dropdown and search immediately
    setShowDropdown(false)
    setSearchOpen(false)
    setSearchTerm("")

    if (!item) {
      console.error("No item provided to handleSearchSelection")
      return
    }

    // Use setTimeout to ensure state updates don't interfere with navigation
    setTimeout(() => {
      switch (item.type) {
        case "product":
          console.log("Navigating to product...")
          if (item.slug) {
            console.log("Using slug navigation:", `/product/slug/${item.slug}`)
            navigate(`/product/slug/${item.slug}`)
          } else if (item.id) {
            console.log("Using ID navigation:", `/product/${item.id}`)
            navigate(`/product/${item.id}`)
          } else {
            console.error("Product has no slug or ID")
          }
          break
        case "category":
          console.log("Navigating to category products...")
          setSelectedCategory(Number(item.id))
          setSelectedSubcategories([])
          setSearchQuery("")
          navigate("/products")
          break
        case "subcategory":
          console.log("Navigating to subcategory products...")
          setSelectedSubcategories([Number(item.id)])
          if (item.category_id) {
            setSelectedCategory(Number(item.category_id))
          }
          setSearchQuery("")
          navigate("/products")
          break
        default:
          console.log("Default search navigation...")
          setSearchQuery(item.name || searchTerm)
          navigate(`/products?q=${encodeURIComponent(item.name || searchTerm)}`)
      }
    }, 100)
  }

  const handlePopularSearch = (term) => {
    // Update search term and trigger search instead of direct redirect
    setSearchTerm(term)
    performUnifiedSearch(term)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()

    if (!searchTerm.trim() || /^\d+$/.test(searchTerm)) {
      return
    }

    setSearchQuery(searchTerm)
    navigate(`/products?q=${encodeURIComponent(searchTerm)}`)
    setSearchOpen(false)
    setShowDropdown(false)
  }

  const getImageUrl = (item) => {
    if (!item || !item.image) return "/placeholder.svg"

    if (typeof item.image === "object" && item.image.image_path) {
      return `/api/public/${item.image.image_path}`
    }

    if (typeof item.image === "string") {
      if (item.image.startsWith("http")) return item.image
      return `/api/public/${item.image}`
    }

    return "/placeholder.svg"
  }

  const highlightMatchingText = (text, query) => {
    if (!query || query.trim().length === 0) return text

    try {
      const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`(${escapedQuery})`, "gi")
      return text.replace(regex, '<span class="bg-yellow-200 px-1 rounded">$1</span>')
    } catch (e) {
      console.error("Highlight error:", e)
      return text
    }
  }

  // Show dropdown when search opens
  useEffect(() => {
    if (searchOpen) {
      setShowDropdown(true)
    }
  }, [searchOpen])

  return (
    <>
      {/* Premium Compact Header with White Background */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-xl bg-white",
          isScrolled ? "shadow-2xl shadow-black/15 drop-shadow-2xl" : "shadow-xl shadow-black/10 drop-shadow-xl",
          className,
        )}
      >
        {/* Elegant Top Border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d0b271]/40 to-transparent"></div>

        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between h-16 px-0 sm:px-4">
            {/* Logo - Always visible */}
            <Link to="/" className="flex items-center group">
              <img
                src="/images/ramesh-logo.svg"
                alt="Ramesh Sweets Logo"
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Center Content - Navigation or Search */}
            <div className="flex-1 flex justify-center mx-8">
              {searchOpen ? (
                <div ref={searchContainerRef} className="w-full max-w-2xl relative">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative flex items-center">
                      <div className="absolute left-5 z-10">
                        <Search className="h-5 w-5 text-[#d0b271]" />
                      </div>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchInput}
                        placeholder="Search premium sweets & gifts..."
                        className="w-full pl-14 pr-14 py-3.5 text-base border-2 border-[#d0b271]/20 focus:border-[#d0b271] rounded-2xl focus:outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl ring-0 focus:ring-4 focus:ring-[#d0b271]/10 text-gray-800 placeholder-gray-600"
                        autoFocus
                      />
                      <div className="absolute right-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchOpen(false)
                            setShowDropdown(false)
                            setSearchTerm("")
                          }}
                          className="p-2 bg-[#d0b271]/10 hover:bg-[#d0b271]/20 text-[#d0b271] rounded-xl transition-all duration-200 hover:scale-105"
                          aria-label="Close search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Premium Search Dropdown - Now inside search container */}
                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 backdrop-blur-xl border border-[#d0b271]/20 rounded-3xl shadow-2xl z-30 max-h-[75vh] overflow-hidden mt-2"
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #fefefe 50%, #fdfdfd 100%)",
                      }}
                    >
                      {/* Subtle Pattern Overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(208,178,113,0.03),transparent_50%)] rounded-3xl"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,207,232,0.03),transparent_50%)] rounded-3xl"></div>

                      <div className="relative z-10 overflow-y-auto max-h-[75vh] custom-scrollbar">
                        <div className="p-3">
                          {isSearching ? (
                            <div className="flex items-center justify-center p-8">
                              <div className="relative">
                                <div className="w-8 h-8 border-3 border-[#d0b271]/30 border-t-[#d0b271] rounded-full animate-spin"></div>
                                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-[#d0b271] animate-pulse" />
                              </div>
                              <span className="text-gray-600 text-base ml-3 font-medium">Searching...</span>
                            </div>
                          ) : searchError ? (
                            <div className="p-8 text-center">
                              <div className="mb-3">
                                <AlertCircle className="h-10 w-10 mx-auto text-red-400" />
                              </div>
                              <p className="text-base text-red-500 font-medium">{searchError}</p>
                            </div>
                          ) : !searchTerm.trim() ? (
                            // Popular Searches
                            <div>
                              <div className="flex items-center mb-3">
                                <div className="p-1.5 bg-gradient-to-r from-[#d0b271]/20 to-[#d0b271]/30 rounded-lg mr-2 shadow-sm">
                                  <TrendingUp className="h-4 w-4 text-[#d0b271]" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Popular Searches</h3>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {popularSearches.map((term, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handlePopularSearch(term)}
                                    className="group px-3 py-2 bg-white/60 hover:bg-gradient-to-r hover:from-[#d0b271] hover:to-[#d0b271]/90 text-[#8B6D2C] hover:text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-lg border border-[#d0b271]/20 hover:border-[#d0b271] hover:scale-105 text-left backdrop-blur-sm"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{term}</span>
                                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : !Array.isArray(searchResults) || searchResults.length === 0 ? (
                            <div className="p-8 text-center">
                              <div className="mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-[#d0b271]/20 to-[#d0b271]/30 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                                  <Search className="h-6 w-6 text-[#d0b271]" />
                                </div>
                              </div>
                              <p className="text-gray-500 text-lg mb-4 font-medium">
                                No results found for "{searchTerm}"
                              </p>
                              <div>
                                <p className="text-sm text-gray-400 mb-3">Try searching for:</p>
                                <div className="flex flex-wrap gap-1.5 justify-center">
                                  {popularSearches.slice(0, 3).map((term, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handlePopularSearch(term)}
                                      className="px-3 py-1.5 bg-white/60 hover:bg-[#d0b271] text-[#8B6D2C] hover:text-white rounded-full text-sm transition-all duration-300 hover:scale-105 shadow-sm backdrop-blur-sm"
                                    >
                                      {term}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {(() => {
                                const productResults = searchResults.filter(
                                  (result) => result && result.type === "product",
                                )
                                const categoryResults = searchResults.filter(
                                  (result) => result && result.type === "category",
                                )
                                const subcategoryResults = searchResults.filter(
                                  (result) => result && result.type === "subcategory",
                                )

                                return (
                                  <>
                                    {/* PRODUCTS FIRST - HIGHEST PRIORITY */}
                                    {productResults.length > 0 && (
                                      <div>
                                        <h3 className="text-xs uppercase text-gray-500 font-bold mb-2 flex items-center">
                                          <div className="w-2 h-2 bg-gradient-to-r from-[#d0b271]/60 to-[#d0b271]/40 rounded-full mr-2 shadow-sm"></div>
                                          Products ({productResults.length})
                                        </h3>
                                        <div className="space-y-1">
                                          {productResults.map((result) => (
                                            <button
                                              key={`prod-${result.id || Math.random()}`}
                                              onClick={() => {
                                                console.log("Direct product click:", result)
                                                handleSearchSelection(result)
                                              }}
                                              className="flex items-center w-full hover:bg-white/70 p-2 rounded-lg transition-all duration-300 group border border-transparent hover:border-[#d0b271]/30 cursor-pointer text-left hover:shadow-md bg-white/40 backdrop-blur-sm"
                                            >
                                              <img
                                                src={getImageUrl(result) || "/placeholder.svg"}
                                                alt={result.name}
                                                className="w-8 h-8 object-cover rounded-lg mr-2 shadow-sm group-hover:shadow-md transition-shadow duration-300"
                                                onError={(e) => {
                                                  e.target.onerror = null
                                                  e.target.src = "/diverse-products-still-life.png"
                                                }}
                                              />
                                              <div className="flex-1 text-left min-w-0">
                                                <span
                                                  className="text-gray-800 text-sm font-semibold group-hover:text-[#d0b271] transition-colors block truncate"
                                                  dangerouslySetInnerHTML={{
                                                    __html: highlightMatchingText(result.name, searchTerm),
                                                  }}
                                                />
                                                {result.category && (
                                                  <span
                                                    className="text-xs text-gray-500 font-medium truncate block"
                                                    dangerouslySetInnerHTML={{
                                                      __html: highlightMatchingText(result.category.name, searchTerm),
                                                    }}
                                                  />
                                                )}
                                              </div>
                                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#d0b271] transition-colors flex-shrink-0" />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* CATEGORIES SECOND */}
                                    {categoryResults.length > 0 && (
                                      <div className={productResults.length > 0 ? "pt-2" : ""}>
                                        <h3 className="text-xs uppercase text-gray-500 font-bold mb-2 flex items-center">
                                          <div className="w-2 h-2 bg-gradient-to-r from-[#d0b271] to-[#d0b271]/70 rounded-full mr-2 shadow-sm"></div>
                                          Categories ({categoryResults.length})
                                        </h3>
                                        <div className="space-y-1">
                                          {categoryResults.map((result) => (
                                            <button
                                              key={`cat-${result.id || Math.random()}`}
                                              onClick={() => handleSearchSelection(result)}
                                              className="flex items-center w-full hover:bg-white/70 p-2 rounded-lg transition-all duration-300 group border border-transparent hover:border-[#d0b271]/30 cursor-pointer text-left hover:shadow-md bg-white/40 backdrop-blur-sm"
                                            >
                                              {result.image ? (
                                                <img
                                                  src={getImageUrl(result) || "/placeholder.svg"}
                                                  alt={result.name}
                                                  className="w-8 h-8 object-cover rounded-lg mr-2 shadow-sm group-hover:shadow-md transition-shadow duration-300"
                                                  onError={(e) => {
                                                    e.target.onerror = null
                                                    e.target.src = "/abstract-categories.png"
                                                  }}
                                                />
                                              ) : (
                                                <div className="w-8 h-8 bg-gradient-to-br from-[#d0b271]/30 to-[#d0b271]/20 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                                                  <span className="text-[#d0b271] text-xs font-bold">C</span>
                                                </div>
                                              )}
                                              <div className="flex-1 text-left min-w-0">
                                                <span
                                                  className="text-gray-800 text-sm font-semibold group-hover:text-[#d0b271] transition-colors block truncate"
                                                  dangerouslySetInnerHTML={{
                                                    __html: highlightMatchingText(result.name, searchTerm),
                                                  }}
                                                />
                                                <p className="text-xs text-gray-500 font-medium">Category</p>
                                              </div>
                                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#d0b271] transition-colors flex-shrink-0" />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* SUBCATEGORIES THIRD */}
                                    {subcategoryResults.length > 0 && (
                                      <div
                                        className={
                                          productResults.length > 0 || categoryResults.length > 0 ? "pt-2" : ""
                                        }
                                      >
                                        <h3 className="text-xs uppercase text-gray-500 font-bold mb-2 flex items-center">
                                          <div className="w-2 h-2 bg-gradient-to-r from-[#d0b271]/80 to-[#d0b271]/60 rounded-full mr-2 shadow-sm"></div>
                                          Subcategories ({subcategoryResults.length})
                                        </h3>
                                        <div className="space-y-1">
                                          {subcategoryResults.map((result) => (
                                            <button
                                              key={`subcat-${result.id || Math.random()}`}
                                              onClick={() => handleSearchSelection(result)}
                                              className="flex items-center w-full hover:bg-white/70 p-2 rounded-lg transition-all duration-300 group border border-transparent hover:border-[#d0b271]/30 cursor-pointer text-left hover:shadow-md bg-white/40 backdrop-blur-sm"
                                            >
                                              {result.image ? (
                                                <img
                                                  src={getImageUrl(result) || "/placeholder.svg"}
                                                  alt={result.name}
                                                  className="w-8 h-8 object-cover rounded-lg mr-2 shadow-sm group-hover:shadow-md transition-shadow duration-300"
                                                  onError={(e) => {
                                                    e.target.onerror = null
                                                    e.target.src = "/abstract-subcategory.png"
                                                  }}
                                                />
                                              ) : (
                                                <div className="w-8 h-8 bg-gradient-to-br from-[#d0b271]/30 to-[#d0b271]/20 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                                                  <span className="text-[#d0b271] text-xs font-bold">S</span>
                                                </div>
                                              )}
                                              <div className="flex-1 text-left min-w-0">
                                                <span
                                                  className="text-sm font-semibold group-hover:text-[#d0b271] transition-colors block truncate"
                                                  dangerouslySetInnerHTML={{
                                                    __html: highlightMatchingText(result.name, searchTerm),
                                                  }}
                                                />
                                                <p className="text-xs text-gray-500 font-medium">Subcategory</p>
                                              </div>
                                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#d0b271] transition-colors flex-shrink-0" />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {searchTerm.trim() && (
                                      <div className="pt-3 border-t border-[#d0b271]/20 text-center">
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleSearchSubmit(e)
                                          }}
                                          className="text-[#d0b271] hover:text-[#d0b271]/80 text-sm font-medium underline underline-offset-2 hover:underline-offset-4 transition-all duration-300 hover:scale-105"
                                        >
                                          See all results for "{searchTerm}"
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Navigation />
              )}
            </div>

            {/* Right Actions - Always visible */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Search Button */}
              <div className="flex items-center justify-center w-6 h-6">
                <Search
                  className="h-6 w-6 text-gray-700 hover:text-[#d0b271] transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    setSearchOpen(true)
                    setSearchTerm("")
                    setSearchResults([])
                    setShowDropdown(false)
                  }}
                />
              </div>

              {/* Cart */}
              <div className="flex items-center justify-center w-5 h-5">
                <Link to="/cart" className="relative" aria-label="Cart">
                  <ShoppingBag className="h-5 w-5 text-gray-700 hover:text-[#d0b271] transition-all duration-300" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] bg-[#dba5a8] text-white text-xs font-bold rounded-full px-1 border-2 border-white transform translate-x-1/2 -translate-y-1/2">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </Link>
              </div>

              {/* Auth */}
              <div>
                {isAuthenticated ? (
                  <AuthButton />
                ) : (
                  <button
                    onClick={() => openAuthModal()}
                    className="text-gray-800 hover:text-[#d0b271] transition-colors duration-200 font-cinzel font-medium text-base"
                    aria-label="Login or Register"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle - Always visible */}
            <button
              className="p-1 sm:p-2.5 text-gray-700 hover:text-[#d0b271] transition-all duration-300 rounded-xl hover:bg-white/30 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Enhanced Gold Line Effect at Bottom with Strong Shadow */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d0b271]/80 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#d0b271]/40 to-transparent blur-sm"></div>
        <div className="absolute inset-x-0 -bottom-2 h-4 bg-gradient-to-b from-black/10 to-transparent blur-md"></div>
        <div className="absolute inset-x-0 -bottom-1 h-2 bg-gradient-to-b from-black/5 to-transparent"></div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 241, 241, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d0b271;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b8a05f;
        }
        
        /* Enhanced highlight effect */
        .highlight-glow {
          animation: highlight-pulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(208, 178, 113, 0.4);
        }
        
        @keyframes highlight-pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(208, 178, 113, 0.4);
          }
          50% {
            box-shadow: 0 0 12px rgba(208, 178, 113, 0.6);
          }
        }
        
        /* Ensure mark elements display properly */
        mark {
          display: inline;
          line-height: 1.2;
        }
      `}
      </style>
    </>
  )
}
