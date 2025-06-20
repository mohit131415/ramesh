<?php

namespace App\Features\ProductCatalog\Subcategories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Subcategories\Services\SubcategoryService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authorization;
use Exception;

class ViewSubcategory
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
            // Get subcategory ID from route parameter
            $subcategoryId = $request->getParam('id');
            
            if (empty($subcategoryId)) {
                throw new NotFoundException('Subcategory ID is required');
            }
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Get subcategory
            $subcategory = $this->subcategoryService->getSubcategoryById($subcategoryId, $isSuperAdmin);
            
            // Return response with subcategory details including category information
            return ResponseFormatter::success(
                $subcategory,
                'Subcategory retrieved successfully with category details'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve subcategory: ' . $e->getMessage());
        }
    }
}
