"use client"

import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, User, MapPin, Package, ChevronRight } from "lucide-react"
import { useProfile, useProfileCompleteness } from "../hooks/useProfile"
import useAuthStore from "../store/authStore"
import ProfileCompletionBanner from "../components/profile/profile-completion-banner"
import ProfileInfoSection from "../components/profile/profile-info-section"
import AddressSection from "../components/profile/address-section"
import OrderHistorySection from "../components/profile/order-history-section"
import LoadingSpinner from "../components/common/loading-spinner"

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: completeness, isLoading: completenessLoading } = useProfileCompleteness()

  // Set active tab based on URL parameter
  useEffect(() => {
    const section = searchParams.get("section")
    if (section) {
      if (section === "address" || section === "addresses") {
        setActiveTab("addresses")
      } else if (section === "orders") {
        setActiveTab("orders")
      } else if (section === "profile") {
        setActiveTab("profile")
      }
    }
  }, [searchParams])

  const tabs = [
    {
      id: "profile",
      label: "Profile Info",
      icon: User,
      description: "Manage your personal information",
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
      description: "Manage delivery addresses",
    },
    {
      id: "orders",
      label: "Order History",
      icon: Package,
      description: "View your past orders",
    },
  ]

  const handleEditProfile = () => {
    setActiveTab("profile")
  }

  const getTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileInfoSection />
      case "addresses":
        return <AddressSection />
      case "orders":
        return <OrderHistorySection />
      default:
        return <ProfileInfoSection />
    }
  }

  const isLoading = profileLoading || completenessLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <Link to="/" className="hover:text-gray-700 transition-colors">
                    Home
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">My Account</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                Welcome, {profile?.first_name || user?.phone || "User"}!
              </p>
              <p className="text-sm text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Profile Completion Banner */}
        {!isLoading && <ProfileCompletionBanner onEditProfile={handleEditProfile} />}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Account Menu</h2>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-[#d3ae6e]/10 to-[#c3a05e]/10 text-[#d3ae6e] border-l-4 border-[#d3ae6e]"
                          : "text-gray-700 hover:bg-gray-50 hover:text-[#d3ae6e]"
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{tab.description}</div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${activeTab === tab.id ? "rotate-90" : ""}`}
                      />
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Profile Completion</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completeness?.completion_percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(completeness?.completion_percentage || 0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Saved Addresses</span>
                  <span className="font-semibold text-gray-900">-</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <LoadingSpinner />
              </div>
            ) : (
              getTabContent()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
