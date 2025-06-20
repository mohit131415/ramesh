<?php

namespace App\Features\Open\Products\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Products\Services\PublicProductService;

class GetRelatedProducts
{
    private $productService;
    
    public function __construct()
    {
        $this->productService = new PublicProductService();
    }
    
    public function __invoke(Request $request, Response $response, array $args = [])
    {
        try {
            // Validate product ID
            if (!isset($args['id']) || !is_numeric($args['id'])) {
                return $response->json([
                    'status' => 'error',
                    'message' => 'Invalid product ID'
                ], 400);
            }
            
            $productId = (int)$args['id'];
            
            // Get limit from query params, default to 4
            $params = $request->getQuery();
            $limit = isset($params['limit']) && is_numeric($params['limit']) 
                ? (int)$params['limit'] 
                : 4;
                
            // Limit the maximum number of related products
            $limit = min($limit, 12);
            
            // Get related products
            $relatedProducts = $this->productService->getRelatedProducts($productId, $limit);
            
            return $response->json([
                'status' => 'success',
                'message' => 'Related products retrieved successfully',
                'data' => $relatedProducts
            ]);
            
        } catch (\Exception $e) {
            return $response->json([
                'status' => 'error',
                'message' => 'Failed to retrieve related products: ' . $e->getMessage()
            ], 500);
        }
    }
}
