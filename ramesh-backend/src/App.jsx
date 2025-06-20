"use client"

import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { ProtectedRoute } from "./routes/ProtectedRoute"
import Login from "./pages/auth/Login"
import MainLayout from "./components/layout/MainLayout"
import { useAuth } from "./contexts/AuthContext"
import TokenExpirationHandler from "./components/TokenExpirationHandler"
import { lazy, Suspense, useEffect } from "react"

// Import providers
import { AdminProvider } from "./contexts/AdminContext"
import { CategoryProvider } from "./contexts/CategoryContext"
import { SubcategoryProvider } from "./contexts/SubcategoryContext"
import { ProductProvider } from "./contexts/ProductContext"
import { CouponProvider } from "./contexts/CouponContext"
import { UserProvider } from "./contexts/UserContext"
import { OrderProvider } from "./contexts/OrderContext"
import { FeaturedItemProvider } from "./contexts/FeaturedItemContext"

// Import custom hooks
import usePreventNumberScroll from "./hooks/usePreventNumberScroll"

// Lazy load all components
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"))
const ActivityLogs = lazy(() => import("./pages/activities/ActivityLogs"))
const ChangePassword = lazy(() => import("./pages/settings/ChangePassword"))
const AdminList = lazy(() => import("./pages/admins/AdminList"))
const AdminDetail = lazy(() => import("./pages/admins/AdminDetail"))
const AdminForm = lazy(() => import("./pages/admins/AdminForm"))
const Profile = lazy(() => import("./pages/admins/Profile"))
const CategoryList = lazy(() => import("./pages/categories/CategoryList"))
const CategoryDetail = lazy(() => import("./pages/categories/CategoryDetail"))
const CategoryForm = lazy(() => import("./pages/categories/CategoryForm"))
const SubcategoryDetail = lazy(() => import("./pages/subcategories/SubcategoryDetail"))
const SubcategoryForm = lazy(() => import("./pages/subcategories/SubcategoryForm"))
const AllSubcategories = lazy(() => import("./pages/subcategories/AllSubcategories"))
const SubcategoriesByCategory = lazy(() => import("./pages/subcategories/SubcategoriesByCategory"))
const ProductList = lazy(() => import("./pages/products/ProductList"))
const ProductDetail = lazy(() => import("./pages/products/ProductDetail"))
const ProductForm = lazy(() => import("./pages/products/ProductForm"))
const CouponList = lazy(() => import("./pages/coupons/CouponList"))
const CouponDetail = lazy(() => import("./pages/coupons/CouponDetail"))
const CouponForm = lazy(() => import("./pages/coupons/CouponForm"))
const CouponStatistics = lazy(() => import("./pages/coupons/CouponStatistics"))
const SKUSearch = lazy(() => import("./pages/products/SKUSearch"))
const HomePage = lazy(() => import("./pages/home/HomePage"))
const UserList = lazy(() => import("./pages/users/UserList"))
const UserDetail = lazy(() => import("./pages/users/UserDetail"))
const UserStatistics = lazy(() => import("./pages/users/UserStatistics"))
const OrderList = lazy(() => import("./pages/orders/OrderList"))
const OrderDetail = lazy(() => import("./pages/orders/OrderDetail"))
const OrderStatistics = lazy(() => import("./pages/orders/OrderStatistics"))

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ramesh-gold"></div>
  </div>
)

// Route configuration
const routeConfig = [
  // Dashboard
  { path: "dashboard", element: <Dashboard /> },

  // Home Page Management
  { path: "home", element: <HomePage /> },

  // Admin Management
  { path: "admins", element: <AdminList /> },
  { path: "admins/:id", element: <AdminDetail /> },
  { path: "admins/create", element: <AdminForm isEdit={false} /> },
  { path: "admins/:id/edit", element: <AdminForm isEdit={true} /> },
  { path: "profile", element: <Profile /> },

  // Category Management
  { path: "categories", element: <CategoryList /> },
  { path: "categories/:id", element: <CategoryDetail /> },
  { path: "categories/create", element: <CategoryForm isEdit={false} /> },
  { path: "categories/:id/edit", element: <CategoryForm isEdit={true} /> },

  // Subcategory Management
  { path: "subcategories", element: <AllSubcategories /> },
  { path: "subcategories/by-category", element: <SubcategoriesByCategory /> },
  { path: "subcategories/:id", element: <SubcategoryDetail /> },
  { path: "subcategories/create", element: <SubcategoryForm isEdit={false} /> },
  { path: "subcategories/:id/edit", element: <SubcategoryForm isEdit={true} /> },

  // Product Management
  { path: "products", element: <ProductList /> },
  { path: "products/sku-search", element: <SKUSearch /> },
  { path: "products/:id", element: <ProductDetail /> },
  { path: "products/create", element: <ProductForm isEdit={false} /> },
  { path: "products/:id/edit", element: <ProductForm isEdit={true} /> },

  // Coupon Management
  { path: "coupons", element: <CouponList /> },
  { path: "coupons/statistics", element: <CouponStatistics /> },
  { path: "coupons/:id", element: <CouponDetail /> },
  { path: "coupons/create", element: <CouponForm isEdit={false} /> },
  { path: "coupons/:id/edit", element: <CouponForm isEdit={true} /> },

  // User Management
  { path: "users", element: <UserList /> },
  { path: "users/statistics", element: <UserStatistics /> },
  { path: "users/:id", element: <UserDetail /> },

  // Order Management
  { path: "orders", element: <OrderList /> },
  { path: "orders/statistics", element: <OrderStatistics /> },
  { path: "orders/:id", element: <OrderDetail /> },

  // Activity Logs
  { path: "activities/all", element: <ActivityLogs /> },

  // Settings
  { path: "settings/password", element: <ChangePassword /> },
]

