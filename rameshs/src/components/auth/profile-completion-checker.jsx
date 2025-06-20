"use client"

import { useEffect, useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import { useProfileCompleteness } from "../../hooks/useProfile"
import useAuthStore from "../../store/authStore"
import useProfileStore from "../../store/profileStore"
import ProfileCompletionModal from "./profile-completion-modal"

const ProfileCompletionChecker = () => {
  const location = useLocation()
  const { isAuthenticated, token, user } = useAuthStore()
  const { hasShownCompletionModal, hasSkippedCompletion, setHasShownCompletionModal, setHasSkippedCompletion } =
    useProfileStore()

  const [showModal, setShowModal] = useState(false)
  const hasInitialized = useRef(false)
  const hasProcessed = useRef(false)

  // Only check completeness - this is the primary call
  const { data: completenessData, isLoading, error } = useProfileCompleteness()

  // Initialize flags only once on mount
  useEffect(() => {
    if (!hasInitialized.current && isAuthenticated && token) {
      setHasShownCompletionModal(false)
      setHasSkippedCompletion(false)
      hasInitialized.current = true
      hasProcessed.current = false
    }
  }, [isAuthenticated, token, setHasShownCompletionModal, setHasSkippedCompletion])

  // Process profile completeness data only once
  useEffect(() => {
    // Prevent processing if already done
    if (hasProcessed.current) {
      return
    }

    // Don't process if not authenticated
    if (!isAuthenticated || !token || !user) {
      return
    }

    // Don't process if still loading
    if (isLoading) {
      return
    }

    // Don't process if on profile page
    if (location.pathname.includes("/profile")) {
      return
    }

    // Don't process if there's an error
    if (error) {
      return
    }

    // Don't process if no data
    if (!completenessData) {
      return
    }

    // Mark as processed to prevent future runs
    hasProcessed.current = true

    const { completion_percentage, missing_fields } = completenessData

    // Only show modal if completion is less than 60% and there are missing fields
    // This ensures we don't show popup for reasonably complete profiles
    if (completion_percentage < 60 && missing_fields && missing_fields.length > 0) {
      setShowModal(true)
      setHasShownCompletionModal(true)
    }
  }, [isAuthenticated, token, user, completenessData, isLoading, error, location.pathname, setHasShownCompletionModal])

  // Reset when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasInitialized.current = false
      hasProcessed.current = false
      setShowModal(false)
    }
  }, [isAuthenticated])

  const handleSkip = () => {
    setShowModal(false)
    setHasSkippedCompletion(true)
  }

  const handleComplete = () => {
    setShowModal(false)
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated || !token) {
    return null
  }

  return (
    <ProfileCompletionModal
      isOpen={showModal}
      onClose={handleSkip}
      onComplete={handleComplete}
      completenessData={completenessData}
    />
  )
}

export default ProfileCompletionChecker
