"use client"

import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import Header from "./header"
import Footer from "./footer"
import ScrollToTop from "../common/scroll-to-top"
import CartDrawer from "../cart/cart-drawer"
import AnnouncementBar from "./announcement-bar"
import useCartStore from "../../store/cartStore"
import { Toaster } from "../ui/toast"
import AuthSyncHandler from "../auth/auth-sync-handler"
import ProfileCompletionChecker from "../auth/profile-completion-checker"
import WhatsAppButton from "../common/whatsapp-button"
import FloatingVideoPlayer from "../common/floating-video-player"

const RootLayout = () => {
  const { isCartOpen, setCartOpen, fetchCart } = useCartStore()

  // Initialize cart on first load
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Close cart when pressing escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        setCartOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isCartOpen, setCartOpen])

  return (
    <div className="flex flex-col min-h-screen">
      <AuthSyncHandler />
      {/* Temporary toast test button - remove after testing */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="fixed top-20 left-4 z-[10000]">
          <button
            onClick={() => {
              console.log("Test button clicked")
              if (window.showToast) {
                console.log("Calling window.showToast from test button")
                window.showToast({
                  title: "Test Toast",
                  description: "This is a test toast to verify the system is working",
                  type: "success",
                  duration: 3000,
                })
              } else {
                console.error("window.showToast not available")
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
          >
            Test Toast
          </button>
        </div>
      )} */}
      <ProfileCompletionChecker />
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      {/*<FloatingVideoPlayer />*/}
      <WhatsAppButton />
      <CartDrawer />
      <Toaster />
    </div>
  )
}

export default RootLayout
