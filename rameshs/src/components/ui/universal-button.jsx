import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

const UniversalButton = ({
  children,
  className,
  variant = "primary",
  size = "default",
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  ...props
}) => {
  // Size variations
  const sizeStyles = {
    sm: "h-10 px-6 py-2.5 text-xs",
    default: "h-12 px-8 py-3 text-sm",
    lg: "h-14 px-10 py-3.5 text-base",
    xl: "h-16 px-12 py-4 text-lg",
  }

  // Common styles for both variants
  const baseStyles = cn(
    "relative font-cinzel tracking-wider font-bold rounded-sm",
    "inline-flex items-center justify-center",
    "transition-all duration-300 ease-in-out",
    "focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    sizeStyles[size],
  )

  // Variant-specific styles
  const variantStyles = {
    primary: cn(
      "text-[#78383b] border border-[#E5D3C5]/80",
      "bg-[#E5D3C5]",
      "hover:bg-[#D9C4B5]",
      "active:bg-[#CDB5A5]",
    ),
    secondary: cn(
      "text-[#78383b] border-2 border-[#E5D3C5]/70",
      "bg-transparent",
      "hover:bg-[#E5D3C5]/10",
      "active:bg-[#E5D3C5]/20",
    ),
  }

  // Handle loading state
  const LoadingSpinner = () => (
    <Loader2
      className={cn(
        "animate-spin",
        iconPosition === "left" ? "mr-2" : "ml-2",
        size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4",
      )}
    />
  )

  return (
    <button className={cn(baseStyles, variantStyles[variant], className)} disabled={disabled || isLoading} {...props}>
      {/* Decorative corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#E5D3C5]/80"></span>
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#E5D3C5]/80"></span>
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#E5D3C5]/80"></span>
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#E5D3C5]/80"></span>

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">
        {isLoading ? (
          <>
            {iconPosition === "left" && <LoadingSpinner />}
            <span>{children}</span>
            {iconPosition === "right" && <LoadingSpinner />}
          </>
        ) : (
          <>{children}</>
        )}
      </span>

      {/* Hover effect - subtle shine animation */}
      <span className="absolute inset-0 z-0 overflow-hidden rounded-sm">
        <span className="absolute -inset-[200%] animate-[shine_8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></span>
      </span>
    </button>
  )
}

export { UniversalButton }
