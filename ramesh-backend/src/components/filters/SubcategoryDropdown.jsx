"use client"

import { useState, useMemo } from "react"
import { Check, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

const SubcategoryDropdown = ({
  subcategories,
  selectedSubcategory,
  selectedCategory,
  onSelectSubcategory,
  loading = false,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)

  // Filter subcategories based on selected category and search term
  const filteredSubcategories = useMemo(() => {
    if (!subcategories || subcategories.length === 0) return []

    // Filter by search term
    if (searchTerm.trim()) {
      return subcategories.filter((sub) => sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    return subcategories
  }, [subcategories, searchTerm])

  // Get the name of the selected subcategory
  const selectedSubcategoryName = useMemo(() => {
    if (!selectedSubcategory) return "All Subcategories"
    const subcategory = subcategories?.find((s) => s.id.toString() === selectedSubcategory)
    return subcategory ? subcategory.name : "All Subcategories"
  }, [selectedSubcategory, subcategories])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between" role="combobox" disabled={loading || disabled}>
          {loading ? <Skeleton className="h-4 w-24" /> : selectedSubcategoryName}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-3">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search subcategories..."
              className="pl-8 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[300px] border-t">
          <div className="p-1">
            <Button
              variant={!selectedSubcategory ? "default" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => {
                onSelectSubcategory("")
                setOpen(false)
              }}
            >
              {!selectedSubcategory && <Check className="mr-2 h-4 w-4" />}
              All Subcategories
            </Button>

            {loading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                {filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map((subcategory) => (
                    <Button
                      key={subcategory.id}
                      variant={selectedSubcategory === subcategory.id.toString() ? "default" : "ghost"}
                      className="w-full justify-start mb-1"
                      onClick={() => {
                        onSelectSubcategory(subcategory.id.toString())
                        setOpen(false)
                      }}
                    >
                      {selectedSubcategory === subcategory.id.toString() && <Check className="mr-2 h-4 w-4" />}
                      {subcategory.name}
                    </Button>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-gray-500">
                    {searchTerm
                      ? "No subcategories found"
                      : disabled
                        ? "Please select a category first"
                        : "No subcategories available"}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export default SubcategoryDropdown
