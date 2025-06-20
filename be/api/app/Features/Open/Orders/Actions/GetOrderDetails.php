<?php

namespace App\Features\Open\Orders\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authentication;
use App\Features\Open\Orders\Services\OrderDetailsService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class GetOrderDetails
{
    private $orderDetailsService;
    private $auth;

    public function __construct()
    {
        $this->orderDetailsService = new OrderDetailsService();
        $this->auth = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response, $params = [])
    {
        try {
            // Get user ID from token - authentication is compulsory
            $userId = $this->authenticateUser($request);
            
            // Get order identifier from route params or request params
            $orderIdentifier = $params['order_identifier'] ?? $request->getParam('order_identifier');
            
            if (!$orderIdentifier) {
                throw new Exception('Order identifier is required');
            }
            
            // Get query parameters for optional sections
            $includeTimeline = $request->getQuery('include_timeline', 'true') === 'true';
            $includeTracking = $request->getQuery('include_tracking', 'true') === 'true';
            $includeReturnInfo = $request->getQuery('include_return_info', 'true') === 'true';
            
            $options = [
                'include_timeline' => $includeTimeline,
                'include_tracking' => $includeTracking,
                'include_return_info' => $includeReturnInfo
            ];
            
            // Get order details
            $orderDetails = $this->orderDetailsService->getOrderDetails($userId, $orderIdentifier, $options);
            
            if (!$orderDetails) {
                throw new NotFoundException('Order not found or you do not have permission to view this order');
            }
            
            return $response->json(ResponseFormatter::success(
                $orderDetails,
                'Order details retrieved successfully'
            ));
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (NotFoundException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 404);
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to retrieve order details: ' . $e->getMessage()
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
            error_log("Order details authentication error: " . $e->getMessage());
            throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
        }
    }
}
