<?php

namespace App\Features\ProductCatalog\Categories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Categories\Services\CategoryService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use Exception;

class RestoreCategory
{
    private $categoryService;
    private $authentication;

    public function __construct()
    {
        $this->categoryService = new CategoryService();
        $this->authentication = Authentication::getInstance();
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
            
            // Restore category
            $category = $this->categoryService->restoreCategory($categoryId, $user['id']);
            
            // Return response
            return ResponseFormatter::success(
                $category,
                'Category restored successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to restore category: ' . $e->getMessage());
        }
    }
}
