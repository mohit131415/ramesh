<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Authentication;
use App\Features\Open\Cart\Services\CartService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Exceptions\AuthenticationException;
use Exception;

class AddToCart
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
            $productId = $request->getBody('product_id');
            $variantId = $request->getBody('variant_id');
            $quantity = $request->getBody('quantity', 1);
        
            // Validate required fields
            if (!$productId || !$variantId) {
                return $response->json(ResponseFormatter::error(
                    'Product ID and variant ID are required'
                ), 400);
            }
        
            // Validate quantity
            if ($quantity <= 0) {
                return $response->json(ResponseFormatter::error(
                    'Quantity must be greater than 0'
                ), 400);
            }
            
            // Check for SKU conflicts before adding
            $cart = $this->cartService->getOrCreateCart($userId);
            $skuConflictCheck = $this->checkForSkuConflicts($cart, $productId, $variantId);
            
            if ($skuConflictCheck['has_conflict']) {
                return $response->json(ResponseFormatter::error(
                    $skuConflictCheck['message']
                ), 400);
            }
        
            // Add to cart
            $cart = $this->cartService->addToCart($userId, $productId, $variantId, $quantity);
        
            return $response->json(ResponseFormatter::success(
                $cart,
                'Item added to cart successfully'
            ));
        } catch (AuthenticationException $e) {
            return $response->json(ResponseFormatter::error(
                $e->getMessage()
            ), 401);
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to add item to cart: ' . $e->getMessage()
            ), 500);
        }
    }

    /**
     * Check for SKU conflicts when adding a new variant
     */
    private function checkForSkuConflicts($cart, $productId, $variantId)
    {
        try {
            // Get the variant being added
            $productRepo = new \App\Features\ProductCatalog\ComprehensiveProducts\DataAccess\ComprehensiveProductRepository();
            $product = $productRepo->getProductById($productId);
            
            if (!$product) {
                return ['has_conflict' => false];
            }
            
            $newVariant = null;
            if (isset($product['variants']) && is_array($product['variants'])) {
                foreach ($product['variants'] as $variant) {
                    if ($variant['id'] == $variantId) {
                        $newVariant = $variant;
                        break;
                    }
                }
            }
            
            if (!$newVariant || empty($newVariant['sku'])) {
                return ['has_conflict' => false];
            }
            
            $newSku = $newVariant['sku'];
            
            // Check existing cart items for SKU conflicts
            foreach ($cart['items'] as $item) {
                if (isset($item['current_variant']['sku']) && 
                    $item['current_variant']['sku'] === $newSku && 
                    $item['variant_id'] != $variantId) {
                    
                    return [
                        'has_conflict' => true,
                        'message' => "Cannot add item: SKU '{$newSku}' already exists in cart with a different variant. Please remove the existing item first or choose a different variant."
                    ];
                }
            }
            
            return ['has_conflict' => false];
        } catch (Exception $e) {
            error_log("Error checking SKU conflicts: " . $e->getMessage());
            return ['has_conflict' => false];
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
