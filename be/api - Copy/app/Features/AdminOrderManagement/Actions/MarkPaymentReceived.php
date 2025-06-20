<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Helpers\InputValidator;
use App\Core\Security\Authentication;
use Exception;

class MarkPaymentReceived
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
            
            // Get order ID from route parameters
            $orderId = (int) $request->getParam('id');
            
            if (!$orderId) {
                throw new Exception('Order ID is required');
            }

            // Get request data
            $data = $request->getBody();

            // Validate input
            $validator = new InputValidator();
            $rules = [
                'amount_received' => 'required|numeric|min:0',
                'notes' => 'string|max:500'
            ];

            // Check if validate method exists and what it returns
            if (method_exists($validator, 'validate')) {
                $validation = $validator->validate($data, $rules);
                
                // Handle different return formats
                if (is_array($validation)) {
                    if (isset($validation['valid']) && !$validation['valid']) {
                        throw new ValidationException('Validation failed', $validation['errors'] ?? []);
                    } elseif (isset($validation['errors']) && !empty($validation['errors'])) {
                        throw new ValidationException('Validation failed', $validation['errors']);
                    }
                } elseif ($validation === false) {
                    throw new ValidationException('Validation failed');
                }
            } else {
                // Fallback validation
                if (!isset($data['amount_received']) || !is_numeric($data['amount_received']) || $data['amount_received'] < 0) {
                    throw new ValidationException('Valid amount_received is required');
                }
            }

            // Mark payment as received
            $result = $this->orderService->markPaymentReceived(
                $orderId,
                (float) $data['amount_received'],
                $data['notes'] ?? null,
                $user['id']
            );

            // Return response
            return ResponseFormatter::success(
                $result,
                'Payment marked as received successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to mark payment as received: ' . $e->getMessage());
        }
    }
}
