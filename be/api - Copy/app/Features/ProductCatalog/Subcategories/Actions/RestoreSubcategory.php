<?php

namespace App\Features\ProductCatalog\Subcategories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Subcategories\Services\SubcategoryService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use Exception;

class RestoreSubcategory
{
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
            // Get subcategory ID from route parameter
            $subcategoryId = $request->getParam('id');
            
            if (empty($subcategoryId)) {
                throw new NotFoundException('Subcategory ID is required');
            }
            
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Check if user is authenticated
            if (!$user) {
                throw new AuthenticationException('User not authenticated');
            }
            
            // Restore subcategory
            $subcategory = $this->subcategoryService->restoreSubcategory($subcategoryId, $user['id']);
            
            // Return response
            return ResponseFormatter::success(
                $subcategory,
                'Subcategory restored successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to restore subcategory: ' . $e->getMessage());
        }
    }
}
