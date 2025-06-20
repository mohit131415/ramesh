"use client"

import { Component } from "react"
import { Navigate } from "react-router-dom"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Redirect to 404 page instead of showing error UI
      return <Navigate to="/404" replace />
    }

    return this.props.children
  }
}

export default ErrorBoundary
