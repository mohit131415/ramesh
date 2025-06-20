<?php

namespace App\Features\Open\Checkout\Services;

use App\Core\Database;
use App\Features\Open\Cart\Services\CartService;
use App\Features\Open\UserAddress\Services\UserAddressService;
use App\Features\Open\Cart\DataAccess\CouponRepository;
use Exception;

class CheckoutService
{
    private $cartService;
    private $userAddressService;
    private $couponRepository;
    private $db;
    private $settings = [];
    private $storeState;

    public function __construct()
    {
        $this->cartService = new CartService();
        $this->userAddressService = new UserAddressService();
        $this->couponRepository = new CouponRepository();
        $this->db = Database::getInstance();
        $this->loadSettings();
        $this->storeState = strtolower($this->settings['store_state'] ?? 'Maharashtra');
    }

    /**
     * Load all required settings from the settings table
     */
    private function loadSettings()
    {
        try {
            $settingsQuery = "SELECT `key`, value FROM settings WHERE `key` IN (
                'free_shipping_threshold', 
                'shipping_charges', 
                'cod_charges', 
                'cod_enabled', 
                'online_payment_enabled',
                'max_addresses_per_user',
                'store_name',
                'store_address_line1',
                'store_address_line2',
                'store_city',
                'store_state',
                'store_postal_code',
                'store_country',
                'store_phone',
                'store_email',
                'delivery_time_express'
            )";
            
            $settingsResult = $this->db->fetchAll($settingsQuery);
            
            // Convert to associative array
            foreach ($settingsResult as $setting) {
                $this->settings[$setting['key']] = $setting['value'];
            }
            
            // Set defaults for any missing settings
            $this->settings['free_shipping_threshold'] = $this->settings['free_shipping_threshold'] ?? 500;
            $this->settings['shipping_charges'] = $this->settings['shipping_charges'] ?? 50;
            $this->settings['cod_charges'] = $this->settings['cod_charges'] ?? 25;
            $this->settings['cod_enabled'] = $this->settings['cod_enabled'] ?? 1;
            $this->settings['online_payment_enabled'] = $this->settings['online_payment_enabled'] ?? 1;
            
            error_log("Loaded checkout settings: " . json_encode($this->settings));
        } catch (Exception $e) {
            error_log("Error loading settings: " . $e->getMessage());
            // Set defaults if loading fails
            $this->settings = [
                'free_shipping_threshold' => 500,
                'shipping_charges' => 50,
                'cod_charges' => 25,
                'cod_enabled' => 1,
                'online_payment_enabled' => 1,
                'store_state' => 'Maharashtra'
            ];
        }
    }

    /**
     * Prepare checkout data for a user
     * 
     * @param int $userId User ID
     * @param int|null $addressId Address ID (optional)
     * @param string|null $paymentMethod Payment method (cod, online)
     * @return array Checkout data with all calculations
     */
    public function prepareCheckout($userId, $addressId = null, $paymentMethod = null)
    {
        try {
            // Get cart data with all validations
            $cartData = $this->cartService->getOrCreateCart($userId);

            // Debug: Log the cart data to see coupon information
            error_log("Cart data in checkout: " . json_encode($cartData));

            // Get user's address
            $address = null;
            
            if ($addressId) {
                // Try to get the specific address by ID
                try {
                    $address = $this->userAddressService->getAddress($addressId, $userId);
                    error_log("Retrieved address by ID: " . json_encode($address));
                } catch (Exception $e) {
                    error_log("Error getting address by ID: " . $e->getMessage());
                    throw new Exception("The selected delivery address was not found. Please select a valid address.");
                }
            } else {
                // Try to get default address
                try {
                    $address = $this->userAddressService->getDefaultAddress($userId);
                    error_log("Retrieved default address: " . json_encode($address));
                } catch (Exception $e) {
                    error_log("Error getting default address: " . $e->getMessage());
                    // Continue without address - will be handled later
                }
            }
            
            // If no address was found, check if user has any addresses
            if (!$address) {
                try {
                    $addressesData = $this->userAddressService->getUserAddresses($userId);
                    error_log("User addresses data: " . json_encode($addressesData));
                    
                    // Check if addresses are in the expected format
                    if (isset($addressesData['addresses']) && !empty($addressesData['addresses'])) {
                        $address = $addressesData['addresses'][0]; // Use the first address
                        error_log("Using first available address: " . json_encode($address));
                    } else {
                        error_log("No addresses found for user");
                    }
                } catch (Exception $e) {
                    error_log("Error getting user addresses: " . $e->getMessage());
                }
            }

            // Extract coupon discount amount from cart totals
            $couponDiscountAmount = 0;
            $appliedCoupon = null;

            if (isset($cartData['applied_coupon'])) {
                $appliedCoupon = $cartData['applied_coupon'];
                $couponDiscountAmount = $appliedCoupon['discount_amount'] ?? 0;
                error_log("Applied coupon found: " . json_encode($appliedCoupon));
                error_log("Coupon discount amount: " . $couponDiscountAmount);
            }

            // Also check in cart totals
            if (isset($cartData['totals']['coupon_discount_amount'])) {
                $couponDiscountAmount = max($couponDiscountAmount, $cartData['totals']['coupon_discount_amount']);
                error_log("Coupon discount from totals: " . $cartData['totals']['coupon_discount_amount']);
            }
            
            // Validate all cart items and recalculate taxes based on address state
            $validatedItems = $this->validateAndRecalculateCartItems($cartData['items'], $address);
            
            // Add coupon discount to validated totals
            $validatedItems['totals']['coupon_discount_amount'] = $couponDiscountAmount;

            error_log("Final coupon discount amount: " . $couponDiscountAmount);
            
            // Check if cart is empty
            if (empty($cartData['items'])) {
                throw new Exception("Your cart is empty. Please add items to proceed with checkout.");
            }
            
            // Check if there are any inactive items
            if (!empty($cartData['inactive_items'])) {
                $inactiveCount = count($cartData['inactive_items']);
                $message = "There " . ($inactiveCount > 1 ? "are {$inactiveCount} items" : "is 1 item") . " in your cart that " . 
                           ($inactiveCount > 1 ? "are" : "is") . " currently unavailable. Please remove " . 
                           ($inactiveCount > 1 ? "them" : "it") . " to proceed.";
                           
                throw new Exception($message);
            }
            
            // Calculate shipping charges
            $shippingInfo = $this->calculateShippingCharges($validatedItems['totals']['subtotal']);
            
            // Calculate payment method charges and validate payment method
            $paymentInfo = $this->calculatePaymentCharges($paymentMethod);
            
            // Calculate final totals
            $finalTotals = $this->calculateFinalTotals(
                $validatedItems['totals'], 
                $shippingInfo['shipping_charges'],
                $paymentInfo['payment_charges']
            );
            
            // Verify cart totals match calculated totals
            $this->verifyCartTotals($cartData['totals'], $validatedItems['totals']);
            
            // Prepare store information
            $storeInfo = $this->getStoreInformation();
            
            // Calculate professional bill breakdown
            $billBreakdown = $this->calculateProfessionalBillBreakdown(
                $validatedItems['totals'],
                $shippingInfo,
                $paymentInfo,
                $cartData['applied_coupon'] ?? null,
                $validatedItems['tax_breakdown'] // Add this parameter
            );
            
            // Prepare checkout data - SORTED FOR FRONTEND
            $checkoutData = [
                // 1. PAYMENT SUMMARY - Most important for checkout
                'final_amount_to_pay' => $billBreakdown['final_total'],
                'bill_breakdown' => $billBreakdown,
                
                // 2. ITEMS - What user is buying
                'items' => array_map(function($item) {
                    return [
                        'id' => $item['product_id'],
                        'variant_id' => $item['variant_id'],
                        'name' => $item['name'],
                        'image' => $item['image'],
                        'variant' => [
                            'name' => $item['current_variant']['name'],
                            'sku' => $item['current_variant']['sku'],
                            'weight' => $item['current_variant']['weight']
                        ],
                        'quantity' => $item['quantity'],
                        'price' => floatval($item['price']),
                        'original_price' => floatval($item['original_price']),
                        'discount' => $item['line_discount_amount'], // Changed from discount_amount to line_discount_amount
                        'line_total' => $item['line_total'],
                        'limits' => [
                            'min' => $item['min_quantity'],
                            'max' => $item['max_quantity']
                        ]
                    ];
                }, $validatedItems['items']),
                
                // 3. DELIVERY ADDRESS
                'address' => $address ? [
                    'id' => $address['id'],
                    'name' => $address['contact_name'],
                    'phone' => $address['contact_phone'],
                    'full_address' => trim($address['address_line1'] . ' ' . ($address['address_line2'] ?? '')),
                    'city' => $address['city'],
                    'state' => $address['state'],
                    'pincode' => $address['postal_code'],
                    'type' => $address['address_type'] ?? 'home',
                    'is_default' => $address['is_default'] ?? false
                ] : null,
                'has_address' => !empty($address),
                
                // 4. SHIPPING INFO
                'shipping' => [
                    'is_free' => $shippingInfo['is_free_shipping'],
                    'charges' => $shippingInfo['shipping_charges'],
                    'savings' => $shippingInfo['shipping_savings'],
                    'message' => $shippingInfo['shipping_message'],
                    'delivery_time' => $shippingInfo['delivery_time'],
                    'threshold' => $shippingInfo['free_shipping_threshold']
                ],
                
                // 5. PAYMENT OPTIONS
                'payment' => [
                    'methods' => [
                        [
                            'code' => 'cod',
                            'name' => 'Cash on Delivery',
                            'charges' => $paymentInfo['available_methods']['cod']['charges'],
                            'available' => $paymentInfo['available_methods']['cod']['is_available']
                        ],
                        [
                            'code' => 'online',
                            'name' => 'Online Payment',
                            'charges' => $paymentInfo['available_methods']['online']['charges'],
                            'available' => $paymentInfo['available_methods']['online']['is_available']
                        ]
                    ],
                    'selected' => $paymentInfo['selected_method'],
                    'charges' => $paymentInfo['payment_charges']
                ],
                
                // 6. COUPON (if applied)
                'coupon' => isset($cartData['applied_coupon']) ? [
                    'code' => $cartData['applied_coupon']['code'],
                    'name' => $cartData['applied_coupon']['name'],
                    'discount' => $cartData['applied_coupon']['discount_amount'],
                    'type' => $cartData['applied_coupon']['discount_type']
                ] : null,
                
                // 7. TAX BREAKDOWN
                'tax_details' => [
                    'type' => $validatedItems['tax_breakdown']['tax_type'],
                    'igst' => $validatedItems['tax_breakdown']['igst'],
                    'cgst' => $validatedItems['tax_breakdown']['cgst'],
                    'sgst' => $validatedItems['tax_breakdown']['sgst'],
                    'total' => $finalTotals['tax_amount']
                ],
                
                // 8. STORE INFO (minimal)
                'store' => [
                    'name' => $storeInfo['name'],
                    'phone' => $storeInfo['contact']['phone'],
                    'city' => $storeInfo['address']['city'],
                    'state' => $storeInfo['address']['state']
                ]
            ];
            
            return $checkoutData;
        } catch (Exception $e) {
            error_log("Error in prepareCheckout: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Calculate professional bill breakdown like real e-commerce platforms
     */
    private function calculateProfessionalBillBreakdown($totals, $shippingInfo, $paymentInfo, $appliedCoupon = null, $taxBreakdown = null)
    {
        // Calculate original amounts (before any discounts)
        $originalSubtotal = $totals['subtotal'] + $totals['product_discount_amount'];
        $couponDiscountAmount = $totals['coupon_discount_amount'] ?? 0;

        // If we have applied coupon data but no discount amount, use the coupon data
        if ($appliedCoupon && $couponDiscountAmount == 0) {
            $couponDiscountAmount = $appliedCoupon['discount_amount'] ?? 0;
        }

        error_log("Bill breakdown - Coupon discount amount: " . $couponDiscountAmount);
        error_log("Bill breakdown - Applied coupon: " . json_encode($appliedCoupon));
        
        // Calculate amount before roundoff
        $amountBeforeRoundoff = $totals['subtotal'] - $couponDiscountAmount + $shippingInfo['shipping_charges'] + $paymentInfo['payment_charges'];
        $finalTotal = round($amountBeforeRoundoff);
        $roundoff = round($finalTotal - $amountBeforeRoundoff, 2);
        
        // Calculate total savings including negative roundoff (if applicable)
        $productDiscountAmount = $totals['product_discount_amount'];
        $roundoffSavings = $roundoff < 0 ? abs($roundoff) : 0;
        $totalSavings = $productDiscountAmount + $couponDiscountAmount + $roundoffSavings;
        
        // Step-by-step breakdown
        $breakdown = [
            // STEP 1: Original Cart Value
            'cart_value' => [
                'original_amount' => $originalSubtotal,
                'description' => 'Cart Total (MRP)'
            ],
            
            // STEP 2: Product Discounts
            'product_discounts' => [
                'amount' => $productDiscountAmount,
                'description' => 'Product Discounts',
                'savings' => $productDiscountAmount > 0
            ],
            
            // STEP 3: Amount after product discounts
            'amount_after_product_discounts' => [
                'amount' => $totals['subtotal'],
                'description' => 'Subtotal (After Product Discounts)'
            ],
            
            // STEP 4: Coupon Discount (if any)
            'coupon_discount' => [
                'amount' => $couponDiscountAmount,
                'description' => $appliedCoupon ? "Coupon Discount ({$appliedCoupon['code']})" : 'Coupon Discount',
                'applied' => $couponDiscountAmount > 0, // Fix: Check amount instead of just existence
                'code' => $appliedCoupon['code'] ?? null,
                'type' => $appliedCoupon['discount_type'] ?? null,
                'original_value' => $appliedCoupon['discount_value'] ?? null
            ],
            
            // STEP 5: Amount after all discounts
            'amount_after_discounts' => [
                'amount' => $totals['subtotal'] - $couponDiscountAmount,
                'description' => 'Amount (After All Discounts)'
            ],
            
            // STEP 6: Shipping Charges
            'shipping' => [
                'amount' => $shippingInfo['shipping_charges'],
                'description' => $shippingInfo['is_free_shipping'] ? 'Shipping (FREE)' : 'Shipping Charges',
                'is_free' => $shippingInfo['is_free_shipping'],
                'savings' => $shippingInfo['shipping_savings'],
                'original_amount' => $shippingInfo['standard_shipping_charges']
            ],
            
            // STEP 7: Payment Charges (if any)
            'payment_charges' => [
                'amount' => $paymentInfo['payment_charges'],
                'description' => 'Payment Processing Charges',
                'applied' => $paymentInfo['payment_charges'] > 0
            ],
            
            // STEP 8: Tax Calculation with detailed breakdown
            'tax' => [
                'amount' => $totals['tax_amount'],
                'description' => 'Taxes (Inclusive)',
                'note' => 'All prices are inclusive of applicable taxes',
                'breakdown' => [
                    'igst' => $taxBreakdown['igst'] ?? 0,
                    'cgst' => $taxBreakdown['cgst'] ?? 0,
                    'sgst' => $taxBreakdown['sgst'] ?? 0,
                    'tax_type' => $taxBreakdown['tax_type'] ?? 'igst'
                ]
            ],
            
            // STEP 9: Amount Before Roundoff
            'amount_before_roundoff' => [
                'amount' => round($amountBeforeRoundoff, 2),
                'description' => 'Amount Before Roundoff'
            ],
            
            // STEP 10: Roundoff Applied
            'roundoff' => [
                'amount' => $roundoff,
                'description' => 'Roundoff Applied',
                'note' => $roundoff > 0 ? 'Rounded up' : ($roundoff < 0 ? 'Rounded down' : 'No rounding needed'),
                'is_saving' => $roundoff < 0
            ],
            
            // STEP 11: Total Savings
            'total_savings' => [
                'amount' => $totalSavings,
                'description' => 'Total Savings',
                'breakdown' => [
                    'product_discounts' => $productDiscountAmount,
                    'coupon_discount' => $couponDiscountAmount,
                    'roundoff_savings' => $roundoffSavings
                ]
            ],
            
            // STEP 12: Final Amount
            'final_total' => $finalTotal,
            
            // SUMMARY FOR QUICK REFERENCE
            'summary' => [
                'original_total' => $originalSubtotal,
                'total_discounts' => $totalSavings,
                'subtotal_after_discounts' => $totals['subtotal'] - $couponDiscountAmount,
                'shipping_charges' => $shippingInfo['shipping_charges'],
                'payment_charges' => $paymentInfo['payment_charges'],
                'tax_amount' => $totals['tax_amount'],
                'amount_before_roundoff' => round($amountBeforeRoundoff, 2),
                'roundoff' => $roundoff,
                'roundoff_savings' => $roundoffSavings,
                'final_amount' => $finalTotal,
                'total_savings' => $totalSavings,
                'item_count' => $totals['item_count'],
                'total_quantity' => $totals['total_quantity']
            ]
        ];
        
        return $breakdown;
    }

    /**
     * Complete checkout process
     * 
     * @param int $userId User ID
     * @param int $addressId Address ID
     * @param string $paymentMethod Payment method (cod, online)
     * @param string|null $paymentId Payment ID for online payments
     * @param array|null $additionalData Additional data for order
     * @return array Order confirmation data
     */
    public function completeCheckout($userId, $addressId, $paymentMethod, $paymentId = null, $additionalData = null)
    {
        try {
            // Validate address exists before proceeding
            if (!$addressId) {
                throw new Exception("A delivery address ID is required to complete checkout.");
            }
            
            // Try to get the specific address by ID first to validate it exists
            try {
                $address = $this->userAddressService->getAddress($addressId, $userId);
                if (!$address) {
                    throw new Exception("The selected delivery address was not found.");
                }
            } catch (Exception $e) {
                error_log("Error validating address in completeCheckout: " . $e->getMessage());
                throw new Exception("The selected delivery address was not found. Please select a valid address.");
            }
            
            // Now prepare checkout to validate everything else
            $checkoutData = $this->prepareCheckout($userId, $addressId, $paymentMethod);
            
            // Double check address is present
            if (empty($checkoutData['address'])) {
                throw new Exception("A delivery address is required to complete checkout.");
            }
            
            // Validate payment method
            if (!in_array($paymentMethod, ['cod', 'online'])) {
                throw new Exception("Invalid payment method selected.");
            }
            
            if ($paymentMethod === 'online' && empty($paymentId)) {
                throw new Exception("Payment ID is required for online payments.");
            }
            
            if ($paymentMethod === 'online' && $this->settings['online_payment_enabled'] != 1) {
                throw new Exception("Online payment is currently not available.");
            }
            
            if ($paymentMethod === 'cod' && $this->settings['cod_enabled'] != 1) {
                throw new Exception("Cash on delivery is currently not available.");
            }
            
            // This is a placeholder for actual order creation
            // In a real implementation, you would:
            // 1. Create an order record
            // 2. Create order items
            // 3. Apply coupon to order if any
            // 4. Record payment details
            // 5. Clear the cart
            
            // For now, we'll just return a success response with order details
            $orderNumber = 'ORD-' . strtoupper(substr(md5(uniqid()), 0, 8));
            $orderDate = date('Y-m-d H:i:s');
            
            return [
                'order_number' => $orderNumber,
                'order_date' => $orderDate,
                'order_status' => 'pending',
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentMethod === 'cod' ? 'pending' : 'paid',
                'items' => $checkoutData['items'],
                'address' => $checkoutData['address'],
                'bill_breakdown' => $checkoutData['bill_breakdown'],
                'shipping_info' => $checkoutData['shipping'],
                'payment_info' => $checkoutData['payment'],
                'tax_breakdown' => $checkoutData['tax_details'],
                'estimated_delivery' => $this->getEstimatedDeliveryDate(),
                'final_amount_to_pay' => $checkoutData['final_amount_to_pay']
            ];
        } catch (Exception $e) {
            error_log("Error in completeCheckout: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Validate all cart items and recalculate taxes based on address state
     * 
     * @param array $items Cart items
     * @param array|null $address User address
     * @return array Validated items with recalculated taxes
     */
    private function validateAndRecalculateCartItems($items, $address = null)
    {
        $validatedItems = [];
        $subtotal = 0;
        $baseAmount = 0;
        $taxAmount = 0;
        $productDiscountAmount = 0;
        $totalQuantity = 0;
        $taxBreakdown = [
            'igst' => 0,
            'cgst' => 0,
            'sgst' => 0,
            'tax_type' => 'igst' // Default to IGST
        ];
        
        // Determine tax type based on address state
        $isSameState = false;
        if ($address && isset($address['state']) && !empty($address['state'])) {
            $customerState = strtolower(trim($address['state']));
            $storeState = strtolower(trim($this->storeState));
            $isSameState = ($customerState === $storeState);
            $taxBreakdown['tax_type'] = $isSameState ? 'cgst_sgst' : 'igst';
            error_log("Tax calculation: Customer state: {$customerState}, Store state: {$storeState}, Same state: " . ($isSameState ? 'Yes' : 'No'));
        } else {
            error_log("No address state provided, defaulting to IGST");
        }
        
        foreach ($items as $item) {
            // Validate product and variant
            $productId = $item['product_id'];
            $variantId = $item['variant_id'];
            
            // Check if product exists and is active
            $product = $this->getProductById($productId);
            if (!$product || $product['status'] !== 'active') {
                throw new Exception("Product '{$item['name']}' is no longer available.");
            }
            
            // Check if variant exists and is active
            $variant = $this->getVariantById($variantId);
            if (!$variant || $variant['status'] !== 'active') {
                throw new Exception("The selected variant '{$item['current_variant']['name']}' for '{$item['name']}' is no longer available.");
            }
            
            // Validate quantity against min/max limits
            $minQuantity = $variant['min_order_quantity'] ?? 1;
            $maxQuantity = $variant['max_order_quantity'] ?? 10;
            
            if ($item['quantity'] < $minQuantity) {
                throw new Exception("The minimum order quantity for '{$item['name']}' is {$minQuantity}.");
            }
            
            if ($item['quantity'] > $maxQuantity) {
                throw new Exception("The maximum order quantity for '{$item['name']}' is {$maxQuantity}.");
            }
            
            // Get the correct price
            $price = $variant['sale_price'] ?? $variant['price'];
            if ($price <= 0) {
                throw new Exception("Invalid price for '{$item['name']}'.");
            }
            
            // Calculate discount
            $originalPrice = $variant['price'];
            $discountAmount = $originalPrice - $price;
            $discountPercentage = $originalPrice > 0 ? round(($discountAmount / $originalPrice) * 100, 2) : 0;
            
            // Calculate tax based on address state
            $taxRate = $product['tax_rate'] ?? 5; // Default to 5% if not specified
            
            // Calculate base price (price before tax)
            $basePrice = round($price / (1 + ($taxRate / 100)), 2);
            $itemTaxAmount = round($price - $basePrice, 2);
            
            // Calculate line totals
            $lineBaseAmount = round($basePrice * $item['quantity'], 2);
            $lineTaxAmount = round($itemTaxAmount * $item['quantity'], 2);
            $lineTotal = round($price * $item['quantity']);
            $lineDiscountAmount = round($discountAmount * $item['quantity'], 2);
            
            // Update tax breakdown
            if ($isSameState) {
                // Split tax into CGST and SGST
                $halfTaxRate = $taxRate / 2;
                $halfTaxAmount = $lineTaxAmount / 2;
                $taxBreakdown['cgst'] += $halfTaxAmount;
                $taxBreakdown['sgst'] += $halfTaxAmount;
            } else {
                // Full tax as IGST
                $taxBreakdown['igst'] += $lineTaxAmount;
            }
            
            // Add to totals
            $subtotal += $lineTotal;
            $baseAmount += $lineBaseAmount;
            $taxAmount += $lineTaxAmount;
            $productDiscountAmount += $lineDiscountAmount;
            $totalQuantity += $item['quantity'];
            
            // Create validated item - CLEAN VERSION FOR CHECKOUT
            $validatedItem = [
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'],
                'name' => $item['name'],
                'slug' => $item['slug'],
                'description' => $item['description'],
                'image' => $item['image'],
                'quantity' => $item['quantity'],
                'price' => $price,
                'original_price' => $originalPrice,
                'discount_amount' => $discountAmount,
                'discount_percentage' => $discountPercentage,
                'line_total' => $lineTotal,
                'line_discount_amount' => $lineDiscountAmount,
                'min_quantity' => $minQuantity,
                'max_quantity' => $maxQuantity,
                'current_variant' => [
                    'id' => $item['current_variant']['id'],
                    'name' => $item['current_variant']['name'],
                    'sku' => $item['current_variant']['sku'],
                    'weight' => $item['current_variant']['weight']
                ],
                'tax_breakdown' => $isSameState ? [
                    'cgst_rate' => $halfTaxRate,
                    'sgst_rate' => $halfTaxRate,
                    'cgst_amount' => round($halfTaxAmount, 2),
                    'sgst_amount' => round($halfTaxAmount, 2)
                ] : [
                    'igst_rate' => $taxRate,
                    'igst_amount' => round($lineTaxAmount, 2)
                ]
            ];
            
            $validatedItems[] = $validatedItem;
        }
        
        // Round tax breakdown values
        $taxBreakdown['igst'] = round($taxBreakdown['igst'], 2);
        $taxBreakdown['cgst'] = round($taxBreakdown['cgst'], 2);
        $taxBreakdown['sgst'] = round($taxBreakdown['sgst'], 2);
        
        // Calculate totals
        $totals = [
            'subtotal' => $subtotal,
            'base_amount' => $baseAmount,
            'tax_amount' => $taxAmount,
            'product_discount_amount' => $productDiscountAmount,
            'item_count' => count($validatedItems),
            'total_quantity' => $totalQuantity
        ];
        
        return [
            'items' => $validatedItems,
            'totals' => $totals,
            'tax_breakdown' => $taxBreakdown
        ];
    }

    /**
     * Get product by ID
     * 
     * @param int $productId Product ID
     * @return array|null Product data
     */
    private function getProductById($productId)
    {
        try {
            $query = "
                SELECT * FROM products 
                WHERE id = :id AND status = 'active' AND deleted_at IS NULL
            ";
            
            return $this->db->fetch($query, [':id' => $productId]);
        } catch (Exception $e) {
            error_log("Error getting product by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get variant by ID
     * 
     * @param int $variantId Variant ID
     * @return array|null Variant data
     */
    private function getVariantById($variantId)
    {
        try {
            $query = "
                SELECT * FROM product_variants 
                WHERE id = :id AND status = 'active'
            ";
            
            return $this->db->fetch($query, [':id' => $variantId]);
        } catch (Exception $e) {
            error_log("Error getting variant by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verify that cart totals match calculated totals
     * 
     * @param array $cartTotals Cart totals from database
     * @param array $calculatedTotals Calculated totals
     * @throws Exception If totals don't match
     */
    private function verifyCartTotals($cartTotals, $calculatedTotals)
    {
        // Allow for small rounding differences (up to 1 rupee)
        $subtotalDiff = abs($cartTotals['subtotal'] - $calculatedTotals['subtotal']);
        $baseAmountDiff = abs($cartTotals['base_amount'] - $calculatedTotals['base_amount']);
        $taxAmountDiff = abs($cartTotals['tax_amount'] - $calculatedTotals['tax_amount']);
        
        if ($subtotalDiff > 1) {
            error_log("Cart subtotal mismatch: DB={$cartTotals['subtotal']}, Calculated={$calculatedTotals['subtotal']}");
            throw new Exception("Cart total mismatch. Please try refreshing your cart.");
        }
        
        if ($baseAmountDiff > 1) {
            error_log("Cart base amount mismatch: DB={$cartTotals['base_amount']}, Calculated={$calculatedTotals['base_amount']}");
            throw new Exception("Cart base amount mismatch. Please try refreshing your cart.");
        }
        
        if ($taxAmountDiff > 1) {
            error_log("Cart tax amount mismatch: DB={$cartTotals['tax_amount']}, Calculated={$calculatedTotals['tax_amount']}");
            throw new Exception("Cart tax amount mismatch. Please try refreshing your cart.");
        }
    }

    /**
     * Calculate shipping charges based on order subtotal
     * 
     * @param float $subtotal Order subtotal
     * @return array Shipping information
     */
    private function calculateShippingCharges($subtotal)
    {
        $freeShippingThreshold = floatval($this->settings['free_shipping_threshold']);
        $standardShippingCharges = floatval($this->settings['shipping_charges']);
        
        $isFreeShipping = $subtotal >= $freeShippingThreshold;
        $shippingCharges = $isFreeShipping ? 0 : $standardShippingCharges;
        
        // Calculate shipping savings
        $shippingSavings = $isFreeShipping ? $standardShippingCharges : 0;
        $amountNeededForFreeShipping = $isFreeShipping ? 0 : max(0, $freeShippingThreshold - $subtotal);
        
        return [
            'is_free_shipping' => $isFreeShipping,
            'free_shipping_threshold' => $freeShippingThreshold,
            'standard_shipping_charges' => $standardShippingCharges,
            'shipping_charges' => $shippingCharges,
            'shipping_savings' => $shippingSavings,
            'amount_needed_for_free_shipping' => $amountNeededForFreeShipping,
            'delivery_time' => $this->settings['delivery_time_express'] ?? '1-2 business days',
            'shipping_message' => $this->getShippingMessage($isFreeShipping, $shippingSavings, $amountNeededForFreeShipping)
        ];
    }

    /**
     * Get shipping message based on shipping status
     * 
     * @param bool $isFreeShipping Whether shipping is free
     * @param float $shippingSavings Amount saved on shipping
     * @param float $amountNeeded Amount needed for free shipping
     * @return string Shipping message
     */
    private function getShippingMessage($isFreeShipping, $shippingSavings, $amountNeeded)
    {
        if ($isFreeShipping && $shippingSavings > 0) {
            return "🎉 Congratulations! You saved ₹{$shippingSavings} on shipping charges.";
        } elseif ($amountNeeded > 0) {
            return "💡 Add ₹{$amountNeeded} more to your cart to get FREE shipping!";
        } else {
            return "📦 Standard shipping charges apply.";
        }
    }

    /**
     * Calculate payment method charges
     * 
     * @param string|null $paymentMethod Payment method (cod, online)
     * @return array Payment information
     */
    private function calculatePaymentCharges($paymentMethod)
    {
        $codCharges = floatval($this->settings['cod_charges']);
        $codEnabled = $this->settings['cod_enabled'] == 1;
        $onlineEnabled = $this->settings['online_payment_enabled'] == 1;
        
        $paymentCharges = 0;
        if ($paymentMethod === 'cod' && $codEnabled) {
            $paymentCharges = $codCharges;
        }
        
        return [
            'available_methods' => [
                'cod' => [
                    'name' => 'Cash on Delivery',
                    'code' => 'cod',
                    'charges' => $codCharges,
                    'is_available' => $codEnabled
                ],
                'online' => [
                    'name' => 'Online Payment',
                    'code' => 'online',
                    'charges' => 0,
                    'is_available' => $onlineEnabled
                ]
            ],
            'selected_method' => $paymentMethod,
            'payment_charges' => $paymentCharges
        ];
    }

    /**
     * Calculate final totals including shipping and payment charges
     * 
     * @param array $cartTotals Cart totals
     * @param float $shippingCharges Shipping charges
     * @param float $paymentCharges Payment charges
     * @return array Final totals
     */
    private function calculateFinalTotals($cartTotals, $shippingCharges, $paymentCharges)
    {
        $subtotal = $cartTotals['subtotal'];
        $productDiscountAmount = $cartTotals['product_discount_amount'] ?? 0;
        $couponDiscountAmount = $cartTotals['coupon_discount_amount'] ?? 0;
        $totalDiscountAmount = $cartTotals['total_discount_amount'] ?? $productDiscountAmount + $couponDiscountAmount;
        
        // Calculate total after discounts but before shipping and payment charges
        $totalAfterDiscounts = $subtotal - $totalDiscountAmount;
        
        // Add shipping and payment charges
        $totalWithCharges = $totalAfterDiscounts + $shippingCharges + $paymentCharges;
        
        // Apply roundoff
        $finalTotal = round($totalWithCharges);
        $roundoff = $finalTotal - $totalWithCharges;
        
        // Calculate roundoff savings (if negative roundoff)
        $roundoffSavings = $roundoff < 0 ? abs($roundoff) : 0;
        
        // Add roundoff savings to total discount if applicable
        $totalDiscountWithRoundoff = $totalDiscountAmount + $roundoffSavings;
        
        return [
            'subtotal' => $subtotal,
            'product_discount_amount' => $productDiscountAmount,
            'coupon_discount_amount' => $couponDiscountAmount,
            'total_discount_amount' => $totalDiscountAmount,
            'total_after_discounts' => $totalAfterDiscounts,
            'shipping_charges' => $shippingCharges,
            'payment_charges' => $paymentCharges,
            'amount_before_roundoff' => $totalWithCharges,
            'roundoff' => round($roundoff, 2),
            'roundoff_savings' => $roundoffSavings,
            'final_total' => $finalTotal,
            'tax_amount' => $cartTotals['tax_amount'] ?? 0,
            'base_amount' => $cartTotals['base_amount'] ?? 0,
            'item_count' => $cartTotals['item_count'] ?? 0,
            'total_quantity' => $cartTotals['total_quantity'] ?? 0,
            'total_savings_with_roundoff' => $totalDiscountWithRoundoff
        ];
    }

    /**
     * Get store information from settings
     * 
     * @return array Store information
     */
    private function getStoreInformation()
    {
        return [
            'name' => $this->settings['store_name'] ?? 'Ramesh Sweets',
            'address' => [
                'line1' => $this->settings['store_address_line1'] ?? '',
                'line2' => $this->settings['store_address_line2'] ?? '',
                'city' => $this->settings['store_city'] ?? '',
                'state' => $this->settings['store_state'] ?? '',
                'postal_code' => $this->settings['store_postal_code'] ?? '',
                'country' => $this->settings['store_country'] ?? 'India'
            ],
            'contact' => [
                'phone' => $this->settings['store_phone'] ?? '',
                'email' => $this->settings['store_email'] ?? ''
            ]
        ];
    }

    /**
     * Get estimated delivery date
     * 
     * @return array Estimated delivery information
     */
    private function getEstimatedDeliveryDate()
    {
        $deliveryTime = $this->settings['delivery_time_express'] ?? '1-2 business days';
        
        // Parse delivery time to get min and max days
        preg_match('/(\d+)-(\d+)/', $deliveryTime, $matches);
        $minDays = isset($matches[1]) ? intval($matches[1]) : 1;
        $maxDays = isset($matches[2]) ? intval($matches[2]) : 2;
        
        // Calculate min and max delivery dates
        $minDate = date('Y-m-d', strtotime("+{$minDays} weekdays"));
        $maxDate = date('Y-m-d', strtotime("+{$maxDays} weekdays"));
        
        return [
            'delivery_time' => $deliveryTime,
            'min_date' => $minDate,
            'max_date' => $maxDate,
            'formatted_range' => date('d M', strtotime($minDate)) . ' - ' . date('d M', strtotime($maxDate))
        ];
    }

    /**
     * Clean items data for frontend consumption
     */
    private function cleanItemsForFrontend($items)
    {
        $cleanItems = [];
        
        foreach ($items as $item) {
            $cleanItems[] = [
                'id' => $item['product_id'],
                'variant_id' => $item['variant_id'],
                'name' => $item['name'],
                'image' => $item['image'],
                'quantity' => $item['quantity'],
                'price' => floatval($item['price']),
                'original_price' => floatval($item['original_price']),
                'discount' => $item['discount_amount'],
                'line_total' => $item['line_total'],
                'variant' => [
                    'name' => $item['current_variant']['name'],
                    'sku' => $item['current_variant']['sku'],
                    'weight' => $item['current_variant']['weight']
                ],
                'limits' => [
                    'min' => $item['min_quantity'],
                    'max' => $item['max_quantity']
                ]
            ];
        }
        
        return $cleanItems;
    }

    /**
     * Clean address data for frontend consumption
     */
    private function cleanAddressForFrontend($address)
    {
        if (!$address) {
            return null;
        }
        
        return [
            'id' => $address['id'],
            'name' => $address['contact_name'],
            'phone' => $address['contact_phone'],
            'address' => trim($address['address_line1'] . ' ' . ($address['address_line2'] ?? '')),
            'city' => $address['city'],
            'state' => $address['state'],
            'pincode' => $address['postal_code'],
            'type' => $address['address_type'] ?? 'home'
        ];
    }
}
