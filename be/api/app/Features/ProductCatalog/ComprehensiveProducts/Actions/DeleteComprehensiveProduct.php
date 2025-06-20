<?php

namespace App\Features\ProductCatalog\ComprehensiveProducts\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\ComprehensiveProducts\Services\ComprehensiveProductService;
use App\Shared\Helpers\ResponseFormatter;
use App\Core\Security\Authentication;
use App\Core\Security\Authorization;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Exceptions\NotFoundException;
use Exception;

class DeleteComprehensiveProduct
{
    private $productService;
    private $authentication;
    private $authorization;

    public function __construct()
    {
        $this->productService = new ComprehensiveProductService();
        $this->authentication = Authentication::getInstance();
        $this->authorization = Authorization::getInstance();
    }

    /**
     * Execute the product deletion action
     * This is the standard delete (soft delete) that hides from regular admins
     *
     * @param Request $request
     * @param Response $response
     * @return array Response data
     * @throws AuthenticationException
     * @throws AuthorizationException
     * @throws NotFoundException
     * @throws Exception
     */
    public function execute(Request $request, Response $response)
    {
        try {
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Check if user is authenticated
            if (!$user) {
                throw new AuthenticationException('User not authenticated');
            }
            
            // Get product ID from route parameters
            $productId = $request->getParam('id');
            
            if (!$productId) {
                throw new Exception('Product ID is required');
            }
            
            // Extract user ID safely, handling both object and array formats
            $userId = $this->getUserId($user);
            
            // For soft delete, we need to check if the product exists and is not already deleted
            $existingProduct = $this->productService->getComprehensiveProductById($productId);
            
            if (!$existingProduct) {
                throw new NotFoundException('Product not found or already deleted');
            }
            
            // Soft delete product (mark as deleted)
            $this->productService->deleteComprehensiveProduct($productId, $userId);
            
            // Return response
            return ResponseFormatter::success(
                null,
                'Product successfully moved to archive'
            );
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to delete product: ' . $e->getMessage());
        }
    }
    
    /**
     * Execute the permanent product deletion action
     * This completely removes the product from the database
     * Only accessible by super admins
     *
     * @param Request $request
     * @param Response $response
     * @return array Response data
     * @throws AuthenticationException
     * @throws AuthorizationException
     * @throws NotFoundException
     * @throws Exception
     */
    public function permanentDelete(Request $request, Response $response)
    {
        try {
            // Get authenticated user
            $user = $this->authentication->user();
            
            // Check if user is authenticated
            if (!$user) {
                throw new AuthenticationException('User not authenticated');
            }
            
            // Check if user is a super admin
            if (!$this->authorization->isSuperAdmin()) {
                throw new AuthorizationException('Only super administrators can permanently delete products');
            }
            
            // Get product ID from route parameters
            $productId = $request->getParam('id');
            
            if (!$productId) {
                throw new Exception('Product ID is required');
            }
            
            // For permanent delete, we need to check if the product exists, even if it's soft-deleted
            $existingProduct = $this->productService->getComprehensiveProductById($productId, true);
            
            if (!$existingProduct) {
                throw new NotFoundException('Product not found');
            }
            
            // Permanently delete product and all related data
            error_log("Executing permanent delete for product ID: {$productId}");
            $result = $this->productService->permanentlyDeleteComprehensiveProduct($productId);
            
            if (!$result) {
                throw new Exception('Failed to permanently delete product');
            }
            
            // Return response
            return ResponseFormatter::success(
                null,
                'Product permanently deleted successfully'
            );
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (AuthorizationException $e) {
            throw $e;
        } catch (NotFoundException $e) {
            throw $e;
        } catch (Exception $e) {
            throw new Exception('Failed to permanently delete product: ' . $e->getMessage());
        }
    }
    
    /**
     * Extract user ID safely from user data
     * 
     * @param mixed $user User data (object or array)
     * @return int User ID
     * @throws AuthenticationException If user ID cannot be determined
     */
    private function getUserId($user)
    {
        // Log user data for debugging
        error_log('User data type: ' . gettype($user));
        if (is_array($user)) {
            error_log('User array: ' . json_encode($user));
        } elseif (is_object($user)) {
            error_log('User object properties: ' . json_encode(get_object_vars($user)));
        }
        
        // Handle object format
        if (is_object($user)) {
            if (isset($user->id)) {
                return $user->id;
            }
        }
        
        // Handle array format
        if (is_array($user)) {
            if (isset($user['id'])) {
                return $user['id'];
            }
        }
        
        // If we can't determine the user ID, throw an exception
        throw new AuthenticationException('Unable to determine user ID');
    }
}