// Component to handle login redirects
const LoginRedirectHandler = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // If the current path starts with /login but has extra characters, redirect to clean /login
    if (location.pathname.startsWith("/login") && location.pathname !== "/login") {
      console.log("Redirecting from corrupted login URL to clean /login")
      navigate("/login", { replace: true })
    }
  }, [location.pathname, navigate])

  return <Login />
}

// Scroll to top component
const ScrollToTop = () => {
  const location = useLocation()

  useEffect(() => {
    // Scroll to top whenever the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use 'smooth' for smooth scrolling, 'instant' for immediate
    })
  }, [location.pathname])

  return null
}

function App() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Use the custom hook to prevent mouse wheel scrolling from changing number input values
  usePreventNumberScroll()

  // Refresh data when route changes - Force fresh API calls by clearing cache
  useEffect(() => {
    // Clear any cached data to force fresh API calls
    if (isAuthenticated && !loading) {
      // Clear all localStorage cache to prevent stale data
      const cacheKeys = [
        "products_cache",
        "products_cache_timestamp",
        "categories_cache",
        "categories_cache_timestamp",
        "subcategories_cache",
        "subcategories_cache_timestamp",
        "users_cache",
        "users_cache_timestamp",
        "orders_cache",
        "orders_cache_timestamp",
        "coupons_cache",
        "coupons_cache_timestamp",
        "admins_cache",
        "admins_cache_timestamp",
        "featured_items",
        "featured_cache_timestamp",
        "featured_limits",
      ]

      // Clear all cache keys to force fresh data
      cacheKeys.forEach((key) => {
        localStorage.removeItem(key)
      })

      // Also clear any other potential cache keys
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("_cache") || key.includes("_timestamp")) {
          localStorage.removeItem(key)
        }
      })
    }
  }, [location.pathname, isAuthenticated, loading])

  // Handle authentication redirects
  useEffect(() => {
    if (!loading) {
      // If user is not authenticated and not on login page, redirect to login
      if (!isAuthenticated && !location.pathname.startsWith("/login")) {
        console.log("User not authenticated, redirecting to login")
        navigate("/login", { replace: true })
      }
      // If user is authenticated and on login page, redirect to dashboard
      else if (isAuthenticated && location.pathname.startsWith("/login")) {
        console.log("User authenticated, redirecting to dashboard")
        navigate("/dashboard", { replace: true })
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate])

  // Show loading while checking authentication
  if (loading) {
    return <LoadingFallback />
  }

  return (
    <TokenExpirationHandler>
      <ScrollToTop />
      <Routes>
        {/* Login routes - handle both clean and corrupted URLs */}
        <Route path="/login" element={<LoginRedirectHandler />} />
        <Route path="/login/*" element={<LoginRedirectHandler />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminProvider>
                <CategoryProvider>
                  <SubcategoryProvider>
                    <ProductProvider>
                      <CouponProvider>
                        <UserProvider>
                          <OrderProvider>
                            <FeaturedItemProvider>
                              <MainLayout />
                            </FeaturedItemProvider>
                          </OrderProvider>
                        </UserProvider>
                      </CouponProvider>
                    </ProductProvider>
                  </SubcategoryProvider>
                </CategoryProvider>
              </AdminProvider>
            </ProtectedRoute>
          }
        >
          {/* Default route */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Map all routes from configuration */}
          {routeConfig.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>}
            />
          ))}
        </Route>

        {/* Catch all route - redirect to login if not authenticated, dashboard if authenticated */}
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </TokenExpirationHandler>
  )
}

export default App
