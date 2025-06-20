"use client"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import LoadingSpinner from "../common/loading-spinner"

const ProtectedRoute = ({ children, redirectTo = "/" }) => {
  const { isAuthenticated, openAuthModal, checkAuth } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const validateAuth = async () => {
      setIsChecking(true)
      const valid = await checkAuth()
      setIsValid(valid)
      setIsChecking(false)

      if (!valid && !isAuthenticated) {
        // Open auth modal if not authenticated
        openAuthModal()
      }
    }

    validateAuth()
  }, [checkAuth, isAuthenticated, openAuthModal])

  if (isChecking) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (!isValid && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default ProtectedRoute
