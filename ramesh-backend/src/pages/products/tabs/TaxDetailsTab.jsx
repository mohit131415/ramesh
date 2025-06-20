"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const TaxDetailsTab = ({ formData, onChange, errors }) => {
  const { toast } = useToast()

  const calculateGST = (taxRate) => {
    const rate = Number.parseFloat(taxRate) || 0
    const cgst = rate / 2
    const sgst = rate / 2
    const igst = rate
    return { cgst, sgst, igst }
  }

  const handleHsnChange = (e) => {
    const value = e.target.value
    // Only allow numbers and limit to 8 digits
    if (value === "" || /^\d{0,8}$/.test(value)) {
      onChange("hsn_code", value)
    } else {
      if (value.length > 8) {
        toast({
          title: "Input Error",
          description: "HSN code cannot exceed 8 digits",
          variant: "destructive",
        })
      } else if (!/^\d*$/.test(value)) {
        toast({
          title: "Input Error",
          description: "HSN code must contain only numbers",
          variant: "destructive",
        })
      }
    }
  }

  const handleTaxRateChange = (e) => {
    const value = e.target.value
    // Ensure tax rate is not greater than 28%
    if (value === "" || (Number.parseFloat(value) >= 0 && Number.parseFloat(value) <= 28)) {
      onChange("tax_rate", value)
    } else {
      toast({
        title: "Input Error",
        description: "GST rate cannot exceed 28%",
        variant: "destructive",
      })
    }
  }

  const { cgst, sgst, igst } = calculateGST(formData.tax_rate)

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-8">
          {/* Main Tax Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="hsn_code" className="text-base font-semibold text-gray-800">
                HSN Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="hsn_code"
                value={formData.hsn_code || ""}
                onChange={handleHsnChange}
                placeholder="Enter HSN code (8 digits max)"
                className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm transition-all ${
                  errors.hsn_code ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-ramesh-gold/50"
                }`}
                required
              />
              {errors?.hsn_code && <p className="text-sm text-red-500 mt-1">{errors.hsn_code}</p>}
              <p className="text-xs text-gray-500 italic">
                Harmonized System of Nomenclature code for tax classification (8 digits max)
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="tax_rate" className="text-base font-semibold text-gray-800">
                GST Rate (%)
              </Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="28"
                value={formData.tax_rate}
                onChange={handleTaxRateChange}
                placeholder="Enter tax rate (max 28%)"
                className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent shadow-sm transition-all ${
                  errors?.tax_rate ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-ramesh-gold/50"
                }`}
              />
              {errors?.tax_rate && <p className="text-sm text-red-500 mt-1">{errors.tax_rate}</p>}
              <p className="text-xs text-gray-500 italic">Maximum GST rate allowed is 28%</p>
            </div>
          </div>

          {/* GST Breakdown */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-base font-semibold text-gray-700 mb-4">GST Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cgst_rate" className="text-sm font-medium text-gray-600">
                  CGST Rate (%)
                </Label>
                <div className="relative">
                  <Input
                    id="cgst_rate"
                    type="number"
                    step="0.01"
                    value={cgst.toFixed(2)}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sgst_rate" className="text-sm font-medium text-gray-600">
                  SGST Rate (%)
                </Label>
                <div className="relative">
                  <Input
                    id="sgst_rate"
                    type="number"
                    step="0.01"
                    value={sgst.toFixed(2)}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="igst_rate" className="text-sm font-medium text-gray-600">
                  IGST Rate (%)
                </Label>
                <div className="relative">
                  <Input
                    id="igst_rate"
                    type="number"
                    step="0.01"
                    value={igst.toFixed(2)}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-800 mb-1">Tax Information</h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Enter the HSN code and tax rate for this product. The CGST, SGST, and IGST rates will be automatically
                  calculated based on the tax rate. HSN codes are mandatory for GST compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaxDetailsTab
