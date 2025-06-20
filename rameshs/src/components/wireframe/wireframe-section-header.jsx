function WireframeSectionHeader({ title = "Section Title", className = "" }) {
  return (
    <div className={`text-center mb-6 sm:mb-8 md:mb-10 ${className}`}>
      <div className="flex items-center justify-center gap-3 sm:gap-3 md:gap-4 overflow-hidden">
        {/* Heritage Decorative Element - Left */}
        {/* <svg
          width="28"
          height="18"
          viewBox="0 0 36 24"
          fill="none"
          className="text-[#78383b] w-7 h-5 sm:w-8 sm:h-5 md:w-9 md:h-6 flex-shrink-0"
        >
          <path
            d="M1 12H8M8 12C8 8.5 10.5 6 14 6C17.5 6 20 8.5 20 12C20 15.5 17.5 18 14 18C10.5 18 8 15.5 8 12ZM20 12H27"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M29 6C29 6 31 8.5 31 12C31 15.5 29 18 29 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M34 4C34 4 36 7.5 36 12C36 16.5 34 20 34 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="14" cy="12" r="2" fill="currentColor" />
        </svg> */}

        <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#78383b] font-cinzel tracking-wide whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
          {title}
        </h2>

        {/* Heritage Decorative Element - Right */}
        <svg
          width="28"
          height="18"
          viewBox="0 0 36 24"
          fill="none"
          className="text-[#78383b] w-7 h-5 sm:w-8 sm:h-5 md:w-9 md:h-6 flex-shrink-0"
        >
          <path
            d="M35 12H28M28 12C28 8.5 25.5 6 22 6C18.5 6 16 8.5 16 12C16 15.5 18.5 18 22 18C25.5 18 28 15.5 28 12ZM16 12H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M7 6C7 6 5 8.5 5 12C5 15.5 7 18 7 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M2 4C2 4 0 7.5 0 12C0 16.5 2 20 2 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="22" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}

// Change to named export
export { WireframeSectionHeader }
