<?php

namespace App\Features\Open\Orders\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Orders\Services\OrderService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class CreateOrder
{
    private $orderService;
    private $auth;

    public function __construct()
    {
        $this->orderService = new OrderService();
        $this->auth = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get user ID from token - authentication is compulsory
            $userId = $this->authenticateUser($request);
            
            // Get parameters from request
            $data = $request->getBody();
            
            // Validate required fields
            if (!isset($data['address_id']) || !isset($data['payment_method'])) {
                return $response->json(ResponseFormatter::error(
                    'Address ID and payment method are required.'
                ), 400);
            }
            
            $addressId = $data['address_id'];
            $paymentMethod = $data['payment_method'];
            $paymentId = $data['payment_id'] ?? null;
            $additionalData = $data['additional_data'] ?? null;
            
            // Validate payment method
            if (!in_array($paymentMethod, ['cod', 'online'])) {
                return $response->json(ResponseFormatter::error(
                    'Invalid payment method. Supported methods: cod, online'
                ), 400);
            }
            
            // Validate payment ID for online payments
            if ($paymentMethod === 'online' && empty($paymentId)) {
                return $response->json(ResponseFormatter::error(
                    'Payment ID is required for online payments'
                ), 400);
            }
            
            // Create order
            $orderData = $this->orderService->createOrder(
                $userId,
                $addressId,
                $paymentMethod,
                $paymentId,
                $additionalData
            );
            
            return $response->json(ResponseFormatter::success(
                $orderData,
                'Order created successfully'
            ));
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 400);
        }
    }

    /**
     * Authenticate user and return user ID
     * 
     * @param Request $request
     * @return int User ID
     * @throws AuthenticationException If authentication fails
     */
    private function authenticateUser(Request $request)
    {
        $token = $request->getBearerToken();
        
        if (!$token) {
            throw new AuthenticationException('Authentication required');
        }
        
        try {
            // Use the same token manager as the ValidateToken action
            $tokenManager = new \App\Core\Security\TokenManager();
            $payload = $tokenManager->validateToken($token, false);
            
            // Get user ID from token - try different possible locations
            $userId = null;
            
            // Try standard JWT claim
            if (isset($payload->sub)) {
                $userId = $payload->sub;
            }
            // Try custom property
            else if (isset($payload->user_id)) {
                $userId = $payload->user_id;
            }
            // Try data object if present
            else if (isset($payload->data) && is_object($payload->data)) {
                if (isset($payload->data->user_id)) {
                    $userId = $payload->data->user_id;
                } else if (isset($payload->data->id)) {
                    $userId = $payload->data->id;
                }
            }
            
            if (!$userId) {
                throw new AuthenticationException('Invalid token payload');
            }
            
            // Convert to integer to ensure proper type
            $userId = (int)$userId;
            
            // Verify user exists in database
            $userRepository = new \App\Features\Open\Authentication\DataAccess\UserRepository();
            $user = $userRepository->getUserById($userId);
            
            if (!$user) {
                throw new AuthenticationException('User not found');
            }
            
            return $userId;
        } catch (Exception $e) {
            error_log("Order authentication error: " . $e->getMessage());
            throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
        }
    }
}
