<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Orders\Services\InvoiceService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class DownloadInvoice
{
    private $invoiceService;
    private $authorization;

    public function __construct()
    {
        $this->invoiceService = new InvoiceService();
        $this->authorization = Authorization::getInstance();
    }

    public function execute(Request $request, Response $response, $params = [])
    {
        try {
            // Check if user is admin (same pattern as ListOrders)
            $isAdmin = $this->authorization->isAdmin();
            if (!$isAdmin) {
                throw new Exception('Unauthorized access');
            }
            
            // Get order ID from route params - try multiple ways to extract it
            $orderId = null;
            
            // Method 1: From params array (most common)
            if (isset($params['id'])) {
                $orderId = $params['id'];
            }
            // Method 2: From request path segments
            else {
                $pathSegments = explode('/', trim($request->getPath(), '/'));
                // Path: /api/admin/orders/15/invoice
                // Segments: [0]api [1]admin [2]orders [3]15 [4]invoice
                if (count($pathSegments) >= 4 && is_numeric($pathSegments[3])) {
                    $orderId = $pathSegments[3];
                }
            }
            
            if (!$orderId || !is_numeric($orderId)) {
                return $response->json(ResponseFormatter::error(
                    'Valid Order ID is required'
                ), 400);
            }
            
            // Convert to integer
            $orderId = (int)$orderId;
            
            // Generate invoice PDF for admin (bypasses user ownership check)
            $invoicePdf = $this->invoiceService->generateAdminInvoice($orderId);
            
            // Set headers for PDF download
            header('Content-Type: text/html; charset=utf-8');
            header('Content-Disposition: inline; filename="Invoice-Order-' . $orderId . '.html"');
            header('Cache-Control: max-age=0');
            header('Content-Length: ' . strlen($invoicePdf));
            
            // Output PDF content and exit
            echo $invoicePdf;
            exit;
            
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (NotFoundException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 404);
        } catch (Exception $e) {
            error_log("Error generating admin invoice: " . $e->getMessage());
            return $response->json(ResponseFormatter::error(
                'Failed to generate invoice: ' . $e->getMessage()
            ), 500);
        }
    }
}
