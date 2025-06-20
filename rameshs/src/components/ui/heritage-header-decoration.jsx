export function HeritageHeaderDecoration({ className = "" }) {
    return (
      <div className={`relative flex items-center justify-center py-4 ${className}`}>
        {/* Central ornament */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-gold/40 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border border-gold/60 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gold/80 to-gold/30"></div>
            </div>
          </div>
  
          {/* Diamond accents */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gold/60 rotate-45"></div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gold/60 rotate-45"></div>
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gold/60 rotate-45"></div>
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gold/60 rotate-45"></div>
        </div>
  
        {/* Left decorative line */}
        <div className="flex items-center mr-4">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/60"></div>
          <div className="w-4 h-4 border-b border-r border-gold/40 -rotate-45 ml-1"></div>
          <div className="w-24 md:w-32 h-px bg-gradient-to-r from-gold/60 to-gold/20"></div>
        </div>
  
        {/* Right decorative line */}
        <div className="flex items-center ml-4">
          <div className="w-24 md:w-32 h-px bg-gradient-to-l from-gold/60 to-gold/20"></div>
          <div className="w-4 h-4 border-b border-l border-gold/40 rotate-45 mr-1"></div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/60"></div>
        </div>
      </div>
    )
  }
  
  export function HeritageHeaderDecorationAlt({ className = "" }) {
    return (
      <div className={`relative flex flex-col items-center ${className}`}>
        {/* Top decorative element */}
        <div className="flex items-center justify-center w-full mb-3">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent"></div>
          <div className="mx-2 w-3 h-3 rotate-45 border border-gold/50"></div>
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent"></div>
        </div>
  
        {/* Central ornament */}
        <div className="w-16 h-8 relative">
          <div className="absolute inset-0 border-t-2 border-b-2 border-gold/30"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-gold/20"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-gold/60"></div>
        </div>
  
        {/* Bottom decorative element */}
        <div className="flex items-center justify-center w-full mt-3">
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent"></div>
          <div className="mx-2 w-3 h-3 rotate-45 border border-gold/50"></div>
          <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gold/60 to-transparent"></div>
        </div>
      </div>
    )
  }
  
  export function HeritageHeaderDecorationFull({ className = "" }) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center">
          {/* Left decorative elements */}
          <div className="flex-1 flex items-center justify-end mr-4">
            <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent to-gold/60"></div>
            <div className="w-3 h-3 border border-gold/40 rotate-45 mx-2"></div>
            <div className="w-6 h-px bg-gold/80"></div>
          </div>
  
          {/* Central ornament */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 border border-gold/30 rotate-45 flex items-center justify-center">
              <div className="w-6 h-6 border border-gold/50 rotate-45 flex items-center justify-center">
                <div className="w-2 h-2 bg-gold"></div>
              </div>
            </div>
          </div>
  
          {/* Right decorative elements */}
          <div className="flex-1 flex items-center justify-start ml-4">
            <div className="w-6 h-px bg-gold/80"></div>
            <div className="w-3 h-3 border border-gold/40 rotate-45 mx-2"></div>
            <div className="w-full max-w-xs h-px bg-gradient-to-l from-transparent to-gold/60"></div>
          </div>
        </div>
  
        {/* Bottom flourish */}
        <div className="flex items-center justify-center mt-3">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
        </div>
      </div>
    )
  }
  
  