<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Cart\Services\CartCalculationService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class CalculateCart
{
    private $cartCalculationService;

    public function __construct()
    {
        $this->cartCalculationService = new CartCalculationService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get request data
            $data = $request->getBody();
            
            // Validate required fields
            if (!isset($data['items']) || !is_array($data['items'])) {
                return $response->json(ResponseFormatter::error(
                    'Items array is required'
                ), 400);
            }
            
            // Extract parameters
            $items = $data['items'];
            $couponCode = $data['coupon_code'] ?? null;
            $shippingPincode = $data['shipping_pincode'] ?? null;
            $userId = $data['user_id'] ?? null;
            
            // Calculate cart
            $result = $this->cartCalculationService->calculateCart(
                $items,
                $couponCode,
                $shippingPincode,
                $userId
            );
            
            return $response->json(ResponseFormatter::success(
                $result,
                'Cart calculated successfully'
            ));
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to calculate cart: ' . $e->getMessage()
            ), 400);
        }
    }
}
