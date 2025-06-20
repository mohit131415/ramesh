"use client"

import { Suspense, lazy, useEffect } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import RootLayout from "./components/layout/root-layout"
import LoadingSpinner from "./components/common/loading-spinner"
import AuthProvider from "./components/auth/auth-provider"
import ProtectedRoute from "./components/auth/protected-route"
import ErrorBoundary from "./components/common/error-boundary"

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
})

// Lazy load pages for better performance
// const HomePage = lazy(() => import("./pages/home-page"))
const WireframeHomePage = lazy(() => import("./pages/wireframe-home-page"))
const ProductsPage = lazy(() => import("./pages/products-page"))
const ProductDetailPage = lazy(() => import("./pages/product-detail-page"))
const CartPage = lazy(() => import("./pages/cart-page"))
const CheckoutPage = lazy(() => import("./pages/checkout-page"))
const ProfilePage = lazy(() => import("./pages/profile-page"))
const OrderDetailPage = lazy(() => import("./pages/order-detail-page"))
const AboutPage = lazy(() => import("./pages/about-page"))
const ContactPage = lazy(() => import("./pages/contact-page"))
const CorporateGiftsPage = lazy(() => import("./pages/corporate-gifts-page"))
const WeddingGiftsPage = lazy(() => import("./pages/wedding-gifts-page"))
const BulkOrderPage = lazy(() => import("./pages/bulk-order-page"))
const FestivalSpecialsPage = lazy(() => import("./pages/festival-specials-page"))
const GiftHampersPage = lazy(() => import("./pages/gift-hampers-page"))
const CategoriesPage = lazy(() => import("./pages/categories-page"))
const SubcategoryListPage = lazy(() => import("./pages/subcategory-list-page"))
const SubcategoryDetailPage = lazy(() => import("./pages/subcategory-detail-page"))
const PrivacyPolicyPage = lazy(() => import("./pages/privacy-policy-page"))
const TermsOfServicePage = lazy(() => import("./pages/terms-of-service-page"))
const ReturnPolicyPage = lazy(() => import("./pages/return-policy-page"))
const NotFoundPage = lazy(() => import("./pages/not-found-page"))
const PaymentPage = lazy(() => import("./pages/payment-page"))
const OrderSuccessPage = lazy(() => import("./pages/order-success-page"))

// Enhanced Loading Component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
)

// Enhanced ScrollToTop component to reset scroll position on page change
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Immediately scroll to top without smooth behavior for instant effect
    window.scrollTo(0, 0)

    // Also reset any scrollable containers
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // For better browser compatibility
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0
    }
  }, [pathname])

  return null
}

// Route Guard for Order Success Page
const OrderSuccessRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      <ErrorBoundary fallback={<Navigate to="/" replace />}>{children}</ErrorBoundary>
    </ProtectedRoute>
  )
}

// Route Guard for Payment Pages
const PaymentRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      <ErrorBoundary fallback={<Navigate to="/cart" replace />}>{children}</ErrorBoundary>
    </ProtectedRoute>
  )
}

const App = () => {
  // Ensure scroll to top on initial load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<RootLayout />}>
                {/* Public Routes */}
                {/* <Route path="/" element={<HomePage />} /> */}
                <Route path="/" element={<WireframeHomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/slug/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/corporate-gifts" element={<CorporateGiftsPage />} />
                <Route path="/wedding-gifts" element={<WeddingGiftsPage />} />
                <Route path="/bulk-order" element={<BulkOrderPage />} />
                <Route path="/festival-specials" element={<FestivalSpecialsPage />} />
                <Route path="/gift-hampers" element={<GiftHampersPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/:categoryId/subcategories" element={<SubcategoryListPage />} />
                <Route path="/subcategory/:subcategoryId" element={<SubcategoryDetailPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/return-policy" element={<ReturnPolicyPage />} />

                {/* Protected Routes - Require Authentication */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/orders/:orderNumber"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Payment Routes - Protected with Enhanced Error Handling */}
                <Route
                  path="/payment"
                  element={
                    <PaymentRoute>
                      <PaymentPage />
                    </PaymentRoute>
                  }
                />

                {/* Order Success Route - Token-based Access */}
                <Route
                  path="/order-success"
                  element={
                    <OrderSuccessRoute>
                      <OrderSuccessPage />
                    </OrderSuccessRoute>
                  }
                />

                {/* Profile Section Redirects */}
                <Route path="/addresses" element={<Navigate to="/profile?section=addresses" replace />} />
                <Route path="/orders" element={<Navigate to="/profile?section=orders" replace />} />

                {/* 404 Page */}
                <Route path="/404" element={<NotFoundPage />} />

                {/* Catch-all Route */}
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
