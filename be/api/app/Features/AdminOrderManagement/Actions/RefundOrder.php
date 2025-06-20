<?php

namespace App\Features\AdminOrderManagement\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\AdminOrderManagement\Services\AdminOrderService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use Exception;

class RefundOrder
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
           
           // Debug log
           error_log("Refund request data: " . json_encode($data));

           // Validate input manually
           $errors = [];
           
           // Required fields
           if (!isset($data['refund_amount']) || !is_numeric($data['refund_amount']) || $data['refund_amount'] <= 0) {
               $errors['refund_amount'] = 'Refund amount is required and must be a positive number';
           }
           
           if (!isset($data['reason']) || empty(trim($data['reason']))) {
               $errors['reason'] = 'Reason is required';
           } elseif (strlen($data['reason']) > 500) {
               $errors['reason'] = 'Reason cannot exceed 500 characters';
           }
           
           // Optional fields with validation
           if (isset($data['refund_method'])) {
               $validMethods = ['original', 'bank_transfer', 'wallet'];
               if (!in_array($data['refund_method'], $validMethods)) {
                   $errors['refund_method'] = 'Invalid refund method. Must be one of: ' . implode(', ', $validMethods);
               }
           } else {
               $data['refund_method'] = 'original'; // Default value
           }
           
           if (isset($data['notes']) && strlen($data['notes']) > 500) {
               $errors['notes'] = 'Notes cannot exceed 500 characters';
           }
           
           // If there are validation errors, throw exception
           if (!empty($errors)) {
               throw new ValidationException('Validation failed', $errors);
           }

           // Process refund
           $result = $this->orderService->refundOrder(
               $orderId,
               (float) $data['refund_amount'],
               $data['reason'],
               $data['refund_method'],
               $data['notes'] ?? null,
               $user['id']
           );

           // Check if refund was successful
           if (!$result['success']) {
               return ResponseFormatter::error(
                   $result['message'],
                   [],
                   400
               );
           }

           // Return success response
           return ResponseFormatter::success(
               $result['data'],
               'Order refund processed successfully'
           );
       } catch (ValidationException $e) {
           throw $e;
       } catch (Exception $e) {
           throw new Exception('Failed to process refund: ' . $e->getMessage());
       }
   }
}
