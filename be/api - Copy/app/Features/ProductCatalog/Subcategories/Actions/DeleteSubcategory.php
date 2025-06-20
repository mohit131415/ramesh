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
use App\Core\Security\Authorization;
use Exception;

class DeleteSubcategory
{
    private $subcategoryService;
    private $authentication;
    private $authorization;

    public function __construct()
    {
        $this->subcategoryService = new SubcategoryService();
        $this->authentication = Authentication::getInstance();
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
            
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Check if user is authenticated
            if (!$user) {
                throw new AuthenticationException('User not authenticated');
            }
            
            // Check if user is super admin
            $isSuperAdmin = $this->authorization->isSuperAdmin();
            
            // Delete subcategory
            $result = $this->subcategoryService->deleteSubcategory($subcategoryId, $user['id'], $isSuperAdmin);
            
            // Return response
            return ResponseFormatter::success(
                ['id' => $subcategoryId, 'deleted' => $result],
                'Subcategory deleted successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to delete subcategory: ' . $e->getMessage());
        }
    }
}
