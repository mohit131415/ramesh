<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Cart\Services\CartService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class GetAvailableCoupons
{
    private $cartService;
    private $auth;

    public function __construct()
    {
        $this->cartService = new CartService();
        $this->auth = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get user ID from token - authentication is compulsory
            $userId = $this->authenticateUser($request);
            
            // Get available coupons for this specific user
            $coupons = $this->cartService->getAvailableCouponsForUser($userId);
            
            // Format coupons for frontend
            $formattedCoupons = [];
            foreach ($coupons as $coupon) {
                $formattedCoupons[] = [
                    'id' => $coupon['id'],
                    'code' => $coupon['code'],
                    'name' => $coupon['name'],
                    'description' => $coupon['description'],
                    'discount_type' => $coupon['discount_type'],
                    'discount_value' => $coupon['discount_value'],
                    'minimum_order_value' => $coupon['minimum_order_value'],
                    'maximum_discount_amount' => $coupon['maximum_discount_amount'],
                    'start_date' => $coupon['start_date'],
                    'end_date' => $coupon['end_date'],
                    'usage_limit' => $coupon['usage_limit'],
                    'user_usage_count' => $coupon['user_usage_count'] ?? 0,
                    'remaining_uses' => $coupon['remaining_uses'] ?? null,
                    'is_active' => (bool) $coupon['is_active']
                ];
            }
            
            return $response->json(ResponseFormatter::success(
                $formattedCoupons,
                'Available coupons retrieved successfully'
            ));
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to retrieve coupons: ' . $e->getMessage()
            ), 500);
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
            // Use the same token manager as other actions
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
            error_log("Coupon authentication error: " . $e->getMessage());
            throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
        }
    }
}
