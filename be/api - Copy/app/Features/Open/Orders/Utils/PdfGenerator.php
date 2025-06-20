<?php

namespace App\Features\Open\Orders\Utils;

use Exception;

class PdfGenerator
{
    /**
     * Generate invoice PDF (HTML format for browser printing)
     * 
     * @param array $invoiceData Invoice data
     * @return string HTML content formatted for PDF printing
     * @throws Exception If PDF generation fails
     */
    public function generateInvoicePdf($invoiceData)
    {
        try {
            // Start output buffering
            ob_start();
            
            // Include the invoice template
            include __DIR__ . '/../Templates/invoice_template.php';
            
            // Get the HTML content
            $html = ob_get_clean();
            
            // Return HTML content with PDF-optimized CSS
            return $this->optimizeForPdf($html);
        } catch (Exception $e) {
            error_log("Error generating PDF: " . $e->getMessage());
            throw new Exception("Failed to generate PDF");
        }
    }
    
    /**
     * Optimize HTML for PDF printing
     * 
     * @param string $html HTML content
     * @return string Optimized HTML content
     */
    private function optimizeForPdf($html)
    {
        // Add PDF-specific meta tags and print styles
        $pdfOptimizedHtml = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
        }
        @page {
            size: A4;
            margin: 0.5in;
        }
    </style>
</head>
<body onload="window.print();">
' . $html . '
</body>
</html>';
        
        return $pdfOptimizedHtml;
    }
    
    /**
     * Generate invoice filename
     * 
     * @param string $orderNumber Order number
     * @return string Filename
     */
    public function generateFilename($orderNumber)
    {
        return 'Invoice-' . $orderNumber . '.html';
    }
}
