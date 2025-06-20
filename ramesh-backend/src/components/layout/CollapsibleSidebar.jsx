"use client"

import { useState, useEffect, useRef } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext.jsx"
import { buildImageUrl } from "../../config/api.config.js"
import {
  LayoutDashboard,
  LogOut,
  User,
  Activity,
  ShoppingBag,
  X,
  Users,
  KeyRound,
  Tags,
  Layers,
  CakeSlice,
  FileText,
  Menu,
  Ticket,
  Home,
} from "lucide-react"

const CollapsibleSidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({
    products: false,
    reports: false,
    users: false,
    activities: false,
    settings: false,
    subcategories: false,
  })
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const sidebarRef = useRef(null)
  const isSuperAdmin = user?.role === "super_admin"

  // Check if the screen is mobile on initial render
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    // Check on initial load
    checkMobile()

    // Add resize listener
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-expand menu based on current route - only for super admins
  useEffect(() => {
    // Only auto-expand menus for super admins
    if (!isSuperAdmin) return

    const path = location.pathname

    if (path.includes("/products")) {
      setExpandedMenus((prev) => ({ ...prev, products: true }))
    } else if (path.includes("/activities")) {
      setExpandedMenus((prev) => ({ ...prev, activities: true }))
    } else if (path.includes("/settings")) {
      setExpandedMenus((prev) => ({ ...prev, settings: true }))
    }

    // Subcategories menu should expand for all users
    if (path.includes("/subcategories")) {
      setExpandedMenus((prev) => ({ ...prev, subcategories: true }))
    }
  }, [location.pathname, isSuperAdmin])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  // Helper function to check if a route is active
  const isRouteActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <div
      ref={sidebarRef}
      className={`relative h-screen bg-ramesh-white transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? "w-20" : "w-64"
      } z-20 shadow-md`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute right-0 top-4 transform translate-x-1/2 bg-ramesh-white rounded-full p-2 shadow-md z-30 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ramesh-gold/30 transition-all duration-300"
      >
        {collapsed ? <Menu className="h-4 w-4 text-ramesh-gold" /> : <X className="h-4 w-4 text-ramesh-gold" />}
      </button>

      {/* Logo */}
      <div className="h-20 flex items-center justify-center overflow-hidden bg-gradient-to-r from-background to-muted/30">
        {collapsed ? (
          <div className="p-2 rounded-full bg-ramesh-white shadow-md transition-all duration-300">
            <img
              src="/images/ramesh-emblem.png"
              alt="Ramesh Sweets"
              className="h-10 w-10 transition-all duration-300"
            />
          </div>
        ) : (
          <div className="flex items-center px-4 py-2">
            <img src="/images/ramesh-emblem.png" alt="Ramesh Sweets" className="h-10 w-10 mr-3" />
            <h2 className="text-xl font-bold text-ramesh-gold">Ramesh Sweets</h2>
          </div>
        )}
      </div>

      {/* Role indicator */}
      <div
        className={`px-4 py-3 ${
          collapsed ? "text-center" : ""
        } bg-gradient-to-r from-background to-muted/30 border-b border-border/30`}
      >
        <span
          className={`text-xs font-semibold uppercase tracking-wider text-ramesh-gold ${
            collapsed ? "hidden" : "block"
          }`}
        >
          {user?.role === "super_admin" ? "Super Admin" : "Admin"}
        </span>
        {collapsed && (
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-ramesh-gold text-xs font-bold shadow-sm">
            {user?.role === "super_admin" ? "S" : "A"}
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="overflow-y-auto flex-grow h-[calc(100vh-12rem)] custom-scrollbar py-3">
        <nav className="px-3">
          <ul className="space-y-2">
            {/* Dashboard - For all users */}
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <LayoutDashboard
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/dashboard") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Dashboard</span>}
              </NavLink>
            </li>

            {/* Home - Featured Items Management */}
            <li>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Home
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/home") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Featured Items</span>}
              </NavLink>
            </li>

            {/* Categories - For all users */}
            <li>
              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Tags
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/categories") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Categories</span>}
              </NavLink>
            </li>

            {/* Subcategories - Single button */}
            <li>
              <NavLink
                to="/subcategories"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Layers
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/subcategories") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Subcategories</span>}
              </NavLink>
            </li>

            {/* Products - Single button */}
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <CakeSlice
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/products") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Products</span>}
              </NavLink>
            </li>

            {/* Coupons - Single button */}
            <li>
              <NavLink
                to="/coupons"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Ticket
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/coupons") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Coupons</span>}
              </NavLink>
            </li>

            {/* Orders - For all users */}
            <li>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <ShoppingBag
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/orders") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Orders</span>}
              </NavLink>
            </li>

            {/* Customers - For all users */}
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Users
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/users") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Customers</span>}
              </NavLink>
            </li>

            {/* Activity Logs - Only for Super Admin */}
            {isSuperAdmin && (
              <li>
                <NavLink
                  to="/activities/all"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-muted/50 text-primary shadow-sm"
                        : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                >
                  <Activity
                    className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                      isRouteActive("/activities") ? "text-ramesh-gold" : "text-muted-foreground"
                    }`}
                  />
                  {!collapsed && <span>Activity Logs</span>}
                </NavLink>
              </li>
            )}

            {/* Admin List - Only for Super Admin */}
            {isSuperAdmin && (
              <li>
                <NavLink
                  to="/admins"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-muted/50 text-primary shadow-sm"
                        : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                >
                  <FileText
                    className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                      isRouteActive("/admins") ? "text-ramesh-gold" : "text-muted-foreground"
                    }`}
                  />
                  {!collapsed && <span>Admin</span>}
                </NavLink>
              </li>
            )}

            {/* My Profile - Direct link */}
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <User
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/profile") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>My Profile</span>}
              </NavLink>
            </li>

            {/* Change Password - Direct link for all users */}
            <li>
              <NavLink
                to="/settings/password"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-muted/50 text-primary shadow-sm"
                      : "text-foreground hover:bg-muted/30 hover:shadow-sm"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <KeyRound
                  className={`${collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} transition-all duration-300 ${
                    isRouteActive("/settings/password") ? "text-ramesh-gold" : "text-muted-foreground"
                  }`}
                />
                {!collapsed && <span>Change Password</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* User profile at bottom */}
      <div className="mt-auto p-4 border-t border-border/30 bg-gradient-to-r from-background to-muted/30">
        <div className={`flex ${collapsed ? "flex-col items-center" : "items-center"} space-x-3`}>
          <div
            className={`w-10 h-10 rounded-full bg-ramesh-gold flex items-center justify-center text-ramesh-white ${
              collapsed ? "mb-2" : ""
            } shadow-md ring-2 ring-ramesh-white overflow-hidden`}
          >
            {user?.profile_image ? (
              <img
                src={buildImageUrl(user.profile_image) || "/placeholder.svg"}
                alt={`${user?.first_name} ${user?.last_name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center ${user?.profile_image ? "hidden" : "flex"}`}
              style={{ display: user?.profile_image ? "none" : "flex" }}
            >
              {user?.first_name?.[0] || <User className="h-5 w-5" />}
            </div>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center justify-center text-muted-foreground hover:text-ramesh-gold transition-colors duration-300 ${
              collapsed ? "w-full mt-2" : ""
            }`}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CollapsibleSidebar
