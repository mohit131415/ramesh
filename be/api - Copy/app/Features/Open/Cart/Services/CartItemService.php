<?php

namespace App\Features\Open\Cart\Services;

use App\Core\Database;
use App\Shared\DataFetchers\ProductDataFetcher;
use Exception;

class CartItemService
{
    private $db;
    private $productDataFetcher;
    private $defaultTaxRate = 5.0; // Default GST rate if not specified

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->productDataFetcher = new ProductDataFetcher();
    }

    /**
     * Get detailed information for cart items provided in the request
     * 
     * @param array $items Array of items with product_id, variant_id, and quantity
     * @return array Cart items with detailed product information and validation status
     */
    public function getCartItemsDetails($items)
    {
    try {
        if (empty($items)) {
            // No items provided, return empty result
            return [
                'items' => [],
                'inactive_items' => [],
                'invalid_items' => [],
                'totals' => [
                    'subtotal' => 0,
                    'base_amount' => 0,
                    'tax_amount' => 0,
                    'discount_amount' => 0,
                    'total' => 0,
                    'item_count' => 0,
                    'total_quantity' => 0
                ]
            ];
        }

        // DO NOT AGGREGATE - Process each item as provided from database
        error_log("Processing " . count($items) . " cart items without aggregation");

        // Log input items to verify no duplicates are coming in
        foreach ($items as $index => $item) {
            error_log("Input item {$index}: Product {$item['product_id']}, Variant {$item['variant_id']}, Qty {$item['quantity']}");
        }

        // Get product IDs from items
        $productIds = array_unique(array_column($items, 'product_id'));
        error_log("Unique product IDs: " . implode(', ', $productIds));
        
        // Get products from the database (including inactive ones)
        $products = $this->getProductsFromDatabase($productIds);
        
        // Process cart items with product details
        $validItems = [];
        $inactiveItems = [];
        $invalidItems = [];
        $subtotal = 0;
        $totalTaxAmount = 0;
        $totalQuantity = 0;
        $totalBaseAmount = 0;
        $totalDiscountAmount = 0;
        
        foreach ($items as $item) {
            $productId = $item['product_id'];
            $variantId = $item['variant_id'];
            $quantity = $item['quantity'];
            
            // Check if product exists
            if (!isset($products[$productId])) {
                $invalidItems[] = [
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'quantity' => $quantity,
                    'name' => 'Unknown Product',
                    'slug' => '',
                    'description' => '',
                    'category' => '',
                    'brand' => '',
                    'image' => null,
                    'price' => '0.00',
                    'base_price' => 0,
                    'tax_rate' => 0,
                    'tax_amount' => 0,
                    'line_total' => 0,
                    'base_amount' => 0,
                    'line_tax_amount' => 0,
                    'original_price' => '0.00',
                    'discount_percentage' => 0,
                    'is_active' => false,
                    'is_deleted' => false,
                    'min_quantity' => 1,
                    'max_quantity' => 999,
                    'reason' => 'Product not found',
                    'current_variant' => null,
                    'available_variants' => []
                ];
                continue;
            }
            
            $product = $products[$productId];
            
            // Check if product is deleted
            $isProductDeleted = isset($product['deleted_at']) && 
                               !empty($product['deleted_at']) && 
                               $product['deleted_at'] !== '0000-00-00 00:00:00';
            
            // Check if product is active
            $isProductActive = !$isProductDeleted && 
                              (($product['status'] ?? '') === 'active' || 
                               ($product['status'] ?? '') === '1' || 
                               ($product['is_active'] ?? 0) == 1);
            
            // Find the current variant
            $currentVariant = null;
            if (isset($product['variants']) && is_array($product['variants'])) {
                foreach ($product['variants'] as $v) {
                    if ($v['id'] == $variantId) {
                        $currentVariant = $v;
                        break;
                    }
                }
            }
            
            // Get product details
            $productName = $product['name'] ?? 'Unknown Product';
            $productSlug = $product['slug'] ?? '';
            $productDescription = $product['description'] ?? '';
            $productCategory = $product['category_name'] ?? $product['category'] ?? '';
            $productBrand = $product['brand_name'] ?? $product['brand'] ?? '';
            
            // Get product image - check multiple possible fields
            $image = null;
            if (isset($product['image_path']) && !empty($product['image_path'])) {
                $image = $product['image_path'];
            } elseif (isset($product['image']) && !empty($product['image'])) {
                $image = $product['image'];
            } else {
                // Fallback: get the first available image from product images
                $imageSql = "SELECT image_path FROM product_images WHERE product_id = :product_id ORDER BY is_primary DESC, display_order ASC, id ASC LIMIT 1";
                $imageResult = $this->db->fetch($imageSql, [':product_id' => $productId]);
                if ($imageResult && !empty($imageResult['image_path'])) {
                    $image = $imageResult['image_path'];
                }
            }
            
            // Get tax rate
            $taxRate = $this->defaultTaxRate;
            if (isset($product['gst_percentage']) && $product['gst_percentage'] > 0) {
                $taxRate = (float) $product['gst_percentage'];
            } elseif (isset($product['tax_rate']) && $product['tax_rate'] > 0) {
                $taxRate = (float) $product['tax_rate'];
            }
            
            // Process all available variants for this product
            $availableVariants = [];
            if (isset($product['variants']) && is_array($product['variants'])) {
                foreach ($product['variants'] as $variant) {
                    $isVariantDeleted = isset($variant['deleted_at']) && 
                                       !empty($variant['deleted_at']) && 
                                       $variant['deleted_at'] !== '0000-00-00 00:00:00';
                    
                    $isVariantActive = !$isVariantDeleted && 
                                      (($variant['status'] ?? '') === 'active' || 
                                       ($variant['status'] ?? '') === '1' || 
                                       ($variant['is_active'] ?? 0) == 1);
                    
                    // Get variant price
                    $variantPrice = 0;
                    if (isset($variant['sale_price']) && $variant['sale_price'] > 0) {
                        $variantPrice = (float) $variant['sale_price'];
                    } elseif (isset($variant['price']) && $variant['price'] > 0) {
                        $variantPrice = (float) $variant['price'];
                    }
                    
                    // Calculate variant pricing details
                    $variantBasePrice = $variantPrice > 0 ? round($variantPrice / (1 + ($taxRate / 100)), 2) : 0;
                    $variantTaxAmount = $variantPrice > 0 ? round($variantPrice - $variantBasePrice, 2) : 0;
                    
                    // Get quantity limits from actual database fields
                    $minOrderQuantity = $variant['min_order_quantity'] ?? 1;
                    $maxOrderQuantity = $variant['max_order_quantity'] ?? null;

                    $availableVariants[] = [
                        'id' => $variant['id'],
                        'name' => $variant['name'] ?? $variant['variant_name'] ?? "Variant {$variant['id']}",
                        'sku' => $variant['sku'] ?? '',
                        'price' => number_format($variantPrice, 2, '.', ''),
                        'base_price' => $variantBasePrice,
                        'tax_amount' => $variantTaxAmount,
                        'original_price' => isset($variant['original_price']) ? number_format($variant['original_price'], 2, '.', '') : number_format($variantPrice, 2, '.', ''),
                        'discount_percentage' => $variant['discount_percentage'] ?? 0,
                        'min_quantity' => $minOrderQuantity,
                        'max_quantity' => $maxOrderQuantity,
                        'is_active' => $isVariantActive,
                        'is_deleted' => $isVariantDeleted,
                        'weight' => $variant['weight'] ?? '',
                        'dimensions' => [
                            'length' => $variant['length'] ?? 0,
                            'width' => $variant['width'] ?? 0,
                            'height' => $variant['height'] ?? 0
                        ],
                        'attributes' => [
                            'size' => $variant['size'] ?? '',
                            'color' => $variant['color'] ?? '',
                            'material' => $variant['material'] ?? '',
                            'flavor' => $variant['flavor'] ?? '',
                            'weight_unit' => $variant['weight_unit'] ?? 'g'
                        ],
                        'is_current' => $variant['id'] == $variantId
                    ];
                }
            }
            
            // Sort variants: current first, then active, then inactive
            usort($availableVariants, function($a, $b) {
                if ($a['is_current'] && !$b['is_current']) return -1;
                if (!$a['is_current'] && $b['is_current']) return 1;
                if ($a['is_active'] && !$b['is_active']) return -1;
                if (!$a['is_active'] && $b['is_active']) return 1;
                return 0;
            });
            
            // Check if current variant exists
            if (!$currentVariant) {
                $targetArray = $isProductDeleted ? 'invalid' : 'inactive';
                
                $itemData = [
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'quantity' => $quantity,
                    'name' => $productName,
                    'slug' => $productSlug,
                    'description' => $productDescription,
                    'category' => $productCategory,
                    'brand' => $productBrand,
                    'image' => $image,
                    'price' => '0.00',
                    'base_price' => 0,
                    'tax_rate' => $taxRate,
                    'tax_amount' => 0,
                    'line_total' => 0,
                    'base_amount' => 0,
                    'line_tax_amount' => 0,
                    'original_price' => '0.00',
                    'discount_percentage' => 0,
                    'is_active' => $isProductActive,
                    'is_deleted' => $isProductDeleted,
                    'min_quantity' => 1,
                    'max_quantity' => 999,
                    'reason' => 'Variant not found',
                    'current_variant' => null,
                    'available_variants' => $availableVariants
                ];
                
                if ($targetArray === 'invalid') {
                    $invalidItems[] = $itemData;
                } else {
                    $inactiveItems[] = $itemData;
                }
                continue;
            }
            
            // Check if current variant is deleted
            $isVariantDeleted = isset($currentVariant['deleted_at']) && 
                               !empty($currentVariant['deleted_at']) && 
                               $currentVariant['deleted_at'] !== '0000-00-00 00:00:00';
            
            // Check if current variant is active
            $isVariantActive = !$isVariantDeleted && 
                              (($currentVariant['status'] ?? '') === 'active' || 
                               ($currentVariant['status'] ?? '') === '1' || 
                               ($currentVariant['is_active'] ?? 0) == 1);
            
            // Calculate discount amount per item
            $originalPrice = 0;
            $discountAmount = 0;
            $discountPercentage = 0;

            // Get original price and sale price from variant
            $variantOriginalPrice = isset($currentVariant['price']) ? (float) $currentVariant['price'] : 0;
            $variantSalePrice = isset($currentVariant['sale_price']) && !empty($currentVariant['sale_price']) ? (float) $currentVariant['sale_price'] : 0;

            // Determine which price to use and calculate discount
            if ($variantSalePrice > 0 && $variantOriginalPrice > $variantSalePrice) {
                // Sale price is available and is less than original price
                $originalPrice = $variantOriginalPrice;
                $discountAmount = $variantOriginalPrice - $variantSalePrice;
                $discountPercentage = round(($discountAmount / $variantOriginalPrice) * 100, 2);
                // Use sale price as the current price
                $priceWithTax = $variantSalePrice;
            } elseif ($variantSalePrice > 0) {
                // Sale price is available but not less than original price (or same)
                $originalPrice = $variantSalePrice;
                $priceWithTax = $variantSalePrice;
                $discountAmount = 0;
                $discountPercentage = 0;
            } else {
                // No sale price, use original price
                $originalPrice = $variantOriginalPrice;
                $priceWithTax = $variantOriginalPrice;
                $discountAmount = 0;
                $discountPercentage = 0;
            }

            // Calculate line discount amount
            $lineDiscountAmount = round($discountAmount * $quantity, 2);

            // Calculate base price and tax amount based on the final price
            $basePrice = $priceWithTax > 0 ? round($priceWithTax / (1 + ($taxRate / 100)), 2) : 0;
            $taxAmount = $priceWithTax > 0 ? round($priceWithTax - $basePrice, 2) : 0;

            // Calculate line total and base amount
            $lineTotal = round($priceWithTax * $quantity);
            $baseAmount = round($basePrice * $quantity, 2);
            $lineTaxAmount = round($taxAmount * $quantity, 2);
            
            // Get quantity limits from actual database fields
            $minQuantity = $currentVariant['min_order_quantity'] ?? 1;
            $maxQuantity = $currentVariant['max_order_quantity'] ?? null;

            // Instead of marking items as invalid for quantity violations, auto-adjust them
            if ($quantity > $maxQuantity && $maxQuantity !== null) {
                // Auto-adjust quantity to maximum allowed
                $adjustedQuantity = $maxQuantity;
                $wasAdjusted = true;
                $adjustmentReason = "Quantity automatically adjusted from {$quantity} to {$maxQuantity} (maximum allowed)";
                
                error_log("Auto-adjusting quantity for Product {$productId}, Variant {$variantId}: {$quantity} -> {$adjustedQuantity}");
            } elseif ($quantity < $minQuantity) {
                // Auto-adjust quantity to minimum allowed
                $adjustedQuantity = $minQuantity;
                $wasAdjusted = true;
                $adjustmentReason = "Quantity automatically adjusted from {$quantity} to {$minQuantity} (minimum required)";
                
                error_log("Auto-adjusting quantity for Product {$productId}, Variant {$variantId}: {$quantity} -> {$adjustedQuantity}");
            } else {
                $adjustedQuantity = $quantity;
                $wasAdjusted = false;
                $adjustmentReason = null;
            }

            // Use adjusted quantity for all calculations
            $lineTotal = round($priceWithTax * $adjustedQuantity);
            $baseAmount = round($basePrice * $adjustedQuantity, 2);
            $lineTaxAmount = round($taxAmount * $adjustedQuantity, 2);
            $lineDiscountAmount = round($discountAmount * $adjustedQuantity, 2);

            // Update quantity status
            $quantityStatus = 'valid';

            // Create the item data
            $itemData = [
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => $adjustedQuantity, // Use adjusted quantity
                'original_quantity' => $quantity, // Keep original for reference
                'was_quantity_adjusted' => $wasAdjusted,
                'adjustment_reason' => $adjustmentReason,
                'name' => $productName,
                'slug' => $productSlug,
                'description' => $productDescription,
                'category' => $productCategory,
                'brand' => $productBrand,
                'image' => $image,
                'price' => number_format($priceWithTax, 2, '.', ''),
                'base_price' => $basePrice,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'line_total' => $lineTotal,
                'base_amount' => $baseAmount,
                'line_tax_amount' => $lineTaxAmount,
                'original_price' => number_format($originalPrice, 2, '.', ''),
                'discount_amount' => $discountAmount,
                'discount_percentage' => $discountPercentage,
                'line_discount_amount' => $lineDiscountAmount,
                'is_active' => $isProductActive && $isVariantActive,
                'is_deleted' => $isProductDeleted || $isVariantDeleted,
                'min_quantity' => $minQuantity,
                'max_quantity' => $maxQuantity,
                'quantity_status' => $quantityStatus,
                'current_variant' => [
                    'id' => $currentVariant['id'],
                    'name' => $currentVariant['name'] ?? $currentVariant['variant_name'] ?? "Variant {$currentVariant['id']}",
                    'sku' => $currentVariant['sku'] ?? '',
                    'weight' => $currentVariant['weight'] ?? '',
                    'min_quantity' => $minQuantity,
                    'max_quantity' => $maxQuantity,
                    'attributes' => [
                        'size' => $currentVariant['size'] ?? '',
                        'color' => $currentVariant['color'] ?? '',
                        'material' => $currentVariant['material'] ?? '',
                        'flavor' => $currentVariant['flavor'] ?? '',
                        'weight_unit' => $currentVariant['weight_unit'] ?? 'g'
                    ]
                ],
                'available_variants' => $availableVariants
            ];
            
            // Categorize the item based on its status
            if ($isProductDeleted || $isVariantDeleted) {
                // If the product or variant is deleted, it's an invalid item
                $reasons = [];
                if ($isProductDeleted) {
                    $reasons[] = 'Product is deleted';
                }
                if ($isVariantDeleted) {
                    $reasons[] = 'Variant is deleted';
                }
                $itemData['reason'] = implode(', ', $reasons);
                $invalidItems[] = $itemData;
            } elseif (!$isProductActive || !$isVariantActive) {
                // If the product or variant is inactive, it's an inactive item
                // These items are preserved in the cart for potential reactivation
                $reasons = [];
                if (!$isProductActive) {
                    $reasons[] = 'Product is inactive';
                }
                if (!$isVariantActive) {
                    $reasons[] = 'Variant is inactive';
                }
                $itemData['reason'] = implode(', ', $reasons);
                $inactiveItems[] = $itemData;
            } elseif ($quantityStatus !== 'valid') {
                // If the quantity is invalid, it's an invalid item
                if ($quantityStatus === 'below_minimum') {
                    $itemData['reason'] = "Minimum quantity is {$minQuantity}";
                } elseif ($quantityStatus === 'above_maximum') {
                    $itemData['reason'] = "Maximum quantity is {$maxQuantity}";
                }
                $invalidItems[] = $itemData;
            } else {
                // This is a valid item
                $validItems[] = $itemData;
                $subtotal += $lineTotal;
                $totalTaxAmount += $lineTaxAmount;
                $totalBaseAmount += $baseAmount;
                $totalQuantity += $adjustedQuantity;
                $totalDiscountAmount += $lineDiscountAmount;
            }
        }
        
        // Calculate totals
        $total = $subtotal;
        
        error_log("Returning " . count($validItems) . " valid items, " . count($inactiveItems) . " inactive items, " . count($invalidItems) . " invalid items");

        return [
            'items' => $validItems,
            'inactive_items' => $inactiveItems,
            'invalid_items' => $invalidItems,
            'totals' => [
                'subtotal' => $subtotal,
                'base_amount' => $totalBaseAmount,
                'tax_amount' => $totalTaxAmount,
                'discount_amount' => $totalDiscountAmount,
                'total' => $total,
                'item_count' => count($validItems),
                'total_quantity' => $totalQuantity
            ]
        ];
    } catch (Exception $e) {
        error_log("Error in getCartItemsDetails: " . $e->getMessage() . "\n" . $e->getTraceAsString());
        throw new Exception("Failed to retrieve products: " . $e->getMessage());
    }
}

    /**
     * Get products from the database (including inactive and deleted ones)
     * 
     * @param array $productIds Array of product IDs
     * @return array Products indexed by ID with their variants
     */
    private function getProductsFromDatabase($productIds)
    {
        if (empty($productIds)) {
            return [];
        }
        
        try {
            $products = [];
            
            // Get products one by one to avoid SQL parameter issues
            foreach ($productIds as $productId) {
                // Get product details with category and brand information
                $productSql = "SELECT p.*, 
                              c.name as category_name,
                              b.name as brand_name,
                              COALESCE(
                                  (SELECT image_path FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                                  (SELECT image_path FROM product_images WHERE product_id = p.id ORDER BY display_order ASC, id ASC LIMIT 1)
                              ) as image_path
                              FROM products p 
                              LEFT JOIN categories c ON p.category_id = c.id
                              LEFT JOIN brands b ON p.brand_id = b.id
                              WHERE p.id = :product_id";
                
                $product = $this->db->fetch($productSql, [':product_id' => $productId]);
                
                if ($product) {
                    // Get variants for this product with all details
                    $variantSql = "SELECT * FROM product_variants 
                                  WHERE product_id = :product_id 
                                  ORDER BY id ASC";
                    
                    $variants = $this->db->fetchAll($variantSql, [':product_id' => $productId]);
                    
                    $product['variants'] = $variants ?: [];
                    $products[$productId] = $product;
                }
            }
            
            return $products;
        } catch (Exception $e) {
            error_log("Error getting products from database: " . $e->getMessage());
            
            // Fallback: try a simpler approach
            try {
                $products = [];
                
                foreach ($productIds as $productId) {
                    // Simple product query
                    $productSql = "SELECT * FROM products WHERE id = :product_id";
                    $product = $this->db->fetch($productSql, [':product_id' => $productId]);
                    
                    if ($product) {
                        // Simple variant query
                        $variantSql = "SELECT * FROM product_variants WHERE product_id = :product_id";
                        $variants = $this->db->fetchAll($variantSql, [':product_id' => $productId]);
                        
                        $product['variants'] = $variants ?: [];
                        $products[$productId] = $product;
                    }
                }
                
                return $products;
            } catch (Exception $e2) {
                error_log("Fallback query also failed: " . $e2->getMessage());
                throw new Exception("Database error: " . $e2->getMessage());
            }
        }
    }
}
