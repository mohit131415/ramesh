<?php

namespace App\Features\Open\Cart\Services;

use App\Features\Open\Cart\DataAccess\CartRepository;
use App\Features\Open\Cart\DataAccess\CouponRepository;
use App\Features\ProductCatalog\ComprehensiveProducts\DataAccess\ComprehensiveProductRepository;
use Exception;
use App\Features\Open\Cart\Services\CartItemService;

class CartService
{
    private $cartRepository;
    private $productRepository;
    private $couponRepository;
    private $cartItemService;
    private $db;

    public function __construct()
    {
        $this->cartRepository = new CartRepository();
        $this->productRepository = new ComprehensiveProductRepository();
        $this->couponRepository = new CouponRepository();
        $this->cartItemService = new CartItemService();
        $this->db = \App\Core\Database::getInstance();
    }

    /**
     * Get or create cart for a user
     * 
     * @param int $userId User ID
     * @return array Cart data with items and totals
     */
    public function getOrCreateCart($userId)
    {
        try {
            // Get active cart or create new one
            $cart = $this->cartRepository->getActiveCart($userId);
        
            if (!$cart) {
                $cartId = $this->cartRepository->createCart($userId);
                $cart = ['id' => $cartId];
                error_log("Created new cart with ID: " . $cartId);
            } else {
                error_log("Found existing cart with ID: " . $cart['id']);
                
                // Auto-adjust quantities and check for conflicts
                $adjustmentResults = $this->autoAdjustCartQuantities($cart['id']);
            }
        
            // Get basic cart items from repository - ensure we get all items
            $basicItems = $this->cartRepository->getCartItems($cart['id']);
            error_log("Found " . count($basicItems) . " items in cart");

            // Log each item for debugging
            foreach ($basicItems as $item) {
                error_log("Cart item: Product {$item['product_id']}, Variant {$item['variant_id']}, Quantity {$item['quantity']}");
            }

            // Convert to the format expected by CartItemService - DO NOT DUPLICATE
            $itemsForService = [];
            foreach ($basicItems as $item) {
                $itemsForService[] = [
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity']
                ];
            }

            error_log("Items for service: " . json_encode($itemsForService));

            // Get detailed cart items using CartItemService - this should return the SAME number of items
            $detailedCartData = $this->cartItemService->getCartItemsDetails($itemsForService);

            error_log("Detailed cart data returned " . count($detailedCartData['items']) . " items");

        // Separate active and inactive items based on quantity violations and product status
        // Inactive items are preserved in the database for potential reactivation.
        $activeItems = [];
        $inactiveItems = [];

        foreach ($detailedCartData['items'] as $item) {
            // Check if item should be moved to inactive
            if ($item['quantity_status'] === 'above_maximum' || 
                $item['quantity_status'] === 'below_minimum' ||
                !$item['is_active'] || 
                $item['is_deleted']) {
            
                // Add reason for being inactive
                if ($item['quantity_status'] === 'above_maximum') {
                    $item['inactive_reason'] = "Quantity exceeds maximum limit of {$item['max_quantity']}";
                } elseif ($item['quantity_status'] === 'below_minimum') {
                    $item['inactive_reason'] = "Quantity below minimum limit of {$item['min_quantity']}";
                } elseif (!$item['is_active']) {
                    $item['inactive_reason'] = "Product is currently inactive";
                } elseif ($item['is_deleted']) {
                    $item['inactive_reason'] = "Product has been removed";
                }
            
                $inactiveItems[] = $item;
            } else {
                $activeItems[] = $item;
            }
        }

        error_log("Active items: " . count($activeItems) . ", Inactive items: " . count($inactiveItems));

        // Recalculate totals based only on active items
        $cartTotals = $this->calculateTotalsFromItems($activeItems);
        error_log("Calculated totals: " . json_encode($cartTotals));

        // Get applied coupons (preserve in database even if invalid)
        $coupons = $this->cartRepository->getCartCoupons($cart['id']);

        // Process coupon validation and application
        $couponDiscountAmount = 0;
        $appliedCoupon = null;
        $inactiveCoupon = null;
        
        if (!empty($coupons)) {
            $coupon = $coupons[0];
            
            // Re-validate the applied coupon to check if it's still valid
            $validation = $this->validateCoupon($coupon['coupon_code'], $cartTotals['subtotal'], $userId);
            
            if ($validation['valid']) {
                // Coupon is still valid - apply discount
                $couponDiscountAmount = $validation['discount_amount'];
                
                // Update totals with coupon discount
                $cartTotals['coupon_discount_amount'] = $couponDiscountAmount;

                // Calculate total after coupon discount
                $totalAfterCoupon = $cartTotals['subtotal'] - $couponDiscountAmount;
                $cartTotals['amount_before_roundoff'] = $totalAfterCoupon;

                // Apply roundoff
                $finalTotal = round($totalAfterCoupon);
                $roundoff = $finalTotal - $totalAfterCoupon;

                $cartTotals['total'] = $finalTotal;
                $cartTotals['roundoff'] = round($roundoff, 2);

                // Calculate roundoff savings
                $roundoffSavings = $roundoff < 0 ? abs($roundoff) : 0;
                $cartTotals['roundoff_savings'] = round($roundoffSavings, 2);

                // Calculate total discount amount INCLUDING roundoff savings (properly rounded)
                $cartTotals['total_discount_amount'] = round($cartTotals['product_discount_amount'] + $couponDiscountAmount + $roundoffSavings, 2);
                $cartTotals['total_savings'] = $cartTotals['total_discount_amount']; // Same as total discount amount
                
                $appliedCoupon = [
                    'id' => $coupon['coupon_id'],
                    'code' => $coupon['coupon_code'],
                    'name' => $validation['coupon']['name'] ?? $coupon['coupon_code'],
                    'description' => $validation['coupon']['description'] ?? '',
                    'discount_type' => $coupon['discount_type'],
                    'discount_value' => $coupon['discount_value'],
                    'discount_amount' => $couponDiscountAmount,
                    'is_valid' => true
                ];
                
                error_log("Applied valid coupon discount: " . $couponDiscountAmount . ", Amount before roundoff: " . $cartTotals['amount_before_roundoff'] . ", Roundoff: " . $roundoff . ", Total savings: " . $cartTotals['total_savings']);
            } else {
                // Coupon is no longer valid - preserve in database but mark as inactive
                // DO NOT remove from database, just don't apply discount
                $inactiveCoupon = [
                    'id' => $coupon['coupon_id'],
                    'code' => $coupon['coupon_code'],
                    'name' => $validation['coupon']['name'] ?? $coupon['coupon_code'],
                    'description' => $validation['coupon']['description'] ?? '',
                    'discount_type' => $coupon['discount_type'],
                    'discount_value' => $coupon['discount_value'],
                    'discount_amount' => 0, // No discount applied
                    'is_valid' => false,
                    'inactive_reason' => $validation['message']
                ];
                
                error_log("Coupon is invalid but preserved in cart: " . $validation['message']);
            }
        }
        
        // If no valid coupon applied, still calculate roundoff if needed
        if (!$appliedCoupon) {
            $totalBeforeRoundoff = $cartTotals['subtotal'];
            $cartTotals['amount_before_roundoff'] = $totalBeforeRoundoff;
            $finalTotal = round($totalBeforeRoundoff);
            $roundoff = $finalTotal - $totalBeforeRoundoff;

            if (abs($roundoff) > 0.001) { // Only add roundoff if it's significant
                $cartTotals['roundoff'] = round($roundoff, 2);
                $cartTotals['total'] = $finalTotal;
                
                // Calculate roundoff savings
                $roundoffSavings = $roundoff < 0 ? abs($roundoff) : 0;
                $cartTotals['roundoff_savings'] = round($roundoffSavings, 2);
                
                // Calculate total discount amount INCLUDING roundoff savings (properly rounded)
                $cartTotals['total_discount_amount'] = round($cartTotals['product_discount_amount'] + $roundoffSavings, 2);
                $cartTotals['total_savings'] = $cartTotals['total_discount_amount'];
            } else {
                $cartTotals['roundoff'] = 0;
                $cartTotals['roundoff_savings'] = 0;
                $cartTotals['total_discount_amount'] = $cartTotals['product_discount_amount'];
                $cartTotals['total_savings'] = $cartTotals['product_discount_amount'];
            }
        }

        // ALWAYS update cart totals in database - even for GET requests
        try {
            $updateResult = $this->cartRepository->updateCartTotals($cart['id'], $cartTotals);
            error_log("Database update result: " . ($updateResult ? 'SUCCESS' : 'FAILED'));
        } catch (Exception $e) {
            error_log("Failed to update cart totals in database: " . $e->getMessage());
        }

        // Merge the detailed items with calculated totals
        $response = [
            'items' => $activeItems,
            'inactive_items' => array_merge($inactiveItems, $detailedCartData['inactive_items']),
            'invalid_items' => $detailedCartData['invalid_items'],
            'totals' => $cartTotals
        ];
        
        // Add coupon information to response
        if ($appliedCoupon) {
            $response['applied_coupon'] = $appliedCoupon;
        }
        
        if ($inactiveCoupon) {
            $response['inactive_coupon'] = $inactiveCoupon;
        }
        
        // Add adjustment information to response if any adjustments were made
        if (isset($adjustmentResults) && (!empty($adjustmentResults['adjustments']) || !empty($adjustmentResults['sku_conflicts']))) {
            $response['quantity_adjustments'] = $adjustmentResults['adjustments'];
            $response['sku_conflicts'] = $adjustmentResults['sku_conflicts'];
            
            if (!empty($adjustmentResults['adjustments'])) {
                $response['adjustment_message'] = count($adjustmentResults['adjustments']) . " item(s) had their quantities automatically adjusted to comply with limits.";
            }
            
            if (!empty($adjustmentResults['sku_conflicts'])) {
                $response['conflict_message'] = "Warning: " . count($adjustmentResults['sku_conflicts']) . " SKU conflict(s) detected in cart.";
            }
        }
        
        return $response;
    } catch (Exception $e) {
        error_log("Error in getOrCreateCart: " . $e->getMessage());
        throw $e;
    }
}

