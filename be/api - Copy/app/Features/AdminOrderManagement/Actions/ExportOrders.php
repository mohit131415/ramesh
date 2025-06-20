<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class ExportOrders
{
    private $orderService;
    private $authorization;

    public function __construct()
    {
        $this->orderService = new AdminOrderService();
        $this->authorization = Authorization::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Check if user is admin
            $isAdmin = $this->authorization->isAdmin();
            if (!$isAdmin) {
                throw new Exception('Unauthorized access');
            }

            // Get export parameters
            $format = $request->getQuery('format', 'csv');
            
            // Get filters
            $filters = [
                'status' => $request->getQuery('status'),
                'date_from' => $request->getQuery('date_from'),
                'date_to' => $request->getQuery('date_to')
            ];

            // Export orders
            $result = $this->orderService->exportOrders($format, $filters);

            if (!$result['success']) {
                throw new Exception($result['message']);
            }

            // Set headers for file download
            header('Content-Type: ' . $result['content_type']);
            header('Content-Disposition: attachment; filename="' . $result['filename'] . '"');
            header('Content-Length: ' . strlen($result['content']));
            
            echo $result['content'];
            exit;

        } catch (Exception $e) {
            throw new Exception('Failed to export orders: ' . $e->getMessage());
        }
    }
}
