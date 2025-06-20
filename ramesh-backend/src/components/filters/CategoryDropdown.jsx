"use client"

import { useState, useMemo } from "react"
import { Check, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const CategoryDropdown = ({ categories, selectedCategory, onSelectCategory, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)

  // Filter categories based on search term and only include those with subcategories
  const filteredCategories = useMemo(() => {
    if (!categories) return []

    // Filter categories to only include those with at least one subcategory
    const categoriesWithSubcategories = categories.filter(
      (category) => category.subcategories_count > 0 || (category.subcategories && category.subcategories.length > 0),
    )

    if (!searchTerm.trim()) return categoriesWithSubcategories

    return categoriesWithSubcategories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [categories, searchTerm])

  // Get the name of the selected category
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return "All Categories"
    const category = categories?.find((c) => c.id.toString() === selectedCategory)
    return category ? category.name : "All Categories"
  }, [selectedCategory, categories])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between" role="combobox">
          {loading ? <Skeleton className="h-4 w-24" /> : selectedCategoryName}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-3">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
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
              variant={!selectedCategory ? "default" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => {
                onSelectCategory("")
                setOpen(false)
              }}
            >
              {!selectedCategory && <Check className="mr-2 h-4 w-4" />}
              All Categories
            </Button>

            {loading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                {filteredCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id.toString() ? "default" : "ghost"}
                    className="w-full justify-start mb-1"
                    onClick={() => {
                      onSelectCategory(category.id.toString())
                      setOpen(false)
                    }}
                  >
                    {selectedCategory === category.id.toString() && <Check className="mr-2 h-4 w-4" />}
                    <div className="flex items-center justify-between w-full">
                      <span>{category.name}</span>
                      {(category.subcategories_count > 0 ||
                        (category.subcategories && category.subcategories.length > 0)) && (
                        <Badge variant="outline" className="ml-2 bg-gray-100 text-xs">
                          {category.subcategories_count || category.subcategories.length}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    {searchTerm ? "No categories found" : "No categories with subcategories"}
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

export default CategoryDropdown
