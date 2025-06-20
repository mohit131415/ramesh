<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class GetTagSuggestions
{
    private $productService;
    private $authorization;

    public function __construct()
    {
        $this->productService = new ComprehensiveProductService();
        $this->authorization = Authorization::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get query parameter
            $query = $request->getQuery('query', '');
            
            // Get limit parameter (default to 1000)
            $limit = (int) $request->getQuery('limit', 1000);
            
            // Validate limit - allow up to 1000 tags
            if ($limit <= 0 || $limit > 1000) {
                $limit = 1000; // Default to 1000 if invalid
            }
            
            // Get tag suggestions
            $suggestions = $this->productService->getTagSuggestions($query, $limit);
            
            // Return success response
            return ResponseFormatter::success(
                $suggestions,
                'Tag suggestions retrieved successfully'
            );
        } catch (Exception $e) {
            // Custom response to match the status, message, data format
            $response->setStatusCode(400);
            return [
                'status' => 'error',
                'message' => 'Failed to retrieve tag suggestions: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }
}
