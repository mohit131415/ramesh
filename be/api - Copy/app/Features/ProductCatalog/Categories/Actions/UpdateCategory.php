<?php

namespace App\Features\ProductCatalog\Categories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Categories\Services\CategoryService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use App\Core\Security\Authentication;
use App\Core\Security\Authorization;
use Exception;

class UpdateCategory
{
    use ValidatesInput;
    
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
            
            // Get request data
            $data = $request->getBody();
        
            // Debug log to see what data we're receiving
            error_log("Update Category - Received data: " . json_encode($data));
            
            // Remove _method parameter used for method override
            if (isset($data['_method'])) {
                unset($data['_method']);
            }
            
            // Get category image file if uploaded
            $file = $request->getFile('image');
            
            // Debug log for file
            if ($file) {
                error_log("Update Category - File received: " . ($file['name'] ?? 'No name'));
            } else {
                error_log("Update Category - No file received");
            }
            
            // Remove empty fields to avoid overwriting with empty values
            foreach ($data as $key => $value) {
                if ($value === '' || $value === null) {
                    unset($data[$key]);
                }
            }
            
            // Update category
            $category = $this->categoryService->updateCategory($categoryId, $data, $file, $user['id'], $isSuperAdmin);
            
            // Return response
            return ResponseFormatter::success(
                $category,
                'Category updated successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Update Category Error: " . $e->getMessage());
            throw new Exception('Failed to update category: ' . $e->getMessage());
        }
    }
}
