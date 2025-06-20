/**
 * A reusable heritage-styled section header component
 *
 * @param {Object} props
 * @param {string} props.title - The main title text
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {string} [props.topSymbol="◆"] - Symbol for the top decorative line
 * @param {string} [props.bottomSymbol="★"] - Symbol for the bottom decorative line
 * @param {string} [props.preTitle] - Optional text to display above the main title
 * @param {string} [props.className] - Additional CSS classes
 */
export default function HeritageSectionHeader({
  title,
  subtitle,
  topSymbol = "◆",
  bottomSymbol = "★",
  preTitle = "PREMIUM SELECTION",
  className = "",
}) {
  return (
    <div className={`text-center relative z-10 mb-8 ${className}`}>
      <div className="inline-block relative px-12 py-4">
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center">
          <div className="h-px w-16 bg-gold/80"></div>
          <div className="mx-3 text-gold">{topSymbol}</div>
          <div className="h-px w-16 bg-gold/80"></div>
        </div>

        {/* Title Text */}
        <div className="my-4">
          {preTitle && (
            <span className="uppercase text-gold-dark/80 text-xs tracking-[0.2em] font-medium mb-1 block">
              {preTitle}
            </span>
          )}
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-gray-900 tracking-wide">{title}</h2>

          {subtitle && <p className="mt-2 max-w-2xl mx-auto text-base text-gray-700 font-eb-garamond">{subtitle}</p>}
        </div>

        {/* Bottom Decorative Line */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
          <div className="h-px w-16 bg-gold/80"></div>
          <div className="mx-3 text-gold">{bottomSymbol}</div>
          <div className="h-px w-16 bg-gold/80"></div>
        </div>
      </div>
    </div>
  )
}

