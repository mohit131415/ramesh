"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { AlertCircle, CheckCircle } from "lucide-react"

const ResetPassword = () => {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await forgotPassword(email)
      setSuccess(true)
      setEmail("")
    } catch (err) {
      setError(err.message || "Failed to send password reset link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-gray-600">Request a password reset link to be sent to your email</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>Password reset link has been sent to your email. Please check your inbox.</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                placeholder="Enter your email address"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">We'll send a password reset link to this email address.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ramesh-gold hover:bg-ramesh-gold/90 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ramesh-gold disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Important Notes:</h3>
          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
            <li>The reset link will expire after 60 minutes.</li>
            <li>If you don't receive the email, please check your spam folder.</li>
            <li>
              If you still can't find it, contact support at{" "}
              <a href="mailto:support@rameshsweets.com" className="text-ramesh-gold hover:underline">
                support@rameshsweets.com
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