    /**
     * Add item to cart
     * 
     * @param int $userId User ID
     * @param int $productId Product ID
     * @param int $variantId Variant ID
     * @param int $quantity Quantity
     * @return array Updated cart data
     */
public function addToCart($userId, $productId, $variantId, $quantity)
{
    try {
        // Validate product and variant first
        $product = $this->productRepository->getProductById($productId);
        
        if (!$product) {
            throw new Exception("Product not found");
        }
        
        // Check if product is active and not deleted
        $isProductActive = ($product['status'] ?? '') === 'active';
        $isProductDeleted = !empty($product['deleted_at']) && $product['deleted_at'] !== '0000-00-00 00:00:00';

        if (!$isProductActive || $isProductDeleted) {
            throw new Exception("Product is not available");
        }
        
        // Find the variant
        $variant = $this->findVariantInProduct($product, $variantId);
        
        if (!$variant) {
            throw new Exception("Variant not found");
        }
        
        // Check if variant is active and not deleted
        $isVariantActive = ($variant['status'] ?? '') === 'active';
        $isVariantDeleted = !empty($variant['deleted_at']) && $variant['deleted_at'] !== '0000-00-00 00:00:00';

        if (!$isVariantActive || $isVariantDeleted) {
            throw new Exception("This variant is not available");
        }
        
        // Get or create cart
        $cart = $this->cartRepository->getActiveCart($userId);
        
        if (!$cart) {
            $cartId = $this->cartRepository->createCart($userId);
        } else {
            $cartId = $cart['id'];
        }
        
        // Check existing quantity in cart for this variant
        $existingQuantity = $this->getExistingCartItemQuantity($cartId, $productId, $variantId);
        $totalQuantity = $existingQuantity + $quantity;
        
        // Validate quantity against variant limits
        $this->validateQuantity($variant, $totalQuantity, $quantity);
        
        // Get price and tax rate with fallbacks
        $priceWithTax = 0;
        if (isset($variant['sale_price']) && $variant['sale_price'] > 0) {
            $priceWithTax = (float) $variant['sale_price'];
        } elseif (isset($variant['price']) && $variant['price'] > 0) {
            $priceWithTax = (float) $variant['price'];
        } else {
            // Fallback: try to get price directly from database
            $db = \App\Core\Database::getInstance();
            $priceSql = "SELECT price, sale_price FROM product_variants WHERE id = :variant_id";
            $priceData = $db->fetch($priceSql, [':variant_id' => $variantId]);
            
            if ($priceData) {
                if (isset($priceData['sale_price']) && $priceData['sale_price'] > 0) {
                    $priceWithTax = (float) $priceData['sale_price'];
                } elseif (isset($priceData['price']) && $priceData['price'] > 0) {
                    $priceWithTax = (float) $priceData['price'];
                }
            }
        }

        if ($priceWithTax <= 0) {
            throw new Exception("Product price not found or invalid");
        }

        $taxRate = $product['tax_rate'] ?? $product['gst_percentage'] ?? 5; // Default to 5% if not specified

        error_log("Adding to cart - Product: {$productId}, Variant: {$variantId}, Price: {$priceWithTax}, Tax Rate: {$taxRate}");
        
        // Add item to cart (this handles existing item updates automatically)
        $this->cartRepository->addCartItem($cartId, $productId, $variantId, $quantity, $priceWithTax, $taxRate);
        
        // Return updated cart
        return $this->getOrCreateCart($userId);
    } catch (Exception $e) {
        error_log("Error in addToCart: " . $e->getMessage());
        throw $e;
    }
}

    /**
     * Update cart item quantity
     * 
     * @param int $userId User ID
     * @param int $itemId Cart item ID
     * @param int $quantity New quantity
     * @return array Updated cart data
     */
    public function updateCartItem($userId, $itemId, $quantity)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
            
            if (!$cart) {
                throw new Exception("Cart not found");
            }
            
            // Get the cart item to validate
            $cartItem = $this->getCartItemById($cart['id'], $itemId);
            if (!$cartItem) {
                throw new Exception("Cart item not found");
            }
            
            // Get product and variant for validation
            $product = $this->productRepository->getProductById($cartItem['product_id']);
            if (!$product) {
                throw new Exception("Product not found");
            }
            
