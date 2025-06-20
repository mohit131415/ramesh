<?php

namespace App\Features\ProductCatalog\Categories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Categories\Services\CategoryService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use App\Core\Security\Authentication;
use Exception;

class CreateCategory
{
    use ValidatesInput;
    
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
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Get request data
            $data = $request->getBody();
            
            // Get category image file if uploaded
            $file = $request->getFile('image');
            
            // Create category
            $category = $this->categoryService->createCategory($data, $file, $user['id']);
            
            // Return response
            return ResponseFormatter::success(
                $category,
                'Category created successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to create category: ' . $e->getMessage());
        }
    }
}
