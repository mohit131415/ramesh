"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X, ArrowRight, Clock, Zap, Gift, Package, Percent, Sparkles, Star, Crown } from "lucide-react"
import { Button } from "../ui/button"

const ProfileCompletionModal = ({ isOpen, onClose, onComplete, completenessData }) => {
  const navigate = useNavigate()
  const [isClosing, setIsClosing] = useState(false)

  if (!isOpen) return null

  const handleCompleteProfile = () => {
    setIsClosing(true)
    setTimeout(() => {
      onComplete()
      navigate("/profile")
    }, 200)
  }

  const handleSkip = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  // Determine if this is a new profile or incomplete profile
  const isNewProfile = !completenessData?.exists
  const completionPercentage = completenessData?.completion_percentage || 0

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Premium Backdrop */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-black/30 via-amber-900/20 to-black/50 backdrop-blur-xl transition-all duration-500 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleSkip}
      />

      {/* Compact Premium Modal */}
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl transition-all duration-500 overflow-hidden ${
          isClosing ? "opacity-0 scale-75 rotate-3" : "opacity-100 scale-100 rotate-0"
        }`}
        style={{
          boxShadow: `
      0 20px 40px -8px rgba(218, 165, 32, 0.3),
      0 8px 16px -4px rgba(255, 218, 185, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.6)
    `,
        }}
      >
        {/* Luxury Border */}
        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-r from-amber-200/20 via-orange-200/15 to-amber-300/20"></div>

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm border border-amber-200/50"
        >
          <X className="w-3.5 h-3.5 text-amber-700" />
        </button>

        {/* Header with Crown */}
        <div className="relative px-5 pt-5 pb-3 text-center bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50">
          {/* Floating Decorations */}
          <div className="absolute top-2 left-4 w-2 h-2 bg-gradient-to-br from-amber-300 to-amber-400 rounded-full animate-pulse"></div>
          <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-1 left-6 w-1 h-1 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full animate-pulse delay-700"></div>

          {/* Premium Crown Icon */}
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-amber-300 to-orange-300 rounded-xl rotate-3 shadow-lg"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-amber-300 via-orange-200 to-amber-400 rounded-xl flex items-center justify-center shadow-inner">
              <Crown className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>

          <h2 className="text-lg font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-1">
            {isNewProfile ? "Unlock Premium" : "Complete Profile"}
          </h2>
          <p className="text-xs text-amber-700/80 font-medium">
            {isNewProfile ? "Complete setup" : `${Math.round(completionPercentage)}% Complete`}
          </p>
        </div>

        {/* Content Section */}
        <div className="px-5 pb-5 bg-white">
          {/* Progress for existing users */}
          {!isNewProfile && (
            <div className="mb-4 p-2.5 bg-gradient-to-r from-amber-50/80 to-orange-50/60 rounded-xl border border-amber-200/50">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-amber-800">Progress</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-300 rounded-full h-full transition-all duration-700 ease-out shadow-sm relative"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* Compact Benefits */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-lg border border-amber-200/40 hover:shadow-md transition-all duration-200 group">
              <div className="w-6 h-6 mb-1.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <div className="text-xs font-semibold text-amber-800">Fast Checkout</div>
            </div>

            <div className="p-2.5 bg-gradient-to-br from-orange-50/60 to-amber-50/40 rounded-lg border border-orange-200/40 hover:shadow-md transition-all duration-200 group">
              <div className="w-6 h-6 mb-1.5 bg-gradient-to-br from-orange-300 to-amber-400 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                <Gift className="w-3 h-3 text-white" />
              </div>
              <div className="text-xs font-semibold text-amber-800">Exclusive Offers</div>
            </div>

            <div className="p-2.5 bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-lg border border-amber-200/40 hover:shadow-md transition-all duration-200 group">
              <div className="w-6 h-6 mb-1.5 bg-gradient-to-br from-amber-500 to-orange-400 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                <Package className="w-3 h-3 text-white" />
              </div>
              <div className="text-xs font-semibold text-amber-800">Order Tracking</div>
            </div>

            <div className="p-2.5 bg-gradient-to-br from-orange-50/60 to-amber-50/40 rounded-lg border border-orange-200/40 hover:shadow-md transition-all duration-200 group">
              <div className="w-6 h-6 mb-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                <Percent className="w-3 h-3 text-white" />
              </div>
              <div className="text-xs font-semibold text-amber-800">VIP Discounts</div>
            </div>
          </div>

          {/* Time Badge */}
          <div className="flex items-center justify-center gap-1.5 mb-4 p-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-lg border border-blue-200/40">
            <Clock className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">30 seconds</span>
            <Star className="w-3 h-3 text-amber-500" />
          </div>

          {/* Premium Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleCompleteProfile}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-orange-300 hover:from-amber-500 hover:via-amber-400 hover:to-orange-400 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center group relative overflow-hidden border border-amber-200/30"
              style={{
                boxShadow: "0 8px 16px -4px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <Sparkles className="w-4 h-4 mr-1.5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-sm">Complete Now</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full text-amber-700 hover:text-amber-800 hover:bg-amber-50/60 font-medium py-2 rounded-xl transition-all duration-200 border border-amber-200/30 hover:border-amber-300/50 text-sm"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200/50">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCompletionModal
