"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Check,
  X,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Scissors,
  RefreshCw,
  Settings,
  AlertTriangle,
  Palette,
  Sparkles,
  ImageIcon,
  Download,
  Target,
  Square,
  Circle,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react"
import AvatarEditor from "react-avatar-editor"
import { removeBackground } from "@imgly/background-removal"

// Professional Color Dropdown Component
const ProfessionalColorDropdown = ({ color, onChange }) => {
  const [selectedColor, setSelectedColor] = useState(color)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setSelectedColor(color)
  }, [color])

  const handleColorChange = (newColor) => {
    setSelectedColor(newColor)
    onChange(newColor)
  }

  const presetColors = [
    { color: "#ffffff", name: "Pure White" },
    { color: "#f8fafc", name: "Snow White" },
    { color: "#f1f5f9", name: "Light Gray" },
    { color: "#e2e8f0", name: "Silver" },
    { color: "#cbd5e1", name: "Gray" },
    { color: "#94a3b8", name: "Slate" },
    { color: "#64748b", name: "Dark Slate" },
    { color: "#475569", name: "Charcoal" },
    { color: "#334155", name: "Dark Gray" },
    { color: "#1e293b", name: "Midnight" },
    { color: "#0f172a", name: "Black" },
    { color: "#000000", name: "Pure Black" },
    { color: "#fef2f2", name: "Rose Tint" },
    { color: "#fef7cd", name: "Cream" },
    { color: "#ecfdf5", name: "Mint" },
    { color: "#eff6ff", name: "Sky Blue" },
    { color: "#f0f9ff", name: "Ice Blue" },
    { color: "#faf5ff", name: "Lavender" },
    { color: "#d3ae6e", name: "Brand Gold" },
    { color: "#e6c285", name: "Light Gold" },
    { color: "#b8965a", name: "Dark Gold" },
    { color: "#8b4513", name: "Brown" },
    { color: "#dc2626", name: "Red" },
    { color: "#ea580c", name: "Orange" },
    { color: "#ca8a04", name: "Yellow" },
    { color: "#16a34a", name: "Green" },
    { color: "#0891b2", name: "Cyan" },
    { color: "#2563eb", name: "Blue" },
    { color: "#7c3aed", name: "Purple" },
    { color: "#be185d", name: "Pink" },
  ]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="h-8 sm:h-10 bg-gradient-to-r from-[#d3ae6e] to-[#e6c285] hover:from-[#b8965a] hover:to-[#d3ae6e] text-white font-semibold shadow-lg text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all cursor-pointer inline-flex items-center justify-center px-2 sm:px-4 py-1 sm:py-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d3ae6e]">
          <div
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-md mr-1 sm:mr-2 border-2 border-white/50 shadow-sm"
            style={{ backgroundColor: selectedColor }}
          ></div>
          Color
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[95vw] max-w-[320px] sm:max-w-[380px] p-0 bg-white border-2 border-slate-200 shadow-2xl rounded-2xl">
        <div className="p-4 sm:p-6">
          <DropdownMenuLabel className="px-0 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#d3ae6e] to-[#e6c285] flex items-center justify-center shadow-md">
                <Palette className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Background Color</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal">Choose the perfect background</p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-3 sm:my-4" />

          {/* Color Preview */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl shadow-xl border-3 border-white transition-all duration-300"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Color Input Section */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-3 border-gray-200 cursor-pointer hover:border-[#d3ae6e] transition-colors shadow-md"
                title="Click to open system color picker"
              />
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Hex Color</label>
                <Input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="h-8 sm:h-10 text-xs sm:text-sm font-mono border-2 border-gray-200 focus:border-[#d3ae6e] focus:ring-2 focus:ring-[#d3ae6e]/20 transition-all rounded-lg sm:rounded-xl"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-3 sm:my-4" />

          {/* Preset Colors */}
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-800">Preset Colors</h4>
            <div className="grid grid-cols-8 sm:grid-cols-6 gap-1 sm:gap-2 max-h-32 sm:max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {presetColors.map((preset) => (
                <div
                  key={preset.color}
                  onClick={() => handleColorChange(preset.color)}
                  className={`group relative w-full aspect-square rounded-lg sm:rounded-xl border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer ${
                    selectedColor === preset.color
                      ? "border-[#d3ae6e] scale-105 shadow-lg ring-2 ring-[#d3ae6e]/30"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                >
                  {selectedColor === preset.color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-md flex items-center justify-center">
                        <Check className="h-2 w-2 sm:h-3 sm:w-3 text-[#d3ae6e]" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-3 sm:mt-4">
            <div
              onClick={() => handleColorChange("#ffffff")}
              className="h-7 sm:h-8 text-[10px] sm:text-xs border border-gray-300 hover:bg-gray-50 rounded-md sm:rounded-lg cursor-pointer inline-flex items-center justify-center px-2 sm:px-3 py-1 bg-white transition-colors"
            >
              <Square className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              White
            </div>
            <div
              onClick={() => handleColorChange("#000000")}
              className="h-7 sm:h-8 text-[10px] sm:text-xs border border-gray-300 hover:bg-gray-50 rounded-md sm:rounded-lg cursor-pointer inline-flex items-center justify-center px-2 sm:px-3 py-1 bg-white transition-colors"
            >
              <Circle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              Black
            </div>
            <div
              onClick={() => handleColorChange("#d3ae6e")}
              className="h-7 sm:h-8 text-[10px] sm:text-xs border border-gray-300 hover:bg-gray-50 rounded-md sm:rounded-lg cursor-pointer inline-flex items-center justify-center px-2 sm:px-3 py-1 bg-white transition-colors"
            >
              <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              Brand
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Professional Loading Overlay Component
const ProfessionalLoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-[10001]">
      <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 md:p-8 lg:p-12 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 flex flex-col items-center max-w-[90%] sm:max-w-md mx-4">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mb-6 sm:mb-8">
          <div className="absolute inset-0 rounded-full border-6 sm:border-8 border-[#d3ae6e]/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-6 sm:border-8 border-t-[#d3ae6e] border-r-[#e6c285] border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#d3ae6e] to-[#e6c285] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
              <Scissors className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white animate-pulse" />
            </div>
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">AI Processing</h3>
        <p className="text-base sm:text-lg text-gray-600 text-center mb-6 sm:mb-8 leading-relaxed">
          Removing background with advanced AI technology...
          <br />
          <span className="text-xs sm:text-sm text-gray-500">This may take a few moments</span>
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4 sm:h-6 mb-3 sm:mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-[#d3ae6e] via-[#e6c285] to-[#f0d4a3] h-4 sm:h-6 rounded-full animate-progress shadow-inner"></div>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">Please don't close this window</p>
      </div>
    </div>
  )
}

const ImageEditModal = ({ isOpen, onClose, images = [], onFinish, isEditing = false, editingImageId = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })
  const [processedImages, setProcessedImages] = useState([])
  const [editedImages, setEditedImages] = useState(new Set())
  const [isRemovingBg, setIsRemovingBg] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [backgroundRemoved, setBackgroundRemoved] = useState(new Set())
  const [zoomInput, setZoomInput] = useState("100")
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const editorRef = useRef(null)
  const editorContainerRef = useRef(null)
  const [editorSize, setEditorSize] = useState(300) // Default size

  // Track window size for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate editor size based on container size
  useEffect(() => {
    const updateEditorSize = () => {
      if (editorContainerRef.current) {
        // Get the container dimensions
        const containerRect = editorContainerRef.current.getBoundingClientRect()

        // Calculate the available space (accounting for padding and mobile considerations)
        const isMobile = window.innerWidth < 768
        const isTablet = window.innerWidth < 1024
        const availableWidth = containerRect.width - (isMobile ? 16 : 32) // Less padding on mobile
        const availableHeight = containerRect.height - (isMobile ? 80 : 100) // Less space for other elements on mobile

        // Use different max sizes based on screen size
        let maxSize = 480 // Desktop default
        if (isMobile) maxSize = 280
        else if (isTablet) maxSize = 350

        const size = Math.min(availableWidth, availableHeight, maxSize)
        setEditorSize(Math.max(size, isMobile ? 200 : 250)) // Different minimum sizes
      }
    }

    // Update size on window resize
    updateEditorSize()

    // Create a ResizeObserver to monitor container size changes
    const resizeObserver = new ResizeObserver(updateEditorSize)

    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current)
    }

    return () => {
      if (editorContainerRef.current) {
        resizeObserver.unobserve(editorContainerRef.current)
      }
    }
  }, [windowSize, isOpen])

  // Add custom styles for animations and premium UI
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes progress {
        0% { width: 15%; }
        25% { width: 45%; }
        50% { width: 75%; }
        75% { width: 90%; }
        100% { width: 95%; }
      }
      .animate-progress {
        animation: progress 4s ease-in-out infinite alternate;
      }
      
      /* Enhanced Range Slider Styling */
      .premium-range-slider {
        -webkit-appearance: none;
        appearance: none;
        height: 8px;
        background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%);
        border-radius: 8px;
        outline: none;
        box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        position: relative;
        background-image: linear-gradient(90deg, #d3ae6e 0%, #e6c285 100%);
        background-size: ${((scale - 0.1) / (3 - 0.1)) * 100}%;
        background-repeat: no-repeat;
      }

      @media (min-width: 640px) {
        .premium-range-slider {
          height: 12px;
          border-radius: 12px;
          box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      }

      .premium-range-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
        border: 3px solid #d3ae6e;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(211, 174, 110, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.8);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }

      @media (min-width: 640px) {
        .premium-range-slider::-webkit-slider-thumb {
          width: 28px;
          height: 28px;
          border: 4px solid #d3ae6e;
          box-shadow: 0 6px 20px rgba(211, 174, 110, 0.4), 0 3px 8px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.8);
        }
      }

      .premium-range-slider::-webkit-slider-thumb:hover {
        transform: scale(1.15);
        box-shadow: 0 8px 25px rgba(211, 174, 110, 0.5), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 3px rgba(255, 255, 255, 0.9);
        border-color: #b8965a;
      }

      .premium-range-slider::-webkit-slider-thumb:active {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(211, 174, 110, 0.6), 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.9);
        border-color: #a67c52;
      }

      .premium-range-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
        border: 3px solid #d3ae6e;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(211, 174, 110, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.8);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @media (min-width: 640px) {
        .premium-range-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border: 4px solid #d3ae6e;
          box-shadow: 0 6px 20px rgba(211, 174, 110, 0.4), 0 3px 8px rgba(0, 0, 0, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.8);
        }
      }

      .premium-range-slider::-moz-range-thumb:hover {
        transform: scale(1.15);
        box-shadow: 0 8px 25px rgba(211, 174, 110, 0.5), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 3px rgba(255, 255, 255, 0.9);
        border-color: #b8965a;
      }

      .premium-range-slider::-moz-range-track {
        height: 8px;
        background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%);
        border-radius: 8px;
        box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      @media (min-width: 640px) {
        .premium-range-slider::-moz-range-track {
          height: 12px;
          border-radius: 12px;
          box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      }

      .premium-range-slider:focus {
        outline: none;
        box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(211, 174, 110, 0.2);
      }
      
      .scrollbar-thin::-webkit-scrollbar {
        width: 4px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 2px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #d3ae6e, #e6c285);
        border-radius: 2px;
        transition: all 0.3s ease;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #b8965a, #d3ae6e);
      }
      
      .gallery-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      
      @media (min-width: 640px) {
        .gallery-scrollbar::-webkit-scrollbar,
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .gallery-scrollbar::-webkit-scrollbar-track,
        .scrollbar-thin::-webkit-scrollbar-track {
          border-radius: 3px;
        }
        
        .gallery-scrollbar::-webkit-scrollbar-thumb,
        .scrollbar-thin::-webkit-scrollbar-thumb {
          border-radius: 3px;
        }
      }
      
      @media (min-width: 768px) {
        .gallery-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .gallery-scrollbar::-webkit-scrollbar-track {
          border-radius: 4px;
        }
        
        .gallery-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 4px;
        }
      }
      
      .gallery-scrollbar::-webkit-scrollbar-track {
        background: linear-gradient(180deg, #f8fafc, #f1f5f9);
        margin: 4px 0;
      }
      
      @media (min-width: 640px) {
        .gallery-scrollbar::-webkit-scrollbar-track {
          margin: 6px 0;
        }
      }
      
      @media (min-width: 768px) {
        .gallery-scrollbar::-webkit-scrollbar-track {
          margin: 8px 0;
        }
      }
      
      .gallery-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #d3ae6e, #e6c285);
        border: 1px solid #f8fafc;
        transition: all 0.3s ease;
      }
      
      @media (min-width: 640px) {
        .gallery-scrollbar::-webkit-scrollbar-thumb {
          border: 2px solid #f8fafc;
        }
      }
      
      .gallery-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #b8965a, #d3ae6e);
        border-color: #f1f5f9;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [scale])

  // Initialize processed images when modal opens
  useEffect(() => {
    if (isOpen && images.length > 0) {
      const initialProcessed = images.map((img, index) => ({
        ...img,
        index,
        isProcessed: false,
        croppedBlob: null,
        previewUrl: null,
        scale: 1,
        position: { x: 0.5, y: 0.5 },
        backgroundRemoved: false,
        backgroundColor: "#ffffff",
        originalImageUrl: img.url,
      }))
      setProcessedImages(initialProcessed)

      if (isEditing && editingImageId) {
        const editIndex = initialProcessed.findIndex(
          (img) => img.id === editingImageId || img.originalId === editingImageId,
        )
        if (editIndex !== -1) {
          setCurrentIndex(editIndex)
        }
      } else {
        setCurrentIndex(0)
      }

      setEditedImages(new Set())
      setBackgroundRemoved(new Set())
    }
  }, [isOpen, images, isEditing, editingImageId])

  // Update editor when current image changes
  useEffect(() => {
    if (processedImages.length > 0 && processedImages[currentIndex]) {
      const currentImg = processedImages[currentIndex]
      setScale(currentImg.scale || 1)
      setPosition(currentImg.position || { x: 0.5, y: 0.5 })
      setBackgroundColor(currentImg.backgroundColor || "#ffffff")
      setZoomInput(Math.round((currentImg.scale || 1) * 100).toString())
    }
  }, [currentIndex, processedImages])

  const handlePositionChange = (position) => {
    setPosition(position)
    setProcessedImages((prev) => prev.map((img, index) => (index === currentIndex ? { ...img, position } : img)))
  }

  const handleScaleChange = (newScale) => {
    setScale(newScale)
    setZoomInput(Math.round(newScale * 100).toString())
    setProcessedImages((prev) => prev.map((img, index) => (index === currentIndex ? { ...img, scale: newScale } : img)))
  }

  const handleZoomInputChange = (value) => {
    setZoomInput(value)
    const numValue = Number.parseFloat(value)
    if (!Number.isNaN(numValue) && numValue >= 10 && numValue <= 300) {
      const newScale = numValue / 100
      setScale(newScale)
      setProcessedImages((prev) =>
        prev.map((img, index) => (index === currentIndex ? { ...img, scale: newScale } : img)),
      )
    }
  }

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color)
    setProcessedImages((prev) =>
      prev.map((img, index) => (index === currentIndex ? { ...img, backgroundColor: color } : img)),
    )
  }

  const removeImage = (indexToRemove) => {
    if (processedImages.length <= 1) {
      return
    }

    const newProcessedImages = processedImages.filter((_, index) => index !== indexToRemove)
    setProcessedImages(newProcessedImages)

    // Update edited and background removed sets
    const newEditedImages = new Set()
    const newBackgroundRemoved = new Set()

    editedImages.forEach((index) => {
      if (index < indexToRemove) {
        newEditedImages.add(index)
      } else if (index > indexToRemove) {
        newEditedImages.add(index - 1)
      }
    })

    backgroundRemoved.forEach((index) => {
      if (index < indexToRemove) {
        newBackgroundRemoved.add(index)
      } else if (index > indexToRemove) {
        newBackgroundRemoved.add(index - 1)
      }
    })

    setEditedImages(newEditedImages)
    setBackgroundRemoved(newBackgroundRemoved)

    // Adjust current index
    if (currentIndex >= indexToRemove && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (currentIndex >= newProcessedImages.length) {
      setCurrentIndex(newProcessedImages.length - 1)
    }
  }

  const centerImage = () => {
    setPosition({ x: 0.5, y: 0.5 })
    setProcessedImages((prev) =>
      prev.map((img, index) => (index === currentIndex ? { ...img, position: { x: 0.5, y: 0.5 } } : img)),
    )
  }

  const removeImageBackground = async () => {
    try {
      setIsRemovingBg(true)
      const currentImage = processedImages[currentIndex]

      if (!currentImage) {
        return
      }

      let imageToProcess = currentImage.url
      if (currentImage.backgroundRemoved) {
        imageToProcess = currentImage.originalImageUrl
      }

      // Configure background removal to use single-threading to avoid warnings
      const blob = await removeBackground(imageToProcess, {
        model: "medium",
        output: {
          format: "image/png",
          quality: 0.8,
        },
        // Disable multi-threading to avoid WebAssembly warnings
        debug: false,
      })

      const processedImageUrl = URL.createObjectURL(blob)

      setProcessedImages((prev) =>
        prev.map((img, index) =>
          index === currentIndex
            ? {
                ...img,
                url: processedImageUrl,
                backgroundRemoved: true,
                backgroundRemovedBlob: blob,
                // Reset processed state so user needs to apply changes again
                isProcessed: false,
                croppedBlob: null,
                previewUrl: null,
              }
            : img,
        ),
      )

      setBackgroundRemoved((prev) => new Set([...prev, currentIndex]))

      // Remove from edited images since we need to reprocess
      setEditedImages((prev) => {
        const newSet = new Set(prev)
        newSet.delete(currentIndex)
        return newSet
      })
    } catch (error) {
      console.error("Background removal error:", error)
    } finally {
      setIsRemovingBg(false)
    }
  }

  const restoreOriginalBackground = () => {
    const currentImage = processedImages[currentIndex]

    if (!currentImage || !currentImage.backgroundRemoved) {
      return
    }

    setProcessedImages((prev) =>
      prev.map((img, index) =>
        index === currentIndex
          ? {
              ...img,
              url: img.originalImageUrl,
              backgroundRemoved: false,
              backgroundRemovedBlob: null,
            }
          : img,
      ),
    )

    setBackgroundRemoved((prev) => {
      const newSet = new Set(prev)
      newSet.delete(currentIndex)
      return newSet
    })
  }

  const applyCrop = async () => {
    try {
      if (!editorRef.current) {
        return
      }

      // Get the canvas from AvatarEditor
      const editorCanvas = editorRef.current.getImageScaledToCanvas()

      // Create final canvas for composition
      const finalCanvas = document.createElement("canvas")
      const finalCtx = finalCanvas.getContext("2d")

      finalCanvas.width = editorCanvas.width
      finalCanvas.height = editorCanvas.height

      // IMPORTANT: Always apply the background color first
      // This ensures the background color is visible for all images, not just those with removed backgrounds
      finalCtx.fillStyle = backgroundColor
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

      // Then draw the image on top
      finalCtx.drawImage(editorCanvas, 0, 0)

      // Convert to blob with high quality
      const blob = await new Promise((resolve) => {
        finalCanvas.toBlob(resolve, "image/jpeg", 0.95)
      })

      const currentImageData = processedImages[currentIndex]
      const croppedFile = new File([blob], currentImageData.file.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      })

      const previewUrl = URL.createObjectURL(blob)

      setProcessedImages((prev) =>
        prev.map((img, index) =>
          index === currentIndex
            ? {
                ...img,
                croppedBlob: croppedFile,
                previewUrl: previewUrl,
                isProcessed: true,
                scale,
                position,
                backgroundColor,
                backgroundRemoved: backgroundRemoved.has(currentIndex) || img.backgroundRemoved,
              }
            : img,
        ),
      )

      setEditedImages((prev) => new Set([...prev, currentIndex]))
    } catch (error) {
      console.error("Image processing error:", error)
    }
  }

  const resetCurrentImageOnly = () => {
    setScale(1)
    setPosition({ x: 0.5, y: 0.5 })
    setBackgroundColor("#ffffff")
    setZoomInput("100")

    setProcessedImages((prev) =>
      prev.map((img, index) =>
        index === currentIndex
          ? {
              ...img,
              scale: 1,
              position: { x: 0.5, y: 0.5 },
              backgroundColor: "#ffffff",
              croppedBlob: null,
              isProcessed: false,
              url: img.backgroundRemoved ? img.originalImageUrl : img.url,
              backgroundRemoved: false,
              backgroundRemovedBlob: null,
            }
          : img,
      ),
    )

    setEditedImages((prev) => {
      const newSet = new Set(prev)
      newSet.delete(currentIndex)
      return newSet
    })

    setBackgroundRemoved((prev) => {
      const newSet = new Set(prev)
      newSet.delete(currentIndex)
      return newSet
    })
  }

  const goToImage = (index) => {
    if (index >= 0 && index < processedImages.length) {
      setCurrentIndex(index)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < processedImages.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleFinish = () => {
    const unprocessedImages = processedImages.filter((img) => !img.isProcessed)
    if (unprocessedImages.length > 0) {
      return
    }

    const finalImages = processedImages.map((img) => ({
      ...img,
      file: img.croppedBlob || img.file,
      url: img.previewUrl || (img.croppedBlob ? URL.createObjectURL(img.croppedBlob) : img.url),
    }))

    onFinish(finalImages)
    handleClose()
  }

  const handleClose = () => {
    processedImages.forEach((img) => {
      if (img.url && img.url.startsWith("blob:") && !img.originalUrl) {
        URL.revokeObjectURL(img.url)
      }
      if (img.croppedBlob) {
        URL.revokeObjectURL(URL.createObjectURL(img.croppedBlob))
      }
      if (img.backgroundRemovedBlob) {
        URL.revokeObjectURL(URL.createObjectURL(img.backgroundRemovedBlob))
      }
    })

    setProcessedImages([])
    setEditedImages(new Set())
    setBackgroundRemoved(new Set())
    setCurrentIndex(0)
    setScale(1)
    setPosition({ x: 0.5, y: 0.5 })
    setBackgroundColor("#ffffff")
    setZoomInput("100")
    onClose()
  }

  const currentImage = processedImages[currentIndex]
  const totalEdited = editedImages.size
  const totalImages = processedImages.length
  const unprocessedCount = processedImages.filter((img) => !img.isProcessed).length

  if (!isOpen || !currentImage) return null

  // Convert hex color to RGBA for AvatarEditor
  const hexToRgba = (hex) => {
    // Remove the # if it exists
    hex = hex.replace("#", "")

    // Parse the hex values
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    // Return as RGBA array with full opacity
    return [r, g, b, 1]
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[98vw] w-full max-h-[90vh] sm:max-h-[95vh] md:max-h-[98vh] h-full p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white border-0 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Professional Image Editor</DialogTitle>
            <DialogDescription>Edit and enhance your product images with professional tools</DialogDescription>
          </DialogHeader>

          {/* Close Button - Fixed accessibility issue */}
          <button
            onClick={handleClose}
            className="absolute right-3 sm:right-4 md:right-6 top-3 sm:top-4 md:top-6 z-50 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-white/90 border border-slate-200 shadow-md hover:bg-white inline-flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </button>

          {/* Professional Header */}
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 bg-gradient-to-r from-white via-slate-50 to-white border-b border-slate-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#d3ae6e] to-[#e6c285] flex items-center justify-center shadow-xl">
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900">
                    {isEditing ? "Professional Image Editor" : "Batch Image Editor"}
                  </h2>
                  <div className="text-xs sm:text-sm md:text-base text-slate-600 flex items-center gap-1 sm:gap-2 md:gap-4">
                    <span>
                      Image {currentIndex + 1} of {totalImages}
                    </span>
                    <div className="hidden sm:block w-px h-3 sm:h-4 bg-slate-300"></div>
                    <span className="flex items-center gap-1 sm:gap-2">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      {totalEdited} completed
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {unprocessedCount > 0 && (
                  <Badge className="px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 text-[10px] sm:text-xs md:text-sm font-semibold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200 rounded-full shadow-sm">
                    <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5 sm:mr-1 md:mr-2" />
                    {unprocessedCount} pending
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Responsive Layout */}
          <div className="flex-1 flex flex-col md:flex-col lg:flex-row overflow-hidden">
            {/* Left Side - Image Editor */}
            <div
              ref={editorContainerRef}
              className="w-full md:w-full lg:w-[65%] xl:w-[60%] flex flex-col bg-gradient-to-br from-slate-50/50 to-slate-100/30 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 editor-container"
            >
              {/* Image Editor Section */}
              <div className="flex-1 flex items-center justify-center min-h-0 relative">
                {/* Navigation Arrows */}
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className={`absolute left-2 sm:left-2 md:left-4 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-12 lg:h-12 rounded-xl md:rounded-2xl bg-white/95 hover:bg-white border-2 border-slate-200 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 inline-flex items-center justify-center ${
                    currentIndex === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  aria-label="Previous image"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-slate-700" />
                </button>

                {/* Enhanced Avatar Editor Container */}
                <div className="relative w-full max-w-full flex items-center justify-center">
                  <div className="relative bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-1 sm:p-2 md:p-4 lg:p-6 shadow-2xl border-2 border-slate-200/50 editor-wrapper">
                    {/* Background pattern - Show selected color for all images */}
                    <div
                      className="absolute inset-1 sm:inset-2 md:inset-4 lg:inset-6 rounded-lg sm:rounded-xl md:rounded-2xl"
                      style={{
                        backgroundColor: backgroundColor,
                      }}
                    ></div>
                    <AvatarEditor
                      ref={editorRef}
                      image={currentImage.url}
                      width={editorSize}
                      height={editorSize}
                      border={0}
                      borderRadius={16}
                      color={hexToRgba(backgroundColor)} // Use the selected background color for all images
                      scale={scale}
                      rotate={0}
                      position={position}
                      onPositionChange={handlePositionChange}
                      crossOrigin="anonymous"
                      style={{
                        cursor: "move",
                        borderRadius: "12px",
                        overflow: "hidden",
                        position: "relative",
                        zIndex: 1,
                        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={goToNext}
                  disabled={currentIndex === processedImages.length - 1}
                  className={`absolute right-2 sm:right-2 md:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 lg:w-12 lg:h-12 rounded-xl md:rounded-2xl bg-white/95 hover:bg-white border-2 border-slate-200 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 inline-flex items-center justify-center ${
                    currentIndex === processedImages.length - 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  aria-label="Next image"
                >
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-slate-700" />
                </button>
              </div>

              {/* Enhanced Image Info */}
              <div className="text-center mt-2 sm:mt-3 md:mt-4 lg:mt-6 xl:mt-8">
                <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900">
                  Image {currentIndex + 1}
                </div>
              </div>
            </div>

            {/* Middle - Controls */}
            <div className="w-full md:w-full lg:w-[25%] xl:w-[30%] bg-white border-t-2 lg:border-t-0 lg:border-l-2 border-slate-200/60 flex flex-col">
              {/* Enhanced Controls Section */}
              <div className="p-2 sm:p-3 md:p-4 lg:p-6 border-b-2 border-slate-200/60 overflow-y-auto">
                <Card className="p-3 sm:p-4 md:p-6 lg:p-6 bg-gradient-to-br from-slate-50/80 to-white border-2 border-slate-200/60 shadow-xl rounded-xl sm:rounded-2xl md:rounded-3xl">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-[#d3ae6e] to-[#e6c285] flex items-center justify-center shadow-lg">
                      <Settings className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm md:text-base">
                        Professional Controls
                      </h3>
                      <p className="text-[10px] sm:text-xs md:text-sm text-slate-500">Precision editing tools</p>
                    </div>
                  </div>

                  {/* Status Tags under Professional Controls */}
                  <div className="mb-3 sm:mb-4 md:mb-6 space-y-1 sm:space-y-2">
                    {editedImages.has(currentIndex) && (
                      <div className="inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-md sm:rounded-lg md:rounded-xl font-semibold border border-green-200 shadow-sm text-[10px] sm:text-xs md:text-sm">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        Processed
                      </div>
                    )}
                    {backgroundRemoved.has(currentIndex) && (
                      <div className="inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 rounded-md sm:rounded-lg md:rounded-xl font-semibold border border-purple-200 shadow-sm text-[10px] sm:text-xs md:text-sm ml-1 sm:ml-2">
                        <Scissors className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        Background Removed
                      </div>
                    )}
                  </div>

                  {/* Enhanced Zoom Controls */}
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <div className="flex items-center justify-between mb-1 sm:mb-2 md:mb-3">
                      <label className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-700">Zoom Level</label>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Input
                          type="number"
                          value={zoomInput}
                          onChange={(e) => handleZoomInputChange(e.target.value)}
                          className="w-12 sm:w-14 md:w-16 h-6 sm:h-7 md:h-8 text-[10px] sm:text-xs md:text-sm text-center border-2 border-slate-300 focus:border-[#d3ae6e] focus:ring-4 focus:ring-[#d3ae6e]/20 rounded-md sm:rounded-lg md:rounded-xl"
                          min="10"
                          max="300"
                        />
                        <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-600">%</span>
                      </div>
                    </div>

                    {/* Premium Custom Range Input */}
                    <div className="mb-2 sm:mb-3 md:mb-4 relative">
                      <input
                        type="range"
                        value={scale}
                        onChange={(e) => handleScaleChange(Number.parseFloat(e.target.value))}
                        min="0.1"
                        max="3"
                        step="0.01"
                        className="premium-range-slider w-full"
                      />
                      <div className="flex justify-between text-[8px] sm:text-[10px] md:text-xs text-slate-500 mt-1 sm:mt-2">
                        <span>10%</span>
                        <span>100%</span>
                        <span>300%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-2">
                      <button
                        onClick={() => handleScaleChange(Math.max(0.1, scale - 0.1))}
                        className="h-6 sm:h-7 md:h-9 text-[10px] sm:text-xs md:text-sm border-2 border-slate-300 hover:bg-slate-50 rounded-md sm:rounded-lg md:rounded-xl transition-all cursor-pointer inline-flex items-center justify-center bg-white"
                      >
                        <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                      </button>
                      <button
                        onClick={centerImage}
                        className="h-6 sm:h-7 md:h-9 text-[10px] sm:text-xs md:text-sm border-2 border-slate-300 hover:bg-slate-50 rounded-md sm:rounded-lg md:rounded-xl transition-all cursor-pointer inline-flex items-center justify-center bg-white"
                      >
                        <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                      </button>
                      <button
                        onClick={() => handleScaleChange(Math.min(3, scale + 0.1))}
                        className="h-6 sm:h-7 md:h-9 text-[10px] sm:text-xs md:text-sm border-2 border-slate-300 hover:bg-slate-50 rounded-md sm:rounded-lg md:rounded-xl transition-all cursor-pointer inline-flex items-center justify-center bg-white"
                      >
                        <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Background Controls */}
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <label className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 mb-1 sm:mb-2 md:mb-3 block">
                      Background Tools
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-3">
                      {!backgroundRemoved.has(currentIndex) ? (
                        <Button
                          onClick={removeImageBackground}
                          disabled={isRemovingBg}
                          className="h-7 sm:h-8 md:h-10 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-2xl transition-all text-[10px] sm:text-xs md:text-sm rounded-md sm:rounded-lg md:rounded-xl"
                        >
                          <Scissors className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5 sm:mr-1 md:mr-2" />
                          Remove BG
                        </Button>
                      ) : (
                        <Button
                          onClick={restoreOriginalBackground}
                          variant="outline"
                          className="h-7 sm:h-8 md:h-10 text-[10px] sm:text-xs md:text-sm border-2 border-slate-300 hover:bg-slate-50 rounded-md sm:rounded-lg md:rounded-xl transition-all"
                        >
                          <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5 sm:mr-1 md:mr-2" />
                          Restore
                        </Button>
                      )}

                      <ProfessionalColorDropdown color={backgroundColor} onChange={handleBackgroundColorChange} />
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="space-y-1 sm:space-y-2 md:space-y-3">
                    <Button
                      onClick={applyCrop}
                      className="w-full h-10 sm:h-12 md:h-12 bg-gradient-to-r from-[#d3ae6e] to-[#e6c285] hover:from-[#b8965a] hover:to-[#d3ae6e] text-white font-bold shadow-xl hover:shadow-2xl transition-all text-sm sm:text-base md:text-base rounded-xl sm:rounded-xl md:rounded-2xl"
                    >
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 md:mr-3" />
                      Apply Changes
                    </Button>

                    <Button
                      variant="outline"
                      onClick={resetCurrentImageOnly}
                      className="w-full h-7 sm:h-8 md:h-10 text-[10px] sm:text-xs md:text-sm border-2 border-slate-300 hover:bg-slate-50 rounded-md sm:rounded-lg md:rounded-xl transition-all"
                    >
                      <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5 sm:mr-1 md:mr-2" />
                      Reset Image
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Side - Image Gallery (10%) - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block lg:w-[10%] xl:w-[10%] bg-gradient-to-br from-slate-50 to-white border-l-2 border-slate-200/60 overflow-y-auto gallery-scrollbar">
              <div className="p-2 sm:p-3 md:p-4">
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  {processedImages.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`relative cursor-pointer transition-all duration-300 ${
                        currentIndex === index
                          ? "scale-105 shadow-xl ring-2 ring-[#d3ae6e] z-10"
                          : "hover:scale-105 shadow-md hover:shadow-lg"
                      }`}
                    >
                      <div
                        className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 ${
                          currentIndex === index ? "border-[#d3ae6e]" : "border-slate-200"
                        }`}
                      >
                        <img
                          src={img.previewUrl || img.url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {editedImages.has(index) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                          <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-8 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-white via-slate-50 to-white border-t border-slate-200/60 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="h-7 sm:h-8 md:h-10 text-[10px] sm:text-xs md:text-sm border-2 border-slate-300 hover:bg-slate-50 rounded-md sm:rounded-lg md:rounded-xl transition-all"
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5 sm:mr-1 md:mr-2" />
                  Cancel
                </Button>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <Button
                  onClick={handleFinish}
                  disabled={unprocessedCount > 0}
                  className={`h-7 sm:h-8 md:h-10 bg-gradient-to-r from-[#d3ae6e] to-[#e6c285] hover:from-[#b8965a] hover:to-[#d3ae6e] text-white font-semibold shadow-lg hover:shadow-2xl transition-all text-[10px] sm:text-xs md:text-sm rounded-md sm:rounded-lg md:rounded-xl ${
                    unprocessedCount > 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-0.5 sm:mr-1 md:mr-2" />
                  Save All Images
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      <ProfessionalLoadingOverlay isVisible={isRemovingBg} />
    </>
  )
}

export default ImageEditModal
