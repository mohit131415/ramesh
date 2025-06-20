<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class ViewOrder
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

            // Get order ID from route parameters
            $orderId = (int) $request->getParam('id');
            
            if (!$orderId) {
                throw new Exception('Order ID is required');
            }

            // Get order details
            $order = $this->orderService->getOrderDetails($orderId);

            if (!$order) {
                throw new Exception('Order not found');
            }

            // Return response
            return ResponseFormatter::success(
                $order,
                'Order details retrieved successfully'
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve order details: ' . $e->getMessage());
        }
    }
}
