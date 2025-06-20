<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use Exception;

class SearchProductBySku
{
    private $productService;
    private $authorization;
    
    public function __construct()
    {
        $this->productService = new ComprehensiveProductService();
        $this->authorization = Authorization::getInstance();
    }
    
    /**
     * Search for a product by SKU
     * 
     * @param Request $request
     * @param Response $response
     * @return array
     */
    public function execute(Request $request, Response $response)
    {
        try {
            // Get SKU from request
            $sku = $request->getQuery('sku');
            
            if (empty($sku)) {
                throw new ValidationException('SKU parameter is required');
            }
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Search for products by partial SKU match
            $products = $this->productService->getProductsByPartialSku($sku, $isSuperAdmin);
            
            if (empty($products)) {
                throw new NotFoundException('No products found with the provided SKU');
            }
            
            // Return response
            return ResponseFormatter::success(
                $products,
                'Products retrieved successfully'
            );
        } catch (ValidationException $e) {
            throw new ValidationException($e->getMessage());
        } catch (NotFoundException $e) {
            throw new NotFoundException($e->getMessage());
        } catch (Exception $e) {
            throw new Exception('Failed to search product by SKU: ' . $e->getMessage());
        }
    }
}
