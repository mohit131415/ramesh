<?php

namespace App\Features\ProductCatalog\Subcategories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Subcategories\Services\SubcategoryService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class ListSubcategoriesByCategory
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
            // Get category ID from route parameter
            $categoryId = $request->getParam('category_id');
            
            if (empty($categoryId)) {
                throw new NotFoundException('Category ID is required');
            }
            
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
            
            // Get subcategories by category
            $result = $this->subcategoryService->getSubcategoriesByCategoryId(
                $categoryId, 
                $page, 
                $limit, 
                $filters, 
                $isSuperAdmin
            );
            
            // Return response
            return ResponseFormatter::success(
                $result['data'],
                'Subcategories retrieved successfully',
                $result['meta']
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve subcategories: ' . $e->getMessage());
        }
    }
}
