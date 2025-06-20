<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class GetComprehensiveProductById
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
            // Get product ID from route parameters
            $productId = $request->getParam('id');
            
            if (!$productId) {
                throw new Exception('Product ID is required');
            }
            
            // Check if user is super admin (to determine if we should include deleted products)
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Get comprehensive product by ID
            $product = $this->productService->getComprehensiveProductById($productId, $isSuperAdmin);
            
            if (!$product) {
                throw new NotFoundException('Product not found');
            }
            
            // Return response
            return ResponseFormatter::success(
                $product,
                'Product retrieved successfully'
            );
        } catch (NotFoundException $e) {
            return ResponseFormatter::error(
                null,
                ['message' => $e->getMessage()],
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve product: ' . $e->getMessage());
        }
    }
}