            $variant = $this->findVariantInProduct($product, $cartItem['variant_id']);
            if (!$variant) {
                throw new Exception("Variant not found");
            }
            
            // Validate quantity against variant limits
            $this->validateQuantity($variant, $quantity, $quantity);
            
            // Update item quantity
            $this->cartRepository->updateCartItemQuantity($cart['id'], $itemId, $quantity);
            
            // Update cart totals immediately after updating item
            $this->updateCartTotalsInDatabase($cart['id']);
            
            // Return updated cart
            return $this->getOrCreateCart($userId);
        } catch (Exception $e) {
            error_log("Error in updateCartItem: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove item from cart
     * 
     * @param int $userId User ID
     * @param int $itemId Cart item ID
     * @return array Updated cart data
     */
    public function removeFromCart($userId, $itemId)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
            
            if (!$cart) {
                throw new Exception("Cart not found");
            }
            
            // Remove item
            $this->cartRepository->removeCartItem($cart['id'], $itemId);
            
            // Update cart totals immediately after removing item
            $this->updateCartTotalsInDatabase($cart['id']);
            
            // Return updated cart
            return $this->getOrCreateCart($userId);
        } catch (Exception $e) {
            error_log("Error in removeFromCart: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Apply coupon to cart
     * 
     * @param int $userId User ID
     * @param string $couponCode Coupon code
     * @return array Updated cart data
     */
    public function applyCoupon($userId, $couponCode)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
        
            if (!$cart) {
                throw new Exception("Cart not found");
            }
        
            // Calculate current cart total
            $totals = $this->cartRepository->calculateCartTotals($cart['id']);
            $cartTotal = $totals['subtotal'];
        
            // Validate coupon with all conditions
            $validation = $this->validateCoupon($couponCode, $cartTotal, $userId);
        
            if (!$validation['valid']) {
                throw new Exception($validation['message']);
            }
        
            $coupon = $validation['coupon'];
            $discountAmount = $validation['discount_amount'];
        
            // Remove any existing coupons first
            $this->cartRepository->removeCoupons($cart['id']);
        
            // Apply new coupon to cart
            $this->cartRepository->applyCoupon(
                $cart['id'],
                $coupon['id'],
                $coupon['code'],
                $coupon['discount_type'],
                $coupon['discount_value'],
                $discountAmount
            );
        
            // Update cart totals immediately after applying coupon
            $this->updateCartTotalsInDatabase($cart['id']);
        
            // Return updated cart with success message
            $updatedCart = $this->getOrCreateCart($userId);
            $updatedCart['coupon_message'] = $validation['message'];
        
            return $updatedCart;
        } catch (Exception $e) {
            error_log("Error in applyCoupon: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove coupon from cart (actually removes from database)
     * 
     * @param int $userId User ID
     * @return array Updated cart data
     */
    public function removeCoupon($userId)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
            
            if (!$cart) {
                throw new Exception("Cart not found");
            }
            
            // Remove coupons from database (user explicitly wants to remove)
            $this->cartRepository->removeCoupons($cart['id']);
            
            // Update cart totals immediately after removing coupon
            $this->updateCartTotalsInDatabase($cart['id']);
            
            // Return updated cart
            return $this->getOrCreateCart($userId);
        } catch (Exception $e) {
            error_log("Error in removeCoupon: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Sync cart with provided items - MERGE with existing items, never remove
     * 
     * @param int $userId User ID
     * @param string|null $guestId Guest ID (optional)
     * @param array $items Array of items with product_id, variant_id, and quantity
     * @return array Updated cart data
     */
    public function syncCartItems($userId, $guestId, $items)
    {
        try {
            error_log("Starting syncCartItems for user {$userId} with " . count($items) . " items");
        
            // Get or create cart
            $cart = $this->cartRepository->getActiveCart($userId);
        
            if (!$cart) {
                $cartId = $this->cartRepository->createCart($userId);
                $cart = ['id' => $cartId];
                error_log("Created new cart with ID: {$cartId}");
            } else {
                error_log("Using existing cart with ID: {$cart['id']}");
            }
        
            // Get existing cart items
            $existingItems = $this->cartRepository->getCartItems($cart['id']);
            error_log("Found " . count($existingItems) . " existing items in cart");
        
            // Create a map of existing items for quick lookup
            $existingItemMap = [];
            foreach ($existingItems as $item) {
                $key = $item['product_id'] . '-' . $item['variant_id'];
                $existingItemMap[$key] = $item;
            }
        
            $processedItems = 0;
            $skippedItems = 0;
            $mergedItems = 0;
            $mergeDetails = [];
        
            // Process each item in the payload - MERGE with existing items
            foreach ($items as $index => $item) {
                $productId = $item['product_id'];
                $variantId = $item['variant_id'];
                $quantity = $item['quantity'];
            
                error_log("Processing item {$index}: Product {$productId}, Variant {$variantId}, Quantity {$quantity}");
            
                // Validate product
                try {
                    $product = $this->productRepository->getProductById($productId);
                
                    if (!$product) {
                        error_log("Product ID {$productId} not found");
                        $skippedItems++;
                        continue; // Skip this item and move to the next
                    }
                
                    error_log("Found product: " . ($product['name'] ?? 'Unknown'));
                
                    // Check product status - be more lenient in sync
                    $isProductActive = ($product['status'] ?? '') === 'active' || ($product['is_active'] ?? 0) == 1;
                    $isProductDeleted = !empty($product['deleted_at']) && $product['deleted_at'] !== '0000-00-00 00:00:00';
                
                    if ($isProductDeleted) {
                        error_log("Product ID {$productId} is deleted");
                        $skippedItems++;
                        continue; // Skip deleted products
                    }
                
                    // Find the variant using our helper method
                    $variant = $this->findVariantInProduct($product, $variantId);
                
                    if (!$variant) {
                        error_log("Variant ID {$variantId} not found for product ID {$productId}");
                        $skippedItems++;
                        continue; // Skip this item and move to the next
                    }
                
                    error_log("Found variant: " . ($variant['name'] ?? 'Unknown'));
                
                    // Check variant status - be more lenient in sync
                    $isVariantActive = ($variant['status'] ?? '') === 'active' || ($variant['is_active'] ?? 0) == 1;
                    $isVariantDeleted = !empty($variant['deleted_at']) && $variant['deleted_at'] !== '0000-00-00 00:00:00';
                
                    if ($isVariantDeleted) {
                        error_log("Variant ID {$variantId} is deleted");
                        $skippedItems++;
                        continue; // Skip deleted variants
                    }
                
                    // Get price and tax rate with fallbacks
                    $priceWithTax = 0;
                    if (isset($variant['sale_price']) && $variant['sale_price'] > 0) {
                        $priceWithTax = (float) $variant['sale_price'];
                    } elseif (isset($variant['price']) && $variant['price'] > 0) {
                        $priceWithTax = (float) $variant['price'];
                    } else {
                        // Fallback: try to get price directly from database
                        $db = \App\Core\Database::getInstance();
                        $priceSql = "SELECT price, sale_price FROM product_variants WHERE id = :variant_id";
                        $priceData = $db->fetch($priceSql, [':variant_id' => $variantId]);
                    
                        if ($priceData) {
                            if (isset($priceData['sale_price']) && $priceData['sale_price'] > 0) {
                                $priceWithTax = (float) $priceData['sale_price'];
                            } elseif (isset($priceData['price']) && $priceData['price'] > 0) {
                                $priceWithTax = (float) $priceData['price'];
                            }
                        }
                    }

                    if ($priceWithTax <= 0) {
                        error_log("Product price not found for variant ID {$variantId}");
                        $skippedItems++;
                        continue; // Skip this item
                    }

                    $taxRate = $product['tax_rate'] ?? $product['gst_percentage'] ?? 5; // Default to 5% if not specified
                
                    // Check if item already exists in cart
                    $key = $productId . '-' . $variantId;
                
                    if (isset($existingItemMap[$key])) {
                        // MERGE: Add the new quantity to the existing quantity
                        $existingQuantity = $existingItemMap[$key]['quantity'];
                        $newQuantity = $existingQuantity + $quantity;
                    
                        // Check max quantity limit
                        $maxQuantity = $variant['max_quantity'] ?? $variant['max_order_quantity'] ?? null;
                        $wasAdjusted = false;
                    
                        if ($maxQuantity !== null && $newQuantity > $maxQuantity) {
                            error_log("Quantity {$newQuantity} exceeds max {$maxQuantity}, adjusting to max");
                            $newQuantity = $maxQuantity;
                            $wasAdjusted = true;
                        }
                    
                        error_log("Merging quantities: {$existingQuantity} + {$quantity} = {$newQuantity}");
                    
                        // Update existing item quantity
                        $this->cartRepository->updateCartItemQuantity(
                            $cart['id'], 
                            $existingItemMap[$key]['id'], 
                            $newQuantity
                        );
                    
                        // Track merge details
                        $mergeDetails[] = [
                            'action' => 'merged',
                            'product_id' => $productId,
                            'variant_id' => $variantId,
                            'existing_quantity' => $existingQuantity,
                            'sync_quantity' => $quantity,
                            'final_quantity' => $newQuantity,
                            'was_adjusted' => $wasAdjusted,
                            'max_quantity' => $maxQuantity
                        ];
                    
                        $mergedItems++;
                    
                        // Remove from map to track processed items
                        unset($existingItemMap[$key]);
                    } else {
                        // Add new item to cart
                        error_log("Adding new item to cart");
                        $this->cartRepository->addCartItem(
                            $cart['id'], 
                            $productId, 
                            $variantId, 
                            $quantity, 
                            $priceWithTax, 
                            $taxRate
                        );
                    
                        $processedItems++;
                    }
                } catch (Exception $e) {
                    // Log the error but continue processing other items
                    error_log("Error processing item {$productId}-{$variantId}: " . $e->getMessage());
                    $skippedItems++;
                    continue;
                }
            }
        
            error_log("Processed {$processedItems} new items, merged {$mergedItems} items, skipped {$skippedItems} items");
            error_log("Preserved " . count($existingItemMap) . " existing items");
        
            // DO NOT remove any items that were in the cart but not in the payload
            // This is the key change - we keep all existing items
        
            // Update cart totals immediately after syncing
            $this->updateCartTotalsInDatabase($cart['id']);
        
            // Return updated cart
            $updatedCart = $this->getOrCreateCart($userId);
        
            // Add sync statistics to response
            $updatedCart['sync_stats'] = [
                'processed_items' => $processedItems,
                'merged_items' => $mergedItems,
                'skipped_items' => $skippedItems,
                'preserved_items' => count($existingItemMap)
            ];
        
            // Add merge details
            if (!empty($mergeDetails)) {
                $updatedCart['merge_details'] = $mergeDetails;
            }
        
            // Add preserved items list
            if (!empty($existingItemMap)) {
                $preservedItems = [];
                foreach ($existingItemMap as $key => $item) {
                    $preservedItems[] = [
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'],
                        'quantity' => $item['quantity']
                    ];
                }
                $updatedCart['preserved_items'] = $preservedItems;
            }
        
            return $updatedCart;
        } catch (Exception $e) {
            error_log("Error in syncCartItems: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update cart item quantity by product and variant ID
     * 
     * @param int $userId User ID
     * @param int $productId Product ID
     * @param int $variantId Variant ID
     * @param int $quantity New quantity
     * @return array Updated cart data
     */
    public function updateCartItemByProductVariant($userId, $productId, $variantId, $quantity)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
        
            if (!$cart) {
                throw new Exception("Cart not found");
            }
        
            // Find the cart item by product_id and variant_id
            $cartItem = $this->getCartItemByProductVariant($cart['id'], $productId, $variantId);
            if (!$cartItem) {
                throw new Exception("Cart item not found");
            }
        
            // Get product and variant for validation
            $product = $this->productRepository->getProductById($productId);
            if (!$product) {
                throw new Exception("Product not found");
            }
        
            $variant = $this->findVariantInProduct($product, $variantId);
            if (!$variant) {
                throw new Exception("Variant not found");
            }
        
            // Validate quantity against variant limits
            $this->validateQuantity($variant, $quantity, $quantity);
        
            // Update item quantity
            $this->cartRepository->updateCartItemQuantity($cart['id'], $cartItem['id'], $quantity);
        
            // Update cart totals immediately after updating item
            $this->updateCartTotalsInDatabase($cart['id']);
        
            // Return updated cart
            return $this->getOrCreateCart($userId);
        } catch (Exception $e) {
            error_log("Error in updateCartItemByProductVariant: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove item from cart by product and variant ID
     * 
     * @param int $userId User ID
     * @param int $productId Product ID
     * @param int $variantId Variant ID
     * @return array Updated cart data
     */
    public function removeFromCartByProductVariant($userId, $productId, $variantId)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
        
            if (!$cart) {
                throw new Exception("Cart not found");
            }
        
            // Find the cart item by product_id and variant_id
            $cartItem = $this->getCartItemByProductVariant($cart['id'], $productId, $variantId);
            if (!$cartItem) {
                throw new Exception("Cart item not found");
            }
        
            // Remove item
            $this->cartRepository->removeCartItem($cart['id'], $cartItem['id']);
        
            // Update cart totals immediately after removing item
            $this->updateCartTotalsInDatabase($cart['id']);
        
            // Return updated cart
            return $this->getOrCreateCart($userId);
        } catch (Exception $e) {
            error_log("Error in removeFromCartByProductVariant: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Reduce cart item quantity by specified amount (partial removal)
     * 
     * @param int $userId User ID
     * @param int $itemId Cart item ID
     * @param int $reduceBy Quantity to reduce by
     * @return array Updated cart data
     */
    public function reduceCartItemQuantity($userId, $itemId, $reduceBy)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
        
            if (!$cart) {
                throw new Exception("Cart not found");
            }
        
            // Get the cart item
            $cartItem = $this->getCartItemById($cart['id'], $itemId);
            if (!$cartItem) {
                throw new Exception("Cart item not found");
            }
        
            $newQuantity = $cartItem['quantity'] - $reduceBy;
        
            if ($newQuantity <= 0) {
                // Remove item completely if quantity becomes 0 or negative
                $this->cartRepository->removeCartItem($cart['id'], $itemId);
            } else {
                // Update with new quantity
                $this->cartRepository->updateCartItemQuantity($cart['id'], $itemId, $newQuantity);
            }
        
            // Update cart totals immediately
            $this->updateCartTotalsInDatabase($cart['id']);
        
            // Return updated cart
            return $this->getOrCreateCart($userId);
        } catch (Exception $e) {
            error_log("Error in reduceCartItemQuantity: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Reduce cart item quantity by product and variant ID (partial removal)
     * 
     * @param int $userId User ID
     * @param int $productId Product ID
     * @param int $variantId Variant ID
     * @param int $reduceBy Quantity to reduce by
     * @return array Updated cart data
     */
    public function reduceCartItemQuantityByProductVariant($userId, $productId, $variantId, $reduceBy)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
        
            if (!$cart) {
                throw new Exception("Cart not found");
            }
        
            // Find the cart item by product_id and variant_id
            $cartItem = $this->getCartItemByProductVariant($cart['id'], $productId, $variantId);
            if (!$cartItem) {
                throw new Exception("Cart item not found");
            }
        
            $newQuantity = $cartItem['quantity'] - $reduceBy;
        
            if ($newQuantity <= 0) {
                // Remove item completely if quantity becomes 0 or negative
                $this->cartRepository->removeCartItem($cart['id'], $cartItem['id']);
            } else {
                // Update with new quantity
                $this->cartRepository->updateCartItemQuantity($cart['id'], $cartItem['id'], $newQuantity);
            }
        
            // Update cart totals immediately
            $this->updateCartTotalsInDatabase($cart['id']);
        
            // Return updated cart
            return $this->getOrCreateCart($userId);
        } catch (Exception $e) {
            error_log("Error in reduceCartItemQuantityByProductVariant: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get cart item by product and variant ID
     * 
     * @param int $cartId Cart ID
     * @param int $productId Product ID
     * @param int $variantId Variant ID
     * @return array|null Cart item data or null if not found
     */
    private function getCartItemByProductVariant($cartId, $productId, $variantId)
    {
        try {
            $cartItems = $this->cartRepository->getCartItems($cartId);
        
            foreach ($cartItems as $item) {
                if ($item['product_id'] == $productId && $item['variant_id'] == $variantId) {
                    return $item;
                }
            }
        
            return null;
        } catch (Exception $e) {
            error_log("Error getting cart item by product variant: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update cart totals in database after any cart modification
     * 
     * @param int $cartId Cart ID
     */
    private function updateCartTotalsInDatabase($cartId)
    {
        try {
            error_log("Updating cart totals in database for cart ID: " . $cartId);
            
            // Get basic cart items
            $basicItems = $this->cartRepository->getCartItems($cartId);
            error_log("Found " . count($basicItems) . " basic items for totals calculation");
            
            // Convert to format for CartItemService
            $itemsForService = [];
            foreach ($basicItems as $item) {
                $itemsForService[] = [
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity']
                ];
            }
            
            // Get detailed cart data
            $detailedCartData = $this->cartItemService->getCartItemsDetails($itemsForService);
            
            // Separate active items only for totals calculation
            $activeItems = [];
            foreach ($detailedCartData['items'] as $item) {
                if ($item['quantity_status'] === 'valid' && $item['is_active'] && !$item['is_deleted']) {
                    $activeItems[] = $item;
                }
            }
            
            error_log("Found " . count($activeItems) . " active items for totals calculation");
            
            // Calculate totals from active items
            $cartTotals = $this->calculateTotalsFromItems($activeItems);
            error_log("Calculated totals for database update: " . json_encode($cartTotals));
            
            // Get applied coupons and apply discount only if valid
            $coupons = $this->cartRepository->getCartCoupons($cartId);
            if (!empty($coupons)) {
                $coupon = $coupons[0];
                
                // Re-validate coupon before applying discount in database
                $validation = $this->validateCoupon($coupon['coupon_code'], $cartTotals['subtotal'], null);
                
                if ($validation['valid']) {
                    $couponDiscountAmount = $validation['discount_amount'];
                    
                    // Update totals with coupon discount
                    $cartTotals['coupon_discount_amount'] = $couponDiscountAmount;

                    // Calculate total after coupon discount
                    $totalAfterCoupon = $cartTotals['subtotal'] - $couponDiscountAmount;
                    $cartTotals['amount_before_roundoff'] = $totalAfterCoupon;

                    // Apply roundoff
                    $finalTotal = round($totalAfterCoupon);
                    $roundoff = $finalTotal - $totalAfterCoupon;

                    $cartTotals['total'] = $finalTotal;
                    $cartTotals['roundoff'] = round($roundoff, 2);

                    // Calculate roundoff savings
                    $roundoffSavings = $roundoff < 0 ? abs($roundoff) : 0;
                    $cartTotals['roundoff_savings'] = round($roundoffSavings, 2);

                    // Calculate total discount amount INCLUDING roundoff savings (properly rounded)
                    $cartTotals['total_discount_amount'] = round($cartTotals['product_discount_amount'] + $couponDiscountAmount + $roundoffSavings, 2);
                    $cartTotals['total_savings'] = $cartTotals['total_discount_amount'];
                    
                    error_log("Applied valid coupon discount in database update: " . $couponDiscountAmount . ", Amount before roundoff: " . $cartTotals['amount_before_roundoff'] . ", Roundoff: " . $roundoff . ", Total savings: " . $cartTotals['total_savings']);
                } else {
                    // Coupon is invalid, don't apply discount but keep coupon in database
                    error_log("Coupon is invalid, not applying discount in database update: " . $validation['message']);
                }
            } else {
                // No coupon applied, but still calculate roundoff if needed
                $totalBeforeRoundoff = $cartTotals['subtotal'];
                $cartTotals['amount_before_roundoff'] = $totalBeforeRoundoff;
                $finalTotal = round($totalBeforeRoundoff);
                $roundoff = $finalTotal - $totalBeforeRoundoff;

                if (abs($roundoff) > 0.001) { // Only add roundoff if it's significant
                    $cartTotals['roundoff'] = round($roundoff, 2);
                    $cartTotals['total'] = $finalTotal;
                    
                    // Calculate roundoff savings
                    $roundoffSavings = $roundoff < 0 ? abs($roundoff) : 0;
                    $cartTotals['roundoff_savings'] = round($roundoffSavings, 2);
                    
                    // Calculate total discount amount INCLUDING roundoff savings (properly rounded)
                    $cartTotals['total_discount_amount'] = round($cartTotals['product_discount_amount'] + $roundoffSavings, 2);
                    $cartTotals['total_savings'] = $cartTotals['total_discount_amount'];
                } else {
                    $cartTotals['roundoff'] = 0;
                    $cartTotals['roundoff_savings'] = 0;
                    $cartTotals['total_discount_amount'] = $cartTotals['product_discount_amount'];
                    $cartTotals['total_savings'] = $cartTotals['product_discount_amount'];
                }
            }
            
            // Update totals in database
            $result = $this->cartRepository->updateCartTotals($cartId, $cartTotals);
            error_log("Database update result: " . ($result ? 'SUCCESS' : 'FAILED'));
            
        } catch (Exception $e) {
            error_log("Error updating cart totals in database: " . $e->getMessage());
        }
    }

    /**
     * Get all available coupons
     * 
     * @return array List of available coupons
     */
    public function getAvailableCoupons()
    {
        try {
            return $this->couponRepository->getActiveCoupons();
        } catch (Exception $e) {
            error_log("Error in getAvailableCoupons: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all available coupons for a specific user
     * 
     * @param int $userId User ID
     * @return array List of available coupons for this user
     */
    public function getAvailableCouponsForUser($userId)
    {
        try {
            error_log("Getting available coupons for user: {$userId}");
            
            // Get all active coupons
            $allCoupons = $this->couponRepository->getActiveCoupons();
            
            $userEligibleCoupons = [];
            
            foreach ($allCoupons as $coupon) {
                $isEligible = true;
                $userUsageCount = 0;
                $remainingUses = null;
                
                // Check per-user usage limit if set
                if (isset($coupon['per_user_limit']) && $coupon['per_user_limit'] > 0) {
                    $userUsageCount = $this->getUserCouponUsage($coupon['id'], $userId);
                    
                    if ($userUsageCount >= $coupon['per_user_limit']) {
                        $isEligible = false;
                        error_log("User {$userId} has exceeded per-user limit for coupon {$coupon['code']}: {$userUsageCount}/{$coupon['per_user_limit']}");
                    } else {
                        $remainingUses = $coupon['per_user_limit'] - $userUsageCount;
                    }
                } else {
                    // If no per-user limit, get usage count for display purposes
                    $userUsageCount = $this->getUserCouponUsage($coupon['id'], $userId);
                }
                
                // Check global usage limit
                if ($isEligible && $coupon['usage_limit'] && $coupon['usage_limit'] > 0) {
                    $totalUsage = $this->couponRepository->getCouponUsageCount($coupon['id']);
                    
                    if ($totalUsage >= $coupon['usage_limit']) {
                        $isEligible = false;
                        error_log("Coupon {$coupon['code']} has reached global usage limit: {$totalUsage}/{$coupon['usage_limit']}");
                        
                        // Auto-deactivate if not already done
                        $this->couponRepository->deactivateCoupon($coupon['id'], "Global usage limit reached during user coupon fetch");
                    }
                }
                
                // Double-check coupon is still active (in case it was deactivated above)
                if ($isEligible && !$coupon['is_active']) {
                    $isEligible = false;
                    error_log("Coupon {$coupon['code']} is not active");
                }
                
                // Check date validity
                if ($isEligible) {
                    $currentDate = date('Y-m-d H:i:s');
                    
                    // Check start date
                    if ($currentDate < $coupon['start_date']) {
                        $isEligible = false;
                        error_log("Coupon {$coupon['code']} not yet valid");
                    }
                    
                    // Check end date if set
                    if ($coupon['end_date'] && $currentDate > $coupon['end_date']) {
                        $isEligible = false;
                        error_log("Coupon {$coupon['code']} has expired");
                    }
                }
                
                // Only include eligible coupons
                if ($isEligible) {
                    // Add user-specific information to coupon data
                    $coupon['user_usage_count'] = $userUsageCount;
                    $coupon['remaining_uses'] = $remainingUses;
                    
                    $userEligibleCoupons[] = $coupon;
                    error_log("Coupon {$coupon['code']} is eligible for user {$userId}");
                } else {
                    error_log("Coupon {$coupon['code']} is NOT eligible for user {$userId}");
                }
            }
            
            error_log("Found " . count($userEligibleCoupons) . " eligible coupons for user {$userId}");
            
            return $userEligibleCoupons;
        } catch (Exception $e) {
            error_log("Error in getAvailableCouponsForUser: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Validate a coupon code with comprehensive checks
     * 
     * @param string $couponCode Coupon code
     * @param float $cartTotal Cart total amount
     * @param int $userId User ID
     * @return array Validation result with coupon details and discount amount
     */
    public function validateCoupon($couponCode, $cartTotal, $userId = null)
    {
        try {
            error_log("Validating coupon: {$couponCode} for cart total: {$cartTotal} and user: {$userId}");
            
            // Get coupon by code
            $coupon = $this->couponRepository->getCouponByCode($couponCode);
            
            if (!$coupon) {
                error_log("Coupon not found: {$couponCode}");
                return [
                    'valid' => false,
                    'message' => "Invalid coupon code"
                ];
            }
            
            // Check if coupon is active
            if (!$coupon['is_active']) {
                error_log("Coupon not active: {$couponCode}");
                return [
                    'valid' => false,
                    'message' => "This coupon is not active"
                ];
            }
            
            // Check if coupon is soft deleted
            if (!empty($coupon['deleted_at']) && $coupon['deleted_at'] !== '0000-00-00 00:00:00') {
                error_log("Coupon is deleted: {$couponCode}");
                return [
                    'valid' => false,
                    'message' => "This coupon is no longer available"
                ];
            }
            
            // Check date validity
            $currentDate = date('Y-m-d H:i:s');
            
            // Check start date
            if ($currentDate < $coupon['start_date']) {
                $formattedStartDate = date('d M Y, h:i A', strtotime($coupon['start_date']));
                error_log("Coupon not yet valid: {$couponCode}, starts at {$formattedStartDate}");
                return [
                    'valid' => false,
                    'message' => "This coupon is not yet valid. It will be active from {$formattedStartDate}"
                ];
            }
            
            // Check end date if set
            if ($coupon['end_date'] && $currentDate > $coupon['end_date']) {
                $formattedEndDate = date('d M Y, h:i A', strtotime($coupon['end_date']));
                error_log("Coupon expired: {$couponCode}, ended at {$formattedEndDate}");
                return [
                    'valid' => false,
                    'message' => "This coupon has expired on {$formattedEndDate}"
                ];
            }
            
            // Check global usage limit and auto-deactivate if reached
            if ($coupon['usage_limit'] && $coupon['usage_limit'] > 0) {
                $usageCount = $this->couponRepository->getCouponUsageCount($coupon['id']);
                
                if ($usageCount >= $coupon['usage_limit']) {
                    // Auto-deactivate the coupon
                    $this->couponRepository->deactivateCoupon($coupon['id'], "Total usage limit reached: {$usageCount}/{$coupon['usage_limit']}");
                    
                    error_log("Coupon usage limit reached and deactivated: {$couponCode}, used {$usageCount} times");
                    return [
                        'valid' => false,
                        'message' => "This coupon has reached its usage limit and is no longer available"
                    ];
                }
                
                error_log("Coupon global usage: {$usageCount}/{$coupon['usage_limit']}");
            }

            // Check per-user usage limit if set
            if ($userId && isset($coupon['per_user_limit']) && $coupon['per_user_limit'] > 0) {
                $userUsageCount = $this->getUserCouponUsage($coupon['id'], $userId);
                if ($userUsageCount >= $coupon['per_user_limit']) {
                    $limitText = $coupon['per_user_limit'] == 1 ? 'once' : $coupon['per_user_limit'] . ' times';
                    error_log("User {$userId} has exceeded per-user limit for coupon {$couponCode}: {$userUsageCount}/{$coupon['per_user_limit']}");
                    return [
                        'valid' => false,
                        'message' => "You have already used this coupon the maximum number of times ({$limitText})"
                    ];
                }
                
                error_log("User {$userId} coupon usage: {$userUsageCount}/{$coupon['per_user_limit']}");
            }
            
            // Check minimum purchase amount
            if ($cartTotal < $coupon['minimum_order_value']) {
                $formattedMinimum = number_format($coupon['minimum_order_value'], 2);
                $formattedCartTotal = number_format($cartTotal, 2);
                error_log("Cart total below minimum: {$formattedCartTotal} < {$formattedMinimum}");
                return [
                    'valid' => false,
                    'message' => "Minimum purchase amount of ₹{$formattedMinimum} required. Your cart total is ₹{$formattedCartTotal}"
                ];
            }
            
            // Calculate discount
            $discountAmount = 0;
            
            if ($coupon['discount_type'] === 'percentage') {
                // Calculate percentage discount
                $discountAmount = ($cartTotal * $coupon['discount_value']) / 100;
                error_log("Percentage discount: {$coupon['discount_value']}% of {$cartTotal} = {$discountAmount}");
                
                // Apply maximum discount if set
                if ($coupon['maximum_discount_amount'] && $discountAmount > $coupon['maximum_discount_amount']) {
                    $discountAmount = $coupon['maximum_discount_amount'];
                    error_log("Capped at maximum discount: {$coupon['maximum_discount_amount']}");
                }
            } else if ($coupon['discount_type'] === 'fixed_amount') {
                // Fixed amount discount
                $discountAmount = $coupon['discount_value'];
                error_log("Fixed discount: {$discountAmount}");
                
                // Ensure discount doesn't exceed cart total
                if ($discountAmount > $cartTotal) {
                    $discountAmount = $cartTotal;
                    error_log("Discount capped at cart total: {$cartTotal}");
                }
            }
            
            // Round discount amount to 2 decimal places
            $discountAmount = round($discountAmount, 2);
            $formattedDiscount = number_format($discountAmount, 2);
            
            error_log("Coupon {$couponCode} is valid, discount: {$formattedDiscount}");
            
            return [
                'valid' => true,
                'coupon' => $coupon,
                'discount_amount' => $discountAmount,
                'message' => "Coupon applied successfully! You saved ₹{$formattedDiscount}"
            ];
        } catch (Exception $e) {
            error_log("Error validating coupon: " . $e->getMessage());
            return [
                'valid' => false,
                'message' => "Error validating coupon: " . $e->getMessage()
            ];
        }
    }

    /**
     * Get number of times a user has used a specific coupon
     * 
     * @param int $couponId Coupon ID
     * @param int $userId User ID
     * @return int Number of times used
     */
    private function getUserCouponUsage($couponId, $userId)
    {
        try {
            return $this->couponRepository->getUserCouponUsageCount($couponId, $userId);
        } catch (Exception $e) {
            error_log("Error getting user coupon usage: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Validate quantity against variant limits
     * 
     * @param array $variant Variant data
     * @param int $totalQuantity Total quantity (existing + new)
     * @param int $requestedQuantity Requested quantity to add
     * @throws Exception If quantity validation fails
     */
    private function validateQuantity($variant, $totalQuantity, $requestedQuantity)
    {
        // Get min and max quantities from variant
        $minQuantity = $variant['min_quantity'] ?? 1;
        $maxQuantity = $variant['max_quantity'] ?? null;
        
        // Validate requested quantity is positive
        if ($requestedQuantity <= 0) {
            throw new Exception("Quantity must be greater than 0");
        }
        
        // Validate against minimum quantity
        if ($totalQuantity < $minQuantity) {
            throw new Exception("Minimum quantity for this variant is {$minQuantity}");
        }
        
        // Validate against maximum quantity if set
        if ($maxQuantity && $totalQuantity > $maxQuantity) {
            throw new Exception("Maximum quantity for this variant is {$maxQuantity}. You currently have " . ($totalQuantity - $requestedQuantity) . " in cart.");
        }
        
        // Additional validation for stock if available
        if (isset($variant['stock_quantity']) && $variant['stock_quantity'] !== null) {
            if ($totalQuantity > $variant['stock_quantity']) {
                throw new Exception("Only {$variant['stock_quantity']} units available in stock");
            }
        }
    }

    /**
     * Get existing quantity for a specific product variant in cart
     * 
     * @param int $cartId Cart ID
     * @param int $productId Product ID
     * @param int $variantId Variant ID
     * @return int Existing quantity
     */
    private function getExistingCartItemQuantity($cartId, $productId, $variantId)
    {
        try {
            $cartItems = $this->cartRepository->getCartItems($cartId);
            
            foreach ($cartItems as $item) {
                if ($item['product_id'] == $productId && $item['variant_id'] == $variantId) {
                    return $item['quantity'];
                }
            }
            
            return 0;
        } catch (Exception $e) {
            error_log("Error getting existing cart item quantity: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get cart item by ID
     * 
     * @param int $cartId Cart ID
     * @param int $itemId Cart item ID
     * @return array|null Cart item data or null if not found
     */
    private function getCartItemById($cartId, $itemId)
    {
        try {
            $cartItems = $this->cartRepository->getCartItems($cartId);
            
            foreach ($cartItems as $item) {
                if ($item['id'] == $itemId) {
                    return $item;
                }
            }
            
            return null;
        } catch (Exception $e) {
            error_log("Error getting cart item by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Find a variant in a product by variant ID
     * 
     * @param array $product Product data
     * @param int $variantId Variant ID to find
     * @return array|null Variant data or null if not found
     */
    private function findVariantInProduct($product, $variantId)
    {
        // Check different possible locations for variants
        $variantLocations = ['variants', 'product_variants', 'variant'];
        
        foreach ($variantLocations as $location) {
            if (isset($product[$location]) && is_array($product[$location])) {
                foreach ($product[$location] as $variant) {
                    if (isset($variant['id']) && $variant['id'] == $variantId) {
                        return $variant;
                    }
                }
            }
        }
        
        // If we can't find the variant in the product data, try to get it directly from database
        try {
            // Query the product_variants table directly
            $db = \App\Core\Database::getInstance();
            $sql = "SELECT * FROM product_variants WHERE id = :variant_id AND product_id = :product_id";
            $variant = $db->fetch($sql, [
                ':variant_id' => $variantId,
                ':product_id' => $product['id']
            ]);
            
            if ($variant) {
                return $variant;
            }
            
            return null;
        } catch (Exception $e) {
            error_log("Error getting variant by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate totals from active items only
     * 
     * @param array $items Active cart items
     * @return array Calculated totals
     */
    private function calculateTotalsFromItems($items)
    {
        $subtotal = 0;
        $baseAmount = 0;
        $taxAmount = 0;
        $productDiscountAmount = 0; // Product-level discounts (original_price - sale_price)
        $itemCount = count($items);
        $totalQuantity = 0;

        foreach ($items as $item) {
            $subtotal += $item['line_total'];
            $baseAmount += $item['base_amount'];
            $taxAmount += $item['line_tax_amount'];
            $productDiscountAmount += $item['line_discount_amount']; // Sum of all product discounts
            $totalQuantity += $item['quantity'];
        }

        return [
            'subtotal' => round($subtotal),
            'base_amount' => round($baseAmount, 2),
            'tax_amount' => round($taxAmount, 2),
            'product_discount_amount' => round($productDiscountAmount), // Product-level discounts
            'coupon_discount_amount' => 0, // Will be set separately when coupon is applied
            'total_discount_amount' => round($productDiscountAmount), // Will include roundoff savings when calculated
            'amount_before_roundoff' => round($subtotal, 2), // Amount before any roundoff
            'roundoff' => 0, // Will be calculated when needed
            'roundoff_savings' => 0, // Will be calculated when needed
            'total_savings' => round($productDiscountAmount), // Will include roundoff savings when calculated
            'total' => round($subtotal),
            'item_count' => $itemCount,
            'total_quantity' => $totalQuantity
        ];
    }

    /**
     * Auto-adjust cart quantities and handle SKU conflicts
     * 
     * @param int $cartId Cart ID
     * @return array Adjustment results
     */
    private function autoAdjustCartQuantities($cartId)
    {
        try {
            $adjustments = [];
            $skuConflicts = [];
            
            // Get all cart items
            $cartItems = $this->cartRepository->getCartItems($cartId);
            
            // Track SKUs to detect conflicts
            $skuMap = [];
            
            foreach ($cartItems as $item) {
                // Get product and variant details
                $product = $this->productRepository->getProductById($item['product_id']);
                if (!$product) continue;
                
                $variant = $this->findVariantInProduct($product, $item['variant_id']);
                if (!$variant) continue;
                
                // Check for SKU conflicts
                $sku = $variant['sku'] ?? '';
                if (!empty($sku)) {
                    if (isset($skuMap[$sku]) && $skuMap[$sku] !== $item['variant_id']) {
                        // SKU conflict detected
                        $skuConflicts[] = [
                            'sku' => $sku,
                            'conflicting_variants' => [$skuMap[$sku], $item['variant_id']],
                            'message' => "SKU '{$sku}' is used by multiple variants in cart"
                        ];
                    }
                    $skuMap[$sku] = $item['variant_id'];
                }
                
                // Check quantity limits
                $minQuantity = $variant['min_quantity'] ?? 1;
                $maxQuantity = $variant['max_quantity'] ?? null;
                $currentQuantity = $item['quantity'];
                
                $needsAdjustment = false;
                $newQuantity = $currentQuantity;
                $reason = '';
                
                if ($currentQuantity < $minQuantity) {
                    $newQuantity = $minQuantity;
                    $needsAdjustment = true;
                    $reason = "Adjusted to minimum quantity ({$minQuantity})";
                } elseif ($maxQuantity !== null && $currentQuantity > $maxQuantity) {
                    $newQuantity = $maxQuantity;
                    $needsAdjustment = true;
                    $reason = "Adjusted to maximum quantity ({$maxQuantity})";
                }
                
                if ($needsAdjustment) {
                    // Update the cart item quantity
                    $this->cartRepository->updateCartItemQuantity($cartId, $item['id'], $newQuantity);
                    
                    $adjustments[] = [
                        'item_id' => $item['id'],
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'],
                        'product_name' => $product['name'] ?? 'Unknown Product',
                        'variant_name' => $variant['name'] ?? 'Unknown Variant',
                        'old_quantity' => $currentQuantity,
                        'new_quantity' => $newQuantity,
                        'reason' => $reason
                    ];
                    
                    error_log("Auto-adjusted cart item {$item['id']}: {$currentQuantity} -> {$newQuantity} ({$reason})");
                }
            }
            
            return [
                'adjustments' => $adjustments,
                'sku_conflicts' => $skuConflicts
            ];
        } catch (Exception $e) {
            error_log("Error in autoAdjustCartQuantities: " . $e->getMessage());
            return [
                'adjustments' => [],
                'sku_conflicts' => []
            ];
        }
    }

    /**
     * Get cart history for a user
     * 
     * @param int $userId User ID
     * @param int $page Page number
     * @param int $limit Items per page
     * @return array Cart history data
     */
    public function getCartHistory($userId, $page = 1, $limit = 10)
    {
        try {
            $offset = ($page - 1) * $limit;
            
            // Get cart history (converted carts)
            $historySql = "
                SELECT 
                    c.id,
                    c.created_at,
                    c.updated_at,
                    c.subtotal,
                    c.total_discount_amount,
                    c.coupon_discount_amount,
                    c.total as final_total,
                    c.item_count,
                    c.total_quantity,
                    c.total_savings,
                    c.roundoff_savings,
                    COUNT(ci.id) as items_count
                FROM carts c
                LEFT JOIN cart_items ci ON c.id = ci.cart_id
                WHERE c.user_id = :user_id AND c.status = 'converted'
                GROUP BY c.id
                ORDER BY c.updated_at DESC
                LIMIT :limit OFFSET :offset
            ";
            
            $db = \App\Core\Database::getInstance();

            $history = $db->fetchAll($historySql, [
                ':user_id' => $userId,
                ':limit' => $limit,
                ':offset' => $offset
            ]);

            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM carts WHERE user_id = :user_id AND status = 'converted'";
            $countResult = $db->fetch($countSql, [':user_id' => $userId]);
            $totalCarts = $countResult['total'] ?? 0;
            
            // Format history for response
            $formattedHistory = [];
            foreach ($history as $cart) {
                $formattedHistory[] = [
                    'id' => $cart['id'],
                    'created_at' => $cart['created_at'],
                    'converted_at' => $cart['updated_at'],
                    'subtotal' => floatval($cart['subtotal']),
                    'total_discount' => floatval($cart['total_discount_amount']),
                    'coupon_discount' => floatval($cart['coupon_discount_amount']),
                    'final_total' => floatval($cart['final_total']),
                    'items_count' => intval($cart['items_count']),
                    'total_quantity' => intval($cart['total_quantity']),
                    'total_savings' => floatval($cart['total_savings']),
                    'roundoff_savings' => floatval($cart['roundoff_savings'])
                ];
            }
            
            return [
                'cart_history' => $formattedHistory,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $totalCarts,
                    'total_pages' => ceil($totalCarts / $limit),
                    'has_more' => ($page * $limit) < $totalCarts
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Error getting cart history: " . $e->getMessage());
            throw new Exception("Failed to retrieve cart history");
        }
    }

    /**
     * Clear user's cart
     * 
     * @param int $userId User ID
     * @return bool Success status
     */
    public function clearCart($userId)
    {
        try {
            // Get active cart
            $cart = $this->cartRepository->getActiveCart($userId);
            
            if (!$cart) {
                return true; // No cart to clear
            }
            
            // Remove all cart items
            $db = \App\Core\Database::getInstance();
            $db->query("DELETE FROM cart_items WHERE cart_id = :cart_id", [':cart_id' => $cart['id']]);
            
            // Update cart status to cleared and reset totals
            $db->query("UPDATE carts SET 
                status = 'cleared',
                base_amount = 0,
                gst_amount = 0,
                subtotal = 0,
                roundoff = 0,
                final_total = 0,
                coupon_id = NULL,
                coupon_code = NULL,
                discount_type = NULL,
                discount_value = NULL,
                discount_amount = NULL,
                updated_at = NOW()
                WHERE id = :cart_id", [':cart_id' => $cart['id']]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error clearing cart: " . $e->getMessage());
            throw $e;
        }
    }
}
