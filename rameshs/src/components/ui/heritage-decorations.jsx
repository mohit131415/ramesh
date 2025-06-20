export function HeritageCornerDecoration({ className = "", variant = "full", ...props }) {
  return (
    <div className={`relative ${className}`} {...props}>
      {variant === "full" && (
        <>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/60"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/60"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/60"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/60"></div>
        </>
      )}

      {variant === "corners" && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold/60"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-gold/60"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-gold/60"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold/60"></div>
        </>
      )}

      {variant === "top" && (
        <>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/60"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/60"></div>
        </>
      )}

      {variant === "bottom" && (
        <>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/60"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/60"></div>
        </>
      )}
    </div>
  )
}

export function HeritageDivider({ className = "" }) {
  return (
    <div className={`relative h-px w-24 bg-gold/50 my-6 mx-auto ${className}`}>
      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-gold/70"></div>
      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-gold/70"></div>
    </div>
  )
}

export function HeritageAccent({ className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 border border-gold/20"></div>
      <div className="absolute inset-[3px] border border-gold/10"></div>
    </div>
  )
}

export function HeritageHeaderDecoration({ className = "", ...props }) {
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold/80 to-transparent"></div>
      <div className="mx-2 text-gold">✦</div>
      <div className="h-px w-12 bg-gradient-to-r from-transparent via-gold/80 to-transparent"></div>
    </div>
  )
}

export function HeritageHeaderDecorationFull({ className = "", ...props }) {
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <div className="hidden md:flex items-center">
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold/30 to-gold/80"></div>
        <div className="mx-2 text-gold/60 transform rotate-45">❖</div>
      </div>

      <div className="flex items-center mx-4">
        <div className="h-px w-6 md:w-12 bg-gradient-to-r from-transparent via-gold/80 to-transparent"></div>
        <div className="mx-2 text-gold">✦</div>
        <div className="h-px w-6 md:w-12 bg-gradient-to-r from-transparent via-gold/80 to-transparent"></div>
      </div>

      <div className="hidden md:flex items-center">
        <div className="mx-2 text-gold/60 transform rotate-45">❖</div>
        <div className="h-px w-16 bg-gradient-to-r from-gold/80 via-gold/30 to-transparent"></div>
      </div>
    </div>
  )
}

export function HeritageCorners({ className = "" }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold"></div>
    </div>
  )
}

// Add a new variant for the cart header
export function HeritageCartDecoration({ className }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-gold/30 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-gold/30 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-gold/30 rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-gold/30 rounded-br-lg"></div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
    </div>
  )
}

