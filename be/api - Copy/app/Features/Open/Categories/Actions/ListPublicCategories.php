<?php

namespace App\Features\Open\Categories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\Open\Categories\Services\PublicCategoryService;
use App\Shared\Helpers\ResponseFormatter;
use Exception;

class ListPublicCategories
{
    private $categoryService;

    public function __construct()
    {
        $this->categoryService = new PublicCategoryService();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get pagination parameters
            $page = (int) $request->getQuery('page', 1);
            $limit = (int) $request->getQuery('limit', 10);
            
            // Get filters
            $filters = [
                'search' => $request->getQuery('search')
            ];
            
            // Get categories with at least one product
            $result = $this->categoryService->getAllCategories($page, $limit, $filters);
            
            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Categories retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            // Fix: Wrap the error message in an array as the second parameter
            return ResponseFormatter::error(
                null,
                ['message' => 'Failed to retrieve categories: ' . $e->getMessage()],
                500
            );
        }
    }
}
