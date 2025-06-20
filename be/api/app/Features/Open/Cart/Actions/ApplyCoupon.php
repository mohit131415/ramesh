<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authentication;
use App\Features\Open\Cart\Services\CartService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class ApplyCoupon
{
    private $cartService;

    public function __construct()
    {
        $this->cartService = new CartService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get user ID from token - authentication is compulsory
            $userId = $this->authenticateUser($request);
            
            // Get request data
            $data = $request->getBody();
            $couponCode = $data['coupon_code'] ?? null;
            
            // Validate required fields
            if (!$couponCode) {
                return $response->json(ResponseFormatter::error(
                    'Coupon code is required'
                ), 400);
            }
            
            // Apply coupon (this will validate all conditions again)
            $cart = $this->cartService->applyCoupon($userId, $couponCode);
            
            // Prepare success message
            $message = 'Coupon applied successfully';
            if (isset($cart['coupon_message'])) {
                $message = $cart['coupon_message'];
                unset($cart['coupon_message']); // Remove from response
            }
            
            return $response->json(ResponseFormatter::success(
                $cart,
                $message
            ));
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to apply coupon: ' . $e->getMessage()
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
            throw new AuthenticationException('Authentication required to apply coupon');
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
            throw new AuthenticationException('Invalid or expired token: ' . $e->getMessage());
        }
    }
}
