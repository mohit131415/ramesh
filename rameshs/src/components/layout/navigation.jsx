"use client"

import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="hidden lg:block">
      <ul className="flex items-center gap-8">
        <li>
          <Link
            to="/"
            className={cn(
              "text-sm font-cinzel font-medium transition-colors duration-200",
              location.pathname === "/" ? "text-[#d0b271] font-semibold" : "text-slate-700 hover:text-[#d0b271]",
            )}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/products"
            className={cn(
              "text-sm font-cinzel font-medium transition-colors duration-200",
              location.pathname === "/products"
                ? "text-[#d0b271] font-semibold"
                : "text-slate-700 hover:text-[#d0b271]",
            )}
          >
            Sweets Library
          </Link>
        </li>
        <li>
          <Link
            to="/categories"
            className={cn(
              "text-sm font-cinzel font-medium transition-colors duration-200",
              location.pathname === "/categories"
                ? "text-[#d0b271] font-semibold"
                : "text-slate-700 hover:text-[#d0b271]",
            )}
          >
            Categories
          </Link>
        </li>
        <li>
          <Link
            to="/corporate-gifts"
            className={cn(
              "text-sm font-cinzel font-medium transition-colors duration-200",
              location.pathname === "/corporate-gifts"
                ? "text-[#d0b271] font-semibold"
                : "text-slate-700 hover:text-[#d0b271]",
            )}
          >
            Corporate Gifts
          </Link>
        </li>
        <li>
          <Link
            to="/wedding-gifts"
            className={cn(
              "text-sm font-cinzel font-medium transition-colors duration-200",
              location.pathname === "/wedding-gifts"
                ? "text-[#d0b271] font-semibold"
                : "text-slate-700 hover:text-[#d0b271]",
            )}
          >
            Wedding Gifts
          </Link>
        </li>
        <li>
          <Link
            to="/bulk-order"
            className={cn(
              "text-sm font-cinzel font-medium transition-colors duration-200",
              location.pathname === "/bulk-order"
                ? "text-[#d0b271] font-semibold"
                : "text-slate-700 hover:text-[#d0b271]",
            )}
          >
            Bulk Order
          </Link>
        </li>
        <li>
          <Link
            to="/contact"
            className={cn(
              "text-sm font-cinzel font-medium transition-colors duration-200",
              location.pathname === "/contact" ? "text-[#d0b271] font-semibold" : "text-slate-700 hover:text-[#d0b271]",
            )}
          >
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  )
}
  