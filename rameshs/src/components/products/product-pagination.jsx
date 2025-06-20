"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import useProductStore from "../../store/productStore"

const ProductPagination = ({ currentPage, totalPages }) => {
  const { setCurrentPage } = useProductStore()

  const handlePageChange = (pageNumber) => {
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" })

    // Update the current page
    setCurrentPage(pageNumber)
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    // Logic to show page numbers with ellipsis for many pages
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Show some pages with ellipsis for many pages
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        // Somewhere in the middle
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers.map((pageNumber, index) => {
      if (pageNumber === "ellipsis") {
        return (
          <li key={`ellipsis-${index}`} className="px-2">
            <span className="text-gray-500">...</span>
          </li>
        )
      }

      return (
        <li key={pageNumber}>
          <button
            onClick={() => handlePageChange(pageNumber)}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              currentPage === pageNumber ? "bg-[#d3ae6e] text-white font-medium" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-current={currentPage === pageNumber ? "page" : undefined}
          >
            {pageNumber}
          </button>
        </li>
      )
    })
  }

  return (
    <nav aria-label="Pagination" className="mt-6">
      <ul className="flex items-center justify-center gap-1">
        {/* Previous button */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
        </li>

        {/* Page numbers */}
        {renderPageNumbers()}

        {/* Next button */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default ProductPagination
