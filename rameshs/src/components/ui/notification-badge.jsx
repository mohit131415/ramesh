import { cn } from "../../lib/utils"

export function NotificationBadge({ count, max = 99, className, children, showZero = false, ...props }) {
  const displayCount = count > max ? `${max}+` : count
  const shouldShow = showZero || count > 0

  if (!shouldShow) {
    return children
  }

  return (
    <div className="relative inline-block">
      {children}
      <span
        className={cn(
          "absolute -top-2 -right-2 flex items-center justify-center",
          "min-w-[18px] h-[18px] text-xs font-bold",
          "bg-red-500 text-white rounded-full",
          "border-2 border-white shadow-sm",
          "transform translate-x-1/2 -translate-y-1/2",
          className,
        )}
        {...props}
      >
        {displayCount}
      </span>
    </div>
  )
}
