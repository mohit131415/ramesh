"use client"

import { useState, useEffect } from "react"
import { X, Printer, FileText } from "lucide-react"
import api from "../../../services/api"

const InvoiceModal = ({ isOpen, onClose, orderId, orderNumber }) => {
  const [invoiceHtml, setInvoiceHtml] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && orderId) {
      fetchInvoice()
    }
  }, [isOpen, orderId])

  const fetchInvoice = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/admin/orders/${orderId}/invoice`, {
        responseType: "text",
      })
      setInvoiceHtml(response.data)
    } catch (error) {
      console.error("Failed to fetch invoice:", error)
      setError("Failed to load invoice. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Print to PDF using browser's native functionality
  const handlePrintToPDF = () => {
    const printWindow = window.open("", "_blank")

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${orderNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'brand': '#d3ae6e',
                  'brand-light': '#e8c89a',
                  'peach': '#fdf7f0',
                  'peach-light': '#faf4ed'
                }
              }
            }
          }
        </script>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            print-color-adjust: exact;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        ${invoiceHtml.replace(/<script[^>]*>.*?<\/script>/gs, "").replace(/<style[^>]*>.*?<\/style>/gs, "")}
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `

    printWindow.document.write(printHtml)
    printWindow.document.close()
  }

  const handleClose = () => {
    setInvoiceHtml("")
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-ramesh-gold" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Preview</h2>
              <p className="text-xs text-gray-600">Order: {orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && !error && invoiceHtml && (
              <button
                onClick={handlePrintToPDF}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Save as PDF
              </button>
            )}
            <button
              onClick={handleClose}
              className="inline-flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ramesh-gold mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Loading invoice...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mx-auto mb-3">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-base font-medium text-red-900 mb-1">Error Loading Invoice</h3>
                  <p className="text-sm text-red-700 mb-3">{error}</p>
                  <button
                    onClick={fetchInvoice}
                    className="inline-flex items-center px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && invoiceHtml && (
            <div className="h-full overflow-auto bg-gray-50 p-3">
              <div className="mx-auto bg-white shadow-md rounded-md overflow-hidden">
                <iframe
                  srcDoc={invoiceHtml}
                  className="w-full h-[calc(80vh-100px)] border-0"
                  title="Invoice Preview"
                  sandbox="allow-same-origin allow-scripts"
                  style={{
                    colorScheme: "normal",
                    backgroundColor: "white",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceModal
