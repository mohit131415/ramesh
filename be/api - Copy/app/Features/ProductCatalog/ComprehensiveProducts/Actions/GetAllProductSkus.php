<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class GetAllProductSkus
{
    private $productService;

    public function __construct()
    {
        $this->productService = new ComprehensiveProductService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get all product SKUs
            $result = $this->productService->getAllProductSkus();
            
            // Return response
            return ResponseFormatter::success(
                $result,
                'Product SKUs retrieved successfully'
            );
        } catch (Exception $e) {
            return ResponseFormatter::error(
                null,
                'Failed to retrieve product SKUs: ' + [$e->getMessage()],
                500
            );
        }
    }
}
