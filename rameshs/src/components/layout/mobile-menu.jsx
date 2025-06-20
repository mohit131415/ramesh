"use client"

import {
  X,
  ChevronRight,
  User,
  Phone,
  Info,
  Calendar,
  Home,
  Package,
  Grid3x3,
  Gift,
  Sparkles,
  Building2,
  Heart,
  ShoppingCart,
} from "lucide-react"
import { Link } from "react-router-dom"
import useAuthStore from "../../store/authStore"

const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, openAuthModal, user, logout } = useAuthStore()

  const handleAuthClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      onClose()
      openAuthModal()
    }
  }

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={handleOverlayClick}>
      <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-[#fff4f5] shadow-xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#78383b]/20">
          <h2 className="text-lg font-medium text-[#78383b]">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#78383b] hover:text-gold transition-colors rounded-full hover:bg-white/50"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User section */}
        <div className="p-4 border-b border-[#78383b]/20 bg-white/30">
          {isAuthenticated ? (
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gold to-pink-light flex items-center justify-center text-white font-medium text-lg shadow-md">
                  {user?.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : user?.phone_number ? (
                    user.phone_number.charAt(0)
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#78383b]">{user?.name || "Welcome"}</p>
                  <p className="text-sm text-[#78383b]/70">{user?.phone_number || user?.email || ""}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="flex items-center justify-center space-x-2 py-3 px-3 bg-white rounded-lg text-sm text-[#78383b] border border-[#78383b]/20 hover:bg-[#78383b]/5 transition-colors shadow-sm"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/orders"
                  onClick={onClose}
                  className="flex items-center justify-center space-x-2 py-3 px-3 bg-white rounded-lg text-sm text-[#78383b] border border-[#78383b]/20 hover:bg-[#78383b]/5 transition-colors shadow-sm"
                >
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#78383b]/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-[#78383b]" />
                </div>
                <div>
                  <p className="text-[#78383b] font-medium">Welcome Guest</p>
                  <p className="text-sm text-[#78383b]/70">Sign in to continue</p>
                </div>
              </div>
              <div
                onClick={handleAuthClick}
                className="flex items-center justify-between py-3 px-4 hover:bg-white/50 transition-colors active:bg-white/70 rounded-lg cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gold" />
                  <span className="text-[#78383b] font-medium">Login / Register</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="py-2">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Home className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">Home</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/products"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">All Products</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/categories"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Grid3x3 className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">Categories</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/gift-hampers"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Gift className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">Gift Hampers</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/festival-specials"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">Festival Specials</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/corporate-gifts"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">Corporate Gifts</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/wedding-gifts"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">Wedding Gifts</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/bulk-order"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">Bulk Orders</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/about"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">About Us</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>

            <Link
              to="/contact"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/50 transition-colors active:bg-white/70"
            >
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold" />
                <span className="text-[#78383b] font-medium">Contact Us</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#78383b]/50" />
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#78383b]/20">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-white/50 text-[#78383b] rounded-lg flex items-center justify-center space-x-2 hover:bg-white/70 transition-colors border border-[#78383b]/20"
            >
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <div className="text-center text-sm text-[#78383b]/70">
              <Calendar className="h-4 w-4 inline-block mr-2" />
              <span>Delivering sweetness since 1975</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
