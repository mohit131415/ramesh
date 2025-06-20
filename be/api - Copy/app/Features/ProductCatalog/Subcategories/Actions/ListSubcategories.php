<?php

namespace App\Features\ProductCatalog\Subcategories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Subcategories\Services\SubcategoryService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class ListSubcategories
{
    private $subcategoryService;
    private $authorization;

    public function __construct()
    {
        $this->subcategoryService = new SubcategoryService();
        $this->authorization = Authorization::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Debug log
            error_log("ListSubcategories execute method called");
            
            // Get pagination parameters
            $page = (int) $request->getQuery('page', 1);
            $limit = (int) $request->getQuery('limit', 10);
            
            // Get filters - make sure they're all optional
            $filters = [];
            
            // Only add filters if they exist and are not empty
            if ($request->getQuery('search')) {
                $filters['search'] = $request->getQuery('search');
            }
            
            if ($request->getQuery('status')) {
                $filters['status'] = $request->getQuery('status');
            }
            
            if ($request->getQuery('category_id')) {
                $filters['category_id'] = $request->getQuery('category_id');
            }
            
            // Debug log
            error_log("Filters: " . json_encode($filters));
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Get subcategories
            $result = $this->subcategoryService->getAllSubcategories($page, $limit, $filters, $isSuperAdmin);
            
            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Subcategories retrieved successfully',
                $result['meta']
            );
        } catch (Exception $e) {
            error_log("Error in ListSubcategories: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw new Exception('Failed to retrieve subcategories: ' . $e->getMessage());
        }
    }
}
