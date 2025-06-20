"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react"

// SVG Components
const DecorativeCircle = ({ className }) => (
  <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#D3AE6E"
      d="M47.5,-61.5C59.1,-51.9,64.5,-34.7,68.2,-17.7C71.9,-0.7,73.9,16.2,67.8,29.8C61.7,43.4,47.5,53.8,32.4,60.1C17.3,66.4,1.2,68.7,-16.9,67.1C-35,65.5,-55.1,60,-67.1,46.7C-79.1,33.4,-83,12.3,-79.2,-6.3C-75.4,-24.9,-63.9,-41,-49.2,-50.6C-34.5,-60.2,-17.3,-63.3,0.5,-63.9C18.2,-64.5,36.4,-62.6,47.5,-51.5Z"
      transform="translate(100 100)"
      opacity="0.1"
    />
  </svg>
)

const DecorativeWave = ({ className }) => (
  <svg className={className} viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <path
      d="M0 492L21.5 489.2C43 486.3 86 480.7 128.8 473.3C171.7 466 214.3 457 257.2 453.2C300 449.3 343 450.7 385.8 458.3C428.7 466 471.3 480 514.2 483.2C557 486.3 600 478.7 642.8 469.3C685.7 460 728.3 449 771.2 445.2C814 441.3 857 444.7 878.5 446.3L900 448L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
      fill="#D3AE6E"
      opacity="0.15"
    ></path>
    <path
      d="M0 513L21.5 513.5C43 514 86 515 128.8 513.5C171.7 512 214.3 508 257.2 507.3C300 506.7 343 509.3 385.8 513.3C428.7 517.3 471.3 522.7 514.2 522.8C557 523 600 518 642.8 513.2C685.7 508.3 728.3 503.7 771.2 505.3C814 507 857 515 878.5 519L900 523L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
      fill="#D3AE6E"
      opacity="0.3"
    ></path>
  </svg>
)

const DecorativePattern = ({ className }) => (
  <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="10" height="10">
        <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="#D3AE6E" strokeWidth="1" opacity="0.2" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
  </svg>
)

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/dashboard"

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const user = await login(email, password)
      console.log("Login successful")
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Login error:", err)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
      {/* Decorative elements */}
      <DecorativeCircle className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] opacity-50" />
      <DecorativeCircle className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] opacity-30" />
      <DecorativePattern className="absolute inset-0 opacity-10" />
      <DecorativeWave className="absolute bottom-0 left-0 w-full" />

      <div className={`w-full max-w-md px-4 transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img src="/images/ramesh-logo.svg" alt="Ramesh Sweets" className="h-24" />
            <div className="absolute -inset-0.5 rounded-full blur-sm bg-ramesh-gold/20 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-8 transform transition-all duration-500 hover:shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-ramesh-gold/10 text-ramesh-gold text-sm">
              <span className="mr-1">✨</span> Admin Portal
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start animate-fadeIn">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 transition-colors group-hover:text-ramesh-gold" />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full p-3 bg-white/70 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username or email"
                  required
                />
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-lg ring-1 ring-ramesh-gold/30"></div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-ramesh-gold hover:text-ramesh-gold/80 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 transition-colors group-hover:text-ramesh-gold" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full p-3 bg-white/70 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 rounded-lg ring-1 ring-ramesh-gold/30"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-ramesh-gold focus:ring-ramesh-gold border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-ramesh-gold to-ramesh-gold/90 hover:from-ramesh-gold/90 hover:to-ramesh-gold text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ramesh-gold disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Ramesh Sweets. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
