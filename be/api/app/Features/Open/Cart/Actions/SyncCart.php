<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\TokenManager;
use App\Features\Open\Authentication\DataAccess\UserRepository;
use App\Features\Open\Cart\Services\CartService;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use Exception;

class SyncCart
{
    use ValidatesInput;

    private $cartService;
    private $tokenManager;
    private $userRepository;

    public function __construct()
    {
        $this->cartService = new CartService();
        $this->tokenManager = new TokenManager();
        $this->userRepository = new UserRepository();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get user ID from token - authentication is compulsory
            $userId = $this->authenticateUser($request);
        
            // Validate request data
            $requestBody = $request->getBody();
            $items = isset($requestBody['items']) ? $requestBody['items'] : null;
        
            if (!is_array($items)) {
                return $response->json(ResponseFormatter::error(
                    'Items must be an array'
                ), 400);
            }

            // Auto-adjust quantities and validate each item
            $adjustments = [];
            foreach ($items as $index => &$item) {
                // Check if required fields exist
                if (!isset($item['product_id']) || !is_numeric($item['product_id'])) {
                    return $response->json(ResponseFormatter::error(
                        "Item at index $index is missing a valid product_id"
                    ), 400);
                }
            
                if (!isset($item['variant_id']) || !is_numeric($item['variant_id'])) {
                    return $response->json(ResponseFormatter::error(
                        "Item at index $index is missing a valid variant_id"
                    ), 400);
                }
            
                if (!isset($item['quantity']) || !is_numeric($item['quantity']) || $item['quantity'] < 1) {
                    return $response->json(ResponseFormatter::error(
                        "Item at index $index is missing a valid quantity (must be at least 1)"
                    ), 400);
                }
            
                // Auto-adjust quantity
                $originalQuantity = $item['quantity'];
                $adjustedQuantity = $this->autoAdjustQuantity($item['product_id'], $item['variant_id'], $originalQuantity);
            
                if ($adjustedQuantity !== $originalQuantity) {
                    $adjustments[] = [
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'],
                        'original_quantity' => $originalQuantity,
                        'adjusted_quantity' => $adjustedQuantity,
                        'reason' => $adjustedQuantity > $originalQuantity ? 'Increased to minimum' : 'Reduced to maximum'
                    ];
                    $item['quantity'] = $adjustedQuantity;
                }
            }
        
            // Sync cart with adjusted items
            $cart = $this->cartService->syncCartItems($userId, null, $items);
        
            // Add adjustment information to response
            if (!empty($adjustments)) {
                $cart['quantity_adjustments'] = $adjustments;
                $cart['adjustment_message'] = count($adjustments) . " item(s) had their quantities automatically adjusted to comply with limits.";
            }
        
            return $response->json(ResponseFormatter::success(
                $cart,
                'Cart synced successfully'
            ));
        } catch (Exception $e) {
            error_log("Error in SyncCart: " . $e->getMessage());
            return $response->json(ResponseFormatter::error(
                'Failed to sync cart: ' . $e->getMessage()
            ), 500);
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

    /**
     * Authenticate user and return user ID - using same logic as ValidateToken
     * 
     * @param Request $request
     * @return int User ID
     * @throws Exception If authentication fails
     */
    private function authenticateUser(Request $request)
    {
        // Get token from request body or Authorization header
        $token = $request->getBody('token');
        
        // If token is not in request body, try to get it from Authorization header
        if (!$token) {
            $token = $request->getBearerToken();
        }
        
        // Check if token is provided
        if (!$token) {
            throw new Exception('Authentication required');
        }
        
        // Log the token for debugging
        error_log("SyncCart - Token being validated: " . substr($token, 0, 20) . "...");
        
        // Validate token using TokenManager (same as ValidateToken action)
        try {
            $payload = $this->tokenManager->validateToken($token, false);
            
            // Log the payload for debugging
            error_log("SyncCart - Token payload: " . json_encode($payload));
            
            // Get user ID from token - try different possible locations (same as ValidateToken)
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
                throw new Exception('User ID not found in token');
            }
            
            // Convert to integer to ensure proper type
            $userId = (int)$userId;
            
            // Log the user ID for debugging
            error_log("SyncCart - User ID from token: " . $userId);
            
            // Get user data to verify user exists (same as ValidateToken)
            $user = $this->userRepository->getUserById($userId);
            
            if (!$user) {
                throw new Exception('User not found');
            }
            
            return $userId;
        } catch (Exception $e) {
            error_log("SyncCart - Token validation exception: " . $e->getMessage());
            throw new Exception('Invalid or expired token');
        }
    }
}
