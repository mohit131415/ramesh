export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const sizeClass = sizeClasses[size] || sizeClasses.md

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-gold/30 border-t-gold ${sizeClass}`}></div>
    </div>
  )
}
