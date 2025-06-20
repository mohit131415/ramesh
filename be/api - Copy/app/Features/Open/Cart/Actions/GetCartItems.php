<?php

namespace App\Features\Open\Cart\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Cart\Services\CartItemService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetCartItems
{
    private $cartItemService;

    public function __construct()
    {
        $this->cartItemService = new CartItemService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get items from request body
            $requestData = $request->getBody();
            
            // If the body is not already an array, try to decode it as JSON
            if (!is_array($requestData)) {
                $jsonBody = file_get_contents('php://input');
                $requestData = json_decode($jsonBody, true) ?? [];
            }
            
            if (!isset($requestData['items']) || !is_array($requestData['items'])) {
                return $response->json(ResponseFormatter::error(
                    'Invalid request. Items array is required.'
                ), 400);
            }
            
            $items = $requestData['items'];
            
            // Get detailed product information for the items
            $result = $this->cartItemService->getCartItemsDetails($items);
            
            return $response->json(ResponseFormatter::success(
                $result,
                'Cart items retrieved successfully'
            ));
        } catch (Exception $e) {
            return $response->json(ResponseFormatter::error(
                'Failed to retrieve cart items: ' . $e->getMessage()
            ), 500);
        }
    }
}
