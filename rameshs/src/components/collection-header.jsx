const CollectionHeader = ({ title, subtitle }) => {
  return (
    <div className="bg-[#fff9fb] py-6 relative overflow-hidden mb-8">
      {/* Background pattern - subtle kolam-inspired dots */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="kolam-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#8b5d3b" />
            <circle cx="0" cy="0" r="1" fill="#8b5d3b" />
            <circle cx="0" cy="20" r="1" fill="#8b5d3b" />
            <circle cx="20" cy="0" r="1" fill="#8b5d3b" />
            <circle cx="20" cy="20" r="1" fill="#8b5d3b" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#kolam-dots)" />
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="relative w-full">
          {/* Ornate border frame */}
          <div className="absolute inset-0 -m-4">
            {/* Top border with intricate pattern */}
            <div className="absolute top-0 left-0 right-0 h-8">
              <svg
                width="100%"
                height="32"
                viewBox="0 0 800 32"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0,16 C100,8 150,24 200,16 C250,8 300,24 350,16 C400,8 450,24 500,16 C550,8 600,24 650,16 C700,8 750,24 800,16"
                  stroke="#8b5d3b"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M0,16 C100,8 150,24 200,16 C250,8 300,24 350,16 C400,8 450,24 500,16 C550,8 600,24 650,16 C700,8 750,24 800,16"
                  stroke="#d4af37"
                  strokeWidth="0.75"
                  fill="none"
                  strokeDasharray="4 6"
                />

                {/* Decorative elements along the border */}
                <circle cx="200" cy="16" r="3" fill="#8b5d3b" />
                <circle cx="400" cy="16" r="3" fill="#8b5d3b" />
                <circle cx="600" cy="16" r="3" fill="#8b5d3b" />

                <circle cx="200" cy="16" r="1.5" fill="#d4af37" />
                <circle cx="400" cy="16" r="1.5" fill="#d4af37" />
                <circle cx="600" cy="16" r="1.5" fill="#d4af37" />
              </svg>
            </div>

            {/* Bottom border with intricate pattern */}
            <div className="absolute bottom-0 left-0 right-0 h-8">
              <svg
                width="100%"
                height="32"
                viewBox="0 0 800 32"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0,16 C100,24 150,8 200,16 C250,24 300,8 350,16 C400,24 450,8 500,16 C550,24 600,8 650,16 C700,24 750,8 800,16"
                  stroke="#8b5d3b"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M0,16 C100,24 150,8 200,16 C250,24 300,8 350,16 C400,24 450,8 500,16 C550,24 600,8 650,16 C700,24 750,8 800,16"
                  stroke="#d4af37"
                  strokeWidth="0.75"
                  fill="none"
                  strokeDasharray="4 6"
                />

                {/* Decorative elements along the border */}
                <circle cx="200" cy="16" r="3" fill="#8b5d3b" />
                <circle cx="400" cy="16" r="3" fill="#8b5d3b" />
                <circle cx="600" cy="16" r="3" fill="#8b5d3b" />

                <circle cx="200" cy="16" r="1.5" fill="#d4af37" />
                <circle cx="400" cy="16" r="1.5" fill="#d4af37" />
                <circle cx="600" cy="16" r="1.5" fill="#d4af37" />
              </svg>
            </div>

            {/* Left border with intricate pattern */}
            <div className="absolute top-8 bottom-8 left-0 w-8">
              <svg
                width="32"
                height="100%"
                viewBox="0 0 32 600"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16,0 C8,75 24,112.5 16,150 C8,187.5 24,225 16,262.5 C8,300 24,337.5 16,375 C8,412.5 24,450 16,487.5 C8,525 24,562.5 16,600"
                  stroke="#8b5d3b"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M16,0 C8,75 24,112.5 16,150 C8,187.5 24,225 16,262.5 C8,300 24,337.5 16,375 C8,412.5 24,450 16,487.5 C8,525 24,562.5 16,600"
                  stroke="#d4af37"
                  strokeWidth="0.75"
                  fill="none"
                  strokeDasharray="4 6"
                />

                {/* Decorative elements along the border */}
                <circle cx="16" cy="150" r="3" fill="#8b5d3b" />
                <circle cx="16" cy="300" r="3" fill="#8b5d3b" />
                <circle cx="16" cy="450" r="3" fill="#8b5d3b" />

                <circle cx="16" cy="150" r="1.5" fill="#d4af37" />
                <circle cx="16" cy="300" r="1.5" fill="#d4af37" />
                <circle cx="16" cy="450" r="1.5" fill="#d4af37" />
              </svg>
            </div>

            {/* Right border with intricate pattern */}
            <div className="absolute top-8 bottom-8 right-0 w-8">
              <svg
                width="32"
                height="100%"
                viewBox="0 0 32 600"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16,0 C24,75 8,112.5 16,150 C24,187.5 8,225 16,262.5 C24,300 8,337.5 16,375 C24,412.5 8,450 16,487.5 C24,525 8,562.5 16,600"
                  stroke="#8b5d3b"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M16,0 C24,75 8,112.5 16,150 C24,187.5 8,225 16,262.5 C24,300 8,337.5 16,375 C24,412.5 8,450 16,487.5 C24,525 8,562.5 16,600"
                  stroke="#d4af37"
                  strokeWidth="0.75"
                  fill="none"
                  strokeDasharray="4 6"
                />

                {/* Decorative elements along the border */}
                <circle cx="16" cy="150" r="3" fill="#8b5d3b" />
                <circle cx="16" cy="300" r="3" fill="#8b5d3b" />
                <circle cx="16" cy="450" r="3" fill="#8b5d3b" />

                <circle cx="16" cy="150" r="1.5" fill="#d4af37" />
                <circle cx="16" cy="300" r="1.5" fill="#d4af37" />
                <circle cx="16" cy="450" r="1.5" fill="#d4af37" />
              </svg>
            </div>

            {/* Corner elements - more elaborate and authentic */}
            <div className="absolute top-[-16px] left-[-16px]">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8L36 20H28L32 8Z" fill="#8b5d3b" />
                <path d="M32 56L28 44H36L32 56Z" fill="#8b5d3b" />
                <path d="M8 32L20 28V36L8 32Z" fill="#8b5d3b" />
                <path d="M56 32L44 36V28L56 32Z" fill="#8b5d3b" />
                <path d="M24 16L28 24H20L24 16Z" fill="#d4af37" />
                <path d="M40 16L44 24H36L40 16Z" fill="#d4af37" />
                <path d="M24 48L20 40H28L24 48Z" fill="#d4af37" />
                <path d="M40 48L36 40H44L40 48Z" fill="#d4af37" />
                <path d="M16 24L24 20V28L16 24Z" fill="#d4af37" />
                <path d="M16 40L24 36V44L16 40Z" fill="#d4af37" />
                <path d="M48 24L40 28V20L48 24Z" fill="#d4af37" />
                <path d="M48 40L40 44V36L48 40Z" fill="#d4af37" />
                <circle cx="32" cy="32" r="6" fill="#8b5d3b" />
                <circle cx="32" cy="32" r="3" fill="#d4af37" />
              </svg>
            </div>
            <div className="absolute top-[-16px] right-[-16px]">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8L36 20H28L32 8Z" fill="#8b5d3b" />
                <path d="M32 56L28 44H36L32 56Z" fill="#8b5d3b" />
                <path d="M8 32L20 28V36L8 32Z" fill="#8b5d3b" />
                <path d="M56 32L44 36V28L56 32Z" fill="#8b5d3b" />
                <path d="M24 16L28 24H20L24 16Z" fill="#d4af37" />
                <path d="M40 16L44 24H36L40 16Z" fill="#d4af37" />
                <path d="M24 48L20 40H28L24 48Z" fill="#d4af37" />
                <path d="M40 48L36 40H44L40 48Z" fill="#d4af37" />
                <path d="M16 24L24 20V28L16 24Z" fill="#d4af37" />
                <path d="M16 40L24 36V44L16 40Z" fill="#d4af37" />
                <path d="M48 24L40 28V20L48 24Z" fill="#d4af37" />
                <path d="M48 40L40 44V36L48 40Z" fill="#d4af37" />
                <circle cx="32" cy="32" r="6" fill="#8b5d3b" />
                <circle cx="32" cy="32" r="3" fill="#d4af37" />
              </svg>
            </div>
            <div className="absolute bottom-[-16px] left-[-16px]">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8L36 20H28L32 8Z" fill="#8b5d3b" />
                <path d="M32 56L28 44H36L32 56Z" fill="#8b5d3b" />
                <path d="M8 32L20 28V36L8 32Z" fill="#8b5d3b" />
                <path d="M56 32L44 36V28L56 32Z" fill="#8b5d3b" />
                <path d="M24 16L28 24H20L24 16Z" fill="#d4af37" />
                <path d="M40 16L44 24H36L40 16Z" fill="#d4af37" />
                <path d="M24 48L20 40H28L24 48Z" fill="#d4af37" />
                <path d="M40 48L36 40H44L40 48Z" fill="#d4af37" />
                <path d="M16 24L24 20V28L16 24Z" fill="#d4af37" />
                <path d="M16 40L24 36V44L16 40Z" fill="#d4af37" />
                <path d="M48 24L40 28V20L48 24Z" fill="#d4af37" />
                <path d="M48 40L40 44V36L48 40Z" fill="#d4af37" />
                <circle cx="32" cy="32" r="6" fill="#8b5d3b" />
                <circle cx="32" cy="32" r="3" fill="#d4af37" />
              </svg>
            </div>
            <div className="absolute bottom-[-16px] right-[-16px]">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8L36 20H28L32 8Z" fill="#8b5d3b" />
                <path d="M32 56L28 44H36L32 56Z" fill="#8b5d3b" />
                <path d="M8 32L20 28V36L8 32Z" fill="#8b5d3b" />
                <path d="M56 32L44 36V28L56 32Z" fill="#8b5d3b" />
                <path d="M24 16L28 24H20L24 16Z" fill="#d4af37" />
                <path d="M40 16L44 24H36L40 16Z" fill="#d4af37" />
                <path d="M24 48L20 40H28L24 48Z" fill="#d4af37" />
                <path d="M40 48L36 40H44L40 48Z" fill="#d4af37" />
                <path d="M16 24L24 20V28L16 24Z" fill="#d4af37" />
                <path d="M16 40L24 36V44L16 40Z" fill="#d4af37" />
                <path d="M48 24L40 28V20L48 24Z" fill="#d4af37" />
                <path d="M48 40L40 44V36L48 40Z" fill="#d4af37" />
                <circle cx="32" cy="32" r="6" fill="#8b5d3b" />
                <circle cx="32" cy="32" r="3" fill="#d4af37" />
              </svg>
            </div>
          </div>

          {/* Main content with padding to accommodate the border */}
          <div className="py-6 px-8">
            {/* Elaborate decorative element above title */}
            <div className="flex justify-center">
              <svg width="240" height="40" viewBox="0 0 240 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M120 4L124 12H116L120 4Z" fill="#8b5d3b" />
                <path d="M120 36L116 28H124L120 36Z" fill="#8b5d3b" />
                <path d="M104 20L112 16V24L104 20Z" fill="#8b5d3b" />
                <path d="M136 20L128 24V16L136 20Z" fill="#8b5d3b" />

                <path d="M88 20L96 16V24L88 20Z" fill="#d4af37" />
                <path d="M152 20L144 24V16L152 20Z" fill="#d4af37" />

                <path d="M72 20L80 16V24L72 20Z" fill="#8b5d3b" />
                <path d="M168 20L160 24V16L168 20Z" fill="#8b5d3b" />

                <path d="M56 20L64 16V24L56 20Z" fill="#d4af37" />
                <path d="M184 20L176 24V16L184 20Z" fill="#d4af37" />

                <path d="M40 20L48 16V24L40 20Z" fill="#8b5d3b" />
                <path d="M200 20L192 24V16L200 20Z" fill="#8b5d3b" />

                <path d="M24 20L32 16V24L24 20Z" fill="#d4af37" />
                <path d="M216 20L208 24V16L216 20Z" fill="#d4af37" />

                <path d="M8 20L16 16V24L8 20Z" fill="#8b5d3b" />
                <path d="M232 20L224 24V16L232 20Z" fill="#8b5d3b" />

                <circle cx="120" cy="20" r="8" fill="#8b5d3b" />
                <circle cx="120" cy="20" r="4" fill="#d4af37" />

                {/* Connecting lines */}
                <path d="M0 20H8" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M16 20H24" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M32 20H40" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M48 20H56" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M64 20H72" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M80 20H88" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M96 20H104" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M136 20H144" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M152 20H160" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M168 20H176" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M184 20H192" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M200 20H208" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M216 20H224" stroke="#8b5d3b" strokeWidth="1" />
                <path d="M232 20H240" stroke="#8b5d3b" strokeWidth="1" />
              </svg>
            </div>

            {/* Premium title with enhanced typography - UPDATED FONT */}
            <h1 className="text-center font-cinzel text-[44px] text-[#8b5d3b] tracking-wider leading-tight relative mb-6">
              <span className="relative inline-block">
                {/* Ornate underline */}
                <span className="absolute -bottom-3 left-0 right-0 h-[2px]">
                  <svg
                    width="100%"
                    height="2"
                    viewBox="0 0 100 2"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5d3b" stopOpacity="0" />
                      <stop offset="15%" stopColor="#8b5d3b" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#d4af37" stopOpacity="1" />
                      <stop offset="85%" stopColor="#8b5d3b" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#8b5d3b" stopOpacity="0" />
                    </linearGradient>
                    <rect width="100%" height="2" fill="url(#titleGradient)" />
                  </svg>
                </span>
                {title}
              </span>
            </h1>

            {/* Enhanced subtitle with traditional styling - UPDATED FONT */}
            {subtitle && (
              <div className="relative max-w-2xl mx-auto mt-4 mb-6">
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
                  <svg width="40" height="2" viewBox="0 0 40 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="2" fill="url(#subtitleGradientLeft)" />
                    <linearGradient id="subtitleGradientLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5d3b" stopOpacity="0" />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity="0.8" />
                    </linearGradient>
                  </svg>
                </div>
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
                  <svg width="40" height="2" viewBox="0 0 40 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="2" fill="url(#subtitleGradientRight)" />
                    <linearGradient id="subtitleGradientRight" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d4af37" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#8b5d3b" stopOpacity="0" />
                    </linearGradient>
                  </svg>
                </div>
                <p className="text-center text-[#8b5d3b]/90 font-eb-garamond text-lg tracking-wide px-16">{subtitle}</p>
              </div>
            )}

            {/* Elaborate decorative element below subtitle */}
            <div className="flex justify-center mt-6">
              <svg width="180" height="24" viewBox="0 0 180 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 12H180" stroke="#8b5d3b" strokeWidth="0.5" strokeDasharray="1 3" />
                <circle cx="90" cy="12" r="4" fill="#8b5d3b" />
                <circle cx="90" cy="12" r="2" fill="#d4af37" />
                <circle cx="30" cy="12" r="3" fill="#8b5d3b" />
                <circle cx="30" cy="12" r="1.5" fill="#d4af37" />
                <circle cx="150" cy="12" r="3" fill="#8b5d3b" />
                <circle cx="150" cy="12" r="1.5" fill="#d4af37" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionHeader
