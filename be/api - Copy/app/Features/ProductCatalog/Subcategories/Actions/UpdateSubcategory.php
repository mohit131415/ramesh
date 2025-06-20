<?php

namespace App\Features\ProductCatalog\Subcategories\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\ProductCatalog\Subcategories\Services\SubcategoryService;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthenticationException;
use App\Shared\Helpers\ResponseFormatter;
use App\Shared\Traits\ValidatesInput;
use App\Core\Security\Authentication;
use App\Core\Security\Authorization;
use Exception;

class UpdateSubcategory
{
    use ValidatesInput;
    
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
            
            // Get request data
            $data = $request->getBody();
        
            // Debug log to see what data we're receiving
            error_log("Update Subcategory - Received data: " . json_encode($data));
            
            // Remove _method parameter used for method override
            if (isset($data['_method'])) {
                unset($data['_method']);
            }
            
            // Get subcategory image file if uploaded
            $file = $request->getFile('image');
            
            // Debug log for file
            if ($file) {
                error_log("Update Subcategory - File received: " . ($file['name'] ?? 'No name'));
            } else {
                error_log("Update Subcategory - No file received");
            }
            
            // Remove empty fields to avoid overwriting with empty values
            foreach ($data as $key => $value) {
                if ($value === '' || $value === null) {
                    unset($data[$key]);
                }
            }
            
            // Update subcategory
            $subcategory = $this->subcategoryService->updateSubcategory($subcategoryId, $data, $file, $user['id'], $isSuperAdmin);
            
            // Return response
            return ResponseFormatter::success(
                $subcategory,
                'Subcategory updated successfully'
            );
        } catch (NotFoundException $e) {
            throw $e;
        } catch (ValidationException $e) {
            throw $e;
        } catch (AuthenticationException $e) {
            throw $e;
        } catch (Exception $e) {
            error_log("Update Subcategory Error: " . $e->getMessage());
            throw new Exception('Failed to update subcategory: ' . $e->getMessage());
        }
    }
}
