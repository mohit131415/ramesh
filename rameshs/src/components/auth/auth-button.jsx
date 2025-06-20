"use client"

import { User, LogOut, UserCircle, ShoppingBag, MapPin } from "lucide-react"
import useAuthStore from "../../store/authStore"
import { useState } from "react"

const AuthButton = () => {
  const { user, logout, openAuthModal } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isAuthenticated = !!user // Determine authentication status based on user presence

  const handleAuth = () => {
    if (!isAuthenticated) {
      openAuthModal()
    }
  }

  const handleLogout = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) {
    return null // We're handling this in the header now
  }

  return (
    <div className="relative group">
      {isAuthenticated ? (
        <div className="p-1 text-black-rich hover:text-gold transition-colors relative group">
          <button className="flex items-center space-x-1" aria-label="Account">
            <UserCircle className="h-6 w-6" />
          </button>

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gold/20 focus:outline-none z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/30 via-pink/30 to-gold/30"></div>

            <div className="py-2 px-3 border-b border-gold/10">
              <p className="text-sm font-medium text-amber-900">{user?.name || user?.phone_number || "My Account"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || user?.phone_number || ""}</p>
            </div>

            <div className="py-1">
              <a href="/profile" className="flex items-center px-4 py-2 text-sm text-amber-900 hover:bg-amber-50">
                <UserCircle className="h-4 w-4 mr-2 text-gold" />
                <span>My Profile</span>
              </a>
              <a href="/orders" className="flex items-center px-4 py-2 text-sm text-amber-900 hover:bg-amber-50">
                <ShoppingBag className="h-4 w-4 mr-2 text-gold" />
                <span>My Orders</span>
              </a>
              <a href="/addresses" className="flex items-center px-4 py-2 text-sm text-amber-900 hover:bg-amber-50">
                <MapPin className="h-4 w-4 mr-2 text-gold" />
                <span>My Addresses</span>
              </a>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-amber-900 hover:bg-amber-50"
              >
                <LogOut className="h-4 w-4 mr-2 text-gold" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          </div>

          {/* Animated underline effect */}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold via-pink to-gold group-hover:w-full transition-all duration-300"></span>
        </div>
      ) : (
        <button
          onClick={handleAuth}
          className="p-1 text-black-rich hover:text-gold transition-colors relative group"
          aria-label="Login / Register"
        >
          <User className="h-6 w-6" />
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold via-pink to-gold group-hover:w-full transition-all duration-300"></span>
        </button>
      )}
    </div>
  )
}

export default AuthButton
