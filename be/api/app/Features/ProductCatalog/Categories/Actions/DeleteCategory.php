<?php

namespace App\Features\ProductCatalog\Categories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Categories\Services\CategoryService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use App\Core\Security\Authorization;
use Exception;

class DeleteCategory
{
    private $categoryService;
    private $authentication;
    private $authorization;

    public function __construct()
    {
        $this->categoryService = new CategoryService();
        $this->authentication = Authentication::getInstance();
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
            
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Delete category
            $result = $this->categoryService->deleteCategory($categoryId, $user['id'], $isSuperAdmin);
            
            // Return response
            return ResponseFormatter::success(
                ['id' => $categoryId, 'deleted' => $result],
                'Category deleted successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to delete category: ' . $e->getMessage());
        }
    }
}
