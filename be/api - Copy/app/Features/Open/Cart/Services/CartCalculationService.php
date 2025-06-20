<?php

namespace App\Features\Open\Cart\Services;

use App\Features\Open\Cart\DataAccess\CouponRepository;
use App\Features\ProductCatalog\ComprehensiveProducts\DataAccess\ComprehensiveProductRepository;
use App\Shared\DataFetchers\ProductDataFetcher;
use Exception;

class CartCalculationService
{
    private $productRepository;
    private $couponRepository;
    private $productDataFetcher;
    private $defaultTaxRate = 5; // Default GST rate of 5% if not specified in product

    public function __construct()
    {
        $this->productRepository = new ComprehensiveProductRepository();
        $this->couponRepository = new CouponRepository();
        $this->productDataFetcher = new ProductDataFetcher();
    }

    /**
     * Calculate cart totals and validate items
     * 
     * @param array $items Cart items
     * @param string|null $couponCode Coupon code
     * @param string|null $shippingPincode Shipping pincode
     * @param int|null $userId User ID
     * @return array Calculated cart data
     */
public function calculateCart($items, $couponCode = null, $shippingPincode = null, $userId = null)
{
    try {
        $calculatedItems = [];
        $baseAmount = 0;
        $taxAmount = 0;
        $subtotal = 0;
        $invalidItems = [];
        
        // Process each item
        foreach ($items as $item) {
            $productId = $item['product_id'] ?? 0;
            $variantId = $item['variant_id'] ?? 0;
            $quantity = $item['quantity'] ?? 1;
            
            if ($quantity <= 0) {
                continue; // Skip items with zero or negative quantity
            }
            
            // Get product details with variants
            try {
                // Get comprehensive product data
                $product = $this->productRepository->getProductById($productId);
                
                if (!$product) {
                    $invalidItems[] = [
                        'product_id' => $productId,
                        'variant_id' => $variantId,
                        'error' => 'Product not found'
                    ];
                    continue;
                }
                
                // Check if product is active
                if (!$this->isProductActive($product)) {
                    $invalidItems[] = [
                        'product_id' => $productId,
                        'variant_id' => $variantId,
                        'error' => 'Product is not active'
                    ];
                    continue;
                }
                
                // Use ProductDataFetcher to get complete product data with variants
                $completeProduct = $this->productDataFetcher->getProductById($productId);
                
                // Check if we have variants data
                if (!isset($completeProduct['variants']) || empty($completeProduct['variants'])) {
                    // Fallback: Try to get variants from the product data directly
                    $variants = [];
                    
                    // Check different possible keys for variants
                    if (isset($product['variants'])) {
                        $variants = $product['variants'];
                    } elseif (isset($product['product_variants'])) {
                        $variants = $product['product_variants'];
                    } else {
                        // If we still don't have variants, try to query them directly
                        $variantsResult = $this->productRepository->getProductById($productId, true);
                        if (isset($variantsResult['variants'])) {
                            $variants = $variantsResult['variants'];
                        } elseif (isset($variantsResult['product_variants'])) {
                            $variants = $variantsResult['product_variants'];
                        }
                    }
                    
                    if (empty($variants)) {
                        $invalidItems[] = [
                            'product_id' => $productId,
                            'variant_id' => $variantId,
                            'error' => 'No variants found for this product'
                        ];
                        continue;
                    }
                    
                    $completeProduct['variants'] = $variants;
                }
                
                // Find the specific variant
                $variant = null;
                foreach ($completeProduct['variants'] as $v) {
                    if (isset($v['id']) && $v['id'] == $variantId) {
                        $variant = $v;
                        break;
                    }
                }
                
                if (!$variant) {
                    $invalidItems[] = [
                        'product_id' => $productId,
                        'variant_id' => $variantId,
                        'error' => 'Variant not found'
                    ];
                    continue;
                }
                
                // Check if variant is active
                if (!$this->isVariantActive($variant)) {
                    $invalidItems[] = [
                        'product_id' => $productId,
                        'variant_id' => $variantId,
                        'error' => 'Variant is not active'
                    ];
                    continue;
                }
                
                // Get price and tax rate
                $priceWithTax = floatval($variant['price'] ?? 0);
                
                // Get tax rate from product, use default if not set or zero
                $taxRate = floatval($product['gst_percentage'] ?? 0);
                if ($taxRate <= 0) {
                    $taxRate = $this->defaultTaxRate; // Use default GST rate
                }
                
                // Calculate base price and tax amount (now using the same formula as the generated columns)
                $basePrice = round($priceWithTax / (1 + ($taxRate / 100)), 2);
                $itemTaxAmount = round($priceWithTax - $basePrice, 2);
                $lineTotal = round($priceWithTax * $quantity);
                
                // Add to totals
                $baseAmount += ($basePrice * $quantity);
                $taxAmount += ($itemTaxAmount * $quantity);
                $subtotal += $lineTotal;
                
                // Add to calculated items
                $calculatedItems[] = [
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'name' => $product['name'] ?? 'Unknown Product',
                    'image' => $product['image'] ?? null,
                    'quantity' => $quantity,
                    'price' => $priceWithTax,
                    'base_price' => $basePrice,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $itemTaxAmount,
                    'line_total' => $lineTotal,
                    'is_active' => true,
                    'stock_status' => $this->getStockStatus($variant)
                ];
            } catch (Exception $e) {
                // Log the error and add to invalid items
                error_log("Error processing item {$productId}-{$variantId}: " . $e->getMessage());
                $invalidItems[] = [
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'error' => 'Error processing item: ' . $e->getMessage()
                ];
                continue;
            }
        }
        
        // Initialize summary with only necessary fields
        $summary = [
            'base_amount' => round($baseAmount, 2),
            'tax_amount' => round($taxAmount, 2),
            'subtotal' => $subtotal,
            'discount' => 0,
            'total' => $subtotal
        ];
        
        // Process coupon if provided
        $couponData = null;
        if ($couponCode) {
            $couponValidation = $this->validateCoupon($couponCode, $subtotal, $userId);
            
            if ($couponValidation['valid']) {
                $coupon = $couponValidation['coupon'];
                $discountAmount = $couponValidation['discount_amount'];
                
                $summary['discount'] = $discountAmount;
                $summary['total'] -= $discountAmount;
                
                $couponData = [
                    'code' => $coupon['code'],
                    'discount_type' => $coupon['discount_type'],
                    'discount_value' => $coupon['discount_value'],
                    'is_valid' => true
                ];
            } else {
                $couponData = [
                    'code' => $couponCode,
                    'is_valid' => false,
                    'error' => $couponValidation['message']
                ];
            }
        }
        
        // Calculate shipping if pincode provided
        $shippingData = null;
        if ($shippingPincode) {
            $shippingMethods = $this->getShippingMethods($shippingPincode, $calculatedItems);
            
            if (!empty($shippingMethods)) {
                // Use the first method as default
                $defaultMethod = $shippingMethods[0];
                $summary['shipping'] = $defaultMethod['price'];
                $summary['total'] += $defaultMethod['price'];
                
                $shippingData = [
                    'available_methods' => $shippingMethods
                ];
            }
        }
        
        // Round the final total to nearest integer
        $originalTotal = $summary['total'];
        $summary['total'] = round($summary['total']);
        
        // Only add roundoff if it's not zero
        $roundoff = $summary['total'] - $originalTotal;
        if (abs($roundoff) > 0.001) { // Use a small epsilon to account for floating point errors
            $summary['roundoff'] = $roundoff;
        }
        
        // Prepare the final result
        $result = [
            'items' => $calculatedItems,
            'summary' => $summary
        ];
        
        if ($couponData) {
            $result['coupon'] = $couponData;
        }
        
        if ($shippingData) {
            $result['shipping'] = $shippingData;
        }
        
        if (!empty($invalidItems)) {
            $result['invalid_items'] = $invalidItems;
        }
        
        return $result;
    } catch (Exception $e) {
        error_log("Error in calculateCart: " . $e->getMessage());
        throw $e;
    }
}

