<?php

namespace App\Features\Open\Orders\Services;

use App\Core\Database;
use App\Features\Open\Checkout\Services\CheckoutService;
use App\Features\Open\UserAddress\Services\UserAddressService;
use App\Features\Open\Cart\Services\CartService;
use App\Features\Open\Orders\DataAccess\OrderRepository;
use App\Features\Open\Orders\Utils\PaymentUtil;
use Exception;

class OrderService
{
    private $db;
    private $checkoutService;
    private $userAddressService;
    private $cartService;
    private $orderRepository;
    private $paymentUtil;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->checkoutService = new CheckoutService();
        $this->userAddressService = new UserAddressService();
        $this->cartService = new CartService();
        $this->orderRepository = new OrderRepository();
        $this->paymentUtil = new PaymentUtil();
    }

    /**
     * Create a new order
     * 
     * @param int $userId User ID
     * @param int $addressId Address ID
     * @param string $paymentMethod Payment method (cod, online)
     * @param string|null $paymentId Payment ID for online payments
     * @param array|null $additionalData Additional data for order
     * @return array Order data
     * @throws Exception If order creation fails
     */
    public function createOrder($userId, $addressId, $paymentMethod, $paymentId = null, $additionalData = null)
    {
        try {
            // Start transaction
            $this->db->beginTransaction();
            
            // Get checkout data to create order
            $checkoutData = $this->checkoutService->prepareCheckout($userId, $addressId, $paymentMethod);
            
            if (empty($checkoutData['items'])) {
                throw new Exception("Cannot create order with empty cart");
            }
            
            if (!$checkoutData['address']) {
                throw new Exception("Delivery address not found");
            }
            
            // Get coupon ID if coupon was applied
            $couponId = null;
            $couponCode = null;
            $couponDiscountAmount = 0;
            
            if (isset($checkoutData['coupon']) && !empty($checkoutData['coupon'])) {
                $couponCode = $checkoutData['coupon']['code'] ?? null;
                $couponDiscountAmount = $checkoutData['coupon']['discount'] ?? 0;
                
                if ($couponCode) {
                    // Look up coupon ID by code
                    $couponSql = "SELECT id FROM coupons WHERE code = :code AND is_active = 1 AND (deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00')";
                    $couponResult = $this->db->fetch($couponSql, [':code' => $couponCode]);
                    
                    if ($couponResult && isset($couponResult['id'])) {
                        $couponId = $couponResult['id'];
                        error_log("Found coupon ID: {$couponId} for code: {$couponCode}");
                    } else {
                        error_log("Could not find coupon ID for code: {$couponCode}");
                    }
                }
            }
            
            // Generate unique order number
            $orderNumber = $this->orderRepository->generateOrderNumber();
            
            // Create order record
            $orderId = $this->orderRepository->createOrder([
                'order_number' => $orderNumber,
                'user_id' => $userId,
                'status' => 'placed',
                'payment_status' => $paymentMethod === 'cod' ? 'pending' : 'paid',
                'original_price' => $this->calculateTotalOriginalPrice($checkoutData['items']),
                'base_amount' => $this->calculateTotalBaseAmount($checkoutData['items']),
                'subtotal' => $checkoutData['bill_breakdown']['amount_after_product_discounts']['amount'] ?? 0,
                'product_discount_amount' => $checkoutData['bill_breakdown']['product_discounts']['amount'] ?? 0,
                'coupon_discount_amount' => $checkoutData['bill_breakdown']['coupon_discount']['amount'] ?? 0,
                'total_discount_amount' => $checkoutData['bill_breakdown']['summary']['total_discounts'] ?? 0,
                'shipping_charges' => $checkoutData['bill_breakdown']['shipping']['amount'] ?? 0,
                'payment_charges' => $checkoutData['bill_breakdown']['payment_charges']['amount'] ?? 0,
                'amount_before_roundoff' => $checkoutData['bill_breakdown']['amount_before_roundoff']['amount'] ?? $this->calculateAmountBeforeRoundoff($checkoutData),
                'roundoff' => $checkoutData['bill_breakdown']['summary']['roundoff'] ?? 0,
                'final_total' => $checkoutData['bill_breakdown']['final_total'] ?? 0,
                'coupon_id' => $couponId, // This will be NULL if no coupon was applied
                'tax_type' => $checkoutData['tax_details']['type'] ?? 'igst',
                'igst_amount' => $checkoutData['tax_details']['igst'] ?? 0,
                'cgst_amount' => $checkoutData['tax_details']['cgst'] ?? 0,
                'sgst_amount' => $checkoutData['tax_details']['sgst'] ?? 0,
                'item_count' => $checkoutData['bill_breakdown']['summary']['item_count'] ?? 0,
                'total_quantity' => $checkoutData['bill_breakdown']['summary']['total_quantity'] ?? 0,
                'order_date' => date('Y-m-d H:i:s')
            ]);
            
            if (!$orderId) {
                throw new Exception("Failed to create order record");
            }
            
            // Create order items
            foreach ($checkoutData['items'] as $item) {
                $this->orderRepository->createOrderItem([
                    'order_id' => $orderId,
                    'product_id' => $item['id'],
                    'variant_id' => $item['variant_id'],
                    'product_name' => $item['name'],
                    'variant_name' => $item['variant']['name'],
                    'product_sku' => $item['variant']['sku'],
                    'quantity' => $item['quantity'],
                    'original_price' => $item['original_price'],
                    'selling_price' => $item['price'],
                    'discount_amount' => ($item['original_price'] - $item['price']),
                    'tax_rate' => $this->getTaxRateForProduct($item['id']),
                    'base_price' => $this->calculateBasePrice($item['price'], $this->getTaxRateForProduct($item['id'])),
                    'tax_amount' => $this->calculateTaxAmount($item['price'], $this->getTaxRateForProduct($item['id'])),
                    'line_base_amount' => $this->calculateBasePrice($item['price'], $this->getTaxRateForProduct($item['id'])) * $item['quantity'],
                    'line_tax_amount' => $this->calculateTaxAmount($item['price'], $this->getTaxRateForProduct($item['id'])) * $item['quantity'],
                    'line_discount_amount' => ($item['original_price'] - $item['price']) * $item['quantity'],
                    'line_total' => $item['line_total'],
                    'product_image' => $item['image'],
                    'product_weight' => $item['variant']['weight'],
                    'product_hsn_code' => $this->getHsnCodeForProduct($item['id']),
                    'status' => 'placed'
                ]);
            }
            
            // Create shipping record
            $address = $checkoutData['address'];
            $this->orderRepository->createOrderShipping([
                'order_id' => $orderId,
                'contact_name' => $address['name'],
                'contact_phone' => $address['phone'],
                'address_line1' => $address['full_address'],
                'city' => $address['city'],
                'state' => $address['state'],
                'postal_code' => $address['pincode'],
                'country' => 'India',
                'address_type' => $address['type'],
                'shipping_method' => 'standard',
                'shipping_charges' => $checkoutData['shipping']['charges'],
                'is_free_shipping' => $checkoutData['shipping']['is_free'],
                'shipping_savings' => $checkoutData['shipping']['savings'],
                'estimated_delivery_date' => date('Y-m-d', strtotime('+3 days')),
                'status' => 'pending'
            ]);
            
            // Create payment record
            $paymentStatus = $paymentMethod === 'cod' ? 'pending' : 'success';
            $paymentGateway = $paymentMethod === 'cod' ? null : 'razorpay';
            
            $this->orderRepository->createPayment([
                'order_id' => $orderId,
                'payment_id' => $paymentId,
                'payment_method' => $paymentMethod,
                'payment_gateway' => $paymentGateway,
                'amount' => $checkoutData['bill_breakdown']['final_total'],
                'gateway_charges' => $checkoutData['bill_breakdown']['payment_charges']['amount'] ?? 0,
                'status' => $paymentStatus,
                'payment_received' => $paymentMethod === 'online',
                'payment_received_at' => $paymentMethod === 'online' ? date('Y-m-d H:i:s') : null,
                'gateway_response' => $additionalData ? json_encode($additionalData) : null,
                'initiated_at' => date('Y-m-d H:i:s'),
                'completed_at' => $paymentMethod === 'cod' ? null : date('Y-m-d H:i:s')
            ]);
            
            // Create coupon usage record if coupon was applied
            if ($couponId && $couponCode && $couponDiscountAmount > 0) {
                try {
                    $this->createCouponUsage(
                        $couponId,
                        $orderNumber,
                        $userId,
                        $couponDiscountAmount
                    );
                    
                    error_log("Created coupon usage record for coupon ID: {$couponId}, Order: {$orderNumber}");
                } catch (Exception $e) {
                    // Log the error but don't fail the entire order
                    error_log("Error creating coupon usage record: " . $e->getMessage());
                }
            }
            
            // Update display orders based on order quantities (NEW FEATURE)
            $this->updateDisplayOrdersAfterOrder($checkoutData['items']);
            
            // Clear the cart after successful order creation
            $this->orderRepository->clearUserCart($userId);
            
            // Commit transaction
            $this->db->commit();
            
            // Return order data
            return [
                'order_id' => $orderId,
                'order_number' => $orderNumber,
                'order_date' => date('Y-m-d H:i:s'),
                'status' => 'placed',
                'payment_status' => $paymentMethod === 'cod' ? 'pending' : 'paid',
                'payment_method' => $paymentMethod,
                'total_amount' => $checkoutData['bill_breakdown']['final_total'],
                'items_count' => $checkoutData['bill_breakdown']['summary']['item_count'],
                'total_quantity' => $checkoutData['bill_breakdown']['summary']['total_quantity'],
                'estimated_delivery_date' => date('Y-m-d', strtotime('+3 days')),
                'shipping_address' => [
                    'name' => $address['name'],
                    'phone' => $address['phone'],
                    'address' => $address['full_address'],
                    'city' => $address['city'],
                    'state' => $address['state'],
                    'pincode' => $address['pincode']
                ],
                'payment_details' => [
                    'method' => $paymentMethod,
                    'status' => $paymentStatus,
                    'id' => $paymentId
                ]
            ];
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->db->rollback();
            error_log("Error creating order: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update display orders based on order quantities
     * This increases popularity-based ordering
     * 
     * @param array $items Order items
     * @return void
     */
    private function updateDisplayOrdersAfterOrder($items)
    {
        try {
            error_log("Starting display order updates for " . count($items) . " items");
            
            $productUpdates = [];
            $categoryUpdates = [];
            $subcategoryUpdates = [];
            
            foreach ($items as $item) {
                $productId = $item['id'];
                $variantId = $item['variant_id'];
                $quantity = $item['quantity'];
                
                error_log("Processing item: Product {$productId}, Variant {$variantId}, Quantity {$quantity}");
                
                // Get product details including category and subcategory
                $productSql = "SELECT category_id, subcategory_id FROM products WHERE id = :product_id";
                $productDetails = $this->db->fetch($productSql, [':product_id' => $productId]);
                
                if (!$productDetails) {
                    error_log("Product {$productId} not found, skipping display order update");
                    continue;
                }
                
                $categoryId = $productDetails['category_id'];
                $subcategoryId = $productDetails['subcategory_id'];
                
                // 1. Update variant display order (+quantity)
                $variantUpdateSql = "UPDATE product_variants 
                                   SET display_order = display_order + :quantity 
                                   WHERE id = :variant_id";
                $this->db->query($variantUpdateSql, [
                    ':quantity' => $quantity,
                    ':variant_id' => $variantId
                ]);
                error_log("Updated variant {$variantId} display_order by +{$quantity}");
                
                // 2. Accumulate product updates
                if (!isset($productUpdates[$productId])) {
                    $productUpdates[$productId] = 0;
                }
                $productUpdates[$productId] += $quantity;
                
                // 3. Accumulate category updates
                if ($categoryId && !isset($categoryUpdates[$categoryId])) {
                    $categoryUpdates[$categoryId] = 0;
                }
                if ($categoryId) {
                    $categoryUpdates[$categoryId] += $quantity;
                }
                
                // 4. Accumulate subcategory updates
                if ($subcategoryId && !isset($subcategoryUpdates[$subcategoryId])) {
                    $subcategoryUpdates[$subcategoryId] = 0;
                }
                if ($subcategoryId) {
                    $subcategoryUpdates[$subcategoryId] += $quantity;
                }
            }
            
            // Update products display order
            foreach ($productUpdates as $productId => $totalQuantity) {
                $productUpdateSql = "UPDATE products 
                                   SET display_order = display_order + :quantity 
                                   WHERE id = :product_id";
                $this->db->query($productUpdateSql, [
                    ':quantity' => $totalQuantity,
                    ':product_id' => $productId
                ]);
                error_log("Updated product {$productId} display_order by +{$totalQuantity}");
            }
            
            // Update categories display order
            foreach ($categoryUpdates as $categoryId => $totalQuantity) {
                $categoryUpdateSql = "UPDATE categories 
                                    SET display_order = display_order + :quantity 
                                    WHERE id = :category_id";
                $this->db->query($categoryUpdateSql, [
                    ':quantity' => $totalQuantity,
                    ':category_id' => $categoryId
                ]);
                error_log("Updated category {$categoryId} display_order by +{$totalQuantity}");
            }
            
            // Update subcategories display order
            foreach ($subcategoryUpdates as $subcategoryId => $totalQuantity) {
                $subcategoryUpdateSql = "UPDATE subcategories 
                                       SET display_order = display_order + :quantity 
                                       WHERE id = :subcategory_id";
                $this->db->query($subcategoryUpdateSql, [
                    ':quantity' => $totalQuantity,
                    ':subcategory_id' => $subcategoryId
                ]);
                error_log("Updated subcategory {$subcategoryId} display_order by +{$totalQuantity}");
            }
            
            error_log("Display order updates completed successfully");
            
        } catch (Exception $e) {
            error_log("Error updating display orders: " . $e->getMessage());
            // Don't throw the exception as this shouldn't fail the order creation
            // Just log the error and continue
        }
    }

    /**
     * Get tax rate for a product
     * 
     * @param int $productId Product ID
     * @return float Tax rate
     */
    private function getTaxRateForProduct($productId)
    {
        try {
            $sql = "SELECT tax_rate FROM comprehensive_products WHERE id = :product_id";
            $result = $this->db->fetch($sql, [':product_id' => $productId]);
            
            return $result && isset($result['tax_rate']) ? (float)$result['tax_rate'] : 5.0;
        } catch (Exception $e) {
            error_log("Error getting tax rate for product {$productId}: " . $e->getMessage());
            return 5.0;
        }
    }

    /**
     * Get HSN code for a product
     * 
     * @param int $productId Product ID
     * @return string HSN code
     */
    private function getHsnCodeForProduct($productId)
    {
        try {
            $sql = "SELECT hsn_code FROM products WHERE id = :product_id";
            $result = $this->db->fetch($sql, [':product_id' => $productId]);
            
            return $result && isset($result['hsn_code']) ? $result['hsn_code'] : null;
        } catch (Exception $e) {
            error_log("Error getting HSN code for product {$productId}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate base price (price before tax)
     * 
     * @param float $priceWithTax Price including tax
     * @param float $taxRate Tax rate percentage
     * @return float Base price
     */
    private function calculateBasePrice($priceWithTax, $taxRate)
    {
        return round($priceWithTax / (1 + ($taxRate / 100)), 2);
    }

    /**
     * Calculate tax amount
     * 
     * @param float $priceWithTax Price including tax
     * @param float $taxRate Tax rate percentage
     * @return float Tax amount
     */
    private function calculateTaxAmount($priceWithTax, $taxRate)
    {
        $basePrice = $this->calculateBasePrice($priceWithTax, $taxRate);
        return round($priceWithTax - $basePrice, 2);
    }

    /**
     * Calculate total base amount from items
     * 
     * @param array $items Cart items
     * @return float Total base amount
     */
    private function calculateTotalBaseAmount($items)
    {
        $totalBaseAmount = 0;
        
        foreach ($items as $item) {
            $taxRate = $this->getTaxRateForProduct($item['id']);
            $basePrice = $this->calculateBasePrice($item['price'], $taxRate);
            $totalBaseAmount += $basePrice * $item['quantity'];
        }
        
        return round($totalBaseAmount, 2);
    }

    /**
     * Calculate total original price (MRP) from items
     * 
     * @param array $items Cart items
     * @return float Total original price
     */
    private function calculateTotalOriginalPrice($items)
    {
        $totalOriginalPrice = 0;
        
        foreach ($items as $item) {
            $totalOriginalPrice += $item['original_price'] * $item['quantity'];
        }
        
        return round($totalOriginalPrice, 2);
    }

    /**
     * Create coupon usage record
     * 
     * @param int $couponId Coupon ID
     * @param string $orderNumber Order number
     * @param int $userId User ID
     * @param float $discountAmount Discount amount applied
     * @return int|bool Coupon usage ID or false on failure
     */
    private function createCouponUsage($couponId, $orderNumber, $userId, $discountAmount)
    {
        try {
            // Validate inputs
            if (empty($couponId) || empty($orderNumber) || empty($userId) || $discountAmount <= 0) {
                error_log("Invalid coupon usage data: couponId={$couponId}, orderNumber={$orderNumber}, userId={$userId}, discount={$discountAmount}");
                return false;
            }
            
            // Check if a record already exists for this order
            $checkSql = "SELECT id FROM coupon_usage WHERE order_id = :order_id";
            $existingRecord = $this->db->fetch($checkSql, [':order_id' => $orderNumber]);
            
            if ($existingRecord) {
                error_log("Coupon usage record already exists for order: {$orderNumber}");
                return false;
            }
            
            // Prepare data for insertion
            $data = [
                'coupon_id' => $couponId,
                'order_id' => $orderNumber,
                'user_id' => $userId,
                'discount_amount' => $discountAmount,
                'used_at' => date('Y-m-d H:i:s')
            ];
            
            // Debug log
            error_log("Creating coupon usage with data: " . json_encode($data));
            
            // Insert the record
            $usageId = $this->db->insert('coupon_usage', $data);
            
            if (!$usageId) {
                error_log("Failed to insert coupon usage record");
                return false;
            }
            
            error_log("Successfully created coupon usage with ID: {$usageId}");
            return $usageId;
        } catch (Exception $e) {
            error_log("Error creating coupon usage: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Calculate amount before roundoff from checkout data
     * 
     * @param array $checkoutData Checkout data
     * @return float Amount before roundoff
     */
    private function calculateAmountBeforeRoundoff($checkoutData)
    {
        try {
            // Start with subtotal after product discounts
            $amount = $checkoutData['bill_breakdown']['amount_after_product_discounts']['amount'] ?? 0;
        
            // Subtract coupon discount if applied
            $couponDiscount = $checkoutData['bill_breakdown']['coupon_discount']['amount'] ?? 0;
            $amount -= $couponDiscount;
        
            // Add shipping charges
            $shippingCharges = $checkoutData['bill_breakdown']['shipping']['amount'] ?? 0;
            $amount += $shippingCharges;
        
            // Add payment charges
            $paymentCharges = $checkoutData['bill_breakdown']['payment_charges']['amount'] ?? 0;
            $amount += $paymentCharges;
        
            // Return exact decimal value without rounding
            return $amount;
        } catch (Exception $e) {
            error_log("Error calculating amount before roundoff: " . $e->getMessage());
            return 0;
        }
    }
}
