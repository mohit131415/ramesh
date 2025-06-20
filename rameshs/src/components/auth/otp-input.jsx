"use client"

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"

const OtpInput = forwardRef(({ value, onChange, numInputs = 6, isDisabled = false }, ref) => {
  const [activeInput, setActiveInput] = useState(0)
  const inputRefs = useRef([])

  // Expose focusInput method to parent component
  useImperativeHandle(ref, () => ({
    focusInput: (index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].focus()
        setActiveInput(index)
      }
    },
  }))

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = Array(numInputs)
      .fill(null)
      .map((_, i) => inputRefs.current[i] || React.createRef())
  }, [numInputs])

  // Focus on first input when component mounts
  useEffect(() => {
    if (!isDisabled && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [isDisabled])

  // Handle value change
  const handleChange = (e, index) => {
    const newValue = e.target.value

    // Only accept single digit
    if (newValue.length > 1) {
      return
    }

    // Update value
    const newOtp = value.split("")
    newOtp[index] = newValue
    onChange(newOtp.join(""))

    // Move to next input if value is entered
    if (newValue && index < numInputs - 1) {
      setActiveInput(index + 1)
      inputRefs.current[index + 1].focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      // If current input is empty, move to previous input
      if (!value[index] && index > 0) {
        setActiveInput(index - 1)
        inputRefs.current[index - 1].focus()
      }
    }
  }

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Only accept digits
    if (!/^\d+$/.test(pastedData)) {
      return
    }

    // Only use up to numInputs digits
    const otpValue = pastedData.slice(0, numInputs)
    onChange(otpValue.padEnd(numInputs, ""))

    // Focus on last filled input
    const lastFilledIndex = Math.min(otpValue.length, numInputs - 1)
    setActiveInput(lastFilledIndex)
    inputRefs.current[lastFilledIndex].focus()
  }

  // Handle input focus
  const handleFocus = (index) => {
    setActiveInput(index)
  }

  return (
    <div className="flex justify-center space-x-2" onPaste={handlePaste}>
      {Array(numInputs)
        .fill(null)
        .map((_, index) => (
          <input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            disabled={isDisabled}
            className={`
              w-12 h-14 text-center text-xl font-bold rounded-lg 
              border-2 focus:outline-none transition-all duration-200
              ${activeInput === index ? "border-[#d3ae6e] bg-[#f8f3e9] ring-[#d3ae6e]/20 ring-2" : "border-[#e9dcc3] bg-white"}
              ${value[index] ? "border-[#d3ae6e] bg-[#f8f3e9]" : ""}
              ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}
            `}
          />
        ))}
    </div>
  )
})

OtpInput.displayName = "OtpInput"

export default OtpInput
  