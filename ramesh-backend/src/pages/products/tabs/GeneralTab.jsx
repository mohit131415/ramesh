"use client"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategory } from "../../../contexts/CategoryContext"
import { useSubcategory } from "../../../contexts/SubcategoryContext"
import { Search, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../../../services/api"
import { Card, CardContent } from "@/components/ui/card"
import "./scrollbar.css"

const GeneralTab = ({ formData, onChange, errors, isEdit = false }) => {
  const { getCategories } = useCategory()
  const { getSubcategoriesByCategory } = useSubcategory()
  const [subcategories, setSubcategories] = useState([])
  const [filteredSubcategories, setFilteredSubcategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [filteredCategories, setFilteredCategories] = useState([])
  const [categorySearch, setCategorySearch] = useState("")
  const [subcategorySearch, setSubcategorySearch] = useState("")
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [isSubcategorySelectOpen, setIsSubcategorySelectOpen] = useState(false)
  const navigate = useNavigate()
  const selectRef = useRef(null)
  const subcategorySelectRef = useRef(null)
  const [categoriesData, setCategoriesData] = useState([])

  // Load categories on mount
  useEffect(() => {
    loadAllCategories()
  }, [])

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (formData.category_id) {
        setLoading(true)
        try {
          const data = await getSubcategoriesByCategory(formData.category_id)
          setSubcategories(data)
          setFilteredSubcategories(data)
        } catch (error) {
          console.error("Error loading subcategories:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setSubcategories([])
        setFilteredSubcategories([])
      }
    }

    loadSubcategories()
  }, [formData.category_id])

  // Filter subcategories when search changes
  useEffect(() => {
    if (subcategories.length > 0) {
      const filtered = subcategories.filter((subcategory) =>
        subcategory.name.toLowerCase().includes(subcategorySearch.toLowerCase()),
      )
      setFilteredSubcategories(filtered)
    }
  }, [subcategorySearch, subcategories])

  // Load all categories from all pages
  const loadAllCategories = async () => {
    try {
      let allCategories = []
      let currentPage = 1
      let hasMorePages = true

      while (hasMorePages) {
        const params = new URLSearchParams({
          page: currentPage,
          status: "active",
          include_subcategories: true,
          expand_all: "true",
        })

        const response = await api.get(`/categories/tree?${params.toString()}`)

        if (response.data?.status === "success") {
          const categories = response.data.data || []
          allCategories = [...allCategories, ...categories]

          // Check if there are more pages
          if (response.data.meta && response.data.meta.current_page < response.data.meta.total_pages) {
            currentPage++
          } else {
            hasMorePages = false
          }
        } else {
          hasMorePages = false
        }
      }

      // Store full category data for is_takeaway logic
      setCategoriesData(allCategories)

      // Filter out categories with zero subcategories for display
      const categoriesWithSubcategories = allCategories.filter((category) => category.subcategories_count > 0)
      setFilteredCategories(categoriesWithSubcategories)
    } catch (error) {
      console.error("Error loading all categories:", error)
    }
  }

  // Filter categories based on search
  const handleCategorySearch = (e) => {
    const searchTerm = e.target.value
    setCategorySearch(searchTerm)
  }

  // Filter subcategories based on search
  const handleSubcategorySearch = (e) => {
    const searchTerm = e.target.value
    setSubcategorySearch(searchTerm)
  }

  // Navigate to create category page
  const handleAddCategory = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSelectOpen(false)
    navigate("/categories/create")
  }

  // Navigate to create subcategory page
  const handleAddSubcategory = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSubcategorySelectOpen(false)
    navigate("/subcategories/create", {
      state: { preselectedCategory: formData.category_id },
    })
  }

  // Handle click outside to close select
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsSelectOpen(false)
      }
      if (subcategorySelectRef.current && !subcategorySelectRef.current.contains(event.target)) {
        setIsSubcategorySelectOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Auto-select product type based on category's is_takeaway property (only when adding)
  useEffect(() => {
    if (!isEdit && formData.category_id && categoriesData.length > 0) {
      const selectedCategory = categoriesData.find((cat) => cat.id.toString() === formData.category_id)
      if (selectedCategory && selectedCategory.is_takeaway === 1) {
        // Auto-select takeaway if category is marked as takeaway
        if (formData.product_type !== "takeaway") {
          onChange("product_type", "takeaway")
        }
      }
    }
  }, [formData.category_id, categoriesData, isEdit, onChange])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Enter product name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => onChange("status", value)}>
                <SelectTrigger id="status" className="bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2" ref={selectRef}>
              <Label htmlFor="category_id">
                Category <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left border rounded-md shadow-sm bg-white ${
                    errors.category_id ? "border-red-500" : "border-gray-300"
                  } ${isSelectOpen ? "ring-2 ring-ramesh-gold ring-opacity-50" : ""}`}
                >
                  <span className="block truncate">
                    {formData.category_id
                      ? filteredCategories.find((c) => c.id.toString() === formData.category_id)?.name ||
                        "Select category"
                      : "Select category"}
                  </span>
                  <span className="pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {isSelectOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 flex flex-col max-h-60">
                    <div className="sticky top-0 bg-white p-2 border-b flex-shrink-0">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                          value={categorySearch}
                          onChange={handleCategorySearch}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <ul className="py-1 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {filteredCategories
                        .filter((category) => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
                        .map((category) => (
                          <li
                            key={category.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              onChange("category_id", category.id.toString())
                              onChange("subcategory_id", "")
                              setIsSelectOpen(false)
                            }}
                          >
                            <div className="flex items-center">
                              <span className={formData.category_id === category.id.toString() ? "font-medium" : ""}>
                                {category.name}
                              </span>
                            </div>
                          </li>
                        ))}

                      {filteredCategories.filter((category) =>
                        category.name.toLowerCase().includes(categorySearch.toLowerCase()),
                      ).length === 0 && <li className="px-3 py-2 text-gray-500 text-sm">No categories found</li>}
                    </ul>

                    <div className="sticky bottom-0 border-t p-2 bg-white flex-shrink-0">
                      <button
                        className="w-full flex items-center justify-center px-3 py-2 bg-ramesh-gold text-white rounded-md text-sm hover:bg-ramesh-gold/90"
                        onClick={handleAddCategory}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New Category
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id}</p>}
            </div>

            <div className="space-y-2" ref={subcategorySelectRef}>
              <Label htmlFor="subcategory_id">
                Subcategory <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    formData.category_id && !loading ? setIsSubcategorySelectOpen(!isSubcategorySelectOpen) : null
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 text-left border rounded-md shadow-sm bg-white ${
                    errors.subcategory_id ? "border-red-500" : "border-gray-300"
                  } ${isSubcategorySelectOpen ? "ring-2 ring-ramesh-gold ring-opacity-50" : ""}`}
                  disabled={!formData.category_id || loading}
                >
                  <span className="block truncate">
                    {formData.subcategory_id
                      ? subcategories.find((s) => s.id.toString() === formData.subcategory_id)?.name ||
                        "Select subcategory"
                      : loading
                        ? "Loading..."
                        : "Select subcategory"}
                  </span>
                  <span className="pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {isSubcategorySelectOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 flex flex-col max-h-60">
                    <div className="sticky top-0 bg-white p-2 border-b flex-shrink-0">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search subcategories..."
                          className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ramesh-gold focus:border-transparent"
                          value={subcategorySearch}
                          onChange={handleSubcategorySearch}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <ul className="py-1 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {filteredSubcategories.map((subcategory) => (
                        <li
                          key={subcategory.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            onChange("subcategory_id", subcategory.id.toString())
                            setIsSubcategorySelectOpen(false)
                          }}
                        >
                          <span className={formData.subcategory_id === subcategory.id.toString() ? "font-medium" : ""}>
                            {subcategory.name}
                          </span>
                        </li>
                      ))}

                      {filteredSubcategories.length === 0 && (
                        <li className="px-3 py-2 text-gray-500 text-sm">No subcategories found</li>
                      )}
                    </ul>

                    <div className="sticky bottom-0 border-t p-2 bg-white flex-shrink-0">
                      <button
                        className="w-full flex items-center justify-center px-3 py-2 bg-ramesh-gold text-white rounded-md text-sm hover:bg-ramesh-gold/90"
                        onClick={handleAddSubcategory}
                        disabled={!formData.category_id}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New Subcategory
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {errors.subcategory_id && <p className="text-red-500 text-sm">{errors.subcategory_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="product_type">
                Product Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.product_type} onValueChange={(value) => onChange("product_type", value)}>
                <SelectTrigger id="product_type" className={errors.product_type ? "border-red-500" : "bg-white"}>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (Available Everywhere)</SelectItem>
                  <SelectItem value="local">Local (Location Specific)</SelectItem>
                  <SelectItem value="takeaway">Takeaway Only</SelectItem>
                </SelectContent>
              </Select>
              {errors.product_type && <p className="text-red-500 text-sm">{errors.product_type}</p>}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={5}
              className="bg-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeneralTab
