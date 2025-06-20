<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Cart\Services\CartService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class ValidateCoupon
{
    private $cartService;

    public function __construct()
    {
        $this->cartService = new CartService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get request data
            $data = $request->getBody();
            $couponCode = $data['coupon_code'] ?? null;
            $cartTotal = $data['cart_total'] ?? 0;
            
            // Validate required fields
            if (!$couponCode) {
                return $response->json(ResponseFormatter::error(
                    'Coupon code is required'
                ), 400);
            }
            
            if ($cartTotal <= 0) {
                return $response->json(ResponseFormatter::error(
                    'Cart total must be greater than 0'
                ), 400);
            }
            
            // Get user ID from token if available
            $userId = null;
            $token = $request->getBearerToken();
            
            if ($token) {
                // TODO: Get user ID from token
                // For now, we'll use the user_id from body if available
                $userId = $data['user_id'] ?? null;
            }
            
            // Validate coupon with all conditions
            $validation = $this->cartService->validateCoupon($couponCode, $cartTotal, $userId);
            
            if (!$validation['valid']) {
                return $response->json(ResponseFormatter::error(
                    $validation['message']
                ), 400);
            }
            
            // Calculate new total with discount
            $discountAmount = $validation['discount_amount'];
            $newTotal = $cartTotal - $discountAmount;
            
            return $response->json(ResponseFormatter::success(
                [
                    'coupon' => [
                        'id' => $validation['coupon']['id'],
                        'code' => $validation['coupon']['code'],
                        'name' => $validation['coupon']['name'],
                        'description' => $validation['coupon']['description'],
                        'discount_type' => $validation['coupon']['discount_type'],
                        'discount_value' => $validation['coupon']['discount_value'],
                        'discount_amount' => $discountAmount,
                        'is_valid' => true
                    ],
                    'cart_summary' => [
                        'subtotal' => $cartTotal,
                        'discount_amount' => $discountAmount,
                        'total' => round($newTotal, 2)
                    ]
                ],
                $validation['message'] ?? 'Coupon is valid'
            ));
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to validate coupon: ' . $e->getMessage()
            ), 500);
        }
    }
}
