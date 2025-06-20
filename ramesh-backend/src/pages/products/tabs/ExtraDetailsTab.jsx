"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "../../../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoCircledIcon } from "@radix-ui/react-icons"

const ExtraDetailsTab = ({ formData, onChange, errors }) => {
  // Get the user from AuthContext
  const { user } = useAuth()

  // Check if user is super_admin - using the correct role name with underscore
  const isSuperAdmin = user?.role === "super_admin"

  return (
    <div className="space-y-6">
      {/* Storage Instructions Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Storage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              id="storage_instructions"
              value={formData.storage_instructions || ""}
              onChange={(e) => onChange("storage_instructions", e.target.value)}
              placeholder="Enter storage instructions for this product"
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Provide clear instructions on how to store this product to maintain freshness and quality.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Information - only visible to super_admin */}
      {isSuperAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center">
              SEO Information
              <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Super Admin Only
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={formData.meta_title || ""}
                onChange={(e) => onChange("meta_title", e.target.value)}
                placeholder="Enter meta title for SEO"
              />
              <p className="text-xs text-muted-foreground">Recommended length: 50-60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description || ""}
                onChange={(e) => onChange("meta_description", e.target.value)}
                placeholder="Enter meta description for SEO"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">Recommended length: 150-160 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_keywords">Meta Keywords</Label>
              <Input
                id="meta_keywords"
                value={formData.meta_keywords || ""}
                onChange={(e) => onChange("meta_keywords", e.target.value)}
                placeholder="Enter meta keywords (comma separated)"
              />
            </div>

            <div className="flex items-start gap-3 rounded-md border p-3 bg-amber-50 border-amber-200">
              <InfoCircledIcon className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">SEO Best Practices</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Adding relevant SEO information helps improve your product's visibility in search engines. Use
                  keywords that accurately describe your product and avoid keyword stuffing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ExtraDetailsTab
