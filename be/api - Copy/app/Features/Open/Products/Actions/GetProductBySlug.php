<?php

namespace App\Features\Open\Products\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Products\Services\PublicProductService;

class GetProductBySlug
{
    private $productService;
    
    public function __construct()
    {
        $this->productService = new PublicProductService();
    }
    
    public function __invoke(Request $request, Response $response, array $args = [])
    {
        try {
            // Get slug from URL parameters
            $slug = $args['slug'] ?? '';
            
            if (empty($slug)) {
                return $response->json([
                    'status' => 'error',
                    'message' => 'Product slug is required',
                    'data' => null
                ], 400);
            }
            
            // Get product by slug
            $product = $this->productService->getProductBySlug($slug);
            
            if (!$product) {
                return $response->json([
                    'status' => 'error',
                    'message' => 'Product not found',
                    'data' => null
                ], 404);
            }
            
            return $response->json([
                'status' => 'success',
                'message' => 'Product retrieved successfully',
                'data' => $product
            ]);
            
        } catch (\PDOException $e) {
            error_log("Database error in GetProductBySlug: " . $e->getMessage());
            
            return $response->json([
                'status' => 'error',
                'message' => 'Database error: ' . $e->getMessage(),
                'code' => $e->getCode(),
                'data' => null
            ], 500);
        } catch (\Exception $e) {
            error_log("Error in GetProductBySlug: " . $e->getMessage());
            
            return $response->json([
                'status' => 'error',
                'message' => 'Failed to retrieve product: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
