"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, ShoppingBag, Package, Grid3x3 } from "lucide-react"
import { Badge } from "../ui/badge"
import CartDrawer from "../cart/cart-drawer"
import useCartStore from "../../store/cartStore"

export default function MobileBottomNav() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const location = useLocation()
  const { items } = useCartStore()

  const handleCartClick = (e) => {
    e.preventDefault()
    setIsCartOpen(true)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-[#fff4f5] border-t border-gold/10 lg:hidden">
        <div className="grid h-full grid-cols-4">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center ${
              location.pathname === "/" ? "text-gold" : "text-muted-foreground"
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] mt-1">Home</span>
          </Link>

          <Link
            to="/products"
            className={`flex flex-col items-center justify-center ${
              location.pathname === "/products" ? "text-gold" : "text-muted-foreground"
            }`}
          >
            <Package size={20} />
            <span className="text-[10px] mt-1">Products</span>
          </Link>

          <Link
            to="/categories"
            className={`flex flex-col items-center justify-center ${
              location.pathname === "/categories" ? "text-gold" : "text-muted-foreground"
            }`}
          >
            <Grid3x3 size={20} />
            <span className="text-[10px] mt-1">Categories</span>
          </Link>

          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center relative ${
              location.pathname === "/cart" ? "text-gold" : "text-muted-foreground"
            }`}
            onClick={handleCartClick}
          >
            <ShoppingBag size={20} />
            {items.length > 0 && (
              <Badge
                variant="primary"
                className="absolute top-1 ml-6 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center bg-gradient-to-r from-gold via-pink to-gold-dark text-white border border-pink-light/30"
              >
                {items.length}
              </Badge>
            )}
            <span className="text-[10px] mt-1">Cart</span>
          </Link>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
