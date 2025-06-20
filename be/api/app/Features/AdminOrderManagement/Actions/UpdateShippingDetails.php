<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use DateTime;
use Exception;

class UpdateShippingDetails
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
            if (!isset($data['tracking_number']) || empty(trim($data['tracking_number']))) {
                $errors['tracking_number'] = 'Tracking number is required';
            } elseif (strlen($data['tracking_number']) > 100) {
                $errors['tracking_number'] = 'Tracking number cannot exceed 100 characters';
            }
            
            // Optional fields with validation
            if (isset($data['tracking_url']) && !empty($data['tracking_url'])) {
                if (!filter_var($data['tracking_url'], FILTER_VALIDATE_URL)) {
                    $errors['tracking_url'] = 'Invalid tracking URL format';
                } elseif (strlen($data['tracking_url']) > 500) {
                    $errors['tracking_url'] = 'Tracking URL cannot exceed 500 characters';
                }
            }
            
            if (isset($data['courier_partner']) && strlen($data['courier_partner']) > 100) {
                $errors['courier_partner'] = 'Courier partner name cannot exceed 100 characters';
            }
            
            if (isset($data['estimated_delivery_date']) && !empty($data['estimated_delivery_date'])) {
                $date = DateTime::createFromFormat('Y-m-d', $data['estimated_delivery_date']);
                if (!$date || $date->format('Y-m-d') !== $data['estimated_delivery_date']) {
                    $errors['estimated_delivery_date'] = 'Invalid date format. Use YYYY-MM-DD';
                }
            }
            
            if (isset($data['notes']) && strlen($data['notes']) > 500) {
                $errors['notes'] = 'Notes cannot exceed 500 characters';
            }
            
            // If there are validation errors, throw exception
            if (!empty($errors)) {
                throw new ValidationException('Validation failed', $errors);
            }

            // Update shipping details
            $result = $this->orderService->updateShippingDetails(
                $orderId,
                $data['tracking_number'],
                $data['tracking_url'] ?? null,
                $data['courier_partner'] ?? null,
                $data['estimated_delivery_date'] ?? null,
                $data['notes'] ?? null,
                $user['id']
            );

            // Return response
            return ResponseFormatter::success(
                $result,
                'Shipping details updated successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to update shipping details: ' . $e->getMessage());
        }
    }
}
