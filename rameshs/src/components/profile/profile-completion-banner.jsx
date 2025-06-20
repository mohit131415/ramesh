"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, User, Mail, Calendar, Users, X, Camera, Star, TrendingUp } from "lucide-react"
import { useProfileCompleteness } from "../../hooks/useProfile"

const ProfileCompletionBanner = ({ onEditProfile }) => {
  const { data: completeness, isLoading } = useProfileCompleteness()
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false)

  const getFieldIcon = (field) => {
    switch (field) {
      case "first_name":
      case "last_name":
        return <User className="h-3.5 w-3.5" />
      case "email":
        return <Mail className="h-3.5 w-3.5" />
      case "date_of_birth":
        return <Calendar className="h-3.5 w-3.5" />
      case "gender":
        return <Users className="h-3.5 w-3.5" />
      case "profile_picture":
        return <Camera className="h-3.5 w-3.5" />
      default:
        return <AlertCircle className="h-3.5 w-3.5" />
    }
  }

  const getFieldLabel = (field) => {
    switch (field) {
      case "first_name":
        return "First Name"
      case "last_name":
        return "Last Name"
      case "email":
        return "Email Address"
      case "date_of_birth":
        return "Date of Birth"
      case "gender":
        return "Gender"
      case "profile_picture":
        return "Profile Picture"
      default:
        return field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  useEffect(() => {
    if (isLoading || !completeness) return

    const { completion_percentage } = completeness

    if (completion_percentage === 100) {
      const hasShownCompletion = localStorage.getItem("ramesh-sweets-profile-completion-shown")

      if (!hasShownCompletion) {
        setShowCompletionCelebration(true)
        localStorage.setItem("ramesh-sweets-profile-completion-shown", "true")

        // Auto-hide the celebration after 5 seconds
        const timer = setTimeout(() => {
          setShowCompletionCelebration(false)
        }, 5000)

        return () => clearTimeout(timer)
      }
    }
  }, [isLoading, completeness])

  if (isLoading || !completeness) return null

  // Don't show banner if only profile picture is missing
  if (
    completeness &&
    completeness.missing_fields.length === 1 &&
    completeness.missing_fields[0] === "profile_picture"
  ) {
    return null
  }

  const { completion_percentage, missing_fields } = completeness

  if (completion_percentage === 100) {
    if (!showCompletionCelebration) {
      return null // Don't show anything if already celebrated
    }

    return (
      <div className="relative bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-emerald-200/60 rounded-xl p-4 mb-4 shadow-lg shadow-emerald-100/50 animate-in slide-in-from-top duration-500">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 rounded-t-xl"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-emerald-700 font-semibold text-sm">Profile Complete!</h3>
                <div className="flex space-x-1">
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                </div>
              </div>
              <p className="text-emerald-600 text-xs">
                Your profile is 100% complete. Enjoy personalized recommendations!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCompletionCelebration(false)}
            className="text-emerald-500 hover:text-emerald-600 transition-colors p-1 rounded-full hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/60 rounded-xl p-4 mb-4 shadow-lg shadow-amber-100/50">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d3ae6e] via-[#e4c078] to-[#d3ae6e] rounded-t-xl"></div>

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] rounded-full flex items-center justify-center shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-[#8b6914] font-semibold text-sm">Complete Your Profile</h3>
                <span className="text-[#8b6914] text-xs font-medium bg-[#d3ae6e]/20 px-2 py-0.5 rounded-full">
                  {completion_percentage.toFixed(0)}% Complete
                </span>
              </div>
              <p className="text-[#8b6914]/80 text-xs">Unlock personalized recommendations and exclusive offers</p>
            </div>
          </div>

          {/* Compact Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-[#d3ae6e]/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] h-1.5 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${completion_percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Compact Missing Fields */}
          {missing_fields.length > 0 && (
            <div className="mb-3">
              <p className="text-[#8b6914]/70 text-xs font-medium mb-1.5">Missing information:</p>
              <div className="flex flex-wrap gap-1.5">
                {missing_fields.slice(0, 4).map((field) => (
                  <div
                    key={field}
                    className="flex items-center bg-white/80 border border-[#d3ae6e]/30 rounded-md px-2 py-1 text-xs text-[#8b6914] shadow-sm"
                  >
                    {getFieldIcon(field)}
                    <span className="ml-1 truncate max-w-20">{getFieldLabel(field)}</span>
                  </div>
                ))}
                {missing_fields.length > 4 && (
                  <div className="flex items-center bg-[#d3ae6e]/10 border border-[#d3ae6e]/30 rounded-md px-2 py-1 text-xs text-[#8b6914]">
                    <span>+{missing_fields.length - 4} more</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onEditProfile}
          className="ml-3 flex-shrink-0 bg-gradient-to-r from-[#d3ae6e] to-[#c3a05e] hover:from-[#c3a05e] hover:to-[#b8955e] text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-xs"
        >
          Complete Now
        </button>
      </div>
    </div>
  )
}

export default ProfileCompletionBanner
  