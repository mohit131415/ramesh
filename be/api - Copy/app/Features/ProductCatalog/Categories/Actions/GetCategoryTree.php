<?php

namespace App\Features\ProductCatalog\Categories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Categories\Services\CategoryService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class GetCategoryTree
{
    private $categoryService;
    private $authorization;

    public function __construct()
    {
        $this->categoryService = new CategoryService();
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
                'status' => $request->getQuery('status')
            ];
            
            // Get subcategory options
            $subcategoryOptions = [
                'include_subcategories' => $request->getQuery('include_subcategories', 'true') === 'true',
                'subcategory_status' => $request->getQuery('subcategory_status'),
                'expand_all' => $request->getQuery('expand_all', 'false') === 'true'
            ];
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Get category tree
            $result = $this->categoryService->getCategoryTree(
                $page, 
                $limit, 
                $filters, 
                $subcategoryOptions,
                $isSuperAdmin
            );
            
            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Categories retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve category tree: ' . $e->getMessage());
        }
    }
}
