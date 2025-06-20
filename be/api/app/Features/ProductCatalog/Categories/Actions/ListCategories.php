<?php

namespace App\Features\ProductCatalog\Categories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Categories\Services\CategoryService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class ListCategories
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
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Get categories
            $result = $this->categoryService->getAllCategories($page, $limit, $filters, $isSuperAdmin);
            
            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Categories retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve categories: ' . $e->getMessage());
        }
    }
}
