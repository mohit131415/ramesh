<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use App\Core\Security\Authentication;
use Exception;

class UpdateOrderStatus
{
    use ValidatesInput;
    
    private $orderService;
    private $authentication;

    public function __construct()
    {
        $this->orderService = new AdminOrderService();
        $this->authentication = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Get order ID from route parameters
            $orderId = (int) $request->getParam('id');
            
            if (!$orderId) {
                throw new Exception('Order ID is required');
            }

            // Get request data
            $data = $request->getBody();

            // Validate input using the ValidatesInput trait
            $validatedData = $this->validate($data, [
                'status' => 'required|string|in:confirmed,preparing,prepared,shipped,delivered',
                'notes' => 'string|max:500'
            ]);

            // Update order status
            $result = $this->orderService->updateOrderStatus(
                $orderId,
                $validatedData['status'],
                $validatedData['notes'] ?? null,
                $user['id']
            );

            // Return response
            return ResponseFormatter::success(
                $result,
                'Order status updated successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to update order status: ' . $e->getMessage());
        }
    }
}
