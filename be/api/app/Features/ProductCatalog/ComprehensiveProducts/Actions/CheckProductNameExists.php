<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class CheckProductNameExists
{
    private $productService;

    public function __construct()
    {
        $this->productService = new ComprehensiveProductService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get product name from query parameter
            $productName = $request->getQuery('name');
            $excludeProductId = $request->getQuery('exclude_id');
            
            if (empty($productName)) {
                return ResponseFormatter::error(
                    null,
                );
            }
            
            // Check if product name exists
            $exists = $this->productService->checkProductNameExists($productName, $excludeProductId);
            
            // Return response
            return ResponseFormatter::success(
                ['exists' => $exists],
                $exists ? 'Product name already exists' : 'Product name is available'
            );
        } catch (Exception $e) {
            return ResponseFormatter::error(
                null,
                'Failed to check product name: ' + [$e->getMessage()],
                500
            );
        }
    }
}
