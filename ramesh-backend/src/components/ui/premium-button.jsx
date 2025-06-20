"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { cn } from "../../lib/utils"

/**
 * PremiumButton - A luxurious button component with premium hover effects
 * that match the slider navigation buttons
 */
export const PremiumButton = ({
  href,
  className,
  variant = "default",
  size = "md",
  disabled = false,
  onClick,
  children,
  ...props
}) => {
  // Sizes
  const sizes = {
    sm: "px-6 py-2 text-sm",
    md: "px-12 py-4 text-base",
    lg: "px-16 py-5 text-lg",
  }

  // Button content with animations
  const ButtonContent = () => (
    <motion.div
      className={cn(
        "relative font-cinzel tracking-wider uppercase overflow-hidden border-2 border-gold text-gold",
        sizes[size],
        className,
      )}
      whileHover={{
        backgroundColor: "#D4B86A",
        color: "#000",
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
    >
      {children}
    </motion.div>
  )

  // Render as link or button
  if (href) {
    return (
      <Link to={href} className="inline-block" {...props}>
        <ButtonContent />
      </Link>
    )
  }

  return (
    <button onClick={onClick} disabled={disabled} className="inline-block" {...props}>
      <ButtonContent />
    </button>
  )
}

