<?php

namespace App\Features\Open\Cart\DataAccess;

use App\Core\Database;
use Exception;

class CartRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Create a new cart
     * 
     * @param int $userId User ID
     * @return int The ID of the created cart
     */
    public function createCart($userId)
    {
        try {
            $data = [
                'user_id' => $userId,
                'status' => 'active',
                'coupon_id' => null,
                'coupon_code' => null,
                'discount_type' => null,
                'discount_value' => null,
                'discount_amount' => null,
                'base_amount' => 0,
                'gst_amount' => 0,
                'subtotal' => 0,
                'roundoff' => 0,
                'final_total' => 0,
                'expires_at' => date('Y-m-d H:i:s', strtotime('+30 days'))
            ];
            
            return $this->db->insert('carts', $data);
        } catch (Exception $e) {
            error_log("Error creating cart: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get active cart for a user
     * 
     * @param int $userId User ID
     * @return array|null Cart data or null if not found
     */
    public function getActiveCart($userId)
    {
        try {
            $sql = "SELECT * FROM carts WHERE user_id = :user_id AND status = 'active' ORDER BY created_at DESC LIMIT 1";
            
            return $this->db->fetch($sql, [':user_id' => $userId]);
        } catch (Exception $e) {
            error_log("Error getting active cart: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get cart items for a specific cart - DIRECTLY FROM DATABASE
     * 
     * @param int $cartId Cart ID
     * @return array Cart items with product details and calculations
     */
    public function getCartItems($cartId)
    {
        try {
            // Get cart items directly from cart_items table with product details
            $sql = "SELECT 
                        ci.id,
                        ci.cart_id,
                        ci.product_id,
                        ci.variant_id,
                        ci.quantity,
                        ci.price_with_tax,
                        ci.tax_rate,
                        ci.base_price,
                        ci.igst_amount,
                        ci.line_total,
                        ci.created_at,
                        ci.updated_at,
                        p.name,
                        COALESCE(
                            (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                            (SELECT image_path FROM product_images WHERE product_id = p.id ORDER BY display_order ASC, id ASC LIMIT 1)
                        ) as image
                    FROM cart_items ci
                    LEFT JOIN products p ON ci.product_id = p.id
                    WHERE ci.cart_id = :cart_id
                    ORDER BY ci.id ASC";
    
            $items = $this->db->fetchAll($sql, [':cart_id' => $cartId]);
            
            error_log("Retrieved " . count($items) . " cart items from database for cart ID: " . $cartId);
            
            // Log each item for debugging
            foreach ($items as $item) {
                error_log("DB Cart Item: ID={$item['id']}, Product={$item['product_id']}, Variant={$item['variant_id']}, Qty={$item['quantity']}");
            }
    
            // Fix any items with invalid prices
            foreach ($items as &$item) {
                if ($item['price_with_tax'] <= 0) {
                    error_log("Found cart item with invalid price, fixing: Item {$item['id']}");
                    
                    // Get correct price from product_variants table
                    $variantSql = "SELECT price, sale_price FROM product_variants WHERE id = :variant_id";
                    $variant = $this->db->fetch($variantSql, [':variant_id' => $item['variant_id']]);
                    
                    if ($variant) {
                        $correctPrice = 0;
                        if (isset($variant['sale_price']) && $variant['sale_price'] > 0) {
                            $correctPrice = (float) $variant['sale_price'];
                        } elseif (isset($variant['price']) && $variant['price'] > 0) {
                            $correctPrice = (float) $variant['price'];
                        }
                        
                        if ($correctPrice > 0) {
                            // Update the cart item with correct price
                            $updateSql = "UPDATE cart_items SET 
                                         price_with_tax = :price_with_tax,
                                         tax_rate = COALESCE(tax_rate, 5.0),
                                         updated_at = NOW() 
                                         WHERE id = :item_id";
                    
                            $this->db->query($updateSql, [
                                ':price_with_tax' => $correctPrice,
                                ':item_id' => $item['id']
                            ]);
                            
                            // Update the item in our result
                            $item['price_with_tax'] = $correctPrice;
                            
                            error_log("Fixed cart item {$item['id']} with correct price: {$correctPrice}");
                        }
                    }
                }
                
                // Add computed fields for compatibility
                $item['price'] = $item['price_with_tax'];
                $item['tax_amount'] = $item['igst_amount'];
                $item['base_amount'] = round($item['base_price'] * $item['quantity'], 2);
                $item['line_tax_amount'] = round($item['igst_amount'] * $item['quantity'], 2);
                $item['is_active'] = true;
                $item['stock_status'] = 'in_stock';
            }
    
            return $items;
        } catch (Exception $e) {
            error_log("Error getting cart items: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Add item to cart
     * 
     * @param int $cartId Cart ID
     * @param int $productId Product ID
     * @param int $variantId Variant ID
     * @param int $quantity Quantity
     * @param float $priceWithTax Price including GST
     * @param float $taxRate GST percentage
     * @return bool Success status
     */
    public function addCartItem($cartId, $productId, $variantId, $quantity, $priceWithTax, $taxRate)
    {
        try {
            error_log("Adding cart item - Product: {$productId}, Variant: {$variantId}, Price: {$priceWithTax}, Tax Rate: {$taxRate}, Quantity: {$quantity}");
            
            // Ensure we have valid price and tax rate
            if ($priceWithTax <= 0) {
                // Try to get price from product_variants table
                $variantSql = "SELECT price, sale_price FROM product_variants WHERE id = :variant_id";
                $variant = $this->db->fetch($variantSql, [':variant_id' => $variantId]);
                
                if ($variant) {
                    if (isset($variant['sale_price']) && $variant['sale_price'] > 0) {
                        $priceWithTax = (float) $variant['sale_price'];
                    } elseif (isset($variant['price']) && $variant['price'] > 0) {
                        $priceWithTax = (float) $variant['price'];
                    }
                }
                
                error_log("Retrieved price from variant: {$priceWithTax}");
            }
            
            if ($taxRate <= 0) {
                $taxRate = 5.0; // Default GST rate
            }
            
            // Check if item already exists in cart using the UNIQUE constraint
            $sql = "SELECT * FROM cart_items WHERE cart_id = :cart_id AND product_id = :product_id AND variant_id = :variant_id";
            $existingItem = $this->db->fetch($sql, [
                ':cart_id' => $cartId,
                ':product_id' => $productId,
                ':variant_id' => $variantId
            ]);

            if ($existingItem) {
                // Update quantity if item exists (add to existing quantity)
                $newQuantity = $existingItem['quantity'] + $quantity;
                
                $sql = "UPDATE cart_items SET 
                        quantity = :quantity,
                        price_with_tax = :price_with_tax,
                        tax_rate = :tax_rate,
                        updated_at = NOW() 
                        WHERE id = :item_id";
                
                $result = $this->db->query($sql, [
                    ':quantity' => $newQuantity,
                    ':price_with_tax' => $priceWithTax,
                    ':tax_rate' => $taxRate,
                    ':item_id' => $existingItem['id']
                ]);
                
                error_log("Updated existing cart item ID {$existingItem['id']} - new quantity: {$newQuantity}, price: {$priceWithTax}");
            } else {
                // Insert new item using INSERT IGNORE to handle race conditions
                $sql = "INSERT IGNORE INTO cart_items 
                        (cart_id, product_id, variant_id, quantity, price_with_tax, tax_rate) 
                        VALUES (:cart_id, :product_id, :variant_id, :quantity, :price_with_tax, :tax_rate)";
                
                $result = $this->db->query($sql, [
                    ':cart_id' => $cartId,
                    ':product_id' => $productId,
                    ':variant_id' => $variantId,
                    ':quantity' => $quantity,
                    ':price_with_tax' => $priceWithTax,
                    ':tax_rate' => $taxRate
                ]);
                
                error_log("Inserted new cart item with price: {$priceWithTax}");
            }
        
            // Recalculate cart totals
            $this->calculateCartTotals($cartId);
            
            return true;
        } catch (Exception $e) {
            error_log("Error adding cart item: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update cart item quantity
     * 
     * @param int $cartId Cart ID
     * @param int $itemId Cart item ID
     * @param int $quantity New quantity
     * @return bool Success status
     */
    public function updateCartItemQuantity($cartId, $itemId, $quantity)
    {
        try {
            if ($quantity <= 0) {
                // Remove item if quantity is 0 or negative
                return $this->removeCartItem($cartId, $itemId);
            }
            
            // Get current item to ensure we have the correct price
            $currentItem = $this->db->fetch("SELECT * FROM cart_items WHERE id = :item_id AND cart_id = :cart_id", [
                ':item_id' => $itemId,
                ':cart_id' => $cartId
            ]);
            
            if (!$currentItem) {
                throw new Exception("Cart item not found");
            }
            
            // Ensure price is valid
            $priceWithTax = $currentItem['price_with_tax'];
            if ($priceWithTax <= 0) {
                // Try to get price from product_variants table
                $variantSql = "SELECT price, sale_price FROM product_variants WHERE id = :variant_id";
                $variant = $this->db->fetch($variantSql, [':variant_id' => $currentItem['variant_id']]);
                
                if ($variant) {
                    if (isset($variant['sale_price']) && $variant['sale_price'] > 0) {
                        $priceWithTax = (float) $variant['sale_price'];
                    } elseif (isset($variant['price']) && $variant['price'] > 0) {
                        $priceWithTax = (float) $variant['price'];
                    }
                }
            }
            
            // Update quantity and ensure price is correct (generated columns will auto-recalculate)
            $sql = "UPDATE cart_items SET 
                    quantity = :quantity,
                    price_with_tax = :price_with_tax,
                    updated_at = NOW() 
                    WHERE id = :item_id AND cart_id = :cart_id";
            
            $this->db->query($sql, [
                ':quantity' => $quantity,
                ':price_with_tax' => $priceWithTax,
                ':item_id' => $itemId,
                ':cart_id' => $cartId
            ]);
            
            error_log("Updated cart item quantity to: {$quantity}, price: {$priceWithTax}");
            
            // Recalculate cart totals
            $this->calculateCartTotals($cartId);
            
            return true;
        } catch (Exception $e) {
            error_log("Error updating cart item: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove item from cart
     * 
     * @param int $cartId Cart ID
     * @param int $itemId Cart item ID
     * @return bool Success status
     */
    public function removeCartItem($cartId, $itemId)
    {
        try {
            $sql = "DELETE FROM cart_items WHERE id = :item_id AND cart_id = :cart_id";
            
            $this->db->query($sql, [
                ':item_id' => $itemId,
                ':cart_id' => $cartId
            ]);
            
            error_log("Removed cart item ID: {$itemId}");
            
            // Recalculate cart totals
            $this->calculateCartTotals($cartId);
            
            return true;
        } catch (Exception $e) {
            error_log("Error removing cart item: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Apply coupon to cart
     * 
     * @param int $cartId Cart ID
     * @param int $couponId Coupon ID
     * @param string $couponCode Coupon code
     * @param string $discountType Discount type (percentage, fixed_amount, free_shipping)
     * @param float $discountValue Discount value (percentage or amount)
     * @param float $discountAmount Calculated discount amount
     * @return bool Success status
     */
    public function applyCoupon($cartId, $couponId, $couponCode, $discountType, $discountValue, $discountAmount)
    {
        try {
            // Update the cart with coupon information
            $sql = "UPDATE carts SET 
                coupon_id = :coupon_id,
                coupon_code = :coupon_code,
                discount_type = :discount_type,
                discount_value = :discount_value,
                discount_amount = :discount_amount,
                updated_at = NOW()
                WHERE id = :cart_id";
        
            $this->db->query($sql, [
                ':coupon_id' => $couponId,
                ':coupon_code' => $couponCode,
                ':discount_type' => $discountType,
                ':discount_value' => $discountValue,
                ':discount_amount' => $discountAmount,
                ':cart_id' => $cartId
            ]);
            
            // Recalculate cart totals
            $this->calculateCartTotals($cartId);
            
            return true;
        } catch (Exception $e) {
            error_log("Error applying coupon: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove all coupons from cart
     * 
     * @param int $cartId Cart ID
     * @return bool Success status
     */
    public function removeCoupons($cartId)
    {
        try {
            $sql = "UPDATE carts SET 
                coupon_id = NULL,
                coupon_code = NULL,
                discount_type = NULL,
                discount_value = NULL,
                discount_amount = NULL,
                updated_at = NOW()
                WHERE id = :cart_id";
        
            $this->db->query($sql, [':cart_id' => $cartId]);
            
            // Recalculate cart totals
            $this->calculateCartTotals($cartId);
            
            return true;
        } catch (Exception $e) {
            error_log("Error removing coupons: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get applied coupons for a cart
     * 
     * @param int $cartId Cart ID
     * @return array Applied coupons
     */
    public function getCartCoupons($cartId)
    {
        try {
            $sql = "SELECT coupon_id, coupon_code, discount_type, discount_value, discount_amount 
                FROM carts 
                WHERE id = :cart_id AND coupon_id IS NOT NULL";
        
            $coupon = $this->db->fetch($sql, [':cart_id' => $cartId]);
        
            // Return an array of coupons (for compatibility with previous code)
            return $coupon ? [$coupon] : [];
        } catch (Exception $e) {
            error_log("Error getting cart coupons: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Calculate cart totals and update the cart record
     * 
     * @param int $cartId Cart ID
     * @return array Cart totals
     */
    public function calculateCartTotals($cartId)
    {
        try {
            // Get cart items with their calculated values (using generated columns)
            $sql = "SELECT *, 
                    ROUND(base_price * quantity, 2) as base_amount,
                    ROUND(igst_amount * quantity, 2) as line_tax_amount
                    FROM cart_items WHERE cart_id = :cart_id";
            $items = $this->db->fetchAll($sql, [':cart_id' => $cartId]);

            // Get cart with coupon information
            $cart = $this->db->fetch("SELECT * FROM carts WHERE id = :cart_id", [':cart_id' => $cartId]);

            if (empty($items)) {
                // Update cart with zero totals
                $this->db->query("UPDATE carts SET 
                    base_amount = 0,
                    gst_amount = 0,
                    subtotal = 0,
                    roundoff = 0,
                    final_total = 0,
                    updated_at = NOW()
                    WHERE id = :cart_id", [':cart_id' => $cartId]);
                    
                return [
                    'subtotal' => 0,
                    'base_amount' => 0,
                    'tax_amount' => 0,
                    'discount_amount' => 0,
                    'total' => 0,
                    'item_count' => 0,
                    'total_quantity' => 0
                ];
            }

            // Calculate totals from generated column values
            $baseAmount = 0;
            $taxAmount = 0;
            $subtotal = 0;
            $totalQuantity = 0;

            foreach ($items as $item) {
                $baseAmount += $item['base_amount'] ?? 0;
                $taxAmount += $item['line_tax_amount'] ?? 0;
                $subtotal += $item['line_total'] ?? 0;
                $totalQuantity += $item['quantity'] ?? 0;
            }

            // Get discount amount from cart
            $discountAmount = $cart['discount_amount'] ?? 0;
            
            // Calculate total before roundoff
            $totalBeforeRoundoff = $subtotal - $discountAmount;
            
            // Calculate final total (rounded to nearest integer)
            $finalTotal = round($totalBeforeRoundoff);
            
            // Calculate roundoff
            $roundoff = $finalTotal - $totalBeforeRoundoff;
            
            // Update cart with calculated totals
            $this->db->query("UPDATE carts SET 
                base_amount = :base_amount,
                gst_amount = :tax_amount,
                subtotal = :subtotal,
                roundoff = :roundoff,
                final_total = :final_total,
                updated_at = NOW()
                WHERE id = :cart_id", [
                ':base_amount' => $baseAmount,
                ':tax_amount' => $taxAmount,
                ':subtotal' => $subtotal,
                ':roundoff' => $roundoff,
                ':final_total' => $finalTotal,
                ':cart_id' => $cartId
            ]);

            error_log("Updated cart totals - Subtotal: {$subtotal}, Base: {$baseAmount}, Tax: {$taxAmount}, Final: {$finalTotal}");

            return [
                'subtotal' => $subtotal,
                'base_amount' => $baseAmount,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total' => $finalTotal,
                'item_count' => count($items),
                'total_quantity' => $totalQuantity
            ];
        } catch (Exception $e) {
            error_log("Error calculating cart totals: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update cart totals in the database
     * 
     * @param int $cartId Cart ID
     * @param array $totals Calculated totals array
     * @return bool Success status
     */
    public function updateCartTotals($cartId, $totals)
    {
        try {
            // Get current coupon discount from cart
            $cart = $this->db->fetch("SELECT discount_amount FROM carts WHERE id = :cart_id", [':cart_id' => $cartId]);
            $couponDiscountAmount = $cart['discount_amount'] ?? 0;
            
            // Calculate final total after all discounts
            $totalAfterDiscounts = $totals['subtotal'] - $couponDiscountAmount;
            $finalTotal = round($totalAfterDiscounts);
            $roundoff = $finalTotal - $totalAfterDiscounts;
        
            // Update cart with calculated totals
            $sql = "UPDATE carts SET 
                base_amount = :base_amount,
                gst_amount = :tax_amount,
                subtotal = :subtotal,
                roundoff = :roundoff,
                final_total = :final_total,
                updated_at = NOW()
                WHERE id = :cart_id";
            
            $result = $this->db->query($sql, [
                ':base_amount' => $totals['base_amount'],
                ':tax_amount' => $totals['tax_amount'],
                ':subtotal' => $totals['subtotal'],
                ':roundoff' => round($roundoff, 2),
                ':final_total' => $finalTotal,
                ':cart_id' => $cartId
            ]);
        
            error_log("Updated cart totals in database - Subtotal: {$totals['subtotal']}, Coupon Discount: {$couponDiscountAmount}, Final total: {$finalTotal}, Roundoff: " . round($roundoff, 2));
            return true;
        } catch (Exception $e) {
            error_log("Error updating cart totals: " . $e->getMessage());
            throw $e;
        }
    }
}
