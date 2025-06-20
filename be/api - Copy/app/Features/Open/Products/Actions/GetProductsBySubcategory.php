<?php

namespace App\Features\Open\Products\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Products\Services\PublicProductService;
use App\Shared\Helpers\ResponseFormatter;

class GetProductsBySubcategory
{
    private $productService;
    private $response;

    public function __construct()
    {
        $this->productService = new PublicProductService();
        $this->response = new Response();
    }

    public function __invoke(Request $request, Response $response, array $args = [])
    {
        try {
            // Get subcategory ID from query parameters or route parameters
            $subcategoryId = isset($args['id']) ? (int)$args['id'] : (int)$request->getQuery('subcategory_id');

            // Validate subcategory ID
            if (!$subcategoryId) {
                $this->response->badRequest('Subcategory ID is required');
                return $this->response;
            }

            // Get page and limit from query parameters
            $page = (int)$request->getQuery('page', 1);
            $limit = (int)$request->getQuery('limit', 12);
            
            // Get sort parameters
            $sortBy = $request->getQuery('sort_by', 'created_at');
            $sortOrder = $request->getQuery('sort_order', 'desc');
            
            // Get filter parameters
            $minPrice = $request->getQuery('min_price') ? (float)$request->getQuery('min_price') : null;
            $maxPrice = $request->getQuery('max_price') ? (float)$request->getQuery('max_price') : null;
            $isVegetarian = $request->getQuery('is_vegetarian') ? (int)$request->getQuery('is_vegetarian') : null;

            // Get products by subcategory with pagination and filters
            $result = $this->productService->getProductsBySubcategory(
                $subcategoryId,
                [
                    'page' => $page,
                    'limit' => $limit,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                    'min_price' => $minPrice,
                    'max_price' => $maxPrice,
                    'is_vegetarian' => $isVegetarian
                ]
            );

            // Log for debugging
            error_log("Found " . count($result['products']) . " products for subcategory ID: " . $subcategoryId);

            // Return success response
            $this->response->ok(
                $result,
                'Products retrieved successfully'
            );
            return $this->response;
        } catch (\Exception $e) {
            // Log the error
            error_log("Error in GetProductsBySubcategory: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            // Return error response
            $this->response->serverError('Failed to retrieve products: ' . $e->getMessage());
            return $this->response;
        }
    }
}
    