<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class ListOrders
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

            // Get pagination parameters
            $page = (int) $request->getQuery('page', 1);
            $limit = (int) $request->getQuery('limit', 20);
            
            // Get filters
            $filters = [
                'status' => $request->getQuery('status'),
                'payment_status' => $request->getQuery('payment_status'),
                'payment_method' => $request->getQuery('payment_method'),
                'search' => $request->getQuery('search'),
                'date_from' => $request->getQuery('date_from'),
                'date_to' => $request->getQuery('date_to'),
                'sort_by' => $request->getQuery('sort_by', 'created_at'),
                'sort_order' => $request->getQuery('sort_order', 'desc')
            ];

            // Get orders list
            $result = $this->orderService->getOrdersList($page, $limit, $filters);

            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Orders retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve orders: ' . $e->getMessage());
        }
    }
}
