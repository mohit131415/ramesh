<?php

namespace App\Features\ProductCatalog\Categories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Categories\Services\CategoryService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class ViewCategory
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
            // Get category ID from route parameter
            $categoryId = $request->getParam('id');
            
            if (empty($categoryId)) {
                throw new NotFoundException('Category ID is required');
            }
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Get category
            $category = $this->categoryService->getCategoryById($categoryId, $isSuperAdmin);
            
            // Return response
            return ResponseFormatter::success(
                $category,
                'Category retrieved successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve category: ' . $e->getMessage());
        }
    }
}
