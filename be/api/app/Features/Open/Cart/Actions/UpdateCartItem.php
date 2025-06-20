<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authentication;
use App\Features\Open\Cart\Services\CartService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class UpdateCartItem
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
            $quantity = $request->getBody('quantity');
        
            // Auto-adjust quantity if it exceeds limits
            if ($quantity !== null) {
                $adjustedQuantity = $this->autoAdjustQuantity($productId, $variantId, $quantity);
                if ($adjustedQuantity !== $quantity) {
                    $adjustmentMessage = "Quantity automatically adjusted from {$quantity} to {$adjustedQuantity} to comply with variant limits.";
                }
                $quantity = $adjustedQuantity;
            }
        
            // Validate required fields based on payload format
            if ($itemId) {
                // Old format: item_id + quantity
                if ($quantity === null) {
                    return $response->json(ResponseFormatter::error(
                        'Item ID and quantity are required'
                    ), 400);
                }
            
                // Update cart item using item_id
                $cart = $this->cartService->updateCartItem($userId, $itemId, $quantity);
            
            } elseif ($productId && $variantId !== null) {
                // New format: product_id + variant_id + quantity
                if ($quantity === null) {
                    return $response->json(ResponseFormatter::error(
                        'Product ID, variant ID, and quantity are required'
                    ), 400);
                }
            
                // Update cart item using product_id and variant_id
                $cart = $this->cartService->updateCartItemByProductVariant($userId, $productId, $variantId, $quantity);
            
            } else {
                return $response->json(ResponseFormatter::error(
                    'Either item_id or (product_id and variant_id) must be provided along with quantity'
                ), 400);
            }
        
            // Add adjustment message if quantity was adjusted
            $message = 'Cart item updated successfully';
            if (isset($adjustmentMessage)) {
                $message .= ' (' . $adjustmentMessage . ')';
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
                'Failed to update cart item: ' . $e->getMessage()
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

    /**
     * Auto-adjust quantity to comply with variant limits
     */
    private function autoAdjustQuantity($productId, $variantId, $requestedQuantity)
    {
        try {
            $productRepo = new \App\Features\ProductCatalog\ComprehensiveProducts\DataAccess\ComprehensiveProductRepository();
            $product = $productRepo->getProductById($productId);
        
            if (!$product) {
                return $requestedQuantity;
            }
        
            $variant = null;
            if (isset($product['variants']) && is_array($product['variants'])) {
                foreach ($product['variants'] as $v) {
                    if ($v['id'] == $variantId) {
                        $variant = $v;
                        break;
                    }
                }
            }
        
            if (!$variant) {
                return $requestedQuantity;
            }
        
            $minQuantity = $variant['min_quantity'] ?? 1;
            $maxQuantity = $variant['max_quantity'] ?? null;
        
            if ($requestedQuantity < $minQuantity) {
                return $minQuantity;
            }
        
            if ($maxQuantity !== null && $requestedQuantity > $maxQuantity) {
                return $maxQuantity;
            }
        
            return $requestedQuantity;
        } catch (Exception $e) {
            error_log("Error auto-adjusting quantity: " . $e->getMessage());
            return $requestedQuantity;
        }
    }
}
