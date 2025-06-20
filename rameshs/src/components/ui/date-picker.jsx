"use client"

import * as React from "react"
import { Input } from "./input"
import { cn } from "../../lib/utils"

export function DatePicker({ value, onChange, className, ...props }) {
  // Convert date to YYYY-MM-DD format for the input
  const formatDateForInput = (date) => {
    if (!date) return ""
    
    const dateObj = date instanceof Date ? date : new Date(date)
    if (isNaN(dateObj.getTime())) return ""
    
    return dateObj.toISOString().split('T')[0]
  }

  const handleChange = (e) => {
    const inputDate = e.target.value
    if (inputDate && onChange) {
      const newDate = new Date(inputDate)
      onChange(newDate)
    }
  }

  return (
    <Input
      type="date"
      value={formatDateForInput(value)}
      onChange={handleChange}
      className={cn("border-border/50 focus-visible:ring-primary", className)}
      {...props}
    />
  )
}