    /**
     * Check if a product is active
     * 
     * @param array $product Product data
     * @return bool Whether the product is active
     */
    private function isProductActive($product)
    {
        // Check if product exists and is active
        if (!$product || !isset($product['status'])) {
            return false;
        }
        
        return $product['status'] === 'active' || $product['status'] === 1;
    }

    /**
     * Check if a variant is active
     * 
     * @param array $variant Variant data
     * @return bool Whether the variant is active
     */
    private function isVariantActive($variant)
    {
        // Check if variant exists and is active
        if (!$variant || !isset($variant['status'])) {
            return true; // Default to true if status not specified
        }
        
        return $variant['status'] === 'active' || $variant['status'] === 1;
    }

    /**
     * Get stock status for a variant
     * 
     * @param array $variant Variant data
     * @return string Stock status
     */
    private function getStockStatus($variant)
    {
        if (!isset($variant['stock_quantity'])) {
            return 'in_stock'; // Default to in stock if not specified
        }
        
        return $variant['stock_quantity'] > 0 ? 'in_stock' : 'out_of_stock';
    }

    /**
     * Validate a coupon code
     * 
     * @param string $couponCode Coupon code
     * @param float $cartTotal Cart total amount
     * @param int|null $userId User ID if logged in
     * @return array Validation result with coupon details and discount amount
     */
    private function validateCoupon($couponCode, $cartTotal, $userId = null)
    {
        try {
            // Get coupon by code
            $coupon = $this->couponRepository->getCouponByCode($couponCode);
            
            if (!$coupon) {
                return [
                    'valid' => false,
                    'message' => "Invalid coupon code"
                ];
            }
            
            // Check if coupon is active
            if (!$coupon['is_active']) {
                return [
                    'valid' => false,
                    'message' => "This coupon is not active"
                ];
            }
            
            // Check date validity
            $currentDate = date('Y-m-d H:i:s');
            if ($currentDate < $coupon['start_date']) {
                return [
                    'valid' => false,
                    'message' => "This coupon is not yet valid. It will be active from " . date('d M Y, h:i A', strtotime($coupon['start_date']))
                ];
            }
            
            if ($coupon['end_date'] && $currentDate > $coupon['end_date']) {
                return [
                    'valid' => false,
                    'message' => "This coupon has expired on " . date('d M Y, h:i A', strtotime($coupon['end_date']))
                ];
            }
            
            // Check usage limit
            if ($coupon['usage_limit']) {
                $usageCount = $this->couponRepository->getCouponUsageCount($coupon['id']);
                if ($usageCount >= $coupon['usage_limit']) {
                    return [
                        'valid' => false,
                        'message' => "This coupon has reached its usage limit"
                    ];
                }
            }
            
            // Check minimum purchase amount
            if ($cartTotal < $coupon['minimum_order_value']) {
                return [
                    'valid' => false,
                    'message' => "Minimum purchase amount of {$coupon['minimum_order_value']} required"
                ];
            }
            
            // Calculate discount
            $discountAmount = 0;
            
            if ($coupon['discount_type'] === 'percentage') {
                $discountAmount = ($cartTotal * $coupon['discount_value']) / 100;
                
                // Apply maximum discount if set
                if ($coupon['maximum_discount_amount'] && $discountAmount > $coupon['maximum_discount_amount']) {
                    $discountAmount = $coupon['maximum_discount_amount'];
                }
            } else if ($coupon['discount_type'] === 'fixed_amount') {
                $discountAmount = $coupon['discount_value'];
                
                // Ensure discount doesn't exceed cart total
                if ($discountAmount > $cartTotal) {
                    $discountAmount = $cartTotal;
                }
            }
            
            // Round discount amount to nearest integer
            $discountAmount = round($discountAmount);
            
            return [
                'valid' => true,
                'coupon' => $coupon,
                'discount_amount' => $discountAmount
            ];
        } catch (Exception $e) {
            return [
                'valid' => false,
                'message' => "Error validating coupon: " . $e->getMessage()
            ];
        }
    }

    /**
     * Get available shipping methods for a pincode
     * 
     * @param string $pincode Shipping pincode
     * @param array $items Cart items
     * @return array Available shipping methods
     */
    private function getShippingMethods($pincode, $items)
    {
        // This is a placeholder implementation
        // In a real application, you would query a shipping API or database
        
        // Calculate total weight or other factors that might affect shipping
        $totalQuantity = 0;
        foreach ($items as $item) {
            $totalQuantity += $item['quantity'];
        }
        
        // Basic shipping methods
        $methods = [
            [
                'id' => 'standard',
                'name' => 'Standard Delivery',
                'price' => 50.00,
                'estimated_days' => '3-5'
            ]
        ];
        
        // Add express shipping for orders with fewer items
        if ($totalQuantity <= 5) {
            $methods[] = [
                'id' => 'express',
                'name' => 'Express Delivery',
                'price' => 100.00,
                'estimated_days' => '1-2'
            ];
        }
        
        // Free shipping for large orders
        if (count($items) >= 5) {
            $methods[] = [
                'id' => 'free',
                'name' => 'Free Delivery (5+ items)',
                'price' => 0.00,
                'estimated_days' => '5-7'
            ];
        }
        
        return $methods;
    }
}
