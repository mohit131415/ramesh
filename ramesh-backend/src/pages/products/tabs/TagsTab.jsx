"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, TagIcon, Plus } from "lucide-react"
import productService from "../../../services/productService"
import { toast } from "react-toastify"
import { useDebounce } from "@/hooks/usedebounce"
import { cn } from "@/lib/utils"

const TagsTab = ({ tags, onChange }) => {
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [allTags, setAllTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const inputRef = useRef(null)

  // Get product ID from URL
  const currentProductId = window.location.pathname.split("/")[2]

  // Debounce search term
  const debouncedSearchTerm = useDebounce(inputValue, 300)

  // Function to load all available tags
  const loadAllTags = useCallback(async () => {
    setLoading(true)
    try {
      const response = await productService.getTagSuggestions()
      if (response.status === "success") {
        setAllTags(response.data || [])
      } else {
        toast.error("Failed to load available tags")
      }
    } catch (error) {
      console.error("Error loading available tags:", error)
      toast.error("Error loading available tags")
    } finally {
      setLoading(false)
    }
  }, [])

  // Load all tags on mount
  useEffect(() => {
    loadAllTags()
  }, [loadAllTags])

  // Filter tags based on input
  useEffect(() => {
    if (showSuggestions) {
      setLoading(true)
      // If there's a search term, use it to filter tags
      // Otherwise, show all available tags
      productService
        .getTagSuggestions(debouncedSearchTerm)
        .then((response) => {
          if (response.status === "success") {
            setFilteredTags(response.data || [])
          } else {
            setFilteredTags([])
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error searching tags:", error)
          setFilteredTags([])
          setLoading(false)
        })
    } else {
      setFilteredTags([])
    }
  }, [debouncedSearchTerm, showSuggestions])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add a tag to the product (locally)
  const addTag = (tag) => {
    // Check if tag is already added
    if (tags.some((t) => t.id === tag.id)) {
      toast.info("This tag is already added to the product")
      return
    }

    // Add tag locally
    onChange([...tags, tag])
    setInputValue("")
    setFilteredTags([])
    setShowSuggestions(false)
  }

  // Handle adding a tag (either existing or new)
  const handleAddTag = () => {
    if (!inputValue.trim()) return

    // Check if tag with same name already exists (case-insensitive)
    const existingTag = allTags.find((tag) => tag.name.toLowerCase() === inputValue.trim().toLowerCase())

    if (existingTag) {
      // If tag exists, use the existing tag instead of creating a new one
      console.log("Found existing tag:", existingTag.name)
      addTag(existingTag)
      toast.info(`Added existing tag: ${existingTag.name}`)
    } else {
      // Only create a new tag if no match exists
      const tempTag = {
        id: `temp-${Date.now()}`,
        name: inputValue.trim(),
        isTemp: true, // Mark as temporary
      }

      // Add to local state
      onChange([...tags, tempTag])

      // Also add to all tags for future filtering
      setAllTags((prev) => [...prev, tempTag])
      toast.success(`Created new tag: ${tempTag.name}`)
    }

    // Reset input and hide suggestions
    setInputValue("")
    setShowSuggestions(false)
  }

  // Remove a tag from the product (locally)
  const removeTag = (tagId) => {
    onChange(tags.filter((tag) => tag.id !== tagId))
  }

  // Select a tag from suggestions
  const selectTag = (tag) => {
    // Always use the existing tag when selected from suggestions
    addTag(tag)
    toast.info(`Added existing tag: ${tag.name}`)
  }

  return (
    <div className="space-y-6">
      {/* Display selected tags */}
      <Card className="shadow-md border border-ramesh-gold/20">
        <CardHeader className="pb-3 bg-gradient-to-r from-ramesh-gold/10 to-white">
          <CardTitle className="text-lg font-medium flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-ramesh-gold" />
            Selected Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 custom-scrollbar max-h-[200px] overflow-y-auto p-1">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-ramesh-gold/10 flex items-center",
                    tag.isTemp
                      ? "bg-ramesh-gold/10 text-ramesh-gold border border-ramesh-gold/20"
                      : "bg-gray-100 text-gray-700 border border-gray-200",
                  )}
                >
                  <TagIcon className="h-3 w-3 mr-1.5" />
                  <span>{tag.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 ml-1.5 rounded-full hover:bg-red-50 hover:text-red-500"
                    onClick={() => removeTag(tag.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag.name}</span>
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center bg-ramesh-gold/5 rounded-md border border-dashed border-ramesh-gold/20">
              <TagIcon className="h-10 w-10 text-ramesh-gold mb-2" />
              <p className="text-ramesh-gold text-sm">No tags added yet</p>
              <p className="text-ramesh-gold/70 text-xs mt-1">Add tags using the field below</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Combined search and create tag interface */}
      <Card className="shadow-md border border-ramesh-gold/20">
        <CardHeader className="pb-3 bg-gradient-to-r from-ramesh-gold/10 to-white">
          <CardTitle className="text-lg font-medium flex items-center">
            <Plus className="h-5 w-5 mr-2 text-ramesh-gold" />
            Add Tag
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <TagIcon className="h-4 w-4" />
                </div>
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search or create new tag..."
                  className="pl-10 pr-10 border-ramesh-gold/20 focus:border-ramesh-gold focus:ring-1 focus:ring-ramesh-gold"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                {inputValue ? (
                  <Button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInputValue("")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${showSuggestions ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </Button>
                )}
              </div>
              <Button
                onClick={handleAddTag}
                disabled={!inputValue.trim()}
                className="bg-ramesh-gold hover:bg-ramesh-gold/80 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                style={{ maxHeight: "250px" }}
              >
                {loading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ramesh-gold"></div>
                  </div>
                ) : filteredTags.length > 0 ? (
                  <div className="custom-scrollbar overflow-y-auto" style={{ maxHeight: "250px" }}>
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-ramesh-gold/5 flex items-center justify-between border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        onClick={() => selectTag(tag)}
                      >
                        <div className="flex items-center">
                          <TagIcon className="h-3.5 w-3.5 mr-2 text-ramesh-gold" />
                          <span className="font-medium">{tag.name}</span>
                        </div>
                        {tag.usage_count > 0 && (
                          <span className="text-xs bg-ramesh-gold/10 text-ramesh-gold rounded-full px-2 py-0.5 ml-2 flex items-center">
                            <span className="mr-1">Used</span>
                            <span className="font-semibold">{tag.usage_count}</span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : inputValue ? (
                  <div
                    className="p-3 text-sm text-gray-500 hover:bg-ramesh-gold/5 cursor-pointer transition-colors duration-150"
                    onClick={() => handleAddTag()}
                  >
                    <div className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-ramesh-gold" />
                      <span>
                        Create new tag: <span className="font-semibold text-ramesh-gold">"{inputValue}"</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Type to search or select from popular tags</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">Type to search existing tags or create a new one</p>
        </CardContent>
      </Card>

      <div className="bg-ramesh-gold/5 p-4 rounded-lg border border-ramesh-gold/20 shadow-sm">
        <h3 className="text-sm font-medium text-ramesh-gold mb-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          About Tags
        </h3>
        <p className="text-sm text-ramesh-gold/80">
          Tags help categorize your products and make them easier to find. Search for existing tags or create new ones.
          <span className="block mt-1">Numbers shown next to tags indicate how many products use that tag.</span>
        </p>
      </div>
    </div>
  )
}

export default TagsTab
