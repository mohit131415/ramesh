<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Cart\Services\CartService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class RemoveFromCart
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
            
            // Get request data - support both formats
            $itemId = $request->getBody('item_id');
            $productId = $request->getBody('product_id');
            $variantId = $request->getBody('variant_id');
            $quantity = $request->getBody('quantity'); // Optional for partial removal
            
            // Validate required fields based on payload format
            if ($itemId) {
                // Old format: item_id (with optional quantity for partial removal)
                if ($quantity && $quantity > 0) {
                    // Partial removal - reduce quantity
                    $cart = $this->cartService->reduceCartItemQuantity($userId, $itemId, $quantity);
                } else {
                    // Complete removal
                    $cart = $this->cartService->removeFromCart($userId, $itemId);
                }
                
            } elseif ($productId && $variantId !== null) {
                // New format: product_id + variant_id (with optional quantity for partial removal)
                if ($quantity && $quantity > 0) {
                    // Partial removal - reduce quantity by specified amount
                    $cart = $this->cartService->reduceCartItemQuantityByProductVariant($userId, $productId, $variantId, $quantity);
                } else {
                    // Complete removal
                    $cart = $this->cartService->removeFromCartByProductVariant($userId, $productId, $variantId);
                }
                
            } else {
                return $response->json(ResponseFormatter::error(
                    'Either item_id or (product_id and variant_id) must be provided'
                ), 400);
            }
            
            return $response->json(ResponseFormatter::success(
                $cart,
                'Item removed from cart successfully'
            ));
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to remove item from cart: ' . $e->getMessage()
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
