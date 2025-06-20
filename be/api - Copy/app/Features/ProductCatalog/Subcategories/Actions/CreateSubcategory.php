<?php

namespace App\Features\ProductCatalog\Subcategories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Subcategories\Services\SubcategoryService;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use App\Core\Security\Authentication;
use Exception;

class CreateSubcategory
{
    use ValidatesInput;
    
    private $subcategoryService;
    private $authentication;

    public function __construct()
    {
        $this->subcategoryService = new SubcategoryService();
        $this->authentication = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Check if user is authenticated
            if (!$user) {
                throw new AuthenticationException('User not authenticated');
            }
            
            // Get request data
            $data = $request->getBody();
            
            // Get subcategory image file if uploaded
            $file = $request->getFile('image');
            
            // Create subcategory
            $subcategory = $this->subcategoryService->createSubcategory($data, $file, $user['id']);
            
            // Return response
            return ResponseFormatter::success(
                $subcategory,
                'Subcategory created successfully'
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to create subcategory: ' . $e->getMessage());
        }
    }
}
