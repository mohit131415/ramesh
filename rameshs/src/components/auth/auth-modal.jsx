"use client"

import { useState, useEffect, useRef } from "react"
import { X, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import useAuthStore from "../../store/authStore"
import OtpInput from "./otp-input"
import { UniversalButton } from "../ui/universal-button"

const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authStep,
    setAuthStep,
    requestRegister,
    requestLogin,
    verifyOtp,
    currentPhone,
    setCurrentPhone,
    otpType,
    isLoading,
    error,
  } = useAuthStore()

  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [phoneError, setPhoneError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderInterval = useRef(null)
  const modalRef = useRef(null)
  const initialRenderRef = useRef(true)
  const otpInputRef = useRef(null)
  const [canResend, setCanResend] = useState(false)

  // Set initial step to register when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      // Only set to register on initial open, not during navigation
      if (initialRenderRef.current || authStep === "initial") {
        setAuthStep("register")
        initialRenderRef.current = false
      }
    } else {
      // Reset the initial render flag when modal closes
      initialRenderRef.current = true
    }
  }, [isAuthModalOpen, setAuthStep, authStep])

  // Sweet images for the slider
  const sweetImages = [
    { src: "/sweets_images/gulab_jamun.jpg", name: "Gulab Jamun" },
    { src: "/sweets_images/JILEBI.webp", name: "Jilebi" },
    { src: "/sweets_images/kajukatli.webp", name: "Kaju Katli" },
    { src: "/sweets_images/malaipeda.jpg", name: "Malaipeda" },
    { src: "/sweets_images/MODAK.webp", name: "Modak" },
  ]

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY

      // Add styles to prevent scrolling
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"

      return () => {
        // Restore scrolling when component unmounts or modal closes
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        window.scrollTo(0, scrollY)
      }
    }
  }, [isAuthModalOpen])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setPhoneNumber("")
      setOtp("")
      setPhoneError("")
      setTermsAccepted(false)
      setCanResend(false)
    } else if (currentPhone) {
      setPhoneNumber(currentPhone)
    }
  }, [isAuthModalOpen, currentPhone])

  // Start countdown when OTP is sent
  useEffect(() => {
    if (authStep === "verifyOtp") {
      setCountdown(0) // Start with no countdown
      setCanResend(true) // Enable resend button initially

      // No timer initially - timer will start after first resend
      return () => {}
    }
  }, [authStep])

  // Auto-rotate slider
  useEffect(() => {
    if (isAuthModalOpen) {
      sliderInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sweetImages.length)
      }, 4000)

      return () => {
        if (sliderInterval.current) {
          clearInterval(sliderInterval.current)
        }
      }
    }
  }, [isAuthModalOpen, sweetImages.length])

  // Auto-focus OTP input when step changes to verifyOtp
  useEffect(() => {
    if (authStep === "verifyOtp" && otpInputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        if (otpInputRef.current && otpInputRef.current.focusInput) {
          otpInputRef.current.focusInput(0)
        }
      }, 100)
    }
  }, [authStep])

  // Add a function to show toast for validation errors
  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phone) {
      setPhoneError("Phone number is required")
      return false
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError("Please enter a valid 10-digit phone number")
      return false
    }
    setPhoneError("")
    return true
  }

  // Handle phone number change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "")
    setPhoneNumber(value)
    if (phoneError) validatePhone(value)
  }

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return ""
    if (phone.length <= 5) return phone
    return `${phone.slice(0, 5)}-${phone.slice(5)}`
  }

  // Update the handleRegister function to show toast for all responses
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validatePhone(phoneNumber)) {
      if (window.showToast) {
        window.showToast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit mobile number.",
          type: "error",
          duration: 5000,
        })
      }
      return
    }
    if (!termsAccepted) {
      if (window.showToast) {
        window.showToast({
          title: "Terms Required",
          description: "Please accept our terms and conditions.",
          type: "warning",
          duration: 5000,
        })
      }
      return
    }

    const result = await requestRegister(phoneNumber)
    // Toast is handled in the store function
  }

  // Update the handleLogin function to show toast for all responses
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validatePhone(phoneNumber)) {
      if (window.showToast) {
        window.showToast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit mobile number.",
          type: "error",
          duration: 5000,
        })
      }
      return
    }
    if (!termsAccepted) {
      if (window.showToast) {
        window.showToast({
          title: "Terms Required",
          description: "Please accept our terms and conditions.",
          type: "warning",
          duration: 5000,
        })
      }
      return
    }

    const result = await requestLogin(phoneNumber)
    // Toast is handled in the store function
  }

  // Update the handleVerifyOtp function to show toast for all responses
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      if (window.showToast) {
        window.showToast({
          title: "Invalid Code",
          description: "Please enter the complete 6-digit verification code.",
          type: "error",
          duration: 5000,
        })
      }
      return
    }

    try {
      const result = await verifyOtp(otp)

      // Log the result for debugging
      console.log("OTP verification result:", result)

      // The success case is handled entirely in the store
      // Only handle additional error logging here if needed
      if (!result.success) {
        console.error("OTP verification failed:", result.error)
      }
    } catch (error) {
      console.error("Unexpected error during OTP verification:", error)
    }
  }

  // Update the handleResendOtp function to show toast for all responses
  const handleResendOtp = async () => {
    // Reset OTP field
    setOtp("")

    // Start timer and disable resend button
    setCountdown(120)
    setCanResend(false)

    // Start the countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true) // Enable resend when timer expires
          return 0
        }
        return prev - 1
      })
    }, 1000)

    if (window.showToast) {
      window.showToast({
        title: "Code Sent",
        description: "A new verification code has been sent to your mobile.",
        type: "success",
        duration: 5000,
      })
    }

    if (otpType === "register") {
      await requestRegister(phoneNumber)
    } else {
      await requestLogin(phoneNumber)
    }
    // Toast is handled in the store function
  }

  // Handle OTP change
  const handleOtpChange = (value) => {
    setOtp(value)
  }

  // Handle back button
  const handleBack = () => {
    if (authStep === "verifyOtp") {
      setAuthStep(otpType || "register") // Changed default from "login" to "register"
    } else {
      setAuthStep("register") // Changed from "login" to "register"
    }
    setOtp("")
  }

  // Add toast for successful navigation between forms
  const handleAuthNavigation = (step) => {
    setAuthStep(step)
    if (step === "login") {
      if (window.showToast) {
        window.showToast({
          title: "Sign In",
          description: "Enter your mobile number to sign in.",
          type: "info",
          duration: 3000,
        })
      }
    } else if (step === "register") {
      if (window.showToast) {
        window.showToast({
          title: "Registration",
          description: "Create a new account with your mobile number.",
          type: "info",
          duration: 3000,
        })
      }
    }
  }

  // Handle slider navigation
  const goToSlide = (index) => {
    setCurrentSlide(index)
    // Reset the interval when manually navigating
    if (sliderInterval.current) {
      clearInterval(sliderInterval.current)
      sliderInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sweetImages.length)
      }, 4000)
    }
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % sweetImages.length)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + sweetImages.length) % sweetImages.length)
  }

  // Add a useEffect to show toast for errors from the store
  // useEffect(() => {
  //   if (error) {
  //     if (window.showToast) {
  //       window.showToast({
  //         title: "Error",
  //         description: error,
  //         type: "error",
  //         duration: 5000,
  //       })
  //     }
  //   }
  // }, [error])

  if (!isAuthModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={closeAuthModal}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl mx-auto overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main container with custom shadow and border */}
        <div className="relative flex flex-col md:flex-row rounded-xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.2)] border border-white/20">
          {/* Left side - Image slider with decorative elements */}
          <div className="relative w-full md:w-1/2 bg-[#d3ae6e]">
            {/* Decorative SVG patterns */}
            <div className="absolute inset-0 pointer-events-none">
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <pattern id="sweet-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 30c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z"
                      fill="#fff"
                      fillOpacity="0.05"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#sweet-pattern)" />
              </svg>
            </div>

            {/* Top decorative SVG */}
            <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
              <svg viewBox="0 0 500 50" preserveAspectRatio="none" className="absolute top-0 w-full h-full">
                <path d="M0,50 C150,20 350,20 500,50 L500,0 L0,0 Z" fill="#fff" fillOpacity="0.07"></path>
              </svg>
            </div>

            {/* Bottom decorative SVG */}
            <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
              <svg
                viewBox="0 0 500 50"
                preserveAspectRatio="none"
                className="absolute bottom-0 w-full h-full transform rotate-180"
              >
                <path d="M0,50 C150,20 350,20 500,50 L500,0 L0,0 Z" fill="#fff" fillOpacity="0.07"></path>
              </svg>
            </div>

            {/* Full height image slider */}
            <div className="relative h-64 md:h-full">
              {/* Slider container */}
              <div className="absolute inset-0">
                {sweetImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      src={image.src || "/placeholder.svg"}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {/* Decorative frame around the image */}
                    <div className="absolute inset-8 border border-white/20 rounded-lg pointer-events-none"></div>

                    <div className="absolute bottom-12 left-0 right-0 text-center">
                      <span className="inline-block px-4 py-1.5 bg-[#d3ae6e] text-white text-sm rounded-full shadow-lg">
                        {image.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider controls */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/30"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/30"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>

              {/* Slider indicators */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
                {sweetImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentSlide ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Authentication forms */}
          <div className="w-full md:w-1/2 bg-white relative">
            {/* Decorative SVG background */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="auth-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path
                      d="M0 50 Q25 0 50 50 Q75 100 100 50 Q125 0 150 50 Q175 100 200 50"
                      stroke="#d3ae6e"
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d="M0 50 Q25 100 50 50 Q75 0 100 50 Q125 100 150 50 Q175 0 200 50"
                      stroke="#d3ae6e"
                      strokeWidth="1"
                      fill="none"
                      transform="translate(0, 50)"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#auth-pattern)" />
              </svg>
            </div>

            {/* Decorative corner SVGs */}
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-10">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 Z" fill="#d3ae6e" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none opacity-10 transform rotate-180">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 Z" fill="#d3ae6e" />
              </svg>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-1/4 right-6 w-20 h-20 rounded-full border border-[#d3ae6e]/10 pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-6 w-16 h-16 rounded-full border border-[#d3ae6e]/10 pointer-events-none"></div>

            {/* Logo at the top with decorative elements */}
            <div className="relative flex flex-col items-center pt-8 pb-4">
              <div className="relative">
                <img src="/images/ramesh-logo.svg" alt="Ramesh Sweets Logo" className="h-16 w-auto relative z-10" />
                {/* Decorative circle behind logo */}
                <div className="absolute -inset-2 rounded-full bg-[#f8f3e9] -z-10"></div>
              </div>

              {/* Decorative line under logo */}
              <div className="flex items-center justify-center w-full mt-4 px-12">
                <div className="h-px bg-gradient-to-r from-transparent via-[#d3ae6e]/30 to-transparent w-full"></div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/90 text-[#d3ae6e] hover:bg-[#f8f3e9] transition-colors z-20 shadow-md border border-[#d3ae6e]/20"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Back button - show only if on verify OTP step */}
            {authStep === "verifyOtp" && (
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 p-1.5 rounded-full bg-white/90 text-[#d3ae6e] hover:bg-[#f8f3e9] transition-colors z-20 shadow-md border border-[#d3ae6e]/20"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            {/* Content container */}
            <div className="px-8 pb-8 pt-4 h-full flex flex-col">
              {/* Login step */}
              {authStep === "login" && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-[#8c6d3f]">Account Sign In</h2>
                    <p className="text-[#d3ae6e]">Access your account and preferences</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3 flex flex-col">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-[#8c6d3f]">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          maxLength={10}
                          placeholder="Enter your 10-digit number"
                          className="w-full py-3 px-4 border-2 border-[#e9dcc3] focus:border-[#d3ae6e] rounded-lg bg-white text-[#8c6d3f] placeholder-[#d3ae6e]/50 focus:outline-none focus:ring-2 focus:ring-[#d3ae6e]/20"
                          disabled={isLoading}
                        />
                        {/* Decorative phone icon */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d3ae6e]/40 pointer-events-none">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                    </div>

                    {/* Terms and conditions checkbox with custom styling */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-4 h-4 border-2 border-[#e9dcc3] rounded bg-white text-[#d3ae6e] focus:ring-[#d3ae6e]/30 focus:ring-offset-0"
                          required
                        />
                      </div>
                      <label htmlFor="terms" className="text-sm text-[#8c6d3f]">
                        I agree to the{" "}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#d3ae6e] hover:underline font-medium"
                        >
                          Terms and Conditions
                        </a>
                      </label>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <UniversalButton
                      type="submit"
                      disabled={isLoading || !phoneNumber || !termsAccepted}
                      variant="primary"
                      size="lg"
                      className="w-full !bg-[#d3ae6e] !border-[#d3ae6e] hover:!bg-[#c3a05e] hover:!border-[#c3a05e] !rounded-lg !shadow-md !shadow-[#d3ae6e]/20"
                      isLoading={isLoading}
                    >
                      {isLoading ? "Sending Verification Code..." : "Sign In"}
                    </UniversalButton>
                  </form>

                  {/* Auth toggle buttons at the bottom */}
                  <div className="pt-4 border-t border-[#e9dcc3]">
                    <p className="text-center text-sm text-[#8c6d3f] mb-2">Don't have an account?</p>
                    <UniversalButton
                      onClick={() => handleAuthNavigation("register")}
                      variant="outline"
                      size="lg"
                      className="w-full !border-[#d3ae6e] !text-[#d3ae6e] hover:!bg-[#f8f3e9] !rounded-lg"
                    >
                      Create a new account
                    </UniversalButton>
                  </div>
                </div>
              )}

              {/* Register step */}
              {authStep === "register" && (
                <div className="space-y-5 flex-1 flex flex-col">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-[#8c6d3f]">Create Account</h2>
                    <p className="text-[#d3ae6e]">Register to access exclusive offers and benefits</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3 flex flex-col">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-[#8c6d3f]">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          maxLength={10}
                          placeholder="Enter your 10-digit number"
                          className="w-full py-3 px-4 border-2 border-[#e9dcc3] focus:border-[#d3ae6e] rounded-lg bg-white text-[#8c6d3f] placeholder-[#d3ae6e]/50 focus:outline-none focus:ring-2 focus:ring-[#d3ae6e]/20"
                          disabled={isLoading}
                        />
                        {/* Decorative phone icon */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d3ae6e]/40 pointer-events-none">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                    </div>

                    {/* Terms and conditions checkbox with custom styling */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="terms-register"
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="w-4 h-4 border-2 border-[#e9dcc3] rounded bg-white text-[#d3ae6e] focus:ring-[#d3ae6e]/30 focus:ring-offset-0"
                          required
                        />
                      </div>
                      <label htmlFor="terms-register" className="text-sm text-[#8c6d3f]">
                        I agree to the{" "}
                        <a
                          href="/terms-of-service"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#d3ae6e] hover:underline font-medium"
                        >
                          Terms and Conditions
                        </a>
                      </label>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <UniversalButton
                      type="submit"
                      disabled={isLoading || !phoneNumber || !termsAccepted}
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                    >
                      {isLoading ? "Sending Verification Code..." : "Create Account"}
                    </UniversalButton>
                  </form>

                  {/* Auth toggle buttons at the bottom */}
                  <div className="pt-3 border-t border-[#e9dcc3] mt-3">
                    <p className="text-center text-sm text-[#8c6d3f] mb-2">Already have an account?</p>
                    <UniversalButton
                      onClick={() => handleAuthNavigation("login")}
                      variant="outline"
                      size="lg"
                      className="w-full !border-[#d3ae6e] !text-[#d3ae6e] hover:!bg-[#f8f3e9] !rounded-lg"
                    >
                      Sign in to your account
                    </UniversalButton>
                  </div>
                </div>
              )}

              {/* Verify OTP step */}
              {authStep === "verifyOtp" && (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-[#8c6d3f]">
                      {otpType === "register" ? "Verify Your Account" : "Verify Your Identity"}
                    </h2>
                    <p className="text-[#d3ae6e]">
                      Enter the verification code sent to{" "}
                      <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="flex-1 flex flex-col">
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <OtpInput
                          ref={otpInputRef}
                          value={otp}
                          onChange={handleOtpChange}
                          numInputs={6}
                          isDisabled={isLoading}
                        />
                      </div>

                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center text-sm text-[#8c6d3f]">
                          {countdown > 0 ? (
                            <span className="flex items-center">
                              <Loader2 size={14} className="animate-spin mr-2 text-[#d3ae6e]" />
                              Expires in{" "}
                              <span className="font-medium ml-1">
                                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                              </span>
                            </span>
                          ) : (
                            <span>Code expired</span>
                          )}
                        </div>

                        {/* Always show resend button, but disable it when countdown is active */}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className={`text-[#d3ae6e] text-sm font-medium ${
                            !canResend ? "opacity-50 cursor-not-allowed" : "hover:underline"
                          }`}
                          disabled={!canResend || isLoading}
                        >
                          Resend Code
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-4">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    {/* Push button to bottom with flex-1 */}
                    <div className="flex-1 flex flex-col mt-12">
                      <UniversalButton
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        variant="primary"
                        size="lg"
                        className="w-full !bg-[#d3ae6e] !border-[#d3ae6e] hover:!bg-[#c3a05e] hover:!border-[#c3a05e] !rounded-lg !shadow-md !shadow-[#d3ae6e]/20"
                        isLoading={isLoading}
                      >
                        {isLoading ? "Verifying..." : "Verify & Continue"}
                      </UniversalButton>

                      {/* Help text below button */}
                      <p className="text-[#8c6d3f] text-sm text-center mt-3">
                        Didn't receive the code? Contact us at{" "}
                        <a href="tel:+919876543210" className="text-[#d3ae6e] font-medium hover:underline">
                          +91 9876 543 210
                        </a>{" "}
                        or{" "}
                        <a
                          href="mailto:support@rameshsweets.com"
                          className="text-[#d3ae6e] font-medium hover:underline"
                        >
                          support@rameshsweets.com
                        </a>
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add a keyframe animation for the modal
const style = document.createElement("style")
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`
document.head.appendChild(style)

export default AuthModal
