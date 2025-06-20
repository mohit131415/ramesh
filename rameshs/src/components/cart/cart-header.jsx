import { ShoppingCart } from "lucide-react"
import { HeritageHeaderDecorationFull } from "../ui/heritage-decorations"

export default function CartHeader({ title, description, itemCount, totals }) {
  const formatRupees = (amount) => {
    if (!amount || amount === "0" || amount === "0.00") return "₹0"
    const numAmount = Number.parseFloat(amount)
    if (numAmount === 0) return "₹0"
    return `₹${numAmount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const totalSavings = totals?.total_discount_amount || 0

  return (
    <div className="container mx-auto px-4 mb-12">
      <div className="relative py-10 px-6 md:px-12 bg-gradient-to-b from-cream/80 to-cream/30 rounded-lg border border-gold/10 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23997b3d' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/40 rounded-tl-md"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-gold/40 rounded-tr-md"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-gold/40 rounded-bl-md"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/40 rounded-br-md"></div>

        {/* Cart icon with circle */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 blur-sm"></div>
            <div className="relative flex items-center justify-center w-16 h-16 bg-cream rounded-full border border-gold/30">
              <ShoppingCart className="h-8 w-8 text-gold" />
              {itemCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-gold text-white text-xs font-medium rounded-full">
                  {itemCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header text */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gold-dark mb-3">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}

          {/* Savings Display */}
          {totalSavings > 0 && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-semibold text-sm">
                  Total Saved: <span className="font-bold">{formatRupees(totalSavings)}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="mt-6">
          <HeritageHeaderDecorationFull />
        </div>

        {/* Side decorations - unique to cart header */}
        <div className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center gap-3">
            <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-gold/40 to-transparent"></div>
            <div className="text-gold/60 rotate-45">❖</div>
            <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-gold/40 to-transparent"></div>
          </div>
        </div>

        <div className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center gap-3">
            <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-gold/40 to-transparent"></div>
            <div className="text-gold/60 rotate-45">❖</div>
            <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-gold/40 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
