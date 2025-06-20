"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { AlertCircle, RefreshCw, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { toast } from "react-toastify"
import featuredItemService from "../../../services/featuredItemService"

const SettingsTab = () => {
  const [limits, setLimits] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [formValues, setFormValues] = useState({
    featured_product: "1",
    featured_category: "1",
    quick_pick: "1",
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  // Fetch limits directly in the component
  const fetchLimits = async () => {
    try {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage("")

      const response = await featuredItemService.getLimits()

      if (response.status === "success" && response.data) {
        setLimits(response.data)

        // Update form values with fetched limits
        setFormValues({
          featured_product: response.data.featured_product.toString(),
          featured_category: response.data.featured_category.toString(),
          quick_pick: response.data.quick_pick.toString(),
        })
      } else {
        throw new Error(response.message || "Failed to fetch limits")
      }
    } catch (error) {
      console.error("SettingsTab: Error fetching limits:", error)
      setHasError(true)
      setErrorMessage(error.message || "Failed to fetch featured item limits")
      toast.error(error.message || "Failed to fetch featured item limits")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch limits on component mount
  useEffect(() => {
    fetchLimits()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    // Only allow numeric values
    if (value === "" || /^\d+$/.test(value)) {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }))

      // Clear error for this field if it exists
      if (formErrors[name]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: null,
        }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    Object.entries(formValues).forEach(([key, value]) => {
      if (value === "" || isNaN(Number.parseInt(value, 10)) || Number.parseInt(value, 10) < 1) {
        newErrors[key] = "Value must be a positive number"
      }
    })

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    if (!validateForm()) {
      toast.error("Please enter valid positive numbers for all limits")
      return
    }

    setIsSaving(true)

    try {
      // Convert string values to numbers
      const newLimits = {
        featured_product: Number.parseInt(formValues.featured_product, 10),
        featured_category: Number.parseInt(formValues.featured_category, 10),
        quick_pick: Number.parseInt(formValues.quick_pick, 10),
      }

      const response = await featuredItemService.updateLimits(newLimits)

      if (response && response.status === "success") {
        setLimits(newLimits)
        toast.success(response.message || "Featured item limits updated successfully")

        // Refresh the page after successful update
        setTimeout(() => {
          window.location.reload()
        }, 1500) // 1.5 second delay to show the success toast
      } else {
        throw new Error(response?.message || "Failed to update limits")
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage(error.message || "Failed to update limits")
      toast.error(error.message || "Failed to update limits")
    } finally {
      setIsSaving(false)
    }
  }

  if (hasError) {
    return (
      <Card className="shadow-sm border-muted">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {errorMessage || "Failed to load featured item limits"}
            </p>
            <Button onClick={fetchLimits} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm border-muted">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="bg-muted/10 pb-2">
        <CardTitle className="text-xl font-semibold">Featured Items Settings</CardTitle>
        <CardDescription>Set the maximum number of items that can be featured in each section.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="featured_product" className="font-medium">
                Featured Products Limit
              </Label>
              <div className="relative">
                <Input
                  id="featured_product"
                  name="featured_product"
                  type="number"
                  min="1"
                  value={formValues.featured_product}
                  onChange={handleChange}
                  className={`w-full ${formErrors.featured_product ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Enter limit"
                />
                {formErrors.featured_product && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.featured_product}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum number of products that can be featured on the homepage
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="featured_category" className="font-medium">
                Featured Categories Limit
              </Label>
              <div className="relative">
                <Input
                  id="featured_category"
                  name="featured_category"
                  type="number"
                  min="1"
                  value={formValues.featured_category}
                  onChange={handleChange}
                  className={`w-full ${formErrors.featured_category ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Enter limit"
                />
                {formErrors.featured_category && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.featured_category}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum number of categories that can be featured on the homepage
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quick_pick" className="font-medium">
                Quick Picks Limit
              </Label>
              <div className="relative">
                <Input
                  id="quick_pick"
                  name="quick_pick"
                  type="number"
                  min="1"
                  value={formValues.quick_pick}
                  onChange={handleChange}
                  className={`w-full ${formErrors.quick_pick ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Enter limit"
                />
                {formErrors.quick_pick && <p className="text-xs text-red-500 mt-1">{formErrors.quick_pick}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum number of products that can be added to quick picks section
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isSaving}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default SettingsTab
