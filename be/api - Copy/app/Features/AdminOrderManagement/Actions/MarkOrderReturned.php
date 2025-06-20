<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use Exception;

class MarkOrderReturned
{
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
            if (!$user) {
                throw new Exception('Authentication required');
            }
            
            // Get order ID from route parameters
            $orderId = (int) $request->getParam('id');
            
            if (!$orderId) {
                throw new Exception('Order ID is required');
            }

            // Get request data
            $data = $request->getBody();

            // Validate input manually
            $errors = [];
            
            // Required fields
            if (!isset($data['reason']) || empty(trim($data['reason']))) {
                $errors['reason'] = 'Reason is required';
            } elseif (strlen($data['reason']) > 500) {
                $errors['reason'] = 'Reason cannot exceed 500 characters';
            }
            
            // Optional fields with validation
            if (isset($data['notes']) && strlen($data['notes']) > 500) {
                $errors['notes'] = 'Notes cannot exceed 500 characters';
            }
            
            // If there are validation errors, throw exception
            if (!empty($errors)) {
                throw new ValidationException('Validation failed', $errors);
            }

            // Mark order as returned
            $result = $this->orderService->markOrderReturned(
                $orderId,
                $data['reason'],
                $data['notes'] ?? null,
                $user['id']
            );

            // Return response
            return ResponseFormatter::success(
                $result,
                'Order marked as returned successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to mark order as returned: ' . $e->getMessage());
        }
    }
}
