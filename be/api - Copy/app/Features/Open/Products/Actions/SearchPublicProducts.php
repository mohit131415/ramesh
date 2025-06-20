<?php

namespace App\Features\Open\Products\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Products\Services\PublicProductService;

class SearchPublicProducts
{
    private $productService;
    
    public function __construct()
    {
        $this->productService = new PublicProductService();
    }
    
    public function __invoke(Request $request, Response $response)
    {
        try {
            $params = $request->getQuery();
            
            // Debug log to check what parameters are being received
            error_log("Search API called with parameters: " . json_encode($params));
            
            // Accept both 'q' and 'query' parameters for flexibility
            $keyword = $params['q'] ?? $params['query'] ?? '';
            
            error_log("Search keyword: " . $keyword);
            
            $page = isset($params['page']) && is_numeric($params['page']) ? (int)$params['page'] : 1;
            $limit = isset($params['limit']) && is_numeric($params['limit']) ? (int)$params['limit'] : 12;
            
            // Limit the maximum number of items per page
            $limit = min($limit, 50);
            
            if (empty($keyword)) {
                return $response->json([
                    'status' => 'error',
                    'message' => 'Search keyword is required (use parameter "q" or "query")'
                ], 400);
            }
            
            $result = $this->productService->searchProducts($keyword, $page, $limit);
            
            return $response->json([
                'status' => 'success',
                'message' => 'Search results retrieved successfully',
                'data' => $result
            ]);
        } catch (\PDOException $e) {
            error_log("Database error in search API: " . $e->getMessage());
            return $response->json([
                'status' => 'error',
                'message' => 'Database error: ' . $e->getMessage(),
                'code' => $e->getCode()
            ], 500);
        } catch (\Exception $e) {
            error_log("Search API error: " . $e->getMessage());
            return $response->json([
                'status' => 'error',
                'message' => 'Failed to search products: ' . $e->getMessage()
            ], 500);
        }
    }
}
