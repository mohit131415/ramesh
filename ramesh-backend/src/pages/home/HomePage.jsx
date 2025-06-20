"use client"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useFeaturedItems } from "../../contexts/FeaturedItemContext"
import FeaturedProductsTab from "./tabs/FeaturedProductsTab"
import FeaturedCategoriesTab from "./tabs/FeaturedCategoriesTab"
import QuickPicksTab from "./tabs/QuickPicksTab"
import SettingsTab from "./tabs/SettingsTab"
import { Package, Grid, Sparkles, Settings } from "lucide-react"

const HomePage = () => {
  const { user } = useAuth()
  const { limits, hasError, errorMessage, retryFetch } = useFeaturedItems()
  const isSuperAdmin = user?.role === "super_admin"
  const [activeTab, setActiveTab] = useState("featured_products")

  // Smooth scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeTab])

  const tabs = [
    {
      id: "featured_products",
      label: "Featured Products",
      icon: <Package className="w-4 h-4" />,
      content: limits ? (
        <FeaturedProductsTab limit={limits.featured_product} />
      ) : hasError ? (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-2">{errorMessage || "Failed to load limits"}</p>
          <button onClick={retryFetch} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
            Retry
          </button>
        </div>
      ) : (
        <div className="p-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ),
    },
    {
      id: "featured_categories",
      label: "Featured Categories",
      icon: <Grid className="w-4 h-4" />,
      content: limits ? (
        <FeaturedCategoriesTab limit={limits.featured_category} />
      ) : hasError ? (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-2">{errorMessage || "Failed to load limits"}</p>
          <button onClick={retryFetch} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
            Retry
          </button>
        </div>
      ) : (
        <div className="p-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ),
    },
    {
      id: "quick_picks",
      label: "Quick Picks",
      icon: <Sparkles className="w-4 h-4" />,
      content: limits ? (
        <QuickPicksTab limit={limits.quick_pick} />
      ) : hasError ? (
        <div className="p-4 text-center">
          <p className="text-red-500 mb-2">{errorMessage || "Failed to load limits"}</p>
          <button onClick={retryFetch} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
            Retry
          </button>
        </div>
      ) : (
        <div className="p-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ),
    },
  ]

  if (isSuperAdmin) {
    tabs.push({
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      content: <SettingsTab />,
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Featured Items</h1>
        <p className="text-muted-foreground">
          Manage featured products, categories, and quick picks that appear on the customer-facing website. These items
          will be prominently displayed to enhance customer engagement.
        </p>
      </div>

      {/* Premium Tabs */}
      <div className="relative">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 relative">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-3 flex items-center gap-2 font-medium text-sm transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                <span className={`${activeTab === tab.id ? "text-primary" : "text-gray-400"}`}>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform translate-y-0.5"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with Animation */}
        <div className="mt-6 transition-all duration-300 ease-in-out">
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  )
}

export default HomePage
