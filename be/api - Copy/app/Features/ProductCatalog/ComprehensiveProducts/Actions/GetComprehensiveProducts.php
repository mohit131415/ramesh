<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class GetComprehensiveProducts
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
            // Get pagination parameters
            $page = (int) $request->getQuery('page', 1);
            $limit = (int) $request->getQuery('limit', 10);
            
            // Get filters
            $filters = [
                'search' => $request->getQuery('search'),
                'status' => $request->getQuery('status'),
                'category_id' => $request->getQuery('category_id'),
                'subcategory_id' => $request->getQuery('subcategory_id'),
                'is_vegetarian' => $request->getQuery('is_vegetarian'),
                'min_price' => $request->getQuery('min_price'),
                'max_price' => $request->getQuery('max_price'),
                'tags' => $request->getQuery('tags'),
                'product_type' => $request->getQuery('product_type')
            ];
            
            // Get sort parameters
            $sortBy = $request->getQuery('sort_by', 'created_at');
            $sortOrder = $request->getQuery('sort_order', 'desc');
            
            // Handle multiple statuses
            if ($request->getQuery('statuses')) {
                $filters['status'] = explode(',', $request->getQuery('statuses'));
            }

            // Handle multiple product types
            if ($request->getQuery('product_types')) {
                $filters['product_type'] = explode(',', $request->getQuery('product_types'));
            }
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Get comprehensive products
            $result = $this->productService->getComprehensiveProducts($page, $limit, $filters, $sortBy, $sortOrder, $isSuperAdmin);
            
            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Products retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve products: ' . $e->getMessage());
        }
    }
}
